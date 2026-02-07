import * as d3 from 'd3';
import type { SharedValue } from 'react-native-reanimated';

export type LineChartDataPoint = { timestamp: number; value: number };

// The Context holds all the calculated values so child components (Line, Cursor) can access them
// without needing to pass props down through N layers
export type LineChartContextValue = {
  originalData: LineChartDataPoint[];
  width: number;
  height: number;
  padding: number;

  // 'Domain': The raw min/max values from your data (e.g., Min Price: $10, Max Price: $5000)
  domainX: [number, number];
  domainY: [number, number];

  // 'Range': The screen coordinates (e.g., Pixel 0 to Pixel 300)
  // Used manually in the gesture handler to map data back to pixels.
  yRange: [number, number];

  // 'Scales': D3 functions. Call scale(value) and it returns a pixel coordinate.
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;

  // Skia Paths: The actual vector drawing commands ready to be rendered.
  path: any;
  areaPath: any;

  // The Y pixel where the chart starts (leftmost point)
  baselineY: number;

  // Gradient Props
  gradientColors: string[];
  gradientPositions: number[];

  // Animated Values (SharedValues)
  currentX: SharedValue<number>; // Finger position horizontally on gesture
  currentY: SharedValue<number>; // Value point vertically
  isActive: SharedValue<boolean>; // PAN gesture is active (user is touching)
  currentValue: SharedValue<number>; // Exact value at finger touch point
  currentTimestamp: SharedValue<number>; // Exact datetime at finger touch point

  // These are "TypedArrays" (Float32Array).
  // They can be read synchronously inside a Worklet (UI code).
  // yMap[100] contains the exact Y value of the line at pixel X = 100.
  // @ts-ignore
  yMap: Float32Array;
  // @ts-ignore
  valueMap: Float32Array;
};
