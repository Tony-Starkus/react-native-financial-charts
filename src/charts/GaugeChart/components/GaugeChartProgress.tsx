import React, { useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useGaugeChart } from '../GaugeChartContext';
import { getSegmentColorAt } from '../utils';
import { buildArcPath } from './arcPath';

export interface GaugeChartProgressPropsInterface {
  /** @default '#22C55E' */
  color?: string;
  /**
   * Uses the color of the segment containing the current value
   * (falls back to `color` outside every segment).
   * @default false
   */
  colorBySegment?: boolean;
  /** Defaults to Root `strokeWidth`. */
  strokeWidth?: number;
  /** @default 'round' */
  strokeCap?: 'round' | 'butt' | 'square';
}

/** Animated arc from `min` to the current value. Runs on the UI thread. */
const GaugeChartProgress: React.FC<GaugeChartProgressPropsInterface> = ({
  color = '#22C55E',
  colorBySegment = false,
  strokeWidth,
  strokeCap = 'round',
}) => {
  const {
    cx,
    cy,
    radius,
    startAngle,
    sweepAngle,
    progress,
    animatedValue,
    segments,
    strokeWidth: rootStroke,
  } = useGaugeChart();

  const path = useMemo(
    () => buildArcPath(cx, cy, radius, startAngle, sweepAngle),
    [cx, cy, radius, startAngle, sweepAngle]
  );

  // Trim the full arc instead of rebuilding the path every frame.
  const end = useDerivedValue(() => progress.value, [progress]);

  // Hide at 0 so round caps don't leave a dot at the start.
  const opacity = useDerivedValue(
    () => (progress.value > 0 ? 1 : 0),
    [progress]
  );

  const animatedColor = useDerivedValue(
    () =>
      colorBySegment
        ? getSegmentColorAt(segments, animatedValue.value, color)
        : color,
    [colorBySegment, segments, color, animatedValue]
  );

  return (
    <Path
      path={path}
      color={animatedColor}
      style="stroke"
      strokeWidth={strokeWidth ?? rootStroke}
      strokeCap={strokeCap}
      start={0}
      end={end}
      opacity={opacity}
    />
  );
};

GaugeChartProgress.displayName = 'GaugeChartProgress';

export default GaugeChartProgress;
