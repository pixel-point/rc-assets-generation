import {
  getEmbeddedTableContract,
  validateEmbeddedTable,
  resolveEmbeddedTable,
} from "./table-runtime.mjs";
import {
  getEmbeddedChartContract,
  validateEmbeddedChart,
  resolveEmbeddedChart,
  embeddedChartStructure,
} from "./chart-runtime.mjs";

const own = (object, key) => Object.hasOwn(object ?? {}, key);
const keyFor = (definition) => `${definition.componentId}/${definition.id}`;

function record(value, name) {
  if (value === null || Array.isArray(value) || typeof value !== "object")
    throw new Error(`${name} must be an object.`);
  return value;
}

/** Pure registry construction shared by the browser and export preflight. */
export function createEmbeddedRegistry(
  tables = [],
  charts = [],
  assemblies = [],
  illustrations = [],
) {
  const definitions = {},
    components = {};
  const metadata = new Map(
    illustrations.map((item) => [`${item.fileKey}/${item.nodeId}`, item.id]),
  );
  for (const definition of [...tables, ...charts]) {
    if (
      !definition.id ||
      !definition.componentId ||
      !["table", "chart"].includes(definition.kind)
    )
      throw new Error("Embedded definitions require id, componentId and kind.");
    const key = keyFor(definition);
    if (own(definitions, key))
      throw new Error(`Duplicate embedded slot ${key}.`);
    definitions[key] = definition;
    (components[definition.componentId] ??= []).push({
      id: definition.id,
      componentId: definition.componentId,
      definitionKey: key,
    });
  }
  const assemblyById = new Map(assemblies.map((item) => [item.id, item]));
  const visited = new Set(),
    visiting = new Set();
  function visitAssembly(id) {
    if (visited.has(id) || !assemblyById.has(id)) return;
    if (visiting.has(id)) throw new Error(`Cyclic artwork assembly ${id}.`);
    visiting.add(id);
    const inherited = new Map();
    function children(items) {
      for (const child of items) {
        if (child.children) children(child.children);
        const childId =
          child.componentId ?? metadata.get(`${child.fileKey}/${child.nodeId}`);
        if (!childId || child.src) continue;
        visitAssembly(childId);
        for (const slot of components[childId] ?? []) {
          const publicId = `${childId}::${slot.id}`;
          inherited.set(publicId, { ...slot, id: publicId });
        }
      }
    }
    children(assemblyById.get(id).children ?? []);
    if (inherited.size)
      components[id] = [...(components[id] ?? []), ...inherited.values()];
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of assemblyById.keys()) visitAssembly(id);
  return { schemaVersion: 1, definitions, components };
}

export function embeddedSlotsFor(registry, componentId) {
  return own(registry?.components, componentId)
    ? registry.components[componentId]
    : [];
}

function definitionFor(registry, slot) {
  if (!own(registry.definitions, slot.definitionKey))
    throw new Error(`Missing embedded definition ${slot.definitionKey}.`);
  return registry.definitions[slot.definitionKey];
}

function parseOverrides(registry, componentId, input = {}) {
  const entries = record(input, `${componentId}.data`);
  const slots = embeddedSlotsFor(registry, componentId);
  const known = new Set(slots.map((slot) => slot.id));
  for (const [key, entry] of Object.entries(entries)) {
    if (!known.has(key))
      throw new Error(
        `Unknown data slot ${componentId}.${key}. Inspect catalog --id ${componentId} --describe.`,
      );
    record(entry, `${componentId}.data.${key}`);
    for (const field of Object.keys(entry))
      if (!["props", "internalMotion"].includes(field))
        throw new Error(
          `Unknown data slot field ${key}.${field}. Use props or internalMotion.`,
        );
    if (entry.props !== undefined) record(entry.props, `${key}.props`);
  }
  return { entries, slots };
}

function contractFor(definition, props) {
  return definition.kind === "table"
    ? getEmbeddedTableContract(definition, props)
    : getEmbeddedChartContract(definition, props);
}

/** A component's data slots are distinct from its original scalar text/color fields. */
export function getEmbeddedComponentContract(
  registry,
  componentId,
  input = {},
) {
  const { entries, slots } = parseOverrides(registry, componentId, input);
  return Object.fromEntries(
    slots.map((slot) => {
      const definition = definitionFor(registry, slot);
      return [
        slot.id,
        {
          ...contractFor(definition, entries[slot.id]?.props ?? {}),
          id: slot.id,
          name: definition.name,
          kind: definition.kind,
          sourceComponentId: definition.componentId,
        },
      ];
    }),
  );
}

