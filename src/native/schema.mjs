import { z } from "zod";
import {
  validateInternalMotion,
  resolveMotionTarget,
} from "../composition/internal-motion.mjs";

const id = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);
const label = z.string().max(160);
const number = z.number().finite().min(-1e12).max(1e12);
const color = z.string().regex(/^#[\da-fA-F]{6}$/);
const dimensions = {
  width: z.number().finite().min(160).max(2400),
  height: z.number().finite().min(80).max(1800),
};
const format = z.strictObject({
  decimals: z.number().int().min(0).max(6).default(0),
  prefix: z.string().max(16).default(""),
  suffix: z.string().max(16).default(""),
});
const domain = z
  .strictObject({ min: number, max: number })
  .refine(
    (value) => value.min < value.max,
    "Domain min must be smaller than max.",
  );
const scalar = z.union([label, number, z.null()]);
const cell = z.union([
  scalar,
  z.strictObject({
    value: scalar,
    label: label.optional(),
    tone: z.enum(["neutral", "positive", "negative"]).optional(),
    avatar: z.string().max(4).optional(),
    format: format.optional(),
  }),
]);

export const nativeTableSchema = z
  .strictObject({
    ...dimensions,
    title: label.default(""),
    subtitle: label.optional(),
    theme: z.enum([
      "cohort",
      "prediction",
      "feedback",
      "conversion",
      "entitlement",
    ]),
    rowHeight: z.number().finite().min(16).max(100).optional(),
    columns: z
      .array(
        z.strictObject({
          id,
          label,
          width: z.number().finite().positive().max(2400).optional(),
          align: z.enum(["left", "center", "right"]).default("left"),
          display: z
            .enum(["text", "heatmap", "bar", "badge", "avatar"])
            .default("text"),
          format: format.optional(),
        }),
      )
      .min(1)
      .max(16),
    rows: z
      .array(z.strictObject({ id, cells: z.record(z.string(), cell) }))
      .min(1)
      .max(50),
    heatmap: z
      .strictObject({ min: number, max: number, color })
      .refine(
        (value) => value.min < value.max,
        "Heatmap min must be smaller than max.",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    unique(data.columns, "column", ctx);
    unique(data.rows, "row", ctx);
    const titleHeight =
      data.title || data.subtitle
        ? data.theme === "prediction"
          ? 61.35
          : 44
        : 0;
    const rowHeight =
      data.rowHeight ??
      (data.theme === "cohort"
        ? (data.height - titleHeight - 31.4) / data.rows.length
        : (data.height - titleHeight) / (data.rows.length + 1));
    const contentHeight =
      titleHeight +
      (data.theme === "cohort" ? 31.4 : rowHeight) +
      data.rows.length * rowHeight;
    if (rowHeight < 16 || contentHeight > data.height + 1e-6)
      ctx.addIssue({
        code: "custom",
        path: ["height"],
        message:
          "Table canvas must fit its title, header and all rows at a minimum row height of 16px. Increase height or reduce rows/rowHeight.",
      });
    if (
      !data.heatmap &&
      data.columns.some((column) => ["heatmap", "bar"].includes(column.display))
    )
      ctx.addIssue({
        code: "custom",
        path: ["heatmap"],
        message:
          "Heatmap and bar columns require an explicit fixed min/max/color domain.",
      });
    const columns = new Set(data.columns.map((column) => column.id));
    data.rows.forEach((row, index) => {
      for (const [key, item] of Object.entries(row.cells))
        if (
          item &&
          typeof item === "object" &&
          typeof item.value === "number" &&
          item.label !== undefined
        )
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "cells", key, "label"],
            message:
              "Numeric cells render their value; use format instead of a fixed label.",
          });
      for (const key of Object.keys(row.cells))
        if (!columns.has(key))
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "cells", key],
            message: `Unknown column ${key}.`,
          });
      for (const key of columns)
        if (!Object.hasOwn(row.cells, key))
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "cells", key],
            message: `Missing column ${key}; use null for an intentionally empty cell.`,
          });
    });
  });

