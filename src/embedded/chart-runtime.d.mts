import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
import type { NativeMotion } from "../native/runtime.mjs";
import type { SourceSvgAsset } from "./source-svg";
export type SourcePoint = { x: number; y: number; value: number };
export type PathInstruction = {
  type: "M" | "L" | "C" | "Z";
  x?: number;
  y?: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
};
export type ChartPath = {
  id: string;
  d: string;
  instructions: PathInstruction[];
  unitsPerPixel: number;
  pinY?: number;
  dynamicStyle?: Record<string, string | number>;
  interpolation?: "linear" | "smooth";
};
export type ChartBinding = {
  assetSrc: string;
  seriesId: string;
  valueIndices?: number[];
  points: SourcePoint[];
  unitsPerPixel: number;
  paths: ChartPath[];
  markers: Array<{ id: string; x: number; y: number }>;
  dynamicMarkers?: Array<{ id: string; x: number; y: number }>;
  markerMode?: "focus";
  markerTemplateId?: string;
  externalMarkers?: {
    nodeKeys: string[];
    radius: number;
    fill: string;
    src: string;
    sha256: string;
  };
  minX: number;
  maxX: number;
  calibration?: { zeroY: number };
  categoryBands?: boolean;
};
export type ChartBar = {
  nodeId: string;
  seriesId: string;
  index: number;
  height: number;
  unitsPerPixel: number;
  sign: number;
  origin: "top" | "bottom";
  parentKey?: string;
  parentHeight?: number;
  stackId?: string;
  top?: number;
};
export type ChartSeries = {
  id: string;
  label: string;
  valueMeaning?: string;
  type: "line" | "bar" | "donut";
  values: number[];
  range: { min: number; max: number };
  ranges?: Array<{ min: number; max: number }>;
};
export type EmbeddedChartDefinition = {
  id: string;
  componentId: string;
  name: string;
  kind: "chart";
  chartType?: string;
  units: string;
  source: Record<string, unknown>;
  limitations: string[];
  series: ChartSeries[];
  assets: SourceSvgAsset[];
  bindings: ChartBinding[];
  bars: ChartBar[];
  stacks?: Array<{
    id: string;
    max: number;
    items: Array<{ seriesId: string; index: number }>;
    axisAnchors?: Array<{ value: number; y: number }>;
  }>;
  dynamic?: {
    maxPoints: number;
    replacedNodeKeys: string[];
    barLayouts: DynamicBarLayout[];
    stackMaximum?: number;
  };
  donut?: {
    baseSrc: string;
    hiddenSources: string[];
    cx: number;
    cy: number;
    radius: number;
    innerRadius: number;
    startAngle: number;
    colors: string[];
  };
};
export type DynamicBarLayout = {
  hostKey: string;
  clearHostKeys: string[];
  mode: "stacked" | "grouped" | "single";
  left: number;
  width: number;
  baseline: number;
  direction: number;
  seriesOrder: string[];
  templates: Array<{
    seriesId: string;
    style: import("react").CSSProperties;
    unitsPerPixel: number;
  }>;
  axisAnchors?: Array<{ value: number; y: number }>;
};
export type ChartProps = {
  values: Record<string, number[]>;
  pointIds: Record<string, string[]>;
};
export type EmbeddedChartInstance = {
  definition: EmbeddedChartDefinition;
  props: ChartProps;
  data: ChartProps;
  tracks: InternalMotionTrack[];
  motion: NativeMotion;
  scopeId?: string;
};
export function getEmbeddedChartContract(
  definition: EmbeddedChartDefinition,
  props?: unknown,
): {
  defaults: ChartProps;
  motionTargets: Record<string, unknown>;
  propsSchema: unknown;
  [key: string]: unknown;
};
export function validateEmbeddedChart(
  definition: EmbeddedChartDefinition,
  props?: unknown,
  tracks?: unknown,
  durationFrames?: number,
): InternalMotionTrack[];
export function resolveEmbeddedChart(
  definition: EmbeddedChartDefinition,
  props?: unknown,
  tracks?: unknown,
  frame?: number,
  durationFrames?: number,
): EmbeddedChartInstance;
export function chartOffset(
  points: SourcePoint[],
  values: number[],
  unitsPerPixel: number,
  x: number,
): number;
export function deformChartPath(
  binding: ChartPath,
  points: SourcePoint[],
  values: number[],
): string;

export function sourceAxisValue(
  anchors: Array<{ value: number; y: number }>,
  y: number,
): number;
export function sourceAxisY(
  anchors: Array<{ value: number; y: number }>,
  value: number,
): number;
export function resolveChartBarGeometry(
  instance: EmbeddedChartInstance,
): Map<string, { height: number; top?: number }>;

export function chartPointId(
  instance: EmbeddedChartInstance,
  seriesId: string,
  index: number,
): string;
export function embeddedChartStructure(
  definition: EmbeddedChartDefinition,
  props?: unknown,
): { resized: boolean; replacedNodeKeys: string[] };
export function dynamicChartPoints(
  binding: ChartBinding,
  values: number[],
): Array<{ x: number; y: number; index: number | null }>;
export function dynamicChartPath(
  path: ChartPath,
  points: Array<{ x: number; y: number }>,
): string;
export function resolveDynamicChartBars(
  instance: EmbeddedChartInstance,
  layout: DynamicBarLayout,
): Array<{
  target: string;
  seriesId: string;
  pointId: string;
  index: number;
  style: import("react").CSSProperties;
}>;
