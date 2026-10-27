import type { CSSProperties, ReactNode } from "react";
import type { NativeTableData } from "./schema.mjs";
import type { NativeMotion } from "./runtime.mjs";

type Column = NativeTableData["columns"][number];
type Cell = NativeTableData["rows"][number]["cells"][string];
type Format = NonNullable<Column["format"]>;
const INK = "#3D3D5C";
const BORDER = "#E3E5EB";
const BLUE = "#576CDB";
const GREEN = "#11D483";
const RED = "#F2545B";

export function formatTableValue(
  value: string | number | null,
  format: Format = {},
) {
  if (value === null) return "";
  if (typeof value === "string") return value;
  const decimals = format.decimals ?? 0;
  return `${format.prefix ?? ""}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${format.suffix ?? ""}`;
}

export function tableHeatColor(
  value: number,
  min: number,
  max: number,
  color: string,
) {
  const progress = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const channels = color
    .replace("#", "")
    .match(/../g)!
    .map((hex) => Number.parseInt(hex, 16));
  return `rgba(${channels.join(", ")}, ${0.045 + progress * 0.14})`;
}

export function tableLayout(data: NativeTableData) {
  const hasTitle = Boolean(data.title || data.subtitle);
  const titleHeight = hasTitle ? (data.theme === "prediction" ? 61.35 : 44) : 0;
  const rowHeight =
    data.rowHeight ??
    (data.theme === "cohort"
      ? (data.height - titleHeight - 31.4) / data.rows.length
      : (data.height - titleHeight) / (data.rows.length + 1));
  const headerHeight = data.theme === "cohort" ? 31.4 : rowHeight;
  const weights = data.columns.map((column) => column.width ?? 1);
  const total = weights.reduce((sum, width) => sum + width, 0);
  let left = 0;
  const columns = data.columns.map((column, index) => {
    const width = (weights[index] / total) * data.width;
    const geometry = { id: column.id, left, width };
    left += width;
    return geometry;
  });
  return { titleHeight, headerHeight, rowHeight, columns };
}

function PersonIcon({
  color,
  text,
  size,
}: {
  color: string;
  text?: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="8" fill={color} />
      {text ? (
        <text
          x="8"
          y="8.4"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="white"
          fontFamily="Inter"
          fontSize="6.5"
          fontWeight="600"
        >
          {text}
        </text>
      ) : (
        <>
          <circle cx="8.00837" cy="6.28767" r="2.28571" fill="white" />
          <path
            d="M4.00391 10.685C4.00391 10.4829 4.07924 10.2881 4.24035 10.1661C4.70084 9.8176 5.86519 9.14648 8.00391 9.14648C10.1426 9.14648 11.307 9.8176 11.7675 10.1661C11.9286 10.2881 12.0039 10.4829 12.0039 10.685V11.1903C12.0039 11.6395 11.6398 12.0036 11.1906 12.0036H4.81721C4.36803 12.0036 4.00391 11.6395 4.00391 11.1903V10.685Z"
            fill="white"
          />
        </>
      )}
    </svg>
  );
}

