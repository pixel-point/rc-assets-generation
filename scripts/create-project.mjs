#!/usr/bin/env node

import { spawn } from "node:child_process";
import console from "node:console";
import { constants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const requiredEntries = [
  "src",
  "public",
  "examples",
  "catalog",
  "README.md",
  "AGENTS.md",
  "THIRD_PARTY_NOTICES.md",
  "remotion.config.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  ".prettierrc",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "scripts/export.mjs",
  "scripts/generate.mjs",
  "scripts/preview.mjs",
  "scripts/catalog.mjs",
  "scripts/motion-check.mjs",
  "scripts/build-gallery.mjs",
  "scripts/gallery",
];
const optionalGuides = ["PLUGIN.md", "INSTALL.md", "CLOUD.md", "VALIDATION.md"];
const privateReports = new Set([
  "catalog/source-inventory.json",
  "catalog/pending-imports.json",
  "catalog/selected-transfer-report.json",
  "catalog/redrawing-inventory.json",
  "catalog/implementation-audit.json",
  "catalog/native-backlog.md",
  "src/figma/import-report.json",
]);
const excludedNames = new Set([
  "node_modules",
  "out",
  "dist",
  ".git",
  ".codex-plugin",
  ".claude-plugin",
  ".DS_Store",
]);
const usage =
  "Usage: node scripts/create-project.mjs /absolute/output [--install]";

export function assertSupportedNode(version = process.versions.node) {
  const major = Number(version.split(".")[0]);
  if (!Number.isInteger(major) || major < 22) {
    throw new Error(
      `Node.js 22 or newer is required; found ${version}. Use a supported Node.js runtime and retry. No system runtime is installed or changed by this script.`,
    );
  }
}

export function parseArguments(args) {
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    return { help: true };
  }
  if (
    args.length < 1 ||
    args.length > 2 ||
    !path.isAbsolute(args[0]) ||
    (args.length === 2 && args[1] !== "--install")
  ) {
    throw new Error(usage);
  }
  return {
    destination: path.resolve(args[0]),
    install: args[1] === "--install",
  };
}

async function statIfPresent(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function canonicalDestination(destination) {
  let existing = destination;
  const missingSegments = [];
  while (!(await statIfPresent(existing))) {
    missingSegments.unshift(path.basename(existing));
    existing = path.dirname(existing);
  }
  return path.join(await realpath(existing), ...missingSegments);
}

async function assertEmptyDestination(destination) {
  const stats = await statIfPresent(destination);
  if (!stats) return;
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(
      `Destination must be a new or empty directory, not a file or symlink: ${destination}`,
    );
  }
  if ((await readdir(destination)).length > 0) {
    throw new Error(
      `Destination is not empty; its contents were left untouched: ${destination}`,
    );
  }
}

async function collectEntries(root, relativePath, entries) {
  if (privateReports.has(relativePath.split(path.sep).join("/"))) return;
  const source = path.join(root, relativePath);
  const stats = await statIfPresent(source);
  if (!stats)
    throw new Error(`Runtime bundle is incomplete: missing ${relativePath}`);
  if (
    ["src", "public", "examples", "catalog"].includes(relativePath) &&
    !stats.isDirectory()
  ) {
    throw new Error(
      `Runtime bundle must contain a directory at ${relativePath}`,
    );
  }
  if (stats.isSymbolicLink()) {
    throw new Error(
      `Runtime bundle must contain local files, not symlinks: ${relativePath}`,
    );
  }
  if (stats.isDirectory()) {
    entries.push({ relativePath, directory: true });
    for (const name of (await readdir(source)).sort()) {
      if (!excludedNames.has(name)) {
        await collectEntries(root, path.join(relativePath, name), entries);
      }
    }
    return;
  }
  if (!stats.isFile())
    throw new Error(`Unsupported runtime asset: ${relativePath}`);
  entries.push({ relativePath, directory: false });
}

