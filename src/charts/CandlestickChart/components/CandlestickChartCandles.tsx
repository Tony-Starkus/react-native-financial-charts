import React from 'react';
import { Group, Path, Picture, Skia } from '@shopify/react-native-skia';
import {
  Extrapolation,
  interpolate,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';

export interface CandlestickChartCandlesPropsInterface {
  wickWidth?: number;
  candleBorderRadius?: number;
  minBodyHeight?: number;
}

const CandlestickChartCandles: React.FC<
  CandlestickChartCandlesPropsInterface
> = ({ wickWidth = 1, candleBorderRadius = 2, minBodyHeight = 1 }) => {
  const {
    layoutData,
    candleWidth,
    spacing,
    plotTop,
    plotBottom,
    animatedDomainMin,
    animatedDomainMax,
    entryProgress,
    selectedIndex,
    scrollX,
    canvasWidth,
    height,
    activeBorderColor,
    activeBorderWidth,
  } = useCandlestickChart();

  const candlesPicture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(
      Skia.XYWHRect(0, 0, canvasWidth, height)
    );
    const itemFullWidth = candleWidth + spacing;
    const paint = Skia.Paint();

    const rawStartIndex = Math.floor(scrollX.value / itemFullWidth);
    const rawEndIndex = Math.ceil(
      (scrollX.value + canvasWidth) / itemFullWidth
    );
    const startIndex = Math.max(0, rawStartIndex - 2);
    const endIndex = Math.min(layoutData.length, rawEndIndex + 2);
    const safeRange = Math.max(
      animatedDomainMax.value - animatedDomainMin.value,
      1
    );
    const drawableHeight = Math.max(plotBottom - plotTop, 1);
    const getY = (value: number) => {
      const progress = (value - animatedDomainMin.value) / safeRange;
      return plotBottom - progress * drawableHeight;
    };

    for (let i = startIndex; i < endIndex; i++) {
      const item = layoutData[i]!;
      const start = (i / Math.max(layoutData.length, 1)) * 0.45;
      const end = start + 0.55;
      const progress = interpolate(
        entryProgress.value,
        [start, end],
        [0, 1],
        Extrapolation.CLAMP
      );
      const eased = progress * (2 - progress);

      const highY = getY(item.data.high);
      const lowY = getY(item.data.low);
      const openY = getY(item.data.open);
      const closeY = getY(item.data.close);
      const currentHighY = plotBottom - (plotBottom - highY) * eased;
      const currentLowY = plotBottom - (plotBottom - lowY) * eased;
      const currentOpenY = plotBottom - (plotBottom - openY) * eased;
      const currentCloseY = plotBottom - (plotBottom - closeY) * eased;
      const currentBodyY = Math.min(currentOpenY, currentCloseY);
      const rawBodyHeight = Math.abs(currentOpenY - currentCloseY);
      const currentBodyHeight = Math.max(rawBodyHeight, minBodyHeight);

      const screenBodyX = item.bodyX - scrollX.value;
      const screenCenterX = item.centerX - scrollX.value;

      paint.setColor(Skia.Color(item.color));
      paint.setAlphaf(progress);

      const wickHeight = Math.max(currentLowY - currentHighY, 1);
      canvas.drawRect(
        Skia.XYWHRect(
          screenCenterX - wickWidth / 2,
          currentHighY,
          wickWidth,
          wickHeight
        ),
        paint
      );

      canvas.drawRRect(
        Skia.RRectXY(
          Skia.XYWHRect(
            screenBodyX,
            currentBodyY,
            item.bodyWidth,
            currentBodyHeight
          ),
          candleBorderRadius,
          candleBorderRadius
        ),
        paint
      );
    }

    return recorder.finishRecordingAsPicture();
  }, [
    layoutData,
    candleWidth,
    spacing,
    plotTop,
    plotBottom,
    animatedDomainMin,
    animatedDomainMax,
    entryProgress,
    scrollX,
    canvasWidth,
    height,
    wickWidth,
    minBodyHeight,
    candleBorderRadius,
  ]);

  const selectionPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const index = selectedIndex.value;

    if (index === -1 || index >= layoutData.length) return path;

    const item = layoutData[index]!;
    const screenBodyX = item.bodyX - scrollX.value;
    const safeRange = Math.max(
      animatedDomainMax.value - animatedDomainMin.value,
      1
    );
    const drawableHeight = Math.max(plotBottom - plotTop, 1);
    const getY = (value: number) => {
      const progress = (value - animatedDomainMin.value) / safeRange;
      return plotBottom - progress * drawableHeight;
    };
    const openY = getY(item.data.open);
    const closeY = getY(item.data.close);
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(openY - closeY), minBodyHeight);

    if (screenBodyX + item.bodyWidth < 0 || screenBodyX > canvasWidth) {
      return path;
    }

    path.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(screenBodyX, bodyY, item.bodyWidth, bodyHeight),
        candleBorderRadius,
        candleBorderRadius
      )
    );

    return path;
  }, [
    selectedIndex,
    layoutData,
    scrollX,
    plotTop,
    plotBottom,
    animatedDomainMin,
    animatedDomainMax,
    canvasWidth,
    minBodyHeight,
    candleBorderRadius,
  ]);

  const selectionOpacity = useDerivedValue(() => {
    return withTiming(selectedIndex.value === -1 ? 0 : 1, {
      duration: 180,
    });
  }, [selectedIndex]);

  return (
    <Group>
      <Picture picture={candlesPicture} />
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

export default CandlestickChartCandles;
