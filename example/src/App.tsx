import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BarChart,
  CandlestickChart,
  GaugeChart,
  LineChart,
  PieChart,
} from 'react-native-financial-charts';
import type {
  BarChartItemDataInterface,
  BarChartItemKey,
  BarChartSelectionMode,
  CandlestickChartDataPoint,
  CandlestickChartRef,
  GaugeSegment,
  PieChartItem,
  PieChartItemKey,
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
  { id: 'rent', label: 'Rent', value: 1200, color: '#f87171' },
  { id: 'food', label: 'Food', value: 800, color: '#60a5fa' },
  { id: 'savings', label: 'Savings', value: 1500, color: '#34d399' },
  { id: 'fun', label: 'Entertainment', value: 500, color: '#fbbf24' },
  { id: 'transport', label: 'Transport', value: 360, color: '#a78bfa' },
  { id: 'health', label: 'Health', value: 290, color: '#22d3ee' },
  { id: 'travel', label: 'Travel', value: 760, color: '#84cc16' },
];

const cryptoSeries = [
  { key: 'BTC', color: '#F7931A', base: 120 },
  { key: 'ETH', color: '#6E7CF5', base: 40 },
  { key: 'SOL', color: '#2BB58A', base: 30 },
  { key: 'USDT', color: '#F1F5F9', base: 18 },
  { key: 'ADA', color: '#9F7AEA', base: 14 },
];

const months = [
  'nov',
  'dez',
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
];

const stackedBarData: BarChartItemDataInterface[] = months.map(
  (label, monthIndex) => ({
    label,
    value: 0, // recalculated from segments
    highlighted: monthIndex === months.length - 1, // current month
    segments: cryptoSeries.map((series, seriesIndex) => ({
      label: series.key,
      color: series.color,
      value: Math.round(
        series.base * (1 + 0.15 * Math.sin(monthIndex / 2 + seriesIndex))
      ),
    })),
  })
);

const gaugeSegments: GaugeSegment[] = [
  { from: 0, to: 30, color: '#22C55E', label: 'Low' },
  { from: 30, to: 70, color: '#F59E0B', label: 'Medium' },
  { from: 70, to: 100, color: '#EF4444', label: 'High' },
];

