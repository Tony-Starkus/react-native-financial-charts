import React from 'react';
import { useBarChart } from '../BarChartContext';
import {
  ClipOp,
  Group,
  Path,
  PathOp,
  Skia,
  Picture,
  type SkFont,
} from '@shopify/react-native-skia';
import { BAR_CHART_PADDING_LEFT } from '../constants';
import {
  computeStackSegmentRects,
  getSegmentDimAmount,
  getSegmentKey,
} from '../utils';
import type { BarChartItemDataInterface, BarChartItemKey } from '../interfaces';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import BarChartSkeleton from './BarChartSkeleton';

// Captured as a plain number so the worklet closure stays primitive.
const CLIP_INTERSECT = ClipOp.Intersect;
const PATH_OP_INTERSECT = PathOp.Intersect;

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
   * For stacked bars, `value` is the stack total.
   * NOTE: Runs on the UI Thread (Worklet). Keep it simple (e.g., val.toFixed(2)).
   */
  formatValueLabel?: (value: number, item: BarChartItemDataInterface) => string;
  /**
   * Color of X-axis labels for items with `highlighted: true`.
   * @default '#F5A524'
   */
  highlightedLabelColor?: string;
  /**
   * Optional font for highlighted X-axis labels (e.g. a bold variant).
   * Falls back to the chart font.
   */
  highlightedLabelFont?: SkFont | null;
  /**
   * Color painted over segments that are not part of the highlighted series
   * (`selectionMode="series"`). When omitted, inactive segments keep their
   * color and fade to `inactiveSegmentOpacity` instead.
   */
  inactiveSegmentColor?: string;
  /**
   * Opacity of inactive segments when `inactiveSegmentColor` is not set.
   * @default 0.25
   */
  inactiveSegmentOpacity?: number;
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
  inactiveSegmentColor,
  inactiveSegmentOpacity = 0.25,
  highlightedLabelColor = '#F5A524',
  highlightedLabelFont,
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
    selectedSegmentIndex,
    segmentGap,
    selectedSeriesKey,
  } = useBarChart();

  // Series highlight animation. `displayedSeriesKey` outlives the selection
  // while fading out, so the previously highlighted series stays in color
  // until everything is back to full color.
  const displayedSeriesKey = useSharedValue<BarChartItemKey | null>(null);
  const seriesProgress = useSharedValue(0);

  useAnimatedReaction(
    () => selectedSeriesKey.value,
    (current, previous) => {
      if (current === previous) return;
      const timing = { duration: 220, easing: Easing.out(Easing.cubic) };
      if (current !== null) {
        displayedSeriesKey.value = current;
        seriesProgress.value = withTiming(1, timing);
      } else {
        seriesProgress.value = withTiming(0, timing, (finished) => {
          'worklet';
          if (finished) displayedSeriesKey.value = null;
        });
      }
    },
    [selectedSeriesKey]
  );

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
    const inactiveColor = inactiveSegmentColor
      ? Skia.Color(inactiveSegmentColor)
      : null;
    const activeSeriesKey = displayedSeriesKey.value;
    const highlightProgress = seriesProgress.value;

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

      const segments = item.segments;
      if (segments && segments.length > 0) {
        // STACKED: clip to the whole-bar rounded rect so the stack keeps the
        // same silhouette as a simple bar, then draw plain segment rects.
        const values: number[] = [];
        for (let s = 0; s < segments.length; s++) {
          values.push(segments[s]!.value);
        }
        const rects = computeStackSegmentRects(
          values,
          graphBottom,
          currentHeight,
          segmentGap
        );

        canvas.save();
        canvas.clipRRect(rrect, CLIP_INTERSECT, true);
        for (let s = 0; s < segments.length; s++) {
          const segRect = rects[s]!;
          if (segRect.height <= 0) continue;
          const segment = segments[s]!;
          const segColor = segment.color ?? item.color;
          const segBounds = Skia.XYWHRect(
            screenX,
            segRect.y,
            barWidth,
            segRect.height
          );
          const dim = getSegmentDimAmount(
            getSegmentKey(segment),
            activeSeriesKey,
            highlightProgress
          );

          paint.setColor(segColor ? Skia.Color(segColor) : defaultColor);
          if (dim > 0 && !inactiveColor) {
            paint.setAlphaf(1 - (1 - inactiveSegmentOpacity) * dim);
          }
          canvas.drawRect(segBounds, paint);

          if (dim > 0 && inactiveColor) {
            // Cross-fade to the inactive color by painting it on top.
            paint.setColor(inactiveColor);
            paint.setAlphaf(dim);
            canvas.drawRect(segBounds, paint);
          }
        }
        canvas.restore();
        continue;
      }

      // CORRECTION: Set color per item if available, otherwise use default
      if (item.color) {
        paint.setColor(Skia.Color(item.color));
      } else {
        paint.setColor(defaultColor);
      }

      // Non-stacked bars belong to no series: dim them while one is active.
      const barDim = getSegmentDimAmount(
        null,
        activeSeriesKey,
        highlightProgress
      );
      if (barDim > 0 && !inactiveColor) {
        paint.setAlphaf(1 - (1 - inactiveSegmentOpacity) * barDim);
      }
      canvas.drawRRect(rrect, paint);
      if (barDim > 0 && inactiveColor) {
        paint.setColor(inactiveColor);
        paint.setAlphaf(barDim);
        canvas.drawRRect(rrect, paint);
      }
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
    segmentGap,
    displayedSeriesKey,
    seriesProgress,
    inactiveSegmentColor,
    inactiveSegmentOpacity,
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

    const barRRect = Skia.RRectXY(
      Skia.XYWHRect(screenX, y, barWidth, currentBarHeight),
      barBorderRadius,
      barBorderRadius
    );

    // Segment selection: outline only the selected piece, clipped to the
    // bar silhouette so the top segment keeps the rounded corners.
    const seg = selectedSegmentIndex.value;
    const segments = item.segments;
    if (seg >= 0 && segments && seg < segments.length) {
      const values: number[] = [];
      for (let s = 0; s < segments.length; s++) {
        values.push(segments[s]!.value);
      }
      const rects = computeStackSegmentRects(
        values,
        graphBottom,
        currentBarHeight,
        segmentGap
      );
      const segRect = rects[seg]!;
      if (segRect.height <= 0) return path;

      path.addRect(Skia.XYWHRect(screenX, segRect.y, barWidth, segRect.height));
      const barPath = Skia.Path.Make();
      barPath.addRRect(barRRect);
      return Skia.Path.MakeFromOp(path, barPath, PATH_OP_INTERSECT) ?? path;
    }

    path.addRRect(barRRect);
    return path;
  }, [
    selectedIndex,
    selectedSegmentIndex,
    segmentGap,
    graphBottom,
    maxValue,
    maxBarHeight,
    canvasWidth,
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
    const baseLabelColor = Skia.Color(labelColor);
    const highlightColor = Skia.Color(highlightedLabelColor);
    const highlightFont = highlightedLabelFont ?? font;

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

      const isHighlighted = item.highlighted === true;
      const labelFont = isHighlighted ? highlightFont : font;
      paint.setColor(isHighlighted ? highlightColor : baseLabelColor);

      // Truncation
      const maxLabelWidth = barWidth + spacing - 4;
      const text = truncateTextWorklet(
        item.label,
        labelFont,
        Math.max(maxLabelWidth, 10)
      );

      const textWidth = labelFont.getTextWidth(text);
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

      canvas.drawText(text, labelX, labelY, paint, labelFont);
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
    highlightedLabelColor,
    highlightedLabelFont,
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
        text = formatValueLabel(item.value, item);
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
