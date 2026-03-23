import React from 'react';
import { DashPathEffect, Group, Line, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { useCandlestickChart } from '../CandlestickChartContext';

export interface CandlestickChartGridPropsInterface {
  lineColor?: string;
  lineWidth?: number;
  dashEffect?: number[];
}

const CandlestickChartGrid: React.FC<CandlestickChartGridPropsInterface> = ({
  lineColor = '#2F3340',
  lineWidth = 1,
  dashEffect,
}) => {
  const {
    yAxisTicks,
    plotTop,
    plotBottom,
    contentWidth,
    canvasWidth,
    animatedDomainMin,
    animatedDomainMax,
  } = useCandlestickChart();

  const gridWidth = Math.max(contentWidth, canvasWidth);

  return (
    <Group>
      {yAxisTicks.map((tick, index) => {
        return (
          <AnimatedGridLine
            key={index}
            tick={tick}
            lineColor={lineColor}
            lineWidth={lineWidth}
            dashEffect={dashEffect}
            domainMin={animatedDomainMin}
            domainMax={animatedDomainMax}
            plotTop={plotTop}
            plotBottom={plotBottom}
            gridWidth={gridWidth}
          />
        );
      })}
    </Group>
  );
};

const AnimatedGridLine: React.FC<{
  tick: number;
  lineColor: string;
  lineWidth: number;
  dashEffect?: number[];
  domainMin: SharedValue<number>;
  domainMax: SharedValue<number>;
  plotTop: number;
  plotBottom: number;
  gridWidth: number;
}> = ({
  tick,
  lineColor,
  lineWidth,
  dashEffect,
  domainMin,
  domainMax,
  plotTop,
  plotBottom,
  gridWidth,
}) => {
  const drawableHeight = Math.max(plotBottom - plotTop, 1);

  const p1 = useDerivedValue(() => {
    const safeRange = Math.max(domainMax.value - domainMin.value, 1);
    const progress = (tick - domainMin.value) / safeRange;
    const y = plotBottom - progress * drawableHeight;
    return vec(0, y);
  }, [tick, domainMin, domainMax, plotBottom, drawableHeight]);

  const p2 = useDerivedValue(() => {
    const safeRange = Math.max(domainMax.value - domainMin.value, 1);
    const progress = (tick - domainMin.value) / safeRange;
    const y = plotBottom - progress * drawableHeight;
    return vec(gridWidth, y);
  }, [tick, domainMin, domainMax, plotBottom, drawableHeight, gridWidth]);

  return (
    <Line p1={p1} p2={p2} color={lineColor} strokeWidth={lineWidth}>
      {dashEffect && <DashPathEffect intervals={dashEffect} />}
    </Line>
  );
};

export default CandlestickChartGrid;
