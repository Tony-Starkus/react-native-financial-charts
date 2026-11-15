import {
  computeStackSegmentRects,
  findSegmentIndexAtY,
  findSegmentIndexByKey,
  getSegmentKey,
  hitTestStackSegment,
} from '../charts/BarChart/utils';

const item = {
  label: 'out',
  value: 100,
  segments: [
    { id: 'btc', label: 'Bitcoin', value: 50 },
    { label: 'ETH', value: 30 },
    { label: 'SOL', value: 0 },
    { label: 'ADA', value: 20 },
  ],
};

describe('BarChart segment selection utils', () => {
  it('uses segment id and falls back to label', () => {
    expect(getSegmentKey(item.segments[0]!)).toBe('btc');
    expect(getSegmentKey(item.segments[1]!)).toBe('ETH');
    expect(getSegmentKey({ value: 1 })).toBeUndefined();
  });

  it('resolves segment index by key', () => {
    expect(findSegmentIndexByKey(item, 'btc')).toBe(0);
    expect(findSegmentIndexByKey(item, 'ADA')).toBe(3);
    expect(findSegmentIndexByKey(item, 'Bitcoin')).toBe(-1);
    expect(findSegmentIndexByKey(item, null)).toBe(-1);
    expect(findSegmentIndexByKey(undefined, 'btc')).toBe(-1);
    expect(findSegmentIndexByKey({ label: 'x', value: 1 }, 'btc')).toBe(-1);
  });

  it('finds the segment under Y', () => {
    // bottom 100, height 100: btc [50,100], eth [20,50], ada [0,20]
    const rects = computeStackSegmentRects([50, 30, 0, 20], 100, 100);
    expect(findSegmentIndexAtY(rects, 90)).toBe(0);
    expect(findSegmentIndexAtY(rects, 30)).toBe(1);
    expect(findSegmentIndexAtY(rects, 10)).toBe(3);
  });

  it('snaps taps in gaps or outside the stack to the nearest segment', () => {
    // gap 4 between visible segments
    const rects = computeStackSegmentRects([1, 1], 100, 44, 4);
    // seg0 [80,100], gap [76,80], seg1 [56,76]
    expect(findSegmentIndexAtY(rects, 79)).toBe(0);
    expect(findSegmentIndexAtY(rects, 77)).toBe(1);
    // above the stack -> top segment
    expect(findSegmentIndexAtY(rects, 5)).toBe(1);
  });

  it('returns -1 when nothing is visible', () => {
    expect(findSegmentIndexAtY([{ y: 10, height: 0 }], 10)).toBe(-1);
    expect(findSegmentIndexAtY([], 10)).toBe(-1);
  });

  it('hit-tests a stacked item at its final height', () => {
    // maxValue 200 -> bar is half of maxBarHeight (100 of 200) above 300
    expect(hitTestStackSegment(item, 290, 200, 200, 300, 0)).toBe(0);
    expect(hitTestStackSegment(item, 235, 200, 200, 300, 0)).toBe(1);
    expect(hitTestStackSegment(item, 205, 200, 200, 300, 0)).toBe(3);
  });

  it('returns -1 for non-stacked items', () => {
    expect(
      hitTestStackSegment({ label: 'x', value: 10 }, 50, 100, 100, 100, 0)
    ).toBe(-1);
  });
});
