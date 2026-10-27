import type { InternalMotionTrack, MotionTarget } from "./internal-motion.mjs";
export { validateInternalMotion } from "./internal-motion.mjs";
export type { InternalMotionTrack, MotionTarget } from "./internal-motion.mjs";
import type { ZodObject, ZodType } from "zod";
import type { EmbeddedInput, EmbeddedRegistry } from "../embedded/runtime.mjs";

export interface AssetDefinition {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  [key: string]: unknown;
}
export type ComponentProps = Record<string, string | boolean>;
export type ComponentField = {
  type: "text" | "color" | "boolean" | "image";
  label: string;
  default: string | boolean;
  maxLength?: number;
  fit?: "contain";
  width?: number;
  height?: number;
  targets: Array<{ componentId: string; nodeId: string; property: string }>;
};
export type ComponentContract = {
  id: string;
  name: string;
  fields: Record<string, ComponentField>;
  limitations: string[];
  motionTargets?: Record<string, MotionTarget>;
};
export type ComponentContracts = {
  schemaVersion: number;
  components: Record<string, ComponentContract>;
};
export function validateComponentProps(
  contracts: ComponentContracts,
  componentId: string,
  input?: unknown,
): ComponentProps;
export interface IllustrationDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  [key: string]: unknown;
}
export type BrandColor =
  | "transparent"
  | "#FFFFFF"
  | "#F9F9FB"
  | "#1F1F47"
  | "#3D3D5C"
  | "#94979E"
  | "#B8C2E0"
  | "#D5D9DD"
  | "#F2545B"
  | "#576CDB"
  | "#11D483"
  | "#E4E5E7"
  | "#EDF0F2"
  | "#E3E5E8";
export type FontName = "heading" | "body" | "body-light";
export type EnterMotion = { easing?: "ease-out" | "ease-in-out" } & (
  | { type: "fade"; durationFrames: number }
  | { type: "slide"; durationFrames: number; x: number; y: number }
  | { type: "scale"; durationFrames: number; from: number }
);
export type FloatMotion = {
  amplitudeX: number;
  amplitudeY: number;
  periodFrames: number;
  phaseDegrees: number;
};
export interface LayerTransform {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  startFrame: number;
  durationFrames?: number;
  enter?: EnterMotion;
  float?: FloatMotion;
}
export type AssetLayer = LayerTransform & { type: "asset"; assetId: string };
export type IllustrationLayer = LayerTransform & {
  type: "illustration";
  illustrationId: string;
  data?: EmbeddedInput;
  props?: ComponentProps;
  internalMotion?: InternalMotionTrack[];
};
export type NativeLayer = LayerTransform & {
  type: "native";
  componentId: string;
  props?: Record<string, unknown>;
  internalMotion?: InternalMotionTrack[];
};
export type TextLayer = LayerTransform & {
  type: "text";
  text: string;
  width: number;
  font: FontName;
  fontSize: number;
  lineHeight: number;
  color: BrandColor;
  align: "left" | "center" | "right";
};
export type GroupLayer = LayerTransform & {
  type: "group";
  layers: SceneLayer[];
};
export type SceneLayer =
  | AssetLayer
  | IllustrationLayer
  | NativeLayer
  | TextLayer
  | GroupLayer;
export type SceneProps = {
  title: string;
  width: number;
  height: number;
  fps: 30;
  durationFrames: number;
  posterFrame?: number;
  background: BrandColor;
  layers: SceneLayer[];
};
export const BRAND_COLORS: BrandColor[];
export const BRAND_FONTS: Record<
  FontName,
  { fontFamily: string; fontWeight: number }
>;
export function parseAssetCatalog(catalog: unknown): AssetDefinition[];
export function parseIllustrationCatalog(
  catalog: unknown,
): IllustrationDefinition[];
type SceneShape = {
  [K in keyof SceneProps]-?: ZodType<SceneProps[K], SceneProps[K]>;
};
/** Runtime validator. Do not pass the recursive schema to Remotion's optional Composition.schema prop. */
export function createSceneSchema(
  catalog: unknown,
  illustrationCatalog?: unknown,
  componentContracts?: ComponentContracts,
  nativeCatalog?: unknown,
  embeddedRegistry?: EmbeddedRegistry,
): ZodObject<SceneShape>;
export function layerStateAtFrame(
  layer: LayerTransform,
  parentFrame: number,
  parentDuration: number,
): null | {
  frame: number;
  durationFrames: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
};
