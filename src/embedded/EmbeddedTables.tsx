import { staticFile } from "remotion";
import { tableDatasetContent, repairedSourceGrid } from "./TableDataset";
import {
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { sourceSvgTree } from "./source-svg";
import {
  tableElementStyle,
  tableFieldText,
  tableMotionMatrix,
  type EmbeddedTableInstance,
  type PaintPart,
  type Bounds,
  type TableField,
} from "./table-runtime.mjs";

type Props = Record<string, unknown> & {
  style?: CSSProperties;
  children?: ReactNode;
  src?: string;
};
const keyOf = (props: Props) =>
  String(props["data-edit-key"] ?? props["data-node-id"] ?? "");
const fieldsTargets = (rowId?: string, columnId?: string) => [
  "table",
  ...(rowId ? [rowId === "header" ? "header" : `row:${rowId}`] : []),
  ...(columnId ? [`column:${columnId}`] : []),
  ...(rowId && rowId !== "header" && columnId
    ? [`cell:${rowId}:${columnId}`]
    : []),
];
const fieldValue = (instance: EmbeddedTableInstance, field: TableField) => {
  const value =
    field.rowId === "header"
      ? instance.props.columns[field.columnId]
      : instance.props.cells[field.rowId][field.columnId];
  return typeof value === "number"
    ? instance.motion.value(`cell:${field.rowId}:${field.columnId}`, value)
    : value;
};

const cloneChildren = (
  node: ReactElement<Props>,
  patch: Props,
  children: ReactNode,
): ReactElement<Props> => {
  if (children === node.props.children) return cloneElement(node, patch);
  if (Array.isArray(children)) {
    const clone = cloneElement(node, patch, ...children);
    return children.length > 1 ? clone : cloneElement(clone, { children });
  }
  return cloneElement(node, patch, children);
};
const sourceAttributes = (node: ReactElement<Props>) =>
  Object.fromEntries(
    Object.entries(node.props).filter(
      ([key]) => key.startsWith("data-") || key.startsWith("aria-"),
    ),
  );

/** Patches source cells in place. Source layout, transforms and parent masks stay authoritative. */
export function applyEmbeddedTables(
  tree: ReactNode,
  componentId: string,
  instances: EmbeddedTableInstance[],
): ReactNode {
  let result = tree;
  for (const instance of instances.filter(
    (i) => i.definition.componentId === componentId,
  )) {
    const def = instance.definition;
    const structural = instance.props.dataset ? def.structural : undefined;
    const removed = new Set(
      structural?.removedNodeKeys ?? def.defaultGrid?.removedNodeKeys ?? [],
    );
    let insertedSvgDataset = false;
    const datasetSvg = () =>
      createElement(
        "svg",
        {
          key: "embedded-dataset",
          "data-table-dataset-host": true,
          width: structural!.area.width,
          height: structural!.area.height,
          viewBox: `0 0 ${structural!.area.width} ${structural!.area.height}`,
          style: {
            position: "absolute",
            left: structural!.placement.x,
            top: structural!.placement.y,
            overflow: "visible",
            ...structural!.maskStyle,
            ...(structural!.maskStyle?.maskImage
              ? {
                  maskImage: String(structural!.maskStyle.maskImage).replace(
                    /url\(["']?([^"')]+)["']?\)/g,
                    (_all, src: string) => `url("${staticFile(src)}")`,
                  ),
                }
              : {}),
          },
        },
        tableDatasetContent(instance),
      );
    const defaultGridSvg = () => {
      const grid = def.defaultGrid!;
      return createElement(
        "svg",
        {
          key: "embedded-repaired-grid",
          width: grid.area.width,
          height: grid.area.height,
          viewBox: `${grid.area.x} ${grid.area.y} ${grid.area.width} ${grid.area.height}`,
          style: {
            position: "absolute",
            left: grid.placement.x,
            top: grid.placement.y,
            overflow: "visible",
          },
        },
        repairedSourceGrid(instance),
      );
    };
    const fields = new Map(
      def.fields.flatMap((field) =>
        field.bindings.map(
          (binding) => [binding.nodeKey, { field, binding }] as const,
        ),
      ),
    );
    const decorations = new Map(
      (def.decorations ?? []).map((item) => [item.nodeKey, item]),
    );
    const bars = new Map<string, { field: TableField; track: boolean }>(
      def.fields
        .filter((f) => f.bar)
        .flatMap(
          (field) =>
            [
              [field.bar!.trackKey, { field, track: true }],
              [field.bar!.fillKey, { field, track: false }],
            ] as const,
        ),
    );
    const safeTargets = (part: PaintPart) =>
      fieldsTargets(part.rowId, part.columnId).filter(
        (t) =>
          !t.startsWith("cell:") ||
          def.fields.some((f) => t === `cell:${f.rowId}:${f.columnId}`),
      );
    const stripIds = (node: ReactNode): ReactNode =>
      Array.isArray(node)
        ? node.map(stripIds)
        : isValidElement<Props>(node)
          ? cloneChildren(
              node,
              { id: undefined },
              stripIds(node.props.children),
            )
          : node;
    function fragmentPaint(
      content: ReactNode,
      parts: PaintPart[],
      origin: Bounds,
      id: string,
      scaleX = 1,
      scaleY = 1,
    ): ReactNode {
      return parts.map((part, index) => {
        const state = tableMotionMatrix(instance, safeTargets(part)),
          [a, b, c, d, e, f] = state.matrix,
          rect = part.bounds,
          clip = `embedded-table-${(instance.scopeId ?? componentId).replace(/[^a-zA-Z0-9_-]/g, "")}-${id}-${index}`;
        const transform = [
          a,
          (b * scaleY) / scaleX,
          (c * scaleX) / scaleY,
          d,
          (e + (a - 1) * origin.x + c * origin.y) * scaleX,
          (f + b * origin.x + (d - 1) * origin.y) * scaleY,
        ];
        return createElement(
          "g",
          {
            key: index,
            transform: `matrix(${transform.join(" ")})`,
            opacity: state.opacity,
          },
          createElement(
            "defs",
            null,
            createElement(
              "clipPath",
              { id: clip },
              createElement("rect", {
                x: (rect.x - origin.x) * scaleX,
                y: (rect.y - origin.y) * scaleY,
                width: rect.width * scaleX,
                height: rect.height * scaleY,
              }),
            ),
          ),
          createElement("g", { clipPath: `url(#${clip})` }, stripIds(content)),
        );
      });
    }
    function paintAsset(
      node: ReactElement<Props>,
      paint: NonNullable<typeof def.paintAssets>[number],
    ): ReactNode {
      const native = sourceSvgTree(
          paint.asset,
          node.props.style,
          instance.scopeId ?? componentId,
        ) as ReactElement<Props>,
        svg = native.props.children as ReactElement<Props>;
      if (
        !paint.parts.some(
          (p) => tableMotionMatrix(instance, safeTargets(p)).changed,
        )
      )
        return cloneElement(native, {
          key: node.key,
          ...sourceAttributes(node),
        });
      const items = [svg.props.children].flat(Infinity) as ReactNode[],
        defs = items.filter((n) => isValidElement(n) && n.type === "defs"),
        content = items.filter((n) => !isValidElement(n) || n.type !== "defs");
      return cloneElement(native, {
        key: node.key,
        ...sourceAttributes(node),
        children: cloneElement(svg, {
          children: [
            ...defs,
            fragmentPaint(
              content,
              paint.parts,
              paint.bounds,
              paint.nodeKey.replace(/[^a-zA-Z0-9_-]/g, ""),
              paint.asset.width / paint.bounds.width,
              paint.asset.height / paint.bounds.height,
            ),
          ],
        }),
      });
    }
    function visit(
      node: ReactNode,
      insideSvg = false,
      suppressed = false,
    ): ReactNode {
      if (Array.isArray(node)) {
        const children = node.map((child) =>
          visit(child, insideSvg, suppressed),
        );
        return children.every((child, index) => child === node[index])
          ? node
          : children;
      }
      if (!isValidElement<Props>(node)) return node;
      const props = node.props;
      const earlyKey = keyOf(props),
        earlySvgId = props["data-source-svg-id"];
      if (structural?.svg && earlySvgId && removed.has(String(earlySvgId))) {
        if (insertedSvgDataset) return null;
        insertedSvgDataset = true;
        return createElement(
          "g",
          {
            key: node.key,
            transform: `translate(${structural.area.x} ${structural.area.y})`,
          },
          tableDatasetContent(instance),
        );
      }
      if (!structural?.svg && removed.has(earlyKey)) return null;
      if (structural && !structural.svg && earlyKey === structural.hostKey) {
        const original = [props.children].flat(Infinity) as ReactNode[];
        const retained = original.filter(
          (child) =>
            !isValidElement<Props>(child) || !removed.has(keyOf(child.props)),
        );
        return cloneChildren(
          node,
          {
            style:
              props.style?.display === "contents"
                ? props.style
                : {
                    ...props.style,
                    width: props.style?.width ?? structural.hostSize?.width,
                    height: props.style?.height ?? structural.hostSize?.height,
                  },
          },
          [...retained, datasetSvg()],
        );
      }
      if (
        !structural &&
        def.defaultGrid &&
        earlyKey === def.defaultGrid.hostKey
      ) {
        const children = visit(props.children, insideSvg, suppressed);
        return cloneChildren(node, {}, [
          defaultGridSvg(),
          ...(Array.isArray(children) ? children : [children]),
        ]);
      }
      const paint = def.paintAssets?.find(
        (p) =>
          typeof props.src === "string" &&
          (props.src === p.asset.src || props.src.endsWith("/" + p.asset.src)),
      );
      if (paint) return paintAsset(node, paint);
      if (
        def.svgAsset &&
        typeof props.src === "string" &&
        (props.src === def.svgAsset.src ||
          props.src.endsWith("/" + def.svgAsset.src))
      ) {
        return cloneElement(
          visit(
            sourceSvgTree(
              def.svgAsset,
              props.style,
              instance.scopeId ?? componentId,
            ),
            true,
          ) as ReactElement,
          { key: node.key, ...sourceAttributes(node) },
        );
      }
      const svgId = props["data-source-svg-id"],
        isSvg = insideSvg || node.type === "svg",
        key = svgId ? "svg:" + svgId : keyOf(props),
        entry = fields.get(key),
        decoration = decorations.get(key);
      const paintPath = def.paintPaths?.find((p) => p.svgId === svgId);
      if (
        paintPath &&
        paintPath.parts.some(
          (p) => tableMotionMatrix(instance, safeTargets(p)).changed,
        )
      )
        return fragmentPaint(
          node,
          paintPath.parts,
          { x: 0, y: 0, width: 0, height: 0 },
          String(svgId),
        );
      const nextProps: Props = {};
      let children = props.children,
        changed = false;
      const targets = (
        entry
          ? fieldsTargets(entry.field.rowId, entry.field.columnId)
          : decoration
            ? fieldsTargets(decoration.rowId, decoration.columnId)
            : []
      ).filter(
        (t) =>
          !t.startsWith("cell:") ||
          def.fields.some((f) => t === `cell:${f.rowId}:${f.columnId}`),
      );
      const binding = entry?.binding ?? decoration;
      if (entry) {
        const { field, binding } = entry,
          value = fieldValue(instance, field),
          edited = value !== field.defaultValue;
        if (binding.svgId) {
          const content: ReactNode = edited
            ? createElement(
                "text",
                {
                  x: binding.textX ?? binding.bounds.x,
                  y:
                    binding.baseline ??
                    binding.bounds.y + binding.bounds.height,
                  fontFamily: binding.fontFamily,
                  fontSize: binding.fontSize,
                  fontWeight: 400,
                  fill: binding.fill ?? props.fill,
                  textAnchor: binding.textAnchor ?? "start",
                  letterSpacing: binding.letterSpacing,
                },
                String(tableFieldText(field, value))
                  .split("\n")
                  .map((line, index, all) =>
                    createElement(
                      "tspan",
                      {
                        key: index,
                        x: binding.textX ?? binding.bounds.x,
                        dy:
                          index === 0
                            ? -(all.length - 1) * (binding.fontSize ?? 12) * 1.1
                            : (binding.fontSize ?? 12) * 1.1,
                      },
                      line,
                    ),
                  ),
              )
            : node;
          const motion = tableMotionMatrix(instance, targets);
          if (!edited && !motion.changed) return node;
          return createElement(
            "g",
            {
              key: node.key,
              transform: motion.changed
                ? `matrix(${motion.matrix.join(" ")})`
                : undefined,
              opacity: motion.opacity,
              "data-table-cell": `${field.rowId}:${field.columnId}`,
            },
            content,
          );
        }
        if (edited) {
          const text = tableFieldText(field, value);
          children = text;
          changed = true;
        }
      }
      if (binding && !suppressed && targets.length) {
        if (isSvg) {
          const motion = tableMotionMatrix(instance, targets);
          if (motion.changed)
            return createElement(
              "g",
              {
                key: node.key,
                transform: `matrix(${motion.matrix.join(" ")})`,
                opacity: motion.opacity,
              },
              node,
            );
        } else {
          const style = tableElementStyle(
            instance,
            binding,
            targets,
            props.style,
          );
          if (style !== props.style) {
            nextProps.style = style;
            changed = true;
          }
        }
      }
      const bar = bars.get(key);
      if (bar) {
        const value = fieldValue(instance, bar.field);
        if (typeof value === "number" && value !== bar.field.defaultValue) {
          nextProps.style = {
            ...(nextProps.style ?? props.style),
            ...(bar.track
              ? { paddingRight: 0 }
              : {
                  width:
                    bar.field.bar!.width *
                    Math.max(0, Math.min(1, value / 100)),
                }),
          };
          changed = true;
        }
      }
      const nextChildren = visit(children, isSvg, suppressed || !!decoration);
      if (nextChildren !== props.children) {
        changed = true;
      }
      return changed ? cloneChildren(node, nextProps, nextChildren) : node;
    }
    result = visit(result);
  }
  return result;
}
