import type { CSSProperties } from "react";
import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
import type {
  NativeContract,
  NativeDefinition,
  NativeData,
} from "./schema.mjs";
export type NativeMotion = {
  style(target: string, base?: CSSProperties): CSSProperties;
  value(target: string, fallback: number): number;
  draw(target: string): number;
  progress(target: string): number;
  valueRange(target: string, fallback: number): [number, number];
};
export function createNativeMotion(
  contract: NativeContract,
  tracks: InternalMotionTrack[],
  frame: number,
): NativeMotion;
export function resolveNativeInstance(
  definition: NativeDefinition,
  input?: unknown,
  internalMotion?: unknown,
  frame?: number,
  durationFrames?: number,
): {
  definition: NativeDefinition;
  data: NativeData;
  contract: NativeContract;
  tracks: InternalMotionTrack[];
  motion: NativeMotion;
};
