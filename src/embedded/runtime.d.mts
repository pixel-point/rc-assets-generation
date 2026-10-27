import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
import type { ComponentContract, ComponentProps } from "../composition/schema.mjs";
import { resolveEmbeddedTable } from "./table-runtime.mjs";
import { resolveEmbeddedChart } from "./chart-runtime.mjs";

export type EmbeddedInput = Record<string, {
  props?: Record<string, unknown>;
  internalMotion?: InternalMotionTrack[];
}>;
export type EmbeddedDefinition = {
  id: string;
  componentId: string;
  name: string;
  kind: "table" | "chart";
  [key: string]: unknown;
};
export type EmbeddedSlot = {
  id: string;
  componentId: string;
  definitionKey: string;
};
export type EmbeddedRegistry = {
  schemaVersion: number;
  definitions: Record<string, EmbeddedDefinition>;
  components: Record<string, EmbeddedSlot[]>;
};
export type EmbeddedInstance =
  (ReturnType<typeof resolveEmbeddedTable> | ReturnType<typeof resolveEmbeddedChart>) & {scopeId: string};
export type EmbeddedInstances = Map<string, EmbeddedInstance[]>;
export function createEmbeddedRegistry(
  tables?: unknown[], charts?: unknown[], assemblies?: unknown[], illustrations?: unknown[],
): EmbeddedRegistry;
export function embeddedSlotsFor(registry: EmbeddedRegistry, componentId: string): EmbeddedSlot[];
export function getEmbeddedComponentContract(
  registry: EmbeddedRegistry, componentId: string, input?: EmbeddedInput,
): Record<string, unknown>;
export function validateEmbeddedData(
  registry: EmbeddedRegistry, componentId: string, input?: unknown,
  durationFrames?: number, legacyProps?: ComponentProps,
  legacyMotion?: InternalMotionTrack[], componentContract?: ComponentContract,
): EmbeddedInput;
export function resolveEmbeddedInstances(
  registry: EmbeddedRegistry, componentId: string, input?: EmbeddedInput,
  frame?: number, durationFrames?: number, scopeId?: string,
): EmbeddedInstances;
