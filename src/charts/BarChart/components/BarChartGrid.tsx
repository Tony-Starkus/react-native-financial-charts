import React from 'react';
import { Line, vec, DashPathEffect, Group } from '@shopify/react-native-skia';
import { useBarChart } from '../BarChartContext';

/**
 * Props configuration for the Grid component.
 * Focused only on visual lines.
 */
export interface BarChartGridPropsInterface {
  /** * The color of the horizontal grid lines.
   * Default: #E0E0E0 (light gray)
   */
  lineColor?: string;

  /** * The thickness of the grid lines in pixels.
   * Default: 1
   */
  lineWidth?: number;

  /** * Controls the dashed pattern of the line.
   * Example: [10, 5] means "draw 10px, skip 5px".
   * If undefined, the line will be solid.
   */
  dashEffect?: number[];
}

const BarChartGrid: React.FC<BarChartGridPropsInterface> = ({
  lineColor = '#E0E0E0',
  lineWidth = 1,
  dashEffect,
}) => {
  const {
    maxValue,
    contentWidth,
    canvasWidth,
    graphBottom,
    maxBarHeight,
    yAxisTicks,
    font,
  } = useBarChart();

  if (!font) return null;

  // 3. Grid Width (Spans entire scrollable content)
  const gridWidth = Math.max(contentWidth, canvasWidth);

  return (
    <Group>
      {yAxisTicks.map((val, index) => {
        // Calculate Y position
        const barHeight = (val / maxValue) * maxBarHeight;
        const y = graphBottom - barHeight;

        return (
          <Line
            key={index}
            p1={vec(0, y)}
            p2={vec(gridWidth, y)}
            color={lineColor}
            strokeWidth={lineWidth}
          >
            {dashEffect && <DashPathEffect intervals={dashEffect} />}
          </Line>
        );
      })}
    </Group>
  );
};

export default BarChartGrid;
