import type { SharedValue } from 'react-native-reanimated';

/** Key used to select a slice from outside the chart (`id`, or `label` as fallback). */
export type PieChartItemKey = string | number;

/**
 * @interface PieChartItem
 * Defines the data structure for an individual slice in the chart.
 */
export interface PieChartItem {
  /**
   * Optional stable identifier used for external selection
   * (`selectedKey` / `ref.selectByKey`). Falls back to `label` when omitted.
   */
  id?: PieChartItemKey;
  /** Optional descriptive label for the category */
  label?: string;
  /** Numerical value determining the slice's proportional size */
  value: number;
  /** Optional slice color (hex, rgb, or named color). If omitted, a fallback color is generated. */
  color?: string;
  /** Marks this slice as an aggregated "others" bucket */
  isAggregated?: boolean;
  /** Source slices when this item is aggregated */
  groupedItems?: PieChartItem[];
  /**
   * Internal visual weight used only for rendering.
   * If omitted, `value` is used.
   */
  renderValue?: number;
  /**
   * Internal: index of this item in the original `data` prop.
   * Filled by the chart; undefined for the aggregated slice.
   */
  sourceIndex?: number;
}

export interface PieChartRootPropsInterface {
  data: PieChartItem[];
  size?: number;
  donutRatio?: number;
  /**
   * Global chart start angle in degrees.
   * 0 means the top (12 o'clock) in d3 pie coordinates.
   * @default 0
   */
  startAngle?: number;
  /**
   * Drawing direction for slice progression.
   * @default 'clockwise'
   */
  direction?: 'clockwise' | 'counterclockwise';
  /**
   * Angular gap between slices in degrees.
   * @default 2
   */
  sliceGapAngle?: number;
  children: React.ReactNode;
  onSelect?: (item: PieChartItem | null, index: number) => void;
  /**
   * Callback fired when the aggregated slice is selected.
   */
  onSelectAggregated?: (
    item: PieChartItem,
    index: number,
    groupedItems: PieChartItem[]
  ) => void;
  /**
   * Optional hard cap for slices to draw, including the aggregated "others" slice.
   * If not provided, capacity is calculated from chart geometry.
   */
  maxSlices?: number;
  /**
   * Minimum visible sweep angle (in degrees) for a standalone slice.
   * Smaller slices are merged into "others".
   * @default 6
   */
  minSliceAngle?: number;
  /**
   * Label used by the aggregated slice.
   * @default "Others"
   */
  othersLabel?: string;
  /**
   * Color used by the aggregated slice.
   * @default "#A3A3A3"
   */
  othersColor?: string;
  /**
   * Optional fixed visual angle (degrees) for the aggregated "others" slice.
   * This is a visual preference only; `value` remains the real total.
   */
  othersVisualAngle?: number;
  /**
   * Controlled selection by key (`item.id`, or `item.label` as fallback).
   * - `undefined`: uncontrolled (default; tap / ref drive selection).
   * - `null`: controlled, nothing selected.
   * - key: controlled, selects the matching slice. Keys merged into the
   *   aggregated slice select the "Others" slice.
   *
   * In controlled mode, taps only fire `onSelect`; update `selectedKey`
   * from it to move the selection. Prop changes do not fire `onSelect`.
   */
  selectedKey?: PieChartItemKey | null;
}

export type PieChartRef = {
  /**
   * Programmatically selects a slice by index (-1 to deselect).
   */
  selectedIndex: (index: number) => void;
  /**
   * Programmatically selects a slice by key (`item.id`, or `item.label` as
   * fallback). Keys merged into "Others" select the aggregated slice.
   * Pass `null` to clear. Fires `onSelect` like a tap.
   */
  selectByKey: (key: PieChartItemKey | null) => void;
  /**
   * Clears current selection.
   */
  clearSelection: () => void;
};

/**
 * @interface PieChartContextInterface
 * Describes the internal state and properties shared between PieChart components.
 */
export interface PieChartContextInterface {
  /** The dataset to be rendered */
  data: PieChartItem[];
  /** Total sum of all values in the data array */
  totalValue: number;
  /** The outer radius of the chart (distance from center to edge) */
  radius: number;
  /** The inner radius for the donut effect (set to 0 for a solid Pie Chart) */
  innerRadius: number;
  /** X-coordinate of the center point */
  centerX: number;
  /** Y-coordinate of the center point */
  centerY: number;
  /** Shared value holding the index of the currently selected slice (-1 for none) */
  selectedIndex: SharedValue<number>;
  size: number;
  startAngle: number;
  direction: 'clockwise' | 'counterclockwise';
  sliceGapAngle: number;
  notifySelection: (index: number) => void;
  /**
   * Single entry point for user-driven selection (tap / ref).
   * Uncontrolled: updates `selectedIndex` and notifies.
   * Controlled (`selectedKey` defined): only notifies.
   */
  requestSelection: (index: number) => void;
}

// Backward-compatible alias
export type PieChartRootProps = PieChartRootPropsInterface;
