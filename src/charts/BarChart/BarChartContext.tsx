import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import type {
  BarChartItemDataInterface,
  BarChartItemKey,
  BarChartRef,
  BarChartRefSelectedIndexPropsType,
  BarChartRootPropsInterface,
  BarChartSelectionMode,
} from './interfaces';
import {
  Easing,
  useAnimatedRef,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { matchFont, type SkFont } from '@shopify/react-native-skia';
import { BAR_CHART_PADDING_LEFT, BAR_CHART_PADDING_RIGHT } from './constants';
import {
  calculateNiceScale,
  findBarIndexByKey,
  findSegmentIndexByKey,
  getCenteredScrollOffset,
  normalizeBarData,
} from './utils';

interface BarChartContextInterface {
  // Data
  data: BarChartItemDataInterface[];
  maxValue: number;
  yAxisTicks: number[];

  // Loading State
  isLoading?: boolean;
  skeletonData: BarChartItemDataInterface[];

  // Dimensions
  height: number;
  width: number; // Container width
  /** Visible width */
  canvasWidth: number;
  /** Total width of the scrollable content */
  contentWidth: number;

  // Layout Metrics
  /** The Y coordinate where the bars start (the visual floor) */
  /** The Y coordinate where the bars start (the visual floor) */
  graphBottom: number;
  /** The maximum pixel height a bar can reach */
  maxBarHeight: number;
  /** The height reserved for the X-Axis labels */
  xAxisHeight: number;

  // Layout Props
  barWidth: number;
  spacing: number;
  verticalScaleFactor: number;
  isScrollable: boolean;

  // Styles & Skia
  barColor: string;
  activeBorderColor: string;
  activeBorderWidth: number;
  font: SkFont | null;
  showXAxis: boolean;

  // Interaction
  selectable: boolean;
  selectedIndex: SharedValue<number>;
  /** Selected segment inside the selected bar (-1 = whole bar). */
  selectedSegmentIndex: SharedValue<number>;
  selectionMode: BarChartSelectionMode;
  segmentGap: number;
  /** Highlighted series key in `selectionMode="series"` (null = none). */
  selectedSeriesKey: SharedValue<BarChartItemKey | null>;
  /** True when series selection is driven by the `selectedSeriesKey` prop. */
  isSeriesControlled: boolean;
  /** Fires `onSeriesSelect`. JS thread only. */
  notifySeriesSelection: (key: BarChartItemKey | null) => void;

  // Animation (Master controller)
  entryProgress: SharedValue<number>;

  // Ref for ScrollView (Native)
  scrollViewRef: React.RefObject<any>;
  scrollX: SharedValue<number>;

  // YAxis logic
  hasYAxis: boolean;
  yAxisWidth: number;

  onBarPress?: BarChartRootPropsInterface['onBarPress'];

  /** True when selection is driven by the `selectedKey` prop. */
  isControlled: boolean;
  /** Fires `onBarPress` for an index (-1 = deselection). JS thread only. */
  notifySelection: (index: number, segmentIndex?: number) => void;
}

const LABEL_PADDING_TOP = 4;
const APPROX_FONT_HEIGHT = 18;

export const BarChartContext = createContext<
  BarChartContextInterface | undefined
>(undefined);

const BarChartProvider: React.FC<
  BarChartRootPropsInterface & {
    ref?: React.Ref<BarChartRef>;
  }
> = ({
  data: rawData,
  isLoading = false,
  width = 300,
  height = 300,
  barWidth = 32,
  spacing = 12,
  barColor = '#E0E0E0',
  activeBorderColor = '#333333',
  activeBorderWidth = 2,
  scrollToTheEnd = false,
  isScrollable = false,
  selectable = false,
  font: propFont,
  yAxisTicksCount = 5,
  showXAxis = false,
  verticalScaleFactor = 0.8,
  ref,
  onBarPress,
  selectedKey,
  selectedSegmentKey,
  scrollToSelectedBar = false,
  selectionMode = 'bar',
  segmentGap = 0,
  selectedSeriesKey: selectedSeriesKeyProp,
  onSeriesSelect,
  children,
}) => {
  const isSeriesControlled = selectedSeriesKeyProp !== undefined;

  const isControlled = selectedKey !== undefined;

  // 1. Font Loading (Fallback to System Font if needed)
  const systemFont = matchFont({ fontFamily: 'sans-serif', fontSize: 10 });
  const font = propFont ?? systemFont;

  // Stacked items expose their stack total as `value`, so every consumer
  // (Y scale, tooltip, value labels, onBarPress) works unchanged.
  const data = useMemo(() => normalizeBarData(rawData), [rawData]);

  // 2. Shared Values & Refs
  const selectedIndex = useSharedValue(-1);
  const selectedSegmentIndex = useSharedValue(-1);
  const selectedSeriesKey = useSharedValue<BarChartItemKey | null>(null);
  const entryProgress = useSharedValue(0);

  const scrollViewRef = useAnimatedRef<any>();
  const scrollX = useScrollViewOffset(scrollViewRef);

  useEffect(() => {
    if (!isLoading) {
      entryProgress.value = 0;
      entryProgress.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.exp),
      });

      if (scrollToTheEnd && isScrollable) {
        // Delay for ScrollView calculation
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        }, 100);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading, scrollToTheEnd, isScrollable]);

  // 3. Layout Calculations
  const xAxisHeight = showXAxis ? LABEL_PADDING_TOP + APPROX_FONT_HEIGHT : 0;
  const graphBottom = height - xAxisHeight;
  const maxBarHeight = graphBottom * verticalScaleFactor;

  const skeletonData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, index) => ({
      label: '---',
      value: 100,
      id: `skeleton-${index}`,
    }));
  }, []);

  const layoutData = isLoading ? skeletonData : data;

  // Detect YAxis in children
  const { hasYAxis, yAxisWidth } = useMemo(() => {
    let found = false;
    let widthFound = 50; // Default width;

    const childrenArray = React.Children.toArray(children);

    for (const child of childrenArray) {
      if (React.isValidElement(child)) {
        // Check the type.displayName to find Y-Axis component
        // @ts-ignore
        if (child.type?.displayName === 'BarChartYAxis') {
          found = true;
          widthFound = (child.props as any).width || 50;
        }
      }
    }

    return {
      hasYAxis: found,
      yAxisWidth: widthFound,
    };
  }, [children]);

  const { maxValue, yAxisTicks } = useMemo(() => {
    let rawMax = 0;

    if (isLoading) {
      rawMax = 100;
    } else {
      rawMax = Math.max(...data.map((item) => item.value), 0);
    }

    const scale = calculateNiceScale(0, rawMax, yAxisTicksCount);

    return {
      maxValue: scale.max,
      yAxisTicks: scale.ticks,
    };
  }, [data, isLoading, yAxisTicksCount]);

  const { canvasWidth, contentWidth, effectiveBarWidth } = useMemo(() => {
    const SIDE_PADDING = BAR_CHART_PADDING_LEFT + BAR_CHART_PADDING_RIGHT;
    const availableCanvasWidth = hasYAxis ? width - yAxisWidth : width;

    const numberOfItems = Math.max(layoutData.length, 1);
    const numberOfSpaces = Math.max(numberOfItems - 1, 0);
    const totalSpacing = spacing * numberOfSpaces;

    if (isScrollable && !isLoading) {
      // SCROLL MODE: Use fixed barWidth from props
      const totalBarsWidth = numberOfItems * barWidth;
      const totalContentWidth = totalBarsWidth + totalSpacing + SIDE_PADDING;
      return {
        contentWidth: totalContentWidth,
        canvasWidth: availableCanvasWidth,
        effectiveBarWidth: barWidth,
      };
    } else {
      // FIT MODE: Calculate dynamic barWidth to fit container
      const availableSpaceForBars =
        availableCanvasWidth - totalSpacing - SIDE_PADDING;
      // Prevent division by zero and ensure min width of 1px;
      const dynamicWidth = Math.max(
        availableSpaceForBars / Math.max(numberOfItems, 1),
        1
      );

      return {
        contentWidth: availableCanvasWidth,
        canvasWidth: availableCanvasWidth,
        effectiveBarWidth: dynamicWidth, // Override the prop
      };
    }
  }, [
    layoutData,
    isScrollable,
    barWidth,
    spacing,
    width,
    hasYAxis,
    yAxisWidth,
    isLoading,
  ]);

  // 4. Selection helpers
  const notifySelection = useCallback(
    (index: number, segmentIndex: number = -1) => {
      if (!onBarPress) return;
      const item = index >= 0 ? data[index] : undefined;
      if (item) onBarPress(item, index, segmentIndex);
      else onBarPress(null, -1, -1);
    },
    [onBarPress, data]
  );

  const notifySeriesSelection = useCallback(
    (key: BarChartItemKey | null) => {
      onSeriesSelect?.(key);
    },
    [onSeriesSelect]
  );

  const requestSeriesSelection = useCallback(
    (key: BarChartItemKey | null) => {
      if (selectionMode !== 'series') return;
      if (!isSeriesControlled) selectedSeriesKey.value = key;
      notifySeriesSelection(key);
    },
    [
      selectionMode,
      isSeriesControlled,
      selectedSeriesKey,
      notifySeriesSelection,
    ]
  );

  // Series selection only exists in series mode. Controlled: mirror the prop.
  // Uncontrolled: clear when leaving series mode.
  useEffect(() => {
    if (selectionMode !== 'series') {
      selectedSeriesKey.value = null;
      return;
    }
    if (isSeriesControlled) {
      selectedSeriesKey.value = selectedSeriesKeyProp ?? null;
    }
  }, [
    selectionMode,
    isSeriesControlled,
    selectedSeriesKeyProp,
    selectedSeriesKey,
  ]);

  // Clamp a requested segment to what the current mode/item allows.
  const resolveSegmentIndex = useCallback(
    (index: number, segmentIndex: number | undefined) => {
      if (selectionMode !== 'segment' || index < 0) return -1;
      const count = data[index]?.segments?.length ?? 0;
      if (segmentIndex === undefined || segmentIndex < 0) return -1;
      return segmentIndex < count ? segmentIndex : -1;
    },
    [selectionMode, data]
  );

  const scrollToBarIndex = useCallback(
    (index: number, animated?: boolean) => {
      if (!isScrollable || index < 0 || index >= data.length) return;
      const targetX = getCenteredScrollOffset(
        index,
        effectiveBarWidth,
        spacing,
        BAR_CHART_PADDING_LEFT,
        canvasWidth,
        contentWidth
      );
      scrollViewRef.current?.scrollTo({ x: targetX, animated });
    },
    [
      isScrollable,
      data.length,
      effectiveBarWidth,
      spacing,
      canvasWidth,
      contentWidth,
      scrollViewRef,
    ]
  );

  // Controlled: mirror `selectedKey` into the shared value. Idempotent, so
  // re-running on data identity changes is harmless.
  useEffect(() => {
    if (!isControlled) return;
    const index = findBarIndexByKey(data, selectedKey);
    selectedIndex.value = index;
    selectedSegmentIndex.value =
      selectionMode === 'segment' && index !== -1
        ? findSegmentIndexByKey(data[index], selectedSegmentKey)
        : -1;
    if (scrollToSelectedBar && index !== -1) {
      scrollToBarIndex(index, true);
    }
    // scrollToBarIndex is intentionally left out: layout changes alone must
    // not re-trigger the auto-scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isControlled,
    selectedKey,
    selectedSegmentKey,
    selectionMode,
    data,
    scrollToSelectedBar,
    selectedIndex,
    selectedSegmentIndex,
  ]);

  // Single entry point for imperative selection (same semantics as a tap):
  // uncontrolled -> update shared value; always notify.
  const requestSelection = useCallback(
    (
      index: number,
      options?: BarChartRefSelectedIndexPropsType,
      requestedSegmentIndex?: number
    ) => {
      const segmentIndex = resolveSegmentIndex(index, requestedSegmentIndex);
      if (!isControlled) {
        selectedIndex.value = index;
        selectedSegmentIndex.value = segmentIndex;
        if (options?.scrollToBar && index !== -1) {
          scrollToBarIndex(index, options.animatedScroll);
        }
      }
      notifySelection(index, segmentIndex);
    },
    [
      isControlled,
      resolveSegmentIndex,
      selectedIndex,
      selectedSegmentIndex,
      scrollToBarIndex,
      notifySelection,
    ]
  );

  // Uncontrolled: drop selections that point past the end of the data, and
  // segment selections that no longer apply (mode switched to 'bar', or the
  // bar lost the segment).
  useEffect(() => {
    if (isControlled) return;
    if (selectedIndex.value >= data.length) {
      selectedIndex.value = -1;
      selectedSegmentIndex.value = -1;
      return;
    }
    selectedSegmentIndex.value = resolveSegmentIndex(
      selectedIndex.value,
      selectedSegmentIndex.value
    );
  }, [
    isControlled,
    data.length,
    resolveSegmentIndex,
    selectedIndex,
    selectedSegmentIndex,
  ]);

  // 5. Expose Ref Methods
  useImperativeHandle(ref, () => ({
    scrollToStart: (animated = true) => {
      scrollViewRef.current?.scrollTo({ x: 0, animated });
    },
    scrollToEnd: (animated = true) => {
      scrollViewRef.current?.scrollToEnd({ animated });
    },
    scrollToIndex: (index: number, animated = true) => {
      const safeIndex = Math.max(0, Math.min(index, data.length - 1));
      const positionX = safeIndex * (barWidth + spacing);
      scrollViewRef.current?.scrollTo({ x: positionX, animated });
    },
    selectedIndex: (
      index: number,
      options?: BarChartRefSelectedIndexPropsType
    ) => {
      if (index < -1 || index >= data.length) return;
      requestSelection(index, options, options?.segmentIndex);
    },
    selectByKey: (key, options) => {
      const index = findBarIndexByKey(data, key);
      requestSelection(
        index,
        options,
        findSegmentIndexByKey(data[index], options?.segmentKey)
      );
    },
    clearSelection: () => {
      if (selectionMode === 'series') requestSeriesSelection(null);
      else requestSelection(-1);
    },
    selectSeries: (key) => {
      requestSeriesSelection(key);
    },
  }));

  return (
    <BarChartContext.Provider
      value={{
        data,
        isLoading,
        skeletonData,
        height,
        width,
        yAxisTicks,
        canvasWidth,
        contentWidth,
        barWidth: effectiveBarWidth,
        spacing,
        verticalScaleFactor,
        xAxisHeight,
        graphBottom,
        maxBarHeight,
        isScrollable,
        barColor,
        activeBorderColor,
        activeBorderWidth,
        font,
        showXAxis,
        selectable: selectable ?? !!onBarPress,
        selectedIndex,
        selectedSegmentIndex,
        selectionMode,
        segmentGap,
        selectedSeriesKey,
        isSeriesControlled,
        notifySeriesSelection,
        entryProgress,
        maxValue,
        scrollViewRef,
        scrollX,
        hasYAxis,
        yAxisWidth,
        onBarPress,
        isControlled,
        notifySelection,
      }}
    >
      {children}
    </BarChartContext.Provider>
  );
};

export const useBarChart = () => {
  const context = useContext(BarChartContext);
  if (!context) {
    throw new Error('useBarChart must be used inside a <BarChart.Root />');
  }
  return context;
};

export default BarChartProvider;
