import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * @interface GaugeSegment
 * A colored value range drawn along the gauge arc.
 */
export interface GaugeSegment {
  /** Start of the range (in data units, clamped to `[min, max]`). */
  from: number;
  /** End of the range (in data units, clamped to `[min, max]`). */
  to: number;
  /** Segment color (hex, rgb, or named color). */
  color: string;
  /** Optional descriptive label (e.g. "Low", "High"). */
  label?: string;
}

/**
 * Segment after normalization: clamped, sorted and with progress fractions (0..1).
 */
export interface GaugeNormalizedSegment extends GaugeSegment {
  startProgress: number;
  endProgress: number;
}

export interface GaugeChartRootPropsInterface {
  /** Current value. Clamped to `[min, max]` for drawing. */
  value: number;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /**
   * Chart width in pixels. The height is derived from the arc geometry unless `height` is set.
   * @default 300
   */
  width?: number;
  /** Optional fixed height. When set, the arc is fitted inside `width x height`. */
  height?: number;
  /**
   * Arc start angle in degrees. Skia convention: 0 = 3 o'clock, angles grow clockwise.
   * @default 135
   */
  startAngle?: number;
  /**
   * Arc end angle in degrees (same convention). Values lower than `startAngle` wrap by 360.
   * @default 405
   */
  endAngle?: number;
  /**
   * Default arc thickness used by `Track`, `Segments` and `Progress`.
   * @default 20
   */
  strokeWidth?: number;
  /**
   * Extra space around the arc, in pixels.
   * @default 8
   */
  padding?: number;
  /** Colored ranges. Consumed by `Segments`, and by `colorBySegment` in `Progress`/`Needle`. */
  segments?: GaugeSegment[];
  /**
   * Animates value changes (and the initial sweep from `min`).
   * @default true
   */
  animated?: boolean;
  /** @default 600 */
  animationDuration?: number;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * @interface GaugeChartContextInterface
 * Internal state shared between GaugeChart components.
 */
export interface GaugeChartContextInterface {
  min: number;
  max: number;
  /** Target value clamped to `[min, max]`. */
  value: number;
  /** Animated value (UI thread), moves towards `value`. */
  animatedValue: SharedValue<number>;
  /** Animated progress in `[0, 1]`, derived from `animatedValue`. */
  progress: SharedValue<number>;
  startAngle: number;
  sweepAngle: number;
  endAngle: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
  strokeWidth: number;
  segments: GaugeNormalizedSegment[];
}

export interface GaugeLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
}

// Backward-compatible alias for the early WIP name.
export type GaugeChartProps = GaugeChartRootPropsInterface;