export const nativeChartSchema = z
  .strictObject({
    ...dimensions,
    width: z.number().finite().min(320).max(2400),
    height: z.number().finite().min(260).max(1800),
    title: label.default(""),
    subtitle: label.optional(),
    kind: z.enum([
      "line",
      "area",
      "bar",
      "stacked-bar",
      "diverging-bar",
      "donut",
    ]),
    categories: z
      .array(z.strictObject({ id, label, color: color.optional() }))
      .min(1)
      .max(120),
    series: z
      .array(
        z.strictObject({
          id,
          label,
          color,
          values: z.array(number).min(1).max(120),
          renderAs: z.enum(["line", "bar"]).optional(),
          dashed: z.boolean().default(false),
        }),
      )
      .min(1)
      .max(12),
    domain: domain.optional(),
    format: format.optional(),
    showLegend: z.boolean().default(true),
    showPoints: z.boolean().default(false),
    showAxes: z.boolean().default(true),
    showGrid: z.boolean().default(true),
    metrics: z
      .array(
        z.strictObject({
          id,
          label,
          value: number,
          format: format.optional(),
          color: color.optional(),
        }),
      )
      .max(4)
      .default([]),
    annotation: z
      .strictObject({ categoryId: id, label, color: color.optional() })
      .optional(),
  })
  .superRefine((data, ctx) => {
    unique(data.categories, "category", ctx);
    unique(data.series, "series", ctx);
    unique(data.metrics, "metric", ctx);
    data.series.forEach((series, index) => {
      if (series.values.length !== data.categories.length)
        ctx.addIssue({
          code: "custom",
          path: ["series", index, "values"],
          message: "Every series needs one value per category.",
        });
    });
    if (
      data.annotation &&
      !data.categories.some(
        (category) => category.id === data.annotation.categoryId,
      )
    )
      ctx.addIssue({
        code: "custom",
        path: ["annotation", "categoryId"],
        message: "Annotation must reference an existing category.",
      });
    if (
      data.series.some((series) => series.renderAs === "bar") &&
      !["bar", "stacked-bar", "diverging-bar"].includes(data.kind)
    )
      ctx.addIssue({
        code: "custom",
        path: ["series"],
        message:
          "Bar series require a bar, stacked-bar or diverging-bar chart.",
      });
    const legendRows = data.showLegend ? Math.ceil(data.series.length / 3) : 0;
    const requiredHeight =
      48 +
      (data.subtitle ? 18 : 0) +
      legendRows * 22 +
      (data.metrics.length ? 62 : 0) +
      (data.showAxes ? 48 : 28) +
      80;
    if (data.height < requiredHeight)
      ctx.addIssue({
        code: "custom",
        path: ["height"],
        message: `Chart height must be at least ${requiredHeight}px to fit the header, legend, metrics and an 80px plot.`,
      });
    if (data.kind === "donut") {
      if (data.annotation)
        ctx.addIssue({
          code: "custom",
          path: ["annotation"],
          message: "Donut charts do not support category annotations.",
        });
      if (data.categories.length > 8)
        ctx.addIssue({
          code: "custom",
          path: ["categories"],
          message: "Donut charts support at most eight categories.",
        });
      if (data.series.some((series) => series.renderAs))
        ctx.addIssue({
          code: "custom",
          path: ["series"],
          message: "Donut series do not use renderAs.",
        });
      if (data.series.length !== 1)
        ctx.addIssue({
          code: "custom",
          path: ["series"],
          message: "Donut charts use exactly one series.",
        });
      if (
        data.series.some((series) => series.values.some((value) => value < 0))
      )
        ctx.addIssue({
          code: "custom",
          path: ["series"],
          message: "Donut values must be nonnegative.",
        });
      if (data.series[0]?.values.every((value) => value === 0))
        ctx.addIssue({
          code: "custom",
          path: ["series"],
          message: "A donut default dataset needs a positive total.",
        });
      if (data.domain)
        ctx.addIssue({
          code: "custom",
          path: ["domain"],
          message: "Donut charts do not use a numerical axis domain.",
        });
    }
  });

