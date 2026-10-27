import type {
  ComponentContract,
  ComponentContracts,
  ComponentProps,
} from "./schema.mjs";
export type InternalMotionProperty =
  | "translateX"
  | "translateY"
  | "rotate"
  | "scale"
  | "opacity"
  | "revealX"
  | "revealY"
  | "counter"
  | "draw"
  | "progress"
  | "value";
export type InternalMotionEasing = "linear" | "ease-out" | "ease-in-out";
export type InternalMotionTrack = {
  target: string;
  property: InternalMotionProperty;
  keyframes: Array<{
    frame: number;
    value: number;
    easing?: InternalMotionEasing;
  }>;
  easing?: InternalMotionEasing;
  format?: { decimals?: number; prefix?: string; suffix?: string };
};
export type MotionTarget = {
  label: string;
  componentId: string;
  nodeId: string;
  properties: InternalMotionProperty[];
  aliases: string[];
};
export type ArtworkMotionBindings = Map<
  string,
  Map<
    string,
    Partial<Record<Exclude<InternalMotionProperty, "counter">, number>> & {
      counter?: string;
    }
  >
>;
export function resolveMotionTarget(
  contract: ComponentContract,
  selector: string,
): MotionTarget;
export function validateInternalMotion(
  contracts: ComponentContracts,
  componentId: string,
  input?: unknown,
  durationFrames?: number,
  props?: ComponentProps,
): InternalMotionTrack[];
export function internalTrackValueAtFrame(
  track: InternalMotionTrack,
  frame: number,
): number;
export function createInternalMotionBindings(
  contracts: ComponentContracts,
  componentId: string,
  tracks: InternalMotionTrack[],
  frame: number,
): ArtworkMotionBindings;
export const internalMotionSchema: import("zod").ZodType<InternalMotionTrack[]>;
