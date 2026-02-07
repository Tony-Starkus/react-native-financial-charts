import React, {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import type {
  BarChartItemDataInterface,
  BarChartRef,
  BarChartRefSelectedIndexPropsType,
  BarChartRootPropsInterface,
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
import { calculateNiceScale } from './utils';

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

  // Animation (Master controller)
  entryProgress: SharedValue<number>;

  // Ref for ScrollView (Native)
  scrollViewRef: React.RefObject<any>;
  scrollX: SharedValue<number>;

  // YAxis logic
  hasYAxis: boolean;
  yAxisWidth: number;

  onBarPress?: (item: BarChartItemDataInterface | null, index: number) => void;
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
  data,
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
  children,
}) => {
  // 1. Font Loading (Fallback to System Font if needed)
  const systemFont = matchFont({ fontFamily: 'sans-serif', fontSize: 10 });
  const font = propFont ?? systemFont;

  // 2. Shared Values & Refs
  const selectedIndex = useSharedValue(-1);
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

  // 4. Expose Ref Mathods
  useImperativeHandle(ref, () => ({
    scrollToStart: (animated = true) => {
      scrollViewRef.current?.scrollTo({ x: 0, animated });
    },
    scrollToEnd: (animated = true) => {
      scrollViewRef.current?.scrollToEnd({ animated });
    },
    scrollToIndex: (index: number, animated = true) => {
      const positionX = index * (barWidth + spacing);
      scrollViewRef.current?.scrollTo({ x: positionX, animated });
    },
    selectedIndex: (
      index: number,
      options?: BarChartRefSelectedIndexPropsType
    ) => {
      // Update the SharedValue (triggers UI animations instantly)
      if (index >= -1 && index < data.length) {
        selectedIndex.value = index;

        // Scroll to the bar
        if (options?.scrollToBar && index !== -1 && isScrollable) {
          const itemFullWidth = barWidth + spacing;

          // Center logic: Item Pos - Half Screen + Half Item
          const itemX = BAR_CHART_PADDING_LEFT + index * itemFullWidth;
          const centerOffsetX = itemX - canvasWidth / 2 + barWidth / 2;

          // Ensure scroll don't past bounds
          const maxOffset = contentWidth - canvasWidth;
          const targetX = Math.max(0, Math.min(centerOffsetX, maxOffset));

          scrollViewRef.current?.scrollTo({
            x: targetX,
            animated: options.animatedScroll,
          });
        }
      }
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
        entryProgress,
        maxValue,
        scrollViewRef,
        scrollX,
        hasYAxis,
        yAxisWidth,
        onBarPress,
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
