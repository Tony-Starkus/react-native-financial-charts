import React, { useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import { useGaugeChart } from '../GaugeChartContext';
import { buildArcPath } from './arcPath';

export interface GaugeChartTrackPropsInterface {
  /** @default '#1F2937' */
  color?: string;
  /** Defaults to Root `strokeWidth`. */
  strokeWidth?: number;
  /** @default 'round' */
  strokeCap?: 'round' | 'butt' | 'square';
  /** @default 1 */
  opacity?: number;
}

/** Background arc covering the full `[min, max]` range. */
const GaugeChartTrack: React.FC<GaugeChartTrackPropsInterface> = ({
  color = '#1F2937',
  strokeWidth,
  strokeCap = 'round',
  opacity = 1,
}) => {
  const {
    cx,
    cy,
    radius,
    startAngle,
    sweepAngle,
    strokeWidth: rootStroke,
  } = useGaugeChart();

  const path = useMemo(
    () => buildArcPath(cx, cy, radius, startAngle, sweepAngle),
    [cx, cy, radius, startAngle, sweepAngle]
  );

  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={strokeWidth ?? rootStroke}
      strokeCap={strokeCap}
      opacity={opacity}
    />
  );
};

GaugeChartTrack.displayName = 'GaugeChartTrack';

export default GaugeChartTrack;
