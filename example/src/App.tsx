import { Button, StyleSheet, Text, View } from 'react-native';
import {
  CandlestickChart,
  LineChart,
  PieChart,
} from 'react-native-financial-charts';
import type {
  CandlestickChartDataPoint,
  CandlestickChartRef,
  PieChartItem,
} from 'react-native-financial-charts';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { useMemo, useRef, useState } from 'react';

const createCandlestickDataset = (
  totalPoints: number
): CandlestickChartDataPoint[] => {
  const startTimestamp = new Date('2025-12-01T10:00:00').getTime();
  let previousClose = 42180;

  return Array.from({ length: totalPoints }, (_, index) => {
    const trend = index * 92;
    const swing = Math.sin(index / 4) * 1350;
    const momentum = Math.cos(index / 2.2) * 420;
    const eventSpike = index % 11 === 0 ? 720 : index % 17 === 0 ? -860 : 0;
    const open = previousClose + Math.sin(index * 1.3) * 210;
    const close = 42200 + trend + swing + momentum + eventSpike;
    const high = Math.max(open, close) + 260 + (index % 5) * 48;
    const low = Math.min(open, close) - 240 - (index % 4) * 36;

    const candle = {
      timestamp: startTimestamp + index * 24 * 60 * 60 * 1000,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    };

    previousClose = candle.close;
    return candle;
  });
};

const candlestickData = createCandlestickDataset(48);

const lineChartData = [
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

const pieChartData: PieChartItem[] = [
  { label: 'Rent', value: 1200, color: '#f87171' },
  { label: 'Food', value: 800, color: '#60a5fa' },
  { label: 'Savings', value: 1500, color: '#34d399' },
  { label: 'Entertainment', value: 500, color: '#fbbf24' },
  { label: 'Transport', value: 360, color: '#a78bfa' },
  { label: 'Health', value: 290, color: '#22d3ee' },
  { label: 'Travel', value: 760, color: '#84cc16' },
];

export default function App() {
  const chartRef = useRef<CandlestickChartRef>(null);
  const [selectedSlice, setSelectedSlice] = useState<PieChartItem | null>(null);
  const [selectedCandle, setSelectedCandle] =
    useState<CandlestickChartDataPoint | null>(null);

  const pieTotal = useMemo(
    () => pieChartData.reduce((sum, item) => sum + item.value, 0),
    []
  );

  const compactCandlestickData = useMemo(
    () => candlestickData.slice(candlestickData.length - 5),
    []
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.controlsRow}>
          <Button
            title="Start"
            onPress={() => chartRef.current?.scrollToStart()}
          />
          <Button title="End" onPress={() => chartRef.current?.scrollToEnd()} />
          <Button
            title="Select Last"
            onPress={() =>
              chartRef.current?.selectedIndex(candlestickData.length - 1, {
                scrollToCandle: true,
                animatedScroll: true,
              })
            }
          />
        </View>

        <CandlestickChart.Root
          ref={chartRef}
          data={candlestickData}
          width={360}
          height={220}
          isScrollable
          selectable
        >
          <CandlestickChart.Canvas style={styles.chartCard}>
            <CandlestickChart.Candles />
            <CandlestickChart.Cursor />
            <CandlestickChart.Tooltip.OHLC />
            <CandlestickChart.Tooltip.Date />
          </CandlestickChart.Canvas>
        </CandlestickChart.Root>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CandlestickChart Compact</Text>
          <Text style={styles.sectionCaption}>
            Compact snapshot with external details driven by selection.
          </Text>

          <View style={styles.compactInfoCard}>
            <Text style={styles.compactInfoLabel}>
              {selectedCandle ? 'Selected Candle' : 'Tap a candle'}
            </Text>
            <Text style={styles.compactInfoValue}>
              {selectedCandle
                ? `O ${selectedCandle.open}  H ${selectedCandle.high}  L ${selectedCandle.low}  C ${selectedCandle.close}`
                : 'Open, High, Low and Close will appear here'}
            </Text>
          </View>

          <CandlestickChart.Root
            data={compactCandlestickData}
            width={360}
            height={180}
            selectable
            candleWidth={22}
            spacing={10}
            bullishColor="#22C55E"
            bearishColor="#F97316"
            onCandlePress={setSelectedCandle}
          >
            <CandlestickChart.Canvas style={styles.chartCard}>
              <CandlestickChart.Candles candleBorderRadius={4} />
              <CandlestickChart.Cursor lineColor="#CBD5E1" />
              <CandlestickChart.Tooltip.Date offsetY={-30} />
            </CandlestickChart.Canvas>
          </CandlestickChart.Root>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PieChart</Text>
          <View style={styles.pieWrapper}>
            <PieChart.Root
              data={pieChartData}
              size={320}
              onSelect={setSelectedSlice}
            >
              <PieChart.Canvas selectable>
                <PieChart.Slices rounded />
              </PieChart.Canvas>

              <View pointerEvents="none" style={styles.pieOverlay}>
                <Text style={styles.pieLabel}>
                  {selectedSlice ? selectedSlice.label : 'Total'}
                </Text>
                <Text style={styles.pieValue}>
                  $
                  {selectedSlice
                    ? selectedSlice.value
                    : pieTotal.toLocaleString()}
                </Text>
              </View>
            </PieChart.Root>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LineChart</Text>
          <LineChart.Root
            data={lineChartData}
            width={360}
            containerStyle={styles.chartCard}
          >
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
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  scrollContent: {
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 32,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCaption: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chartCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
  },
  compactInfoCard: {
    width: 360,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  compactInfoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  compactInfoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  pieWrapper: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  pieValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
