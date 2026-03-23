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

export interface CandlestickChartTooltipDatePropsInterface {
  backgroundColor?: string;
  textColor?: string;
  offsetY?: number;
  font?: SkFont;
  format?: (timestamp: number) => string;
}

const CandlestickChartTooltipDate: React.FC<
  CandlestickChartTooltipDatePropsInterface
> = ({
  backgroundColor = '#111827',
  textColor = '#9CA3AF',
  offsetY = -36,
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

      let displayString = '';
      if (format) {
        displayString = format(item.data.timestamp);
      } else {
        const date = new Date(item.data.timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        displayString = `${day}/${month}/${year}`;
      }

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
      { translateY: Math.max(Math.min(height + offsetY, height - 24), 0) },
    ];
  }, [worldX, scrollX, height, offsetY]);

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
    const bubbleHeight = 24;
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
      <Text x={textX} y={16} text={text} font={font} color={textColor} />
    </Group>
  );
};

export default CandlestickChartTooltipDate;
