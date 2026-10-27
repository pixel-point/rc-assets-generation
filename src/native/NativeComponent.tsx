import "../fonts";
import type { InternalMotionTrack } from "../composition/internal-motion.mjs";
import { NativeChart } from "./NativeChart";
import { NativeTable } from "./NativeTable";
import { nativeCatalog } from "./catalog";
import {
  getNativeDefinition,
  type NativeTableData,
  type NativeChartData,
} from "./schema.mjs";
import { resolveNativeInstance } from "./runtime.mjs";

/** Native IDs opt into data-driven geometry; imported source IDs keep their original renderer. */
export function NativeComponent({
  componentId,
  props,
  internalMotion,
  frame = 0,
  durationFrames = 1800,
}: {
  componentId: string;
  props?: Record<string, unknown>;
  internalMotion?: InternalMotionTrack[];
  frame?: number;
  durationFrames?: number;
}) {
  const instance = resolveNativeInstance(
    getNativeDefinition(nativeCatalog, componentId),
    props,
    internalMotion,
    frame,
    durationFrames,
  );
  return instance.definition.kind === "table" ? (
    <NativeTable
      data={instance.data as NativeTableData}
      motion={instance.motion}
    />
  ) : (
    <NativeChart
      data={instance.data as NativeChartData}
      motion={instance.motion}
    />
  );
}
