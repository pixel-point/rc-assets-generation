#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { URL, fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import {
  nativeAlternativesFor,
  nativeMetadata,
  readNativeDefinitions,
} from "./gallery/native.mjs";

import { readEmbeddedCatalog, embeddedMetadata } from "./gallery/embedded.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const usage =
  'Use npm run catalog -- [search words | --id <stable-id> | --name "Exact name"] [--assets] [--describe | --motion] [--props <native-props.json> | --data <embedded-data.json>] [--json].';
const read = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const normalizeName = (name) => name.trim().toLowerCase();

function parseArguments(args) {
  const options = {
    json: false,
    assets: false,
    describe: false,
    motion: false,
    terms: [],
  };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      options.terms.push(arg);
      continue;
    }
    if (
      ![
        "--json",
        "--assets",
        "--describe",
        "--motion",
        "--id",
        "--name",
        "--props",
        "--data",
      ].includes(arg)
    )
      throw new Error(`Unknown option ${arg}. ${usage}`);
    if (seen.has(arg)) throw new Error(`Duplicate option ${arg}. ${usage}`);
    seen.add(arg);
    if (["--json", "--assets", "--describe", "--motion"].includes(arg)) {
      options[arg.slice(2)] = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith("--") || !value.trim())
      throw new Error(`Missing value for ${arg}. ${usage}`);
    options[arg.slice(2)] = value;
  }
  options.terms = options.terms
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (options.id !== undefined && options.name !== undefined)
    throw new Error(`--id and --name cannot be combined. ${usage}`);
  if (
    (options.id !== undefined || options.name !== undefined) &&
    options.terms.length
  )
    throw new Error(
      `Exact selectors cannot be combined with search words. ${usage}`,
    );
  if (
    (options.describe || options.motion) &&
    (options.assets || (!options.id && !options.name))
  )
    throw new Error(
      `--describe/--motion requires an exact component --id or --name and cannot use --assets. ${usage}`,
    );
  if (options.describe && options.motion)
    throw new Error(`Choose --describe or --motion. ${usage}`);
  if (options.props && !(options.describe || options.motion))
    throw new Error(
      `--props requires --describe or --motion for an exact native component. ${usage}`,
    );
  if (options.data && !(options.describe || options.motion))
    throw new Error(
      `--data requires --describe or --motion for an exact source component. ${usage}`,
    );
  if (options.props && options.data)
    throw new Error(`--props and --data cannot be combined. ${usage}`);
  return options;
}

function selectEntries(entries, options) {
  if (options.id === undefined && options.name === undefined)
    return entries.filter((item) =>
      options.terms.every((term) =>
        JSON.stringify(item).toLowerCase().includes(term),
      ),
    );

  const byId = options.id !== undefined;
  const value = byId ? options.id : options.name;
  const matches = entries.filter((item) =>
    byId
      ? item.id === value
      : normalizeName(item.name) === normalizeName(value),
  );
  const scope = options.assets ? "asset" : "illustration or part";
  if (!matches.length)
    throw new Error(
      `No ${scope} matches exact ${byId ? "ID" : "name"} ${JSON.stringify(value)}. Search the catalog with keywords${options.assets ? " and --assets" : ""}, then copy an exact ID or name. ${usage}`,
    );
  if (matches.length > 1) {
    const ids = matches.map((item) => item.id).join(", ");
    if (byId)
      throw new Error(
        `The catalog contains duplicate ID ${JSON.stringify(value)}. Fix the duplicate catalog entries before selecting this ID.`,
      );
    throw new Error(
      `Multiple ${scope} entries match exact name ${JSON.stringify(value)}. Matching IDs: ${ids}. Select one with --id <stable-id>.`,
    );
  }
  return matches;
}

