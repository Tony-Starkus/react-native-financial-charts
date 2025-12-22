import { View, StyleSheet } from 'react-native';
import { Chart } from 'react-native-financial-charts';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

const fakeData = [
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
    value: 465800.1, // Queda
  },
  {
    timestamp: new Date('2025-11-21T10:00:00').getTime(),
    value: 459900.0, // Fundo
  },
  {
    timestamp: new Date('2025-11-22T10:00:00').getTime(),
    value: 462300.75, // Recuperação
  },
  {
    timestamp: new Date('2025-11-23T10:00:00').getTime(),
    value: 469100.3,
  },
  {
    timestamp: new Date('2025-11-24T10:00:00').getTime(),
    value: 472569.81, // Preço atual do print
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1, marginTop: 200 }}>
        <Chart.Root data={fakeData} width={400}>
          <Chart.Canvas>
            <Chart.Area />
            <Chart.Baseline />
            <Chart.Line />
            <Chart.Cursor />
          </Chart.Canvas>
          <Chart.ToolTip.Value />
          <Chart.ToolTip.Date />
        </Chart.Root>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
