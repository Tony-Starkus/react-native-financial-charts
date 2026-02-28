# 🧩 LineChart Interfaces

Type interfaces related to LineChart and its subcomponents.

## Import

```tsx
import type {
  LineChartDataPoint,
  LineChartContextValue,
  LineChartRootPropsInterface,
  LineChartAreaPropsInterface,
  LineChartLinePropsInterface,
  LineChartCursorPropsInterface,
  LineChartBaselinePropsInterface,
  LineChartTooltipValuePropsInterface,
  LineChartTooltipDatePropsInterface,
} from 'react-native-financial-charts';
```

## `LineChartDataPoint`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `timestamp` | `number` | Yes | X-axis time (milliseconds). |
| `value` | `number` | Yes | Y-axis value. |

## `LineChartRootPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | `LineChartDataPoint[]` | Yes | Data series used to build line/area/interaction maps. |
| `width` | `number` | No | Chart width. |
| `height` | `number` | No | Chart height. |
| `padding` | `number` | No | Horizontal padding used for drawing and clamping gestures. |
| `containerStyle` | `StyleProp<ViewStyle>` | No | Container style for `LineChart.Root`. |
| `children` | `React.ReactNode` | Yes | Chart composition (`Canvas`, `Line`, `Area`, etc). |

## `LineChartAreaPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `gradientColors` | `string[]` | No | Area gradient color stops. |

## `LineChartLinePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `strokeWidth` | `number` | No | Line stroke width. |
| `colors` | `string[]` | No | Gradient color stops for the line stroke. |

## `LineChartCursorPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `crosshairColor` | `string` | No | Vertical cursor line color. |
| `circleColor` | `string` | No | Outer cursor ring color. |

## `LineChartBaselinePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `color` | `string` | No | Baseline line and dot color. |
| `showLabel` | `boolean` | No | Shows/hides the baseline value chip. |

## `LineChartTooltipValuePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `style` | `StyleProp<TextStyle>` | No | Text style for value tooltip. |
| `containerStyle` | `StyleProp<ViewStyle>` | No | Container style for value tooltip. |
| `format` | `(value: number) => string` | No | Value formatter. |

## `LineChartTooltipDatePropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `style` | `StyleProp<TextStyle>` | No | Text style for date tooltip. |
| `containerStyle` | `StyleProp<ViewStyle>` | No | Container style for date tooltip. |
| `format` | `(value: number) => string` | No | Timestamp formatter. |

## `LineChartContextValue`

Advanced context type consumed internally by LineChart subcomponents.
It includes scales, generated paths, gesture shared values, and lookup maps.
