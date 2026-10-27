import { z } from "zod";

const easing = z.enum(["linear", "ease-out", "ease-in-out"]);
const trackSchema = z.strictObject({
  target: z.string().min(1).max(1000),
  property: z.enum([
    "translateX",
    "translateY",
    "rotate",
    "scale",
    "opacity",
    "revealX",
    "revealY",
    "counter",
    "draw",
    "progress",
    "value",
  ]),
  keyframes: z
    .array(
      z.strictObject({
        frame: z.number().int().min(0).max(1799),
        value: z.number().finite(),
        // The easing on the destination keyframe controls its incoming segment.
        easing: easing.optional(),
      }),
    )
    .min(2)
    .max(100),
  easing: easing.default("ease-out"),
  format: z
    .strictObject({
      decimals: z.number().int().min(0).max(6).default(0),
      prefix: z.string().max(32).default(""),
      suffix: z.string().max(32).default(""),
    })
    .optional(),
});

export const internalMotionSchema = z.array(trackSchema).max(100);

export function resolveMotionTarget(contract, selector) {
  const targets = contract?.motionTargets ?? {};
  if (Object.hasOwn(targets, selector)) return targets[selector];
  const matches = Object.values(targets).filter((target) =>
    target.aliases?.includes(selector),
  );
  if (matches.length !== 1)
    throw new Error(
      `Unknown or ambiguous internal motion target ${JSON.stringify(selector)}. Inspect the exact component with catalog --describe.`,
    );
  return matches[0];
}

/** Shared Node/browser preflight, including alias collisions and local timeline bounds. */
export function validateInternalMotion(
  contracts,
  componentId,
  input = [],
  durationFrames = 1800,
  props = {},
) {
  const tracks = internalMotionSchema.parse(input);
  if (!tracks.length) return tracks;
  if (
    !Number.isInteger(durationFrames) ||
    durationFrames < 1 ||
    durationFrames > 1800
  )
    throw new Error(
      "Internal motion durationFrames must be an integer from 1 to 1800.",
    );
  const contract = Object.hasOwn(contracts?.components ?? {}, componentId)
    ? contracts.components[componentId]
    : undefined;
  if (!contract) throw new Error(`No motion contract for ${componentId}.`);
  const assigned = new Set();
  const ranges = {
    translateX: [-7680, 7680],
    translateY: [-7680, 7680],
    rotate: [-3600, 3600],
    scale: [0.01, 16],
    opacity: [0, 1],
    revealX: [0, 1],
    revealY: [0, 1],
    counter: [-1e12, 1e12],
    draw: [0, 1],
    progress: [0, 1],
    value: [-1e12, 1e12],
  };
  for (const track of tracks) {
    const target = resolveMotionTarget(contract, track.target);
    if (!target.properties.includes(track.property))
      throw new Error(
        `${componentId}.${track.target} does not support ${track.property}. Supported: ${target.properties.join(", ")}.`,
      );
    const identity = JSON.stringify([
      target.componentId,
      target.nodeId,
      track.property,
    ]);
    if (assigned.has(identity))
      throw new Error(
        `Duplicate internal motion for ${track.target}.${track.property}; aliases cannot animate the same property twice.`,
      );
    assigned.add(identity);
    if (track.format && track.property !== "counter")
      throw new Error("format is supported only on counter tracks.");
    if (track.keyframes[0].easing !== undefined)
      throw new Error(
        "The first keyframe has no incoming segment; put easing on the track or a later keyframe.",
      );
    let previous = -1;
    for (const point of track.keyframes) {
      if (point.frame <= previous || point.frame >= durationFrames)
        throw new Error(
          `Keyframes for ${track.target}.${track.property} must strictly increase and fit within the illustration layer duration (${durationFrames} frames).`,
        );
      previous = point.frame;
      const [min, max] = ranges[track.property];
      if (point.value < min || point.value > max)
        throw new Error(
          `${track.property} values must be between ${min} and ${max}.`,
        );
    }
    if (track.property === "counter") {
      for (const key of Object.keys(props)) {
        const field = contract.fields[key];
        if (
          field?.type === "text" &&
          field.targets.some(
            (binding) =>
              binding.componentId === target.componentId &&
              binding.nodeId === target.nodeId,
          )
        )
          throw new Error(
            `Counter ${track.target} conflicts with text prop ${key}. Choose one text source for this instance.`,
          );
      }
    }
  }
  return tracks;
}

function ease(progress, name) {
  if (name === "linear") return progress;
  if (name === "ease-in-out")
    return progress < 0.5
      ? 4 * progress ** 3
      : 1 - (-2 * progress + 2) ** 3 / 2;
  return 1 - (1 - progress) ** 3;
}

/** No accumulated state: seeking and out-of-order frame rendering are identical. */
export function internalTrackValueAtFrame(track, frame) {
  const points = track.keyframes;
  if (frame <= points[0].frame) return points[0].value;
  for (let index = 1; index < points.length; index++) {
    const to = points[index];
    if (frame <= to.frame) {
      const from = points[index - 1];
      const progress = ease(
        (frame - from.frame) / (to.frame - from.frame),
        to.easing ?? track.easing ?? "ease-out",
      );
      return from.value + (to.value - from.value) * progress;
    }
  }
  return points.at(-1).value;
}

/** Bind only this illustration instance; no module/global mutable state. */
export function createInternalMotionBindings(
  contracts,
  componentId,
  tracks,
  frame,
) {
  if (!Number.isFinite(frame))
    throw new Error("Internal motion frame must be finite.");
  const bindings = new Map();
  const contract = contracts.components[componentId];
  for (const track of tracks) {
    const target = resolveMotionTarget(contract, track.target);
    let component = bindings.get(target.componentId);
    if (!component) bindings.set(target.componentId, (component = new Map()));
    let node = component.get(target.nodeId);
    if (!node) component.set(target.nodeId, (node = {}));
    const value = internalTrackValueAtFrame(track, frame);
    node[track.property] =
      track.property === "counter"
        ? `${track.format?.prefix ?? ""}${value.toFixed(track.format?.decimals ?? 0)}${track.format?.suffix ?? ""}`
        : value;
  }
  return bindings;
}