export function NativeTable({
  data,
  motion,
}: {
  data: NativeTableData;
  motion: NativeMotion;
}) {
  const layout = tableLayout(data);
  const cohort = data.theme === "cohort";
  const prediction = data.theme === "prediction";
  const conversion = data.theme === "conversion";
  const feedback = data.theme === "feedback";
  const cohortTypeScale = cohort
    ? Math.min(1.5, Math.max(1, data.width / 380))
    : 1;
  const fontSize = cohort
    ? 9.05 * cohortTypeScale
    : prediction
      ? 15.497
      : conversion
        ? 8.8
        : data.theme === "entitlement"
          ? 12.117
          : 12;
  const padding = cohort
    ? 4 * cohortTypeScale
    : prediction
      ? 13
      : conversion
        ? 6
        : feedback
          ? 18
          : 14.3;
  const radius = cohort
    ? 5.5
    : prediction
      ? 7.917
      : conversion
        ? 7.795
        : feedback
          ? 10
          : 13.376;
  const shadow = cohort
    ? undefined
    : "0 0 1px rgba(23,32,67,0.18), 0 8px 32px rgba(87,108,219,0.07)";
  const formatFor = (cell: Cell, column: Column) =>
    typeof cell === "object" && cell !== null
      ? (cell.format ?? column.format)
      : column.format;
  const unpack = (cell: Cell) =>
    typeof cell === "object" && cell !== null ? cell : { value: cell };
  const numeric = data.rows.flatMap((row) =>
    data.columns
      .filter((column) => column.display === "heatmap")
      .flatMap((column) => {
        const value = unpack(row.cells[column.id]).value;
        return typeof value === "number" ? [value] : [];
      }),
  );
  const min = data.heatmap?.min ?? 0;
  const max = data.heatmap?.max ?? Math.max(1, ...numeric);
  const baseColor = data.heatmap?.color ?? BLUE;
  const bodyHeight = Math.max(0, data.height - layout.titleHeight);
  const columnMotion = (
    column: Column,
    rowTop: number,
    height: number,
    index: number,
  ): CSSProperties =>
    motion.style(`column:${column.id}`, {
      position: "absolute",
      left: layout.columns[index].left,
      top: 0,
      width: layout.columns[index].width,
      height,
      // Every fragment of a column shares the same column-space pivot.
      transformOrigin: `${layout.columns[index].width / 2}px ${bodyHeight / 2 - rowTop}px`,
    });
  const contentStyle = (column: Column): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent:
      column.align === "right"
        ? "flex-end"
        : column.align === "center"
          ? "center"
          : "flex-start",
    textAlign: column.align ?? "left",
    gap: 6,
    width: "100%",
    height: "100%",
    padding: `0 ${prediction && column.id === data.columns[0].id ? 8 : padding}px`,
    boxSizing: "border-box",
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1.15,
    overflow: "hidden",
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  });
  function cellContent(
    cell: Cell,
    column: Column,
    target: string,
  ): { node: ReactNode; background?: string } {
    const item = unpack(cell);
    const value =
      typeof item.value === "number"
        ? motion.value(target, item.value)
        : item.value;
    const color =
      item.tone === "positive"
        ? GREEN
        : item.tone === "negative"
          ? RED
          : baseColor;
    const isNumeric = typeof value === "number";
    const text = isNumeric
      ? formatTableValue(value, formatFor(cell, column))
      : (item.label ?? formatTableValue(value));
    const background =
      column.display === "heatmap" && isNumeric
        ? tableHeatColor(value, min, max, color)
        : undefined;
    if (value === null)
      return {
        background:
          column.display === "heatmap"
            ? tableHeatColor(min, min, max, color)
            : undefined,
        node: (
          <span
            aria-label="No value"
            style={{
              display: "block",
              width: "72%",
              maxWidth: prediction ? 70 : 130,
              height: cohort ? 5.8 : 7,
              borderRadius: 30,
              background: item.tone === "positive" ? "#E0F5EC" : "#F2F2F8",
            }}
          />
        ),
      };
    if (column.display === "bar" && isNumeric) {
      const rangeMin = data.heatmap?.min ?? 0;
      const rangeMax = data.heatmap?.max ?? 100;
      const progress = Math.max(
        0,
        Math.min(1, (value - rangeMin) / (rangeMax - rangeMin || 1)),
      );
      return {
        background,
        node: (
          <>
            <span
              style={{
                width: "48%",
                height: conversion ? 4 : 5,
                borderRadius: 5,
                background: "#EAEDF6",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  borderRadius: 5,
                  background: color,
                  opacity: 0.8,
                  transform: `scaleX(${progress})`,
                  transformOrigin: "0 50%",
                }}
              />
            </span>
            <span>{text}</span>
          </>
        ),
      };
    }
    if (column.display === "avatar")
      return {
        background,
        node: (
          <>
            <PersonIcon
              color={item.tone === "neutral" ? INK : color}
              text={item.avatar}
              size={(fontSize * 4) / 3}
            />
            <span>{text}</span>
          </>
        ),
      };
    if (column.display === "badge")
      return {
        background,
        node: (
          <span
            style={{
              padding: "3px 7px",
              borderRadius: 5,
              color,
              background: tableHeatColor(max, min, max, color),
            }}
          >
            {text}
          </span>
        ),
      };
    return { background, node: text };
  }
  return (
    <div
      role="table"
      aria-label={data.title || "RevenueCat table"}
      data-native-family="table"
      style={motion.style("table", {
        position: "relative",
        width: data.width,
        height: data.height,
        boxSizing: "border-box",
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontSize,
        fontWeight: 400,
        letterSpacing: cohort ? "-0.12px" : "-0.02em",
        color: INK,
        border: `1px solid ${BORDER}`,
        borderRadius: radius,
        boxShadow: shadow,
      })}
    >
      {layout.titleHeight > 0 ? (
        <div
          data-native-target="title"
          style={motion.style("title", {
            position: "absolute",
            left: 0,
            top: 0,
            width: data.width,
            height: layout.titleHeight,
            boxSizing: "border-box",
            padding: prediction ? "0 20px" : "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 18,
          })}
        >
          <span
            style={{
              fontSize: prediction ? 17.75 : 12 * cohortTypeScale,
              fontWeight: 600,
              letterSpacing: "-0.025em",
            }}
          >
            {data.title}
          </span>
          {data.subtitle ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                fontSize: prediction ? 12.913 : 10 * cohortTypeScale,
                fontWeight: 400,
              }}
            >
              {prediction ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: 2,
                    width: 37.384,
                    height: 19.792,
                    boxSizing: "border-box",
                    borderRadius: 14.294,
                    background: "#F3F3F5",
                  }}
                >
                  <span
                    style={{
                      width: 15.8,
                      height: 15.8,
                      borderRadius: "50%",
                      background: "#56DDB0",
                    }}
                  />
                </span>
              ) : null}
              {data.subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: -1,
          top: layout.titleHeight - 1,
          width: data.width,
          height: bodyHeight,
          borderRadius: layout.titleHeight
            ? `0 0 ${radius}px ${radius}px`
            : radius,
          overflow: "hidden",
        }}
      >
        <div
          role="row"
          data-native-target="header"
          style={motion.style("header", {
            position: "absolute",
            left: 0,
            top: 0,
            width: data.width,
            height: layout.headerHeight,
          })}
        >
          {data.columns.map((column, index) => (
            <div
              key={column.id}
              style={columnMotion(column, 0, layout.headerHeight, index)}
            >
              <div
                role="columnheader"
                style={{
                  ...contentStyle(column),
                  color:
                    cohort || prediction || conversion ? "#9195A1" : "#1F1F47",
                  fontSize: prediction ? 14.205 : conversion ? 7.8 : fontSize,
                  fontWeight: cohort || prediction || conversion ? 400 : 600,
                  borderBottom: `1px solid ${BORDER}`,
                  borderRight:
                    index < data.columns.length - 1 && !conversion
                      ? `1px solid ${BORDER}`
                      : undefined,
                }}
              >
                {column.label}
              </div>
            </div>
          ))}
        </div>
        {data.rows.map((row, rowIndex) => {
          const rowTop = layout.headerHeight + rowIndex * layout.rowHeight;
          return (
            <div
              key={row.id}
              role="row"
              data-native-target={`row:${row.id}`}
              style={motion.style(`row:${row.id}`, {
                position: "absolute",
                left: 0,
                top: rowTop,
                width: data.width,
                height: layout.rowHeight,
              })}
            >
              {data.columns.map((column, columnIndex) => {
                const target = `cell:${row.id}:${column.id}`;
                const content = cellContent(
                  row.cells[column.id],
                  column,
                  target,
                );
                return (
                  <div
                    key={column.id}
                    style={columnMotion(
                      column,
                      rowTop,
                      layout.rowHeight,
                      columnIndex,
                    )}
                  >
                    <div
                      role="cell"
                      data-native-target={target}
                      style={motion.style(target, {
                        ...contentStyle(column),
                        position: "relative",
                        background:
                          content.background ??
                          ((feedback || data.theme === "entitlement") &&
                          rowIndex % 2 === 1
                            ? "#F8F8FA"
                            : "#FFFFFF"),
                        borderRight:
                          columnIndex < data.columns.length - 1 && !conversion
                            ? `1px solid ${BORDER}`
                            : undefined,
                        borderBottom:
                          cohort || prediction
                            ? `1px solid ${BORDER}`
                            : undefined,
                      })}
                    >
                      {content.node}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
