#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import console from "node:console";

const contexts = ["marketing", "ui"];
const usage =
  "Usage: node scripts/motion-check.mjs [--props file.json] [--context marketing|ui] [--json]";

/** Advisory review of a validated scene. This never changes the artwork or timing. */
export function inspectMotion(scene, { context = "marketing" } = {}) {
  if (!contexts.includes(context))
    throw new Error("Motion context must be marketing or ui.");

  const findings = [];
  const floatingLayers = [];
  const entranceLimit = context === "ui" ? 12 : 45;
  const warning = (code, layer, path, message, details = {}) => {
    findings.push({
      severity: "warning",
      code,
      layerId: layer.id,
      path,
      message,
      ...details,
    });
  };
  const display = (value) => Number(value.toFixed(2));

  function visit(layers, parentPath, parentScale, inheritedFloat) {
    layers.forEach((layer, index) => {
      const path = `${parentPath}[${index}]`;
      const motionSets = [
        { tracks: layer.internalMotion, motionPath: `${path}.internalMotion` },
        ...Object.entries(layer.type === "illustration" ? (layer.data ?? {}) : {}).map(
          ([slotId, entry]) => ({
            tracks: entry.internalMotion,
            motionPath: `${path}.data[${JSON.stringify(slotId)}].internalMotion`,
          }),
        ),
      ];
      for (const { tracks, motionPath } of motionSets) {
        if (!tracks?.length) continue;
        const targets = new Map();
        const focalTargets = new Set();
        tracks.forEach((track, trackIndex) => {
          // Numerical point tracks update one coherent chart series.
          const focalTarget = track.property === "value" && track.target.startsWith("point:")
            ? `series:${track.target.split(":")[1]}` : track.target;
          focalTargets.add(focalTarget);
          let target = targets.get(track.target);
          if (!target) {
            target = { firstTranslateIndex: undefined, spanX: 0, spanY: 0 };
            targets.set(track.target, target);
          }
          const values = track.keyframes.map((point) => point.value);
          const min = Math.min(...values),
            max = Math.max(...values);
          if (
            track.property === "translateX" ||
            track.property === "translateY"
          ) {
            target.firstTranslateIndex ??= trackIndex;
            target[track.property === "translateX" ? "spanX" : "spanY"] =
              max - min;
          }
          if (track.property === "scale" && (min < 0.85 || max > 1.15))
            warning(
              "internal-scale-excursion",
              layer,
              `${motionPath}[${trackIndex}].keyframes`,
              `Internal target ${track.target} scales from ${display(min)} to ${display(max)}. Consider keeping subtle motion within 0.85–1.15.`,
              {
                target: track.target,
                min,
                max,
                lowerLimit: 0.85,
                upperLimit: 1.15,
              },
            );
        });
        // Internal translations are inside this component's scale, unlike
        // an entrance applied to its outer scene-layer transform.
        const scale = parentScale * (layer.scale ?? 1);
        for (const [selector, target] of targets) {
          const span = Math.hypot(target.spanX, target.spanY) * scale;
          if (span > 100)
            warning(
              "internal-excessive-travel",
              layer,
              `${motionPath}[${target.firstTranslateIndex}]`,
              `Internal target ${selector} has a translation range spanning ${display(span)} canvas pixels. Consider 100px or less.`,
              { target: selector, value: span, limit: 100 },
            );
        }
        if (focalTargets.size > 6)
          warning(
            "too-many-internal-targets",
            layer,
            motionPath,
            `${focalTargets.size} distinct internal focal selectors are animated in one component. Consider at most six focal targets or a shared native container.`,
            { targets: [...focalTargets], value: focalTargets.size, limit: 6 },
          );
      }
      const entrance = layer.enter;
      if (entrance) {
        if (entrance.type === "scale" && (entrance.from ?? 0.95) < 0.85) {
          warning(
            "scale-from-too-small",
            layer,
            `${path}.enter.from`,
            "The scale entrance starts below 0.85. Try a subtle starting scale around 0.95.",
            { value: entrance.from, limit: 0.85 },
          );
        }
        if (entrance.type === "slide") {
          const travel =
            Math.hypot(entrance.x ?? 0, entrance.y ?? 24) * parentScale;
          if (travel > 100)
            warning(
              "excessive-travel",
              layer,
              `${path}.enter`,
              `The entrance travels ${display(travel)} canvas pixels. Consider a shorter move (100px or less).`,
              { value: travel, limit: 100 },
            );
        }
        const duration = entrance.durationFrames ?? 18;
        if (duration > entranceLimit)
          warning(
            "long-entrance",
            layer,
            `${path}.enter.durationFrames`,
            `The ${duration}-frame entrance exceeds the ${entranceLimit}-frame ${context} guideline at 30fps.`,
            { value: duration, limit: entranceLimit },
          );
      }

      const float = layer.float;
      const amplitude = float
        ? Math.hypot(float.amplitudeX ?? 0, float.amplitudeY ?? 4) * parentScale
        : 0;
      const hasFloat = amplitude > 0;
      if (hasFloat) {
        floatingLayers.push(layer.id);
        const period = float.periodFrames ?? 180;
        if (period < 60)
          warning(
            "rapid-float",
            layer,
            `${path}.float.periodFrames`,
            `The float repeats every ${period} frames. Use at least 60 frames for a calmer loop.`,
            { value: period, limit: 60 },
          );
        if (amplitude > 12)
          warning(
            "large-float-amplitude",
            layer,
            `${path}.float`,
            `The float moves ${display(amplitude)} canvas pixels from its resting position. Keep the amplitude within 12px.`,
            { value: amplitude, limit: 12 },
          );
      }
      const floatSource = hasFloat ? layer.id : inheritedFloat;
      if (layer.type === "text" && floatSource)
        warning(
          "floating-text",
          layer,
          path,
          floatSource === layer.id
            ? "Text floats continuously. Keep reading copy still."
            : `Text inherits continuous float motion from ${floatSource}. Keep reading copy still.`,
          { motionLayerId: floatSource },
        );
      if (layer.type === "group")
        visit(
          layer.layers,
          `${path}.layers`,
          parentScale * (layer.scale ?? 1),
          floatSource,
        );
    });
  }

  visit(scene.layers, "layers", 1, undefined);
  if (floatingLayers.length > 3)
    findings.push({
      severity: "warning",
      code: "too-many-independent-floats",
      path: "layers",
      layerIds: floatingLayers,
      value: floatingLayers.length,
      limit: 3,
      message: `${floatingLayers.length} layers define independent float loops. Consider one shared group motion or at most three focal loops.`,
    });
  return findings;
}

