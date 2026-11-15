# 🧩 BarChart Interfaces

Type interfaces related to BarChart and its subcomponents.

## Import

```tsx
import type {
  BarChartItemDataInterface,
  BarChartItemKey,
  BarChartSegmentInterface,
  BarChartSelectionMode,
  BarChartRootPropsInterface,
  BarChartRef,
  BarChartRefSelectedIndexPropsType,
  BarChartBarPropsInterface,
  BarChartGridPropsInterface,
  BarChartTooltipPropsInterface,
  BarChartYAXisPropsInterface,
} from 'react-native-financial-charts';
```

## `BarChartItemKey`

`string | number` — key used to address a bar from outside the chart (`item.id`, or `item.label` as fallback).

## `BarChartItemDataInterface`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `BarChartItemKey` | No | Stable identifier for external selection. Falls back to `label`. |
| `label` | `string` | Yes | X-axis label for the bar. |
| `value` | `number` | Yes | Numeric value used to calculate bar height. Recalculated as the sum of `segments` when they are provided. |
| `color` | `string` | No | Per-item color override. |
| `segments` | `BarChartSegmentInterface[]` | No | Stacked segments, drawn bottom -> top in array order. |
| `highlighted` | `boolean` | No | Highlights the X-axis label (e.g. current month). Independent from selection. |
| `meta` | `any` | No | Optional custom metadata for app-side usage. |

## `BarChartSegmentInterface`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `BarChartItemKey` | No | Stable identifier for external segment selection. Falls back to `label`. |
| `value` | `number` | Yes | Segment magnitude. Negative values are treated as `0`. |
| `color` | `string` | No | Segment color. Falls back to item `color`, then `barColor`. |
| `label` | `string` | No | Segment label (e.g. series name) for app-side usage. |
| `meta` | `any` | No | Optional custom metadata. |

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
| `onBarPress` | `(item: BarChartItemDataInterface \| null, index: number, segmentIndex: number) => void` | No | Callback fired on selection/deselection (requires `selectable={true}`). `segmentIndex` is `-1` unless a segment is selected. |
| `selectionMode` | `BarChartSelectionMode` | No | `'bar'` (default) selects the whole column; `'segment'` selects the tapped segment; `'series'` highlights the tapped segment's series across all bars. |
| `selectedSeriesKey` | `BarChartItemKey \| null` | No | Controlled highlighted series (series mode only). |
| `onSeriesSelect` | `(key: BarChartItemKey \| null) => void` | No | Series selection/deselection callback (series mode only). |
| `selectedSegmentKey` | `BarChartItemKey \| null` | No | Controlled segment inside the bar selected by `selectedKey` (segment mode only). |
| `selectedKey` | `BarChartItemKey \| null` | No | Controlled selection. `undefined` = uncontrolled, `null` = none selected. |
| `scrollToSelectedBar` | `boolean` | No | Centers the bar selected via `selectedKey` (requires `isScrollable`). |
| `children` | `React.ReactNode` | Yes | Chart composition (`Canvas`, `Bar`, etc). |

## `BarChartRefSelectedIndexPropsType`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `scrollToBar` | `boolean` | No | Auto-scrolls to center selected bar. |
| `animatedScroll` | `boolean` | No | Controls animation when auto-scrolling. |
| `segmentIndex` | `number` | No | Segment to select with `selectedIndex` (segment mode only). |
| `segmentKey` | `BarChartItemKey \| null` | No | Segment key to select with `selectByKey` (segment mode only). |

## `BarChartSelectionMode`

`'bar' | 'segment' | 'series'` — what a tap selects on stacked bars.

## `BarChartRef`

| Method | Type | Description |
| --- | --- | --- |
| `scrollToStart` | `(animated?: boolean) => void` | Scrolls to start. |
| `scrollToEnd` | `(animated?: boolean) => void` | Scrolls to end. |
| `scrollToIndex` | `(index: number, animated?: boolean) => void` | Scrolls to an index-based X position. |
| `selectedIndex` | `(index: number, options?: BarChartRefSelectedIndexPropsType) => void` | Selects/deselects bar by index (`-1` clears). Fires `onBarPress`. |
| `selectByKey` | `(key: BarChartItemKey \| null, options?: BarChartRefSelectedIndexPropsType) => void` | Selects by key (`id`, fallback `label`). Fires `onBarPress`. |
| `clearSelection` | `() => void` | Clears current selection. Fires `onBarPress(null, -1)` (or `onSeriesSelect(null)` in series mode). |
| `selectSeries` | `(key: BarChartItemKey \| null) => void` | Highlights a series (series mode only). Fires `onSeriesSelect`. |

## `BarChartBarPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `labelPaddingTop` | `number` | No | Bottom-label vertical padding. |
| `labelColor` | `string` | No | Bottom-label color. |
| `barBorderRadius` | `number` | No | Bar corner radius. |
| `showValueLabels` | `boolean` | No | Shows value labels above bars. |
| `valueLabelColor` | `string` | No | Value-label color. |
| `valueLabelPaddingBottom` | `number` | No | Value-label offset from bar top. |
| `formatValueLabel` | `(value: number, item: BarChartItemDataInterface) => string` | No | Formats value labels. |
| `highlightedLabelColor` | `string` | No | X-axis label color for `highlighted` items. |
| `highlightedLabelFont` | `SkFont \| null` | No | Optional font for highlighted X-axis labels. |
| `inactiveSegmentColor` | `string` | No | Series mode: color cross-faded over inactive segments. |
| `inactiveSegmentOpacity` | `number` | No | Series mode: opacity of inactive segments without `inactiveSegmentColor`. |
| `segmentGap` | `number` | No | Gap in pixels between stacked segments. |

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
| `format` | `(value: number, label: string, item: BarChartItemDataInterface, segmentIndex: number) => string` | No | Tooltip text formatter. |

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
