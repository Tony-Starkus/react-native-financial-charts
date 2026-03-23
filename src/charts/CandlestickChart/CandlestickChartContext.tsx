import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { matchFont } from '@shopify/react-native-skia';
import {
  type AnimatedRef,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type {
  CandlestickChartContextInterface,
  CandlestickChartRef,
  CandlestickChartRefSelectedIndexOptions,
  CandlestickChartRootPropsInterface,
} from './interfaces';
import {
  buildCandlestickLayout,
  calculateVisibleCandlestickScale,
  normalizeCandlestickData,
} from './utils';
import {
  CANDLESTICK_CHART_PADDING_BOTTOM,
  CANDLESTICK_CHART_PADDING_LEFT,
  CANDLESTICK_CHART_PADDING_RIGHT,
  CANDLESTICK_CHART_PADDING_TOP,
} from './constants';

const MOCK_SHARED_VALUE_NUMBER = { value: 0 } as SharedValue<number>;
const MOCK_ANIMATED_REF = { current: null } as AnimatedRef<any>;

const INITIAL_CONTEXT: CandlestickChartContextInterface = {
  data: [],
  layoutData: [],
  domainY: [0, 1],
  yAxisTicks: [],
  height: 280,
  width: 300,
  canvasWidth: 300,
  contentWidth: 300,
  plotTop: CANDLESTICK_CHART_PADDING_TOP,
  plotBottom: 280 - CANDLESTICK_CHART_PADDING_BOTTOM,
  candleWidth: 10,
  spacing: 6,
  isScrollable: false,
  selectable: false,
  bullishColor: '#00E396',
  bearishColor: '#EA3943',
  activeBorderColor: '#F9FAFB',
  activeBorderWidth: 2,
  font: null,
  animatedDomainMin: MOCK_SHARED_VALUE_NUMBER,
  animatedDomainMax: MOCK_SHARED_VALUE_NUMBER,
  selectedIndex: MOCK_SHARED_VALUE_NUMBER,
  entryProgress: MOCK_SHARED_VALUE_NUMBER,
  scrollViewRef: MOCK_ANIMATED_REF,
  scrollX: MOCK_SHARED_VALUE_NUMBER,
  hasYAxis: false,
  yAxisWidth: 0,
  yAxisLabelAlignment: 'right',
  yAxisLabelOffsetX: 0,
  yAxisLabelYOffset: -4,
  yAxisLabelPadding: 2,
  yAxisShouldDrawBackground: false,
  hasLastPrice: false,
  lastPriceRightOffset: 0,
  lastPriceLabelPaddingHorizontal: undefined,
  lastPriceLabelPaddingVertical: undefined,
  lastPriceFormatLabel: undefined,
  notifySelection: () => undefined,
};

export const CandlestickChartContext =
  createContext<CandlestickChartContextInterface>(INITIAL_CONTEXT);

export interface CandlestickChartRootPropsAliasInterface
  extends CandlestickChartRootPropsInterface {}

export type CandlestickChartRootProps = CandlestickChartRootPropsAliasInterface;

const CandlestickChartProvider: React.FC<
  CandlestickChartRootPropsInterface & {
    ref?: React.Ref<CandlestickChartRef>;
  }
> = ({
  data,
  width = 300,
  height = 280,
  candleWidth = 10,
  spacing = 6,
  scrollToTheEnd = false,
  isScrollable = false,
  selectable = false,
  yAxisTicksCount = 5,
  bullishColor = '#00E396',
  bearishColor = '#EA3943',
  activeBorderColor = '#F9FAFB',
  activeBorderWidth = 2,
  font: propFont,
  onCandlePress,
  ref,
  children,
}) => {
  const systemFont = matchFont({ fontFamily: 'sans-serif', fontSize: 10 });
  const font = propFont ?? systemFont;
  const selectedIndex = useSharedValue(-1);
  const entryProgress = useSharedValue(0);
  const scrollViewRef = useAnimatedRef<any>();
  const scrollX = useScrollViewOffset(scrollViewRef);

  const normalizedData = useMemo(() => normalizeCandlestickData(data), [data]);

  const {
    hasYAxis,
    yAxisWidth,
    yAxisLabelAlignment,
    yAxisLabelOffsetX,
    yAxisLabelYOffset,
    yAxisLabelPadding,
    yAxisShouldDrawBackground,
    hasLastPrice,
    lastPriceRightOffset,
    lastPriceLabelPaddingHorizontal,
    lastPriceLabelPaddingVertical,
    lastPriceFormatLabel,
  } = useMemo(() => {
    let foundYAxis = false;
    let foundLastPrice = false;
    let widthFound = 50;
    let labelAlignmentFound: 'left' | 'right' = 'right';
    let labelOffsetXFound = 0;
    let labelYOffsetFound = -4;
    let labelPaddingFound = 2;
    let shouldDrawBackgroundFound = false;
    let rightOffsetFound = 0;
    let labelPaddingHorizontalFound: number | undefined;
    let labelPaddingVerticalFound: number | undefined;
    let formatLabelFound: ((value: number) => string) | undefined;

    const childrenArray = React.Children.toArray(children);

    const captureYAxisProps = (props: any) => {
      foundYAxis = true;
      widthFound = props.width ?? 50;
      labelAlignmentFound = props.labelAlignment ?? 'right';
      labelOffsetXFound = props.labelOffsetX ?? 0;
      labelYOffsetFound = props.labelYOffset ?? -4;
      labelPaddingFound = props.labelPadding ?? 2;
      shouldDrawBackgroundFound =
        (props.labelBackgroundColor ?? 'transparent') !== 'transparent';
    };

    const captureLastPriceProps = (props: any) => {
      foundLastPrice = true;
      rightOffsetFound = props.rightOffset ?? 0;
      labelPaddingHorizontalFound = props.labelPaddingHorizontal;
      labelPaddingVerticalFound = props.labelPaddingVertical;
      formatLabelFound = props.formatLabel;
    };

    const scanElement = (node: React.ReactNode): boolean => {
      if (!React.isValidElement(node)) return false;

      // @ts-ignore
      if (node.type?.displayName === 'CandlestickChartYAxis') {
        captureYAxisProps(node.props);
      }

      // @ts-ignore
      if (node.type?.displayName === 'CandlestickChartLastPrice') {
        captureLastPriceProps(node.props);
      }

      if (foundYAxis && foundLastPrice) return true;

      const nestedChildren = React.Children.toArray(
        (node.props as any)?.children
      );
      for (const nestedChild of nestedChildren) {
        if (scanElement(nestedChild)) return true;
      }
      return false;
    };

    for (const child of childrenArray) {
      scanElement(child);
      if (foundYAxis && foundLastPrice) break;
    }

    return {
      hasYAxis: foundYAxis,
      yAxisWidth: widthFound,
      yAxisLabelAlignment: labelAlignmentFound,
      yAxisLabelOffsetX: labelOffsetXFound,
      yAxisLabelYOffset: labelYOffsetFound,
      yAxisLabelPadding: labelPaddingFound,
      yAxisShouldDrawBackground: shouldDrawBackgroundFound,
      hasLastPrice: foundLastPrice,
      lastPriceRightOffset: rightOffsetFound,
      lastPriceLabelPaddingHorizontal: labelPaddingHorizontalFound,
      lastPriceLabelPaddingVertical: labelPaddingVerticalFound,
      lastPriceFormatLabel: formatLabelFound,
    };
  }, [children]);

  const availableCanvasWidth = hasYAxis ? width - yAxisWidth : width;
  const plotTop = CANDLESTICK_CHART_PADDING_TOP;
  const plotBottom = height - CANDLESTICK_CHART_PADDING_BOTTOM;

  const { contentWidth, effectiveCandleWidth } = useMemo(() => {
    const sidePadding =
      CANDLESTICK_CHART_PADDING_LEFT + CANDLESTICK_CHART_PADDING_RIGHT;
    const itemCount = Math.max(normalizedData.length, 1);
    const totalSpacing = Math.max(itemCount - 1, 0) * spacing;

    if (isScrollable) {
      const totalCandlesWidth = itemCount * candleWidth;
      return {
        contentWidth: totalCandlesWidth + totalSpacing + sidePadding,
        effectiveCandleWidth: candleWidth,
      };
    }

    const drawableWidth = availableCanvasWidth - sidePadding - totalSpacing;

    return {
      contentWidth: availableCanvasWidth,
      effectiveCandleWidth: Math.max(drawableWidth / itemCount, 1),
    };
  }, [
    normalizedData.length,
    spacing,
    isScrollable,
    candleWidth,
    availableCanvasWidth,
  ]);

  const calculateScaleForRange = useCallback(
    (startIndex: number, endIndex: number) =>
      calculateVisibleCandlestickScale({
        data: normalizedData,
        startIndex,
        endIndex,
        maxTicks: yAxisTicksCount,
      }),
    [normalizedData, yAxisTicksCount]
  );

  const [visibleScale, setVisibleScale] = useState(() =>
    calculateScaleForRange(0, Math.max(normalizedData.length - 1, 0))
  );
  const animatedDomainMin = useSharedValue(visibleScale.domainY[0]);
  const animatedDomainMax = useSharedValue(visibleScale.domainY[1]);

  const updateVisibleScale = useCallback(
    (startIndex: number, endIndex: number) => {
      setVisibleScale((current) => {
        const next = calculateScaleForRange(startIndex, endIndex);
        const sameDomain =
          current.domainY[0] === next.domainY[0] &&
          current.domainY[1] === next.domainY[1];
        const sameTicks =
          current.yAxisTicks.length === next.yAxisTicks.length &&
          current.yAxisTicks.every(
            (tick, index) => tick === next.yAxisTicks[index]
          );

        return sameDomain && sameTicks ? current : next;
      });
    },
    [calculateScaleForRange]
  );

  useEffect(() => {
    updateVisibleScale(0, Math.max(normalizedData.length - 1, 0));
  }, [normalizedData.length, updateVisibleScale]);

  useEffect(() => {
    animatedDomainMin.value = withTiming(visibleScale.domainY[0], {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
    animatedDomainMax.value = withTiming(visibleScale.domainY[1], {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedDomainMax, animatedDomainMin, visibleScale.domainY]);

  useAnimatedReaction(
    () => {
      if (!normalizedData.length) {
        return { startIndex: 0, endIndex: 0 };
      }

      if (!isScrollable) {
        return {
          startIndex: 0,
          endIndex: Math.max(normalizedData.length - 1, 0),
        };
      }

      const itemFullWidth = candleWidth + spacing;
      const startIndex = Math.max(
        0,
        Math.floor(
          (scrollX.value - CANDLESTICK_CHART_PADDING_LEFT) / itemFullWidth
        )
      );
      const rawEndIndex = Math.max(
        startIndex,
        Math.ceil(
          (scrollX.value +
            availableCanvasWidth -
            CANDLESTICK_CHART_PADDING_LEFT) /
            itemFullWidth
        ) - 1
      );
      const endIndex = Math.min(normalizedData.length - 1, rawEndIndex);

      return { startIndex, endIndex };
    },
    (current, previous) => {
      if (
        !previous ||
        current.startIndex !== previous.startIndex ||
        current.endIndex !== previous.endIndex
      ) {
        runOnJS(updateVisibleScale)(current.startIndex, current.endIndex);
      }
    },
    [
      isScrollable,
      normalizedData.length,
      candleWidth,
      spacing,
      availableCanvasWidth,
      scrollX,
      updateVisibleScale,
    ]
  );

  const { domainY, yAxisTicks } = visibleScale;

  const layoutData = useMemo(
    () =>
      buildCandlestickLayout({
        data: normalizedData,
        domainY,
        plotTop,
        plotBottom,
        candleWidth: effectiveCandleWidth,
        spacing,
        bullishColor,
        bearishColor,
        contentPaddingLeft: CANDLESTICK_CHART_PADDING_LEFT,
      }),
    [
      normalizedData,
      domainY,
      plotTop,
      plotBottom,
      effectiveCandleWidth,
      spacing,
      bullishColor,
      bearishColor,
    ]
  );

  const notifySelection = useCallback(
    (index: number) => {
      if (index === -1) {
        onCandlePress?.(null, -1);
        return;
      }

      const item = normalizedData[index];
      if (!item) {
        onCandlePress?.(null, -1);
        return;
      }

      onCandlePress?.(item, index);
    },
    [normalizedData, onCandlePress]
  );

  useEffect(() => {
    entryProgress.value = 0;
    entryProgress.value = withTiming(1, { duration: 700 });

    const timeout = setTimeout(() => {
      if (scrollToTheEnd && isScrollable) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    normalizedData,
    isScrollable,
    scrollToTheEnd,
    scrollViewRef,
    entryProgress,
  ]);

  useEffect(() => {
    if (selectedIndex.value >= normalizedData.length) {
      selectedIndex.value = -1;
    }
  }, [normalizedData.length, selectedIndex]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToStart: (animated = true) => {
        scrollViewRef.current?.scrollTo({ x: 0, animated });
      },
      scrollToEnd: (animated = true) => {
        scrollViewRef.current?.scrollToEnd({ animated });
      },
      scrollToIndex: (index: number, animated = true) => {
        const positionX = index * (candleWidth + spacing);
        scrollViewRef.current?.scrollTo({ x: positionX, animated });
      },
      selectedIndex: (
        index: number,
        options?: CandlestickChartRefSelectedIndexOptions
      ) => {
        if (index < -1 || index >= normalizedData.length) return;

        selectedIndex.value = index;
        notifySelection(index);

        if (options?.scrollToCandle && index !== -1 && isScrollable) {
          const itemFullWidth = candleWidth + spacing;
          const itemX = CANDLESTICK_CHART_PADDING_LEFT + index * itemFullWidth;
          const centerOffsetX =
            itemX - availableCanvasWidth / 2 + candleWidth / 2;
          const maxOffset = contentWidth - availableCanvasWidth;
          const targetX = Math.max(0, Math.min(centerOffsetX, maxOffset));

          scrollViewRef.current?.scrollTo({
            x: targetX,
            animated: options.animatedScroll,
          });
        }
      },
    }),
    [
      scrollViewRef,
      candleWidth,
      spacing,
      normalizedData.length,
      notifySelection,
      isScrollable,
      availableCanvasWidth,
      contentWidth,
      selectedIndex,
    ]
  );

  return (
    <CandlestickChartContext.Provider
      value={{
        data: normalizedData,
        layoutData,
        domainY,
        yAxisTicks,
        height,
        width,
        canvasWidth: availableCanvasWidth,
        contentWidth,
        plotTop,
        plotBottom,
        candleWidth: effectiveCandleWidth,
        spacing,
        isScrollable,
        selectable,
        bullishColor,
        bearishColor,
        activeBorderColor,
        activeBorderWidth,
        font,
        animatedDomainMin,
        animatedDomainMax,
        selectedIndex,
        entryProgress,
        scrollViewRef,
        scrollX,
        hasYAxis,
        yAxisWidth,
        yAxisLabelAlignment,
        yAxisLabelOffsetX,
        yAxisLabelYOffset,
        yAxisLabelPadding,
        yAxisShouldDrawBackground,
        hasLastPrice,
        lastPriceRightOffset,
        lastPriceLabelPaddingHorizontal,
        lastPriceLabelPaddingVertical,
        lastPriceFormatLabel,
        notifySelection,
      }}
    >
      {children}
    </CandlestickChartContext.Provider>
  );
};

export const useCandlestickChart = () => {
  const context = useContext(CandlestickChartContext);
  if (!context) {
    throw new Error(
      'useCandlestickChart must be used inside a <CandlestickChart.Root />'
    );
  }
  return context;
};

export default CandlestickChartProvider;
