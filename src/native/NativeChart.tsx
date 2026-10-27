import { useId, type CSSProperties } from "react";
import type { NativeChartData } from "./schema.mjs";
import type { NativeMotion } from "./runtime.mjs";
import {
  areaPath,
  categoryX,
  chartBars,
  chartDomain,
  chartPoints,
  chartY,
  formatChartNumber,
  linePath,
  pointRevealPositions,
  chartTicks,
} from "./chart-geometry.mjs";

const colors = {
  ink: "#1F1F47",
  muted: "#94979E",
  grid: "#EDF0F2",
  border: "#E3E5E8",
};
const sliceColors = [
  "#576CDB",
  "#F2545B",
  "#11D483",
  "#B8C2E0",
  "#3D3D5C",
  "#D5D9DD",
];
const groupStyle: CSSProperties = {
  transformBox: "fill-box",
  transformOrigin: "center",
};

function donutArc(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
) {
  // A near-full arc avoids SVG's coincident-endpoint full-circle ambiguity.
  const finish = Math.min(end, start + Math.PI * 2 - 0.000001);
  const pt = (radius: number, angle: number) => [
    cx + Math.cos(angle) * radius,
    cy + Math.sin(angle) * radius,
  ];
  const [a, b, c, d] = [
    pt(outer, start),
    pt(outer, finish),
    pt(inner, finish),
    pt(inner, start),
  ];
  const large = finish - start > Math.PI ? 1 : 0;
  return `M${a} A${outer},${outer} 0 ${large} 1 ${b} L${c} A${inner},${inner} 0 ${large} 0 ${d} Z`;
}

