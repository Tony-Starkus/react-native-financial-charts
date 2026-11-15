import type {
  GaugeLayout,
  GaugeNormalizedSegment,
  GaugeSegment,
} from './interfaces';

export const DEFAULT_START_ANGLE = 135;
export const DEFAULT_END_ANGLE = 405;

export const degToRad = (deg: number) => {
  'worklet';
  return (deg * Math.PI) / 180;
};

export const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

/** Maps a value into `[0, 1]`. Returns 0 for an invalid range (`max <= min`). */
export const valueToProgress = (value: number, min: number, max: number) => {
  'worklet';
  if (!(max > min) || !Number.isFinite(value)) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

export const progressToAngle = (
  progress: number,
  startAngle: number,
  sweepAngle: number
) => {
  'worklet';
  return startAngle + progress * sweepAngle;
};

export const valueToAngle = (
  value: number,
  min: number,
  max: number,
  startAngle: number,
  sweepAngle: number
) => {
  'worklet';
  return progressToAngle(
    valueToProgress(value, min, max),
    startAngle,
    sweepAngle
  );
};

export const getPolarPoint = (
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) => {
  'worklet';
  const rad = degToRad(angleDeg);
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
};

/**
 * Resolves start/end into a positive sweep in `(0, 360]`.
 * `endAngle <= startAngle` wraps by 360 (e.g. 135 -> 45 becomes a 270 sweep).
 */
export const normalizeGaugeAngles = (startAngle: number, endAngle: number) => {
  const start = Number.isFinite(startAngle) ? startAngle : DEFAULT_START_ANGLE;
  const end = Number.isFinite(endAngle)
    ? endAngle
    : start + (DEFAULT_END_ANGLE - DEFAULT_START_ANGLE);

  let sweep = end - start;
  if (sweep > 360) sweep = 360;
  while (sweep <= 0) sweep += 360;

  return { startAngle: start, sweepAngle: sweep, endAngle: start + sweep };
};

/**
 * Bounding box of the arc on a unit circle, always including the center
 * (needle pivot). Used to size the canvas to the visible geometry.
 */
export const getUnitArcBounds = (startAngle: number, sweepAngle: number) => {
  const points: { x: number; y: number }[] = [
    { x: 0, y: 0 },
    getPolarPoint(0, 0, 1, startAngle),
    getPolarPoint(0, 0, 1, startAngle + sweepAngle),
  ];

  // Cardinal directions crossed by the arc are its extreme points.
  const firstCardinal = Math.ceil(startAngle / 90) * 90;
  for (let a = firstCardinal; a <= startAngle + sweepAngle; a += 90) {
    points.push(getPolarPoint(0, 0, 1, a));
  }

  const round = (n: number) => Math.round(n * 1e9) / 1e9;
  const xs = points.map((p) => round(p.x));
  const ys = points.map((p) => round(p.y));

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

/**
 * Computes radius and center so the arc (plus stroke and padding) fits the
 * given width. Height is derived from the arc unless explicitly provided.
 */
export const computeGaugeLayout = ({
  width,
  height,
  startAngle,
  sweepAngle,
  strokeWidth,
  padding,
}: {
  width: number;
  height?: number;
  startAngle: number;
  sweepAngle: number;
  strokeWidth: number;
  padding: number;
}): GaugeLayout => {
  const inset = Math.max(0, strokeWidth / 2 + padding);
  const bounds = getUnitArcBounds(startAngle, sweepAngle);
  const spanX = Math.max(bounds.maxX - bounds.minX, 1e-6);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1e-6);

  const radiusByWidth = (width - inset * 2) / spanX;
  const radiusByHeight =
    typeof height === 'number'
      ? (height - inset * 2) / spanY
      : Number.POSITIVE_INFINITY;
  const radius = Math.max(0, Math.min(radiusByWidth, radiusByHeight));

  const finalHeight =
    typeof height === 'number' ? height : spanY * radius + inset * 2;

  // Center the arc's bounding box inside the final canvas.
  const offsetX = (width - spanX * radius) / 2;
  const offsetY = (finalHeight - spanY * radius) / 2;

  return {
    width,
    height: finalHeight,
    radius,
    cx: offsetX - bounds.minX * radius,
    cy: offsetY - bounds.minY * radius,
  };
};

/** Clamps segments to `[min, max]`, drops empty/invalid ones and sorts by `from`. */
export const normalizeGaugeSegments = (
  segments: GaugeSegment[],
  min: number,
  max: number
): GaugeNormalizedSegment[] => {
  if (!(max > min)) return [];

  return segments
    .filter((s) => Number.isFinite(s.from) && Number.isFinite(s.to))
    .map((s) => {
      const from = clamp(Math.min(s.from, s.to), min, max);
      const to = clamp(Math.max(s.from, s.to), min, max);
      return {
        ...s,
        from,
        to,
        startProgress: valueToProgress(from, min, max),
        endProgress: valueToProgress(to, min, max),
      };
    })
    .filter((s) => s.to > s.from)
    .sort((a, b) => a.from - b.from);
};

/**
 * Returns the color of the segment that contains `value`, or `fallback`.
 * Boundaries belong to the later segment, except `max` which belongs to the last one.
 */
export const getSegmentColorAt = (
  segments: GaugeNormalizedSegment[],
  value: number,
  fallback: string
) => {
  'worklet';
  let color = fallback;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]!;
    const isLast = i === segments.length - 1;
    if (value >= s.from && (value < s.to || (isLast && value === s.to))) {
      color = s.color;
    }
  }
  return color;
};

/** Evenly spaced tick values from `min` to `max` (inclusive), `count` intervals. */
export const buildGaugeTicks = (min: number, max: number, count: number) => {
  if (!(max > min)) return [];
  const intervals = Math.max(1, Math.floor(count));
  return Array.from(
    { length: intervals + 1 },
    (_, i) => min + ((max - min) * i) / intervals
  );
};
