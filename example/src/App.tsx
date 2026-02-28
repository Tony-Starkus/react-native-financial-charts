import { View, StyleSheet, Text as RNText } from 'react-native';
import { LineChart, PieChart } from 'react-native-financial-charts';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { PieChartItem } from '../../src/charts/PieChart/interfaces';
import { useState } from 'react';

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

const chartData: PieChartItem[] = [
  { label: 'Rent', value: 1200, color: '#f87171' },
  { label: 'Food', value: 800, color: '#60a5fa' },
  { label: 'Savings', value: 1500, color: '#34d399' },
  { label: 'Entertainment', value: 500, color: '#fbbf24' },
  { label: 'Rent', value: 1200, color: '#f87171' },
  { label: 'Food', value: 800, color: '#60a5fa' },
  { label: 'Savings', value: 1500, color: '#34d399' },
  { label: 'Entertainment', value: 500, color: '#fbbf24' },
  { label: 'Rent', value: 1200, color: '#f87171' },
  { label: 'Food', value: 800, color: '#60a5fa' },
  { label: 'Savings', value: 1500, color: '#34d399' },
  { label: 'Entertainment', value: 500, color: '#fbbf24' },
  { label: 'Rent', value: 1200, color: '#f87171' },
  { label: 'Food', value: 800, color: '#60a5fa' },
  { label: 'Savings', value: 1500, color: '#34d399' },
  { label: 'Entertainment', value: 500, color: '#fbbf24' },
  { label: 'Rent', value: 1200, color: '#f87171' },
];

export default function App() {
  const [selected, setSelected] = useState<PieChartItem | null>(null);

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.content}>
        <View style={styles.container}>
          <PieChart.Root data={chartData} size={320} onSelect={setSelected}>
            <PieChart.Canvas selectable>
              <PieChart.Slices rounded sliceGapAngle={1} sliceThickness={5} />
            </PieChart.Canvas>

            {/* Content inside the donut hole */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <RNText
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                {selected ? selected.label : 'Total'}
              </RNText>
              <RNText
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#111827',
                }}
              >
                $
                {selected
                  ? selected.value
                  : chartData.reduce((p, c) => p + c.value, 0)}
              </RNText>
            </View>
          </PieChart.Root>
        </View>
        <View style={styles.lineChartContent}>
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
        </View>
      </GestureHandlerRootView>
      <GestureHandlerRootView style={styles.content}>
        {/* <BarChart.Root
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
        </BarChart.Root> */}
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
    backgroundColor: 'red',
    flex: 1,
    marginTop: 200,
  },
});