/** Native primitives; labels and plotted geometry share the same input data. */
export function NativeChart({
  data,
  motion,
}: {
  data: NativeChartData;
  motion: NativeMotion;
}) {
  const instanceId = useId().replace(/:/g, "");
  const { width, height, series, categories } = data;
  const subtitleHeight = data.subtitle ? 18 : 0;
  const hasMetrics = Boolean(data.metrics?.length);
  const legendRows = data.showLegend ? Math.ceil(series.length / 3) : 0;
  const headerHeight =
    48 + subtitleHeight + legendRows * 22 + (hasMetrics ? 62 : 0);
  const plot = {
    x: data.showAxes ? 54 : 20,
    y: headerHeight + 8,
    width: width - (data.showAxes ? 76 : 40),
    height: height - headerHeight - (data.showAxes ? 48 : 28),
  };
  const isBars = ["bar", "stacked-bar", "diverging-bar"].includes(data.kind);
  const pointTarget = (seriesId: string, categoryIndex: number) =>
    `point:${seriesId}:${categories[categoryIndex].id}`;
  const ranges = series.map((item) =>
    item.values.map((value, i) =>
      motion.valueRange(pointTarget(item.id, i), value),
    ),
  );
  // The scale includes every keyframe once, so axes never breathe during playback.
  const domains = [
    chartDomain(series, data.kind, data.domain),
    chartDomain(
      series.map((item, i) => ({
        ...item,
        values: ranges[i].map((range) => range[0]),
      })),
      data.kind,
      data.domain,
    ),
    chartDomain(
      series.map((item, i) => ({
        ...item,
        values: ranges[i].map((range) => range[1]),
      })),
      data.kind,
      data.domain,
    ),
  ];
  const domain = {
    min: Math.min(...domains.map((item) => item.min)),
    max: Math.max(...domains.map((item) => item.max)),
  };
  const animated = series.map((item) => ({
    ...item,
    values: item.values.map(
      (value, i) =>
        motion.value(pointTarget(item.id, i), value) *
        (isBars && item.renderAs !== "line"
          ? motion.progress(`bar:${item.id}:${categories[i].id}`) *
            motion.progress(`series:${item.id}`)
          : 1),
    ),
  }));
  const bars = isBars ? chartBars(animated, data.kind, domain, plot) : [];
  const baseline = chartY(
    Math.max(domain.min, Math.min(domain.max, 0)),
    domain,
    plot,
  );
  const axisStride = Math.max(1, Math.ceil(categories.length / 8));
  const annotationIndex = data.annotation
    ? categories.findIndex((item) => item.id === data.annotation?.categoryId)
    : -1;
  const annotationX = categoryX(
    annotationIndex,
    categories.length,
    plot,
    isBars,
  );
  const annotationWidth = Math.min(
    260,
    (data.annotation?.label.length ?? 0) * 6 + 24,
  );
  const donutValues = animated[0].values.map((value) => Math.max(0, value));
  const donutTotal = donutValues.reduce((sum, value) => sum + value, 0);
  let donutAngle = -Math.PI / 2;
  const donutRadius = Math.max(
    10,
    Math.min(plot.height / 2 - 8, plot.width * 0.24),
  );
  const donutX = plot.x + plot.width * 0.31;
  const donutY = plot.y + plot.height / 2;
  return (
    <div
      data-native-component="chart"
      style={{
        width,
        height,
        borderRadius: 12,
        background: "#FFFFFF",
        boxShadow: "0 8px 22px rgba(71,92,133,0.07)",
        border: `1px solid ${colors.border}`,
        boxSizing: "border-box",
        ...motion.style("chart"),
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={data.title || "Data chart"}
        style={{
          display: "block",
          overflow: "visible",
          fontFamily: '"Inter", sans-serif',
          fontSize: 11,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <defs>
          <clipPath id={`${instanceId}-plot`}>
            <rect
              x={plot.x - 1}
              y={plot.y - 3}
              width={plot.width + 2}
              height={plot.height + 6}
            />
          </clipPath>
          {animated.map((item) => (
            <linearGradient
              key={item.id}
              id={`${instanceId}-area-${item.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={item.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={item.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <text
          x={20}
          y={29}
          fill={colors.ink}
          fontFamily='"Object Sans", sans-serif'
          fontWeight={500}
          fontSize={15}
          style={motion.style("title", groupStyle)}
        >
          {data.title}
        </text>
        {data.subtitle && (
          <text x={20} y={46} fill={colors.muted} fontSize={10}>
            {data.subtitle}
          </text>
        )}
        <g style={motion.style("legend", groupStyle)}>
          {data.showLegend &&
            series.map((item, i) => (
              <g
                key={item.id}
                transform={`translate(${22 + ((i % 3) * (width - 42)) / 3},${53 + subtitleHeight + Math.floor(i / 3) * 22})`}
              >
                <circle r={3} fill={item.color} />
                <text x={9} y={4} fill={colors.ink} fontSize={10}>
                  {item.label}
                </text>
              </g>
            ))}
        </g>
        {hasMetrics && (
          <g>
            {data.metrics!.map((metric, i) => {
              const x = 20 + (i * (width - 40)) / data.metrics!.length;
              const y = 57 + subtitleHeight + legendRows * 22;
              return (
                <g key={metric.id} transform={`translate(${x},${y})`}>
                  <g style={motion.style(`metric:${metric.id}`, groupStyle)}>
                    <text
                      y={0}
                      fill={colors.ink}
                      fontSize={23}
                      letterSpacing={-0.6}
                    >
                      {formatChartNumber(
                        motion.value(`metric:${metric.id}`, metric.value),
                        metric.format,
                      )}
                    </text>
                    <circle cy={17} r={2.5} fill={metric.color || "#576CDB"} />
                    <text x={8} y={21} fill={colors.ink} fontSize={10}>
                      {metric.label}
                    </text>
                  </g>
                  {i > 0 && (
                    <line
                      x1={-13}
                      x2={-13}
                      y1={-19}
                      y2={22}
                      stroke={colors.grid}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}
        {data.kind !== "donut" && (
          <>
            {chartTicks(domain).map((value, i) => {
              const y = chartY(value, domain, plot);
              const tickDecimals =
                Number(value.toFixed(6)).toString().split(".")[1]?.length ?? 0;
              return (
                <g key={i}>
                  {data.showGrid && (
                    <line
                      x1={plot.x}
                      x2={plot.x + plot.width}
                      y1={y}
                      y2={y}
                      stroke={colors.grid}
                    />
                  )}
                  {data.showAxes && (
                    <text
                      x={plot.x - 9}
                      y={y + 3}
                      textAnchor="end"
                      fill={colors.muted}
                      fontSize={9}
                    >
                      {formatChartNumber(value, {
                        ...data.format,
                        decimals: Math.max(
                          data.format?.decimals ?? 0,
                          tickDecimals,
                        ),
                      })}
                    </text>
                  )}
                </g>
              );
            })}
            {categories.map((category, i) => {
              const x = categoryX(i, categories.length, plot, isBars);
              return (
                <g key={category.id}>
                  {data.showGrid && !isBars && (
                    <line
                      x1={x}
                      x2={x}
                      y1={plot.y}
                      y2={plot.y + plot.height}
                      stroke={colors.grid}
                    />
                  )}
                  {data.showAxes &&
                    (i % axisStride === 0 || i === categories.length - 1) && (
                      <text
                        x={x}
                        y={plot.y + plot.height + 23}
                        textAnchor="middle"
                        fill={colors.muted}
                        fontSize={9}
                      >
                        {category.label}
                      </text>
                    )}
                </g>
              );
            })}
            {isBars && (
              <line
                x1={plot.x}
                x2={plot.x + plot.width}
                y1={baseline}
                y2={baseline}
                stroke={colors.border}
              />
            )}
            <g clipPath={`url(#${instanceId}-plot)`}>
              {animated.map((item) => {
                const renderLine = !isBars || item.renderAs === "line";
                const points = chartPoints(item.values, domain, plot, isBars);
                const revealPositions = pointRevealPositions(points);
                const draw = motion.draw(`series:${item.id}`);
                return (
                  <g
                    key={item.id}
                    data-series-id={item.id}
                    style={motion.style(`series:${item.id}`, groupStyle)}
                  >
                    {renderLine ? (
                      <>
                        {data.kind === "area" && item.renderAs !== "line" && (
                          <g>
                            <clipPath id={`${instanceId}-reveal-${item.id}`}>
                              <rect
                                x={plot.x}
                                y={plot.y}
                                width={plot.width * draw}
                                height={plot.height}
                              />
                            </clipPath>
                            <path
                              d={areaPath(points, baseline)}
                              fill={`url(#${instanceId}-area-${item.id})`}
                              clipPath={`url(#${instanceId}-reveal-${item.id})`}
                            />
                          </g>
                        )}
                        <path
                          data-native-line={item.id}
                          d={linePath(points)}
                          fill="none"
                          stroke={item.color}
                          strokeWidth={1.8}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          pathLength={1}
                          strokeDasharray={
                            draw < 1
                              ? "1"
                              : item.dashed
                                ? "0.012 0.012"
                                : undefined
                          }
                          strokeDashoffset={draw < 1 ? 1 - draw : 0}
                        />
                        {data.showPoints &&
                          points.map((point, i) => (
                            <g
                              key={categories[i].id}
                              transform={`translate(${point.x},${point.y})`}
                            >
                              <circle
                                data-point-id={pointTarget(item.id, i)}
                                r={3.2}
                                fill={item.color}
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                style={motion.style(pointTarget(item.id, i), {
                                  ...groupStyle,
                                  opacity: draw >= revealPositions[i] ? 1 : 0,
                                })}
                              />
                            </g>
                          ))}
                      </>
                    ) : (
                      bars
                        .filter((bar) => bar.seriesId === item.id)
                        .map((bar) => (
                          <g
                            key={categories[bar.categoryIndex].id}
                            style={motion.style(
                              `bar:${item.id}:${categories[bar.categoryIndex].id}`,
                              groupStyle,
                            )}
                          >
                            <rect
                              data-bar-id={`${item.id}:${categories[bar.categoryIndex].id}`}
                              x={bar.x}
                              y={bar.y}
                              width={bar.width}
                              height={bar.height}
                              fill={item.color}
                              rx={1.5}
                            />
                          </g>
                        ))
                    )}
                  </g>
                );
              })}
            </g>
            {data.annotation && annotationIndex >= 0 && (
              <g style={motion.style("annotation", groupStyle)}>
                <line
                  x1={annotationX}
                  x2={annotationX}
                  y1={plot.y + 28}
                  y2={plot.y + plot.height}
                  stroke={data.annotation.color}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <g
                  transform={`translate(${Math.min(plot.x + plot.width - annotationWidth, Math.max(plot.x, annotationX + 8))},${plot.y + 8})`}
                >
                  <rect
                    y={-8}
                    width={annotationWidth}
                    height={26}
                    rx={4}
                    fill="#FFFFFF"
                    stroke={colors.border}
                  />
                  <circle cx={11} cy={5} r={3.5} fill={data.annotation.color} />
                  <text x={20} y={9} fill={colors.ink} fontSize={10}>
                    {data.annotation.label}
                  </text>
                </g>
              </g>
            )}
          </>
        )}
        {data.kind === "donut" && (
          <g style={motion.style(`series:${animated[0].id}`, groupStyle)}>
            <circle
              cx={donutX}
              cy={donutY}
              r={donutRadius * 0.78}
              fill="none"
              stroke={colors.grid}
              strokeWidth={donutRadius * 0.44}
            />
            {donutValues.map((value, i) => {
              const angle = donutTotal ? (value / donutTotal) * Math.PI * 2 : 0;
              const start = donutAngle;
              donutAngle += angle;
              const progress =
                motion.progress(`slice:${animated[0].id}:${categories[i].id}`) *
                motion.progress(`series:${animated[0].id}`);
              const color =
                categories[i].color || sliceColors[i % sliceColors.length];
              return (
                <g key={categories[i].id}>
                  {angle > 0 && progress > 0 && (
                    <path
                      data-slice-id={categories[i].id}
                      d={donutArc(
                        donutX,
                        donutY,
                        donutRadius,
                        donutRadius * 0.56,
                        start,
                        start + angle * progress,
                      )}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      style={motion.style(
                        `slice:${animated[0].id}:${categories[i].id}`,
                        groupStyle,
                      )}
                    />
                  )}
                  <g
                    transform={`translate(${plot.x + plot.width * 0.65},${plot.y + plot.height / 2 - categories.length * 14 + i * 28})`}
                  >
                    <circle r={3} fill={color} />
                    <text x={10} y={4} fill={colors.ink}>
                      {categories[i].label}
                    </text>
                    <text
                      x={plot.width * 0.3}
                      y={4}
                      textAnchor="end"
                      fill={colors.muted}
                    >
                      {formatChartNumber(value, data.format)}
                    </text>
                  </g>
                </g>
              );
            })}
            <text
              x={donutX}
              y={donutY + 4}
              textAnchor="middle"
              fill={colors.ink}
              fontSize={23}
            >
              {formatChartNumber(donutTotal, data.format)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