async function findNpmCli() {
  const executableDirectory = path.dirname(process.execPath);
  const candidates = [
    process.env.npm_execpath,
    path.join(executableDirectory, "node_modules/npm/bin/npm-cli.js"),
    path.resolve(executableDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
    ...(process.env.PATH ?? "")
      .split(path.delimiter)
      .filter(Boolean)
      .map((directory) => path.join(directory, "npm")),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const resolved = await realpath(candidate);
      if (
        path.basename(resolved) === "npm-cli.js" &&
        (await lstat(resolved)).isFile()
      ) {
        return resolved;
      }
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }
  throw new Error(
    "npm was not found. Use a Node.js 22+ installation that includes npm, or omit --install to create the source project only.",
  );
}

function runNodeScript(script, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd,
      stdio: "inherit",
      shell: false,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${path.basename(script)} failed (${signal ?? `exit ${code}`}).`,
          ),
        );
    });
  });
}

export async function createProject({
  destination,
  install = false,
  root = sourceRoot,
}) {
  assertSupportedNode();
  if (!destination || !path.isAbsolute(destination)) throw new Error(usage);
  destination = path.resolve(destination);
  await assertEmptyDestination(destination);

  const canonicalRoot = await realpath(root);
  const canonicalOutput = await canonicalDestination(destination);
  const relativeOutput = path.relative(canonicalRoot, canonicalOutput);
  if (
    relativeOutput === "" ||
    (!relativeOutput.startsWith(`..${path.sep}`) &&
      relativeOutput !== ".." &&
      !path.isAbsolute(relativeOutput))
  ) {
    throw new Error(
      "Choose an output directory outside the installed plugin/runtime bundle.",
    );
  }

  const entries = [];
  for (const entry of requiredEntries)
    await collectEntries(canonicalRoot, entry, entries);
  for (const entry of optionalGuides)
    if (await statIfPresent(path.join(canonicalRoot, entry)))
      await collectEntries(canonicalRoot, entry, entries);
  // Publisher guidance can contain private acquisition/QA evidence. Public
  // templates override only the copied documents, never the publisher files.
  const releaseDocs = await statIfPresent(
    path.join(canonicalRoot, "release-docs"),
  );
  if (
    releaseDocs &&
    (!releaseDocs.isDirectory() || releaseDocs.isSymbolicLink())
  )
    throw new Error("Release document templates must use a local directory.");
  for (const guide of ["AGENTS.md", "VALIDATION.md"]) {
    const relative = path.join("release-docs", guide);
    const template = await statIfPresent(path.join(canonicalRoot, relative));
    if (!template) continue;
    if (!template.isFile() || template.isSymbolicLink())
      throw new Error(
        `Release document template must be a local file: ${relative}`,
      );
    const entry = entries.find((item) => item.relativePath === guide);
    if (entry) entry.sourceRelativePath = relative;
    else
      entries.push({
        relativePath: guide,
        sourceRelativePath: relative,
        directory: false,
      });
  }
  // Fail before touching the output if the distributable manifests are malformed.
  const packageText = await readFile(
    path.join(canonicalRoot, "package.json"),
    "utf8",
  );
  const runtimePackage = JSON.parse(packageText);
  const hasPublisherTests = Object.hasOwn(runtimePackage.scripts ?? {}, "test");
  if (hasPublisherTests) delete runtimePackage.scripts.test;
  const hasImporter = Object.hasOwn(
    runtimePackage.scripts ?? {},
    "import:designs",
  );
  if (hasImporter) delete runtimePackage.scripts["import:designs"];
  const hasCatalogBuilder = Object.hasOwn(
    runtimePackage.scripts ?? {},
    "catalog:build",
  );
  if (hasCatalogBuilder) delete runtimePackage.scripts["catalog:build"];
  const hasPackager = Object.hasOwn(
    runtimePackage.scripts ?? {},
    "package:plugin",
  );
  if (hasPackager) delete runtimePackage.scripts["package:plugin"];
  JSON.parse(
    await readFile(path.join(canonicalRoot, "package-lock.json"), "utf8"),
  );
  const npmCli = install ? await findNpmCli() : null;

  await mkdir(path.dirname(destination), { recursive: true });
  const staging = await mkdtemp(
    path.join(path.dirname(destination), ".revenuecat-assets-"),
  );
  try {
    for (const entry of entries) {
      const target = path.join(staging, entry.relativePath);
      if (entry.directory) {
        await mkdir(target, { recursive: true });
      } else {
        await mkdir(path.dirname(target), { recursive: true });
        if (
          entry.relativePath === "package.json" &&
          (hasPublisherTests || hasImporter || hasCatalogBuilder || hasPackager)
        ) {
          await writeFile(
            target,
            `${JSON.stringify(runtimePackage, null, 2)}\n`,
            { flag: "wx" },
          );
        } else {
          await copyFile(
            path.join(
              canonicalRoot,
              entry.sourceRelativePath ?? entry.relativePath,
            ),
            target,
            constants.COPYFILE_EXCL,
          );
        }
      }
    }
    // rename cannot replace a non-empty destination directory, including one filled
    // by another process during the copy. Never delete an existing destination.
    await assertEmptyDestination(destination);
    await rename(staging, destination);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }

  if (install) {
    try {
      await runNodeScript(npmCli, ["ci"], destination);
      const remotionCli = path.join(
        destination,
        "node_modules/@remotion/cli/remotion-cli.js",
      );
      if (!(await statIfPresent(remotionCli))?.isFile()) {
        throw new Error(
          "Installed @remotion/cli is missing its local command entry point.",
        );
      }
      await runNodeScript(remotionCli, ["browser", "ensure"], destination);
    } catch (error) {
      throw new Error(
        `The source project was created at ${destination}, but dependency/browser setup failed: ${error.message} The project has been preserved; retry npm ci and npx remotion browser ensure from that directory.`,
        { cause: error },
      );
    }
  }
  return destination;
}

if (
  process.argv[1] &&
  (await realpath(path.resolve(process.argv[1])).catch(() => null)) ===
    fileURLToPath(import.meta.url)
) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      console.log(usage);
    } else {
      const created = await createProject(options);
      console.log(`Created self-contained RevenueCat project: ${created}`);
      console.log(
        options.install
          ? "Dependencies and rendering browser are ready."
          : "Run npm ci in that directory to install the pinned dependencies.",
      );
    }
  } catch (error) {
    console.error(`Cannot create project: ${error.message}`);
    process.exitCode = 1;
  }
}
