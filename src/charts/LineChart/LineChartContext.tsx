import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import * as d3 from 'd3';

import type { LineChartContextValue, LineChartDataPoint } from './interfaces';
import { Skia } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { solveCatmullRom } from '../../utils';

const MOCK_SHARED_VAL_NUM = { value: 0 } as SharedValue<number>;
const MOCK_SHARED_VAL_BOOL = { value: false } as SharedValue<boolean>;
const EMPTY_PATH = Skia.Path.Make();
const WINDOW_WIDTH = Dimensions.get('window').width;

const INITIAL_CONTEXT: LineChartContextValue = {
  originalData: [],
  width: WINDOW_WIDTH,
  height: 250,
  padding: 20,
  domainX: [0, 1],
  domainY: [0, 1],
  yRange: [0, 1],
  xScale: d3.scaleTime(),
  yScale: d3.scaleLinear(),
  path: EMPTY_PATH,
  areaPath: EMPTY_PATH,
  baselineY: 0,
  gradientColors: ['#000', '#000', '#000', '#000'],
  gradientPositions: [0, 0.5, 0.5, 1],
  currentX: MOCK_SHARED_VAL_NUM,
  currentY: MOCK_SHARED_VAL_NUM,
  isActive: MOCK_SHARED_VAL_BOOL,
  currentValue: MOCK_SHARED_VAL_NUM,
  currentTimestamp: MOCK_SHARED_VAL_NUM,
  // @ts-ignore
  yMap: new Float32Array(0),
  // @ts-ignore
  valueMap: new Float32Array(0),
};

export const ChartContext =
  createContext<LineChartContextValue>(INITIAL_CONTEXT);