function explicitCellUpdate(entry, binding) {
  if (own(entry.props?.cells?.[binding.rowId], binding.columnId)) return true;
  if (binding.rowId === "header" && own(entry.props?.columns, binding.columnId))
    return true;
  return (entry.internalMotion ?? []).some(
    (track) =>
      track.property === "value" &&
      track.target === `cell:${binding.rowId}:${binding.columnId}`,
  );
}

function rejectLegacyConflicts(
  definition,
  entry,
  legacyProps,
  legacyMotion,
  contract,
) {
  if (!entry || !contract) return;
  const replacedKeys = new Set(
    definition.kind === "table"
      ? own(entry.props, "dataset")
        ? (definition.structural?.replacedNodeKeys ?? [])
        : []
      : embeddedChartStructure(definition, entry.props ?? {}).replacedNodeKeys,
  );
  const isReplaced = (target) =>
    target.componentId === definition.componentId &&
    replacedKeys.has(target.nodeId);
  for (const prop of Object.keys(legacyProps ?? {})) {
    if (contract.fields?.[prop]?.targets?.some(isReplaced))
      throw new Error(
        `Legacy prop ${prop} targets source content replaced by data slot ${definition.id}. Edit the slot's dataset or values instead.`,
      );
  }
  for (const track of legacyMotion ?? []) {
    const target =
      contract.motionTargets?.[track.target] ??
      Object.values(contract.motionTargets ?? {}).find((item) =>
        item.aliases?.includes(track.target),
      );
    if (target && isReplaced(target))
      throw new Error(
        `Legacy motion ${track.target} targets source content replaced by data slot ${definition.id}. Use the slot's current internalMotion targets.`,
      );
  }
  for (const binding of definition.sourceTextBindings ?? []) {
    if (!explicitCellUpdate(entry, binding)) continue;
    const keys = new Set(binding.nodeKeys ?? []);
    const overlaps = (target) =>
      target.componentId === definition.componentId && keys.has(target.nodeId);
    for (const prop of Object.keys(legacyProps ?? {})) {
      const field = contract.fields?.[prop];
      if (field?.type === "text" && field.targets?.some(overlaps))
        throw new Error(
          `Data cell ${binding.rowId}:${binding.columnId} conflicts with legacy text prop ${prop}. Choose one value source.`,
        );
    }
    for (const track of legacyMotion ?? []) {
      const target =
        contract.motionTargets?.[track.target] ??
        Object.values(contract.motionTargets ?? {}).find((item) =>
          item.aliases?.includes(track.target),
        );
      if (track.property === "counter" && target && overlaps(target))
        throw new Error(
          `Data cell ${binding.rowId}:${binding.columnId} conflicts with legacy counter ${track.target}.`,
        );
    }
  }
}

export function validateEmbeddedData(
  registry,
  componentId,
  input = {},
  durationFrames = 1800,
  legacyProps = {},
  legacyMotion = [],
  componentContract,
) {
  const { entries, slots } = parseOverrides(registry, componentId, input);
  for (const slot of slots) {
    const definition = definitionFor(registry, slot);
    const entry = entries[slot.id] ?? {};
    const validate =
      definition.kind === "table"
        ? validateEmbeddedTable
        : validateEmbeddedChart;
    validate(
      definition,
      entry.props ?? {},
      entry.internalMotion ?? [],
      durationFrames,
    );
    rejectLegacyConflicts(
      definition,
      entry,
      legacyProps,
      legacyMotion,
      componentContract,
    );
  }
  return entries;
}

/** Defaults run too: imported components render native data even without overrides. */
export function resolveEmbeddedInstances(
  registry,
  componentId,
  input = {},
  frame = 0,
  durationFrames = 1800,
  scopeId = "embedded",
) {
  const { entries, slots } = parseOverrides(registry, componentId, input);
  const instances = new Map();
  for (const slot of slots) {
    const definition = definitionFor(registry, slot);
    const entry = entries[slot.id] ?? {};
    const resolve =
      definition.kind === "table" ? resolveEmbeddedTable : resolveEmbeddedChart;
    const instance = {
      ...resolve(
        definition,
        entry.props ?? {},
        entry.internalMotion ?? [],
        frame,
        durationFrames,
      ),
      scopeId,
    };
    const owned = instances.get(definition.componentId) ?? [];
    if (owned.some((item) => item.definition.id === definition.id))
      throw new Error(`Ambiguous repeated embedded slot ${slot.id}.`);
    owned.push(instance);
    instances.set(definition.componentId, owned);
  }
  return instances;
}
