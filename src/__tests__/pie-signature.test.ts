import {
  getPieLayoutSignature,
  getPieRevealSignature,
} from '../charts/PieChart/utils';
import type { PieChartItem } from '../charts/PieChart/interfaces';

// The signatures are pure hashing; the layout builders' deps are not needed
jest.mock('@shopify/react-native-skia', () => ({ Skia: {} }));
jest.mock('d3-shape', () => ({}));

const geometry = {
  innerRadius: 50,
  outerRadius: 70,
  sliceGapAngle: 2,
  cornerRadius: 0,
  startAngle: 0,
  direction: 'clockwise' as const,
};

const data: PieChartItem[] = [
  { label: 'BTC', value: 50, color: '#F7931A' },
  { label: 'ETH', value: 30, color: '#7C8FF0' },
];

const recolored: PieChartItem[] = data.map((item) => ({
  ...item,
  color: '#3A3F48',
}));

describe('PieChart signatures', () => {
  it('reveal signature ignores colors', () => {
    expect(getPieRevealSignature({ data: recolored, ...geometry })).toBe(
      getPieRevealSignature({ data, ...geometry })
    );
  });

  it('layout signature keeps colors (the cached layout carries them)', () => {
    expect(getPieLayoutSignature({ data: recolored, ...geometry })).not.toBe(
      getPieLayoutSignature({ data, ...geometry })
    );
  });

  it('reveal signature changes with values and geometry', () => {
    const reveal = getPieRevealSignature({ data, ...geometry });
    expect(
      getPieRevealSignature({
        data: [{ ...data[0]!, value: 51 }, data[1]!],
        ...geometry,
      })
    ).not.toBe(reveal);
    expect(
      getPieRevealSignature({ data, ...geometry, innerRadius: 40 })
    ).not.toBe(reveal);
  });
});
