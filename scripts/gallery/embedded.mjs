import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const sha = (value) => createHash("sha256").update(value).digest("hex");
async function read(root, file, fallback) {
  try {
    return JSON.parse(await readFile(path.join(root, file), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}
async function codeHashes(root, relative) {
  let entries;
  try {
    entries = await readdir(path.join(root, relative), { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const result = [];
  for (const entry of entries.sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  )) {
    const file = `${relative}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await codeHashes(root, file)));
    else if (entry.isFile() && /\.(?:tsx?|mjs|mts)$/.test(file))
      result.push([file, sha(await readFile(path.join(root, file)))]);
  }
  return result;
}

// Metadata-only equivalent of the runtime registry. Keep this dependency-free
// so copied workspaces can browse the catalog before installing dependencies.
export function embeddedIndex(tables, charts, assemblies, illustrations) {
  const definitions = new Map(),
    components = new Map();
  const identity = new Map(
    illustrations.map((row) => [`${row.fileKey}/${row.nodeId}`, row.id]),
  );
  const known = new Set(illustrations.map((row) => row.id));
  for (const definition of [...tables, ...charts]) {
    const key = `${definition.componentId}/${definition.id}`;
    if (
      !definition.id ||
      !known.has(definition.componentId) ||
      !["table", "chart"].includes(definition.kind) ||
      definitions.has(key)
    )
      throw new Error(`Invalid or duplicate embedded data definition: ${key}`);
    definitions.set(key, definition);
    if (!components.has(definition.componentId))
      components.set(definition.componentId, []);
    components.get(definition.componentId).push({
      id: definition.id,
      componentId: definition.componentId,
      definitionKey: key,
    });
  }
  const byId = new Map(assemblies.map((row) => [row.id, row]));
  const done = new Set(),
    visiting = new Set();
  function visit(id) {
    if (done.has(id) || !byId.has(id)) return;
    if (visiting.has(id)) throw new Error(`Cyclic artwork assembly ${id}.`);
    visiting.add(id);
    const inherited = new Map();
    function children(items) {
      for (const child of items) {
        if (child.children) children(child.children);
        const childId =
          child.componentId ?? identity.get(`${child.fileKey}/${child.nodeId}`);
        if (!childId || child.src) continue;
        visit(childId);
        for (const slot of components.get(childId) ?? []) {
          const publicId = `${childId}::${slot.id}`;
          inherited.set(publicId, { ...slot, id: publicId });
        }
      }
    }
    children(byId.get(id).children ?? []);
    if (inherited.size)
      components.set(id, [
        ...(components.get(id) ?? []),
        ...inherited.values(),
      ]);
    visiting.delete(id);
    done.add(id);
  }
  for (const id of byId.keys()) visit(id);
  return { definitions, components };
}

export async function readEmbeddedCatalog(root) {
  const [tables, charts, assemblies, illustrations, snapshot, runtimeHashes] =
    await Promise.all([
      read(root, "src/embedded/table-definitions.json", []),
      read(root, "src/embedded/chart-definitions.json", []),
      read(root, "src/figma/assemblies.json", []),
      read(root, "src/figma/illustrations.json", []),
      read(root, "src/embedded/contracts.json", { components: {} }),
      codeHashes(root, "src/embedded"),
    ]);
  const { definitions, components } = embeddedIndex(
    tables,
    charts,
    assemblies,
    illustrations,
  );
  const byId = new Map();
  for (const [id, slots] of components) {
    const inputs = slots.map((slot) => ({
      slot,
      definition: definitions.get(slot.definitionKey),
    }));
    const sourceHashes = await Promise.all(
      [...new Set(slots.map((slot) => slot.componentId))]
        .sort()
        .map(async (componentId) => {
          const file = `src/figma/generated/${componentId}.tsx`;
          const value = await readFile(path.join(root, file)).catch((error) => {
            if (error.code === "ENOENT") return null;
            throw error;
          });
          return [file, value === null ? null : sha(value)];
        }),
    );
    const inputFingerprint = sha(
      JSON.stringify({ inputs, runtimeHashes, sourceHashes }),
    );
    const saved = snapshot.components?.[id];
    const contractAvailable =
      saved?.inputFingerprint === inputFingerprint &&
      saved.slots &&
      Object.keys(saved.slots).length === slots.length &&
      slots.every(
        (slot) =>
          Object.hasOwn(saved.slots, slot.id) &&
          saved.slots[slot.id]?.id === slot.id,
      );
    byId.set(id, {
      inputFingerprint,
      inputs,
      contractAvailable: Boolean(contractAvailable),
      slots: Object.fromEntries(
        slots.map((slot) => {
          const definition = definitions.get(slot.definitionKey);
          return [
            slot.id,
            contractAvailable
              ? saved.slots[slot.id]
              : {
                  id: slot.id,
                  name: definition.name,
                  kind: definition.kind,
                  sourceComponentId: definition.componentId,
                  contractAvailable: false,
                },
          ];
        }),
      ),
    });
  }
  return { tables, charts, assemblies, illustrations, byId, runtimeHashes };
}

export function embeddedMetadata(entry) {
  if (!entry) return {};
  const slots = Object.values(entry.slots);
  return {
    embeddedDataSlots: entry.slots,
    embeddedDataSlotCount: slots.length,
    embeddedDataMotionTargetCount: entry.contractAvailable
      ? slots.reduce(
          (count, slot) => count + Object.keys(slot.motionTargets ?? {}).length,
          0,
        )
      : null,
    embeddedDataContractAvailable: entry.contractAvailable,
  };
}
