/** Geometry is calculated from numbers, never from an exported artwork path. */
export function chartDomain(series, kind, explicit, extraValues = []) {
  if (explicit) return explicit;
  const values = [0, ...extraValues];
  if (kind === "stacked-bar") {
    const count = series[0]?.values.length ?? 0;
    for (let i = 0; i < count; i++) {
      const bars = series.filter((item) => item.renderAs !== "line");
      values.push(
        bars.reduce((sum, item) => sum + Math.max(0, item.values[i]), 0),
        bars.reduce((sum, item) => sum + Math.min(0, item.values[i]), 0),
      );
    }
  }
  for (const item of series) values.push(...item.values);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) max = min + 1;
  const magnitude =
    10 ** Math.floor(Math.log10(Math.max(Math.abs(min), max) || 1));
  const step = magnitude / 2;
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  return { min, max };
}

export function chartY(value, domain, plot) {
  return (
    plot.y +
    plot.height * (1 - (value - domain.min) / (domain.max - domain.min))
  );
}

export function categoryX(index, count, plot, banded = false) {
  return banded
    ? plot.x + ((index + 0.5) / count) * plot.width
    : plot.x + (count === 1 ? 0.5 : index / (count - 1)) * plot.width;
}

export function chartPoints(values, domain, plot, banded = false) {
  return values.map((value, index) => ({
    x: categoryX(index, values.length, plot, banded),
    y: chartY(value, domain, plot),
    value,
  }));
}

export function linePath(points) {
  return points
    .map((point, i) => `${i ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");
}

export function pointRevealPositions(points) {
  let length = 0;
  const distances = points.map((point, i) => {
    if (i)
      length += Math.hypot(
        point.x - points[i - 1].x,
        point.y - points[i - 1].y,
      );
    return length;
  });
  return distances.map((distance) => (length ? distance / length : 0));
}

export function chartTicks(domain) {
  const desired = (domain.max - domain.min) / 5;
  const order = 10 ** Math.floor(Math.log10(desired));
  const fraction = desired / order;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * order;
  const ticks = [domain.min];
  for (
    let value = Math.ceil(domain.min / step) * step;
    value < domain.max;
    value += step
  ) {
    const stable = Number(value.toPrecision(12));
    if (stable > domain.min && stable < domain.max) ticks.push(stable);
  }
  ticks.push(domain.max);
  return ticks;
}

export function areaPath(points, baseline) {
  if (!points.length) return "";
  return `${linePath(points)} L${points.at(-1).x},${baseline} L${points[0].x},${baseline} Z`;
}

/** Positive/negative stacks are accumulated independently around the zero line. */
export function chartBars(series, kind, domain, plot) {
  const bars = series.filter((item) => item.renderAs !== "line");
  const count = series[0]?.values.length ?? 0;
  const band = plot.width / count;
  const slot = band * 0.64;
  const stacked = kind === "stacked-bar";
  const positive = Array(count).fill(0);
  const negative = Array(count).fill(0);
  return bars.flatMap((item, seriesIndex) =>
    item.values.map((value, categoryIndex) => {
      const baseline = stacked
        ? (value >= 0 ? positive : negative)[categoryIndex]
        : 0;
      const top = chartY(baseline + value, domain, plot);
      const bottom = chartY(baseline, domain, plot);
      const width = stacked ? slot : slot / bars.length;
      const center = categoryX(categoryIndex, count, plot, true);
      const x = center - slot / 2 + (stacked ? 0 : seriesIndex * width);
      if (stacked) (value >= 0 ? positive : negative)[categoryIndex] += value;
      return {
        seriesId: item.id,
        categoryIndex,
        value,
        baseline,
        x,
        y: Math.min(top, bottom),
        width: Math.max(0, width - (stacked ? 0 : 1.5)),
        height: Math.abs(top - bottom),
      };
    }),
  );
}

export function formatChartNumber(value, format = {}) {
  const { prefix = "", suffix = "", decimals = 0 } = format;
  return `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}
