export type Domain = { min: number; max: number };
export type Plot = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number; value: number };
export type NumberFormat = {
  prefix?: string;
  suffix?: string;
  decimals?: number;
};
export type GeometrySeries = {
  id: string;
  values: number[];
  renderAs?: string;
};
export function chartDomain(
  series: GeometrySeries[],
  kind: string,
  explicit?: Domain,
  extraValues?: number[],
): Domain;
export function chartY(value: number, domain: Domain, plot: Plot): number;
export function categoryX(
  index: number,
  count: number,
  plot: Plot,
  banded?: boolean,
): number;
export function chartPoints(
  values: number[],
  domain: Domain,
  plot: Plot,
  banded?: boolean,
): Point[];
export function linePath(points: Point[]): string;
export function pointRevealPositions(points: Point[]): number[];
export function chartTicks(domain: Domain): number[];
export function areaPath(points: Point[], baseline: number): string;
export function chartBars(
  series: GeometrySeries[],
  kind: string,
  domain: Domain,
  plot: Plot,
): Array<{
  seriesId: string;
  categoryIndex: number;
  value: number;
  baseline: number;
  x: number;
  y: number;
  width: number;
  height: number;
}>;
export function formatChartNumber(value: number, format?: NumberFormat): string;
