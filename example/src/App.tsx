import { View, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-financial-charts';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { BarChartItemDataInterface } from '../../src/charts/BarChart/interfaces';

const lineChartFakeData = [
  {
    timestamp: new Date('2025-11-18T10:00:00').getTime(),
    value: 468500.2,
  },
  {
    timestamp: new Date('2025-11-19T10:00:00').getTime(),
    value: 471200.5,
  },
  {
    timestamp: new Date('2025-11-20T10:00:00').getTime(),
    value: 465800.1,
  },
  {
    timestamp: new Date('2025-11-21T10:00:00').getTime(),
    value: 459900.0,
  },
  {
    timestamp: new Date('2025-11-22T10:00:00').getTime(),
    value: 462300.75,
  },
  {
    timestamp: new Date('2025-11-23T10:00:00').getTime(),
    value: 469100.3,
  },
  {
    timestamp: new Date('2025-11-24T10:00:00').getTime(),
    value: 472569.81,
  },
];

export const generateBarData = (
  count: number,
  min: number = 100,
  max: number = 5000,
  options?: {
    labelPrefix?: string;
    useRandomColors?: boolean;
  }
): BarChartItemDataInterface[] => {
  const prefix = options?.labelPrefix ?? 'Item';
  const colors = ['#FF6B6B', '#4ECDC4', '#1A535C', '#FFE66D', '#FF9F1C'];

  return Array.from({ length: count }, (_, index) => {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;

    const item: BarChartItemDataInterface = {
      label: `${prefix} ${index + 1}`,
      value: value,
    };

    if (options?.useRandomColors) {
      item.color = colors[index % colors.length];
    }

    return item;
  });
};

const heavyData = generateBarData(365, 1000, 9000, { labelPrefix: 'Dia' });

export default function App() {
  const formatBRL = (val: number) => `R$ ${val.toFixed(0)}`;

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.content}>
        <BarChart.Root
          data={heavyData}
          width={400}
          isScrollable
          scrollToTheEnd // Auto-scrolls to latest item
          barWidth={50}
        >
          <BarChart.Canvas>
            <BarChart.Grid dashEffect={[5, 5]} />
            <BarChart.Bar />
            <BarChart.YAxis formatLabel={formatBRL} labelColor="#000" />
            <BarChart.Tooltip />
          </BarChart.Canvas>
        </BarChart.Root>
        {/* <BarChart.Root
          data={barChartFakeData}
          width={390}
          selectable
          showXAxis
          scrollToTheEnd
        >
          <BarChart.Canvas>
            <BarChart.Grid />
            <BarChart.Bar />
            <BarChart.ToolTip
              format={(value) => {
                'worklet';
                return value.toString();
              }}
            />
            <BarChart.YAxis labelColor="#FFF" labelBackgroundColor="#696969" />
          </BarChart.Canvas>
        </BarChart.Root> */}
      </GestureHandlerRootView>
      <GestureHandlerRootView style={styles.lineChartContent}>
        <LineChart.Root data={lineChartFakeData} width={400}>
          <LineChart.Canvas>
            <LineChart.Area />
            <LineChart.Baseline />
            <LineChart.Line />
            <LineChart.Cursor />
          </LineChart.Canvas>
          <LineChart.Tooltip.Value />
          <LineChart.Tooltip.Date />
        </LineChart.Root>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  lineChartContent: {
    flex: 1,
    marginTop: 200,
  },
});
