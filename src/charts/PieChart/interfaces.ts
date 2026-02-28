import type { SharedValue } from 'react-native-reanimated';

/**
 * @interface PieChartItem
 * Defines the data structure for an individual slice in the chart.
 */
export interface PieChartItem {
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
}

export type PieChartRef = {
  /**
   * Programmatically selects a slice by index (-1 to deselect).
   */
  selectedIndex: (index: number) => void;
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
}

// Backward-compatible alias
export type PieChartRootProps = PieChartRootPropsInterface;
