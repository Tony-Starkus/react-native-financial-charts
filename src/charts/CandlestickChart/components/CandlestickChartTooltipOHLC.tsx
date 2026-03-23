import React from 'react';
import {
  Group,
  Path,
  Skia,
  Text,
  type SkFont,
} from '@shopify/react-native-skia';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';
import type { CandlestickChartDataPoint } from '../interfaces';

export interface CandlestickChartTooltipOHLCPropsInterface {
  backgroundColor?: string;
  textColor?: string;
  offsetY?: number;
  font?: SkFont;
  format?: (item: CandlestickChartDataPoint) => string;
}

const CandlestickChartTooltipOHLC: React.FC<
  CandlestickChartTooltipOHLCPropsInterface
> = ({
  backgroundColor = '#111827',
  textColor = '#F9FAFB',
  offsetY = 8,
  font: tooltipFont,
  format,
}) => {
  const {
    layoutData,
    selectedIndex,
    scrollX,
    canvasWidth,
    height,
    font: globalFont,
  } = useCandlestickChart();

  const opacity = useSharedValue(0);
  const worldX = useSharedValue(0);
  const text = useSharedValue('');
  const tooltipWidth = useSharedValue(0);
  const font = tooltipFont || globalFont;

  useAnimatedReaction(
    () => selectedIndex.value,
    (current) => {
      if (current === -1) {
        opacity.value = withTiming(0);
        return;
      }

      const item = layoutData[current];
      if (!item) return;

      const displayString = format
        ? format(item.data)
        : `O ${item.data.open.toFixed(2)}  H ${item.data.high.toFixed(
            2
          )}  L ${item.data.low.toFixed(2)}  C ${item.data.close.toFixed(2)}`;

      text.value = displayString;

      if (font) {
        tooltipWidth.value = font.getTextWidth(displayString) + 20;
      }

      if (opacity.value === 0) {
        worldX.value = item.centerX;
        opacity.value = withTiming(1);
      } else {
        worldX.value = withSpring(item.centerX);
      }
    },
    [selectedIndex, layoutData, font, format]
  );

  const shiftX = useDerivedValue(() => {
    const anchorScreenX = worldX.value - scrollX.value;
    const halfWidth = tooltipWidth.value / 2;
    const leftEdge = anchorScreenX - halfWidth;
    const rightEdge = anchorScreenX + halfWidth;

    let shift = 0;
    if (leftEdge < 0) shift = -leftEdge + 4;
    else if (rightEdge > canvasWidth) shift = canvasWidth - rightEdge - 4;

    const maxShift = Math.max(halfWidth - 10, 0);
    return Math.max(-maxShift, Math.min(maxShift, shift));
  }, [worldX, scrollX, tooltipWidth, canvasWidth]);

  const transform = useDerivedValue(() => {
    return [
      { translateX: worldX.value - scrollX.value },
      { translateY: Math.max(Math.min(offsetY, height - 28), 0) },
    ];
  }, [worldX, scrollX, offsetY, height]);

  if (!font) return null;

  return (
    <Group transform={transform} opacity={opacity}>
      <TooltipBubble
        text={text}
        font={font}
        width={tooltipWidth}
        bgColor={backgroundColor}
        textColor={textColor}
        shiftX={shiftX}
      />
    </Group>
  );
};

const TooltipBubble: React.FC<{
  text: DerivedValue<string>;
  font: SkFont;
  width: SharedValue<number>;
  bgColor: string;
  textColor: string;
  shiftX: DerivedValue<number>;
}> = ({ text, font, width, bgColor, textColor, shiftX }) => {
  const path = useDerivedValue(() => {
    const bubbleHeight = 28;
    const radius = 6;
    const bubblePath = Skia.Path.Make();

    bubblePath.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          shiftX.value - width.value / 2,
          0,
          width.value,
          bubbleHeight
        ),
        radius,
        radius
      )
    );

    return bubblePath;
  });

  const textX = useDerivedValue(() => {
    return shiftX.value - width.value / 2 + 10;
  });

  return (
    <Group>
      <Path path={path} color={bgColor} />
      <Text x={textX} y={18} text={text} font={font} color={textColor} />
    </Group>
  );
};

export default CandlestickChartTooltipOHLC;
