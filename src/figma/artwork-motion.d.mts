import type { ReactNode } from "react";
import type { ArtworkMotionBindings } from "../composition/internal-motion.mjs";
export function applyArtworkMotion(
  tree: ReactNode,
  componentId: string,
  bindings: ArtworkMotionBindings,
): ReactNode;
