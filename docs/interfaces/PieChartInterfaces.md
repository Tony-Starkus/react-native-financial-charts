# 🧩 PieChart Interfaces

Type interfaces related to PieChart and its subcomponents.

## Import

```tsx
import type {
  PieChartItem,
  PieChartRootPropsInterface,
  PieChartRef,
  PieChartCanvasPropsInterface,
  PieChartSlicesPropsInterface,
} from 'react-native-financial-charts';
```

## `PieChartItem`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | No | Slice label. |
| `value` | `number` | Yes | Slice numeric value. |
| `color` | `string` | No | Slice color (fallback generated when missing). |
| `isAggregated` | `boolean` | No | Marks aggregated "Others" slice (internal/derived). |
| `groupedItems` | `PieChartItem[]` | No | Source grouped items for aggregated slice (internal/derived). |
| `renderValue` | `number` | No | Internal visual weight used for rendering. |

## `PieChartRootPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | `PieChartItem[]` | Yes | Source data. |
| `size` | `number` | No | Chart size (square: width and height). |
| `donutRatio` | `number` | No | Inner radius ratio for donut mode. |
| `startAngle` | `number` | No | Start angle in degrees. |
| `direction` | `'clockwise' \| 'counterclockwise'` | No | Slice direction. |
| `sliceGapAngle` | `number` | No | Gap angle between slices. |
| `onSelect` | `(item: PieChartItem \| null, index: number) => void` | No | Selection/deselection callback. |
| `onSelectAggregated` | `(item: PieChartItem, index: number, groupedItems: PieChartItem[]) => void` | No | Callback for aggregated slice selection. |
| `maxSlices` | `number` | No | Hard limit for rendered slices (including "Others"). |
| `minSliceAngle` | `number` | No | Minimum standalone slice angle before aggregation. |
| `othersLabel` | `string` | No | Label for aggregated slice. |
| `othersColor` | `string` | No | Color for aggregated slice. |
| `othersVisualAngle` | `number` | No | Optional visual angle override for aggregated slice. |
| `children` | `React.ReactNode` | Yes | Chart composition (`Canvas`, `Slices`, etc). |

## `PieChartRef`

| Method | Type | Description |
| --- | --- | --- |
| `selectedIndex` | `(index: number) => void` | Selects a slice by index (`-1` clears). Index is based on processed/rendered data (after aggregation). |
| `clearSelection` | `() => void` | Clears current selection. |

## `PieChartCanvasPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | Yes | Skia children (usually `PieChart.Slices`). |
| `rounded` | `boolean` | No | Enables rounded donut corners. |
| `sliceThickness` | `number` | No | Arc thickness. |
| `sliceGapAngle` | `number` | No | Slice gap in degrees. |
| `selectedSliceOffset` | `number` | No | Selected slice radial offset. |
| `minDonutHoleRatio` | `number` | No | Donut-to-pie switch threshold. |
| `selectable` | `boolean` | No | Enables tap selection gesture. |

## `PieChartSlicesPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `rounded` | `boolean` | No | Enables rounded donut corners. |
| `sliceThickness` | `number` | No | Arc thickness override. |
| `sliceGapAngle` | `number` | No | Slice gap override in degrees. |
| `selectedSliceOffset` | `number` | No | Selection offset override. |
| `minDonutHoleRatio` | `number` | No | Donut-to-pie switch threshold override. |
