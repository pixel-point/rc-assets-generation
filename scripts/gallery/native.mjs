import { readFile } from "node:fs/promises";
import path from "node:path";

// Metadata lookup stays dependency-free, including in a newly copied workspace.
export async function readNativeDefinitions(root) {
  const entries = [];
  for (const name of ["table-presets.json", "chart-presets.json"]) {
    let rows;
    try {
      rows = JSON.parse(
        await readFile(path.join(root, "src/native", name), "utf8"),
      );
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (!Array.isArray(rows))
      throw new Error(`Native ${name} must be an array.`);
    entries.push(...rows);
  }
  const ids = new Set();
  for (const entry of entries) {
    if (
      typeof entry.id !== "string" ||
      !entry.id ||
      ids.has(entry.id) ||
      typeof entry.name !== "string" ||
      !["table", "chart"].includes(entry.kind) ||
      !Number.isFinite(entry.width) ||
      !Number.isFinite(entry.height) ||
      entry.width <= 0 ||
      entry.height <= 0
    )
      throw new Error(`Invalid or duplicate native component: ${entry.id}`);
    ids.add(entry.id);
  }
  return entries;
}

export function nativeAlternativesFor(component, definitions) {
  return definitions
    .filter((definition) =>
      (definition.sources ?? []).some(
        (source) =>
          source.componentId === component.id &&
          source.fileKey === component.fileKey &&
          source.nodeId === component.nodeId,
      ),
    )
    .map(({ id, name, kind }) => ({ id, name, kind }));
}

export function nativeMetadata(definition) {
  return {
    ...definition,
    family: "native",
    role: "part",
    layerType: "native",
    dataDriven: true,
  };
}
