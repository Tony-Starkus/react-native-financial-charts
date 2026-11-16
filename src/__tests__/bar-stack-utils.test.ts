import {
  computeStackSegmentRects,
  getBarGeometrySignature,
  getSegmentsTotal,
  isStackedItem,
  normalizeBarData,
} from '../charts/BarChart/utils';

describe('BarChart stacked utils', () => {
  it('detects stacked items only when segments are non-empty', () => {
    expect(isStackedItem({ label: 'a', value: 1 })).toBe(false);
    expect(isStackedItem({ label: 'a', value: 1, segments: [] })).toBe(false);
    expect(
      isStackedItem({ label: 'a', value: 1, segments: [{ value: 2 }] })
    ).toBe(true);
  });

  it('sums segments ignoring negative and non-finite values', () => {
    expect(getSegmentsTotal(undefined)).toBe(0);
    expect(
      getSegmentsTotal([
        { value: 10 },
        { value: -5 },
        { value: Number.NaN },
        { value: 2.5 },
      ])
    ).toBe(12.5);
  });

  it('normalizes stacked value to the segment total and keeps simple items', () => {
    const simple = { label: 'simple', value: 7 };
    const stacked = {
      label: 'stacked',
      value: 0,
      segments: [{ value: 3 }, { value: 4 }],
    };
    const [a, b] = normalizeBarData([simple, stacked]);
    expect(a).toBe(simple);
    expect(b!.value).toBe(7);
    expect(b!.segments).toBe(stacked.segments);
  });

  it('splits the bar bottom -> top proportionally', () => {
    const rects = computeStackSegmentRects([1, 3], 100, 80);
    expect(rects[0]).toEqual({ y: 80, height: 20 });
    expect(rects[1]).toEqual({ y: 20, height: 60 });
  });

  it('applies gaps only between visible segments', () => {
    const rects = computeStackSegmentRects([1, 0, 1], 100, 42, 2);
    // available = 42 - 2 (one gap) = 40 -> 20 each
    expect(rects[0]).toEqual({ y: 80, height: 20 });
    expect(rects[1]!.height).toBe(0);
    expect(rects[2]).toEqual({ y: 58, height: 20 });
  });

  it('clamps gap so it never eats more than half of a short bar', () => {
    const rects = computeStackSegmentRects([1, 1], 10, 4, 100);
    const totalHeight = rects.reduce((sum, r) => sum + r.height, 0);
    expect(totalHeight).toBeCloseTo(2);
    expect(rects[1]!.y).toBeCloseTo(6);
  });

  it('returns empty rects for zero totals or zero height', () => {
    expect(computeStackSegmentRects([0, 0], 50, 30)).toEqual([
      { y: 50, height: 0 },
      { y: 50, height: 0 },
    ]);
    expect(computeStackSegmentRects([1, 2], 50, 0)).toEqual([
      { y: 50, height: 0 },
      { y: 50, height: 0 },
    ]);
  });
});

describe('BarChart geometry signature', () => {
  const base = normalizeBarData([
    {
      id: 'jan',
      label: 'jan',
      value: 0,
      segments: [{ value: 3 }, { value: 4 }],
    },
    { id: 'feb', label: 'feb', value: 5 },
  ]);

  it('ignores colors, labels, ids and highlighted', () => {
    const recolored = normalizeBarData([
      {
        id: 'x',
        label: 'other',
        value: 0,
        highlighted: true,
        segments: [
          { value: 3, color: '#111111' },
          { value: 4, color: '#222222' },
        ],
      },
      { id: 'y', label: 'label', value: 5, color: '#333333' },
    ]);
    expect(getBarGeometrySignature(recolored)).toBe(
      getBarGeometrySignature(base)
    );
  });

  it('changes when a value, a segment value or the bar count changes', () => {
    const signature = getBarGeometrySignature(base);
    expect(
      getBarGeometrySignature(
        normalizeBarData([
          { label: 'jan', value: 0, segments: [{ value: 4 }, { value: 3 }] },
          { label: 'feb', value: 5 },
        ])
      )
    ).not.toBe(signature);
    expect(
      getBarGeometrySignature(
        normalizeBarData([
          { label: 'jan', value: 0, segments: [{ value: 3 }, { value: 4 }] },
          { label: 'feb', value: 6 },
        ])
      )
    ).not.toBe(signature);
    expect(getBarGeometrySignature(base.slice(0, 1))).not.toBe(signature);
  });
});
