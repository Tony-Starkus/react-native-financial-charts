import type { SkFont } from '@shopify/react-native-skia';
import type {
  CandlestickChartDataPoint,
  CandlestickChartLayoutItem,
} from './interfaces';

type NiceScaleResult = {
  min: number;
  max: number;
  tickSpacing: number;
  ticks: number[];
};

type CalculateVisibleScaleProps = {
  data: CandlestickChartDataPoint[];
  startIndex: number;
  endIndex: number;
  maxTicks?: number;
  verticalPaddingRatio?: number;
};

const getStepPrecision = (step: number) => {
  if (Number.isInteger(step)) return 0;

  const stepString = step.toString();
  if (stepString.includes('e-')) {
    const [, exponent] = stepString.split('e-');
    return Number(exponent);
  }

  const decimals = stepString.split('.')[1];
  return decimals ? decimals.length : 0;
};

const buildTicksWithinDomain = (min: number, max: number, step: number) => {
  const precision = getStepPrecision(step);
  const epsilon = step / 1000;
  const start = Math.ceil((min - epsilon) / step) * step;
  const end = Math.floor((max + epsilon) / step) * step;
  const ticks: number[] = [];

  for (let value = start; value <= end + epsilon; value += step) {
    ticks.push(Number(value.toFixed(precision)));
  }

  return ticks;
};

export const calculateNiceScale = (
  minValue: number,
  maxValue: number,
  maxTicks = 5
): NiceScaleResult => {
  if (minValue === maxValue) {
    if (maxValue === 0) maxValue = 1;
    else maxValue = maxValue + Math.abs(maxValue) * 0.1;
  }

  const range = maxValue - minValue;
  const roughStep = range / Math.max(maxTicks - 1, 1);
  const stepPower = Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / Math.pow(10, stepPower);

  let niceStep;
  if (normalizedStep < 1.5) niceStep = 1;
  else if (normalizedStep < 3) niceStep = 2;
  else if (normalizedStep < 7) niceStep = 5;
  else niceStep = 10;

  const step = niceStep * Math.pow(10, stepPower);
  const niceMin = Math.floor(minValue / step) * step;
  const niceMax = Math.ceil(maxValue / step) * step;
  const precision = stepPower < 0 ? Math.abs(stepPower) : 0;

  const ticks = [];
  const count = Math.round((niceMax - niceMin) / step);

  for (let i = 0; i <= count; i++) {
    const value = niceMin + i * step;
    ticks.push(parseFloat(value.toFixed(precision)));
  }

  return {
    min: niceMin,
    max: niceMax,
    tickSpacing: step,
    ticks,
  };
};

export const normalizeCandlestickData = (
  data: CandlestickChartDataPoint[]
): CandlestickChartDataPoint[] => {
  return data
    .filter(
      (item) =>
        Number.isFinite(item.timestamp) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close)
    )
    .map((item) => {
      const high = Math.max(item.high, item.open, item.close, item.low);
      const low = Math.min(item.low, item.open, item.close, item.high);

      return {
        ...item,
        high,
        low,
      };
    });
};

export const calculateVisibleCandlestickScale = ({
  data,
  startIndex,
  endIndex,
  maxTicks = 5,
  verticalPaddingRatio = 0.06,
}: CalculateVisibleScaleProps) => {
  if (!data.length) {
    const fallbackScale = calculateNiceScale(0, 1, maxTicks);
    return {
      domainY: [fallbackScale.min, fallbackScale.max] as [number, number],
      yAxisTicks: fallbackScale.ticks,
    };
  }

  const safeStart = Math.max(0, Math.min(startIndex, data.length - 1));
  const safeEnd = Math.max(safeStart, Math.min(endIndex, data.length - 1));
  const visibleItems = data.slice(safeStart, safeEnd + 1);
  const lows = visibleItems.map((item) => item.low);
  const highs = visibleItems.map((item) => item.high);

  let min = Math.min(...lows);
  let max = Math.max(...highs);

  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * verticalPaddingRatio;
    min -= padding;
    max += padding;
  } else {
    const padding = (max - min) * verticalPaddingRatio;
    min -= padding;
    max += padding;
  }

  const scale = calculateNiceScale(min, max, maxTicks);
  const ticks = buildTicksWithinDomain(min, max, scale.tickSpacing);

  return {
    domainY: [min, max] as [number, number],
    yAxisTicks: ticks.length ? ticks : scale.ticks,
  };
};

type BuildCandlestickLayoutProps = {
  data: CandlestickChartDataPoint[];
  domainY: [number, number];
  plotTop: number;
  plotBottom: number;
  candleWidth: number;
  spacing: number;
  bullishColor: string;
  bearishColor: string;
  contentPaddingLeft: number;
};

export const buildCandlestickLayout = ({
  data,
  domainY,
  plotTop,
  plotBottom,
  candleWidth,
  spacing,
  bullishColor,
  bearishColor,
  contentPaddingLeft,
}: BuildCandlestickLayoutProps): CandlestickChartLayoutItem[] => {
  const [minY, maxY] = domainY;
  const safeRange = Math.max(maxY - minY, 1);
  const drawableHeight = Math.max(plotBottom - plotTop, 1);
  const itemFullWidth = candleWidth + spacing;

  const getY = (value: number) => {
    const progress = (value - minY) / safeRange;
    return plotBottom - progress * drawableHeight;
  };

  return data.map((item, index) => {
    const centerX =
      contentPaddingLeft + index * itemFullWidth + candleWidth / 2;
    const bodyX = centerX - candleWidth / 2;
    const openY = getY(item.open);
    const closeY = getY(item.close);
    const highY = getY(item.high);
    const lowY = getY(item.low);
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(openY - closeY), 1);
    const isBullish = item.close >= item.open;

    return {
      index,
      data: item,
      centerX,
      bodyX,
      bodyWidth: candleWidth,
      openY,
      closeY,
      highY,
      lowY,
      bodyY,
      bodyHeight,
      isBullish,
      color: item.color ?? (isBullish ? bullishColor : bearishColor),
    };
  });
};

