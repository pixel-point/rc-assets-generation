import { createElement, type ReactNode } from "react";
import {
  tableFieldText,
  tableMotionMatrix,
  tableTextLines,
  type EmbeddedTableInstance,
  type Bounds,
} from "./table-runtime.mjs";

const matrixProps = (instance: EmbeddedTableInstance, targets: string[]) => {
  const state = tableMotionMatrix(instance, targets);
  return {
    transform: state.changed ? `matrix(${state.matrix.join(" ")})` : undefined,
    opacity: state.opacity,
  };
};
const targetsFor = (row: string, column: string) => [
  "table",
  row === "header" ? "header" : `row:${row}`,
  `column:${column}`,
  ...(row === "header" ? [] : [`cell:${row}:${column}`]),
];
const colors = ["#576cdb", "#11d483", "#f2545b", "#3d3d5c"];

/** Native cells, grid and paint share the same per-cell geometry and motion. */
export function tableDatasetContent(
  instance: EmbeddedTableInstance,
): ReactNode {
  const def = instance.definition,
    layout = def.datasetLayout!,
    theme = def.structural!;
  const cells = def.fields.map((field) => {
    const box = field.bindings[0].bounds,
      header = field.rowId === "header",
      rowIndex = def.rows.findIndex((r) => r.id === field.rowId),
      colIndex = def.columns.findIndex((c) => c.id === field.columnId);
    const column = layout.columns[colIndex],
      base = header
        ? instance.props.columns[field.columnId]
        : instance.props.cells[field.rowId][field.columnId],
      value =
        typeof base === "number"
          ? instance.motion.value(`cell:${field.rowId}:${field.columnId}`, base)
          : base;
    const size = layout.fontSize,
      pad = layout.padding,
      avatar = !header && column.display === "avatar" && value !== null,
      bar = !header && column.display === "bar",
      extra = avatar ? size * 1.8 : bar ? box.width * 0.4 : 0;
    const lines =
      tableTextLines(
        tableFieldText(field, value),
        size,
        box.width - pad * 2 - extra,
        typeof value === "number" ? 1 : 2,
      ) ?? [];
    const align = column.align,
      anchor =
        align === "center" ? "middle" : align === "right" ? "end" : "start";
    const textX =
      align === "center"
        ? box.x + (box.width + extra) / 2
        : align === "right"
          ? box.x + box.width - pad
          : box.x + pad + extra;
    const fill = header
      ? "#ffffff"
      : theme.cohort && colIndex > 1
        ? colIndex === 2
          ? "#ededf9"
          : "#f7f7fc"
        : theme.rowStripe && rowIndex % 2 === 0
          ? "#f9f9fb"
          : "#ffffff";
    const contents: ReactNode[] = [
      createElement("rect", {
        key: "paint",
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        fill,
        stroke: theme.gridColor,
        strokeWidth: Math.max(0.3, size * 0.055),
      }),
    ];
    if (avatar) {
      const cx = box.x + pad + size * 0.6,
        cy = box.y + box.height / 2,
        r = size * 0.6;
      contents.push(
        createElement(
          "g",
          { key: "avatar" },
          createElement("circle", {
            cx,
            cy,
            r,
            fill: colors[rowIndex % colors.length],
          }),
          createElement("circle", {
            cx,
            cy: cy - r * 0.26,
            r: r * 0.25,
            fill: "white",
          }),
          createElement("path", {
            d: `M ${cx - r * 0.5} ${cy + r * 0.46} a ${r * 0.5} ${r * 0.38} 0 0 1 ${r} 0 Z`,
            fill: "white",
          }),
        ),
      );
    }
    if (bar && typeof value === "number") {
      const bw = box.width * 0.33,
        bh = size * 0.32;
      contents.push(
        createElement(
          "g",
          { key: "bar" },
          createElement("rect", {
            x: box.x + pad,
            y: box.y + box.height / 2 - bh / 2,
            width: bw,
            height: bh,
            rx: bh / 2,
            fill: "#ededf5",
          }),
          createElement("rect", {
            x: box.x + pad,
            y: box.y + box.height / 2 - bh / 2,
            width: (bw * value) / 100,
            height: bh,
            rx: bh / 2,
            fill: "#777cf4",
          }),
        ),
      );
    }
    contents.push(
      createElement(
        "text",
        {
          key: "text",
          x: textX,
          y: box.y + box.height / 2 - (lines.length - 1) * size * 0.6,
          fontFamily: theme.fontFamily,
          fontSize: size,
          fontWeight: header
            ? Math.max(500, theme.fontWeight)
            : theme.fontWeight,
          fill: header ? theme.headerColor : theme.color,
          textAnchor: anchor,
          dominantBaseline: "central",
        },
        ...lines.map((line, i) =>
          createElement(
            "tspan",
            { key: i, x: textX, dy: i ? size * 1.2 : 0 },
            line,
          ),
        ),
      ),
    );
    return createElement(
      "g",
      {
        key: `${field.rowId}:${field.columnId}`,
        "data-table-cell": `${field.rowId}:${field.columnId}`,
        ...matrixProps(instance, targetsFor(field.rowId, field.columnId)),
      },
      ...contents,
    );
  });
  return createElement("g", { "data-table-dataset": true }, ...cells);
}

