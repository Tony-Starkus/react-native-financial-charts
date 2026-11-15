import {
  findBarIndexByKey,
  getBarItemKey,
  getCenteredScrollOffset,
} from '../charts/BarChart/utils';

const data = [
  { id: 'm-11', label: 'nov', value: 10 },
  { label: 'dez', value: 20 },
  { id: 3, label: 'jan', value: 30 },
];

describe('BarChart selection utils', () => {
  it('uses id and falls back to label', () => {
    expect(getBarItemKey(data[0]!)).toBe('m-11');
    expect(getBarItemKey(data[1]!)).toBe('dez');
    expect(getBarItemKey(data[2]!)).toBe(3);
  });

  it('resolves index by key', () => {
    expect(findBarIndexByKey(data, 'm-11')).toBe(0);
    expect(findBarIndexByKey(data, 'dez')).toBe(1);
    expect(findBarIndexByKey(data, 3)).toBe(2);
  });

  it('id takes precedence over label', () => {
    expect(findBarIndexByKey(data, 'nov')).toBe(-1);
  });

  it('returns -1 for null, undefined or unknown keys', () => {
    expect(findBarIndexByKey(data, null)).toBe(-1);
    expect(findBarIndexByKey(data, undefined)).toBe(-1);
    expect(findBarIndexByKey(data, 'xyz')).toBe(-1);
  });

  it('centers the bar and clamps to the scroll range', () => {
    // itemX = 12 + 10 * 40 = 412; center = 412 - 150 + 16 = 278
    expect(getCenteredScrollOffset(10, 32, 8, 12, 300, 1000)).toBe(278);
    // first bar would need a negative offset -> 0
    expect(getCenteredScrollOffset(0, 32, 8, 12, 300, 1000)).toBe(0);
    // last bars clamp to contentWidth - canvasWidth
    expect(getCenteredScrollOffset(30, 32, 8, 12, 300, 1000)).toBe(700);
    // content narrower than canvas -> 0
    expect(getCenteredScrollOffset(3, 32, 8, 12, 300, 200)).toBe(0);
  });
});
