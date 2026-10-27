import { cloneElement, isValidElement } from "react";

/** Keep every authored box/transform/asset. Only declared native nodes are patched. */
export function applyArtworkMotion(tree, componentId, bindings) {
  const nodes = bindings.get(componentId);
  if (!nodes?.size) return tree;
  function visit(value) {
    if (Array.isArray(value)) {
      const next = value.map(visit);
      return next.every((child, index) => child === value[index])
        ? value
        : next;
    }
    if (!isValidElement(value)) return value;
    const motion = nodes.get(
      value.props["data-edit-key"] ?? value.props["data-node-id"],
    );
    const originalChildren = value.props.children;
    const children =
      motion?.counter !== undefined ? motion.counter : visit(originalChildren);
    let style = value.props.style;
    if (motion) {
      const translateX = motion.translateX ?? 0;
      const translateY = motion.translateY ?? 0;
      const rotate = motion.rotate ?? 0;
      const scale = motion.scale ?? 1;
      if (translateX !== 0 || translateY !== 0 || rotate !== 0 || scale !== 1) {
        // Parent-local motion precedes the untouched authored transform, using
        // the existing transform origin. Neutral frames preserve exact styles.
        const native =
          style?.transform && style.transform !== "none"
            ? ` ${style.transform}`
            : "";
        style = {
          ...style,
          transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})${native}`,
          willChange: "transform",
        };
      }
      if (motion.opacity !== undefined && motion.opacity !== 1)
        style = {
          ...style,
          opacity: Number(style?.opacity ?? 1) * motion.opacity,
        };
      const revealX = motion.revealX ?? 1;
      const revealY = motion.revealY ?? 1;
      if (revealX !== 1 || revealY !== 1) {
        if (style?.clipPath && style.clipPath !== "none")
          throw new Error(
            "Cannot replace an authored clipPath with an internal reveal.",
          );
        style = {
          ...style,
          clipPath: `inset(0 ${(1 - revealX) * 100}% ${(1 - revealY) * 100}% 0)`,
        };
      }
      if (motion.counter !== undefined)
        style = { ...style, fontVariantNumeric: "tabular-nums" };
    }
    if (style === value.props.style && children === originalChildren)
      return value;
    const patch = style === value.props.style ? {} : { style };
    if (children === originalChildren) return cloneElement(value, patch);
    if (Array.isArray(children)) {
      const cloned = cloneElement(value, patch, ...children);
      return children.length > 1 ? cloned : cloneElement(cloned, { children });
    }
    return cloneElement(value, patch, children);
  }
  return visit(tree);
}
