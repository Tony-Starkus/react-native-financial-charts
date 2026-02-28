# 📈 React Native Financial Charts - Line Chart

<p align="center">
  <img src="../docs/assets/0.gif" alt="Interactive Line" />
</p>

## ⚡ Basic Usage

```tsx
import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-financial-charts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const data = [
  { timestamp: 1625945400000, value: 33575.25 },
  { timestamp: 1625946300000, value: 33545.25 },
  { timestamp: 1625947200000, value: 33510.25 },
  { timestamp: 1625948100000, value: 33215.25 },
];

export default function App() {
  return (
    <View
      style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}
    >
      <GestureHandlerRootView style={{ flex: 1, marginTop: 200 }}>
        <LineChart.Root data={data} height={250}>
          <LineChart.Canvas>
            <LineChart.Area />
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
```

## 💡 Examples

Here are some common patterns to customize the chart to your needs.

### 1. Custom Colors (The "Bitcoin" Look)

Customize the line color and the area gradient to match specific assets (e.g., Orange for BTC, Blue for ETH).

```tsx
<LineChart.Root data={data}>
  <LineChart.Canvas>
    <LineChart.Area
      // Gradient from transparent Orange to transparent
      gradientColors={['#F7931A50', '#F7931A00']}
    />
    <LineChart.Line
      colors={['#F7931A']} // Solid Orange
      strokeWidth={4}
    />
    <LineChart.Cursor crosshairColor="#F7931A" />
  </LineChart.Canvas>
</LineChart.Root>
```

![Chart Sample 1](../docs/assets/1.png)

### 2. Minimal Sparkline

A small, simplified chart without tooltips or padding, perfect for lists or crypto tickers.

```tsx
<LineChart.Root
  data={data}
  height={60}
  width={120}
  padding={0} // Remove padding to touch edges
>
  <LineChart.Canvas>
    <LineChart.Line
      strokeWidth={2}
      colors={['#10B981', '#10B981', '#10B981', '#10B981']}
    />
  </LineChart.Canvas>
  {/* No Tooltips, no Cursor */}
</LineChart.Root>
```

![Chart Sample 2](../docs/assets/2.png)

### 3. Custom Currency Formatting (USD/EUR)

Use a Worklet to format values dynamically on the UI thread.

```tsx
const formatUSD = (value: number) => {
  'worklet';
  return `$ ${value.toFixed(2)}`;
};

const formatEUR = (value: number) => {
  'worklet';
  return `€ ${value.toFixed(2).replace('.', ',')}`;
};

// Usage
<LineChart.Root data={data}>
  <LineChart.Canvas>
    <LineChart.Area />
    <LineChart.Line />
    <LineChart.Cursor />
  </LineChart.Canvas>
  <LineChart.Tooltip.Value format={formatUSD} />
</LineChart.Root>;
```

![Chart Sample 3](../docs/assets/3.gif)

### 4. Customizing the Tooltip Style

Change the background color and border radius of the floating tooltip.

```tsx
<LineChart.Root data={data}>
  <LineChart.Canvas>
    <LineChart.Area />
    <LineChart.Line />
    <LineChart.Cursor />
  </LineChart.Canvas>
  <LineChart.Tooltip.Value
    containerStyle={{
      backgroundColor: 'white',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    }}
    style={{
      color: 'black',
      fontSize: 14,
    }}
  />
</LineChart.Root>
```

![Chart Sample 4](../docs/assets/4.gif)

## 🎨 Advanced Customization

### Formatting Currency (USD)

```ts
const formatUSD = (value: number) => {
  'worklet';
  return `$ ${value.toFixed(2)}`;
};

<LineChart.Tooltip.Value format={formatUSD} />;
```

### Styling the Container

```tsx
<LineChart.Root
  data={data}
  containerStyle={{
    backgroundColor: '#1E1E2D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  }}
>
```

## 🔷 TypeScript Support

For advanced usage, you can import these exported types from `react-native-financial-charts`:

Complete interface reference:
[`docs/interfaces/LineChartInterfaces.md`](./interfaces/LineChartInterfaces.md)

