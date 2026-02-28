import { useDerivedValue, withSpring } from 'react-native-reanimated';
import { useChart } from '../LineChartContext';
import {
  BlurMask,
  Circle,
  Group,
  Line,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';

export interface IProps {
  crosshairColor?: string;
  circleColor?: string;
}

export type LineChartCursorPropsInterface = IProps;

/**
 * The Crosshair and Highlight Circle
 */
const ChartCursor: React.FC<IProps> = ({
  crosshairColor = 'white',
  circleColor = 'white',
}) => {
  const { currentX, currentY, isActive, padding, height, gradientPositions } =
    useChart();

  // Calculate line endpoints responsively using Reanimated derived values
  const lineP1 = useDerivedValue(() => vec(currentX.value, padding));
  const lineP2 = useDerivedValue(() => vec(currentX.value, height - padding));

  const opacity = useDerivedValue(() => withSpring(isActive.value ? 1 : 0));

  const defaultColors = ['#00E396', '#00E396', '#EA3943', '#EA3943'];
  const gradientColorsHalo = [
    '#00E396E6',
    '#00E39600',
    '#EA394300',
    '#EA394326',
  ];

  return (
    <Group opacity={opacity}>
      <Line
        p1={lineP1}
        p2={lineP2}
        color={crosshairColor}
        style="stroke"
        strokeWidth={1}
      >
        {/* BlurMask gives the line a subtle glow/shadow effect */}
        <BlurMask blur={1} style="solid" />
      </Line>
      {/* Outer Glow Halo */}
      <Circle cx={currentX} cy={currentY} r={12} opacity={0.3} style="fill">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={gradientColorsHalo}
          positions={gradientPositions}
        />
      </Circle>
      {/* Inner Color Dot */}
      <Circle cx={currentX} cy={currentY} r={6} style="fill">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={defaultColors}
          positions={gradientPositions}
        />
      </Circle>
      {/* White Border Ring */}
      <Circle
        cx={currentX}
        cy={currentY}
        r={6}
        color={circleColor}
        style="stroke"
        strokeWidth={2}
      />
    </Group>
  );
};

export default ChartCursor;
