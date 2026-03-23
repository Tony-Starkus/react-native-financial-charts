import type { SkFont } from '@shopify/react-native-skia';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

export interface CandlestickChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  color?: string;
  meta?: any;
}

export interface CandlestickChartRootPropsInterface {
  data: CandlestickChartDataPoint[];
  width?: number;
  height?: number;
  candleWidth?: number;
  spacing?: number;
  scrollToTheEnd?: boolean;
  isScrollable?: boolean;
  selectable?: boolean;
  yAxisTicksCount?: number;
  bullishColor?: string;
  bearishColor?: string;
  activeBorderColor?: string;
  activeBorderWidth?: number;
  font?: SkFont | null;
  onCandlePress?: (
    item: CandlestickChartDataPoint | null,
    index: number
  ) => void;
  children: React.ReactNode;
}

export type CandlestickChartRefSelectedIndexOptions = {
  scrollToCandle?: boolean;
  animatedScroll?: boolean;
};

export type CandlestickChartRef = {
  scrollToStart: (animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  selectedIndex: (
    index: number,
    options?: CandlestickChartRefSelectedIndexOptions
  ) => void;
};

export interface CandlestickChartLayoutItem {
  index: number;
  data: CandlestickChartDataPoint;
  centerX: number;
  bodyX: number;
  bodyWidth: number;
  openY: number;
  closeY: number;
  highY: number;
  lowY: number;
  bodyY: number;
  bodyHeight: number;
  isBullish: boolean;
  color: string;
}

export interface CandlestickChartContextInterface {
  data: CandlestickChartDataPoint[];
  layoutData: CandlestickChartLayoutItem[];
  domainY: [number, number];
  yAxisTicks: number[];
  height: number;
  width: number;
  canvasWidth: number;
  contentWidth: number;
  plotTop: number;
  plotBottom: number;
  candleWidth: number;
  spacing: number;
  isScrollable: boolean;
  selectable: boolean;
  bullishColor: string;
  bearishColor: string;
  activeBorderColor: string;
  activeBorderWidth: number;
  font: SkFont | null;
  animatedDomainMin: SharedValue<number>;
  animatedDomainMax: SharedValue<number>;
  selectedIndex: SharedValue<number>;
  entryProgress: SharedValue<number>;
  scrollViewRef: AnimatedRef<any>;
  scrollX: SharedValue<number>;
  hasYAxis: boolean;
  yAxisWidth: number;
  yAxisLabelAlignment: 'left' | 'right';
  yAxisLabelOffsetX: number;
  yAxisLabelYOffset: number;
  yAxisLabelPadding: number;
  yAxisShouldDrawBackground: boolean;
  hasLastPrice: boolean;
  lastPriceRightOffset: number;
  lastPriceLabelPaddingHorizontal?: number;
  lastPriceLabelPaddingVertical?: number;
  lastPriceFormatLabel?: (value: number) => string;
  notifySelection: (index: number) => void;
}
