# 📈 React Native Financial Charts - Bar Chart

<p align="center">
  <img src="../docs/assets/barchart/0.gif" alt="Interactive Bar" />
</p>

The BarChart component is designed for high-performance rendering of categorical data. It uses batch rendering techniques to handle thousands of bars smoothly, supports horizontal scrolling (virtualization), and provides granular control over every visual element.

## ⚡ Basic Usage

```tsx
import { BarChart } from 'react-native-financial-charts';
import type { BarChartItemDataInterface } from 'react-native-financial-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const data: BarChartItemDataInterface[] = [
  { label: 'Food 123 ABC', value: 1200, color: '#FF6B6B' }, // Red for expenses
  { label: 'Transport', value: 800, color: '#4ECDC4' }, // Teal
  { label: 'Invest', value: 3500, color: '#1A535C' }, // Dark Blue for savings
  { label: 'Invest', value: 3800, color: '#1A535C' }, // Dark Blue for savings
  { label: 'Rent', value: 2100, color: '#FFE66D' }, // Yellow
];

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BarChart.Root
        data={data}
        width={390}
        selectable
        showXAxis
        scrollToTheEnd
      >
        <BarChart.Canvas>
          <BarChart.Grid />
          <BarChart.Bar />
          <BarChart.Tooltip
            format={(value) => {
              'worklet';
              return value.toString();
            }}
          />
          <BarChart.YAxis labelColor="#FFF" labelBackgroundColor="#696969" />
        </BarChart.Canvas>
      </BarChart.Root>
    </GestureHandlerRootView>
  );
};
```

## 💡 Examples

Here are some common patterns to customize the chart to your needs.

### 1. Minimal Dashboard Widget (Fit Mode)

A clean chart that fits 100% of the container width without scrolling. Perfect for "Last 7 Days" summaries.

```tsx
import { BarChart } from 'react-native-financial-charts';

// Fixed small dataset
const last7DaysData = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 200 },
  { label: 'Wed', value: 150 },
  { label: 'Thu', value: 80 },
  { label: 'Fri', value: 250 },
  { label: 'Sat', value: 300 },
  { label: 'Sun', value: 180 },
];

export function MinimalWidget() {
  return (
    <BarChart.Root data={last7DaysData} height={200}>
      <BarChart.Canvas>
        <BarChart.Bar
          barBorderRadius={8}
          showValueLabels
          valueLabelColor="#888"
        />
      </BarChart.Canvas>
    </BarChart.Root>
  );
}
```

