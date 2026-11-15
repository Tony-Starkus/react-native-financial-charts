import React from 'react';
import { BarChartContext, useBarChart } from '../BarChartContext';
import { BAR_CHART_PADDING_LEFT } from '../constants';
import { hitTestStackSegment, hitTestStackSeriesKey } from '../utils';
import type { BarChartItemKey } from '../interfaces';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import Animated, { runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BarChartCanvas: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ style, children }) => {
  const barChartContext = useBarChart();

  const {
    data,
    height,
    contentWidth,
    canvasWidth,
    scrollViewRef,
    isScrollable,
    barWidth,
    spacing,
    selectedIndex,
    selectable,
    graphBottom,
    isControlled,
    notifySelection,
    selectedSegmentIndex,
    selectionMode,
    segmentGap,
    maxValue,
    maxBarHeight,
    selectedSeriesKey,
    isSeriesControlled,
    notifySeriesSelection,
  } = barChartContext;

  const isSegmentMode = selectionMode === 'segment';
  const isSeriesMode = selectionMode === 'series';

  const handleSeriesJsCallback = (key: BarChartItemKey | null) => {
    notifySeriesSelection(key);
  };

  /**
   * Wrapper to call the external Javascript callback from the UI Thread.
   */
  const handleJsCallback = (index: number, segmentIndex: number) => {
    notifySelection(index, segmentIndex);
  };

  /**
   * TAP GESTURE (UI Thread)
   * Runs entirely on the UI thread using Reanimated Worklets.
   */
  const tapGesture = Gesture.Tap()
    .enabled(selectable)
    .onStart((event) => {
      'worklet';

      const { x: locationX, y: locationY } = event;

      // 1. Calculate Index (UI Thread)
      // Inverse Math: Index = (X - Padding) / (Bar + Space)
      const itemFullWidth = barWidth + spacing;
      const adjustedX = locationX - BAR_CHART_PADDING_LEFT;
      const rawIndex = adjustedX / itemFullWidth;
      const index = Math.floor(rawIndex);

      // 2. Horizontal Check (Width)
      // Calculate exact position within the slot to ensure click on the bar, not on spacing
      const positionInSlot = adjustedX - index * itemFullWidth;
      const isInsideBarWidth =
        positionInSlot >= 0 && positionInSlot <= barWidth;

      // SERIES MODE: tap resolves the series of the tapped segment and
      // toggles it; tapping anything else clears.
      if (isSeriesMode) {
        let nextKey: BarChartItemKey | null = null;
        if (
          index >= 0 &&
          index < data.length &&
          isInsideBarWidth &&
          locationY <= graphBottom &&
          locationY >= 0
        ) {
          const tappedKey = hitTestStackSeriesKey(
            data[index]!,
            locationY,
            maxValue,
            maxBarHeight,
            graphBottom,
            segmentGap
          );
          nextKey = tappedKey === selectedSeriesKey.value ? null : tappedKey;
        }
        if (!isSeriesControlled) selectedSeriesKey.value = nextKey;
        runOnJS(handleSeriesJsCallback)(nextKey);
        return;
      }

      // Resolve next selection:
      // - tap on a bar (or segment, in segment mode) toggles it
      // - tap on spacing / padding / outside graph area clears
      let nextIndex = -1;
      let nextSegment = -1;
      if (index >= 0 && index < data.length) {
        const isInsideGraphArea = locationY <= graphBottom && locationY >= 0;
        if (isInsideBarWidth && isInsideGraphArea) {
          const tappedSegment = isSegmentMode
            ? hitTestStackSegment(
                data[index]!,
                locationY,
                maxValue,
                maxBarHeight,
                graphBottom,
                segmentGap
              )
            : -1;
          const isSameTarget =
            selectedIndex.value === index &&
            selectedSegmentIndex.value === tappedSegment;
          if (!isSameTarget) {
            nextIndex = index;
            nextSegment = tappedSegment;
          }
        }
      }

      // Controlled mode: parent owns the state, only notify.
      if (!isControlled) {
        selectedIndex.value = nextIndex;
        selectedSegmentIndex.value = nextSegment;
      }
      runOnJS(handleJsCallback)(nextIndex, nextSegment);
    });

  const dynamicContainerStyle = useAnimatedStyle(() => {
    return {
      width: Math.max(contentWidth, canvasWidth),
    };
  }, [contentWidth, canvasWidth]);

  return (
    <View style={[styles.container, { height, width: canvasWidth }, style]}>
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={[{ width: canvasWidth, height }]}>
          <BarChartContext.Provider value={barChartContext}>
            {children}
          </BarChartContext.Provider>
        </Canvas>
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEnabled={isScrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          width: Math.max(contentWidth, canvasWidth),
        }}
        style={StyleSheet.absoluteFill}
      >
        <GestureDetector gesture={tapGesture}>
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
  canvas: {
    flex: 1,
  },
  touchableArea: {
    height: '100%',
  },
});

export default BarChartCanvas;
