import React, { useEffect, useRef, useState } from 'react';
import { Group, RoundedRect, Text } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';
import {
  areCandlestickRectsOverlapping,
  calculateCandlestickLastPriceLabelPosition,
  calculateCandlestickValueY,
  resolveCandlestickLastPriceLabelLayout,
} from '../utils';

export interface CandlestickChartYAxisPropsInterface {
  width?: number;
  labelColor?: string;
  labelAlignment?: 'left' | 'right';
  labelOffsetX?: number;
  labelYOffset?: number;
  snapToPixel?: boolean;
  labelBackgroundColor?: string;
  labelBorderRadius?: number;
  labelPadding?: number;
  formatLabel?: (value: number) => string;
}

type YAxisScaleSnapshot = {
  domainY: [number, number];
  yAxisTicks: number[];
};

const areTicksEqual = (left: number[], right: number[]) => {
  if (left.length !== right.length) return false;
  return left.every((tick, index) => tick === right[index]);
};

const CandlestickChartYAxis: React.FC<CandlestickChartYAxisPropsInterface> = ({
  labelColor = '#9CA3AF',
  labelAlignment = 'right',
  labelOffsetX = 0,
  labelYOffset = -4,
  snapToPixel = false,
  labelBackgroundColor = 'transparent',
  labelBorderRadius = 4,
  labelPadding = 2,
  formatLabel = (value) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 6 }),
}) => {
  const {
    font,
    domainY,
    yAxisTicks,
    plotTop,
    plotBottom,
    canvasWidth,
    layoutData,
    hasLastPrice,
    lastPriceRightOffset,
    lastPriceLabelPaddingHorizontal,
    lastPriceLabelPaddingVertical,
    lastPriceFormatLabel,
  } = useCandlestickChart();
  const { animatedDomainMin, animatedDomainMax } = useCandlestickChart();
  const [previousScale, setPreviousScale] = useState<YAxisScaleSnapshot | null>(
    null
  );
  const currentScaleRef = useRef<YAxisScaleSnapshot>({
    domainY,
    yAxisTicks,
  });
  const transitionProgress = useSharedValue(1);

  useEffect(() => {
    const currentScale = currentScaleRef.current;
    const sameDomain =
      currentScale.domainY[0] === domainY[0] &&
      currentScale.domainY[1] === domainY[1];
    const sameTicks = areTicksEqual(currentScale.yAxisTicks, yAxisTicks);

    if (sameDomain && sameTicks) return;

    setPreviousScale(currentScale);
    currentScaleRef.current = {
      domainY,
      yAxisTicks,
    };

    transitionProgress.value = 0;
    transitionProgress.value = withTiming(
      1,
      {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setPreviousScale)(null);
        }
      }
    );
  }, [domainY, yAxisTicks, transitionProgress]);

  const previousOpacity = useDerivedValue(() => {
    return 1 - transitionProgress.value;
  }, [transitionProgress]);

  const currentOpacity = useDerivedValue(() => {
    return previousScale ? transitionProgress.value : 1;
  }, [previousScale, transitionProgress]);

  if (!font) return null;

  const shouldDrawBackground = labelBackgroundColor !== 'transparent';
  const lastClose = layoutData[layoutData.length - 1]?.data.close;
  const lastPriceLayout =
    hasLastPrice && typeof lastClose === 'number'
      ? resolveCandlestickLastPriceLabelLayout({
          lastClose,
          canvasWidth,
          font,
          hasYAxis: true,
          yAxisLabelAlignment: labelAlignment,
          yAxisLabelOffsetX: labelOffsetX,
          yAxisLabelYOffset: labelYOffset,
          yAxisLabelPadding: labelPadding,
          yAxisShouldDrawBackground: shouldDrawBackground,
          labelPaddingHorizontal: lastPriceLabelPaddingHorizontal,
          labelPaddingVertical: lastPriceLabelPaddingVertical,
          rightOffset: lastPriceRightOffset,
          formatLabel: lastPriceFormatLabel,
        })
      : null;

  const shouldHideLabel = (
    tick: number,
    labelText: string,
    tickDomainY: [number, number]
  ) => {
    if (!lastPriceLayout || typeof lastClose !== 'number') return false;

    const textWidth = font.getTextWidth(labelText);
    const fontSize = font.getSize();
    const textX = getLabelX({
      canvasWidth,
      textWidth,
      labelAlignment,
      labelOffsetX,
      labelPadding,
      shouldDrawBackground,
    });
    const tickY = calculateCandlestickValueY({
      value: tick,
      domainY: tickDomainY,
      plotTop,
      plotBottom,
    });
    const textY = tickY + labelYOffset;
    const labelRect = {
      x: shouldDrawBackground ? textX - labelPadding : textX,
      y: textY - fontSize * 0.85 - (shouldDrawBackground ? labelPadding : 0),
      width: shouldDrawBackground ? textWidth + labelPadding * 2 : textWidth,
      height: shouldDrawBackground ? fontSize + labelPadding * 2 : fontSize,
    };
    const lastPriceLineY = calculateCandlestickValueY({
      value: lastClose,
      domainY: tickDomainY,
      plotTop,
      plotBottom,
    });
    const lastPricePosition = calculateCandlestickLastPriceLabelPosition({
      lineY: lastPriceLineY,
      plotTop,
      plotBottom,
      fontSize: lastPriceLayout.fontSize,
      labelYOffset: lastPriceLayout.resolvedLabelYOffset,
      labelPaddingVertical: lastPriceLayout.resolvedLabelPaddingVertical,
    });
    const lastPriceRect = {
      x: lastPriceLayout.labelX,
      y: lastPricePosition.labelRectY,
      width: lastPriceLayout.labelWidth,
      height: lastPriceLayout.labelHeight,
    };

    return areCandlestickRectsOverlapping(labelRect, lastPriceRect, 2);
  };

  return (
    <Group>
      {previousScale?.yAxisTicks.map((tick, index) => {
        const labelText = formatLabel(tick);
        if (shouldHideLabel(tick, labelText, previousScale.domainY)) {
          return null;
        }

        return (
          <StaticYAxisLabel
            key={`previous-${index}-${tick}`}
            tick={tick}
            domainY={previousScale.domainY}
            labelText={labelText}
            font={font}
            labelColor={labelColor}
            labelAlignment={labelAlignment}
            labelOffsetX={labelOffsetX}
            labelYOffset={labelYOffset}
            snapToPixel={snapToPixel}
            labelBackgroundColor={labelBackgroundColor}
            labelBorderRadius={labelBorderRadius}
            labelPadding={labelPadding}
            shouldDrawBackground={shouldDrawBackground}
            plotTop={plotTop}
            plotBottom={plotBottom}
            canvasWidth={canvasWidth}
            opacity={previousOpacity}
          />
        );
      })}

      {yAxisTicks.map((tick, index) => {
        const labelText = formatLabel(tick);
        if (shouldHideLabel(tick, labelText, domainY)) {
          return null;
        }

        return (
          <AnimatedYAxisLabel
            key={index}
            tick={tick}
            labelText={labelText}
            font={font}
            labelColor={labelColor}
            labelAlignment={labelAlignment}
            labelOffsetX={labelOffsetX}
            labelYOffset={labelYOffset}
            snapToPixel={snapToPixel}
            labelBackgroundColor={labelBackgroundColor}
            labelBorderRadius={labelBorderRadius}
            labelPadding={labelPadding}
            shouldDrawBackground={shouldDrawBackground}
            domainMin={animatedDomainMin}
            domainMax={animatedDomainMax}
            plotTop={plotTop}
            plotBottom={plotBottom}
            canvasWidth={canvasWidth}
            opacity={currentOpacity}
          />
        );
      })}
    </Group>
  );
};

