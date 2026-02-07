import { LinearGradient, Path, vec } from '@shopify/react-native-skia';
import { useChart } from '../LineChartContext';

export interface IProps {
  strokeWidth?: number;
  colors?: string[];
}

/**
 * Draws the main trend line.
 */
const ChartLine: React.FC<IProps> = ({ strokeWidth = 3, colors }) => {
  const { path, height, gradientPositions } = useChart();
  const defaultColors = ['#00E396', '#00E396', '#EA3943', '#EA3943'];

  return (
    <Path
      path={path}
      style="stroke" // 'stroke' means draw lines, 'fill' means fill shapes
      strokeWidth={strokeWidth}
      strokeJoin="round"
      strokeCap="round"
    >
      <LinearGradient
        start={vec(0, 0)} // Gradient starts at top
        end={vec(0, height)} // Gradient ends at bottom
        colors={colors || defaultColors}
        positions={gradientPositions}
      />
    </Path>
  );
};

export default ChartLine;
