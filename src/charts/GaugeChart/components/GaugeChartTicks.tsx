import React, { useMemo } from 'react';
import {
  Group,
  Line,
  matchFont,
  Text,
  vec,
  type SkFont,
} from '@shopify/react-native-skia';
import { useGaugeChart } from '../GaugeChartContext';
import { buildGaugeTicks, getPolarPoint, valueToAngle } from '../utils';

export interface GaugeChartTicksPropsInterface {
  /**
   * Number of intervals between `min` and `max` (renders `count + 1` ticks).
   * @default 10
   */
  count?: number;
  /** @default '#64748B' */
  color?: string;
  /** @default 8 */
  length?: number;
  /** @default 2 */
  strokeWidth?: number;
  /** Distance from the inner edge of the arc, in pixels. @default 4 */
  offset?: number;
  /** @default false */
  showLabels?: boolean;
  /** Defaults to `color`. */
  labelColor?: string;
  /** Distance between tick end and label center, in pixels. @default 10 */
  labelOffset?: number;
  /** Custom Skia font. Defaults to system sans-serif at 10px. */
  font?: SkFont | null;
  /** Label formatter. Runs on the JS thread (not a worklet). */
  format?: (value: number) => string;
}

const defaultFormat = (value: number) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

/** Tick marks (and optional labels) placed inside the arc. */
const GaugeChartTicks: React.FC<GaugeChartTicksPropsInterface> = ({
  count = 10,
  color = '#64748B',
  length = 8,
  strokeWidth = 2,
  offset = 4,
  showLabels = false,
  labelColor,
  labelOffset = 10,
  font,
  format = defaultFormat,
}) => {
  const {
    cx,
    cy,
    radius,
    min,
    max,
    startAngle,
    sweepAngle,
    strokeWidth: rootStroke,
  } = useGaugeChart();

  const resolvedFont = useMemo(
    () => font ?? matchFont({ fontFamily: 'sans-serif', fontSize: 10 }),
    [font]
  );

  const ticks = useMemo(() => {
    const outer = radius - rootStroke / 2 - offset;
    const inner = outer - length;
    const labelRadius = inner - labelOffset;
    const fontSize = resolvedFont.getSize();

    return buildGaugeTicks(min, max, count).map((tickValue) => {
      const angle = valueToAngle(tickValue, min, max, startAngle, sweepAngle);
      const label = format(tickValue);
      const labelPoint = getPolarPoint(cx, cy, labelRadius, angle);
      const labelWidth = showLabels ? resolvedFont.getTextWidth(label) : 0;

      return {
        key: `${tickValue}`,
        p1: getPolarPoint(cx, cy, outer, angle),
        p2: getPolarPoint(cx, cy, inner, angle),
        label,
        // Skia text is anchored at the baseline-left; center it on the point.
        labelX: labelPoint.x - labelWidth / 2,
        labelY: labelPoint.y + fontSize / 3,
      };
    });
  }, [
    cx,
    cy,
    radius,
    rootStroke,
    offset,
    length,
    labelOffset,
    min,
    max,
    count,
    startAngle,
    sweepAngle,
    format,
    showLabels,
    resolvedFont,
  ]);

  return (
    <Group>
      {ticks.map((tick) => (
        <Group key={tick.key}>
          {length > 0 && (
            <Line
              p1={vec(tick.p1.x, tick.p1.y)}
              p2={vec(tick.p2.x, tick.p2.y)}
              color={color}
              strokeWidth={strokeWidth}
              strokeCap="round"
            />
          )}
          {showLabels && (
            <Text
              x={tick.labelX}
              y={tick.labelY}
              text={tick.label}
              font={resolvedFont}
              color={labelColor ?? color}
            />
          )}
        </Group>
      ))}
    </Group>
  );
};

GaugeChartTicks.displayName = 'GaugeChartTicks';

export default GaugeChartTicks;
