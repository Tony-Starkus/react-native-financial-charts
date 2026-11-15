import {
  getSegmentDimAmount,
  hitTestStackSeriesKey,
} from '../charts/BarChart/utils';

const item = {
  label: 'out',
  value: 100,
  segments: [
    { id: 'btc', label: 'Bitcoin', value: 50 },
    { label: 'ETH', value: 30 },
    { value: 20 }, // no key
  ],
};

describe('BarChart series selection utils', () => {
  it('resolves the series key of the tapped segment', () => {
    // bottom 300, bar height 100 (value 100 of maxValue 200 * 200px)
    // btc [250,300], ETH [220,250], unnamed [200,220]
    expect(hitTestStackSeriesKey(item, 290, 200, 200, 300, 0)).toBe('btc');
    expect(hitTestStackSeriesKey(item, 230, 200, 200, 300, 0)).toBe('ETH');
  });

  it('returns null for segments without key and non-stacked items', () => {
    expect(hitTestStackSeriesKey(item, 210, 200, 200, 300, 0)).toBeNull();
    expect(
      hitTestStackSeriesKey({ label: 'x', value: 10 }, 50, 100, 100, 100, 0)
    ).toBeNull();
  });

  it('does not dim anything without an active series', () => {
    expect(getSegmentDimAmount('btc', null, 1)).toBe(0);
    expect(getSegmentDimAmount(undefined, null, 1)).toBe(0);
  });

  it('keeps the active series in full color', () => {
    expect(getSegmentDimAmount('btc', 'btc', 1)).toBe(0);
  });

  it('dims other series following the animation progress', () => {
    expect(getSegmentDimAmount('ETH', 'btc', 0.5)).toBe(0.5);
    expect(getSegmentDimAmount('ETH', 'btc', 1)).toBe(1);
    expect(getSegmentDimAmount(undefined, 'btc', 1)).toBe(1);
    expect(getSegmentDimAmount(null, 'btc', 2)).toBe(1);
  });
});
