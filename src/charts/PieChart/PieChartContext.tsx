import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import type {
  PieChartContextInterface,
  PieChartItem,
  PieChartRef,
  PieChartRootPropsInterface,
} from './interfaces';
import { useSharedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

export const PieChartContext = createContext<
  PieChartContextInterface | undefined
>(undefined);

const buildFallbackColor = (item: PieChartItem, index: number) => {
  // Deterministic fallback color:
  // the same item gets the same generated color across rerenders.
  const seed = `${item.label ?? ''}|${item.value}|${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 72%, 58%)`;
};

const PieChartProvider: React.FC<
  PieChartRootPropsInterface & {
    ref?: React.Ref<PieChartRef>;
  }
> = ({
  data,
  size = 300,
  donutRatio = 0.65,
  startAngle = 0,
  direction = 'clockwise',
  sliceGapAngle = 2,
  onSelect,
  onSelectAggregated,
  maxSlices,
  minSliceAngle = 6,
  othersLabel = 'Others',
  othersColor = '#A3A3A3',
  othersVisualAngle,
  ref,
  children,
}) => {
  // Core geometry for the chart. All drawing and hit-tests are based on this.
  // Keep the same ratio behavior across devices by deriving radii from `size`.
  const radius = (size / 2) * 0.85;
  const innerRadius = radius * donutRatio;
  const centerX = size / 2;
  const centerY = size / 2;

  const processedData = useMemo(() => {
    // 1) Normalize input:
    // - Ignore non-positive values (cannot create valid slices).
    // - Sort descending so the most relevant slices are evaluated first.
    const normalized = data
      .map((item, index) => ({
        ...item,
        // Color is optional in the public API. Generate one when missing.
        color: item.color ?? buildFallbackColor(item, index),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (normalized.length === 0) return [];

    const total = normalized.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) return [];

    // 2) Determine a safe minimum slice angle.
    // Keep this threshold simple and predictable. A very aggressive geometric
    // threshold was causing all slices to collapse into "Others" on larger datasets.
    const geometricMinAngle = Math.max(0.5, minSliceAngle);

    // 3) Estimate how many slices can fit without visual overlap:
    // maxByGeometry  -> capacity based on angle + configured slice gap
    // hardCap        -> explicit user cap (if provided)
    // safeMaxSlices  -> final number of slices we can render, including "Others"
    const maxByGeometry = Math.max(
      2,
      Math.floor(360 / (geometricMinAngle + sliceGapAngle))
    );
    const hardCap =
      typeof maxSlices === 'number' && maxSlices >= 2
        ? Math.floor(maxSlices)
        : Number.POSITIVE_INFINITY;

    const safeMaxSlices = Math.max(2, Math.min(maxByGeometry, hardCap));
    const maxMainSlices = safeMaxSlices - 1;

    const mainSlices: PieChartItem[] = [];
    const othersSlices: PieChartItem[] = [];

    // 4) Split data into visible "main" slices and overflow "others" bucket.
    // A slice is kept as main only if:
    // - we still have room (`maxMainSlices`)
    // - and its angle is above the minimum visible angle.
    for (let i = 0; i < normalized.length; i++) {
      const item = normalized[i]!;
      const sweepAngle = (item.value / total) * 360;

      const canKeepAsMain =
        mainSlices.length < maxMainSlices && sweepAngle >= geometricMinAngle;

      if (canKeepAsMain) {
        mainSlices.push(item);
      } else {
        othersSlices.push(item);
      }
    }

    // 5) Safety rule: never allow chart to become 100% "Others".
    // If that happens, promote the largest slice into the visible set.
    if (mainSlices.length === 0 && normalized.length > 0) {
      const largest = normalized[0]!;
      mainSlices.push(largest);

      const idx = othersSlices.findIndex(
        (slice) =>
          slice.label === largest.label &&
          slice.value === largest.value &&
          slice.color === largest.color
      );
      if (idx >= 0) othersSlices.splice(idx, 1);
    }

    if (othersSlices.length === 0) {
      // No aggregation needed. `renderValue` mirrors real value.
      return mainSlices.map((item) => ({
        ...item,
        renderValue: item.value,
      }));
    }

    // 6) Ensure the aggregated slice itself has enough angular room to render.
    // If "Others" gets too small, move the smallest main slices into Others
    // until the bucket reaches a visible threshold.
    while (mainSlices.length > 1) {
      const othersValueCandidate = othersSlices.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const othersAngleCandidate = (othersValueCandidate / total) * 360;
      if (othersAngleCandidate >= geometricMinAngle) break;

      const moved = mainSlices.pop();
      if (!moved) break;
      othersSlices.unshift(moved);
    }

    const othersValue = othersSlices.reduce((sum, item) => sum + item.value, 0);
    if (othersValue <= 0) {
      // Fallback: if aggregation collapsed to zero, keep only main slices.
      return mainSlices.map((item) => ({
        ...item,
        renderValue: item.value,
      }));
    }

    const mainValueTotal = mainSlices.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const mainMinAngle =
      mainSlices.length > 0
        ? Math.min(
            ...mainSlices.map((item) => (item.value / mainValueTotal) * 360)
          )
        : 360;

    // 7) Compute a visual angle for "Others".
    // Goal: keep Others visible but still less prominent than main slices.
    const minVisibleOthersAngle = sliceGapAngle + 1;
    const preferredOthersAngle =
      typeof othersVisualAngle === 'number' && othersVisualAngle > 0
        ? othersVisualAngle
        : Math.max(minVisibleOthersAngle, mainMinAngle * 0.45);
    const maxAngleToStaySmallest = Math.max(
      minVisibleOthersAngle,
      mainMinAngle - 0.5
    );
    const clampedOthersAngle = Math.min(
      preferredOthersAngle,
      maxAngleToStaySmallest
    );

    const safeOthersAngle = Math.max(minVisibleOthersAngle, clampedOthersAngle);

    // Convert visual angle back into a synthetic renderValue that preserves
    // relative proportions among visible main slices.
    const othersRenderValue =
      mainValueTotal <= 0
        ? othersValue
        : (mainValueTotal * safeOthersAngle) / (360 - safeOthersAngle);

    return [
      ...mainSlices.map((item) => ({
        ...item,
        renderValue: item.value,
      })),
      {
        label: othersLabel,
        color: othersColor,
        value: othersValue,
        renderValue: othersRenderValue,
        isAggregated: true,
        groupedItems: othersSlices,
      },
    ];
  }, [
    data,
    maxSlices,
    minSliceAngle,
    sliceGapAngle,
    othersLabel,
    othersColor,
    othersVisualAngle,
  ]);

  // Recalcula o total apenas com os itens visíveis para fechar o círculo
  const totalValue = useMemo(
    () => processedData.reduce((s, i) => s + i.value, 0),
    [processedData]
  );

  // Selection state is shared between gesture code and Skia animated transforms.
  const selectedIndex = useSharedValue(-1);

  // Centralized selection notifier:
  // - normal callback for all slices
  // - dedicated callback for the aggregated bucket
  const notifySelection = useCallback(
    (index: number) => {
      if (index === -1) {
        onSelect?.(null, -1);
        return;
      }

      const item = processedData[index];
      if (!item) {
        onSelect?.(null, -1);
        return;
      }

      onSelect?.(item, index);

      if (item.isAggregated) {
        onSelectAggregated?.(item, index, item.groupedItems ?? []);
      }
    },
    [onSelect, onSelectAggregated, processedData]
  );

  // Expose imperative controls (React 19 style: `ref` as prop).
  // This mirrors the BarChart API style used in this project.
  useImperativeHandle(
    ref,
    () => ({
      selectedIndex: (index: number) => {
        if (index < -1 || index >= processedData.length) return;
        selectedIndex.value = index;
        notifySelection(index);
      },
      clearSelection: () => {
        selectedIndex.value = -1;
        notifySelection(-1);
      },
    }),
    [notifySelection, processedData, selectedIndex]
  );

  // Reset selection when visible data changes to avoid stale indices.
  useEffect(() => {
    selectedIndex.value = -1;
  }, [processedData, selectedIndex]);

  return (
    <PieChartContext.Provider
      value={{
        data: processedData,
        totalValue,
        radius,
        innerRadius,
        centerX,
        centerY,
        size,
        startAngle,
        direction,
        sliceGapAngle,
        selectedIndex,
        notifySelection,
      }}
    >
      <View style={[styles.container, { width: size, height: size }]}>
        {children}
      </View>
    </PieChartContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export const usePieChart = () => {
  const context = useContext(PieChartContext);
  if (!context)
    throw new Error('PieChart components must be used within PieChart.Root');
  return context;
};

export default PieChartProvider;
