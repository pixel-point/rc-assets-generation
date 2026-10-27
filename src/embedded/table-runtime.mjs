import { validateInternalMotion } from "../composition/internal-motion.mjs";
import { createNativeMotion } from "../native/runtime.mjs";
const own = (o, k) => Object.hasOwn(o ?? {}, k);
function record(o, name) {
  if (!o || typeof o !== "object" || Array.isArray(o))
    throw Error(`${name} must be an object.`);
  return o;
}

const safeId = (value, name) => {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(value) ||
    ["header", "__proto__", "constructor", "prototype"].includes(value)
  )
    throw Error(
      `${name} must be a stable slug; reserved IDs header, __proto__, constructor and prototype are not allowed.`,
    );
  return value;
};
const onlyKeys = (value, allowed, name) => {
  record(value, name);
  for (const key of Object.keys(value))
    if (!allowed.includes(key)) throw Error(`Unknown ${name} field ${key}.`);
};
function parseDataset(def, input) {
  if (!def.structural)
    throw Error("This table has no structural layout contract.");
  onlyKeys(input, ["columns", "rows"], "dataset");
  if (
    !Array.isArray(input.columns) ||
    input.columns.length < 1 ||
    input.columns.length > 10
  )
    throw Error("dataset.columns requires 1–10 columns.");
  if (
    !Array.isArray(input.rows) ||
    input.rows.length < 1 ||
    input.rows.length > 16
  )
    throw Error("dataset.rows requires 1–16 rows.");
  const columnIds = new Set(),
    rowIds = new Set();
  const columns = input.columns.map((column) => {
    onlyKeys(
      column,
      ["id", "label", "weight", "align", "format", "display"],
      "dataset column",
    );
    const id = safeId(column.id, "Column ID");
    if (columnIds.has(id)) throw Error(`Duplicate dataset column ${id}.`);
    columnIds.add(id);
    if (typeof column.label !== "string" || column.label.length > 160)
      throw Error(`Column ${id} label must be a string up to 160 characters.`);
    if (
      column.weight !== undefined &&
      (!Number.isFinite(column.weight) ||
        column.weight < 0.25 ||
        column.weight > 4)
    )
      throw Error(`Column ${id} weight must be between 0.25 and 4.`);
    if (
      column.align !== undefined &&
      !["left", "center", "right"].includes(column.align)
    )
      throw Error(`Column ${id} align must be left, center or right.`);
    if (
      column.display !== undefined &&
      !["text", "bar", "avatar"].includes(column.display)
    )
      throw Error(`Column ${id} display must be text, bar or avatar.`);
    const source = def.structural.columns.find((c) => c.id === id),
      format = { ...(source?.format ?? {}), ...(column.format ?? {}) };
    if (column.format !== undefined)
      onlyKeys(
        column.format,
        ["prefix", "suffix", "decimals", "grouping"],
        `column ${id} format`,
      );
    for (const key of ["prefix", "suffix"])
      if (
        format[key] !== undefined &&
        (typeof format[key] !== "string" || format[key].length > 12)
      )
        throw Error(`${key} must be a string up to 12 characters.`);
    if (
      format.decimals !== undefined &&
      (!Number.isInteger(format.decimals) ||
        format.decimals < 0 ||
        format.decimals > 6)
    )
      throw Error("decimals must be an integer from 0 to 6.");
    if (format.grouping !== undefined && typeof format.grouping !== "boolean")
      throw Error("grouping must be boolean.");
    return {
      id,
      label: column.label,
      weight: column.weight ?? 1,
      align: column.align ?? (def.structural.cohort ? "center" : "left"),
      display: column.display ?? source?.display ?? "text",
      format,
    };
  });
  const rows = input.rows.map((row) => {
    onlyKeys(row, ["id", "cells"], "dataset row");
    const id = safeId(row.id, "Row ID");
    if (rowIds.has(id)) throw Error(`Duplicate dataset row ${id}.`);
    rowIds.add(id);
    record(row.cells, `Row ${id} cells`);
    if (
      Object.keys(row.cells).length !== columns.length ||
      Object.keys(row.cells).some((k) => !columnIds.has(k))
    )
      throw Error(
        `Row ${id} must contain exactly the declared column IDs; use null for an empty cell.`,
      );
    const cells = Object.fromEntries(
      columns.map((column) => {
        const value = row.cells[column.id];
        if (
          value !== null &&
          !(
            (typeof value === "number" &&
              Number.isFinite(value) &&
              Math.abs(value) <= 1e12) ||
            (typeof value === "string" && value.length <= 160)
          )
        )
          throw Error(
            `Cell ${id}:${column.id} must be null, a finite number within ±1e12, or a string up to 160 characters.`,
          );
        if (
          column.display === "bar" &&
          value !== null &&
          (typeof value !== "number" || value < 0 || value > 100)
        )
          throw Error(
            `Bar cell ${id}:${column.id} must be a number between 0 and 100 or null.`,
          );
        return [column.id, value];
      }),
    );
    return { id, cells };
  });
  return { columns, rows };
}
const widthUnits = (text) =>
  [...String(text)].reduce(
    (n, ch) =>
      n +
      (/\s/.test(ch)
        ? 0.35
        : /[ilI.,'’!:;|]/.test(ch)
          ? 0.34
          : /[MW@%#]/.test(ch)
            ? 1
            : /[^\u0020-\u007e]/.test(ch)
              ? 1
              : 0.66),
    0,
  );
export function tableTextLines(text, fontSize, width, maxLines = 2) {
  const words = String(text ?? "").split(/\s+/),
    lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (widthUnits(next) * fontSize <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (widthUnits(word) * fontSize > width) return null;
  }
  if (line || !lines.length) lines.push(line);
  return lines.length <= maxLines ? lines : null;
}
export function datasetTableDefinition(source, dataset, tracks = []) {
  const { width, height } = source.structural.area;
  const total = dataset.columns.reduce((v, c) => v + c.weight, 0),
    rowHeight = height / (dataset.rows.length + 1),
    minimum = source.structural.fontSize * 0.65;
  let fontSize = Math.min(source.structural.fontSize * 1.1, rowHeight * 0.42),
    layout;
  const make = (size) => {
    let x = 0;
    const columns = dataset.columns.map((c) => {
      const column = { ...c, x, width: (width * c.weight) / total };
      x += column.width;
      return column;
    });
    const fields = [];
    for (const [ri, row] of [
      {
        id: "header",
        cells: Object.fromEntries(dataset.columns.map((c) => [c.id, c.label])),
      },
      ...dataset.rows,
    ].entries())
      for (const column of columns) {
        const value = row.cells[column.id],
          format = row.id === "header" ? {} : column.format;
        const field = {
          rowId: row.id,
          columnId: column.id,
          defaultValue: value,
          defaultText: String(value ?? ""),
          format,
          bindings: [
            {
              nodeKey: `dataset:${row.id}:${column.id}`,
              bounds: {
                x: column.x,
                y: ri * rowHeight,
                width: column.width,
                height: rowHeight,
              },
            },
          ],
          display: row.id === "header" ? "text" : column.display,
          align: column.align,
        };
        const padding = size * 0.65,
          extra =
            field.display === "avatar"
              ? size * 1.8
              : field.display === "bar"
                ? column.width * 0.4
                : 0,
          available = column.width - padding * 2 - extra;
        const values = [
          value,
          ...tracks
            .filter(
              (t) =>
                t.target === `cell:${row.id}:${column.id}` &&
                t.property === "value",
            )
            .flatMap((t) => t.keyframes.map((k) => k.value)),
        ];
        if (
          available < size * 2 ||
          values.some(
            (v) =>
              !tableTextLines(
                tableFieldText(field, v),
                size,
                available,
                typeof v === "number" ? 1 : 2,
              ),
          )
        )
          return null;
        const lines = tableTextLines(
          tableFieldText(field, value),
          size,
          available,
          typeof value === "number" ? 1 : 2,
        );
        if (lines.length * size * 1.2 > rowHeight - size * 0.5) return null;
        fields.push(field);
      }
    return { columns, fields, fontSize: size, rowHeight, padding: size * 0.65 };
  };
  while (fontSize >= minimum - 1e-8) {
    layout = make(fontSize);
    if (layout) break;
    fontSize -= source.structural.fontSize * 0.025;
  }
  if (!layout)
    throw Error(
      `Dataset does not fit the authored ${Math.round(width)}×${Math.round(height)} table area at its minimum text size. Use fewer rows/columns, shorter labels, or larger column weights.`,
    );
  return {
    ...source,
    tableBounds: { x: 0, y: 0, width, height },
    columns: layout.columns,
    rows: dataset.rows.map((r) => ({
      id: r.id,
      label: String(r.cells[dataset.columns[0].id] ?? r.id),
    })),
    fields: layout.fields,
    datasetLayout: layout,
  };
}

export function parseEmbeddedTable(def, props = {}) {
  record(props, "Table props");
  for (const k of Object.keys(props))
    if (!["cells", "columns", "dataset"].includes(k))
      throw Error(`Unknown table prop ${k}; use cells, columns or dataset.`);
  if (props.dataset !== undefined) {
    if (props.cells !== undefined || props.columns !== undefined)
      throw Error("dataset cannot be combined with sparse cells/columns.");
    const dataset = parseDataset(def, props.dataset);
    datasetTableDefinition(def, dataset);
    return {
      dataset,
      columns: Object.fromEntries(dataset.columns.map((c) => [c.id, c.label])),
      cells: Object.fromEntries(
        dataset.rows.map((r) => [r.id, { ...r.cells }]),
      ),
    };
  }
  const out = {
    columns: { ...def.defaults.columns },
    cells: Object.fromEntries(
      Object.entries(def.defaults.cells).map(([r, c]) => [r, { ...c }]),
    ),
  };
  if (props.columns !== undefined)
    for (const [col, value] of Object.entries(
      record(props.columns, "columns"),
    )) {
      if (!own(out.columns, col)) throw Error(`Unknown table column ${col}.`);
      if (typeof value !== "string" || value.length > 160)
        throw Error(`Column ${col} must be a string up to 160 characters.`);
      out.columns[col] = value;
    }
  if (props.cells !== undefined)
    for (const [row, cells] of Object.entries(record(props.cells, "cells"))) {
      if (!own(out.cells, row)) throw Error(`Unknown table row ${row}.`);
      for (const [col, value] of Object.entries(
        record(cells, `cells.${row}`),
      )) {
        if (!own(out.cells[row], col))
          throw Error(`Unknown or noneditable table cell ${row}:${col}.`);
        const original = out.cells[row][col];
        if (
          typeof value !== typeof original ||
          (typeof value === "number" &&
            (!Number.isFinite(value) || Math.abs(value) > 1e12)) ||
          (typeof value === "string" && value.length > 160)
        )
          throw Error(
            `Cell ${row}:${col} requires ${typeof original === "number" ? "a finite number within ±1e12" : "a string up to 160 characters"}.`,
          );
        const field = def.fields.find(
          (f) => f.rowId === row && f.columnId === col,
        );
        if (field.bar && (value < 0 || value > 100))
          throw Error(
            `Table percent cell ${row}:${col} must be between 0 and 100.`,
          );
        out.cells[row][col] = value;
      }
    }
  return out;
}
export function getEmbeddedTableContract(def, props = {}) {
  const sourceDefinition = def;
  const defaults = parseEmbeddedTable(def, props),
    motionTargets = {};
  if (defaults.dataset) def = datasetTableDefinition(def, defaults.dataset);
  const common = ["translateX", "translateY", "rotate", "scale", "opacity"];
  const add = (id, label, properties = common) =>
    (motionTargets[id] = {
      componentId: def.componentId,
      nodeId: id,
      label,
      aliases: [],
      properties,
    });
  add("table", "Table cells and source grid fragments");
  add("header", "Table header");
  for (const c of def.columns) add(`column:${c.id}`, `${c.label} column`);
  for (const r of def.rows) add(`row:${r.id}`, `${r.label} row`);
  for (const f of def.fields)
    if (f.rowId !== "header")
      add(`cell:${f.rowId}:${f.columnId}`, `${f.rowId} / ${f.columnId}`, [
        ...common,
        ...(typeof f.defaultValue === "number" ? ["value"] : []),
      ]);
  const object = (properties) => ({
    type: "object",
    additionalProperties: false,
    properties,
  });
  const valueSchema = (v) =>
    typeof v === "number"
      ? { type: "number", minimum: -1e12, maximum: 1e12 }
      : { type: "string", maxLength: 160 };
  const columnSchema = Object.fromEntries(
    Object.keys(defaults.columns).map((k) => [
      k,
      { type: "string", maxLength: 160 },
    ]),
  );
  const cellSchema = Object.fromEntries(
    Object.entries(defaults.cells).map(([row, cells]) => [
      row,
      object(
        Object.fromEntries(
          Object.entries(cells).map(([key, value]) => [
            key,
            def.fields.find((f) => f.rowId === row && f.columnId === key)?.bar
              ? { type: "number", minimum: 0, maximum: 100 }
              : valueSchema(value),
          ]),
        ),
      ),
    ]),
  );
  const propsSchema = object({
    columns: object(columnSchema),
    cells: object(cellSchema),
    dataset: {
      type: "object",
      additionalProperties: false,
      required: ["columns", "rows"],
      properties: {
        columns: {
          type: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            type: "object",
            required: ["id", "label"],
            properties: {
              id: { type: "string", pattern: "^[A-Za-z0-9_-]{1,64}$" },
              label: { type: "string", maxLength: 160 },
              weight: { type: "number", minimum: 0.25, maximum: 4 },
              align: { enum: ["left", "center", "right"] },
              display: { enum: ["text", "bar", "avatar"] },
              format: { type: "object" },
            },
            additionalProperties: false,
          },
        },
        rows: {
          type: "array",
          minItems: 1,
          maxItems: 16,
          items: {
            type: "object",
            required: ["id", "cells"],
            properties: {
              id: { type: "string", pattern: "^[A-Za-z0-9_-]{1,64}$" },
              cells: {
                type: "object",
                additionalProperties: { type: ["string", "number", "null"] },
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
  });
  return {
    id: def.id,
    name: def.name,
    kind: "table",
    fields: {},
    defaults: defaults.dataset ? { dataset: defaults.dataset } : defaults,
    datasetTemplate: sourceDefinition.structural
      ? {
          columns: sourceDefinition.structural.columns.map((c) => ({
            id: c.id,
            label: sourceDefinition.defaults.columns[c.id],
            format: c.format,
            display: c.display,
          })),
          rows: Object.entries(sourceDefinition.defaults.cells).map(
            ([id, cells]) => ({
              id,
              cells: Object.fromEntries(
                sourceDefinition.columns.map((c) => [
                  c.id,
                  cells[c.id] ?? null,
                ]),
              ),
            }),
          ),
        }
      : undefined,
    motionTargets,
    propsSchema,
    limitations: def.limitations,
    sourceTextBindings: def.sourceTextBindings,
  };
}
export function validateEmbeddedTable(
  def,
  props = {},
  tracks = [],
  durationFrames = 1800,
) {
  const contract = getEmbeddedTableContract(def, props);
  const parsed = validateInternalMotion(
    { components: { [def.componentId]: contract } },
    def.componentId,
    tracks,
    durationFrames,
  );
  if (contract.defaults.dataset)
    def = datasetTableDefinition(def, contract.defaults.dataset, parsed);
  for (const track of parsed) {
    if (track.property !== "value") continue;
    const field = def.fields.find(
      (f) => track.target === `cell:${f.rowId}:${f.columnId}`,
    );
    if (
      (field?.bar || field?.display === "bar") &&
      track.keyframes.some((k) => k.value < 0 || k.value > 100)
    )
      throw Error(
        `Table percent cell ${track.target} keyframes must be between 0 and 100.`,
      );
  }
  return parsed;
}
export function resolveEmbeddedTable(
  def,
  props = {},
  tracks = [],
  frame = 0,
  durationFrames = 1800,
) {
  const contract = getEmbeddedTableContract(def, props),
    parsed = validateEmbeddedTable(def, props, tracks, durationFrames);
  return {
    sourceDefinition: def,
    definition: contract.defaults.dataset
      ? datasetTableDefinition(def, contract.defaults.dataset, parsed)
      : def,
    props: parseEmbeddedTable(def, props),
    contract,
    tracks: parsed,
    frame,
    motion: createNativeMotion(contract, parsed, frame),
  };
}
export function tableFieldText(field, value) {
  if (typeof value !== "number") return value ?? "";
  const f = field.format ?? {};
  return `${f.prefix ?? ""}${value.toLocaleString("en-US", { useGrouping: f.grouping ?? false, minimumFractionDigits: f.decimals ?? 0, maximumFractionDigits: f.decimals ?? 0 })}${f.suffix ?? ""}`;
}

const identity = [1, 0, 0, 1, 0, 0];
const multiply = (a, b) => [
  a[0] * b[0] + a[2] * b[1],
  a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4],
  a[1] * b[4] + a[3] * b[5] + a[5],
];
const union = (boxes) => {
  const x = Math.min(...boxes.map((b) => b.x)),
    y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
    height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
  };
};
export function tableTargetBounds(def, target) {
  if (target === "table") return def.tableBounds;
  const fields = def.fields.filter((f) =>
    target === "header"
      ? f.rowId === "header"
      : target.startsWith("row:")
        ? f.rowId === target.slice(4)
        : target.startsWith("column:")
          ? f.columnId === target.slice(7)
          : target === `cell:${f.rowId}:${f.columnId}`,
  );
  if (!fields.length)
    throw Error(`Table target ${target} has no source geometry.`);
  return union(fields.flatMap((f) => f.bindings.map((b) => b.bounds)));
}
export function tableMotionMatrix(instance, targets) {
  let matrix = identity,
    opacity = 1;
  for (const target of targets) {
    const style = instance.motion.style(target),
      b = tableTargetBounds(instance.definition, target),
      cx = b.x + b.width / 2,
      cy = b.y + b.height / 2;
    if (style.opacity !== undefined) opacity *= style.opacity;
    const t = String(style.transform || ""),
      move = t.match(/translate3d\(([-\d.e]+)px, ([-\d.e]+)px, 0\)/),
      rot = t.match(/rotate\(([-\d.e]+)deg\)/),
      sc = t.match(/scale\(([-\d.e]+)\)/);
    const angle = (Number(rot?.[1] || 0) * Math.PI) / 180,
      s = Number(sc?.[1] || 1),
      a = Math.cos(angle) * s,
      v = Math.sin(angle) * s;
    matrix = multiply(matrix, [
      a,
      v,
      -v,
      a,
      Number(move?.[1] || 0) + cx - a * cx + v * cy,
      Number(move?.[2] || 0) + cy - v * cx - a * cy,
    ]);
  }
  return {
    matrix,
    opacity,
    changed:
      opacity !== 1 || matrix.some((v, i) => Math.abs(v - identity[i]) > 1e-10),
  };
}
export function tableElementStyle(instance, binding, targets, base = {}) {
  const state = tableMotionMatrix(instance, targets);
  if (!state.changed) return base;
  const b = binding.bounds,
    source = String(base.transform || ""),
    parts = String(base.transformOrigin || "50% 50%").split(/\s+/);
  const origin = (v, size) =>
    v === "center"
      ? size / 2
      : v === "left" || v === "top"
        ? 0
        : v === "right" || v === "bottom"
          ? size
          : v.endsWith("%")
            ? (parseFloat(v) * size) / 100
            : parseFloat(v) || 0;
  const ox = origin(parts[0], b.width),
    oy = origin(parts[1] || parts[0], b.height);
  let x = b.x,
    y = b.y;
  // Bounds include the generated centering translation; CSS origin precedes it.
  if (/translate\(-50%/.test(source)) x += b.width / 2;
  if (/translate\([^,]+,\s*-50%/.test(source)) y += b.height / 2;
  const [a, v, c, d, e, f] = state.matrix,
    local = [
      a,
      v,
      c,
      d,
      e + (a - 1) * (x + ox) + c * (y + oy),
      f + v * (x + ox) + (d - 1) * (y + oy),
    ];
  const round = (n) => (Math.abs(n) < 1e-10 ? 0 : Number(n.toFixed(8)));
  return {
    ...base,
    opacity:
      (typeof base.opacity === "number" ? base.opacity : 1) * state.opacity,
    transform: `matrix(${local.map(round).join(",")})${source ? " " + source : ""}`,
  };
}
