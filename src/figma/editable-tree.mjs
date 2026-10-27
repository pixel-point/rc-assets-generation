import { cloneElement, isValidElement } from "react";

/** Resolve public fields once per artwork instance, never through global state. */
export function createEditableBindings(contracts, componentId, props = {}) {
  const contract = Object.hasOwn(contracts.components, componentId)
    ? contracts.components[componentId]
    : undefined;
  if (!contract) throw new Error(`Unknown editable component: ${componentId}`);
  const bindings = new Map();
  for (const [key, value] of Object.entries(props)) {
    const field = Object.hasOwn(contract.fields, key)
      ? contract.fields[key]
      : undefined;
    if (!field) throw new Error(`Unknown field ${key} on ${componentId}`);
    // Empty image overrides explicitly restore the authored children.
    if (field.type === "image" && value === "") continue;
    for (const target of field.targets) {
      let component = bindings.get(target.componentId);
      if (!component) bindings.set(target.componentId, (component = new Map()));
      let node = component.get(target.nodeId);
      if (!node) component.set(target.nodeId, (node = new Map()));
      if (node.has(target.property) && node.get(target.property) !== value) {
        throw new Error(
          `Conflicting edits for ${target.componentId}:${target.nodeId}:${target.property}`,
        );
      }
      node.set(target.property, value);
    }
  }
  return bindings;
}

/** Transform only supplied React children. Never invoke component functions. */
export function applyArtworkEdits(tree, componentId, bindings, renderImage) {
  const nodes = bindings.get(componentId);
  if (!nodes?.size) return tree;

  function visit(value, hidden = false) {
    if (Array.isArray(value)) {
      const children = value.map((child) => visit(child, hidden));
      return children.every((child, index) => child === value[index])
        ? value
        : children;
    }
    if (!isValidElement(value)) return value;
    const nodeId = value.props["data-edit-key"] ?? value.props["data-node-id"];
    const edits = nodes.get(nodeId);
    const hide = hidden || edits?.get("visible") === false;
    const originalChildren = value.props.children;
    let children;
    if (edits?.has("image")) {
      if (!renderImage) throw new Error("Image slot renderer is missing.");
      children = renderImage(edits.get("image"));
    } else {
      children = edits?.has("text")
        ? edits.get("text")
        : visit(originalChildren, hide);
    }
    let style = value.props.style;
    if (edits) {
      for (const [property, edit] of edits) {
        if (
          property !== "text" &&
          property !== "visible" &&
          property !== "image"
        ) {
          if (style?.[property] !== edit)
            style = { ...style, [property]: edit };
        }
      }
    }
    // Hide descendants too: a child's explicit visibility must not reveal part
    // of a hidden group. This also works on display:contents source wrappers.
    if (hide && style?.visibility !== "hidden")
      style = { ...style, visibility: "hidden" };
    if (style === value.props.style && children === originalChildren)
      return value;
    const patch = style === value.props.style ? {} : { style };
    if (children === originalChildren) return cloneElement(value, patch);
    if (Array.isArray(children)) {
      // Pass authored siblings as child arguments so React retains static JSX
      // key validation. Nested arrays stay nested; explicit keys stay intact.
      const cloned = cloneElement(value, patch, ...children);
      // React's variadic API collapses a one-item array and ignores an empty
      // array, so restore those exact array shapes after validating siblings.
      return children.length > 1 ? cloned : cloneElement(cloned, { children });
    }
    return cloneElement(value, patch, children);
  }

  return visit(tree);
}