function unique(items, kind, ctx) {
  const seen = new Set();
  items.forEach((item, index) => {
    if (seen.has(item.id))
      ctx.addIssue({
        code: "custom",
        path: [kind, index, "id"],
        message: `Duplicate ${kind} ID ${item.id}.`,
      });
    seen.add(item.id);
  });
}
export function parseNativeRegistry(entries) {
  const parsed = z
    .array(
      z
        .object({
          id,
          name: z.string().min(1),
          ...dimensions,
          kind: z.enum(["table", "chart"]),
          defaults: z.record(z.string(), z.unknown()),
          sources: z
            .array(
              z
                .object({
                  fileKey: z.string().min(1),
                  nodeId: z.string().min(1),
                  componentId: z.string().min(1),
                })
                .passthrough(),
            )
            .default([]),
        })
        .passthrough(),
    )
    .parse(entries);
  const seen = new Set();
  for (const item of parsed) {
    if (seen.has(item.id))
      throw new Error(`Duplicate native component ID ${item.id}.`);
    seen.add(item.id);
    parseNativeProps(item);
  }
  return parsed;
}
export function getNativeDefinition(catalog, componentId) {
  const matches = catalog.filter((item) => item.id === componentId);
  if (matches.length !== 1)
    throw new Error(
      `Unknown or ambiguous native component ${componentId}. Choose its exact catalog ID.`,
    );
  return matches[0];
}
export function parseNativeProps(definition, input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error(`Native props for ${definition.id} must be an object.`);
  const merged = {
    width: definition.width,
    height: definition.height,
    ...definition.defaults,
    ...input,
  };
  for (const key of ["format", "heatmap"])
    if (definition.defaults[key] && input[key])
      merged[key] = { ...definition.defaults[key], ...input[key] };
  if (
    (Object.hasOwn(input, "rows") || Object.hasOwn(input, "height")) &&
    !Object.hasOwn(input, "rowHeight")
  )
    delete merged.rowHeight;
  const schema =
    definition.kind === "table"
      ? nativeTableSchema
      : definition.kind === "chart"
        ? nativeChartSchema
        : undefined;
  if (!schema)
    throw new Error(`Unknown native component kind ${definition.kind}.`);
  return schema.parse(merged);
}
const common = ["translateX", "translateY", "rotate", "scale", "opacity"];
export function cellValue(cell) {
  return cell && typeof cell === "object" ? cell.value : cell;
}
export function chartSeriesKind(data, series) {
  return (
    series.renderAs ??
    (data.kind === "bar" ||
    data.kind === "stacked-bar" ||
    data.kind === "diverging-bar"
      ? "bar"
      : data.kind)
  );
}

/** Targets derive from this instance's IDs, never array indexes or default-data selectors. */
export function getNativeContract(definition, input = {}) {
  const data = parseNativeProps(definition, input),
    motionTargets = Object.create(null);
  const add = (key, label, properties = common) => {
    motionTargets[key] = {
      label,
      componentId: definition.id,
      nodeId: key,
      properties: [...properties],
      aliases: [],
    };
  };
  if (definition.kind !== "table" || data.title || data.subtitle)
    add("title", "Title");
  if (definition.kind === "table") {
    add("table", "Table");
    add("header", "Header");
    for (const column of data.columns)
      add(`column:${column.id}`, `${column.label} column`);
    for (const row of data.rows) {
      add(`row:${row.id}`, `${row.id} row`);
      for (const column of data.columns) {
        const numeric = typeof cellValue(row.cells[column.id]) === "number";
        add(`cell:${row.id}:${column.id}`, `${row.id} / ${column.label}`, [
          ...common,
          ...(numeric ? ["value"] : []),
        ]);
      }
    }
  } else {
    add("chart", "Chart");
    add("legend", "Legend");
    for (const series of data.series) {
      const kind = chartSeriesKind(data, series);
      add(`series:${series.id}`, series.label, [
        ...common,
        ...(["line", "area"].includes(kind)
          ? ["draw"]
          : ["bar", "donut"].includes(kind)
            ? ["progress"]
            : []),
      ]);
      for (const category of data.categories) {
        add(
          `point:${series.id}:${category.id}`,
          `${series.label} / ${category.label}`,
          [
            ...(!data.showPoints || ["bar", "donut"].includes(kind)
              ? []
              : common),
            "value",
          ],
        );
        if (kind === "bar")
          add(
            `bar:${series.id}:${category.id}`,
            `${series.label} / ${category.label} bar`,
            [...common, "progress"],
          );
        if (data.kind === "donut")
          add(`slice:${series.id}:${category.id}`, `${category.label} slice`, [
            ...common,
            "progress",
          ]);
      }
    }
    for (const metric of data.metrics)
      add(`metric:${metric.id}`, metric.label, [...common, "value"]);
    if (data.annotation) add("annotation", data.annotation.label);
  }
  return {
    id: definition.id,
    name: definition.name,
    fields: {},
    motionTargets,
    defaults: data,
    propsSchema: z.toJSONSchema(
      definition.kind === "table" ? nativeTableSchema : nativeChartSchema,
    ),
    limitations: [
      "Native data reconstruction with independent component ID; source illustration remains unchanged.",
      "IDs identify rows, columns, categories and series across data edits. Removing an animated ID is a validation error.",
      "Text, values and geometry require visual fit review after data changes.",
    ],
  };
}

