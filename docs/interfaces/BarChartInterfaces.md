# 🧩 BarChart Interfaces

Type interfaces related to BarChart and its subcomponents.

## Import

```tsx
import type {
  BarChartItemDataInterface,
  BarChartRootPropsInterface,
  BarChartRef,
  BarChartRefSelectedIndexPropsType,
  BarChartBarPropsInterface,
  BarChartGridPropsInterface,
  BarChartTooltipPropsInterface,
  BarChartYAXisPropsInterface,
} from 'react-native-financial-charts';
```

## `BarChartItemDataInterface`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | X-axis label for the bar. |
| `value` | `number` | Yes | Numeric value used to calculate bar height. |
| `color` | `string` | No | Per-item color override. |
| `meta` | `any` | No | Optional custom metadata for app-side usage. |

## `BarChartRootPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | `BarChartItemDataInterface[]` | Yes | Data list rendered by the chart. |
| `height` | `number` | No | Chart height. |
| `width` | `number` | No | Chart width. |
| `scrollToTheEnd` | `boolean` | No | Auto-scrolls to end on load/update (with `isScrollable`). |
| `yAxisTicksCount` | `number` | No | Tick count used for Y-axis/grid calculation. |
| `isLoading` | `boolean` | No | Enables skeleton mode. |
| `barWidth` | `number` | No | Fixed bar width in scroll mode. |
| `spacing` | `number` | No | Space between bars. |
| `barColor` | `string` | No | Default bar color when item color is missing. |
| `activeBorderColor` | `string` | No | Selected bar border color. |
| `activeBorderWidth` | `number` | No | Selected bar border width. |
| `font` | `SkFont \| null` | No | Skia font used for labels. |
| `isScrollable` | `boolean` | No | Enables horizontal scroll. |
| `selectable` | `boolean` | No | Enables selection by tap. |
| `showXAxis` | `boolean` | No | Shows bottom labels. |
| `verticalScaleFactor` | `number` | No | Vertical scale for bars (`0.1` to `1.0`). |
| `onBarPress` | `(item: BarChartItemDataInterface \| null, index: number) => void` | No | Callback fired on selection/deselection (requires `selectable={true}`). |
| `children` | `React.ReactNode` | Yes | Chart composition (`Canvas`, `Bar`, etc). |

## `BarChartRefSelectedIndexPropsType`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `scrollToBar` | `boolean` | No | Auto-scrolls to center selected bar. |
| `animatedScroll` | `boolean` | No | Controls animation when auto-scrolling. |

## `BarChartRef`

| Method | Type | Description |
| --- | --- | --- |
| `scrollToStart` | `(animated?: boolean) => void` | Scrolls to start. |
| `scrollToEnd` | `(animated?: boolean) => void` | Scrolls to end. |
| `scrollToIndex` | `(index: number, animated?: boolean) => void` | Scrolls to an index-based X position. |
| `selectedIndex` | `(index: number, options?: BarChartRefSelectedIndexPropsType) => void` | Selects/deselects bar by index (`-1` clears). |

## `BarChartBarPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `labelPaddingTop` | `number` | No | Bottom-label vertical padding. |
| `labelColor` | `string` | No | Bottom-label color. |
| `barBorderRadius` | `number` | No | Bar corner radius. |
| `showValueLabels` | `boolean` | No | Shows value labels above bars. |
| `valueLabelColor` | `string` | No | Value-label color. |
| `valueLabelPaddingBottom` | `number` | No | Value-label offset from bar top. |
| `formatValueLabel` | `(value: number) => string` | No | Formats value labels. |

## `BarChartGridPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `lineColor` | `string` | No | Horizontal grid line color. |
| `lineWidth` | `number` | No | Horizontal grid line width. |
| `dashEffect` | `number[]` | No | Dash pattern (`[dash, gap]`). |

## `BarChartTooltipPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `backgroundColor` | `string` | No | Tooltip bubble background color. |
| `textColor` | `string` | No | Tooltip text color. |
| `offsetY` | `number` | No | Tooltip vertical offset from bar top. |
| `font` | `SkFont` | No | Optional tooltip font override. |
| `format` | `(value: number, label: string) => string` | No | Tooltip text formatter. |

## `BarChartYAXisPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `width` | `number` | No | Layout width reserved for Y-axis sidebar in `BarChart.Root`. |
| `labelColor` | `string` | No | Label text color. |
| `labelOffsetX` | `number` | No | Horizontal text offset. |
| `labelYOffset` | `number` | No | Vertical text offset. |
| `snapToPixel` | `boolean` | No | Rounds Y position to nearest pixel. |
| `labelBackgroundColor` | `string` | No | Label background color. |
| `labelBorderRadius` | `number` | No | Label background radius. |
| `labelPadding` | `number` | No | Label background padding. |
| `formatLabel` | `(value: number) => string` | No | Numeric label formatter. |
