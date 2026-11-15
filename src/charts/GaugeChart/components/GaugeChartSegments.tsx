import React, { useMemo } from 'react';
import { Group, Path } from '@shopify/react-native-skia';
import { useGaugeChart } from '../GaugeChartContext';
import { buildArcPath } from './arcPath';

export interface GaugeChartSegmentsPropsInterface {
  /** Defaults to Root `strokeWidth`. */
  strokeWidth?: number;
  /**
   * Angular gap between adjacent segments, in degrees.
   * @default 0
   */
  gapAngle?: number;
  /** @default 'butt' */
  strokeCap?: 'round' | 'butt' | 'square';
  /** @default 1 */
  opacity?: number;
}

/** Draws the Root `segments` as colored arcs. */
const GaugeChartSegments: React.FC<GaugeChartSegmentsPropsInterface> = ({
  strokeWidth,
  gapAngle = 0,
  strokeCap = 'butt',
  opacity = 1,
}) => {
  const {
    cx,
    cy,
    radius,
    startAngle,
    sweepAngle,
    segments,
    strokeWidth: rootStroke,
  } = useGaugeChart();

  const paths = useMemo(() => {
    const halfGap = Math.max(0, gapAngle) / 2;

    return segments.map((segment, index) => {
      const isFirst = index === 0;
      const isLast = index === segments.length - 1;
      // Gaps only between segments, never at the outer ends of the arc.
      const from =
        startAngle +
        segment.startProgress * sweepAngle +
        (isFirst ? 0 : halfGap);
      const to =
        startAngle + segment.endProgress * sweepAngle - (isLast ? 0 : halfGap);

      return {
        key: `${segment.from}-${segment.to}-${index}`,
        color: segment.color,
        path: buildArcPath(cx, cy, radius, from, Math.max(0, to - from)),
      };
    });
  }, [segments, cx, cy, radius, startAngle, sweepAngle, gapAngle]);

  return (
    <Group opacity={opacity}>
      {paths.map(({ key, color, path }) => (
        <Path
          key={key}
          path={path}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth ?? rootStroke}
          strokeCap={strokeCap}
        />
      ))}
    </Group>
  );
};

GaugeChartSegments.displayName = 'GaugeChartSegments';

export default GaugeChartSegments;
