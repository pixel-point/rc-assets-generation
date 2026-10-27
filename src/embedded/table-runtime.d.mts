import type { CSSProperties } from "react";
import type { NativeMotion } from "../native/runtime.mjs";
import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
import type { SourceSvgAsset } from "./source-svg";
export type Bounds = { x: number; y: number; width: number; height: number };
export type TableField = {
  rowId: string;
  columnId: string;
  defaultValue: string | number | null;
  display?: "text" | "bar" | "avatar";
  align?: "left" | "center" | "right";
  defaultText: string;
  format: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    grouping?: boolean;
  };
  bar?: {
    trackKey: string;
    fillKey: string;
    width: number;
    defaultWidth: number;
  };
  paintBounds?: Bounds;
  bindings: Array<{
    nodeKey: string;
    bounds: Bounds;
    style?: CSSProperties;
    svgId?: string;
    fontSize?: number;
    baseline?: number;
    fontFamily?: string;
    textAnchor?: "start" | "middle";
    textX?: number;
    letterSpacing?: number;
    fill?: string;
  }>;
};
export type EmbeddedTableDefinition = {
  id: string;
  componentId: string;
  name: string;
  kind: "table";
  family: string;
  source: Record<string, unknown>;
  width: number;
  height: number;
  sourceHostKey?: string;
  tableBounds: Bounds;
  columns: Array<{ id: string; label: string }>;
  rows: Array<{ id: string; label: string }>;
  fields: TableField[];
  defaults: {
    columns: Record<string, string>;
    cells: Record<string, Record<string, string | number>>;
  };
  sourceTextBindings: Array<{
    rowId: string;
    columnId: string;
    nodeKeys: string[];
  }>;
  limitations: string[];
  structural?: TableStructural;
  defaultGrid?: {
    hostKey: string;
    placement: Bounds;
    area: Bounds;
    removedNodeKeys: string[];
    replacedNodeKeys: string[];
  };
  datasetLayout?: {
    columns: DatasetColumnLayout[];
    fields: TableField[];
    fontSize: number;
    rowHeight: number;
    padding: number;
  };
  paintAssets?: Array<{
    nodeKey: string;
    bounds: Bounds;
    asset: SourceSvgAsset;
    parts: PaintPart[];
  }>;
  paintPaths?: Array<{ svgId: string; bounds: Bounds; parts: PaintPart[] }>;
  svgAsset?: SourceSvgAsset;
  decorations?: Array<{
    nodeKey: string;
    bounds: Bounds;
    style?: CSSProperties;
    svgId?: string;
    rowId?: string;
    columnId?: string;
  }>;
};
export type EmbeddedTableInstance = {
  definition: EmbeddedTableDefinition;
  props: TableResolvedProps;
  sourceDefinition?: EmbeddedTableDefinition;
  contract: Record<string, unknown>;
  tracks: InternalMotionTrack[];
  frame: number;
  scopeId?: string;
  motion: NativeMotion;
};
export function parseEmbeddedTable(
  def: EmbeddedTableDefinition,
  props?: unknown,
): TableResolvedProps;
export function getEmbeddedTableContract(
  def: EmbeddedTableDefinition,
  props?: unknown,
): Record<string, unknown>;
export function validateEmbeddedTable(
  def: EmbeddedTableDefinition,
  props?: unknown,
  tracks?: unknown,
  durationFrames?: number,
): InternalMotionTrack[];
export function resolveEmbeddedTable(
  def: EmbeddedTableDefinition,
  props?: unknown,
  tracks?: unknown,
  frame?: number,
  durationFrames?: number,
): EmbeddedTableInstance;
export function tableFieldText(
  field: TableField,
  value: string | number | null,
): string;

export function tableTargetBounds(
  def: EmbeddedTableDefinition,
  target: string,
): Bounds;
export function tableMotionMatrix(
  instance: EmbeddedTableInstance,
  targets: string[],
): { matrix: number[]; opacity: number; changed: boolean };
export function tableElementStyle(
  instance: EmbeddedTableInstance,
  binding: { bounds: Bounds },
  targets: string[],
  base?: CSSProperties,
): CSSProperties;
export type PaintPart = { bounds: Bounds; rowId?: string; columnId?: string };

export type DatasetColumn = {
  id: string;
  label: string;
  weight: number;
  align: "left" | "center" | "right";
  display: "text" | "bar" | "avatar";
  format: TableField["format"];
};
export type DatasetColumnLayout = DatasetColumn & { x: number; width: number };
export type TableDataset = {
  columns: DatasetColumn[];
  rows: Array<{ id: string; cells: Record<string, string | number | null> }>;
};
export type TableResolvedProps = {
  dataset?: TableDataset;
  columns: Record<string, string>;
  cells: Record<string, Record<string, string | number | null>>;
};
export type TableStructural = {
  hostKey?: string;
  hostSize?: { width: number; height: number };
  maskStyle?: CSSProperties;
  area: Bounds;
  placement: Bounds;
  removedNodeKeys: string[];
  replacedNodeKeys: string[];
  svg: boolean;
  cohort: boolean;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  headerColor: string;
  color: string;
  gridColor: string;
  rowStripe: boolean;
  avatar: boolean;
  columns: Array<{ id: string; format: TableField["format"]; display: string }>;
};
export function datasetTableDefinition(
  source: EmbeddedTableDefinition,
  dataset: TableDataset,
  tracks?: InternalMotionTrack[],
): EmbeddedTableDefinition;
export function tableTextLines(
  text: string,
  fontSize: number,
  width: number,
  maxLines?: number,
): string[] | null;