![Chart Sample 1](../docs/assets//barchart/1.png)

### 2. Scrollable Financial History

Ideal for monthly reports or long timelines. Features automatic scroll-to-end and currency formatting.

```tsx
import { BarChart } from 'react-native-financial-charts';
import type { BarChartItemDataInterface } from 'react-native-financial-charts';

const generateBarData = (
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

// Generate 24 months of data
const historyData = generateBarData(24, 5000, 9000);

export function FinancialHistory() {
  const formatBRL = (val: number) => `R$ ${val.toFixed(0)}`;

  return (
    <BarChart.Root
      data={historyData}
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
  );
}
```

![Chart Sample 2](../docs/assets//barchart/2.gif)

### 3. Conditional Coloring (Performance Scores)

You can define a specific color for each bar directly in the data object. This is useful for "RAG" (Red/Amber/Green) status charts.

```tsx
import { BarChart } from 'react-native-financial-charts';

const scoresData = [
  { label: 'Q1', value: 40, color: '#EF4444' }, // Red (Poor)
  { label: 'Q2', value: 95, color: '#10B981' }, // Green (Good)
  { label: 'Q3', value: 65, color: '#F59E0B' }, // Yellow (Average)
  { label: 'Q4', value: 85, color: '#10B981' }, // Green
];

export function PerformanceChart() {
  const formatBRL = (val: number) => `R$ ${val.toFixed(0)}`;

  return (
    <BarChart.Root data={scoresData} height={250}>
      <BarChart.Canvas>
        <BarChart.Grid />
        {/* Bars will use individual colors from data */}
        <BarChart.Bar showValueLabels />
        <BarChart.YAxis />
      </BarChart.Canvas>
    </BarChart.Root>
  );
}
```

![Chart Sample 3](../docs/assets//barchart/3.png)

### 4. Handling Loading States

Use the built-in skeleton support to provide a polished loading experience without extra code.

```tsx
import { BarChart } from 'react-native-financial-charts';
import { useState, useEffect } from 'react';
import type { BarChartItemDataInterface } from 'react-native-financial-charts';

const generateBarData = (
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

export function AsyncChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateBarData(10, 2, 10));
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <BarChart.Root
      data={data}
      isLoading={loading} // Toggles skeleton mode
      height={300}
    >
      <BarChart.Canvas>
        <BarChart.Bar />
        <BarChart.YAxis />
      </BarChart.Canvas>
    </BarChart.Root>
  );
}
```

![Chart Sample 4](../docs/assets//barchart/4.gif)

### 5. Stacked Bars (Multiple Series per Bar)

Pass `segments` on each item to stack several values in the same bar. Segments are drawn bottom -> top in array order, and the stack keeps the same rounded silhouette as a simple bar. The item `value` is recalculated as the sum of its segments, so the Y scale, tooltip, value labels and `onBarPress` all use the stack total.

```tsx
import { BarChart } from 'react-native-financial-charts';
import type { BarChartItemDataInterface } from 'react-native-financial-charts';

const series = [
  { key: 'BTC', color: '#F7931A' },
  { key: 'ETH', color: '#6E7CF5' },
  { key: 'SOL', color: '#2BB58A' },
];

const data: BarChartItemDataInterface[] = [
  {
    label: 'jan',
    value: 0, // recalculated from segments
    segments: [
      { label: 'BTC', value: 120, color: '#F7931A' },
      { label: 'ETH', value: 45, color: '#6E7CF5' },
      { label: 'SOL', value: 30, color: '#2BB58A' },
    ],
  },
  // ...
];

export function StackedMonthly() {
  return (
    <BarChart.Root data={data} width={360} height={220} showXAxis selectable segmentGap={1}>
      <BarChart.Canvas>
        <BarChart.Bar />
        <BarChart.Tooltip
          format={(value, label, item) => {
            'worklet';
            const top = item.segments?.[0];
            return top ? `${label}: ${value} (${top.label} ${top.value})` : `${label}: ${value}`;
          }}
        />
      </BarChart.Canvas>
    </BarChart.Root>
  );
}
```

Notes:

- Segment color falls back to the item `color`, then to `barColor`.
- Negative segment values are treated as `0`.
- By default, selection, tooltip and value labels act on the whole bar (stack total). Use `selectionMode="segment"` to select individual segments (see next example).
- For a 100% stacked view, convert segment values to percentages before passing `data`.

### 6. Controlled Selection (External UI)

Drive the selected bar from outside the chart with `selectedKey`. The key is `item.id` (or `item.label` when `id` is missing).

```tsx
import React, { useState } from 'react';
import { Button } from 'react-native';
import { BarChart } from 'react-native-financial-charts';
import type { BarChartItemKey } from 'react-native-financial-charts';

export function MonthlyBars({ data }) {
  const [selectedKey, setSelectedKey] = useState<BarChartItemKey | null>(null);

  return (
    <>
      <BarChart.Root
        data={data}
        isScrollable
        selectable
        selectedKey={selectedKey}
        scrollToSelectedBar
        // Taps only notify in controlled mode: mirror them into state.
        onBarPress={(item) => setSelectedKey(item ? (item.id ?? item.label) : null)}
      >
        <BarChart.Canvas>
          <BarChart.Bar />
          <BarChart.Tooltip />
        </BarChart.Canvas>
      </BarChart.Root>

      <Button title="Select 'out'" onPress={() => setSelectedKey('out')} />
      <Button title="Clear" onPress={() => setSelectedKey(null)} />
    </>
  );
}
```

Notes:

- `selectedKey={undefined}` (default) keeps the chart uncontrolled; `null` means controlled with nothing selected.
- In controlled mode taps and ref calls only fire `onBarPress`; changing `selectedKey` does not fire it.
- `scrollToSelectedBar` centers the selected bar when `isScrollable` is enabled.

### 7. Segment Selection (Stacked Bars)

`selectionMode="segment"` makes a tap select the tapped piece of a stacked bar instead of the whole column. The selection outline wraps only that segment, and `onBarPress` receives the segment index as the third argument.

```tsx
const [barKey, setBarKey] = useState<BarChartItemKey | null>(null);
const [segmentKey, setSegmentKey] = useState<BarChartItemKey | null>(null);

<BarChart.Root
  data={data}
  selectable
  selectionMode="segment"
  segmentGap={1}
  selectedKey={barKey}
  selectedSegmentKey={segmentKey}
  onBarPress={(item, index, segmentIndex) => {
    setBarKey(item ? (item.id ?? item.label) : null);
    const segment = segmentIndex >= 0 ? item?.segments?.[segmentIndex] : undefined;
    setSegmentKey(segment ? (segment.id ?? segment.label ?? null) : null);
  }}
>
  <BarChart.Canvas>
    <BarChart.Bar />
    <BarChart.Tooltip
      format={(value, label, item, segmentIndex) => {
        'worklet';
        const segment = segmentIndex >= 0 ? item.segments?.[segmentIndex] : undefined;
        return segment ? `${segment.label}: ${segment.value}` : `${label}: ${value}`;
      }}
    />
  </BarChart.Canvas>
</BarChart.Root>;

// From a table row: select "ETH" in "out"
setBarKey('out');
setSegmentKey('ETH');
```

Notes:

- Segment keys are `segment.id`, falling back to `segment.label`.
- Taps in a segment gap, or above a short stack, select the nearest segment.
- Tapping the selected segment again deselects; tapping another segment of the same bar switches to it.
- Non-stacked bars still select as a whole (`segmentIndex = -1`).
- In `selectionMode="bar"` (default), `segmentIndex` is always `-1` and `selectedSegmentKey` is ignored.
- Ref: `selectedIndex(index, { segmentIndex })` and `selectByKey(key, { segmentKey })`.

### 8. Series Highlight (Stacked Bars + Table)

`selectionMode="series"` highlights one series (e.g. "Bitcoin") across **all** bars and dims the others. It's the pattern for a breakdown table next to the chart: tapping a row highlights its series, and tapping a segment in the chart selects its series. No bar outline or tooltip is shown in this mode.

The series key of each segment is `segment.id`, falling back to `segment.label`, so use the same key for the same series in every bar.

```tsx
const [seriesKey, setSeriesKey] = useState<BarChartItemKey | null>(null);

<BarChart.Root
  data={monthlyData} // segments: [{ id: 'btc', value, color }, { id: 'eth', ... }]
  selectable
  segmentGap={1}
  selectionMode="series"
  selectedSeriesKey={seriesKey}
  onSeriesSelect={setSeriesKey}
>
  <BarChart.Canvas>
    <BarChart.Bar inactiveSegmentColor="#3A3F4B" />
  </BarChart.Canvas>
</BarChart.Root>;

{coins.map((coin) => (
  <Pressable
    key={coin.id}
    onPress={() => setSeriesKey((k) => (k === coin.id ? null : coin.id))}
  >
    <Text>{coin.name}</Text>
  </Pressable>
))}
```

Notes:

- Dimming: `inactiveSegmentColor` cross-fades inactive segments to that color (the look in dark dashboards). Without it, inactive segments keep their color at `inactiveSegmentOpacity` (default `0.25`).
- Switching on/off animates; switching from one series to another is immediate.
- Non-stacked bars are dimmed while a series is active.
- Tapping a segment of the active series, spacing or padding clears the highlight.
- `onSeriesSelect` fires for taps and `ref.selectSeries(key)`; changing `selectedSeriesKey` does not fire it. `onBarPress` is not fired in this mode.
- `ref.clearSelection()` clears the highlighted series in this mode.

### 9. Highlighted X-Axis Label (Current Period)

Mark an item with `highlighted: true` to emphasize its X-axis label, e.g. the current month. This is purely visual and independent from selection.

```tsx
const data = months.map((label, i) => ({
  label,
  value: totals[i],
  highlighted: i === months.length - 1,
}));

<BarChart.Root data={data} showXAxis>
  <BarChart.Canvas>
    <BarChart.Bar highlightedLabelColor="#F5A524" highlightedLabelFont={boldFont} />
  </BarChart.Canvas>
</BarChart.Root>;
```

## 🔷 TypeScript Support

For advanced usage, you can import the following interfaces from react-native-financial-charts:

Complete interface reference:
[`docs/interfaces/BarChartInterfaces.md`](./interfaces/BarChartInterfaces.md)

### Component Props

If you are building wrappers around the chart components, use these interfaces:

- [`BarChartRootPropsInterface`](./interfaces/BarChartInterfaces.md#barchartrootpropsinterface): Props for `<BarChart.Root />`.
- [`BarChartBarPropsInterface`](./interfaces/BarChartInterfaces.md#barchartbarpropsinterface): Props for `<BarChart.Bar />`.
- [`BarChartGridPropsInterface`](./interfaces/BarChartInterfaces.md#barchartgridpropsinterface): Props for `<BarChart.Grid />`.
- [`BarChartYAXisPropsInterface`](./interfaces/BarChartInterfaces.md#barchartyaxispropsinterface): Props for `<BarChart.YAxis />`.
- [`BarChartTooltipPropsInterface`](./interfaces/BarChartInterfaces.md#barcharttooltippropsinterface): Props for `<BarChart.Tooltip />`.

### Data and Refs

- [`BarChartItemDataInterface`](./interfaces/BarChartInterfaces.md#barchartitemdatainterface): The shape of each object in the data array.
- [`BarChartSegmentInterface`](./interfaces/BarChartInterfaces.md#barchartsegmentinterface): A segment of a stacked bar.
- [`BarChartRef`](./interfaces/BarChartInterfaces.md#barchartref): The type for the `useRef` when interacting with the chart programmatically.

```tsx
import { useRef } from 'react';
import {
  BarChartRef,
  BarChartItemDataInterface,
} from 'react-native-financial-charts';

const chartRef = useRef<BarChartRef>(null);

const onSelect = (item: BarChartItemDataInterface | null, index: number) => {
  console.log(item?.value);
};
```

## 🛠️ API Reference

### `<BarChart.Root />`

The provider component that manages state, layout, and gestures.

| Prop                  | Type                                                               | Default       | Description                                                                                |
| --------------------- | ------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------ |
| `ref`                 | React.Ref<[BarChartRef](./interfaces/BarChartInterfaces.md#barchartref)>                                           | `undefined`   | Bar chart component ref.                                                                   |
| `data`                | [`BarChartItemDataInterface`](./interfaces/BarChartInterfaces.md#barchartitemdatainterface)[]                                       | **Required**  | Array of data points. The entry animation replays only when bar count or values change, not on recolors. |
| `height`              | `number`                                                           | `300`         | Total height of the chart container.                                                       |
| `width`               | `number`                                                           | `300`         | Total width of the chart container.                                                        |
| `scrollToTheEnd`      | `boolean`                                                          | `false`       | If true, automatically scrolls to the end of the list on load.                             |
| `yAxisTicksCount`     | `number`                                                           | `5`           | Number of horizontal grid lines/ticks to calculate.                                        |
| `isLoading`           | `boolean`                                                          | `false`       | Enable loading skeleton.                                                                   |
| `barWidth`            | `number`                                                           | `32`          | Width of each individual bar in pixels.                                                    |
| `spacing`             | `number`                                                           | `12`          | Spacing between bars.                                                                      |
| `barColor`            | `string`                                                           | `#E0E0E0`     | Default bar color.                                                                         |
| `activeBorderColor`   | `string`                                                           | `#333333`     | Border color when a bar is selected/tapped.                                                |
| `activeBorderWidth`   | `number`                                                           | `2`           | Border width when a bar is selected/tapped.                                                |
| `font`                | `SkFont \| null`                                                   | `System Font` | Skia Font object for drawing labels. Essential for performance. If null, text won't render |
| `isScrollable`        | `boolean`                                                          | `false`       | Enables horizontal scrolling. Virtualization is automatically handled.                     |
| `selectable`          | `boolean`                                                          | `false`       | Controls if bars can be selected.                                                          |
| `showXAxis`           | `boolean`                                                          | `false`       | Show X Axis labels.                                                                        |
| `verticalScaleFactor` | `number`                                                           | `0.8`         | Vertical scale (0.1 to 1.0).                                                               |
| `onBarPress`          | (item: [BarChartItemDataInterface](./interfaces/BarChartInterfaces.md#barchartitemdatainterface) \| null, index: number, segmentIndex: number) => void | `undefined`   | Callback fired when a bar is tapped (requires `selectable={true}`). `segmentIndex` is `-1` unless a segment is selected. |
| `selectionMode`       | `'bar' \| 'segment' \| 'series'`                                    | `'bar'`       | What a tap selects on stacked bars: the whole column, the tapped segment, or the tapped segment's series across all bars. |
| `selectedSeriesKey`   | `string \| number \| null`                                         | `undefined`   | Controlled highlighted series (`selectionMode="series"`). `undefined` = uncontrolled, `null` = none. |
| `onSeriesSelect`      | `(key: string \| number \| null) => void`                           | `undefined`   | Fired when a series is selected/deselected by tap or `ref.selectSeries`.                   |
| `segmentGap`          | `number`                                                           | `0`           | Gap in pixels between segments of stacked bars.                                            |
| `selectedSegmentKey`  | `string \| number \| null`                                         | `undefined`   | Controlled segment (`id`, fallback `label`) inside the bar selected by `selectedKey`. Requires `selectionMode="segment"`. |
| `selectedKey`         | `string \| number \| null`                                         | `undefined`   | Controlled selection by key (`id`, fallback `label`). `undefined` = uncontrolled, `null` = nothing selected. |
| `scrollToSelectedBar` | `boolean`                                                          | `false`       | Centers the bar selected via `selectedKey` (requires `isScrollable`).                      |

### `BarChartRef` (Imperative API)

Use `ref` in `<BarChart.Root />` to control selection and scrolling programmatically.

```tsx
import React, { useRef } from 'react';
import { BarChart } from 'react-native-financial-charts';
import type { BarChartRef } from 'react-native-financial-charts';

const chartRef = useRef<BarChartRef>(null);

<BarChart.Root ref={chartRef} data={data} isScrollable>
  <BarChart.Canvas>
    <BarChart.Bar />
  </BarChart.Canvas>
</BarChart.Root>;
```

| Method          | Type                                                                                     | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `scrollToStart` | `(animated?: boolean) => void`                                                           | Scrolls to the start (`x = 0`).                                              |
| `scrollToEnd`   | `(animated?: boolean) => void`                                                           | Scrolls to the end of the content.                                           |
| `scrollToIndex` | `(index: number, animated?: boolean) => void`                                            | Scrolls to `index * (barWidth + spacing)`.                                   |
| `selectedIndex` | `(index: number, options?: { scrollToBar?: boolean; animatedScroll?: boolean; segmentIndex?: number }) => void` | Selects a bar by index (`-1` clears selection). Optional auto-center scroll and segment. Fires `onBarPress`. |
| `selectByKey`   | `(key: string \| number \| null, options?: { scrollToBar?: boolean; animatedScroll?: boolean; segmentKey?: string \| number \| null }) => void` | Selects a bar by key (`id`, fallback `label`). `null`/unknown keys clear. Optional segment. Fires `onBarPress`. |
| `clearSelection` | `() => void`                                                                            | Clears current selection (equivalent to `selectedIndex(-1)`). Fires `onBarPress(null, -1)`. In series mode, clears the series and fires `onSeriesSelect(null)`. |
| `selectSeries`   | `(key: string \| number \| null) => void`                                                | Highlights a series across all bars (`selectionMode="series"` only). `null` clears. Fires `onSeriesSelect`. |

#### Method behavior notes

- `selectedIndex(index)` only updates when `index` is between `-1` and `data.length - 1`.
- `selectedIndex(-1)` clears the current selection.
- `selectedIndex(index, { scrollToBar: true })` only scrolls if `isScrollable` is enabled and `index !== -1`.
- `selectedIndex(..., { animatedScroll })` controls only the auto-scroll animation triggered by `scrollToBar`.
- `scrollToIndex(index)` clamps the target index to the valid data range.
- All selection methods fire `onBarPress` exactly like a tap (`onBarPress(null, -1)` on deselection). Since 3.0.0 — see the [changelog](../CHANGELOG.md).
- In controlled mode (`selectedKey` defined), selection methods only fire `onBarPress`; the visual selection follows `selectedKey`.
- `segmentIndex` / `segmentKey` options are ignored unless `selectionMode="segment"`; invalid segments fall back to the whole bar.

---

### `<BarChart.Bar />`

Renders the visual bars, the X-Axis labels (bottom), and optional value labels (top).

| Prop                      | Type                        | Default     | Description                                                 |
| ------------------------- | --------------------------- | ----------- | ----------------------------------------------------------- |
| `labelPaddingTop`         | `number`                    | `4`         | Distance from the chart bottom to the label.                |
| `labelColor`              | `string`                    | `#555555`   | Color of the X-Axis text labels (bottom).                   |
| `barBorderRadius`         | `number`                    | `4`         | Radius of the bar corners.                                  |
| `showValueLabels`         | `boolean`                   | `false`     | Show the numeric value on top of each bar.                  |
| `valueLabelColor`         | `string`                    | `#555555`   | Color of the top value labels.                              |
| `valueLabelPaddingBottom` | `number`                    | `4`         | Distance between the top of the bar and the value label.    |
| `formatValueLabel`        | `(value: number, item: BarChartItemDataInterface) => string` | `undefined` | Function to format the top value label (runs on UI thread). For stacked bars, `value` is the stack total. |
| `highlightedLabelColor`   | `string`                    | `#F5A524`   | X-axis label color for items with `highlighted: true`.      |
| `highlightedLabelFont`    | `SkFont \| null`            | chart font  | Optional font (e.g. bold) for highlighted X-axis labels.    |
| `inactiveSegmentColor`    | `string`                    | `undefined` | Series mode: color cross-faded over segments outside the highlighted series. |
| `inactiveSegmentOpacity`  | `number`                    | `0.25`      | Series mode: opacity of inactive segments when `inactiveSegmentColor` is not set. |

---

### `<BarChart.Canvas />`

The container that renders the Skia Canvas and handles touch gestures/scrolling.

| Prop       | Type              | Default     | Description                                          |
| ---------- | ----------------- | ----------- | ---------------------------------------------------- |
| `children` | `React.ReactNode` | `-`         | Must contain the visual components (Bar, Grid, etc). |
| `style`    | `ViewStyle`       | `undefined` | Skia canvas styles.                                  |

---

### `<BarChart.Grid />`

Draws the horizontal background lines based on `yAxisTicksCount`.

| Prop         | Type       | Default     | Description                                          |
| ------------ | ---------- | ----------- | ---------------------------------------------------- |
| `lineColor`  | `string`   | `#E0E0E0`   | Grid line color.                                     |
| `lineWidth`  | `number`   | `1`         | The thickness of the grid lines in pixels.           |
| `dashEffect` | `number[]` | `undefined` | Dashed pattern (e.g., [5, 5] for 5px dash, 5px gap). |

---

### `<BarChart.Tooltip />`

The floating tooltip that appears when a bar is selected.

| Prop              | Type                                       | Default     | Description                         |
| ----------------- | ------------------------------------------ | ----------- | ----------------------------------- |
| `backgroundColor` | `string`                                   | `#333`      | Bubble background color.            |
| `textColor`       | `string`                                   | `#FFF`      | Text color.                         |
| `offsetY`         | `number`                                   | `0`         | Vertical offset adjustment.         |
| `font`            | `SkFont`                                   | `undefined` | Optional font override for tooltip. |
| `format`          | `(value: number, label: string, item: BarChartItemDataInterface, segmentIndex: number) => string` | `undefined` | Worklet to format the tooltip text. For stacked bars, `value` is the stack total and `item.segments` has the breakdown; `segmentIndex` is the selected segment (`-1` for whole bar). Default text shows the segment label/value when a segment is selected. |

---

### `<BarChart.YAxis />`

Renders the vertical axis labels on the left side.

| Prop                   | Type                        | Default                                  | Description                                                                 |
| ---------------------- | --------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `width`                | `number`                    | `50`                                     | Reserved sidebar width used by `BarChart.Root` layout when YAxis is present. |
| `labelColor`           | `string`                    | `#9CA3AF`                                | Text color.                                                                 |
| `labelOffsetX`         | `number`                    | `0`                                      | Horizontal text offset.                                                     |
| `labelYOffset`         | `number`                    | `-4`                                     | Vertical text offset (positions label slightly above tick line).            |
| `snapToPixel`          | `boolean`                   | `false`                                  | Rounds Y position to nearest pixel for crisper lines/text.                 |
| `labelBackgroundColor` | `string`                    | `transparent`                            | Background color for text labels (pill effect).                            |
| `labelBorderRadius`    | `number`                    | `4`                                      | Border radius for label background.                                         |
| `labelPadding`         | `number`                    | `2`                                      | Internal padding for label background.                                      |
| `formatLabel`          | `(value: number) => string` | `system locale (max 6 fractional digits)` | Function to format numeric values. Return `''` to hide a tick (and its pill). |