export default function App() {
  const [gaugeValue, setGaugeValue] = useState(58);
  const chartRef = useRef<CandlestickChartRef>(null);
  const [selectedSlice, setSelectedSlice] = useState<PieChartItem | null>(null);
  const [barSelectionMode, setBarSelectionMode] =
    useState<BarChartSelectionMode>('series');
  const [selectedSeriesKey, setSelectedSeriesKey] =
    useState<BarChartItemKey | null>(null);
  const [selectedSegmentKey, setSelectedSegmentKey] =
    useState<BarChartItemKey | null>(null);
  const [selectedBarKey, setSelectedBarKey] = useState<BarChartItemKey | null>(
    null
  );
  const [selectedPieKey, setSelectedPieKey] = useState<PieChartItemKey | null>(
    null
  );
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
              selectedKey={selectedPieKey}
              onSelect={(item) => {
                setSelectedSlice(item);
                setSelectedPieKey(item ? item.id ?? item.label ?? null : null);
              }}
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

          <View style={styles.compactInfoCard}>
            {pieChartData.map((item) => {
              const isActive = selectedPieKey === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.tableRow, isActive && styles.tableRowActive]}
                  onPress={() => {
                    const nextKey = isActive ? null : item.id!;
                    setSelectedPieKey(nextKey);
                    setSelectedSlice(nextKey ? item : null);
                  }}
                >
                  <View
                    style={[styles.tableDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.tableLabel}>{item.label}</Text>
                  <Text style={styles.tableValue}>
                    {((item.value / pieTotal) * 100).toFixed(1)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BarChart Stacked</Text>
          <BarChart.Root
            data={stackedBarData}
            width={360}
            height={220}
            spacing={8}
            showXAxis
            selectable
            segmentGap={1}
            selectionMode={barSelectionMode}
            selectedKey={selectedBarKey}
            selectedSegmentKey={selectedSegmentKey}
            selectedSeriesKey={selectedSeriesKey}
            onSeriesSelect={setSelectedSeriesKey}
            onBarPress={(item, _index, segmentIndex) => {
              setSelectedBarKey(item ? item.label : null);
              const segment =
                item && segmentIndex >= 0
                  ? item.segments?.[segmentIndex]
                  : undefined;
              setSelectedSegmentKey(segment?.label ?? null);
            }}
          >
            <BarChart.Canvas style={styles.chartCard}>
              <BarChart.Bar
                barBorderRadius={4}
                labelColor="#64748B"
                inactiveSegmentColor="#3A3F4B"
              />
              <BarChart.Tooltip
                format={(value, label, item, segmentIndex) => {
                  'worklet';
                  const segment =
                    segmentIndex >= 0 && item.segments
                      ? item.segments[segmentIndex]
                      : undefined;
                  return segment
                    ? `${label} · ${segment.label}: ${segment.value}`
                    : `${label}: ${value}`;
                }}
              />
            </BarChart.Canvas>
          </BarChart.Root>

          <View style={styles.controlsRow}>
            <Button
              title={`Mode: ${barSelectionMode}`}
              onPress={() =>
                setBarSelectionMode((m) =>
                  m === 'bar' ? 'segment' : m === 'segment' ? 'series' : 'bar'
                )
              }
            />
            <Button
              title="out · ETH"
              onPress={() => {
                setSelectedBarKey('out');
                setSelectedSegmentKey('ETH');
              }}
            />
            <Button
              title="Clear"
              onPress={() => {
                setSelectedBarKey(null);
                setSelectedSegmentKey(null);
                setSelectedSeriesKey(null);
              }}
            />
          </View>

          {barSelectionMode === 'series' && (
            <View style={styles.compactInfoCard}>
              <Text style={styles.compactInfoLabel}>Por criptomoeda</Text>
              {cryptoSeries.map((series) => {
                const isActive = selectedSeriesKey === series.key;
                return (
                  <Pressable
                    key={series.key}
                    style={[styles.tableRow, isActive && styles.tableRowActive]}
                    onPress={() =>
                      setSelectedSeriesKey(isActive ? null : series.key)
                    }
                  >
                    <View
                      style={[
                        styles.tableDot,
                        { backgroundColor: series.color },
                      ]}
                    />
                    <Text style={styles.tableLabel}>{series.key}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GaugeChart</Text>
          <Text style={styles.sectionCaption}>
            Risk score with segments, ticks and an animated needle.
          </Text>
          <GaugeChart.Root
            value={gaugeValue}
            segments={gaugeSegments}
            width={320}
            containerStyle={styles.chartCard}
          >
            <GaugeChart.Canvas>
              <GaugeChart.Segments gapAngle={3} />
              <GaugeChart.Ticks count={10} showLabels />
              <GaugeChart.Needle colorBySegment pivotColor="#F8FAFC" />
            </GaugeChart.Canvas>
            <GaugeChart.Value />
          </GaugeChart.Root>

          <GaugeChart.Root
            value={gaugeValue}
            startAngle={180}
            endAngle={360}
            strokeWidth={16}
            segments={gaugeSegments}
            width={320}
            containerStyle={styles.chartCard}
          >
            <GaugeChart.Canvas>
              <GaugeChart.Track color="#1E293B" />
              <GaugeChart.Progress colorBySegment />
            </GaugeChart.Canvas>
            <GaugeChart.Value
              offsetY={-30}
              format={(v) => {
                'worklet';
                return `${v.toFixed(0)}%`;
              }}
            />
          </GaugeChart.Root>

          <View style={styles.controlsRow}>
            <Button
              title="-10"
              onPress={() => setGaugeValue((v) => Math.max(0, v - 10))}
            />
            <Button
              title="Random"
              onPress={() => setGaugeValue(Math.round(Math.random() * 100))}
            />
            <Button
              title="+10"
              onPress={() => setGaugeValue((v) => Math.min(100, v + 10))}
            />
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
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  tableRowActive: {
    backgroundColor: '#1E293B',
  },
  tableDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tableLabel: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  tableValue: {
    color: '#94A3B8',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
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
