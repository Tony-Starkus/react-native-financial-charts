import React from 'react';
import { useBarChart } from '../BarChartContext';
import {
  Group,
  Path,
  Skia,
  Picture,
  type SkFont,
} from '@shopify/react-native-skia';
import { BAR_CHART_PADDING_LEFT } from '../constants';
import {
  Extrapolation,
  interpolate,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import BarChartSkeleton from './BarChartSkeleton';

export interface BarChartBarPropsInterface {
  /**
   * Distance of X-axis text from the bottom of the graph.
   * @default 4
   */
  labelPaddingTop?: number;
  /**
   * Color of the X-axis text.
   * @default #555555
   */
  labelColor?: string;
  /**
   * Border radius of the bars.
   * @default 4
   */
  barBorderRadius?: number;

  /**
   * If true, displays the numeric value above each bar.
   * @default false
   */
  showValueLabels?: boolean;
  /**
   * Color of the value label (above the bar).
   * @default #555555
   */
  valueLabelColor?: string;
  /**
   * Distance between the top of the bar and the value label.
   * @default 4
   */
  valueLabelPaddingBottom?: number;
  /**
   * Function to format the value displayed above the bar.
   * NOTE: Runs on the UI Thread (Worklet). Keep it simple (e.g., val.toFixed(2)).
   */
  formatValueLabel?: (value: number) => string;
}

/**
 * WORKLET: Helper to truncate text directly on the UI Thread.
 * Must be marked with 'worklet' to run synchronously in Reanimated/Skia.
 */
const truncateTextWorklet = (text: string, font: SkFont, maxWidth: number) => {
  'worklet';
  const textWidth = font.getTextWidth(text);
  if (textWidth <= maxWidth) return text;

  const ellipsis = '...';
  // Optimization: estimated or calculated fixed width
  const ellipsisWidth = font.getTextWidth(ellipsis);
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) return '';

  let truncated = text;
  // Simple truncation loop
  while (truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    if (font.getTextWidth(truncated) <= availableWidth) {
      return truncated + ellipsis;
    }
  }
  return truncated;
};

