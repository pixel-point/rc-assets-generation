import type { ReactNode } from "react";
import type {
  ComponentContracts,
  ComponentProps,
} from "../composition/schema.mjs";

export type ArtworkBindings = Map<
  string,
  Map<string, Map<string, string | boolean>>
>;
export function createEditableBindings(
  contracts: ComponentContracts,
  componentId: string,
  props?: ComponentProps,
): ArtworkBindings;
export function applyArtworkEdits(
  tree: ReactNode,
  componentId: string,
  bindings: ArtworkBindings,
  renderImage?: (src: string) => ReactNode,
): ReactNode;
