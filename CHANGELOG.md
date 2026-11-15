# Changelog

## 3.0.0 (2026-11-15)

### ⚠️ Breaking Changes

#### 1. `BarChartRef.selectedIndex()` now fires `onBarPress`

Before, selecting a bar via ref only updated the chart visually. Now all imperative selection methods behave exactly like a tap, matching `PieChart` and `CandlestickChart`:

- `selectedIndex(index)` calls `onBarPress(item, index)`.
- `selectedIndex(-1)` calls `onBarPress(null, -1)`.

**Who is affected:** apps that call `chartRef.current?.selectedIndex(...)` **and** also update their own state right after it, or that have side effects in `onBarPress` (analytics, navigation, haptics) that should only run on taps.

**Migration:** remove the duplicated state update and let `onBarPress` handle it.

```tsx
// Before (2.x)
chartRef.current?.selectedIndex(3);
setSelected(data[3]); // manual sync

// After (3.0)
chartRef.current?.selectedIndex(3); // onBarPress(data[3], 3) updates state
```

If you need selection without callbacks, use controlled mode instead: pass `selectedKey` and change it from your state. Prop changes never fire `onBarPress`.

#### 2. `BarChartRef` and `PieChartRef` have new required methods

| Type          | New methods                      |
| ------------- | -------------------------------- |
| `BarChartRef` | `selectByKey`, `clearSelection`, `selectSeries` |
| `PieChartRef` | `selectByKey`                    |

**Who is affected:** only TypeScript code that builds objects typed as these refs (test mocks, wrapper components that forward a custom ref). Code that only reads `useRef<BarChartRef>(null)` is unaffected.

**Migration:** add the new methods to your mocks/wrappers.

```ts
const mockRef: BarChartRef = {
  scrollToStart: jest.fn(),
  scrollToEnd: jest.fn(),
  scrollToIndex: jest.fn(),
  selectedIndex: jest.fn(),
  selectByKey: jest.fn(), // new
  clearSelection: jest.fn(), // new
  selectSeries: jest.fn(), // new
};
```

#### 3. `PieChart` keeps the selection when `data` is recreated with the same content

Before, any new `data` array reference (for example an inline `data={items.map(...)}` re-created on every render) reset the selected slice. Now the uncontrolled selection resets only when the rendered slices actually change (key, value or aggregation).

**Who is affected:** apps that relied on passing a new array reference to clear the selection.

**Migration:** clear it explicitly.

```tsx
chartRef.current?.clearSelection();
```

### ✨ Added

- **BarChart: stacked bars.** `BarChartItemDataInterface.segments` draws several values in the same bar (bottom → top). The item `value` is recalculated as the segment total, so the Y scale, tooltip, value labels and `onBarPress` use the stack total. New `segmentGap` prop on `<BarChart.Root />`.
- **BarChart: controlled selection.** New `selectedKey` and `scrollToSelectedBar` props on `<BarChart.Root />`, `id` on items, and `selectByKey` / `clearSelection` on `BarChartRef`.
- **BarChart: segment selection.** `selectionMode="segment"` on `<BarChart.Root />` makes a tap select the tapped segment of a stacked bar instead of the whole column. `onBarPress` and `Tooltip.format` receive `segmentIndex` as an extra argument (`-1` for the whole bar). Controlled via `selectedSegmentKey`; imperative via the `segmentIndex` / `segmentKey` ref options. Segments accept an optional `id`.
- **BarChart: series highlight.** `selectionMode="series"` highlights one series (segment `id ?? label`) across all bars and dims the others, with an animated transition. Controlled via `selectedSeriesKey` + `onSeriesSelect`, imperative via `ref.selectSeries`. Dimming style via `inactiveSegmentColor` / `inactiveSegmentOpacity` on `<BarChart.Bar />`.
- **BarChart: highlighted X-axis label.** `highlighted: true` on an item emphasizes its label (e.g. current month), styled via `highlightedLabelColor` / `highlightedLabelFont` on `<BarChart.Bar />`.
- **BarChart: formatter context.** `Tooltip.format` and `Bar.formatValueLabel` receive the full `item` as their last argument (useful to show the segment breakdown). Existing formatters keep working.
- **PieChart: controlled selection.** New `selectedKey` prop on `<PieChart.Root />`, `id` on items, and `selectByKey` on `PieChartRef`. Keys of items merged into "Others" select the aggregated slice.
- **PieChart:** `onSelect` items expose `sourceIndex`, the index in the original `data` prop (undefined for "Others").
- **GaugeChart:** new single-value arc gauge (`Track`, `Segments`, `Progress`, `Needle`, `Ticks`, `Value`).
- New exported types: `BarChartItemKey`, `BarChartSegmentInterface`, `BarChartSelectionMode`, `PieChartItemKey`.

### 🐛 Fixed

- **BarChart:** an uncontrolled selection pointing past the end of `data` (after the dataset shrinks) is now cleared instead of staying stale.

### Controlled mode at a glance

Both charts follow the same rules:

| `selectedKey` | Mode | Tap / ref call | Visual selection |
| --- | --- | --- | --- |
| `undefined` (default) | Uncontrolled | Updates selection and fires the callback | Follows taps / ref |
| `null` | Controlled | Only fires the callback | Nothing selected |
| key | Controlled | Only fires the callback | Slice/bar matching the key (`id`, fallback `label`) |
