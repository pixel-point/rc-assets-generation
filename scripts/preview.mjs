#!/usr/bin/env node
import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import console from "node:console";
import {
  assertComposition,
  defaultPropsPath,
  projectRoot,
  readCompositionProps,
} from "./export.mjs";

const require = createRequire(import.meta.url);

/** Consume the kit's options while forwarding ordinary Studio flags unchanged. */
export function parsePreviewArguments(
  args,
  { root = projectRoot, cwd = process.cwd() } = {},
) {
  const forwarded = [];
  let composition;
  let propsPath;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    const flag = arg.split("=", 1)[0];
    if (flag !== "--composition" && flag !== "--props") {
      forwarded.push(arg);
      continue;
    }
    const value = arg.includes("=")
      ? arg.slice(arg.indexOf("=") + 1)
      : args[++index];
    if (
      !value ||
      value.startsWith("--") ||
      (flag === "--composition"
        ? composition !== undefined
        : propsPath !== undefined)
    ) {
      throw new Error(
        `Invalid or duplicate option: ${flag}. Use --composition Scene|Benchmarks and --props file.json.`,
      );
    }
    if (flag === "--composition") composition = assertComposition(value);
    else propsPath = resolve(cwd, value);
  }
  if (!composition && !propsPath) {
    return {
      composition: "Library",
      propsPath: null,
      args: ["studio", "src/index.ts", ...forwarded],
    };
  }
  composition ??= "Benchmarks";
  propsPath ??= defaultPropsPath(composition, root);
  return {
    composition,
    propsPath,
    args: ["studio", "src/index.ts", ...forwarded, `--props=${propsPath}`],
  };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === "--help") {
    console.log(
      "Usage: npm run preview -- [--composition Scene|Benchmarks] [--props file.json] [Studio flags]",
    );
    return;
  }
  const options = parsePreviewArguments(args);
  if (options.propsPath)
    await readCompositionProps(options.composition, options.propsPath);
  console.log(
    options.propsPath
      ? `Preview ${options.composition} with ${options.propsPath}. Select ${options.composition} in Studio.`
      : "Preview the artwork library and scene examples in Studio.",
  );
  const cli = resolve(
    dirname(require.resolve("@remotion/cli/package.json")),
    "remotion-cli.js",
  );
  const child = spawn(process.execPath, [cli, ...options.args], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
  });
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