const DEFAULT_LAST_PRICE_LABEL_PADDING_HORIZONTAL = 8;
const DEFAULT_LAST_PRICE_LABEL_PADDING_VERTICAL = 4;

type ResolveCandlestickLastPriceLabelLayoutProps = {
  lastClose: number;
  canvasWidth: number;
  font: SkFont;
  hasYAxis: boolean;
  yAxisLabelAlignment: 'left' | 'right';
  yAxisLabelOffsetX: number;
  yAxisLabelYOffset: number;
  yAxisLabelPadding: number;
  yAxisShouldDrawBackground: boolean;
  labelPaddingHorizontal?: number;
  labelPaddingVertical?: number;
  rightOffset?: number;
  formatLabel?: (value: number) => string;
};

export type CandlestickLastPriceLabelLayout = {
  labelText: string;
  fontSize: number;
  labelX: number;
  labelWidth: number;
  labelHeight: number;
  textX: number;
  resolvedLabelYOffset: number;
  resolvedLabelPaddingHorizontal: number;
  resolvedLabelPaddingVertical: number;
};

export const resolveCandlestickLastPriceLabelLayout = ({
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
  rightOffset = 0,
  formatLabel = (value) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 6 }),
}: ResolveCandlestickLastPriceLabelLayoutProps): CandlestickLastPriceLabelLayout => {
  const labelText = formatLabel(lastClose);
  const axisRightInset =
    hasYAxis && yAxisShouldDrawBackground ? yAxisLabelPadding : 0;
  const resolvedLabelPaddingHorizontal =
    labelPaddingHorizontal ??
    (hasYAxis ? axisRightInset : DEFAULT_LAST_PRICE_LABEL_PADDING_HORIZONTAL);
  const resolvedLabelPaddingVertical =
    labelPaddingVertical ??
    (hasYAxis && yAxisShouldDrawBackground
      ? yAxisLabelPadding
      : DEFAULT_LAST_PRICE_LABEL_PADDING_VERTICAL);
  const textWidth = font.getTextWidth(labelText);
  const fontSize = font.getSize();
  const labelWidth = textWidth + resolvedLabelPaddingHorizontal * 2;
  const labelHeight = fontSize + resolvedLabelPaddingVertical * 2;
  const resolvedLabelAlignment = hasYAxis ? yAxisLabelAlignment : 'right';
  const resolvedLabelYOffset = hasYAxis ? yAxisLabelYOffset : -4;
  const labelX =
    resolvedLabelAlignment === 'left'
      ? Math.max(
          yAxisLabelOffsetX - resolvedLabelPaddingHorizontal + rightOffset,
          0
        )
      : Math.max(canvasWidth + yAxisLabelOffsetX - labelWidth - rightOffset, 0);
  const textX = labelX + resolvedLabelPaddingHorizontal;

  return {
    labelText,
    fontSize,
    labelX,
    labelWidth,
    labelHeight,
    textX,
    resolvedLabelYOffset,
    resolvedLabelPaddingHorizontal,
    resolvedLabelPaddingVertical,
  };
};

type CalculateCandlestickValueYProps = {
  value: number;
  domainY: [number, number];
  plotTop: number;
  plotBottom: number;
};

export const calculateCandlestickValueY = ({
  value,
  domainY,
  plotTop,
  plotBottom,
}: CalculateCandlestickValueYProps) => {
  'worklet';
  const safeRange = Math.max(domainY[1] - domainY[0], 1);
  const progress = (value - domainY[0]) / safeRange;
  return plotBottom - progress * Math.max(plotBottom - plotTop, 1);
};

type CalculateCandlestickLastPriceLabelPositionProps = {
  lineY: number;
  plotTop: number;
  plotBottom: number;
  fontSize: number;
  labelYOffset: number;
  labelPaddingVertical: number;
};

export const calculateCandlestickLastPriceLabelPosition = ({
  lineY,
  plotTop,
  plotBottom,
  fontSize,
  labelYOffset,
  labelPaddingVertical,
}: CalculateCandlestickLastPriceLabelPositionProps) => {
  'worklet';
  const minAnchorY =
    plotTop - labelYOffset + fontSize * 0.85 + labelPaddingVertical;
  const maxAnchorY =
    plotBottom - labelYOffset - fontSize * 0.15 - labelPaddingVertical;
  const labelAnchorY = Math.max(minAnchorY, Math.min(lineY, maxAnchorY));
  const textY = labelAnchorY + labelYOffset;
  const labelRectY =
    labelAnchorY + labelYOffset - fontSize * 0.85 - labelPaddingVertical;

  return {
    labelAnchorY,
    textY,
    labelRectY,
  };
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const areCandlestickRectsOverlapping = (
  left: Rect,
  right: Rect,
  gap = 0
) => {
  return !(
    left.x + left.width + gap <= right.x ||
    right.x + right.width + gap <= left.x ||
    left.y + left.height + gap <= right.y ||
    right.y + right.height + gap <= left.y
  );
};
