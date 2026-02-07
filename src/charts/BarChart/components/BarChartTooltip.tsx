import React from 'react';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useBarChart } from '../BarChartContext';
import { BAR_CHART_PADDING_LEFT } from '../constants';
import {
  Group,
  Path,
  Skia,
  Text,
  type SkFont,
} from '@shopify/react-native-skia';

export interface BarChartTooltipPropsInterface {
  backgroundColor?: string;
  textColor?: string;
  /** Vertical offset from the top of the bar. Default: 0 */
  offsetY?: number;
  font?: SkFont;
  /**
   * Function to format tooltip text.
   * NOTE: Runs on UI Thread. Use simple methods like .toFixed() or mark as 'worklet'.
   * Avoid .toLocaleString() here as it may crash on Android UI Thread.
   * @default
   * (value, label) => `${label}: ${value}`
   */
  format?: (value: number, label: string) => string;
}

const BarChartTooltip: React.FC<BarChartTooltipPropsInterface> = ({
  backgroundColor = '#333',
  textColor = '#FFF',
  offsetY = 0,
  font: tooltipFont,
  format,
}) => {
  const {
    data,
    barWidth,
    spacing,
    height,
    maxValue,
    showXAxis,
    selectedIndex,
    verticalScaleFactor,
    graphBottom,
    maxBarHeight,
    font: globalFont,
    scrollX,
    canvasWidth, // Necessary to calculate screen boundaries
  } = useBarChart();

  const opacity = useSharedValue(0);
  const worldX = useSharedValue(0);
  const y = useSharedValue(0);
  const text = useSharedValue('');
  // Calculated width of the current tooltip text
  const tooltipWidth = useSharedValue(0);
  // Controls if tooltip points down (0) or up (1)
  const isFlipped = useSharedValue(0);

  const font = tooltipFont || globalFont;

  // Reacts to changes in the selected index to update position and content
  useAnimatedReaction(
    () => selectedIndex.value,
    (current) => {
      // If deselected (index -1), hide tooltip
      if (current === -1) {
        opacity.value = withTiming(0);
        return;
      }

      const item = data[current];
      if (!item) return;

      let displayString = '';
      if (format) {
        displayString = format(item.value, item.label);
      } else {
        displayString = `${item.label}: ${item.value}`;
      }

      // Calculate text width on UI Thread to use in collision logic
      if (font) {
        const w = font.getTextWidth(displayString) + 20; // +20 padding
        tooltipWidth.value = w;
      }

      const barHeight = (item.value / maxValue) * maxBarHeight;
      const barTop = graphBottom - barHeight;

      const SAFE_TOP_MARGIN = 30;

      // Determine if tooltip should flip (point up) if bar is too close to top
      const shouldFlip = barTop < SAFE_TOP_MARGIN;

      isFlipped.value = shouldFlip ? 1 : 0;

      const targetWorldX =
        BAR_CHART_PADDING_LEFT + current * (barWidth + spacing) + barWidth / 2;

      // Calculate Target Y based on flip state
      let targetY;
      if (shouldFlip) {
        // Flipped: Position slightly BELOW the bar top (pointing UP)
        targetY = barTop + offsetY;
      } else {
        // Standard: Position ABOVE the bar top (pointing DOWN)
        targetY = barTop - offsetY - 4;
      }

      text.value = displayString;

      // Animate position updates
      if (opacity.value === 0) {
        // If appearing, snap instantly
        worldX.value = targetWorldX;
        y.value = targetY;
        opacity.value = withTiming(1);
      } else {
        // If moving between bars, spring
        worldX.value = withSpring(targetWorldX);
        y.value = withSpring(targetY);
      }
    },
    [
      selectedIndex,
      height,
      barWidth,
      spacing,
      maxValue,
      verticalScaleFactor,
      showXAxis,
      offsetY,
      font,
    ]
  );

  // "Shift" Logic: Prevents tooltip from going off-screen
  // Calculates horizontal shift needed to keep the bubble inside canvas bounds
  const shiftX = useDerivedValue(() => {
    // Current X position on screen relative to scroll
    const anchorScreenX = worldX.value - scrollX.value;
    const w = tooltipWidth.value;
    const halfW = w / 2;

    const leftEdge = anchorScreenX - halfW;
    const rightEdge = anchorScreenX + halfW;

    let shift = 0;

    // If bleeding off the left edge (negative X), push right (+)
    if (leftEdge < 0) {
      shift = -leftEdge + 4; // +4px padding from edge
    }
    // If bleeding off the right edge (greater than canvasWidth), push left (-)
    else if (rightEdge > canvasWidth) {
      shift = canvasWidth - rightEdge - 4; // -4px padding from edge
    }

    // Limit the shift so the arrow tip stays connected to the bubble body.
    // The arrow is approx 5px wide with 4px radius.
    // We ensure shift doesn't exceed (halfWidth - 10px).
    const maxShift = halfW - 10;
    return Math.max(-maxShift, Math.min(maxShift, shift));
  }, [worldX, scrollX, tooltipWidth, canvasWidth]);

  // Combined transform for the entire group
  const transform = useDerivedValue(() => {
    return [
      { translateX: worldX.value - scrollX.value },
      { translateY: y.value },
    ];
  });

  if (!font) return null;

  return (
    <Group transform={transform} opacity={opacity}>
      <TooltipBubble
        text={text}
        font={font}
        width={tooltipWidth}
        bgColor={backgroundColor}
        textColor={textColor}
        isFlipped={isFlipped}
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
  isFlipped: SharedValue<number>;
  shiftX: DerivedValue<number>;
}> = ({ text, font, width, bgColor, textColor, isFlipped, shiftX }) => {
  // Dynamically generate the bubble path based on width, flip state, and shift
  const path = useDerivedValue(() => {
    const w = width.value;
    const h = 28;
    const r = 4;
    const arrowSize = 5;
    const p = Skia.Path.Make();

    // Apply shiftX to the Bubble Rectangle center,
    // BUT keep the arrow tip fixed at (0,0) which is the anchor point.
    // This allows the bubble to slide while pointing at the correct bar.
    const bubbleCenterX = shiftX.value;

    // Check if flipped (1) or standard (0)
    if (isFlipped.value === 1) {
      // --- DRAW FLIPPED (Below anchor) ---
      // Bubble Rect starts at y = arrowSize
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(bubbleCenterX - w / 2, arrowSize, w, h),
          r,
          r
        )
      );

      // Arrow pointing UP to (0,0)
      p.moveTo(-arrowSize, arrowSize);
      p.lineTo(0, 0); // Tip at anchor
      p.lineTo(arrowSize, arrowSize);
    } else {
      // --- DRAW STANDARD (Above anchor) ---
      // Bubble Rect ends at y = 0
      p.addRRect(
        Skia.RRectXY(Skia.XYWHRect(bubbleCenterX - w / 2, -h, w, h), r, r)
      );

      // Arrow pointing DOWN to (0, arrowSize)
      p.moveTo(-arrowSize, 0);
      p.lineTo(0, arrowSize);
      p.lineTo(arrowSize, 0);
    }

    p.close();
    return p;
  });

  const textY = useDerivedValue(() => {
    // Adjust text vertical position based on flip
    if (isFlipped.value === 1) {
      // Text inside the bubble below.
      return 24;
    } else {
      // Standard: Text inside bubble above.
      return -8;
    }
  });

  const textX = useDerivedValue(() => {
    // Text must follow the bubble movement (shiftX)
    return shiftX.value - width.value / 2 + 10;
  });

  return (
    <Group>
      <Path path={path} color={bgColor} />
      <Text x={textX} y={textY} text={text} font={font} color={textColor} />
    </Group>
  );
};

export default BarChartTooltip;
