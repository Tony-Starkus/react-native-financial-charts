import {
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useBarChart } from '../BarChartContext';
import { useEffect } from 'react';
import { Group, RoundedRect } from '@shopify/react-native-skia';
import { BAR_CHART_PADDING_LEFT } from '../constants';

const BarChartSkeleton: React.FC = () => {
  const {
    skeletonData,
    isLoading,
    barWidth,
    spacing,
    graphBottom,
    maxBarHeight,
  } = useBarChart();

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (isLoading) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1, // Infinity
        true // Reverse
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const opacity = useDerivedValue(() => {
    return interpolate(pulse.value, [0, 1], [0.3, 0.6]);
  });

  if (!isLoading) return null;

  return (
    <Group>
      {skeletonData.map((_, index) => {
        const x = BAR_CHART_PADDING_LEFT + index * (barWidth + spacing);

        // fixed height for skelenton (70%)
        const targetHeight = maxBarHeight * 0.7;
        const y = graphBottom - targetHeight;

        return (
          <RoundedRect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={targetHeight}
            r={4}
            color="#E0E0E0"
            opacity={opacity}
          />
        );
      })}
    </Group>
  );
};

export default BarChartSkeleton;
