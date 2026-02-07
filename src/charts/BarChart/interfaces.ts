import type { SkFont } from '@shopify/react-native-skia';

export interface BarChartItemDataInterface {
  label: string;
  value: number;
  color?: string;
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

  /** Callback for interaction */
  onBarPress?: (item: BarChartItemDataInterface | null, index: number) => void;

  children: React.ReactNode;
}

export type BarChartRefSelectedIndexPropsType = {
  scrollToBar?: boolean;
  animatedScroll?: boolean;
};

export type BarChartRef = {
  scrollToStart: (animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  /**
   * Programmatically selects a bar by its index.
   * @param index The index of the item to select (-1 to deselect).
   * @param options.scrollToBar If true, scrolls the chart to center the selected bar
   */
  selectedIndex: (
    index: number,
    options?: BarChartRefSelectedIndexPropsType
  ) => void;
};
