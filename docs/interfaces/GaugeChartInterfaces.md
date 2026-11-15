# 🧩 GaugeChart Interfaces

Type interfaces related to GaugeChart and its subcomponents.

## Import

```tsx
import type {
  GaugeSegment,
  GaugeChartRootPropsInterface,
  GaugeChartCanvasPropsInterface,
  GaugeChartTrackPropsInterface,
  GaugeChartSegmentsPropsInterface,
  GaugeChartProgressPropsInterface,
  GaugeChartNeedlePropsInterface,
  GaugeChartTicksPropsInterface,
  GaugeChartValuePropsInterface,
} from 'react-native-financial-charts';
```

## `GaugeSegment`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | `number` | Yes | Range start (clamped to `[min, max]`). |
| `to` | `number` | Yes | Range end (clamped to `[min, max]`). |
| `color` | `string` | Yes | Segment color. |
| `label` | `string` | No | Descriptive label. |

## `GaugeChartRootPropsInterface`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | Yes | — | Current value (clamped to `[min, max]`). |
| `min` | `number` | No | `0` | Range minimum. |
| `max` | `number` | No | `100` | Range maximum. |
| `width` | `number` | No | `300` | Chart width. |
| `height` | `number` | No | derived | Fixed height. When omitted, derived from the arc bounds. |
| `startAngle` | `number` | No | `135` | Arc start in degrees (0 = 3 o'clock, clockwise). |
| `endAngle` | `number` | No | `405` | Arc end in degrees. Wraps by 360 when `<= startAngle`. |
| `strokeWidth` | `number` | No | `20` | Default arc thickness. |
| `padding` | `number` | No | `8` | Extra space around the arc. |
| `segments` | `GaugeSegment[]` | No | `[]` | Colored ranges. |
| `animated` | `boolean` | No | `true` | Animates value changes and the initial sweep. |
| `animationDuration` | `number` | No | `600` | Animation duration in ms. |
| `containerStyle` | `StyleProp<ViewStyle>` | No | — | Root container style. |
| `children` | `React.ReactNode` | Yes | — | Chart composition. |

## `GaugeChartCanvasPropsInterface`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | Yes | Skia children. |
| `style` | `StyleProp<ViewStyle>` | No | Canvas wrapper style. |

## `GaugeChartTrackPropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `string` | `'#1F2937'` | Track color. |
| `strokeWidth` | `number` | Root `strokeWidth` | Arc thickness. |
| `strokeCap` | `'round' \| 'butt' \| 'square'` | `'round'` | Arc end cap. |
| `opacity` | `number` | `1` | Track opacity. |

## `GaugeChartSegmentsPropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `strokeWidth` | `number` | Root `strokeWidth` | Arc thickness. |
| `gapAngle` | `number` | `0` | Gap between adjacent segments, in degrees. |
| `strokeCap` | `'round' \| 'butt' \| 'square'` | `'butt'` | Segment end cap. |
| `opacity` | `number` | `1` | Segments opacity. |

## `GaugeChartProgressPropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `string` | `'#22C55E'` | Progress color (fallback when `colorBySegment`). |
| `colorBySegment` | `boolean` | `false` | Uses the color of the segment containing the value. |
| `strokeWidth` | `number` | Root `strokeWidth` | Arc thickness. |
| `strokeCap` | `'round' \| 'butt' \| 'square'` | `'round'` | Arc end cap. |

## `GaugeChartNeedlePropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `string` | `'#F8FAFC'` | Needle color (fallback when `colorBySegment`). |
| `colorBySegment` | `boolean` | `false` | Uses the color of the segment containing the value. |
| `lengthRatio` | `number` | `0.8` | Needle length relative to the arc radius. |
| `tailLength` | `number` | `0` | Length behind the pivot, in pixels. |
| `strokeWidth` | `number` | `4` | Needle thickness. |
| `pivotRadius` | `number` | `8` | Pivot circle radius (`0` hides it). |
| `pivotColor` | `string` | needle color | Pivot color. |

## `GaugeChartTicksPropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | `10` | Intervals between `min` and `max` (`count + 1` ticks). |
| `color` | `string` | `'#64748B'` | Tick color. |
| `length` | `number` | `8` | Tick length (`0` hides the marks). |
| `strokeWidth` | `number` | `2` | Tick thickness. |
| `offset` | `number` | `4` | Distance from the inner edge of the arc. |
| `showLabels` | `boolean` | `false` | Renders tick labels. |
| `labelColor` | `string` | tick color | Label color. |
| `labelOffset` | `number` | `10` | Distance between tick end and label center. |
| `font` | `SkFont \| null` | system 10px | Skia font for labels. |
| `format` | `(value: number) => string` | integer / 1 decimal | Label formatter (JS thread). |

## `GaugeChartValuePropsInterface`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `format` | `(value: number) => string` | rounded integer | Formatter. **Must be a worklet** (UI thread). |
| `offsetY` | `number` | `radius * 0.35` | Vertical offset from the arc center. |
| `style` | `StyleProp<TextStyle>` | — | Text style. |
| `containerStyle` | `StyleProp<ViewStyle>` | — | Container style. |
