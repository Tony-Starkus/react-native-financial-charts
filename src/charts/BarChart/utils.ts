import type {
  BarChartItemDataInterface,
  BarChartItemKey,
  BarChartSegmentInterface,
} from './interfaces';

/**
 * Calculates a "nice" scale for chart axes.
 * Ensures ticks are round numbers (1, 2, 5, 10, 0.1, 0.01, etc.)
 */

export const calculateNiceScale = (
  minValue: number,
  maxValue: number,
  maxTicks: number = 5
) => {
  // Edge case: All values are 0 or equal
  if (minValue === maxValue) {
    if (maxValue === 0) maxValue = 1;
    else maxValue = maxValue + Math.abs(maxValue) * 0.1;
  }

  // Ensure range is never 0
  const range = maxValue - minValue;

  // 1. Calculate a "rough" step based on the desired number of ticks
  const roughStep = range / (maxTicks - 1);

  // 2. Normalize this step to a number between 1 and 10 (mantissa)
  // Example: 0.0000153 -> log10 is -4.8 -> exponent is -5 -> 1.53
  const stepPower = Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / Math.pow(10, stepPower);

  // 3. Choose a "nice" step from standard intervals [1, 2, 5, 10]
  let niceStep;
  if (normalizedStep < 1.5) niceStep = 1;
  else if (normalizedStep < 3) niceStep = 2;
  else if (normalizedStep < 7) niceStep = 5;
  else niceStep = 10;

  const step = niceStep * Math.pow(10, stepPower);

  // 4. Recalculate Min/Max based on the new nice step
  const niceMin = Math.floor(minValue / step) * step;
  const niceMax = Math.ceil(maxValue / step) * step;

  // 5. Generate Ticks
  // Determine precision needed to fix floating point errors
  // If step is 0.00002 (power -5), we need 5 decimal places
  const precision = stepPower < 0 ? Math.abs(stepPower) : 0;

  const ticks = [];
  const count = Math.round((niceMax - niceMin) / step);

  for (let i = 0; i <= count; i++) {
    const val = niceMin + i * step;
    // Fix artifacts like 0.00006000000000000001
    ticks.push(parseFloat(val.toFixed(precision)));
  }

  return {
    min: niceMin,
    max: niceMax,
    tickSpacing: step,
    ticks,
  };
};

const safeMagnitude = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

/**
 * Returns true when the item should be rendered as a stacked bar.
 */
export const isStackedItem = (item: BarChartItemDataInterface) =>
  Array.isArray(item.segments) && item.segments.length > 0;

/**
 * Sum of segment magnitudes (negative / non-finite values count as 0).
 */
export const getSegmentsTotal = (
  segments: BarChartItemDataInterface['segments']
) => {
  if (!segments) return 0;
  let total = 0;
  for (const segment of segments) total += safeMagnitude(segment.value);
  return total;
};

/**
 * Normalizes bar data so stacked items expose their stack total as `value`.
 * Non-stacked items are returned untouched (same reference).
 */
export const normalizeBarData = (
  data: BarChartItemDataInterface[]
): BarChartItemDataInterface[] =>
  data.map((item) =>
    isStackedItem(item)
      ? { ...item, value: getSegmentsTotal(item.segments) }
      : item
  );

export type BarStackSegmentRect = {
  /** Top Y coordinate of the segment. */
  y: number;
  /** Segment height in pixels (0 for empty segments). */
  height: number;
};

/**
 * WORKLET: Splits a bar of `barHeight` (ending at `barBottom`) into stacked
 * segment rects, bottom -> top in input order.
 *
 * `gap` is the space between visible segments. It is clamped so it never
 * consumes more than half of the bar height, which keeps the entry animation
 * smooth when the bar is still short.
 */
export const computeStackSegmentRects = (
  values: number[],
  barBottom: number,
  barHeight: number,
  gap: number = 0
): BarStackSegmentRect[] => {
  'worklet';
  const rects: BarStackSegmentRect[] = [];

  let total = 0;
  let visibleCount = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    const magnitude = Number.isFinite(v) && v > 0 ? v : 0;
    total += magnitude;
    if (magnitude > 0) visibleCount++;
  }

  if (total <= 0 || barHeight <= 0) {
    for (let i = 0; i < values.length; i++) {
      rects.push({ y: barBottom, height: 0 });
    }
    return rects;
  }

  const gapsCount = Math.max(visibleCount - 1, 0);
  const maxGap = gapsCount > 0 ? barHeight / 2 / gapsCount : 0;
  const effectiveGap = Math.max(0, Math.min(gap, maxGap));
  const available = barHeight - effectiveGap * gapsCount;

  let cursor = barBottom;
  let drawn = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    const magnitude = Number.isFinite(v) && v > 0 ? v : 0;
    if (magnitude <= 0) {
      rects.push({ y: cursor, height: 0 });
      continue;
    }

    const h = (magnitude / total) * available;
    cursor -= h;
    rects.push({ y: cursor, height: h });
    drawn++;

    if (drawn < visibleCount) cursor -= effectiveGap;
  }

  return rects;
};

