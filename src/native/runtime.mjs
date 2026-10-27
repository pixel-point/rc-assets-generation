import {
  internalTrackValueAtFrame,
  resolveMotionTarget,
} from "../composition/internal-motion.mjs";
import { getNativeContract, validateNativeMotion } from "./schema.mjs";

/** Per-instance numerical state: a seek never depends on previously rendered frames. */
export function createNativeMotion(contract, tracks, frame) {
  if (!Number.isFinite(frame))
    throw new Error("Native motion frame must be finite.");
  const states = new Map(),
    ranges = new Map();
  for (const track of tracks) {
    const target = resolveMotionTarget(contract, track.target).nodeId;
    let state = states.get(target);
    if (!state) states.set(target, (state = {}));
    state[track.property] = internalTrackValueAtFrame(track, frame);
    if (track.property === "value") {
      const values = track.keyframes.map((point) => point.value);
      ranges.set(target, [Math.min(...values), Math.max(...values)]);
    }
  }
  function known(target) {
    if (!Object.hasOwn(contract.motionTargets, target))
      throw new Error(
        `Renderer referenced undeclared native target ${target}.`,
      );
    return states.get(target) || {};
  }
  return Object.freeze({
    style(target, base = {}) {
      const state = known(target),
        out = { ...base };
      if (state.opacity !== undefined)
        out.opacity =
          (typeof base.opacity === "number" ? base.opacity : 1) * state.opacity;
      const transforms = [];
      if (state.translateX !== undefined || state.translateY !== undefined)
        transforms.push(
          `translate3d(${state.translateX ?? 0}px, ${state.translateY ?? 0}px, 0)`,
        );
      if (state.rotate !== undefined)
        transforms.push(`rotate(${state.rotate}deg)`);
      if (state.scale !== undefined) transforms.push(`scale(${state.scale})`);
      if (transforms.length) {
        out.transform = [...transforms, base.transform]
          .filter(Boolean)
          .join(" ");
        out.transformOrigin = base.transformOrigin ?? "center";
      }
      return out;
    },
    value(target, fallback) {
      return known(target).value ?? fallback;
    },
    draw(target) {
      return known(target).draw ?? 1;
    },
    progress(target) {
      return known(target).progress ?? 1;
    },
    valueRange(target, fallback) {
      known(target);
      const range = ranges.get(target);
      return range
        ? [Math.min(fallback, range[0]), Math.max(fallback, range[1])]
        : [fallback, fallback];
    },
  });
}
export function resolveNativeInstance(
  definition,
  input = {},
  internalMotion = [],
  frame = 0,
  durationFrames = 1800,
) {
  const contract = getNativeContract(definition, input),
    tracks = validateNativeMotion(
      definition,
      input,
      internalMotion,
      durationFrames,
    );
  return {
    definition,
    data: contract.defaults,
    contract,
    tracks,
    motion: createNativeMotion(contract, tracks, frame),
  };
}
