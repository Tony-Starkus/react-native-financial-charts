import React from 'react';
import { Circle, Group, Line, vec } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useGaugeChart } from '../GaugeChartContext';
import { degToRad, getSegmentColorAt, progressToAngle } from '../utils';

export interface GaugeChartNeedlePropsInterface {
  /** @default '#F8FAFC' */
  color?: string;
  /**
   * Uses the color of the segment containing the current value.
   * @default false
   */
  colorBySegment?: boolean;
  /**
   * Needle length as a ratio of the arc radius.
   * @default 0.8
   */
  lengthRatio?: number;
  /** Length behind the pivot, in pixels. @default 0 */
  tailLength?: number;
  /** @default 4 */
  strokeWidth?: number;
  /** @default 8 */
  pivotRadius?: number;
  /** Defaults to the needle color. */
  pivotColor?: string;
}

/** Needle rotating around the arc center. Rotation runs on the UI thread. */
const GaugeChartNeedle: React.FC<GaugeChartNeedlePropsInterface> = ({
  color = '#F8FAFC',
  colorBySegment = false,
  lengthRatio = 0.8,
  tailLength = 0,
  strokeWidth = 4,
  pivotRadius = 8,
  pivotColor,
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
  } = useGaugeChart();

  const length = Math.max(0, radius * lengthRatio);

  // The needle is drawn pointing at 0° (3 o'clock) and rotated into place.
  const transform = useDerivedValue(
    () => [
      {
        rotate: degToRad(
          progressToAngle(progress.value, startAngle, sweepAngle)
        ),
      },
    ],
    [progress, startAngle, sweepAngle]
  );

  const animatedColor = useDerivedValue(
    () =>
      colorBySegment
        ? getSegmentColorAt(segments, animatedValue.value, color)
        : color,
    [colorBySegment, segments, color, animatedValue]
  );

  return (
    <Group>
      <Group transform={transform} origin={vec(cx, cy)}>
        <Line
          p1={vec(cx - tailLength, cy)}
          p2={vec(cx + length, cy)}
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={animatedColor}
        />
      </Group>
      {pivotRadius > 0 && (
        <Circle
          cx={cx}
          cy={cy}
          r={pivotRadius}
          color={pivotColor ?? animatedColor}
        />
      )}
    </Group>
  );
};

GaugeChartNeedle.displayName = 'GaugeChartNeedle';

export default GaugeChartNeedle;
