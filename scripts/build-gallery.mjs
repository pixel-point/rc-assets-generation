#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { fileURLToPath } from "node:url";
import { countRoles } from "./gallery/model.mjs";
import { historicalBanner, renderPage, shellQuote } from "./gallery/page.mjs";
import {
  nativeAlternativesFor,
  nativeMetadata,
  readNativeDefinitions,
} from "./gallery/native.mjs";

import { readEmbeddedCatalog, embeddedMetadata } from "./gallery/embedded.mjs";

const scriptRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const usage = `Usage: npm run gallery -- [--refresh-previews]\n\nBuild out/library/index.html from the complete local runtime catalog.\nReuses rendered PNGs in out/catalog-thumbnails, earlier out galleries, or the\nportable public/library-previews cache. Missing or stale previews stay explicit.\n--refresh-previews confirms that discovered out PNGs match the current source,\nincluding unchanged pixels after a source change. It does not render artwork.\nNo Figma access, browser, dependency installation, or network is required.`;

export function parseArguments(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0]))
    return { help: true };
  if (args.length === 0) return { refreshPreviews: false };
  if (args.length === 1 && args[0] === "--refresh-previews")
    return { refreshPreviews: true };
  throw new Error(usage);
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const filename = (id) => encodeURIComponent(id);
const relativePath = (root, target) =>
  path.relative(root, target).split(path.sep).join("/");
async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) return fallback;
    throw error;
  }
}
function localPath(root, relative) {
  if (typeof relative !== "string" || path.isAbsolute(relative))
    throw new Error(`Expected a local relative path: ${relative}`);
  const result = path.resolve(root, relative);
  if (!result.startsWith(`${path.resolve(root)}${path.sep}`))
    throw new Error(`Path escapes the project: ${relative}`);
  return result;
}
async function regularFile(file) {
  try {
    const stats = await lstat(file);
    return stats.isFile() && !stats.isSymbolicLink() ? stats : null;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const result = [];
  for (const entry of entries.sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  )) {
    if (entry.isSymbolicLink()) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(file)));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}
