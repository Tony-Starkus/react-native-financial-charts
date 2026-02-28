import { useBarChart } from '../BarChartContext';
import { Group, RoundedRect, Text } from '@shopify/react-native-skia';

export interface BarChartYAXisPropsInterface {
  /**
   * Reserved horizontal width used by BarChart.Root layout when YAxis is present.
   * @default 50
   */
  width?: number;

  /** The color of the text values. Default: #9CA3AF (gray) */
  labelColor?: string;

  /** X-axis offset for the labels. Default: 0 */
  labelOffsetX?: number;

  /** * Y-axis offset adjustment.
   * Default: -4 (Positions text slightly above the grid line)
   */
  labelYOffset?: number;

  /**
   * If true, rounds the Y position to the nearest pixel.
   * Default: false
   */
  snapToPixel?: boolean;

  /**
   * Background color specifically for the text label (creates a tag/pill effect).
   * Great for legibility without hiding the bars behind a full sidebar.
   * @default 'transparent'
   */
  labelBackgroundColor?: string;

  /**
   * Border radius for the text background.
   * @default 4
   */
  labelBorderRadius?: number;

  /**
   * Padding around the text inside the background pill.
   * @default 2
   */
  labelPadding?: number;

  /**
   *  Function to format the numeric value.
   *  1. undefined: Uses the user's system locale (e.g., comma in BR, dot in US).
   * 2. maximumFractionDigits: 6: Shows up to 6 decimal places for small numbers (0.00006), but does not force extra zeros on integers (100 remains 100).
   */
  formatLabel?: (value: number) => string;
}

const BarChartYAxis: React.FC<BarChartYAXisPropsInterface> = ({
  labelColor = '#9CA3AF',
  labelOffsetX = 0,
  labelYOffset = -4,
  snapToPixel = false,

  labelBackgroundColor = 'transparent',
  labelBorderRadius = 4,
  labelPadding = 2,
  formatLabel = (val) =>
    val.toLocaleString(undefined, { maximumFractionDigits: 6 }),
}) => {
  const { maxValue, graphBottom, maxBarHeight, font, yAxisTicks } =
    useBarChart();

  if (!font) return null;

  return (
    <Group>
      {yAxisTicks.map((tick, index) => {
        const barHeight = (tick / maxValue) * maxBarHeight;

        const rawY = graphBottom - barHeight;

        const y = snapToPixel ? Math.round(rawY) : rawY;
        const textY = y + labelYOffset;

        const labelText = formatLabel(tick);

        const shouldDrawTextBg = labelBackgroundColor !== 'transparent';
        let bgRect = null;

        if (shouldDrawTextBg) {
          const textWidth = font.getTextWidth(labelText);
          const fontSize = font.getSize();

          const bgX = labelOffsetX - labelPadding;
          const bgY = textY - fontSize * 0.85 - labelPadding;
          const bgW = textWidth + labelPadding * 2;
          const bgH = fontSize + labelPadding * 2;

          bgRect = (
            <RoundedRect
              x={bgX}
              y={bgY}
              width={bgW}
              height={bgH}
              r={labelBorderRadius}
              color={labelBackgroundColor}
            />
          );
        }

        return (
          <Group key={index}>
            {bgRect}
            <Text
              x={labelOffsetX}
              y={textY}
              text={labelText}
              font={font}
              color={labelColor}
              opacity={shouldDrawTextBg ? 1 : 0.8}
            />
          </Group>
        );
      })}
    </Group>
  );
};

BarChartYAxis.displayName = 'BarChartYAxis';

export default BarChartYAxis;
