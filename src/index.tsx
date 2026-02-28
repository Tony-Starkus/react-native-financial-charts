import LineChartProvider from './charts/LineChart/LineChartContext';
import LineChartArea from './charts/LineChart/components/ChartArea';
import LineChartBaseline from './charts/LineChart/components/ChartBaseline';
import LineChartCanvas from './charts/LineChart/components/ChartCanvas';
import LineChartCursor from './charts/LineChart/components/ChartCursor';
import LineChartLine from './charts/LineChart/components/ChartLine';
import LineChartTooltipDate from './charts/LineChart/components/ChartTooltipDate';
import LineChartTooltipValue from './charts/LineChart/components/ChartTooltipValue';
import BarChartProvider from './charts/BarChart/BarChartContext';
import BarChartCanvas from './charts/BarChart/components/BarChartCanvas';
import BarChartBar from './charts/BarChart/components/BarChartBar';
import BarChartTooltip from './charts/BarChart/components/BarChartTooltip';
import BarChartGrid from './charts/BarChart/components/BarChartGrid';
import BarChartYAxis from './charts/BarChart/components/BarChartYAxis';
import PieChartProvider from './charts/PieChart/PieChartContext';
import PieChartCanvas from './charts/PieChart/components/PieChartCanvas';
import PieChartSlices from './charts/PieChart/components/PieChartSlices';

export const BarChart = {
  Root: BarChartProvider,
  Canvas: BarChartCanvas,
  Bar: BarChartBar,
  Tooltip: BarChartTooltip,
  Grid: BarChartGrid,
  YAxis: BarChartYAxis,
};

export const LineChart = {
  Root: LineChartProvider,
  Canvas: LineChartCanvas,
  Line: LineChartLine,
  Area: LineChartArea,
  Cursor: LineChartCursor,
  Baseline: LineChartBaseline,
  Tooltip: {
    Value: LineChartTooltipValue,
    Date: LineChartTooltipDate,
  },
};

export const PieChart = {
  Root: PieChartProvider,
  Canvas: PieChartCanvas,
  Slices: PieChartSlices,
};

export type { BarChartBarPropsInterface } from './charts/BarChart/components/BarChartBar';
export type { BarChartGridPropsInterface } from './charts/BarChart/components/BarChartGrid';
export type { BarChartTooltipPropsInterface } from './charts/BarChart/components/BarChartTooltip';
export type { BarChartYAXisPropsInterface } from './charts/BarChart/components/BarChartYAxis';
export type { LineChartRootPropsInterface } from './charts/LineChart/LineChartContext';
export type { LineChartAreaPropsInterface } from './charts/LineChart/components/ChartArea';
export type { LineChartLinePropsInterface } from './charts/LineChart/components/ChartLine';
export type { LineChartCursorPropsInterface } from './charts/LineChart/components/ChartCursor';
export type { LineChartBaselinePropsInterface } from './charts/LineChart/components/ChartBaseline';
export type { LineChartTooltipValuePropsInterface } from './charts/LineChart/components/ChartTooltipValue';
export type { LineChartTooltipDatePropsInterface } from './charts/LineChart/components/ChartTooltipDate';
export type { PieChartCanvasPropsInterface } from './charts/PieChart/components/PieChartCanvas';
export type { PieChartSlicesPropsInterface } from './charts/PieChart/components/PieChartSlices';

export * from './charts/LineChart/interfaces';
export * from './charts/BarChart/interfaces';
export * from './charts/PieChart/interfaces';
