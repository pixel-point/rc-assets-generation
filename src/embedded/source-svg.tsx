import {
  createElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

export type SourceSvgNode = {
  tag: string;
  attrs: Record<string, string>;
  children: Array<SourceSvgNode | string>;
};
export type SourceSvgAsset = {
  src: string;
  width: number;
  height: number;
  tree: SourceSvgNode;
};
const attributeName = (key: string) =>
  key === "class"
    ? "className"
    : key === "xmlns:xlink"
      ? "xmlnsXlink"
      : key === "xlink:href"
        ? "xlinkHref"
        : key.startsWith("data-") || key.startsWith("aria-")
          ? key
          : key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
const sourceStyle = (value: string) =>
  Object.fromEntries(
    value
      .split(";")
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf(":");
        return [
          attributeName(item.slice(0, index).trim()),
          item.slice(index + 1).trim(),
        ];
      }),
  );

/** Plain React tree: table and chart patches can cooperate on a shared source SVG. */
export function sourceSvgTree(
  asset: SourceSvgAsset,
  style: CSSProperties = {},
  scopeId = "source",
): ReactElement {
  const prefix = `embedded-${scopeId.replace(/[^a-zA-Z0-9_-]/g, "")}-${asset.src.replace(/[^a-zA-Z0-9_-]/g, "")}-`;
  const visit = (node: SourceSvgNode | string, index: number): ReactNode => {
    if (typeof node === "string") return node;
    const props: Record<string, unknown> = { key: index };
    for (const [key, value] of Object.entries(node.attrs)) {
      if (key === "style") {
        props.style = sourceStyle(
          value.replace(
            /url\(#([^)]+)\)/g,
            (_, id: string) => `url(#${prefix}${id})`,
          ),
        );
        continue;
      }
      props[attributeName(key)] =
        key === "id"
          ? prefix + value
          : value
              .replace(
                /url\(#([^)]+)\)/g,
                (_, id: string) => `url(#${prefix}${id})`,
              )
              .replace(
                /^#(.+)$/,
                key.endsWith("href") ? `#${prefix}$1` : "#$1",
              );
    }
    if (node.attrs.id) props["data-source-svg-id"] = node.attrs.id;
    if (node.tag === "svg") {
      props.width = "100%";
      props.height = "100%";
      props.style = {
        ...(props.style as CSSProperties),
        position: "absolute",
        display: "block",
        left: 0,
        top: 0,
        maxWidth: "none",
      };
      props.preserveAspectRatio = "none";
    }
    return createElement(node.tag, props, ...node.children.map(visit));
  };
  return createElement(
    "span",
    {
      "data-embedded-asset": asset.src,
      style: {
        ...style,
        display: "block",
        position: style.position ?? "relative",
        overflow: style.borderRadius ? "hidden" : style.overflow,
      },
    },
    visit(asset.tree, 0),
  );
}
