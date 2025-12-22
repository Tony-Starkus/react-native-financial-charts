import ChartProvider from './ChartContext';
import ChartArea from './components/ChartArea';
import ChartBaseline from './components/ChartBaseline';
import ChartCanvas from './components/ChartCanvas';
import ChartCursor from './components/ChartCursor';
import ChartLine from './components/ChartLine';
import ChartTooltipDate from './components/ChartTooltipDate';
import ChartTooltipValue from './components/ChartTooltipValue';

export const Chart = {
  Root: ChartProvider,
  Canvas: ChartCanvas,
  Line: ChartLine,
  Area: ChartArea,
  Cursor: ChartCursor,
  Baseline: ChartBaseline,
  ToolTip: {
    Value: ChartTooltipValue,
    Date: ChartTooltipDate,
  },
};

export * from './interfaces';
