#!/usr/bin/env node
import {
  access,
  lstat,
  mkdir,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import process from "node:process";
import console from "node:console";
import {
  exportInvocation,
  projectRoot,
  readCompositionProps,
} from "./export.mjs";
import { inspectMotion } from "./motion-check.mjs";

const usage =
  "Usage: node scripts/generate.mjs --props scene.json --output <new-or-empty-directory> [--format png|mp4|both]";
const help = `${usage}\n\nGenerates a Scene without opening Studio. Default format: both.\nWrites scene.json, review.html, manifest.json and image.png and/or video.mp4.\nMP4 requires an opaque background. Existing nonempty directories and symlinks are rejected.\nA failed render retains partial files without a completed manifest; retry in a new directory.`;

export function parseGenerateArguments(args, { cwd = process.cwd() } = {}) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index],
      value = args[index + 1];
    if (!["--props", "--output", "--format"].includes(flag) || flag in values)
      throw new Error(`Invalid or duplicate option: ${flag}. ${usage}`);
    if (!value || !value.trim() || value.startsWith("--"))
      throw new Error(`Missing value for ${flag}. ${usage}`);
    values[flag] = value;
  }
  if (!values["--props"] || !values["--output"])
    throw new Error(`--props and --output are required. ${usage}`);
  const format = values["--format"] ?? "both";
  if (!["png", "mp4", "both"].includes(format))
    throw new Error(
      `Invalid format ${JSON.stringify(format)}. Choose png, mp4 or both.`,
    );
  return {
    propsPath: path.resolve(cwd, values["--props"]),
    outputDirectory: path.resolve(cwd, values["--output"]),
    format,
  };
}

