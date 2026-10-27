import type { ZodType } from "zod";
import type { ComponentContract } from "../composition/schema.mjs";
import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
export type NativeNumberFormat = {
  decimals?: number;
  prefix?: string;
  suffix?: string;
};
export type NativeCell =
  | string
  | number
  | null
  | {
      value: string | number | null;
      label?: string;
      tone?: "neutral" | "positive" | "negative";
      avatar?: string;
      format?: NativeNumberFormat;
    };
export type NativeTableData = {
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  theme: "cohort" | "prediction" | "feedback" | "conversion" | "entitlement";
  rowHeight?: number;
  columns: Array<{
    id: string;
    label: string;
    width?: number;
    align: "left" | "center" | "right";
    display: "text" | "heatmap" | "bar" | "badge" | "avatar";
    format?: NativeNumberFormat;
  }>;
  rows: Array<{ id: string; cells: Record<string, NativeCell> }>;
  heatmap?: { min: number; max: number; color: string };
};
export type NativeChartData = {
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  kind: "line" | "area" | "bar" | "stacked-bar" | "diverging-bar" | "donut";
  categories: Array<{ id: string; label: string; color?: string }>;
  series: Array<{
    id: string;
    label: string;
    color: string;
    values: number[];
    renderAs?: "line" | "bar";
    dashed: boolean;
  }>;
  domain?: { min: number; max: number };
  format?: NativeNumberFormat;
  showLegend: boolean;
  showPoints: boolean;
  showAxes: boolean;
  showGrid: boolean;
  metrics: Array<{
    id: string;
    label: string;
    value: number;
    format?: NativeNumberFormat;
    color?: string;
  }>;
  annotation?: { categoryId: string; label: string; color?: string };
};
export type NativeData = NativeTableData | NativeChartData;
export type NativeDefinition = {
  id: string;
  name: string;
  kind: "table" | "chart";
  width: number;
  height: number;
  defaults: Record<string, unknown>;
  sources: Array<{ fileKey: string; nodeId: string; componentId: string }>;
  [key: string]: unknown;
};
export type NativeContract = ComponentContract & {
  defaults: NativeData;
  propsSchema: Record<string, unknown>;
};
export const nativeTableSchema: ZodType<NativeTableData>;
export const nativeChartSchema: ZodType<NativeChartData>;
export function parseNativeRegistry(entries: unknown): NativeDefinition[];
export function getNativeDefinition(
  catalog: NativeDefinition[],
  componentId: string,
): NativeDefinition;
export function parseNativeProps(
  definition: NativeDefinition,
  input?: unknown,
): NativeData;
export function getNativeContract(
  definition: NativeDefinition,
  input?: unknown,
): NativeContract;
export function validateNativeMotion(
  definition: NativeDefinition,
  input?: unknown,
  tracks?: unknown,
  durationFrames?: number,
): InternalMotionTrack[];
export function cellValue(cell: NativeCell): string | number | null;
export function chartSeriesKind(
  data: NativeChartData,
  series: NativeChartData["series"][number],
): "line" | "bar" | "area" | "donut";
