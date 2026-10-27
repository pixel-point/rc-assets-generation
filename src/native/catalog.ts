import tables from "./table-presets.json";
import charts from "./chart-presets.json";
import { parseNativeRegistry } from "./schema.mjs";
export const nativeCatalog = parseNativeRegistry([...tables, ...charts]);
