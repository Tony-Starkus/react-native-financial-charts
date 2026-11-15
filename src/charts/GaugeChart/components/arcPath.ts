import { Skia } from '@shopify/react-native-skia';

/** Builds a Skia arc path. Angles in degrees, 0 = 3 o'clock, clockwise. */
export const buildArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number
) => {
  const path = Skia.Path.Make();
  if (radius <= 0 || sweepAngle <= 0) return path;

  path.addArc(
    { x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2 },
    startAngle,
    // Skia turns a 360° arc into an oval with a different start point; keep it an arc.
    Math.min(sweepAngle, 359.999)
  );
  return path;
};