/** Replace oversized original grid fragments, while retaining all source text. */
export function repairedSourceGrid(instance: EmbeddedTableInstance): ReactNode {
  const def = instance.definition,
    area = def.defaultGrid!.area;
  const headers = def.columns.map((column) => ({
    id: column.id,
    b: def.fields.find((f) => f.rowId === "header" && f.columnId === column.id)!
      .bindings[0].bounds,
  }));
  const sourceRows = def.rows.map((row) => ({
    id: row.id,
    b: def.fields.find((f) => f.rowId === row.id)!.bindings[0].bounds,
  }));
  const firstPitch =
    sourceRows.length > 1
      ? sourceRows[1].b.y - sourceRows[0].b.y
      : sourceRows[0].b.height * 3;
  const yBounds = [
    area.y,
    sourceRows[0].b.y + sourceRows[0].b.height / 2 - firstPitch / 2,
    ...sourceRows.map((r) => r.b.y + r.b.height / 2 + firstPitch / 2),
  ];
  const centers = headers.map((h) => h.b.x + h.b.width / 2),
    xs = [
      area.x,
      ...centers.slice(1).map((x, i) => (centers[i] + x) / 2),
      area.x + area.width,
    ];
  const elements: ReactNode[] = [];
  // The source cohort labels are outside the bordered data columns.
  for (let ri = 0; ri < yBounds.length - 1; ri++)
    for (let ci = 1; ci < headers.length; ci++) {
      const row = ri === 0 ? "header" : sourceRows[ri - 1].id,
        column = headers[ci].id;
      const paint = def.fields.find(
        (f) => f.rowId === row && f.columnId === column,
      )?.paintBounds;
      const x =
          ci === 1
            ? headers[1].b.x - headers[1].b.width * 0.19
            : (paint?.x ?? xs[ci]),
        right =
          ci === headers.length - 1
            ? area.x + area.width
            : (def.fields.find(
                (f) =>
                  f.rowId === sourceRows[0].id &&
                  f.columnId === headers[ci + 1].id,
              )?.paintBounds?.x ?? xs[ci + 1]);
      const box: Bounds = {
        x,
        y: yBounds[ri],
        width: right - x,
        height: Math.min(yBounds[ri + 1], area.y + area.height) - yBounds[ri],
      };
      elements.push(
        createElement(
          "g",
          {
            key: `${row}:${column}`,
            ...matrixProps(instance, targetsFor(row, column)),
          },
          createElement("rect", {
            ...box,
            fill: ri > 0 && ci === 2 ? "#ededf8" : "none",
            fillOpacity: 0.75,
            stroke: "#e3e5e8",
            strokeWidth: 0.8,
          }),
        ),
      );
    }
  return createElement("g", { "data-repaired-source-grid": true }, ...elements);
}
