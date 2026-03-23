import {
  buildCandlestickLayout,
  calculateNiceScale,
  calculateVisibleCandlestickScale,
  normalizeCandlestickData,
} from '../charts/CandlestickChart/utils';

describe('CandlestickChart utils', () => {
  it('normalizes high and low using OHLC extremes', () => {
    const result = normalizeCandlestickData([
      {
        timestamp: 1,
        open: 10,
        high: 9,
        low: 11,
        close: 14,
      },
    ]);

    expect(result).toEqual([
      {
        timestamp: 1,
        open: 10,
        high: 14,
        low: 9,
        close: 14,
      },
    ]);
  });

  it('creates a nice scale with deterministic ticks', () => {
    const scale = calculateNiceScale(42123, 44781, 5);

    expect(scale.min).toBeLessThanOrEqual(42123);
    expect(scale.max).toBeGreaterThanOrEqual(44781);
    expect(scale.ticks.length).toBeGreaterThanOrEqual(5);
  });

  it('builds layout data with bullish and bearish colors', () => {
    const layout = buildCandlestickLayout({
      data: [
        {
          timestamp: 1,
          open: 10,
          high: 15,
          low: 8,
          close: 14,
        },
        {
          timestamp: 2,
          open: 14,
          high: 16,
          low: 9,
          close: 11,
        },
      ],
      domainY: [8, 16],
      plotTop: 10,
      plotBottom: 110,
      candleWidth: 12,
      spacing: 6,
      bullishColor: '#00E396',
      bearishColor: '#EA3943',
      contentPaddingLeft: 12,
    });

    expect(layout[0]?.isBullish).toBe(true);
    expect(layout[0]?.color).toBe('#00E396');
    expect(layout[1]?.isBullish).toBe(false);
    expect(layout[1]?.color).toBe('#EA3943');
    expect(layout[0]?.bodyHeight).toBeGreaterThan(0);
  });

  it('keeps the visible scale tighter than expanded nice bounds', () => {
    const scale = calculateVisibleCandlestickScale({
      data: [
        {
          timestamp: 1,
          open: 43000,
          high: 44120,
          low: 42780,
          close: 43840,
        },
        {
          timestamp: 2,
          open: 43840,
          high: 44240,
          low: 43110,
          close: 43360,
        },
      ],
      startIndex: 0,
      endIndex: 1,
      maxTicks: 5,
    });

    expect(scale.domainY[0]).toBeGreaterThan(42000);
    expect(scale.domainY[1]).toBeLessThan(45000);
    expect(scale.yAxisTicks.every((tick) => tick >= scale.domainY[0])).toBe(
      true
    );
    expect(scale.yAxisTicks.every((tick) => tick <= scale.domainY[1])).toBe(
      true
    );
  });
});
