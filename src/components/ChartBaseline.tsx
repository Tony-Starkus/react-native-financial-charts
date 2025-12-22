import { useDerivedValue, withSpring } from 'react-native-reanimated';
import { useChart } from '../ChartContext';
import { useMemo } from 'react';
import {
  Circle,
  DashPathEffect,
  Group,
  matchFont,
  Path,
  RoundedRect,
  Skia,
  Text as SkiaText,
} from '@shopify/react-native-skia';

export interface IProps {
  color?: string;
  showLabel?: boolean;
}

/**
 * Draws the dotted line at the starting value (profit line)
 */
const ChartBaseline: React.FC<IProps> = ({
  color = '#858CA2',
  showLabel = true,
}) => {
  const { width, padding, baselineY, originalData, isActive } = useChart();

  // Animation: Devired values automatically update when their dependencies change.
  // Here, is isActive become true, opacity sprints to 0.
  const labelOpacity = useDerivedValue(() => {
    return withSpring(isActive.value ? 0 : 1);
  }, [isActive]);

  // Font Manager: Skia needs to load a font file to draw text.
  // matchFont tries to find a system font that matches these specs.
  const font = useMemo(
    () =>
      matchFont({
        fontFamily: 'Arial',
        fontSize: 10,
        fontWeight: 'bold',
      }),
    []
  );

  const labelText = useMemo(() => {
    if (!originalData.length) return '';
    const val = originalData[0]?.value || 0;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(val);
  }, [originalData]);

  // Geomatry Calculation: Positioning the label chip.
  const chipGeometry = useMemo(() => {
    if (!font || !labelText) return null;

    const textWidth = font.getTextWidth(labelText);
    const fontMetrics = font.getMetrics();
    const textHeight = fontMetrics.descent - fontMetrics.ascent;

    const hPadding = 8;
    const vPadding = 4;
    const chipHeight = textHeight + vPadding * 2;
    const chipWidth = textWidth + hPadding * 2;
    const chipRadius = 8;

    const chipX = padding;
    const chipY = baselineY - chipHeight / 2;

    const textX = chipX + hPadding;
    const textY = chipY + vPadding - fontMetrics.ascent;

    return {
      rect: {
        x: chipX,
        y: chipY,
        width: chipWidth,
        height: chipHeight,
        r: chipRadius,
      },
      textPos: { x: textX, y: textY },
    };
  }, [font, labelText, padding, baselineY]);

  // Create simple horizontal line path
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    if (Number.isFinite(baselineY) && baselineY > 0) {
      p.moveTo(padding, baselineY);
      p.lineTo(width - padding, baselineY);
    }
    return p;
  }, [width, padding, baselineY]);

  if (!baselineY) return null;

  return (
    <Group>
      {/* Dashed Line */}
      <Path path={path} color={color} style="stroke" strokeWidth={1}>
        <DashPathEffect intervals={[5, 5]} />
      </Path>

      {/* Starting Dot */}
      <Circle cx={padding} cy={baselineY} r={3} color={color} />

      {/* Label Chip (Rounded Rect + Text) */}
      {showLabel && font && chipGeometry && (
        <Group opacity={labelOpacity}>
          <RoundedRect
            x={chipGeometry.rect.x}
            y={chipGeometry.rect.y}
            width={chipGeometry.rect.width}
            height={chipGeometry.rect.height}
            r={chipGeometry.rect.r}
            color="#323546"
          />
          <SkiaText
            font={font}
            x={chipGeometry.textPos.x}
            y={chipGeometry.textPos.y}
            text={labelText}
            color="#FFFFFF"
          />
        </Group>
      )}
    </Group>
  );
};

export default ChartBaseline;
