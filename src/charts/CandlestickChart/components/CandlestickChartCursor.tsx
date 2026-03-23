import { DashPathEffect, Group, Line, vec } from '@shopify/react-native-skia';
import { useDerivedValue, withTiming } from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';

export interface CandlestickChartCursorPropsInterface {
  lineColor?: string;
  lineWidth?: number;
}

const CandlestickChartCursor: React.FC<
  CandlestickChartCursorPropsInterface
> = ({ lineColor = '#858CA2', lineWidth = 1 }) => {
  const { layoutData, selectedIndex, scrollX, plotTop, plotBottom } =
    useCandlestickChart();

  const opacity = useDerivedValue(() => {
    return withTiming(selectedIndex.value === -1 ? 0 : 1, { duration: 180 });
  }, [selectedIndex]);

  const p1 = useDerivedValue(() => {
    const item = layoutData[selectedIndex.value];
    const x = item ? item.centerX - scrollX.value : 0;
    return vec(x, plotTop);
  }, [layoutData, scrollX, selectedIndex, plotTop]);

  const p2 = useDerivedValue(() => {
    const item = layoutData[selectedIndex.value];
    const x = item ? item.centerX - scrollX.value : 0;
    return vec(x, plotBottom);
  }, [layoutData, scrollX, selectedIndex, plotBottom]);

  return (
    <Group opacity={opacity}>
      <Line p1={p1} p2={p2} color={lineColor} strokeWidth={lineWidth}>
        <DashPathEffect intervals={[4, 4]} />
      </Line>
    </Group>
  );
};

export default CandlestickChartCursor;
