import type { PieChartItem, PieChartItemKey } from './interfaces';

/**
 * Stable key used to address a slice from outside the chart.
 * Uses `id` when provided, otherwise falls back to `label`.
 */
export const getPieItemKey = (
  item: PieChartItem
): PieChartItemKey | undefined => item.id ?? item.label;

/**
 * Resolves the rendered slice index for a key.
 *
 * - Direct match on a rendered slice wins.
 * - If the key belongs to an item merged into the aggregated "Others" slice,
 *   the aggregated slice index is returned.
 * - Returns -1 when the key is null/undefined or not found.
 */
export const findPieSliceIndexByKey = (
  slices: PieChartItem[],
  key: PieChartItemKey | null | undefined
): number => {
  if (key === null || key === undefined) return -1;

  for (let i = 0; i < slices.length; i++) {
    if (getPieItemKey(slices[i]!) === key) return i;
  }

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i]!;
    if (!slice.isAggregated || !slice.groupedItems) continue;
    if (slice.groupedItems.some((item) => getPieItemKey(item) === key)) {
      return i;
    }
  }

  return -1;
};

/**
 * Content signature of the rendered slices. Used to detect real data changes
 * (instead of array identity changes caused by parent re-renders).
 */
export const getPieSelectionSignature = (slices: PieChartItem[]) =>
  slices
    .map(
      (slice) =>
        `${String(getPieItemKey(slice) ?? '')}:${slice.value}:${
          slice.isAggregated ? 1 : 0
        }`
    )
    .join('|');
