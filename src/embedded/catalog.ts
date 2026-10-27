import tables from "./table-definitions.json";
import charts from "./chart-definitions.json";
import assemblies from "../figma/assemblies.json";
import illustrations from "../figma/illustrations.json";
import { createEmbeddedRegistry } from "./runtime.mjs";

export const embeddedRegistry = createEmbeddedRegistry(
  tables, charts, assemblies, illustrations,
);