const getLabelX = ({
  canvasWidth,
  textWidth,
  labelAlignment,
  labelOffsetX,
  labelPadding,
  shouldDrawBackground,
}: {
  canvasWidth: number;
  textWidth: number;
  labelAlignment: 'left' | 'right';
  labelOffsetX: number;
  labelPadding: number;
  shouldDrawBackground: boolean;
}) => {
  if (labelAlignment === 'left') {
    return labelOffsetX;
  }

  const rightInset = shouldDrawBackground ? labelPadding : 0;
  return canvasWidth - textWidth - rightInset + labelOffsetX;
};

const AnimatedYAxisLabel: React.FC<{
  tick: number;
  labelText: string;
  font: SkFont;
  labelColor: string;
  labelAlignment: 'left' | 'right';
  labelOffsetX: number;
  labelYOffset: number;
  snapToPixel: boolean;
  labelBackgroundColor: string;
  labelBorderRadius: number;
  labelPadding: number;
  shouldDrawBackground: boolean;
  domainMin: SharedValue<number>;
  domainMax: SharedValue<number>;
  plotTop: number;
  plotBottom: number;
  canvasWidth: number;
  opacity?: number | SharedValue<number>;
}> = ({
  tick,
  labelText,
  font,
  labelColor,
  labelAlignment,
  labelOffsetX,
  labelYOffset,
  snapToPixel,
  labelBackgroundColor,
  labelBorderRadius,
  labelPadding,
  shouldDrawBackground,
  domainMin,
  domainMax,
  plotTop,
  plotBottom,
  canvasWidth,
  opacity = 1,
}) => {
  const textWidth = font.getTextWidth(labelText);
  const fontSize = font.getSize();
  const drawableHeight = Math.max(plotBottom - plotTop, 1);
  const textX = getLabelX({
    canvasWidth,
    textWidth,
    labelAlignment,
    labelOffsetX,
    labelPadding,
    shouldDrawBackground,
  });

  const y = useDerivedValue(() => {
    const safeRange = Math.max(domainMax.value - domainMin.value, 1);
    const progress = (tick - domainMin.value) / safeRange;
    const rawY = plotBottom - progress * drawableHeight;
    return snapToPixel ? Math.round(rawY) : rawY;
  }, [tick, domainMin, domainMax, plotBottom, drawableHeight, snapToPixel]);

  const textY = useDerivedValue(() => {
    return y.value + labelYOffset;
  }, [y, labelYOffset]);

  const backgroundY = useDerivedValue(() => {
    return textY.value - fontSize * 0.85 - labelPadding;
  }, [textY, fontSize, labelPadding]);

  return (
    <Group opacity={opacity}>
      {shouldDrawBackground && (
        <RoundedRect
          x={textX - labelPadding}
          y={backgroundY}
          width={textWidth + labelPadding * 2}
          height={fontSize + labelPadding * 2}
          r={labelBorderRadius}
          color={labelBackgroundColor}
        />
      )}
      <Text
        x={textX}
        y={textY}
        text={labelText}
        font={font}
        color={labelColor}
        opacity={shouldDrawBackground ? 1 : 0.8}
      />
    </Group>
  );
};

