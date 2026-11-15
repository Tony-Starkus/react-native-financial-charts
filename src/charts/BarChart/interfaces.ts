import type { SkFont } from '@shopify/react-native-skia';

/** Key used to select a bar from outside the chart (`id`, or `label` as fallback). */
export type BarChartItemKey = string | number;

/**
 * A single segment of a stacked bar.
 * Segments are drawn bottom -> top in array order.
 */
export interface BarChartSegmentInterface {
  /**
   * Optional stable identifier used for external segment selection
   * (`selectedSegmentKey` / ref `segmentKey`). Falls back to `label`.
   */
  id?: BarChartItemKey;
  /** Non-negative magnitude of this segment. Negative values are treated as 0. */
  value: number;
  /** Segment color. Falls back to the item color, then to `barColor`. */
  color?: string;
  /** Optional segment label (e.g. series name) for app-side usage. */
  label?: string;
  meta?: any;
}

export interface BarChartItemDataInterface {
  /**
   * Optional stable identifier used for external selection
   * (`selectedKey` / `ref.selectByKey`). Falls back to `label` when omitted.
   */
  id?: BarChartItemKey;
  label: string;
  /**
   * Bar magnitude.
   * When `segments` is provided, this is recalculated by the chart as the
   * sum of the segment values (so tooltip, value label, Y scale and
   * `onBarPress` all see the stack total).
   */
  value: number;
  color?: string;
  /**
   * Optional stacked segments. When present (and non-empty) the bar is drawn
   * as a stack, bottom -> top in array order.
   */
  segments?: BarChartSegmentInterface[];
  /**
   * Highlights this item's X-axis label (e.g. the current month).
   * Styled by `BarChart.Bar` `highlightedLabelColor` / `highlightedLabelFont`.
   * Independent from selection.
   */
  highlighted?: boolean;
  meta?: any;
}

export interface BarChartRootPropsInterface {
  data: BarChartItemDataInterface[];
  height?: number;
  width?: number; // Container width

  scrollToTheEnd?: boolean;

  yAxisTicksCount?: number;

  // Loading State
  isLoading?: boolean;

  /** Width of each bar in pixels. Default: 32 */
  barWidth?: number;
  /** Spacing between bars in pixels. Default: 12 */
  spacing?: number;

  /** Global color for bars. Default: #E0E0E0 */
  barColor?: string;
  activeBorderColor?: string;
  activeBorderWidth?: number;

  /**
   * Skia Font object for drawing labels.
   * Essential for performance. If null, text won't render.
   */
  font?: SkFont | null;

  /** Enable horizontal scrolling */
  isScrollable?: boolean;

  /** Controls if bars can be selected */
  selectable?: boolean;

  /** Show X Axis labels (Skia drawn) */
  showXAxis?: boolean;

  /** Vertical scale (0.1 to 1.0). Default: 0.8 */
  verticalScaleFactor?: number;

  /**
   * Callback for interaction.
   * `segmentIndex` is the selected segment of a stacked bar when
   * `selectionMode="segment"`, otherwise `-1`.
   */
  onBarPress?: (
    item: BarChartItemDataInterface | null,
    index: number,
    segmentIndex: number
  ) => void;

  /**
   * What a tap selects on stacked bars.
   * - `'bar'`: the whole column.
   * - `'segment'`: the tapped segment (non-stacked bars still select the
   *   whole bar, with `segmentIndex = -1`).
   * - `'series'`: the series of the tapped segment (`segment.id ?? label`)
   *   across all bars. Other series are dimmed (see `BarChart.Bar`
   *   `inactiveSegmentColor` / `inactiveSegmentOpacity`). No bar border or
   *   tooltip; fires `onSeriesSelect` instead of `onBarPress`.
   * @default 'bar'
   */
  selectionMode?: BarChartSelectionMode;

  /**
   * Controlled series selection (`selectionMode="series"` only).
   * - `undefined`: uncontrolled.
   * - `null`: controlled, no series highlighted.
   * - key: highlights segments whose `id ?? label` matches, in every bar.
   */
  selectedSeriesKey?: BarChartItemKey | null;

  /**
   * Fired when a series is selected/deselected (`selectionMode="series"`),
   * by tap or `ref.selectSeries`. Prop changes do not fire it.
   */
  onSeriesSelect?: (key: BarChartItemKey | null) => void;

  /**
   * Gap in pixels between segments of stacked bars. Lives on Root because
   * both drawing and segment hit-testing depend on it.
   * @default 0
   */
  segmentGap?: number;

  /**
   * Controlled selection by key (`item.id`, or `item.label` as fallback).
   * - `undefined`: uncontrolled (default; tap / ref drive selection).
   * - `null`: controlled, nothing selected.
   * - key: controlled, selects the matching bar (unknown keys deselect).
   *
   * In controlled mode, taps only fire `onBarPress`; update `selectedKey`
   * from it to move the selection. Prop changes do not fire `onBarPress`.
   */
  selectedKey?: BarChartItemKey | null;

  /**
   * Controlled segment selection (`segment.id`, or `segment.label` as
   * fallback), resolved inside the bar selected by `selectedKey`.
   * Only used when `selectionMode="segment"` and `selectedKey` is defined.
   * `null`/`undefined`/unknown keys select the whole bar.
   */
  selectedSegmentKey?: BarChartItemKey | null;

  /**
   * When true (and `isScrollable`), the chart scrolls to center the bar
   * selected through `selectedKey`.
   * @default false
   */
  scrollToSelectedBar?: boolean;

  children: React.ReactNode;
}

export type BarChartSelectionMode = 'bar' | 'segment' | 'series';

export type BarChartRefSelectedIndexPropsType = {
  scrollToBar?: boolean;
  animatedScroll?: boolean;
  /**
   * Segment to select inside the bar (`selectedIndex`).
   * Ignored unless `selectionMode="segment"`. Default: -1 (whole bar).
   */
  segmentIndex?: number;
  /**
   * Segment key to select inside the bar (`selectByKey`).
   * Ignored unless `selectionMode="segment"`.
   */
  segmentKey?: BarChartItemKey | null;
};

export type BarChartRef = {
  scrollToStart: (animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  /**
   * Programmatically selects a bar by its index. Fires `onBarPress` like a tap.
   * In controlled mode (`selectedKey` defined) it only fires `onBarPress`.
   * @param index The index of the item to select (-1 to deselect).
   * @param options.scrollToBar If true, scrolls the chart to center the selected bar
   */
  selectedIndex: (
    index: number,
    options?: BarChartRefSelectedIndexPropsType
  ) => void;
  /**
   * Programmatically selects a bar by key (`item.id`, or `item.label` as
   * fallback). `null` or unknown keys deselect. Fires `onBarPress` like a tap.
   * In controlled mode it only fires `onBarPress`.
   */
  selectByKey: (
    key: BarChartItemKey | null,
    options?: BarChartRefSelectedIndexPropsType
  ) => void;
  /**
   * Clears current selection (equivalent to `selectedIndex(-1)`).
   * Fires `onBarPress(null, -1)`.
   */
  clearSelection: () => void;
  /**
   * Highlights a series across all bars (`selectionMode="series"` only;
   * ignored otherwise). `null` clears. Fires `onSeriesSelect`.
   * In controlled mode (`selectedSeriesKey` defined) it only fires the callback.
   */
  selectSeries: (key: BarChartItemKey | null) => void;
};
