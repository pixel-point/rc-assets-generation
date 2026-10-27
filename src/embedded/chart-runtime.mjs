import {
  validateInternalMotion,
  resolveMotionTarget,
  internalTrackValueAtFrame,
} from "../composition/internal-motion.mjs";
import { createNativeMotion } from "../native/runtime.mjs";
function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  return value;
}
const MAX_POINTS = 128;
const pointIdPattern = /^[A-Za-z0-9_-]{1,64}$/;
function resized(definition, values) {
  return definition.series.some((s) => values[s.id].length !== s.values.length);
}
function rangeFor(series, index, dynamic) {
  return dynamic ? series.range : (series.ranges?.[index] ?? series.range);
}
function stacksFor(definition, values) {
  if (!resized(definition, values)) return definition.stacks ?? [];
  if (!definition.stacks?.length) return [];
  const series = definition.series.filter((s) => s.type === "bar");
  const maximum =
    definition.dynamic?.stackMaximum ??
    Math.min(...definition.stacks.map((s) => s.max));
  return values[series[0].id].map((_, index) => ({
    id: `column-${index + 1}`,
    max: maximum,
    items: series.map((s) => ({ seriesId: s.id, index })),
  }));
}
function state(definition, input = {}) {
  object(input, "Embedded chart props");
  for (const key of Object.keys(input))
    if (!["values", "pointIds"].includes(key))
      throw new Error(
        `Unknown embedded chart prop ${key}. Use values and pointIds with the declared series IDs.`,
      );
  const overrides =
    input.values === undefined ? {} : object(input.values, "values");
  const ids =
    input.pointIds === undefined ? {} : object(input.pointIds, "pointIds");
  const known = new Set(definition.series.map((s) => s.id));
  for (const key of [...Object.keys(overrides), ...Object.keys(ids)])
    if (!known.has(key)) throw new Error(`Unknown chart series ${key}.`);
  const values = {},
    pointIds = {};
  for (const series of definition.series) {
    const supplied = Object.hasOwn(overrides, series.id)
      ? overrides[series.id]
      : series.values;
    if (
      !Array.isArray(supplied) ||
      supplied.length < 1 ||
      supplied.length > MAX_POINTS
    )
      throw new Error(
        `${series.id} requires between 1 and ${MAX_POINTS} values.`,
      );
    values[series.id] = supplied.map((value, index) => {
      if (typeof value !== "number" || !Number.isFinite(value))
        throw new Error(`${series.id}[${index}] must be finite.`);
      return value;
    });
    const suppliedIds = Object.hasOwn(ids, series.id)
      ? ids[series.id]
      : supplied.map((_, i) => `p${i + 1}`);
    if (
      !Array.isArray(suppliedIds) ||
      suppliedIds.length !== supplied.length ||
      suppliedIds.some(
        (id) => typeof id !== "string" || !pointIdPattern.test(id),
      ) ||
      new Set(suppliedIds).size !== suppliedIds.length
    )
      throw new Error(
        `${series.id} pointIds must be unique IDs matching its values length (letters, numbers, underscore or hyphen; 1–64 characters).`,
      );
    pointIds[series.id] = [...suppliedIds];
  }
  const dynamic = resized(definition, values);
  if (dynamic && new Set(Object.values(values).map((v) => v.length)).size !== 1)
    throw new Error(
      "Resized chart series must have aligned lengths. Supply the same number of values for every series.",
    );
  if (dynamic && definition.series.length > 1) {
    const ordered = Object.values(pointIds);
    if (ordered.some((ids) => ids.some((id, i) => id !== ordered[0][i])))
      throw new Error(
        "Resized chart series must use the same ordered pointIds so categories align.",
      );
  }
  for (const series of definition.series)
    values[series.id].forEach((value, index) => {
      const range = rangeFor(series, index, dynamic);
      if (value < range.min - 1e-8 || value > range.max + 1e-8)
        throw new Error(
          `${series.id}[${index}] must be between ${range.min} and ${range.max} ${definition.units}.`,
        );
    });
  for (const stack of stacksFor(definition, values)) {
    const total = stack.items.reduce(
      (sum, item) => sum + values[item.seriesId][item.index],
      0,
    );
    if (total > stack.max + 1e-7)
      throw new Error(
        `Stack ${stack.id} exceeds the authored axis maximum ${stack.max}.`,
      );
  }
  if (
    definition.chartType === "donut" &&
    Object.values(values)
      .flat()
      .reduce((a, b) => a + b, 0) <= 0
  )
    throw new Error("A donut requires at least one positive default value.");
  return { values, pointIds };
}
/** Old source marks disappear only for structural edits; callers can reject stale legacy controls. */
export function embeddedChartStructure(definition, input = {}) {
  const data = state(definition, input),
    dynamic = resized(definition, data.values);
  return {
    resized: dynamic,
    replacedNodeKeys: dynamic
      ? [
          ...(definition.dynamic?.replacedNodeKeys ??
            definition.bars.map((b) => b.nodeId)),
        ]
      : [],
  };
}
export function chartPointId(instance, seriesId, index) {
  return instance.props.pointIds?.[seriesId]?.[index] ?? `p${index + 1}`;
}
export function getEmbeddedChartContract(definition, input = {}) {
  const defaults = state(definition, input),
    motionTargets = {};
  function add(id, label, properties) {
    motionTargets[id] = {
      id,
      nodeId: id,
      componentId: definition.componentId,
      label,
      properties,
      aliases: [],
    };
  }
  for (const series of definition.series) {
    add(`series:${series.id}`, series.label, [
      "opacity",
      ...(series.type === "bar" || series.type === "donut"
        ? ["progress"]
        : ["draw"]),
    ]);
    defaults.pointIds[series.id].forEach((pointId, index) => {
      add(
        `point:${series.id}:${pointId}`,
        `${series.label}, point ${index + 1}`,
        ["value"],
      );
      if (series.type === "bar")
        add(
          `bar:${series.id}:${pointId}`,
          `${series.label}, bar ${index + 1}`,
          ["opacity", "progress"],
        );
      if (series.type === "donut")
        add(
          `slice:${series.id}:${pointId}`,
          `${series.label}, slice ${index + 1}`,
          ["opacity", "progress"],
        );
    });
  }
  const seriesProperties = (fn) =>
    Object.fromEntries(definition.series.map((s) => [s.id, fn(s)]));
  return {
    id: definition.id,
    componentId: definition.componentId,
    name: definition.name,
    kind: "chart",
    defaults,
    fields: {},
    motionTargets,
    propsSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        values: {
          type: "object",
          additionalProperties: false,
          properties: seriesProperties((s) => ({
            type: "array",
            minItems: 1,
            maxItems: MAX_POINTS,
            items: { type: "number" },
            range: s.range,
            authoredPointRanges: s.ranges,
            pointIds: defaults.pointIds[s.id],
          })),
        },
        pointIds: {
          type: "object",
          additionalProperties: false,
          properties: seriesProperties(() => ({
            type: "array",
            minItems: 1,
            maxItems: MAX_POINTS,
            uniqueItems: true,
            items: { type: "string", pattern: pointIdPattern.source },
          })),
        },
      },
    },
    units: definition.units,
    source: definition.source,
    limitations: definition.limitations,
  };
}
export function validateEmbeddedChart(
  definition,
  input = {},
  motion = [],
  durationFrames = 1800,
) {
  const contract = getEmbeddedChartContract(definition, input);
  const tracks = validateInternalMotion(
    { components: { [definition.componentId]: contract } },
    definition.componentId,
    motion,
    durationFrames,
  );
  const dynamic = resized(definition, contract.defaults.values);
  for (const track of tracks) {
    const target = resolveMotionTarget(contract, track.target).nodeId;
    if (track.property === "value") {
      const [, seriesId, pointId] = target.split(":"),
        series = definition.series.find((s) => s.id === seriesId),
        index = contract.defaults.pointIds[seriesId].indexOf(pointId),
        range = rangeFor(series, index, dynamic);
      for (const keyframe of track.keyframes)
        if (
          keyframe.value < range.min - 1e-8 ||
          keyframe.value > range.max + 1e-8
        )
          throw new Error(
            `${target} value must remain between ${range.min} and ${range.max} ${definition.units}.`,
          );
    }
  }
  for (const stack of stacksFor(definition, contract.defaults.values)) {
    const total = stackMaximum(
      contract.defaults.values,
      tracks,
      stack,
      durationFrames,
      contract.defaults.pointIds,
    );
    if (total > stack.max + 1e-7)
      throw new Error(
        `Animated stack ${stack.id} can exceed the authored axis maximum ${stack.max}.`,
      );
  }
  return tracks;
}
/** Every supported easing is piecewise cubic; inspect exact stationary points of stacked sums. */
function stackMaximum(values, tracks, stack, durationFrames, pointIds) {
  const relevant = stack.items.map((item) => ({
    item,
    track: tracks.find(
      (t) =>
        t.property === "value" &&
        t.target ===
          `point:${item.seriesId}:${pointIds[item.seriesId][item.index]}`,
    ),
  }));
  const boundaries = new Set([0, durationFrames - 1]);
  for (const { track } of relevant)
    if (track) {
      for (const keyframe of track.keyframes) boundaries.add(keyframe.frame);
      for (let i = 1; i < track.keyframes.length; i++)
        if ((track.keyframes[i].easing ?? track.easing) === "ease-in-out")
          boundaries.add(
            (track.keyframes[i - 1].frame + track.keyframes[i].frame) / 2,
          );
    }
  const ordered = [...boundaries].sort((a, b) => a - b);
  const sum = (frame) =>
    relevant.reduce(
      (total, { item, track }) =>
        total +
        (track
          ? internalTrackValueAtFrame(track, frame)
          : values[item.seriesId][item.index]),
      0,
    );
  let maximum = Math.max(...ordered.map(sum));
  for (let i = 1; i < ordered.length; i++) {
    const start = ordered[i - 1],
      span = ordered[i] - start,
      f = [0, 1 / 3, 2 / 3, 1].map((t) => sum(start + span * t));
    const a = 4.5 * (f[3] - 3 * f[2] + 3 * f[1] - f[0]),
      b = 4.5 * (f[2] - 2 * f[1] + f[0]) - a,
      c = 3 * (f[1] - f[0]) - a / 9 - b / 3;
    const roots = [];
    if (Math.abs(a) < 1e-10) {
      if (Math.abs(b) > 1e-10) roots.push(-c / (2 * b));
    } else {
      const discriminant = 4 * b * b - 12 * a * c;
      if (discriminant >= 0) {
        roots.push(
          (-2 * b + Math.sqrt(discriminant)) / (6 * a),
          (-2 * b - Math.sqrt(discriminant)) / (6 * a),
        );
      }
    }
    for (const t of roots)
      if (t > 0 && t < 1) maximum = Math.max(maximum, sum(start + span * t));
  }
  return maximum;
}

