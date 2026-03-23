import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  type ComposedGesture,
  type GestureType,
} from 'react-native-gesture-handler';
import { useCandlestickChart } from '../CandlestickChartContext';
import { CandlestickChartContext } from '../CandlestickChartContext';
import { CANDLESTICK_CHART_PADDING_LEFT } from '../constants';

export interface CandlestickChartCanvasPropsInterface {
  children: React.ReactNode;
  style?: ViewStyle;
}

const CandlestickChartCanvas: React.FC<
  CandlestickChartCanvasPropsInterface
> = ({ children, style }) => {
  const candlestickChartContext = useCandlestickChart();
  const {
    layoutData,
    height,
    contentWidth,
    canvasWidth,
    scrollViewRef,
    isScrollable,
    candleWidth,
    spacing,
    animatedDomainMin,
    animatedDomainMax,
    selectedIndex,
    selectable,
    plotTop,
    plotBottom,
    notifySelection,
  } = candlestickChartContext;
  const panStartX = useSharedValue(0);
  const maxOffsetX = Math.max(contentWidth - canvasWidth, 0);

  const handleSelection = (index: number) => {
    notifySelection(index);
  };

  const panGesture = Gesture.Pan()
    .enabled(isScrollable)
    .maxPointers(1)
    .activeOffsetX([-4, 4])
    .onBegin(() => {
      'worklet';

      panStartX.value = candlestickChartContext.scrollX.value;
    })
    .onUpdate((event) => {
      'worklet';

      const nextX = Math.max(
        0,
        Math.min(panStartX.value - event.translationX, maxOffsetX)
      );

      scrollTo(scrollViewRef, nextX, 0, false);
    });

  const tapGesture = Gesture.Tap()
    .enabled(selectable)
    .maxDistance(8)
    .onEnd((event, success) => {
      'worklet';
      if (!success) return;

      const itemFullWidth = candleWidth + spacing;
      const adjustedX = event.x - CANDLESTICK_CHART_PADDING_LEFT;
      const rawIndex = adjustedX / itemFullWidth;
      const index = Math.floor(rawIndex);
      const positionInSlot = adjustedX - index * itemFullWidth;
      const isInsideCandleWidth =
        positionInSlot >= 0 && positionInSlot <= candleWidth;

      if (index >= 0 && index < layoutData.length) {
        const item = layoutData[index]!;
        const safeRange = Math.max(
          animatedDomainMax.value - animatedDomainMin.value,
          1
        );
        const drawableHeight = Math.max(plotBottom - plotTop, 1);
        const getY = (value: number) => {
          const progress = (value - animatedDomainMin.value) / safeRange;
          return plotBottom - progress * drawableHeight;
        };
        const highY = getY(item.data.high);
        const lowY = getY(item.data.low);
        const isInsidePlot = event.y >= plotTop && event.y <= plotBottom;
        const isInsideWick = event.y >= highY - 6 && event.y <= lowY + 6;

        if (isInsideCandleWidth && isInsidePlot && isInsideWick) {
          const nextIndex = selectedIndex.value === index ? -1 : index;
          selectedIndex.value = nextIndex;
          runOnJS(handleSelection)(nextIndex);
          return;
        }
      }

      selectedIndex.value = -1;
      runOnJS(handleSelection)(-1);
    });

  let chartGesture: GestureType | ComposedGesture = tapGesture;
  if (isScrollable && selectable) {
    chartGesture = Gesture.Race(panGesture, tapGesture);
  } else if (isScrollable) {
    chartGesture = panGesture;
  }

  const dynamicContainerStyle = useAnimatedStyle(() => {
    return {
      width: Math.max(contentWidth, canvasWidth),
    };
  }, [contentWidth, canvasWidth]);

  return (
    <View style={[styles.container, { height, width: canvasWidth }, style]}>
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={{ width: canvasWidth, height }}>
          <CandlestickChartContext.Provider value={candlestickChartContext}>
            {children}
          </CandlestickChartContext.Provider>
        </Canvas>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          width: Math.max(contentWidth, canvasWidth),
          height,
        }}
        style={StyleSheet.absoluteFill}
      >
        <GestureDetector gesture={chartGesture}>
          <Animated.View
            style={[styles.touchableArea, dynamicContainerStyle]}
          />
        </GestureDetector>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchableArea: {
    height: '100%',
  },
});

export default CandlestickChartCanvas;
