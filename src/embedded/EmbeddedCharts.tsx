import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactNode,
} from "react";
import { FigmaImage } from "../figma/runtime";
import { sourceSvgTree } from "./source-svg";
import {
  chartOffset,
  chartPointId,
  dynamicChartPoints,
  dynamicChartPath,
  embeddedChartStructure,
  resolveDynamicChartBars,
  deformChartPath,
  resolveChartBarGeometry,
  type EmbeddedChartInstance,
} from "./chart-runtime.mjs";
type NodeProps = {
  children?: ReactNode;
  src?: string;
  style?: CSSProperties;
  "data-edit-key"?: string;
  "data-node-id"?: string;
  "data-embedded-asset"?: string;
  "data-source-svg-id"?: string;
  [key: string]: unknown;
};
const sameSource = (source: string | undefined, wanted: string) =>
  source === wanted || Boolean(source?.endsWith("/" + wanted));
const valueList = (instance: EmbeddedChartInstance, id: string) =>
  instance.props.values[id].map((v, i) =>
    instance.motion.value(`point:${id}:${chartPointId(instance, id, i)}`, v),
  );
const number = (value: number) => Number(value.toFixed(6));
function donutPath(
  cx: number,
  cy: number,
  r: number,
  inner: number,
  start: number,
  end: number,
) {
  const polar = (radius: number, a: number) =>
    [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
      .map(number)
      .join(" ");
  const span = Math.max(0, Math.min(Math.PI * 2 - 1e-7, end - start));
  if (span < 1e-8) return "";
  const large = span > Math.PI ? 1 : 0;
  return `M${polar(r, start)} A${r} ${r} 0 ${large} 1 ${polar(r, start + span)} L${polar(inner, start + span)} A${inner} ${inner} 0 ${large} 0 ${polar(inner, start)} Z`;
}
function patchAsset(
  tree: ReactNode,
  instance: EmbeddedChartInstance,
  source: string,
): ReactNode {
  const def = instance.definition,
    bindings = def.bindings.filter((b) => b.assetSrc === source),
    donut = def.donut;
  const structural = embeddedChartStructure(def, instance.props).resized;
  const sourceNodes = new Map<string, React.ReactElement<NodeProps>>();
  function collect(node: ReactNode) {
    if (!isValidElement<NodeProps>(node)) return;
    const id = node.props["data-source-svg-id"];
    if (id) sourceNodes.set(id, node);
    Children.forEach(node.props.children, collect);
  }
  if (structural) collect(tree);
  const donutValues = donut ? valueList(instance, def.series[0].id) : [];
  const donutId = def.series[0]?.id;
  const donutChanged = Boolean(
    donut &&
    (donutValues.length !== def.series[0].values.length ||
      donutValues.some(
        (v, i) => Math.abs(v - def.series[0].values[i]) > 1e-9,
      ) ||
      instance.motion.progress(`series:${donutId}`) !== 1 ||
      instance.motion.style(`series:${donutId}`).opacity !== undefined ||
      donutValues.some(
        (_, i) =>
          instance.motion.style(
            `slice:${donutId}:${chartPointId(instance, donutId, i)}`,
          ).opacity !== undefined,
      ) ||
      donutValues.some(
        (_, i) =>
          instance.motion.progress(
            `slice:${donutId}:${chartPointId(instance, donutId, i)}`,
          ) !== 1,
      )),
  );
  function walk(node: ReactNode): ReactNode {
    if (!isValidElement<NodeProps>(node)) return node;
    const id = node.props["data-source-svg-id"];
    const updates: Record<string, unknown> = {};
    if (structural && node.type === "svg")
      updates.style = { ...node.props.style, overflow: "visible" };
    let revealed: ReactNode;
    if (
      donut &&
      donutChanged &&
      source === donut.baseSrc &&
      node.type === "svg"
    ) {
      const sum = donutValues.reduce((a, b) => a + b, 0);
      let angle = donut.startAngle;
      const paths = donutValues.map((v, i) => {
        const arc = sum > 0 ? (Math.PI * 2 * v) / sum : 0,
          start = angle;
        angle += arc;
        const target = `slice:${donutId}:${chartPointId(instance, donutId, i)}`;
        return createElement("path", {
          key: i,
          "data-native-chart-slice": target,
          d: donutPath(
            donut.cx,
            donut.cy,
            donut.radius,
            donut.innerRadius,
            start,
            start +
              arc *
                instance.motion.progress(`series:${donutId}`) *
                instance.motion.progress(target),
          ),
          fill: donut.colors[i % donut.colors.length],
          style: instance.motion.style(
            target,
            instance.motion.style(`series:${donutId}`),
          ),
        });
      });
      return cloneElement(node, {}, paths);
    }
    for (const binding of bindings) {
      const markers = structural
        ? (binding.dynamicMarkers ?? binding.markers)
        : binding.markers;
      const allValues = valueList(instance, binding.seriesId),
        values =
          !structural && binding.valueIndices
            ? binding.valueIndices.map((index) => allValues[index])
            : allValues,
        path = binding.paths.find((p) => p.id === id),
        marker = markers.find((p) => p.id === id),
        seriesTarget = `series:${binding.seriesId}`;
      const points = structural ? dynamicChartPoints(binding, allValues) : [];
      if (
        structural &&
        marker &&
        (binding.markerMode !== "focus" || allValues.length === 1)
      )
        return null;
      if (structural && path?.dynamicStyle)
        Object.assign(updates, path.dynamicStyle);
      if (path)
        updates.d = structural
          ? dynamicChartPath(path, points)
          : deformChartPath(path, binding.points, values);
      if (marker) {
        let delta = 0;
        if (structural) {
          const full = dynamicChartPoints(
            { ...binding, valueIndices: undefined },
            allValues,
          );
          const right = full.findIndex((p) => p.x >= marker.x);
          if (right === -1) delta = full[full.length - 1].y - marker.y;
          else if (right === 0) delta = full[0].y - marker.y;
          else {
            const a = full[right - 1],
              b = full[right];
            delta =
              a.y + ((b.y - a.y) * (marker.x - a.x)) / (b.x - a.x) - marker.y;
          }
        } else
          delta = chartOffset(
            binding.points,
            values,
            binding.unitsPerPixel,
            marker.x,
          );
        if (Math.abs(delta) > 1e-9)
          updates.transform = `translate(0 ${number(delta)}) ${node.props.transform ?? ""}`;
      }
      if (path || marker) {
        const style = instance.motion.style(
            seriesTarget,
            node.props.style ?? {},
          ),
          draw = instance.motion.draw(seriesTarget);
        if (draw !== 1) {
          const x = binding.minX + (binding.maxX - binding.minX) * draw;
          const clipId = `chart-reveal-${(instance.scopeId ?? "instance").replace(/[^\w-]/g, "")}-${def.id}-${binding.seriesId}-${source.replace(/[^\w-]/g, "")}-${String(id).replace(/[^\w-]/g, "")}`;
          updates.style = style;
          const updated = cloneElement(node, updates, node.props.children);
          const clipped = createElement(
            "g",
            { key: node.key, clipPath: `url(#${clipId})` },
            createElement(
              "defs",
              {},
              createElement(
                "clipPath",
                { id: clipId, clipPathUnits: "userSpaceOnUse" },
                createElement("rect", {
                  x: binding.minX - 4,
                  y: -100000,
                  width: Math.max(0, x - binding.minX) + (draw === 0 ? 0 : 4),
                  height: 200000,
                }),
              ),
            ),
            updated,
          );
          if (!structural || !path || path.id !== binding.paths[0].id)
            return clipped;
          // The resized path and its synthetic markers share the same geometric reveal.
          revealed = clipped;
        }
        updates.style = style;
      }
      if (structural && path && path.id === binding.paths[0].id) {
        const sourceMarker =
            markers.find((marker) => marker.id === binding.markerTemplateId) ??
            markers[0],
          template = sourceMarker
            ? sourceNodes.get(sourceMarker.id)
            : undefined;
        const pointNodes = (
          (binding.markerMode !== "focus" &&
            (markers.length || binding.externalMarkers)) ||
          allValues.length === 1
            ? points
            : []
        )
          .filter((p) => p.index !== null)
          .map((point) => {
            const pointId = chartPointId(
                instance,
                binding.seriesId,
                point.index!,
              ),
              target = `point:${binding.seriesId}:${pointId}`;
            const visible =
              instance.motion.draw(seriesTarget) !== 0 &&
              point.x <=
                binding.minX +
                  (binding.maxX - binding.minX) *
                    instance.motion.draw(seriesTarget) +
                  1e-6;
            const attrs = {
              key: target,
              id: undefined,
              "data-source-svg-id": undefined,
              "data-native-chart-point": target,
              style: {
                ...instance.motion.style(seriesTarget),
                ...(visible ? {} : { opacity: 0 }),
              },
            };
            return template && sourceMarker
              ? cloneElement(template, {
                  ...attrs,
                  transform: `translate(${number(point.x - sourceMarker.x)} ${number(point.y - sourceMarker.y)}) ${template.props.transform ?? ""}`,
                })
              : createElement("circle", {
                  ...attrs,
                  cx: point.x,
                  cy: point.y,
                  r:
                    binding.externalMarkers?.radius ??
                    Math.max(1, Number(node.props.strokeWidth ?? 2) / 2),
                  fill:
                    binding.externalMarkers?.fill ??
                    node.props.stroke ??
                    node.props.fill ??
                    "#576cdb",
                });
          });
        return createElement(
          "g",
          { key: node.key },
          revealed ?? cloneElement(node, updates, node.props.children),
          ...pointNodes,
        );
      }
    }
    const children = Children.map(node.props.children, walk);
    return cloneElement(node, updates, children);
  }
  if (
    donut &&
    donutChanged &&
    donut.hiddenSources.includes(source) &&
    isValidElement<NodeProps>(tree)
  )
    return cloneElement(tree, {}, null);
  return walk(tree);
}
/** Replaces only reviewed native bars and exact source SVG fragments, keeping source hosts intact. */
export function applyEmbeddedCharts(
  tree: ReactNode,
  componentId: string,
  instances: EmbeddedChartInstance[],
): ReactNode {
  const relevant = instances.filter(
    (i) => i.definition.componentId === componentId,
  );
  if (!relevant.length) return tree;
  const structures = new Map(
    relevant.map((instance) => [
      instance,
      embeddedChartStructure(instance.definition, instance.props),
    ]),
  );
  function walk(node: ReactNode, hostKey = "root"): ReactNode {
    if (!isValidElement<NodeProps>(node)) return node;
    let current = node;
    const nextHost = String(
      node.props["data-edit-key"] ?? node.props["data-node-id"] ?? hostKey,
    );
    for (const instance of relevant) {
      const asset = instance.definition.assets.find((a) =>
        sameSource(
          current.props["data-embedded-asset"] ?? current.props.src,
          a.src,
        ),
      );
      if (
        asset &&
        (current.type === FigmaImage || current.props["data-embedded-asset"])
      ) {
        const native =
          current.type === FigmaImage
            ? sourceSvgTree(
                asset,
                current.props.style,
                `${instance.scopeId}-${instance.definition.id}-${nextHost}`,
              )
            : current;
        const patched = patchAsset(native, instance, asset.src);
        if (isValidElement<NodeProps>(patched))
          current = cloneElement(patched, { key: current.key });
      }
      const key =
        current.props["data-edit-key"] ?? current.props["data-node-id"];
      if (!key) continue;
      if (structures.get(instance)!.resized) {
        if (
          instance.definition.bindings.some((binding) =>
            binding.externalMarkers?.nodeKeys.includes(key),
          )
        )
          return null;
        const layouts = instance.definition.dynamic?.barLayouts ?? [];
        if (layouts.some((layout) => layout.clearHostKeys.includes(key)))
          current = cloneElement(current, {}, null);
        const layout = layouts.find((layout) => layout.hostKey === key);
        if (layout) {
          current = cloneElement(
            current,
            {},
            resolveDynamicChartBars(instance, layout).map((mark) =>
              createElement("div", {
                key: mark.target,
                "data-native-chart-bar": mark.target,
                style: instance.motion.style(
                  mark.target,
                  instance.motion.style(`series:${mark.seriesId}`, mark.style),
                ),
              }),
            ),
          );
        }
        continue;
      }
      const bar = instance.definition.bars.find((b) => b.nodeId === key);
      if (bar) {
        const geometry = resolveChartBarGeometry(instance).get(bar.nodeId)!;
        let style = instance.motion.style(
          `bar:${bar.seriesId}:${chartPointId(instance, bar.seriesId, bar.index)}`,
          instance.motion.style(
            `series:${bar.seriesId}`,
            current.props.style ?? {},
          ),
        );
        if (Math.abs(geometry.height - bar.height) > 1e-8)
          style = { ...style, height: `${geometry.height}px` };
        if (
          geometry.top !== undefined &&
          Math.abs(geometry.top - bar.top!) > 1e-8
        )
          style.top = `${geometry.top}px`;
        current = cloneElement(current, { style });
      }
      const owned = instance.definition.bars.filter(
        (b) => b.parentKey === key && b.parentHeight !== undefined,
      );
      if (owned.length) {
        const delta = owned.reduce(
          (sum, b) =>
            sum +
            Math.abs(
              instance.motion.value(
                `point:${b.seriesId}:${chartPointId(instance, b.seriesId, b.index)}`,
                instance.props.values[b.seriesId][b.index],
              ) / b.unitsPerPixel,
            ) *
              instance.motion.progress(`series:${b.seriesId}`) *
              instance.motion.progress(
                `bar:${b.seriesId}:${chartPointId(instance, b.seriesId, b.index)}`,
              ) -
            b.height,
          0,
        );
        if (Math.abs(delta) > 1e-8)
          current = cloneElement(current, {
            style: {
              ...current.props.style,
              height: `${owned[0].parentHeight! + delta}px`,
            },
          });
      }
    }
    return cloneElement(
      current,
      {},
      Children.map(current.props.children, (child) => walk(child, nextHost)),
    );
  }
  return walk(tree);
}