function pngDimensions(buffer) {
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
    buffer.subarray(12, 16).toString() !== "IHDR"
  )
    return null;
  const width = buffer.readUInt32BE(16),
    height = buffer.readUInt32BE(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

export async function buildGallery({
  root = scriptRoot,
  refreshPreviews = false,
} = {}) {
  root = path.resolve(root);
  const output = path.join(root, "out/library");
  const cacheRoot = path.join(root, "public/library-previews");
  const sourceRows = await readJson(
    path.join(root, "src/figma/illustrations.json"),
  );
  const nativeDefinitions = await readNativeDefinitions(root);
  const embedded = await readEmbeddedCatalog(root);
  const nativeById = new Map(nativeDefinitions.map((row) => [row.id, row]));
  const nativeContracts = await readJson(
    path.join(root, "src/native/contracts.json"),
    { components: {} },
  );
  const rows = [...sourceRows, ...nativeDefinitions.map(nativeMetadata)];
  const contracts = await readJson(
    path.join(root, "src/figma/component-contracts.json"),
  );
  if (!Array.isArray(rows))
    throw new Error("illustrations.json must be an array.");
  const ids = new Set();
  for (const row of rows) {
    if (
      !row.id ||
      typeof row.id !== "string" ||
      !row.name ||
      !Number.isFinite(row.width) ||
      !Number.isFinite(row.height) ||
      ids.has(row.id)
    )
      throw new Error(`Invalid or duplicate component: ${row.id}`);
    if (!nativeById.has(row.id) && !contracts.components?.[row.id])
      throw new Error(
        `Missing component contract: ${row.id}. Rebuild component contracts first.`,
      );
    ids.add(row.id);
  }
  const resources = await readJson(
    path.join(root, "src/figma/resources.json"),
    {},
  );
  const assemblyRows = await readJson(
    path.join(root, "src/figma/assemblies.json"),
    [],
  );
  const assemblies = new Map(assemblyRows.map((row) => [row.id, row]));
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const hashCache = new Map();
  async function fileHash(relative) {
    if (!hashCache.has(relative))
      hashCache.set(
        relative,
        (async () => {
          const file = localPath(root, relative);
          if (!(await regularFile(file))) return null;
          return sha256(await readFile(file));
        })(),
      );
    return hashCache.get(relative);
  }
  const sharedSources = [
    "src/figma/runtime.tsx",
    "src/figma/EditableArtwork.tsx",
    "src/figma/editable-tree.mjs",
    "src/figma/artwork-motion.mjs",
    "src/fonts.ts",
    "src/Library.tsx",
  ];
  const fonts = (await walk(path.join(root, "public/fonts"))).map((file) =>
    relativePath(root, file),
  );
  const nativeSourceFiles = (await walk(path.join(root, "src/native")))
    .filter((file) => /\.(?:tsx?|mjs|mts)$/.test(file))
    .map((file) => relativePath(root, file));
  const nativeSourceHashes = await Promise.all(
    nativeSourceFiles.map(async (file) => [file, await fileHash(file)]),
  );
  const indexFile = await readFile(
    path.join(root, "src/figma/index.tsx"),
    "utf8",
  ).catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  const runtimeStart = indexFile.indexOf("export function FigmaIllustration");
  const indexRuntimeHash = sha256(
    runtimeStart >= 0 ? indexFile.slice(runtimeStart) : indexFile,
  );
  const assetMetadata = await readJson(
    path.join(root, "src/figma/assets.json"),
    [],
  );
  const assetsBySource = new Map(
    assetMetadata.map((asset) => [asset.src, asset]),
  );
  const shared = await Promise.all(
    [...sharedSources, ...fonts].map(async (file) => [
      file,
      await fileHash(file),
    ]),
  );
  const fingerprintCache = new Map();
  async function fingerprint(id, ancestors = new Set()) {
    if (ancestors.has(id)) throw new Error(`Cyclic assembly: ${id}`);
    if (fingerprintCache.has(id)) return fingerprintCache.get(id);
    const row = rowById.get(id);
    if (!row) throw new Error(`Unknown assembly component: ${id}`);
    if (nativeById.has(id)) {
      const value = sha256(
        JSON.stringify({
          definition: {
            id: row.id,
            kind: row.kind,
            width: row.width,
            height: row.height,
            defaults: row.defaults,
          },
          sources: nativeSourceHashes,
          fonts: await Promise.all(
            fonts.map(async (file) => [file, await fileHash(file)]),
          ),
          fontLoader: await fileHash("src/fonts.ts"),
        }),
      );
      fingerprintCache.set(id, value);
      return value;
    }
    const { width, height, coordinateOffset, coordinateCanvas, visualBounds } =
      row;
    const assembly = assemblies.get(id);
    const assets = new Set(resources[id] ?? []);
    async function fingerprintChild(child) {
      for (const key of ["src", "maskSrc"])
        if (child[key]) assets.add(child[key]);
      const childId =
        child.componentId ||
        (child.nodeId
          ? rows.find(
              (row) =>
                row.nodeId === child.nodeId && row.fileKey === child.fileKey,
            )?.id
          : undefined);
      return {
        ...child,
        childFingerprint: childId
          ? await fingerprint(childId, new Set([...ancestors, id]))
          : undefined,
        children: child.children
          ? await Promise.all(child.children.map(fingerprintChild))
          : undefined,
      };
    }
    const children = assembly
      ? await Promise.all(assembly.children.map(fingerprintChild))
      : null;
    const sourceHash = await fileHash(`src/figma/generated/${id}.tsx`);
    const assetHashes = await Promise.all(
      [...assets]
        .sort()
        .map(async (asset) => [asset, await fileHash(`public/${asset}`)]),
    );
    const assemblyVisual = assembly
      ? {
          width: assembly.width,
          height: assembly.height,
          clip: assembly.clip,
          borderRadius: assembly.borderRadius,
          opacity: assembly.opacity,
          backgroundColor: assembly.backgroundColor,
          children,
        }
      : null;
    const value = sha256(
      JSON.stringify({
        width,
        height,
        coordinateOffset,
        coordinateCanvas,
        visualBounds,
        shared,
        indexRuntimeHash,
        assetMetadata: [...assets]
          .sort()
          .map((asset) => assetsBySource.get(asset)),
        sourceHash,
        embeddedData: embedded.byId.get(id)?.inputFingerprint,
        fallbackIndex:
          !sourceHash && !assembly
            ? await fileHash("src/figma/index.tsx")
            : undefined,
        assemblyVisual,
        assetHashes,
      }),
    );
    fingerprintCache.set(id, value);
    return value;
  }
  const implementation = await readJson(
    path.join(root, "catalog/implementation.json"),
    { components: {} },
  );
  async function implementationFor(id) {
    const entry = implementation.components?.[id];
    if (!entry) return null;
    for (const source of [
      ...(implementation.sources ?? []),
      ...(entry.sourceFiles ?? []),
    ]) {
      if ((await fileHash(source.path)) !== source.sha256) return null;
    }
    return {
      classification: entry.classification,
      label: entry.label,
      nativeText: entry.nativeText,
      assetCounts: entry.assetCounts,
    };
  }
  const oldCache = await readJson(path.join(cacheRoot, "manifest.json"), {
    components: {},
  });
  const discovered = new Map();
  const history = [];
  // out/library is generated by this command; it must never become its own source.
  for (const file of await walk(path.join(root, "out"))) {
    if (file.startsWith(`${output}${path.sep}`)) continue;
    if (path.basename(file) === "gallery-manifest.json")
      history.push(path.dirname(file));
    if (
      path.extname(file).toLowerCase() !== ".png" ||
      !ids.has(path.basename(file, ".png"))
    )
      continue;
    const id = path.basename(file, ".png");
    const stats = await regularFile(file);
    const priority = relativePath(root, file).startsWith(
      "out/catalog-thumbnails/",
    )
      ? 1
      : 0;
    const previous = discovered.get(id);
    if (
      !previous ||
      priority > previous.priority ||
      (priority === previous.priority && stats.mtimeMs > previous.mtimeMs)
    )
      discovered.set(id, { file, priority, mtimeMs: stats.mtimeMs });
  }
  await mkdir(path.join(output, "images"), { recursive: true });
  await mkdir(path.join(output, "components"), { recursive: true });
  await mkdir(path.join(output, "fonts"), { recursive: true });
  await mkdir(path.join(cacheRoot, "images"), { recursive: true });
  const cached = Object.fromEntries(
    Object.entries(oldCache.components ?? {}).filter(([id]) => ids.has(id)),
  );
  const components = [];
  const missing = [];
  for (const row of rows) {
    const sourceFingerprint = await fingerprint(row.id);
    const previous = oldCache.components?.[row.id];
    const candidate = discovered.get(row.id);
    let preview = null;
    let buffer = null;
    if (previous?.sourceFingerprint === sourceFingerprint) {
      const file = localPath(cacheRoot, previous.path);
      if (await regularFile(file)) {
        const stored = await readFile(file);
        if (sha256(stored) === previous.sha256 && pngDimensions(stored)) {
          preview = previous;
          buffer = stored;
        }
      }
    }
    if (
      candidate &&
      (!preview ||
        refreshPreviews ||
        candidate.mtimeMs > (preview.renderedFileMtimeMs ?? 0))
    ) {
      const rendered = await readFile(candidate.file);
      const dimensions = pngDimensions(rendered);
      const imageHash = sha256(rendered);
      // An older PNG cannot prove a changed source was rendered again.
      const staleCandidate =
        previous &&
        previous.sourceFingerprint !== sourceFingerprint &&
        candidate.mtimeMs <= (previous.renderedFileMtimeMs ?? 0);
      if (dimensions && (!staleCandidate || refreshPreviews)) {
        preview = {
          kind: "rendered",
          path: `images/${filename(row.id)}.png`,
          ...dimensions,
          sha256: imageHash,
          sourceFingerprint,
          renderedFileMtimeMs: candidate.mtimeMs,
        };
        buffer = rendered;
      }
    }
    if (preview && buffer) {
      preview = { ...preview, path: `images/${filename(row.id)}.png` };
      await writeFile(path.join(cacheRoot, preview.path), buffer);
      await writeFile(path.join(output, preview.path), buffer);
      cached[row.id] = preview;
    } else
      missing.push({
        id: row.id,
        name: row.name,
        reason: previous
          ? "Cached preview is stale or unavailable"
          : "No local rendered PNG",
      });
    const nativeDefinition = nativeById.get(row.id);
    const snapshot = nativeContracts.components?.[row.id];
    const nativeContractAvailable = Boolean(
      nativeDefinition &&
      snapshot?.inputFingerprint === sha256(JSON.stringify(nativeDefinition)) &&
      snapshot.contract,
    );
    const contract = nativeDefinition
      ? nativeContractAvailable
        ? snapshot.contract
        : {
            fields: {},
            motionTargets: {},
            limitations: [
              "Default contract snapshot is missing or stale. Query npm run catalog with --describe or --motion; use --props to inspect custom data.",
            ],
          }
      : contracts.components[row.id];
    const editableFields = {};
    for (const field of Object.values(contract.fields ?? {}))
      editableFields[field.type] = (editableFields[field.type] ?? 0) + 1;
    const motionTargets = Object.values(contract.motionTargets ?? {});
    const metadata = { ...row };
    delete metadata.coordinateOffset;
    delete metadata.coordinateCanvas;
    const item = {
      ...metadata,
      ...embeddedMetadata(embedded.byId.get(row.id)),
      editableFields,
      motionTargetCount:
        nativeDefinition && !nativeContractAvailable
          ? null
          : motionTargets.length,
      motionAliases: [
        ...new Set(motionTargets.flatMap((target) => target.aliases ?? [])),
      ],
      implementation: nativeDefinition
        ? {
            classification: "data-driven-native",
            label:
              "Native data component: rows, columns, points and series are generated from structured props.",
          }
        : await implementationFor(row.id),
      nativeAlternatives: nativeAlternativesFor(row, nativeDefinitions),
      ...(nativeDefinition
        ? { contractSnapshotAvailable: nativeContractAvailable }
        : {}),
      preview: preview
        ? {
            kind: preview.kind,
            path: preview.path,
            width: preview.width,
            height: preview.height,
            sha256: preview.sha256,
            sourceFingerprint,
          }
        : null,
      agentData: `components/${filename(row.id)}.json`,
    };
    components.push(item);
    await writeFile(
      path.join(output, item.agentData),
      json({
        $schema: "../component.schema.json",
        schemaVersion: 1,
        component: item,
        contract,
        ...(item.embeddedDataSlotCount
          ? { embeddedDataSlots: item.embeddedDataSlots }
          : {}),
        usage: {
          describe: `npm run catalog -- --id ${shellQuote(row.id)} --describe --json`,
          motion: `npm run catalog -- --id ${shellQuote(row.id)} --motion --json`,
          ...(item.embeddedDataSlotCount
            ? {
                embeddedData: `npm run catalog -- --id ${shellQuote(row.id)} --describe --data embedded-data.json --json`,
              }
            : {}),
          validation:
            "scripts/export.mjs validates scene props against src/composition/schema.mjs",
          layer: {
            type: nativeDefinition ? "native" : "illustration",
            id: "artwork",
            ...(nativeDefinition
              ? { componentId: row.id }
              : { illustrationId: row.id }),
            x: 0,
            y: 0,
            scale: 1,
            props: {},
            ...(item.embeddedDataSlotCount
              ? {
                  data: Object.fromEntries(
                    Object.keys(item.embeddedDataSlots).map((id) => [
                      id,
                      { props: {} },
                    ]),
                  ),
                }
              : {}),
          },
        },
      }),
    );
  }
  const copiedDocs = [];
  for (const file of await walk(path.join(root, "catalog"))) {
    const relative = relativePath(path.join(root, "catalog"), file);
    const target = path.join(output, "docs", relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(file, target);
    copiedDocs.push(relative);
  }
  const manifest = {
    schemaVersion: 1,
    title: "Complete RevenueCat asset library",
    guides: {
      composition: copiedDocs.includes("composition.md")
        ? "docs/composition.md"
        : null,
      implementation: copiedDocs.includes("implementation.md")
        ? "docs/implementation.md"
        : null,
    },
    counts: countRoles(components),
    previewCounts: {
      rendered: components.length - missing.length,
      missing: missing.length,
    },
    embeddedDataCounts: {
      components: components.filter((item) => item.embeddedDataSlotCount > 0)
        .length,
      slots: components.reduce(
        (count, item) => count + (item.embeddedDataSlotCount ?? 0),
        0,
      ),
    },
    collectionCounts: {
      source: sourceRows.length,
      native: nativeDefinitions.length,
    },
    components,
  };
  await writeFile(path.join(output, "manifest.json"), json(manifest));
  await writeFile(
    path.join(output, "missing-previews.json"),
    json({ count: missing.length, components: missing }),
  );
  await writeFile(
    path.join(cacheRoot, "manifest.json"),
    json({
      schemaVersion: 1,
      description:
        "Rendered previews only. Source screenshots are not implementation or preview fallbacks.",
      components: cached,
    }),
  );
  await writeFile(
    path.join(output, "component.schema.json"),
    json({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "RevenueCat catalog agent data envelope",
      description:
        "Documents exported catalog metadata. Authoritative scene and component validation remains in the bundled runtime schema.",
      type: "object",
      required: ["schemaVersion", "component", "contract", "usage"],
      properties: {
        schemaVersion: { const: 1 },
        component: {
          type: "object",
          required: ["id", "name", "agentData"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            role: { type: "string" },
            agentData: { type: "string" },
          },
        },
        contract: {
          type: "object",
          required: ["fields", "motionTargets"],
          properties: {
            fields: {
              type: "object",
              additionalProperties: {
                type: "object",
                required: ["type"],
                properties: {
                  type: { enum: ["text", "color", "boolean", "image"] },
                  targets: { type: "array" },
                },
              },
            },
            motionTargets: { type: "object" },
            limitations: { type: "array" },
          },
        },
        usage: { type: "object" },
      },
    }),
  );
  const uiRoot = path.join(root, "scripts/gallery");
  await copyFile(
    path.join(uiRoot, "styles.css"),
    path.join(output, "styles.css"),
  );
  for (const font of ["object-sans-regular.woff2", "object-sans-medium.woff2"])
    await copyFile(
      path.join(root, "public/fonts", font),
      path.join(output, "fonts", font),
    );
  await writeFile(
    path.join(output, "index.html"),
    renderPage(
      manifest,
      await readFile(path.join(uiRoot, "client.js"), "utf8"),
    ),
  );
  let historicalPagesUpdated = 0;
  for (const directory of history) {
    const index = path.join(directory, "index.html");
    if (!(await regularFile(index))) continue;
    const original = await readFile(index, "utf8");
    const banner = historicalBanner(
      components.length,
      relativePath(directory, path.join(output, "index.html")),
    );
    const withoutBanner = original.replace(
      /<!-- complete-library-banner:start -->[\s\S]*?<!-- complete-library-banner:end -->/g,
      "",
    );
    const updated = withoutBanner.replace(
      /<body\b[^>]*>\s*/i,
      (body) => `${body.trimEnd()}\n${banner}\n`,
    );
    if (updated !== original) {
      await writeFile(index, updated);
      historicalPagesUpdated++;
    }
  }
  return { output, manifest, historicalPagesUpdated };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) console.log(usage);
    else {
      const result = await buildGallery(options);
      console.log(
        `Built ${result.manifest.counts.all} components: ${result.manifest.previewCounts.rendered} rendered previews, ${result.manifest.previewCounts.missing} unavailable.\n${path.join(result.output, "index.html")}\nHistorical pages updated: ${result.historicalPagesUpdated}`,
      );
    }
  } catch (error) {
    console.error(`Gallery build failed: ${error.message}`);
    process.exitCode = 1;
  }
}
