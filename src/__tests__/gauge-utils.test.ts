import {
  buildGaugeTicks,
  computeGaugeLayout,
  degToRad,
  getSegmentColorAt,
  getUnitArcBounds,
  normalizeGaugeAngles,
  normalizeGaugeSegments,
  valueToAngle,
  valueToProgress,
} from '../charts/GaugeChart/utils';

describe('GaugeChart utils', () => {
  it('converts degrees to radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });

  it('maps values to clamped progress', () => {
    expect(valueToProgress(50, 0, 100)).toBe(0.5);
    expect(valueToProgress(-10, 0, 100)).toBe(0);
    expect(valueToProgress(150, 0, 100)).toBe(1);
    expect(valueToProgress(5, 10, 10)).toBe(0);
    expect(valueToProgress(Number.NaN, 0, 100)).toBe(0);
  });

  it('maps values to angles along the sweep', () => {
    expect(valueToAngle(0, 0, 100, 135, 270)).toBe(135);
    expect(valueToAngle(100, 0, 100, 135, 270)).toBe(405);
    expect(valueToAngle(50, 0, 100, 180, 180)).toBe(270);
  });

  it('normalizes angles into a positive sweep', () => {
    expect(normalizeGaugeAngles(135, 405)).toEqual({
      startAngle: 135,
      sweepAngle: 270,
      endAngle: 405,
    });
    // end below start wraps by 360
    expect(normalizeGaugeAngles(135, 45).sweepAngle).toBe(270);
    expect(normalizeGaugeAngles(0, 720).sweepAngle).toBe(360);
    expect(normalizeGaugeAngles(90, 90).sweepAngle).toBe(360);
  });

  it('computes unit arc bounds including the center', () => {
    // Top half circle (180 -> 360)
    expect(getUnitArcBounds(180, 180)).toEqual({
      minX: -1,
      maxX: 1,
      minY: -1,
      maxY: 0,
    });

    const bounds = getUnitArcBounds(135, 270);
    expect(bounds.minX).toBe(-1);
    expect(bounds.maxX).toBe(1);
    expect(bounds.minY).toBe(-1);
    expect(bounds.maxY).toBeCloseTo(Math.SQRT1_2);
  });

  it('derives a semicircle layout from width', () => {
    const layout = computeGaugeLayout({
      width: 300,
      startAngle: 180,
      sweepAngle: 180,
      strokeWidth: 20,
      padding: 10,
    });

    // inset = 20; radius = (300 - 40) / 2
    expect(layout.radius).toBe(130);
    expect(layout.height).toBe(170);
    expect(layout.cx).toBe(150);
    expect(layout.cy).toBe(150);
  });

  it('fits the arc inside an explicit height', () => {
    const layout = computeGaugeLayout({
      width: 300,
      height: 100,
      startAngle: 180,
      sweepAngle: 180,
      strokeWidth: 0,
      padding: 0,
    });

    expect(layout.radius).toBe(100);
    expect(layout.height).toBe(100);
    expect(layout.cx).toBe(150);
    expect(layout.cy).toBe(100);
  });

  it('normalizes segments: clamps, drops empty ranges and sorts', () => {
    const result = normalizeGaugeSegments(
      [
        { from: 50, to: 150, color: 'green' },
        { from: -20, to: 25, color: 'red' },
        { from: 40, to: 30, color: 'yellow' },
        { from: 60, to: 60, color: 'empty' },
        { from: Number.NaN, to: 10, color: 'nan' },
      ],
      0,
      100
    );

    expect(result.map((s) => s.color)).toEqual(['red', 'yellow', 'green']);
    expect(result[0]).toMatchObject({ from: 0, to: 25, startProgress: 0 });
    expect(result[1]).toMatchObject({ from: 30, to: 40 });
    expect(result[2]).toMatchObject({ from: 50, to: 100, endProgress: 1 });
  });

  it('resolves the segment color for a value', () => {
    const segments = normalizeGaugeSegments(
      [
        { from: 0, to: 50, color: 'red' },
        { from: 50, to: 100, color: 'green' },
      ],
      0,
      100
    );

    expect(getSegmentColorAt(segments, 10, 'gray')).toBe('red');
    expect(getSegmentColorAt(segments, 50, 'gray')).toBe('green');
    expect(getSegmentColorAt(segments, 100, 'gray')).toBe('green');
    expect(getSegmentColorAt([], 10, 'gray')).toBe('gray');
  });

  it('builds evenly spaced ticks', () => {
    expect(buildGaugeTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(buildGaugeTicks(0, 1, 0)).toEqual([0, 1]);
    expect(buildGaugeTicks(10, 10, 4)).toEqual([]);
  });
});
