# 📈 React Native Financial Charts - Gauge Chart

The GaugeChart renders a single value on an arc, built for KPIs such as risk scores, portfolio allocation targets, credit scores or budget usage.
It supports a background track, colored segments, an animated progress arc, an animated needle, ticks with labels, and an animated value label. Everything animates on the UI thread with Reanimated.

## ⚡ Basic Usage

```tsx
import React from 'react';
import { GaugeChart } from 'react-native-financial-charts';

export default function App() {
  return (
    <GaugeChart.Root value={72} width={300}>
      <GaugeChart.Canvas>
        <GaugeChart.Track />
        <GaugeChart.Progress />
        <GaugeChart.Needle />
      </GaugeChart.Canvas>
      <GaugeChart.Value />
    </GaugeChart.Root>
  );
}
```

> `GaugeChart.Value` is a React Native view. Render it inside `Root` but **outside** `Canvas`.
> The gauge has no gestures, so `GestureHandlerRootView` is not required.

## 📐 Angles

Angles are in degrees and follow the Skia convention: `0` is 3 o'clock, angles grow **clockwise** (`90` = 6 o'clock, `180` = 9 o'clock, `270` = 12 o'clock).

| Shape | `startAngle` | `endAngle` |
| --- | --- | --- |
| Speedometer (default, 270°) | `135` | `405` |
| Semicircle (top half) | `180` | `360` |
| Full circle | `270` | `630` |

If `endAngle <= startAngle`, it wraps by 360 (`135 -> 45` equals `135 -> 405`).
The chart height is derived from the arc's bounding box, so a semicircle takes about half the height of a full circle. Pass `height` to force a fixed size.

## 💡 Examples

### 1. Risk Score With Segments

```tsx
import { GaugeChart } from 'react-native-financial-charts';
import type { GaugeSegment } from 'react-native-financial-charts';

const segments: GaugeSegment[] = [
  { from: 0, to: 30, color: '#22C55E', label: 'Low' },
  { from: 30, to: 70, color: '#F59E0B', label: 'Medium' },
  { from: 70, to: 100, color: '#EF4444', label: 'High' },
];

<GaugeChart.Root value={58} segments={segments} width={320}>
  <GaugeChart.Canvas>
    <GaugeChart.Segments gapAngle={3} />
    <GaugeChart.Ticks count={10} showLabels />
    <GaugeChart.Needle colorBySegment pivotColor="#F8FAFC" />
  </GaugeChart.Canvas>
  <GaugeChart.Value />
</GaugeChart.Root>;
```

### 2. Semicircle Budget Usage

```tsx
<GaugeChart.Root
  value={spent}
  max={budget}
  startAngle={180}
  endAngle={360}
  strokeWidth={16}
  width={300}
>
  <GaugeChart.Canvas>
    <GaugeChart.Track color="#1E293B" />
    <GaugeChart.Progress color="#38BDF8" />
  </GaugeChart.Canvas>
  <GaugeChart.Value
    offsetY={-30}
    format={(v) => {
      'worklet';
      return `$ ${v.toFixed(0)}`;
    }}
  />
</GaugeChart.Root>;
```

### 3. Progress Colored By Segment

```tsx
<GaugeChart.Root value={score} min={300} max={850} segments={creditSegments}>
  <GaugeChart.Canvas>
    <GaugeChart.Track />
    <GaugeChart.Progress colorBySegment />
  </GaugeChart.Canvas>
  <GaugeChart.Value />
</GaugeChart.Root>;
```

## 🧩 Components

| Component | Where | Description |
| --- | --- | --- |
| `GaugeChart.Root` | — | Provider. Receives `value`, range, geometry and `segments`. |
| `GaugeChart.Canvas` | inside `Root` | Skia canvas. Re-provides the context to Skia children. |
| `GaugeChart.Track` | inside `Canvas` | Full background arc. |
| `GaugeChart.Segments` | inside `Canvas` | Draws `Root.segments` as colored arcs. |
| `GaugeChart.Progress` | inside `Canvas` | Animated arc from `min` to the current value. |
| `GaugeChart.Needle` | inside `Canvas` | Animated needle with pivot. |
| `GaugeChart.Ticks` | inside `Canvas` | Tick marks and optional labels inside the arc. |
| `GaugeChart.Value` | inside `Root`, outside `Canvas` | Animated numeric label. |

Children are drawn in order, so put `Needle` last to keep it on top.

## ⚙️ Behavior

- `value` is clamped to `[min, max]`. Non-finite values, or `max <= min`, draw as `min` (progress `0`).
- With `animated` (default), the gauge sweeps from `min` on mount and animates every value change with `animationDuration` ms.
- Segments are clamped to `[min, max]`, sorted by `from`, and segments with an empty range are dropped.
- With `colorBySegment`, a value exactly on a boundary uses the later segment; `max` uses the last segment. Outside every segment, the component's own `color` is used.
- `GaugeChart.Value` `format` runs on the UI thread and must be a worklet. `GaugeChart.Ticks` `format` runs on the JS thread and can use any API (e.g. `Intl`).

See the full type reference in [GaugeChart Interfaces](./interfaces/GaugeChartInterfaces.md).
