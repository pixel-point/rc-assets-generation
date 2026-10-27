#!/usr/bin/env node
import { readFile, mkdir, realpath, stat } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { spawnSync } from "node:child_process";
import process from "node:process";
import console from "node:console";
import { inspectMotion } from "./motion-check.mjs";
import { createSceneSchema } from "../src/composition/schema.mjs";
import { createEmbeddedRegistry } from "../src/embedded/runtime.mjs";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const usage =
  "Usage: node scripts/export.mjs png|mp4 [--composition Scene|Benchmarks] [--props file.json] [--output path]";

export function assertComposition(composition) {
  if (!["Scene", "Benchmarks"].includes(composition)) {
    throw new Error("Composition must be Scene or Benchmarks.");
  }
  return composition;
}

export function defaultPropsPath(composition, root = projectRoot) {
  return resolve(
    root,
    `examples/${composition === "Scene" ? "scene" : "benchmarks"}.json`,
  );
}

export function parseExportArguments(
  args,
  { root = projectRoot, cwd = process.cwd() } = {},
) {
  const [format, ...options] = args;
  if (!["png", "mp4"].includes(format)) throw new Error(usage);
  const parsed = {};
  for (let index = 0; index < options.length; index += 2) {
    const flag = options[index];
    const value = options[index + 1];
    if (
      !["--composition", "--props", "--output"].includes(flag) ||
      !value ||
      value.startsWith("--") ||
      flag in parsed
    ) {
      throw new Error(`Invalid or duplicate option: ${flag}. ${usage}`);
    }
    parsed[flag] = value;
  }
  const composition = assertComposition(
    parsed["--composition"] ?? "Benchmarks",
  );
  const output = parsed["--output"]
    ? resolve(cwd, parsed["--output"])
    : resolve(root, `out/${composition.toLowerCase()}.${format}`);
  if (extname(output).toLowerCase() !== `.${format}`)
    throw new Error(`Output must end in .${format}`);
  return {
    format,
    composition,
    output,
    propsPath: parsed["--props"]
      ? resolve(cwd, parsed["--props"])
      : defaultPropsPath(composition, root),
  };
}

export async function assertImageSlotFiles(scene, contracts, root) {
  const sources = new Set();
  function visit(layers) {
    for (const layer of layers) {
      if (layer.type === "group") visit(layer.layers);
      if (layer.type !== "illustration") continue;
      const fields = contracts.components[layer.illustrationId]?.fields;
      for (const [key, value] of Object.entries(layer.props ?? {}))
        if (fields?.[key]?.type === "image" && value) sources.add(value);
    }
  }
  visit(scene.layers);
  if (!sources.size) return;
  const publicDirectory = await realpath(resolve(root, "public"));
  for (const src of sources) {
    const filename = await realpath(resolve(publicDirectory, src)).catch(() => {
      throw new Error(`Image slot file is missing: public/${src}`);
    });
    const localPath = relative(publicDirectory, filename);
    if (
      localPath === ".." ||
      localPath.startsWith("../") ||
      isAbsolute(localPath) ||
      !(await stat(filename)).isFile()
    )
      throw new Error(
        `Image slot must reference a file inside public/: ${src}`,
      );
  }
}

export async function readCompositionProps(
  composition,
  propsPath,
  root = projectRoot,
) {
  assertComposition(composition);
  const props = JSON.parse(await readFile(propsPath, "utf8"));
  if (!props || Array.isArray(props) || typeof props !== "object") {
    throw new Error("The props file must contain a JSON object.");
  }
  if (composition === "Benchmarks" && "layers" in props) {
    throw new Error(
      "This props file defines a Scene. Add --composition Scene to preview or export it.",
    );
  }
  if (composition === "Scene") {
    const catalog = JSON.parse(
      await readFile(resolve(root, "src/library/assets.json"), "utf8"),
    );
    const illustrations = JSON.parse(
      await readFile(resolve(root, "src/figma/illustrations.json"), "utf8"),
    );
    const figmaAssets = JSON.parse(
      await readFile(resolve(root, "src/figma/assets.json"), "utf8"),
    );
    const contracts = JSON.parse(
      await readFile(
        resolve(root, "src/figma/component-contracts.json"),
        "utf8",
      ),
    );
    const nativeCatalog = (
      await Promise.all(
        ["table-presets.json", "chart-presets.json"].map(async (filename) => {
          try {
            return JSON.parse(
              await readFile(resolve(root, "src/native", filename), "utf8"),
            );
          } catch (error) {
            if (error.code === "ENOENT") return [];
            throw error;
          }
        }),
      )
    ).flat();
    const embeddedFiles = await Promise.all([
      "src/embedded/table-definitions.json", "src/embedded/chart-definitions.json",
      "src/figma/assemblies.json",
    ].map(async filename => {
      try { return JSON.parse(await readFile(resolve(root, filename), "utf8")); }
      catch (error) { if (error.code === "ENOENT") return []; throw error; }
    }));
    const embeddedRegistry = createEmbeddedRegistry(...embeddedFiles, illustrations);
    const scene = createSceneSchema(
      [...catalog, ...figmaAssets],
      illustrations,
      contracts,
      nativeCatalog,
      embeddedRegistry,
    ).parse(props);
    await assertImageSlotFiles(scene, contracts, root);
    return scene;
  }
  return props;
}

export function exportInvocation({ format, composition, output, propsPath }) {
  const command =
    format === "png"
      ? [
          "still",
          "src/index.ts",
          `${composition}Still`,
          output,
          "--image-format=png",
        ]
      : [
          "render",
          "src/index.ts",
          composition,
          output,
          "--codec=h264",
          "--pixel-format=yuv420p",
          "--crf=18",
          "--image-format=png",
        ];
  return [
    ...command,
    `--props=${propsPath}`,
    `--scale=${composition === "Scene" ? 1 : 2}`,
    // Reuse one text raster cache; parallel pages can introduce alternating pixel offsets.
    "--concurrency=1",
    "--log=error",
  ];
}

export async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
    return 0;
  }
  const options = parseExportArguments(args);
  const props = await readCompositionProps(
    options.composition,
    options.propsPath,
  );
  if (options.format === "mp4" && props.background === "transparent") {
    throw new Error(
      "MP4 does not preserve transparency. Choose an opaque background, or export a PNG.",
    );
  }
  if (options.composition === "Scene") {
    for (const finding of inspectMotion(props)) {
      console.warn(
        `Motion warning (${finding.code}) at ${finding.path}: ${finding.message}`,
      );
    }
  }
  await mkdir(dirname(options.output), { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      resolve(
        dirname(require.resolve("@remotion/cli/package.json")),
        "remotion-cli.js",
      ),
      ...exportInvocation(options),
    ],
    { cwd: projectRoot, stdio: "inherit", shell: false },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) return result.status ?? 1;
  console.log(`Exported ${options.output}`);
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