try {
  const options = parseArguments(process.argv.slice(2));
  const nativeDefinitions = options.assets
    ? []
    : await readNativeDefinitions(root);
  const embedded = options.assets ? null : await readEmbeddedCatalog(root);
  const entries = options.assets
    ? [
        ...(await read("src/library/assets.json")),
        ...(await read("src/figma/assets.json")),
      ]
    : [
        ...(await read("src/figma/illustrations.json")).map((item) => {
          const alternatives = nativeAlternativesFor(item, nativeDefinitions);
          return {
            ...item,
            ...embeddedMetadata(embedded.byId.get(item.id)),
            ...(alternatives.length
              ? { nativeAlternatives: alternatives }
              : {}),
          };
        }),
        ...nativeDefinitions.map(nativeMetadata),
      ];
  let matches = selectEntries(entries, options);
  if (options.describe || options.motion) {
    const contracts = await read("src/figma/component-contracts.json");
    matches = await Promise.all(
      matches.map(async (item) => {
        if (item.family === "native") {
          if (options.data)
            throw new Error(
              "--data is for embedded slots inside a source illustration. Use --props for a native preset.",
            );
          const {
            parseNativeRegistry,
            getNativeDefinition,
            parseNativeProps,
            getNativeContract,
            validateNativeMotion,
          } = await import(
            pathToFileURL(path.join(root, "src/native/schema.mjs")).href
          );
          const definition = getNativeDefinition(
            parseNativeRegistry(nativeDefinitions),
            item.id,
          );
          const input = options.props
            ? JSON.parse(await readFile(path.resolve(options.props), "utf8"))
            : {};
          const resolvedProps = parseNativeProps(definition, input);
          validateNativeMotion(definition, input, []);
          const contract = getNativeContract(definition, input);
          return options.motion
            ? { ...item, resolvedProps, motionTargets: contract.motionTargets }
            : { ...item, resolvedProps, contract };
        }
        if (options.props)
          throw new Error(
            "--props is supported only for native data components. Select an explicit native alternative ID.",
          );
        if (!Object.hasOwn(contracts.components, item.id))
          throw new Error(
            `Missing editable contract for ${item.id}. Rebuild the component catalog.`,
          );
        let embeddedData = embeddedMetadata(embedded.byId.get(item.id));
        if (options.data) {
          const input = JSON.parse(
            await readFile(path.resolve(options.data), "utf8"),
          );
          const {
            createEmbeddedRegistry,
            validateEmbeddedData,
            getEmbeddedComponentContract,
          } = await import(
            pathToFileURL(path.join(root, "src/embedded/runtime.mjs")).href
          );
          const registry = createEmbeddedRegistry(
            embedded.tables,
            embedded.charts,
            embedded.assemblies,
            embedded.illustrations,
          );
          validateEmbeddedData(registry, item.id, input);
          const slots = getEmbeddedComponentContract(registry, item.id, input);
          embeddedData = embeddedMetadata({ slots, contractAvailable: true });
        }
        return options.motion
          ? {
              ...item,
              ...embeddedData,
              motionTargets: contracts.components[item.id].motionTargets ?? {},
            }
          : {
              ...item,
              ...embeddedData,
              contract: contracts.components[item.id],
            };
      }),
    );
  }
  if (options.json) console.log(JSON.stringify(matches, null, 2));
  else {
    console.log(
      `${matches.length} ${options.assets ? "assets" : "illustrations and parts"} found`,
    );
    for (const item of matches) {
      console.log(
        `${item.id}\t${Math.round(item.width)}×${Math.round(item.height)}\t${item.name}`,
      );
      if (item.nativeAlternatives?.length)
        console.log(
          `  Data-driven alternatives (explicit opt-in): ${item.nativeAlternatives.map((entry) => entry.id).join(", ")}`,
        );
      if (item.family === "native")
        console.log(
          "  Native data component: use Scene type:native with componentId and structured props.",
        );
      if (item.embeddedDataSlotCount) {
        console.log(
          `  Native data inside: ${item.embeddedDataSlotCount} slots; keep this illustration ID and edit layer.data.`,
        );
        for (const [key, slot] of Object.entries(item.embeddedDataSlots)) {
          console.log(`  data.${key} (${slot.kind}): ${slot.name}`);
          if (options.describe || options.motion) {
            if (slot.propsSchema)
              console.log(
                `    Structured props: ${JSON.stringify(slot.propsSchema)}`,
              );
            for (const [target, definition] of Object.entries(
              slot.motionTargets ?? {},
            ))
              console.log(
                `    ${target}: ${definition.label ?? target}; ${(definition.properties ?? []).join(", ")}`,
              );
          }
        }
        if (!item.embeddedDataContractAvailable)
          console.log(
            "  Embedded contract snapshot is missing or stale; rebuild the catalog before authoring data overrides.",
          );
      }
      const motionTargets = item.motionTargets ?? item.contract?.motionTargets;
      if (motionTargets) {
        console.log(
          `  Internal motion: ${Object.keys(motionTargets).length} targets`,
        );
        for (const [key, target] of Object.entries(motionTargets))
          console.log(
            `  ${key}${target.aliases?.length ? ` [${target.aliases.join(", ")}]` : ""}: ${target.label}; ${target.properties.join(", ")}`,
          );
      }
      if (item.contract) {
        if (item.variantFamily)
          console.log(`  Variant: ${item.variantFamily} / ${item.variant}`);
        for (const [key, field] of Object.entries(item.contract.fields ?? {}))
          console.log(
            `  ${key} (${field.type}): ${field.label}; default=${JSON.stringify(field.default)}`,
          );
        if (item.contract.propsSchema)
          console.log(
            `  Structured props schema: ${JSON.stringify(item.contract.propsSchema)}`,
          );
        for (const limit of item.contract.limitations ?? [])
          console.log(`  Limit: ${limit}`);
      }
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
