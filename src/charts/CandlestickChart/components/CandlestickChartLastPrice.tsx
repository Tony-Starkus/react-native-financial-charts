import React from 'react';
import {
  DashPathEffect,
  Group,
  Line,
  RoundedRect,
  Text,
  vec,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';
import {
  calculateCandlestickLastPriceLabelPosition,
  resolveCandlestickLastPriceLabelLayout,
} from '../utils';

export interface CandlestickChartLastPricePropsInterface {
  lineColor?: string;
  lineWidth?: number;
  dashEffect?: number[];
  textColor?: string;
  labelBackgroundColor?: string;
  labelBorderRadius?: number;
  labelPaddingHorizontal?: number;
  labelPaddingVertical?: number;
  rightOffset?: number;
  formatLabel?: (value: number) => string;
}

const clampChannel = (value: number) => {
  return Math.max(0, Math.min(255, Math.round(value)));
};

const darkenColor = (color: string, amount = 0.22) => {
  const hexMatch = color
    .trim()
    .match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1]!;
    const isShort = hex.length === 3 || hex.length === 4;
    const normalized = isShort
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;
    const hasAlpha = normalized.length === 8;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const alpha = hasAlpha ? normalized.slice(6, 8) : '';
    const factor = 1 - amount;

    const darkenedHex = [r, g, b]
      .map((channel) =>
        clampChannel(channel * factor)
          .toString(16)
          .padStart(2, '0')
      )
      .join('');

    return `#${darkenedHex}${alpha}`;
  }

  const rgbMatch = color
    .trim()
    .match(
      /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i
    );
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    const factor = 1 - amount;
    const red = clampChannel(Number(r) * factor);
    const green = clampChannel(Number(g) * factor);
    const blue = clampChannel(Number(b) * factor);

    if (typeof a === 'string') {
      return `rgba(${red}, ${green}, ${blue}, ${a})`;
    }

    return `rgb(${red}, ${green}, ${blue})`;
  }

  return color;
};

const CandlestickChartLastPrice: React.FC<
  CandlestickChartLastPricePropsInterface
> = ({
  lineColor,
  lineWidth = 1,
  dashEffect = [4, 4],
  textColor = '#F8FAFC',
  labelBackgroundColor,
  labelBorderRadius = 6,
  labelPaddingHorizontal,
  labelPaddingVertical,
  rightOffset = 0,
  formatLabel = (value) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 6 }),
}) => {
  const {
    layoutData,
    canvasWidth,
    font,
    animatedDomainMin,
    animatedDomainMax,
    plotTop,
    plotBottom,
    bullishColor,
    bearishColor,
    hasYAxis,
    yAxisLabelAlignment,
    yAxisLabelOffsetX,
    yAxisLabelYOffset,
    yAxisLabelPadding,
    yAxisShouldDrawBackground,
  } = useCandlestickChart();

  const lastItem = layoutData[layoutData.length - 1];
  const resolvedLineColor =
    lineColor ??
    lastItem?.color ??
    (lastItem?.isBullish ? bullishColor : bearishColor);
  const resolvedLabelBackgroundColor =
    labelBackgroundColor ?? darkenColor(resolvedLineColor);
  const lastClose = lastItem?.data.close ?? 0;
  const labelLayout = font
    ? resolveCandlestickLastPriceLabelLayout({
        lastClose,
        canvasWidth,
        font,
        hasYAxis,
        yAxisLabelAlignment,
        yAxisLabelOffsetX,
        yAxisLabelYOffset,
        yAxisLabelPadding,
        yAxisShouldDrawBackground,
        labelPaddingHorizontal,
        labelPaddingVertical,
        rightOffset,
        formatLabel,
      })
    : null;

  const lineY = useDerivedValue(() => {
    const safeRange = Math.max(
      animatedDomainMax.value - animatedDomainMin.value,
      1
    );
    const progress = (lastClose - animatedDomainMin.value) / safeRange;
    return plotBottom - progress * Math.max(plotBottom - plotTop, 1);
  }, [animatedDomainMin, animatedDomainMax, lastClose, plotTop, plotBottom]);

  const p1 = useDerivedValue(() => {
    return vec(0, lineY.value);
  }, [lineY]);

  const p2 = useDerivedValue(() => {
    return vec(canvasWidth, lineY.value);
  }, [canvasWidth, lineY]);

  const labelRectY = useDerivedValue(() => {
    if (!labelLayout) return 0;

    return calculateCandlestickLastPriceLabelPosition({
      lineY: lineY.value,
      plotTop,
      plotBottom,
      fontSize: labelLayout.fontSize,
      labelYOffset: labelLayout.resolvedLabelYOffset,
      labelPaddingVertical: labelLayout.resolvedLabelPaddingVertical,
    }).labelRectY;
  }, [labelLayout, lineY, plotTop, plotBottom]);

  const textY = useDerivedValue(() => {
    if (!labelLayout) return 0;

    return calculateCandlestickLastPriceLabelPosition({
      lineY: lineY.value,
      plotTop,
      plotBottom,
      fontSize: labelLayout.fontSize,
      labelYOffset: labelLayout.resolvedLabelYOffset,
      labelPaddingVertical: labelLayout.resolvedLabelPaddingVertical,
    }).textY;
  }, [labelLayout, lineY, plotTop, plotBottom]);

  if (!lastItem || !font || !labelLayout) return null;

  return (
    <Group>
      <Line p1={p1} p2={p2} color={resolvedLineColor} strokeWidth={lineWidth}>
        {dashEffect && <DashPathEffect intervals={dashEffect} />}
      </Line>
      <RoundedRect
        x={labelLayout.labelX}
        y={labelRectY}
        width={labelLayout.labelWidth}
        height={labelLayout.labelHeight}
        r={labelBorderRadius}
        color={resolvedLabelBackgroundColor}
      />
      <Text
        x={labelLayout.textX}
        y={textY}
        text={labelLayout.labelText}
        font={font}
        color={textColor}
      />
    </Group>
  );
};

CandlestickChartLastPrice.displayName = 'CandlestickChartLastPrice';

export default CandlestickChartLastPrice;
