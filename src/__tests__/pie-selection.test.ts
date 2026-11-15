import {
  findPieSliceIndexByKey,
  getPieItemKey,
  getPieSelectionSignature,
} from '../charts/PieChart/selection';
import type { PieChartItem } from '../charts/PieChart/interfaces';

const slices: PieChartItem[] = [
  { id: 'btc', label: 'Bitcoin', value: 50 },
  { label: 'Ethereum', value: 30 },
  {
    label: 'Others',
    value: 5,
    isAggregated: true,
    groupedItems: [
      { id: 'sol', label: 'Solana', value: 3 },
      { label: 'Cardano', value: 2 },
    ],
  },
];

describe('PieChart selection helpers', () => {
  it('uses id and falls back to label', () => {
    expect(getPieItemKey({ id: 1, label: 'x', value: 1 })).toBe(1);
    expect(getPieItemKey({ label: 'x', value: 1 })).toBe('x');
    expect(getPieItemKey({ value: 1 })).toBeUndefined();
  });

  it('resolves direct slices by id or label', () => {
    expect(findPieSliceIndexByKey(slices, 'btc')).toBe(0);
    expect(findPieSliceIndexByKey(slices, 'Ethereum')).toBe(1);
  });

  it('id takes precedence over label', () => {
    // "Bitcoin" is the label but the key of that slice is its id.
    expect(findPieSliceIndexByKey(slices, 'Bitcoin')).toBe(-1);
  });

  it('resolves grouped items to the aggregated slice', () => {
    expect(findPieSliceIndexByKey(slices, 'sol')).toBe(2);
    expect(findPieSliceIndexByKey(slices, 'Cardano')).toBe(2);
    expect(findPieSliceIndexByKey(slices, 'Others')).toBe(2);
  });

  it('returns -1 for null, undefined or unknown keys', () => {
    expect(findPieSliceIndexByKey(slices, null)).toBe(-1);
    expect(findPieSliceIndexByKey(slices, undefined)).toBe(-1);
    expect(findPieSliceIndexByKey(slices, 'doge')).toBe(-1);
  });

  it('signature ignores identity and tracks content', () => {
    const copy = slices.map((s) => ({ ...s }));
    expect(getPieSelectionSignature(copy)).toBe(
      getPieSelectionSignature(slices)
    );
    copy[1] = { ...copy[1]!, value: 31 };
    expect(getPieSelectionSignature(copy)).not.toBe(
      getPieSelectionSignature(slices)
    );
  });
});