/** Validate time, capability and fixed-domain coverage before drawing any frame. */
export function validateNativeMotion(
  definition,
  input = {},
  tracks = [],
  durationFrames = 1800,
) {
  const contract = getNativeContract(definition, input),
    data = contract.defaults;
  const parsed = validateInternalMotion(
    { components: { [definition.id]: contract } },
    definition.id,
    tracks,
    durationFrames,
  );
  const ranges = new Map();
  for (const track of parsed) {
    if (track.property !== "value") continue;
    const target = resolveMotionTarget(contract, track.target).nodeId;
    const values = track.keyframes.map((point) => point.value);
    ranges.set(target, [Math.min(...values), Math.max(...values)]);
  }
  const range = (target, value) => {
    const animated = ranges.get(target);
    return animated
      ? [Math.min(value, animated[0]), Math.max(value, animated[1])]
      : [value, value];
  };
  if (definition.kind === "chart") {
    if (data.kind === "donut")
      for (const [target, [min]] of ranges)
        if (target.startsWith("point:") && min < 0)
          throw new Error("Donut value animation must stay nonnegative.");
    if (data.domain) {
      let min = Infinity,
        max = -Infinity;
      for (let index = 0; index < data.categories.length; index++) {
        let negative = 0,
          positive = 0;
        for (const series of data.series) {
          const [low, high] = range(
            `point:${series.id}:${data.categories[index].id}`,
            series.values[index],
          );
          min = Math.min(min, low);
          max = Math.max(max, high);
          if (
            data.kind === "stacked-bar" &&
            chartSeriesKind(data, series) === "bar"
          ) {
            negative += Math.min(0, low);
            positive += Math.max(0, high);
          }
        }
        if (data.kind === "stacked-bar") {
          min = Math.min(min, negative);
          max = Math.max(max, positive);
        }
      }
      if (
        ["bar", "area", "stacked-bar", "diverging-bar"].includes(data.kind) ||
        data.series.some((series) => series.renderAs === "bar")
      ) {
        min = Math.min(min, 0);
        max = Math.max(max, 0);
      }
      if (min < data.domain.min || max > data.domain.max)
        throw new Error(
          `Explicit chart domain [${data.domain.min}, ${data.domain.max}] clips data or animated values [${min}, ${max}]. Expand it or omit it for a fixed automatic domain.`,
        );
    }
  } else if (data.heatmap) {
    for (const row of data.rows)
      for (const column of data.columns) {
        const value = cellValue(row.cells[column.id]);
        if (
          typeof value !== "number" ||
          !["heatmap", "bar"].includes(column.display)
        )
          continue;
        const [low, high] = range(`cell:${row.id}:${column.id}`, value);
        if (low < data.heatmap.min || high > data.heatmap.max)
          throw new Error(
            `Cell ${row.id}/${column.id} data or animation exceeds its fixed heatmap/bar domain.`,
          );
      }
  }
  return parsed;
}