- [`LineChartDataPoint`](./interfaces/LineChartInterfaces.md#linechartdatapoint): the shape of each point in the data array.
- [`LineChartContextValue`](./interfaces/LineChartInterfaces.md#linechartcontextvalue): advanced/internal context value type.
- [`LineChartRootPropsInterface`](./interfaces/LineChartInterfaces.md#linechartrootpropsinterface): props for `<LineChart.Root />`.
- [`LineChartAreaPropsInterface`](./interfaces/LineChartInterfaces.md#linechartareapropsinterface): props for `<LineChart.Area />`.
- [`LineChartLinePropsInterface`](./interfaces/LineChartInterfaces.md#linechartlinepropsinterface): props for `<LineChart.Line />`.
- [`LineChartCursorPropsInterface`](./interfaces/LineChartInterfaces.md#linechartcursorpropsinterface): props for `<LineChart.Cursor />`.
- [`LineChartBaselinePropsInterface`](./interfaces/LineChartInterfaces.md#linechartbaselinepropsinterface): props for `<LineChart.Baseline />`.
- [`LineChartTooltipValuePropsInterface`](./interfaces/LineChartInterfaces.md#linecharttooltipvaluepropsinterface): props for `<LineChart.Tooltip.Value />`.
- [`LineChartTooltipDatePropsInterface`](./interfaces/LineChartInterfaces.md#linecharttooltipdatepropsinterface): props for `<LineChart.Tooltip.Date />`.

```tsx
import { LineChartDataPoint } from 'react-native-financial-charts';

const data: LineChartDataPoint[] = [
  { timestamp: 1625945400000, value: 33575.25 },
];
```

## 🛠️ API Reference

### `<LineChart.Root />`

The parent component that manages state and calculations.

| Prop             | Type                                                                             | Default        | Description                              |
| ---------------- | -------------------------------------------------------------------------------- | -------------- | ---------------------------------------- |
| `data`           | [`LineChartDataPoint`](./interfaces/LineChartInterfaces.md#linechartdatapoint)[] | **Required**   | `{ timestamp: number, value: number }[]` |
| `height`         | `number`                                                                         | `250`          | Total height of the chart                |
| `width`          | `number`                                                                         | `Screen Width` | Total width of the chart                 |
| `padding`        | `number`                                                                         | `20`           | Internal horizontal padding              |
| `containerStyle` | `StyleProp<ViewStyle>`                                                           | `undefined`    | Styles for the main container            |

Notes:

- For a drawable line, pass at least 2 points in `data`. With fewer points, the chart keeps interaction state but does not draw a valid path.

### `LineChart.Root` and `ref`

`LineChart.Root` does not currently expose an imperative `ref` API (no methods like `scrollTo...` or `selectedIndex`).

### `<LineChart.Canvas />`

The wrapper for all Skia elements.

| Prop       | Type              | Default | Description                             |
| ---------- | ----------------- | ------- | --------------------------------------- |
| `children` | `React.ReactNode` | `-`     | Children element. Must be Skia elements |

### `<LineChart.Line />`

Draws the main chart line.

Interface: [`LineChartLinePropsInterface`](./interfaces/LineChartInterfaces.md#linechartlinepropsinterface)

| Prop          | Type       | Default                                        | Description                    |
| ------------- | ---------- | ---------------------------------------------- | ------------------------------ |
| `strokeWidth` | `number`   | `3`                                            | Line thickness                 |
| `colors`      | `string[]` | `['#00E396', '#00E396', '#EA3943', '#EA3943']` | Gradient colors (Top → Bottom) |

### `<LineChart.Baseline />`

Draws a dashed horizontal line at the starting value (baseline). Useful for visualizing profit/loss.

Interface: [`LineChartBaselinePropsInterface`](./interfaces/LineChartInterfaces.md#linechartbaselinepropsinterface)

| Prop        | Type      | Default   | Description                                              |
| ----------- | --------- | --------- | -------------------------------------------------------- |
| `color`     | `string`  | `#858CA2` | Color of the dashed line and starting dot.               |
| `showLabel` | `boolean` | `true`    | Whether to show the label chip with the formatted value. |

### `<LineChart.Area />`

Draws the gradient fill below the line.

Interface: [`LineChartAreaPropsInterface`](./interfaces/LineChartInterfaces.md#linechartareapropsinterface)

| Prop             | Type       | Default                                                | Description                                                                      |
| ---------------- | ---------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `gradientColors` | `string[]` | `['#00E396E6', '#00E39600', '#EA394300', '#EA394326']` | Array of 4 colors for the area gradient (Top -> Baseline -> Baseline -> Bottom). |

### `<LineChart.Cursor />`

The interactive cursor that follows the finger.

Interface: [`LineChartCursorPropsInterface`](./interfaces/LineChartInterfaces.md#linechartcursorpropsinterface)

| Prop             | Type     | Default   | Description                          |
| ---------------- | -------- | --------- | ------------------------------------ |
| `crosshairColor` | `string` | `'white'` | Color of the vertical line           |
| `circleColor`    | `string` | `'white'` | Border color of the indicator circle |

### `<LineChart.Tooltip.Value />`

Displays the current interpolated value (price, score, etc).

Interface: [`LineChartTooltipValuePropsInterface`](./interfaces/LineChartInterfaces.md#linecharttooltipvaluepropsinterface)

| Prop             | Type                        | Default                                | Description             |
| ---------------- | --------------------------- | -------------------------------------- | ----------------------- |
| `format`         | `(value: number) => string` | `(value) => \`$ ${value.toFixed(2)}\`` | Format function         |
| `style`          | `StyleProp<TextStyle>`      | `undefined`                            | Inner text style        |
| `containerStyle` | `StyleProp<ViewStyle>`      | `undefined`                            | Tooltip container style |

### `<LineChart.Tooltip.Date />`

Displays the current date/time.

Interface: [`LineChartTooltipDatePropsInterface`](./interfaces/LineChartInterfaces.md#linecharttooltipdatepropsinterface)

| Prop             | Type                        | Default      | Description             |
| ---------------- | --------------------------- | ------------ | ----------------------- |
| `style`          | `StyleProp<TextStyle>`      | `undefined`  | Inner text style        |
| `containerStyle` | `StyleProp<ViewStyle>`      | `undefined`  | Tooltip container style |
| `format`         | `(value: number) => string` | `DD/MM/YYYY` | Timestamp formatter     |