/**
 * Stable key used to address a bar from outside the chart.
 * Uses `id` when provided, otherwise falls back to `label`.
 */
export const getBarItemKey = (
  item: BarChartItemDataInterface
): BarChartItemKey => item.id ?? item.label;

/**
 * Resolves the bar index for a key. Returns -1 for null/undefined/unknown keys.
 */
export const findBarIndexByKey = (
  data: BarChartItemDataInterface[],
  key: BarChartItemKey | null | undefined
): number => {
  if (key === null || key === undefined) return -1;
  for (let i = 0; i < data.length; i++) {
    if (getBarItemKey(data[i]!) === key) return i;
  }
  return -1;
};

/**
 * Horizontal scroll offset that centers the bar at `index`, clamped to the
 * scrollable range.
 */
export const getCenteredScrollOffset = (
  index: number,
  barWidth: number,
  spacing: number,
  paddingLeft: number,
  canvasWidth: number,
  contentWidth: number
) => {
  const itemX = paddingLeft + index * (barWidth + spacing);
  const centerOffsetX = itemX - canvasWidth / 2 + barWidth / 2;
  const maxOffset = Math.max(contentWidth - canvasWidth, 0);
  return Math.max(0, Math.min(centerOffsetX, maxOffset));
};

/**
 * Stable key of a segment: `id`, falling back to `label`.
 */
export const getSegmentKey = (
  segment: BarChartSegmentInterface
): BarChartItemKey | undefined => {
  'worklet';
  return segment.id ?? segment.label;
};

/**
 * Resolves the segment index of a stacked item for a key.
 * Returns -1 for missing item, non-stacked item, null/undefined/unknown key.
 */
export const findSegmentIndexByKey = (
  item: BarChartItemDataInterface | undefined,
  key: BarChartItemKey | null | undefined
): number => {
  if (!item?.segments || key === null || key === undefined) return -1;
  for (let i = 0; i < item.segments.length; i++) {
    if (getSegmentKey(item.segments[i]!) === key) return i;
  }
  return -1;
};

/**
 * WORKLET: Finds the segment under a Y coordinate.
 * Taps in a gap or above/below the stack resolve to the nearest visible
 * segment, so small segments stay easy to hit. Returns -1 when no segment
 * is visible.
 */
export const findSegmentIndexAtY = (
  rects: BarStackSegmentRect[],
  y: number
): number => {
  'worklet';
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]!;
    if (r.height <= 0) continue;
    const bottom = r.y + r.height;
    if (y >= r.y && y <= bottom) return i;
    const distance = y < r.y ? r.y - y : y - bottom;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
};

/**
 * WORKLET: Segment index under `y` for a stacked item at its final height.
 * Returns -1 for non-stacked items.
 */
export const hitTestStackSegment = (
  item: BarChartItemDataInterface,
  y: number,
  maxValue: number,
  maxBarHeight: number,
  graphBottom: number,
  gap: number
): number => {
  'worklet';
  const segments = item.segments;
  if (!segments || segments.length === 0 || maxValue <= 0) return -1;
  const values: number[] = [];
  for (let i = 0; i < segments.length; i++) values.push(segments[i]!.value);
  const barHeight = (item.value / maxValue) * maxBarHeight;
  const rects = computeStackSegmentRects(values, graphBottom, barHeight, gap);
  return findSegmentIndexAtY(rects, y);
};

/**
 * WORKLET: Series key of the segment under `y` for a stacked item, or null
 * when the item is not stacked / the segment has no key.
 */
export const hitTestStackSeriesKey = (
  item: BarChartItemDataInterface,
  y: number,
  maxValue: number,
  maxBarHeight: number,
  graphBottom: number,
  gap: number
): BarChartItemKey | null => {
  'worklet';
  const index = hitTestStackSegment(
    item,
    y,
    maxValue,
    maxBarHeight,
    graphBottom,
    gap
  );
  if (index < 0) return null;
  return getSegmentKey(item.segments![index]!) ?? null;
};

/**
 * WORKLET: How much a segment should be dimmed (0 = full color, 1 = fully
 * inactive) given the highlighted series and the animation progress.
 */
export const getSegmentDimAmount = (
  segmentKey: BarChartItemKey | undefined | null,
  activeKey: BarChartItemKey | null,
  progress: number
): number => {
  'worklet';
  if (activeKey === null) return 0;
  if (
    segmentKey !== undefined &&
    segmentKey !== null &&
    segmentKey === activeKey
  ) {
    return 0;
  }
  return Math.max(0, Math.min(1, progress));
};