export function resolveEmbeddedChart(
  definition,
  input = {},
  motion = [],
  frame = 0,
  durationFrames = 1800,
) {
  const contract = getEmbeddedChartContract(definition, input),
    tracks = validateEmbeddedChart(definition, input, motion, durationFrames);
  return {
    definition,
    props: contract.defaults,
    data: contract.defaults,
    contract,
    tracks,
    motion: createNativeMotion(contract, tracks, frame),
  };
}
/** Source paths keep their authored curvature. Data offsets deform their Y coordinates at fixed X samples. */
export function chartOffset(points, values, unitsPerPixel, x) {
  const delta = (i) => (points[i].value - values[i]) / unitsPerPixel;
  if (x <= points[0].x) return delta(0);
  for (let i = 1; i < points.length; i++)
    if (x <= points[i].x) {
      const t = (x - points[i - 1].x) / (points[i].x - points[i - 1].x || 1);
      return delta(i - 1) + (delta(i) - delta(i - 1)) * t;
    }
  return delta(points.length - 1);
}
export function deformChartPath(binding, points, values) {
  if (points.every((p, i) => Math.abs(p.value - values[i]) < 1e-9))
    return binding.d;
  const xy = (x, y) => [
    x,
    binding.pinY !== undefined && Math.abs(y - binding.pinY) < 0.02
      ? y
      : y + chartOffset(points, values, binding.unitsPerPixel, x),
  ];
  const number = (n) => Number(n.toFixed(6));
  return binding.instructions
    .map((i) => {
      if (i.type === "Z") return "Z";
      if (i.type === "C")
        return `C${[...xy(i.cp1x, i.cp1y), ...xy(i.cp2x, i.cp2y), ...xy(i.x, i.y)].map(number).join(" ")}`;
      return `${i.type}${xy(i.x, i.y).map(number).join(" ")}`;
    })
    .join(" ");
}
/** Interpolate the designer's nonuniform percentage ticks without relabeling the source. */
export function sourceAxisValue(anchors, y) {
  const sorted = [...anchors].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++)
    if (y <= sorted[i].y) {
      const a = sorted[i - 1],
        b = sorted[i];
      return a.value + ((b.value - a.value) * (y - a.y)) / (b.y - a.y);
    }
  const a = sorted.at(-2),
    b = sorted.at(-1);
  return a.value + ((b.value - a.value) * (y - a.y)) / (b.y - a.y);
}
export function sourceAxisY(anchors, value) {
  const sorted = [...anchors].sort((a, b) => a.value - b.value);
  for (let i = 1; i < sorted.length; i++)
    if (value <= sorted[i].value) {
      const a = sorted[i - 1],
        b = sorted[i];
      return a.y + ((b.y - a.y) * (value - a.value)) / (b.value - a.value);
    }
  const a = sorted.at(-2),
    b = sorted.at(-1);
  return a.y + ((b.y - a.y) * (value - a.value)) / (b.value - a.value);
}
export function resolveChartBarGeometry(instance) {
  if (resized(instance.definition, instance.props.values))
    return new Map(
      (instance.definition.dynamic?.barLayouts ?? [])
        .flatMap((layout) => resolveDynamicChartBars(instance, layout))
        .map((mark) => [mark.target, mark.style]),
    );
  const { definition: def, motion } = instance,
    out = new Map();
  const value = (b) =>
    Math.abs(
      motion.value(
        `point:${b.seriesId}:${chartPointId(instance, b.seriesId, b.index)}`,
        instance.props.values[b.seriesId][b.index],
      ),
    );
  const progress = (b) =>
    motion.progress(`series:${b.seriesId}`) *
    motion.progress(
      `bar:${b.seriesId}:${chartPointId(instance, b.seriesId, b.index)}`,
    );
  for (const b of def.bars) {
    const height = (value(b) / b.unitsPerPixel) * progress(b);
    out.set(b.nodeId, {
      height,
      ...(b.top !== undefined ? { top: b.top + b.height - height } : {}),
    });
  }
  for (const stack of def.stacks ?? []) {
    const bars = def.bars
      .filter((b) => b.stackId === stack.id && b.top !== undefined)
      .sort((a, b) => b.top - a.top);
    if (!bars.length) continue;
    if (stack.axisAnchors) {
      const unchanged = bars.every(
        (b) =>
          Math.abs(
            value(b) -
              Math.abs(
                def.series.find((s) => s.id === b.seriesId).values[b.index],
              ),
          ) < 1e-8 && progress(b) === 1,
      );
      if (unchanged) {
        for (const b of bars)
          out.set(b.nodeId, { height: b.height, top: b.top });
        continue;
      }
      let total = 0,
        previous = sourceAxisY(stack.axisAnchors, 0);
      for (const b of bars) {
        total += value(b) * progress(b);
        const top = sourceAxisY(stack.axisAnchors, total);
        out.set(b.nodeId, { height: Math.max(0, previous - top), top });
        previous = top;
      }
    } else {
      let delta = 0;
      for (const b of bars) {
        const current = out.get(b.nodeId);
        current.top -= delta;
        delta += current.height - b.height;
      }
    }
  }
  return out;
}
/** Recompute only resized plot geometry; authored paths remain untouched in the normal branch. */
export function dynamicChartPoints(binding, values) {
  const low = binding.minX,
    high = binding.maxX;
  const zeroY =
    binding.calibration?.zeroY ??
    binding.points[0].y + binding.points[0].value / binding.unitsPerPixel;
  const points = values.map((value, index) => ({
    x: binding.categoryBands
      ? low + ((high - low) * (index + 0.5)) / values.length
      : values.length === 1
        ? (low + high) / 2
        : low + ((high - low) * index) / (values.length - 1),
    y: zeroY - value / binding.unitsPerPixel,
    index,
  }));
  if (!binding.valueIndices) return points;
  const min = Math.min(...binding.points.map((p) => p.x)),
    max = Math.max(...binding.points.map((p) => p.x));
  if (points.length === 1)
    return points.filter(
      (p) => p.x >= min - 1e-6 && (p.x < max - 1e-6 || max >= high - 1e-6),
    );
  const sample = (x) => {
    for (let i = 1; i < points.length; i++)
      if (x <= points[i].x) {
        const a = points[i - 1],
          b = points[i],
          t = (x - a.x) / (b.x - a.x);
        return { x, y: a.y + (b.y - a.y) * t, index: null };
      }
    return { ...points.at(-1), x, index: null };
  };
  const visible = points.filter((p) => p.x >= min - 1e-6 && p.x <= max + 1e-6);
  if (!visible.length || visible[0].x > min + 1e-6)
    visible.unshift(sample(min));
  if (visible.at(-1).x < max - 1e-6) visible.push(sample(max));
  return visible.map((point) =>
    binding.valueIndices && Math.abs(point.x - max) < 1e-6 && max < high - 1e-6
      ? { ...point, index: null }
      : point,
  );
}
export function dynamicChartPath(path, points) {
  if (!points.length) return "";
  const n = (value) => Number(value.toFixed(6));
  // Shape-preserving Hermite interpolation: controls stay between adjacent Y values.
  const slopes = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x || 1));
  const tangent = points.map((_, i) =>
    i === 0
      ? slopes[0]
      : i === points.length - 1
        ? slopes.at(-1)
        : slopes[i - 1] * slopes[i] <= 0
          ? 0
          : (2 * slopes[i - 1] * slopes[i]) / (slopes[i - 1] + slopes[i]),
  );
  let d = `M${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      dx = (b.x - a.x) / 3,
      min = Math.min(a.y, b.y),
      max = Math.max(a.y, b.y),
      clamp = (y) => Math.max(min, Math.min(max, y));
    if (path.interpolation === "linear") {
      d += ` L${n(b.x)} ${n(b.y)}`;
      continue;
    }
    d += ` C${n(a.x + dx)} ${n(clamp(a.y + tangent[i - 1] * dx))} ${n(b.x - dx)} ${n(clamp(b.y - tangent[i] * dx))} ${n(b.x)} ${n(b.y)}`;
  }
  if (path.pinY !== undefined)
    d += ` L${n(points.at(-1).x)} ${n(path.pinY)} L${n(points[0].x)} ${n(path.pinY)} Z`;
  return d;
}
export function resolveDynamicChartBars(instance, layout) {
  const count = instance.props.values[layout.seriesOrder[0]].length,
    marks = [];
  const grouped = layout.mode === "grouped",
    width = layout.width / count;
  const slots = grouped ? layout.seriesOrder.length : 1;
  const barWidth = (width * (count === 1 && slots === 1 ? 0.55 : 0.7)) / slots;
  const gap = (width - barWidth * slots) / 2;
  for (let index = 0; index < count; index++) {
    let cumulative = 0;
    for (const [order, seriesId] of layout.seriesOrder.entries()) {
      const template = layout.templates.find((t) => t.seriesId === seriesId),
        id = chartPointId(instance, seriesId, index),
        target = `bar:${seriesId}:${id}`;
      const amount =
        Math.abs(
          instance.motion.value(
            `point:${seriesId}:${id}`,
            instance.props.values[seriesId][index],
          ),
        ) *
        instance.motion.progress(`series:${seriesId}`) *
        instance.motion.progress(target);
      let height = amount / template.unitsPerPixel,
        top;
      if (layout.mode === "stacked") {
        if (layout.axisAnchors) {
          const bottom = sourceAxisY(layout.axisAnchors, cumulative);
          cumulative += amount;
          top = sourceAxisY(layout.axisAnchors, cumulative);
          height = bottom - top;
        } else {
          top =
            layout.baseline - (cumulative + amount) / template.unitsPerPixel;
          cumulative += amount;
        }
      } else
        top =
          layout.direction === 1 ? layout.baseline : layout.baseline - height;
      marks.push({
        target,
        seriesId,
        pointId: id,
        index,
        style: {
          ...template.style,
          position: "absolute",
          left:
            layout.left +
            index * width +
            gap +
            (grouped ? order * barWidth : 0),
          top,
          width: barWidth,
          height,
        },
      });
    }
  }
  return marks;
}