const StaticYAxisLabel: React.FC<{
  tick: number;
  domainY: [number, number];
  labelText: string;
  font: SkFont;
  labelColor: string;
  labelAlignment: 'left' | 'right';
  labelOffsetX: number;
  labelYOffset: number;
  snapToPixel: boolean;
  labelBackgroundColor: string;
  labelBorderRadius: number;
  labelPadding: number;
  shouldDrawBackground: boolean;
  plotTop: number;
  plotBottom: number;
  canvasWidth: number;
  opacity?: number | SharedValue<number>;
}> = ({
  tick,
  domainY,
  labelText,
  font,
  labelColor,
  labelAlignment,
  labelOffsetX,
  labelYOffset,
  snapToPixel,
  labelBackgroundColor,
  labelBorderRadius,
  labelPadding,
  shouldDrawBackground,
  plotTop,
  plotBottom,
  canvasWidth,
  opacity = 1,
}) => {
  const textWidth = font.getTextWidth(labelText);
  const fontSize = font.getSize();
  const textX = getLabelX({
    canvasWidth,
    textWidth,
    labelAlignment,
    labelOffsetX,
    labelPadding,
    shouldDrawBackground,
  });
  const safeRange = Math.max(domainY[1] - domainY[0], 1);
  const drawableHeight = Math.max(plotBottom - plotTop, 1);
  const progress = (tick - domainY[0]) / safeRange;
  const rawY = plotBottom - progress * drawableHeight;
  const y = snapToPixel ? Math.round(rawY) : rawY;
  const textY = y + labelYOffset;

  return (
    <Group opacity={opacity}>
      {shouldDrawBackground && (
        <RoundedRect
          x={textX - labelPadding}
          y={textY - fontSize * 0.85 - labelPadding}
          width={textWidth + labelPadding * 2}
          height={fontSize + labelPadding * 2}
          r={labelBorderRadius}
          color={labelBackgroundColor}
        />
      )}
      <Text
        x={textX}
        y={textY}
        text={labelText}
        font={font}
        color={labelColor}
        opacity={shouldDrawBackground ? 1 : 0.8}
      />
    </Group>
  );
};

CandlestickChartYAxis.displayName = 'CandlestickChartYAxis';

export default CandlestickChartYAxis;