export interface ChartRootPropsInterface extends PropsWithChildren {
  data: LineChartDataPoint[];
  width?: number;
  height?: number;
  padding?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export type LineChartRootPropsInterface = ChartRootPropsInterface;

const LineChartProvider: React.FC<ChartRootPropsInterface> = ({
  data,
  width = Dimensions.get('window').width,
  height = 250,
  padding = 20,
  containerStyle,
  children,
}) => {
  // Initialize Reanimated shared values
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const currentValue = useSharedValue(0);
  const currentTimestamp = useSharedValue(0);

  // useMemo: "Only execute this heavy logic if data or screen size changes"
  const processedContext = useMemo(() => {
    // 1. Safety validations (prevent crashes with empty array)
    if (!data || data.length < 2 || width === 0) {
      return {
        ...INITIAL_CONTEXT,
        originalData: data || [],
        width: width || WINDOW_WIDTH,
        height,
        padding,
        currentX,
        currentY,
        isActive,
        currentValue,
        currentTimestamp,
      };
    }

    // 2. Extract Data Limits (Min/Max)
    const timestamps = data.map((d) => d.timestamp);
    const values = data.map((d) => d.value);

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // 3. Define Drawing Area (with vertical "breathing room")
    const verticalSquish = height * 0.15; // Leave 15% margin
    const minRangeY = height - padding - verticalSquish;
    const maxRangeY = padding + verticalSquish;
    const safeMinRangeY = Math.max(minRangeY, maxRangeY + 1);
    const domainYMin = minValue;
    const domainYMax = maxValue;

    // 4. Create D3 Scales (Unit Converters)
    const xScale = d3
      .scaleTime()
      .domain([minTime, maxTime])
      .range([padding, width - padding]);
    const yScale = d3
      .scaleLinear()
      .domain([domainYMin, domainYMax])
      .range([safeMinRangeY, maxRangeY]);

    const firstValue = data[0]?.value || 0;
    const baselineY = yScale(firstValue);

    // --- THE BIG MAGIC: MANUAL PATH AND MAP GENERATION ---
    // Instead of asking D3 to draw the line and then trying to guess where it is,
    // we calculate PIXEL BY PIXEL where the line should pass.
    // We save this in two places:
    //   1. skiaPath: To draw on the screen.
    //   2. yMap / valueMap: Giant arrays for the finger to query instantly.

    const skiaPath = Skia.Path.Make();
    if (data.length > 0) {
      skiaPath.moveTo(
        xScale(data[0]?.timestamp || 0),
        yScale(data[0]?.value || 0)
      );
    }

    // Create typed arrays (Float32) the exact size of the screen width.
    // This is extremely efficient for memory and reading.
    const mapSize = Math.ceil(width);
    const yMap = new Float32Array(mapSize).fill(-1);
    const valueMap = new Float32Array(mapSize).fill(-1);

    const totalPoints = data.length - 1;
    const xPixelStart = padding;
    const xPixelEnd = width - padding;
    const xTotalRange = xPixelEnd - xPixelStart;

    // === THE MAIN LOOP ===
    // We iterate through every X coordinate on the screen (0, 1, 2... 400).
    for (let x = 0; x < width; x++) {
      // If we are outside the chart's useful area (margins), skip.
      if (x < xPixelStart || x > xPixelEnd) continue;

      // STEP A: Discover where we are on the timeline.
      // progress = 0.5 means we are exactly in the middle of the chart.
      const progress = (x - xPixelStart) / xTotalRange;

      // STEP B: Find which data points surround us.
      const floatIndex = progress * totalPoints;
      const index = Math.floor(floatIndex); // Index of the point to the left
      const safeIndex = Math.min(index, totalPoints - 1);

      // STEP C: Local progress (t) between current and next point.
      const t = floatIndex - safeIndex;

      // STEP D: Select the 4 control points for Catmull-Rom.
      // p1 and p2 are the points we are passing between.
      const p1 = data[safeIndex]?.value || 0;
      const p2 = data[safeIndex + 1]?.value ?? p1;

      // p0 and p3 are the "distant neighbors" needed to calculate the curve.
      // If they don't exist (at edges), we duplicate the neighbor (standard D3 strategy).
      const p0 = safeIndex > 0 ? data[safeIndex - 1]?.value || 0 : p1;
      const p3 =
        safeIndex < totalPoints - 1 ? data[safeIndex + 2]?.value || 0 : p2;

      // STEP E: Calculate Exact Interpolated Value
      const interpolatedValue = solveCatmullRom(p0, p1, p2, p3, t);
      const interpolatedY = yScale(interpolatedValue);

      // STEP F: Save to maps and drawing
      yMap[x] = interpolatedY; // Height Map
      valueMap[x] = interpolatedValue; // Value Map

      // Add line to visual drawing. Since we do this pixel by pixel, the curve is perfect.
      skiaPath.lineTo(x, interpolatedY);
    }

    // Close the area (to create the gradient effect below the line)
    const areaPath = skiaPath.copy();
    areaPath.lineTo(width - padding, baselineY); // Down to base
    areaPath.lineTo(padding, baselineY); // Back to start
    areaPath.close();

    // Gradient calculation (Green on top, Red on bottom)
    const safeHeight = height || 1;
    const splitRatio = Math.max(0, Math.min(1, baselineY / safeHeight));

    return {
      originalData: data,
      width,
      height,
      padding,
      domainX: [minTime, maxTime] as [number, number],
      domainY: [domainYMin, domainYMax] as [number, number],
      yRange: [safeMinRangeY, maxRangeY] as [number, number],
      xScale,
      yScale,
      path: skiaPath,
      areaPath: areaPath,
      baselineY: baselineY || 0,
      gradientColors: ['#00E396E6', '#00E39600', '#EA394300', '#EA394326'],
      gradientPositions: [0, splitRatio, splitRatio, 1],
      currentX,
      currentY,
      isActive,
      currentValue,
      currentTimestamp,
      yMap,
      valueMap,
    };
  }, [
    data,
    width,
    height,
    padding,
    currentX,
    currentY,
    isActive,
    currentValue,
    currentTimestamp,
  ]);

  // --- GESTURE HANDLER (USER INTERACTION) ---
  // This function runs on the UI Thread (Worklet). It is critical for performance.
  // It DOES NOT RECALCULATE math. It simply reads the map we created above.
  const onGestureEvent = (touchX: number) => {
    'worklet'; // Directive for Reanimated to compile this separately.

    if (!processedContext.yMap || processedContext.yMap.length === 0) return;

    // 1. Limit touch to chart boundaries (Clamp)
    const x = Math.max(padding, Math.min(touchX, width - padding));
    currentX.value = x;

    // 2. DIRECT LOOKUP (O(1) Complexity - Instant)
    // Since we created a map where index = pixel X, we just round the touch X
    // and grab the value from the array. No complex math here!
    const xIndex = Math.round(x);

    // @ts-ignore - Direct access to TypedArray on UI thread
    const preCalculatedY = processedContext.yMap[xIndex];
    // @ts-ignore
    const preCalculatedValue = processedContext.valueMap[xIndex];

    // If we found a valid value in the map, update reactive variables.
    if (
      preCalculatedY !== undefined &&
      preCalculatedY !== -1 &&
      preCalculatedValue !== undefined &&
      preCalculatedValue !== -1
    ) {
      currentY.value = preCalculatedY;
      currentValue.value = preCalculatedValue;
    }

    // 3. Timestamp (Time is linear, so we can mathematically calculate without issues)
    const xRangeStart = padding;
    const xRangeEnd = width - padding;
    const progress = (x - xRangeStart) / (xRangeEnd - xRangeStart);
    const [minTime, maxTime] = processedContext.domainX;
    currentTimestamp.value = minTime + progress * (maxTime - minTime);
  };

  // Gesture Configuration
  const gesture = Gesture.Pan()
    .onBegin((e) => {
      isActive.value = true;
      onGestureEvent(e.x);
    })
    .onChange((e) => {
      onGestureEvent(e.x);
    })
    .onFinalize(() => {
      isActive.value = false;
    });

  return (
    <ChartContext.Provider value={processedContext}>
      <GestureDetector gesture={gesture}>
        <View style={[styles.container, containerStyle]}>{children}</View>
      </GestureDetector>
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(
      '[ChartContext]: the useChart hook must be used inside ChartContext provider'
    );
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#17171A',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
});

export default LineChartProvider;
