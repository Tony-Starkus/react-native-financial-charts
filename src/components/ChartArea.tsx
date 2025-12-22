import { LinearGradient, Path, vec } from '@shopify/react-native-skia';
import { useChart } from '../ChartContext';

export interface IProps {
  gradientColors?: string[];
}

/**
 * Draws the background gradient fill.
 */
const ChartArea: React.FC<IProps> = ({ gradientColors: _gradientColors }) => {
  const { areaPath, height, gradientColors, gradientPositions } = useChart();

  _gradientColors = _gradientColors || gradientColors;

  return (
    <Path path={areaPath} style="fill">
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, height)}
        colors={_gradientColors}
        positions={gradientPositions}
      />
    </Path>
  );
};

export default ChartArea;
