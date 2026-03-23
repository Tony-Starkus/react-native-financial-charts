# 🧩 CandlestickChart Interfaces

Type interfaces related to CandlestickChart and its subcomponents.

## Import

```tsx
import type {
  CandlestickChartDataPoint,
  CandlestickChartRootPropsInterface,
  CandlestickChartRef,
  CandlestickChartRefSelectedIndexOptions,
  CandlestickChartCandlesPropsInterface,
  CandlestickChartCanvasPropsInterface,
  CandlestickChartGridPropsInterface,
  CandlestickChartYAxisPropsInterface,
  CandlestickChartCursorPropsInterface,
  CandlestickChartLastPricePropsInterface,
  CandlestickChartTooltipOHLCPropsInterface,
  CandlestickChartTooltipDatePropsInterface,
} from 'react-native-financial-charts';
```

## `CandlestickChartDataPoint`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `timestamp` | `number` | Yes | Candle timestamp in milliseconds. |
| `open` | `number` | Yes | Opening price. |
| `high` | `number` | Yes | Highest price. |
| `low` | `number` | Yes | Lowest price. |
| `close` | `number` | Yes | Closing price. |
| `color` | `string` | No | Per-candle color override. |
| `meta` | `any` | No | Optional app-specific metadata. |

## `CandlestickChartRootPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | `CandlestickChartDataPoint[]` | Yes | OHLC dataset rendered by the chart. Entries with non-finite numeric fields are ignored. |
| `width` | `number` | No | Chart width. |
| `height` | `number` | No | Chart height. |
| `candleWidth` | `number` | No | Candle body width. |
| `spacing` | `number` | No | Space between candles. |
| `scrollToTheEnd` | `boolean` | No | Auto-scrolls to the latest candle on mount and when `data` changes. |
| `isScrollable` | `boolean` | No | Enables horizontal scrolling only. |
| `selectable` | `boolean` | No | Enables candle selection by tap. |
| `yAxisTicksCount` | `number` | No | Tick count used for Y-axis/grid generation. |
| `bullishColor` | `string` | No | Default color for bullish candles. |
| `bearishColor` | `string` | No | Default color for bearish candles. |
| `activeBorderColor` | `string` | No | Selected candle border color. |
| `activeBorderWidth` | `number` | No | Selected candle border width. |
| `font` | `SkFont \| null` | No | Optional font override for labels/tooltips. |
| `onCandlePress` | `(item: CandlestickChartDataPoint \| null, index: number) => void` | No | Callback fired on selection/deselection, including `ref.selectedIndex(...)`. |
| `children` | `React.ReactNode` | Yes | Chart composition (`Canvas`, `Candles`, etc). |

## `CandlestickChartRefSelectedIndexOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `scrollToCandle` | `boolean` | No | Auto-scrolls to center the selected candle. |
| `animatedScroll` | `boolean` | No | Controls the auto-scroll animation. |

## `CandlestickChartRef`

| Method | Type | Description |
| --- | --- | --- |
| `scrollToStart` | `(animated?: boolean) => void` | Scrolls to the first visible candle. |
| `scrollToEnd` | `(animated?: boolean) => void` | Scrolls to the last visible candle. |
| `scrollToIndex` | `(index: number, animated?: boolean) => void` | Scrolls to an index-based candle position. |
| `selectedIndex` | `(index: number, options?: CandlestickChartRefSelectedIndexOptions) => void` | Selects/deselects a candle by index in the rendered dataset (`-1` clears). |

## `CandlestickChartCanvasPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | Yes | Skia children rendered inside the chart canvas. |
| `style` | `ViewStyle` | No | Optional canvas container styles. |

## `CandlestickChartCandlesPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `wickWidth` | `number` | No | Wick width in pixels. |
| `candleBorderRadius` | `number` | No | Candle body border radius. |
| `minBodyHeight` | `number` | No | Minimum visible body height. |

## `CandlestickChartGridPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `lineColor` | `string` | No | Grid line color. |
| `lineWidth` | `number` | No | Grid line thickness. |
| `dashEffect` | `number[]` | No | Dash pattern (`[dash, gap]`). |

## `CandlestickChartYAxisPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `width` | `number` | No | Reserved width for the Y-axis sidebar. |
| `labelColor` | `string` | No | Label text color. |
| `labelAlignment` | `'left' \| 'right'` | No | Horizontal alignment for Y-axis labels. |
| `labelOffsetX` | `number` | No | Horizontal label offset. |
| `labelYOffset` | `number` | No | Vertical label offset. |
| `snapToPixel` | `boolean` | No | Rounds Y positions to the nearest pixel. |
| `labelBackgroundColor` | `string` | No | Label background color. |
| `labelBorderRadius` | `number` | No | Label background radius. |
| `labelPadding` | `number` | No | Label background padding. |
| `formatLabel` | `(value: number) => string` | No | Numeric label formatter. |

## `CandlestickChartCursorPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `lineColor` | `string` | No | Vertical cursor line color. |
| `lineWidth` | `number` | No | Cursor line thickness. |

## `CandlestickChartLastPricePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `lineColor` | `string` | No | Optional override for the horizontal last price line and the price pill. |
| `lineWidth` | `number` | No | Last price line thickness. |
| `dashEffect` | `number[]` | No | Dash pattern for the horizontal line. |
| `textColor` | `string` | No | Last price label text color. |
| `labelBackgroundColor` | `string` | No | Background color of the price pill. Defaults to a darkened version of the line color. |
| `labelBorderRadius` | `number` | No | Price pill border radius. |
| `labelPaddingHorizontal` | `number` | No | Horizontal padding inside the price pill. Defaults to the Y-axis inset when a `YAxis` is mounted, otherwise `8`. |
| `labelPaddingVertical` | `number` | No | Vertical padding inside the price pill. Defaults to the `YAxis` padding when a background is used, otherwise `4`. |
| `rightOffset` | `number` | No | Additional horizontal offset applied from the current aligned edge. |
| `formatLabel` | `(value: number) => string` | No | Formatter for the last close price shown in the pill. |

## `CandlestickChartTooltipOHLCPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `backgroundColor` | `string` | No | Tooltip background color. |
| `textColor` | `string` | No | Tooltip text color. |
| `offsetY` | `number` | No | Vertical offset from the top area. |
| `font` | `SkFont` | No | Optional tooltip font override. |
| `format` | `(item: CandlestickChartDataPoint) => string` | No | OHLC formatter. Runs on the UI thread. |

## `CandlestickChartTooltipDatePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `backgroundColor` | `string` | No | Tooltip background color. |
| `textColor` | `string` | No | Tooltip text color. |
| `offsetY` | `number` | No | Vertical offset from the bottom area. |
| `font` | `SkFont` | No | Optional tooltip font override. |
| `format` | `(timestamp: number) => string` | No | Date formatter. Runs on the UI thread. |