async function inspectDestination(destination) {
  let info;
  try {
    info = await lstat(destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (info) {
    if (info.isSymbolicLink() || !info.isDirectory())
      throw new Error(
        `Output must be a real directory, not a file or symlink: ${destination}`,
      );
    if ((await readdir(destination)).length)
      throw new Error(
        `Output directory is not empty: ${destination}. Choose a new or empty directory.`,
      );
    return realpath(destination);
  }
  // Resolve an existing parent without creating anything. This also detects
  // props/destination aliases through parent symlinks such as macOS /tmp.
  let parent = path.dirname(destination);
  const missing = [path.basename(destination)];
  while (true) {
    try {
      const physical = await realpath(parent);
      if (!(await lstat(physical)).isDirectory())
        throw new Error(`Output parent is not a directory: ${parent}`);
      return path.join(physical, ...missing.reverse());
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missing.push(path.basename(parent));
      parent = path.dirname(parent);
    }
  }
}

export async function planGeneration(options, { root = projectRoot } = {}) {
  let props;
  try {
    props = await readCompositionProps("Scene", options.propsPath, root);
  } catch (error) {
    throw new Error(
      `Cannot validate Scene props at ${options.propsPath}: ${error.message}`,
    );
  }
  const formats = options.format === "both" ? ["png", "mp4"] : [options.format];
  if (formats.includes("mp4") && props.background === "transparent")
    throw new Error(
      "MP4 requires an opaque background. Choose an approved opaque color or use --format png.",
    );
  const outputDirectory = await inspectDestination(options.outputDirectory);
  const sourceProps = await realpath(options.propsPath);
  const relative = path.relative(outputDirectory, sourceProps);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  )
    throw new Error(
      "The input props must be outside the output directory. Choose a new output directory.",
    );
  const require = createRequire(path.join(root, "package.json"));
  let cliPath;
  try {
    cliPath = path.join(
      path.dirname(require.resolve("@remotion/cli/package.json")),
      "remotion-cli.js",
    );
    await access(cliPath);
  } catch {
    throw new Error(
      `The local Remotion CLI is unavailable in ${root}. Install this project's pinned dependencies before generating.`,
    );
  }
  const propsPath = path.join(outputDirectory, "scene.json");
  const outputs = formats.map((format) => ({
    format,
    name: format === "png" ? "image.png" : "video.mp4",
    path: path.join(
      outputDirectory,
      format === "png" ? "image.png" : "video.mp4",
    ),
  }));
  return {
    ...options,
    root,
    outputDirectory,
    propsPath,
    props,
    cliPath,
    outputs,
    qualityWarnings: inspectMotion(props),
  };
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export function createManifest(plan) {
  const components = [],
    assetIds = [];
  function visit(layers) {
    for (const layer of layers) {
      if (layer.type === "illustration")
        components.push({
          layerId: layer.id,
          illustrationId: layer.illustrationId,
          props: layer.props ?? {},
          ...(layer.data ? { data: layer.data } : {}),
        });
      if (layer.type === "native")
        components.push({
          layerId: layer.id,
          type: "native",
          componentId: layer.componentId,
          props: layer.props ?? {},
        });
      if (layer.type === "asset") assetIds.push(layer.assetId);
      if (layer.type === "group") visit(layer.layers);
    }
  }
  visit(plan.props.layers);
  return {
    schemaVersion: 1,
    status: "complete",
    composition: "Scene",
    format: plan.format,
    files: {
      scene: "scene.json",
      review: "review.html",
      ...Object.fromEntries(
        plan.outputs.map((output) => [output.format, output.name]),
      ),
    },
    resolvedProps: plan.props,
    components,
    assetIds: [...new Set(assetIds)],
    qualityWarnings: plan.qualityWarnings,
    facts: {
      width: plan.props.width,
      height: plan.props.height,
      fps: plan.props.fps,
      durationFrames: plan.props.durationFrames,
      durationSeconds: plan.props.durationFrames / plan.props.fps,
      posterFrame: plan.props.posterFrame ?? plan.props.durationFrames - 1,
      background: plan.props.background,
      renderer: { imageFormat: "png", concurrency: 1 },
      visualReview: "not-performed",
    },
  };
}

export function createReviewHtml(manifest) {
  const title = escapeHtml(manifest.resolvedProps.title);
  const { files, facts } = manifest;
  const image = files.png
    ? `<figure class="image"><img src="image.png" alt="${title}"><figcaption><a href="image.png" download>Download PNG</a></figcaption></figure>`
    : "";
  const video = files.mp4
    ? `<figure><video controls playsinline preload="metadata"${files.png ? ' poster="image.png"' : ""} aria-label="${title}"><source src="video.mp4" type="video/mp4"></video><figcaption><a href="video.mp4" download>Download MP4</a></figcaption></figure>`
    : "";
  const warnings = manifest.qualityWarnings.length
    ? `<h2>Motion review notes</h2><ul>${manifest.qualityWarnings.map((warning) => `<li>${escapeHtml(`${warning.code}: ${warning.message}`)}</li>`).join("")}</ul>`
    : "<p>No automated motion warnings.</p>";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<style>body{margin:40px auto;padding:0 24px;max-width:1100px;font:16px/1.5 system-ui,sans-serif;color:#1f1f47;background:#f9f9fb}h1{line-height:1.15}figure{margin:24px 0;padding:16px;background:white;border:1px solid #d5d9dd;border-radius:12px}img,video{display:block;max-width:100%;height:auto;margin:auto}figcaption{margin-top:12px}a{color:#3d459e}.image img{background:repeating-conic-gradient(#edf0f2 0% 25%,white 0% 50%) 0/20px 20px}nav{display:flex;gap:24px}</style></head>
<body><h1>${title}</h1><p>${facts.width} × ${facts.height} · ${facts.durationSeconds} seconds · ${facts.fps} fps</p>
${image}${video}<nav><a href="scene.json" download>Editable scene JSON</a><a href="manifest.json">Delivery manifest</a></nav>
${warnings}<p>Rendering completed. Visual review is still required: inspect the image and play the video, including consecutive moving frames.</p></body></html>\n`;
}

export async function generateScene(
  args,
  { root = projectRoot, cwd = process.cwd(), runner = spawnSync } = {},
) {
  const plan = await planGeneration(parseGenerateArguments(args, { cwd }), {
    root,
  });
  // Recheck immediately before writing; exclusive writes never replace an
  // existing scene, review page or manifest.
  await inspectDestination(plan.outputDirectory);
  await mkdir(plan.outputDirectory, { recursive: true });
  await writeFile(plan.propsPath, JSON.stringify(plan.props, null, 2) + "\n", {
    flag: "wx",
  });
  try {
    for (const output of plan.outputs) {
      const result = await runner(
        process.execPath,
        [
          plan.cliPath,
          ...exportInvocation({
            format: output.format,
            composition: "Scene",
            output: output.path,
            propsPath: plan.propsPath,
          }),
        ],
        { cwd: root, stdio: "inherit", shell: false },
      );
      if (result.error)
        throw new Error(
          `${output.format} renderer could not start: ${result.error.message}`,
        );
      if (result.status !== 0)
        throw new Error(
          `${output.format} renderer failed (${result.signal ? `signal ${result.signal}` : `exit ${result.status ?? "unknown"}`}).`,
        );
      const file = await lstat(output.path).catch(() => null);
      if (!file?.isFile() || file.isSymbolicLink() || file.size === 0)
        throw new Error(
          `${output.format} renderer did not produce a nonempty regular file: ${output.path}`,
        );
    }
    const manifest = createManifest(plan);
    await writeFile(
      path.join(plan.outputDirectory, "review.html"),
      createReviewHtml(manifest),
      { flag: "wx" },
    );
    // This is the success marker, written only after every requested artifact.
    await writeFile(
      path.join(plan.outputDirectory, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      { flag: "wx" },
    );
    return { outputDirectory: plan.outputDirectory, manifest };
  } catch (error) {
    throw new Error(
      `Generation failed: ${error.message} Partial files are retained in ${plan.outputDirectory}; no completed manifest was written. Fix the cause and retry in a new or empty directory.`,
    );
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(help);
    return 0;
  }
  const result = await generateScene(args);
  console.log(
    `Generated ${result.manifest.format} in ${result.outputDirectory}\nReview: ${path.join(result.outputDirectory, "review.html")}\nManifest: ${path.join(result.outputDirectory, "manifest.json")}`,
  );
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