const BarChartBar: React.FC<BarChartBarPropsInterface> = ({
  labelPaddingTop = 4,
  labelColor = '#555555',
  barBorderRadius = 4,
  showValueLabels = false,
  valueLabelColor = '#555555',
  valueLabelPaddingBottom = 4,
  formatValueLabel,
}) => {
  const {
    isLoading,
    data,
    maxValue,
    graphBottom,
    barWidth,
    spacing,
    barColor,
    activeBorderColor,
    activeBorderWidth,
    font,
    showXAxis,
    maxBarHeight,
    entryProgress,
    selectedIndex,
    scrollX,
    canvasWidth,
    height,
  } = useBarChart();

  // 1. Bars Rendering (Changed from Path to Picture to support individual colors)
  // Calculated on the UI Thread for ALL items at once.
  const barsPicture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(
      Skia.XYWHRect(0, 0, canvasWidth, height)
    );

    const itemFullWidth = barWidth + spacing;
    const paint = Skia.Paint();

    // Parse the default color once
    const defaultColor = Skia.Color(barColor);

    // MATHEMATICAL CULLING (GPU Optimization)
    const rawStartIndex = Math.floor(scrollX.value / itemFullWidth);
    const rawEndIndex = Math.ceil(
      (scrollX.value + canvasWidth) / itemFullWidth
    );

    const startIndex = Math.max(0, rawStartIndex - 2);
    const endIndex = Math.min(data.length, rawEndIndex + 2);

    for (let i = startIndex; i < endIndex; i++) {
      const item = data[i]!;
      const worldX = BAR_CHART_PADDING_LEFT + i * itemFullWidth;
      const screenX = worldX - scrollX.value;

      // Waterfall Animation Logic
      const start = (i / data.length) * 0.5;
      const end = start + 0.5;
      const progress = interpolate(
        entryProgress.value,
        [start, end],
        [0, 1],
        Extrapolation.CLAMP
      );
      const eased = progress * (2 - progress);

      const targetHeight = (item.value / maxValue) * maxBarHeight;
      const currentHeight = targetHeight * eased;
      const currentY = graphBottom - currentHeight;

      const rect = Skia.XYWHRect(screenX, currentY, barWidth, currentHeight);
      const rrect = Skia.RRectXY(rect, barBorderRadius, barBorderRadius);

      // CORRECTION: Set color per item if available, otherwise use default
      if (item.color) {
        paint.setColor(Skia.Color(item.color));
      } else {
        paint.setColor(defaultColor);
      }

      canvas.drawRRect(rrect, paint);
    }

    return recorder.finishRecordingAsPicture();
  }, [
    scrollX,
    entryProgress,
    data,
    maxValue,
    maxBarHeight,
    graphBottom,
    barWidth,
    spacing,
    canvasWidth,
    barBorderRadius,
    barColor, // Added dependency
    height,
  ]);

  // 2. Selection Border Path (Stroke)
  const selectionPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const idx = selectedIndex.value;

    // If nothing selected, return empty path
    if (idx === -1 || idx >= data.length) return path;

    const item = data[idx]!;
    const itemFullWidth = barWidth + spacing;
    const worldX = BAR_CHART_PADDING_LEFT + idx * itemFullWidth;
    const screenX = worldX - scrollX.value;

    // Check if selected bar is on screen before drawing
    if (screenX + barWidth < 0 || screenX > canvasWidth) return path;

    const start = (idx / data.length) * 0.5;
    const end = start + 0.5;
    const progress = interpolate(
      entryProgress.value,
      [start, end],
      [0, 1],
      Extrapolation.CLAMP
    );
    const eased = progress * (2 - progress);
    const currentBarHeight = (item.value / maxValue) * maxBarHeight * eased;
    const y = graphBottom - currentBarHeight;

    path.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(screenX, y, barWidth, currentBarHeight),
        barBorderRadius,
        barBorderRadius
      )
    );
    return path;
  }, [
    selectedIndex,
    scrollX,
    entryProgress,
    data,
    barWidth,
    spacing,
    barBorderRadius,
  ]);

  // Selection Opacity Animation
  const selectionOpacity = useDerivedValue(() => {
    return withTiming(selectedIndex.value !== -1 ? 1 : 0, { duration: 200 });
  }, [selectedIndex]);

  // 3. Label Rendering via Picture (Pure Canvas)
  const labelsPicture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    // Start recording within the visible area bounds
    const canvas = recorder.beginRecording(
      Skia.XYWHRect(0, 0, canvasWidth, height)
    );

    if (!showXAxis || !font) {
      return recorder.finishRecordingAsPicture();
    }

    const itemFullWidth = barWidth + spacing;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(labelColor));

    // Same Culling as bars
    const rawStartIndex = Math.floor(scrollX.value / itemFullWidth);
    const rawEndIndex = Math.ceil(
      (scrollX.value + canvasWidth) / itemFullWidth
    );
    const startIndex = Math.max(0, rawStartIndex - 2);
    const endIndex = Math.min(data.length, rawEndIndex + 2);

    for (let i = startIndex; i < endIndex; i++) {
      const item = data[i]!;
      const worldX = BAR_CHART_PADDING_LEFT + i * itemFullWidth;
      const screenX = worldX - scrollX.value;

      // Truncation
      const maxLabelWidth = barWidth + spacing - 4;
      const text = truncateTextWorklet(
        item.label,
        font,
        Math.max(maxLabelWidth, 10)
      );

      const textWidth = font.getTextWidth(text);
      const labelX = screenX + barWidth / 2 - textWidth / 2;
      const labelY = graphBottom + labelPaddingTop + 10;

      // Entry opacity
      const start = (i / data.length) * 0.5;
      const end = start + 0.5;
      const progress = interpolate(
        entryProgress.value,
        [start, end],
        [0, 1],
        Extrapolation.CLAMP
      );

      paint.setAlphaf(progress); // Apply opacity to paint

      canvas.drawText(text, labelX, labelY, paint, font);
    }

    return recorder.finishRecordingAsPicture();
  }, [
    scrollX,
    data,
    font,
    showXAxis,
    barWidth,
    spacing,
    entryProgress,
    graphBottom,
    height,
    canvasWidth,
    labelColor,
  ]);

  // 4. Value Labels Rendering (Above Bars)
  const valueLabelsPicture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(
      Skia.XYWHRect(0, 0, canvasWidth, height)
    );

    // If disabled or no font, returns empty
    if (!showValueLabels || !font) {
      return recorder.finishRecordingAsPicture();
    }

    const itemFullWidth = barWidth + spacing;
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(valueLabelColor));

    // Culling (same logic as bars)
    const rawStartIndex = Math.floor(scrollX.value / itemFullWidth);
    const rawEndIndex = Math.ceil(
      (scrollX.value + canvasWidth) / itemFullWidth
    );
    const startIndex = Math.max(0, rawStartIndex - 2);
    const endIndex = Math.min(data.length, rawEndIndex + 2);

    for (let i = startIndex; i < endIndex; i++) {
      const item = data[i]!;

      // HIDING LOGIC: If the bar is selected, do not draw the value label
      // to avoid overlapping the Tooltip.
      if (selectedIndex.value === i) continue;

      const worldX = BAR_CHART_PADDING_LEFT + i * itemFullWidth;
      const screenX = worldX - scrollX.value;

      // Entry animation
      const start = (i / data.length) * 0.5;
      const end = start + 0.5;
      const progress = interpolate(
        entryProgress.value,
        [start, end],
        [0, 1],
        Extrapolation.CLAMP
      );
      const eased = progress * (2 - progress);

      const targetHeight = (item.value / maxValue) * maxBarHeight;
      const currentHeight = targetHeight * eased;
      const currentY = graphBottom - currentHeight;

      // Text formatting
      let text = '';
      if (formatValueLabel) {
        text = formatValueLabel(item.value);
      } else {
        text = item.value.toString();
      }

      const textWidth = font.getTextWidth(text);
      const labelX = screenX + barWidth / 2 - textWidth / 2;
      // Position above the bar (Current Y - padding)
      const labelY = currentY - valueLabelPaddingBottom;

      paint.setAlphaf(progress);
      canvas.drawText(text, labelX, labelY, paint, font);
    }

    return recorder.finishRecordingAsPicture();
  }, [
    scrollX,
    data,
    font,
    showValueLabels,
    barWidth,
    spacing,
    entryProgress,
    graphBottom,
    height,
    canvasWidth,
    valueLabelColor,
    selectedIndex,
    maxValue,
    maxBarHeight,
    valueLabelPaddingBottom,
    formatValueLabel,
  ]);

  if (isLoading) {
    return <BarChartSkeleton />;
  }

  if (!font) return null;

  return (
    <Group>
      {/* Bars Layer (Updated to Picture) */}
      <Picture picture={barsPicture} />

      {/* Labels Layer (Drawn imperatively via Picture) */}
      <Picture picture={labelsPicture} />

      {/** Value Labels Layer */}
      <Picture picture={valueLabelsPicture} />

      {/* Selection Layer (Border) */}
      <Path
        path={selectionPath}
        color={activeBorderColor}
        style="stroke"
        strokeWidth={activeBorderWidth}
        opacity={selectionOpacity}
      />
    </Group>
  );
};

export default BarChartBar;
