import { createContext, useContext, type ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { applyArtworkEdits, type ArtworkBindings } from "./editable-tree.mjs";
import { applyArtworkMotion } from "./artwork-motion.mjs";
import { applyEmbeddedTables } from "../embedded/EmbeddedTables";
import { applyEmbeddedCharts } from "../embedded/EmbeddedCharts";
import type { EmbeddedInstances } from "../embedded/runtime.mjs";
import type { ArtworkMotionBindings } from "../composition/internal-motion.mjs";

const ArtworkEditContext = createContext<{
  bindings: ArtworkBindings;
  motionBindings?: ArtworkMotionBindings;
  embeddedInstances?: EmbeddedInstances;
} | null>(null);

function renderImageSlot(src: string) {
  return (
    <Img
      src={staticFile(src)}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  );
}

export function EditableArtworkProvider({
  bindings,
  motionBindings,
  embeddedInstances,
  children,
}: {
  bindings: ArtworkBindings;
  motionBindings?: ArtworkMotionBindings;
  embeddedInstances?: EmbeddedInstances;
  children: ReactNode;
}) {
  return (
    <ArtworkEditContext.Provider value={{ bindings, motionBindings, embeddedInstances }}>
      {children}
    </ArtworkEditContext.Provider>
  );
}

/** This boundary adds no DOM box and preserves the original tree without edits. */
export function EditableArtwork({
  componentId,
  children,
}: {
  componentId: string;
  children: ReactNode;
}) {
  const context = useContext(ArtworkEditContext);
  const instances = context?.embeddedInstances?.get(componentId) ?? [];
  const nativeTables = applyEmbeddedTables(children, componentId,
    instances.filter(instance => instance.definition.kind === "table") as Parameters<typeof applyEmbeddedTables>[2]);
  const native = applyEmbeddedCharts(nativeTables, componentId,
    instances.filter(instance => instance.definition.kind === "chart") as Parameters<typeof applyEmbeddedCharts>[2]);
  const edited = context
    ? applyArtworkEdits(
        native,
        componentId,
        context.bindings,
        renderImageSlot,
      )
    : native;
  return context?.motionBindings
    ? applyArtworkMotion(edited, componentId, context.motionBindings)
    : edited;
}