function parseArguments(args) {
  const options = { context: "marketing", json: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!["--props", "--context", "--json"].includes(flag) || seen.has(flag))
      throw new Error(`Invalid or duplicate option: ${flag}. ${usage}`);
    seen.add(flag);
    if (flag === "--json") {
      options.json = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${flag}. ${usage}`);
    if (flag === "--context") {
      if (!contexts.includes(value))
        throw new Error("Motion context must be marketing or ui.");
      options.context = value;
    } else options.propsPath = resolve(process.cwd(), value);
  }
  return options;
}

export async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
    return 0;
  }
  const options = parseArguments(args);
  // Pure helper imports do not need project files or rendering dependencies.
  const { defaultPropsPath, readCompositionProps } =
    await import("./export.mjs");
  const propsPath = options.propsPath ?? defaultPropsPath("Scene");
  const scene = await readCompositionProps("Scene", propsPath);
  const findings = inspectMotion(scene, options);
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          propsPath,
          context: options.context,
          warningCount: findings.length,
          findings,
        },
        null,
        2,
      ),
    );
  } else if (findings.length) {
    console.log(
      `${findings.length} advisory motion warnings (${options.context}):`,
    );
    for (const finding of findings)
      console.log(`- ${finding.code} at ${finding.path}: ${finding.message}`);
  } else console.log(`No motion warnings (${options.context}).`);
  // Style advice never prevents rendering a valid scene.
  return 0;
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
