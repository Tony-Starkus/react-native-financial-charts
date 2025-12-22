// --- PURE MATH (CATMULL-ROM SPLINE) ---
/**
 * This function is the heart of the smoothing logic.
 * Instead of connecting points with straight lines (which would look jagged), we use a Spline.
 * * How it works:
 * To calculate the curve between point P1 and P2, we also look at neighbors P0 and P3.
 * This gives us the correct "tangent" (slope) so the curve flows smoothly.
 * * Parameters:
 * @param p0 - The point before the current segment
 * @param p1 - The start of the current segment
 * @param p2 - The end of the current segment
 * @param p3 - The point after the current segment
 * @param t  - The progress between p1 and p2 (0.0 to 1.0)
 */
export const solveCatmullRom = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
) => {
  const t2 = t * t;
  const t3 = t2 * t;

  // Catmull-Rom Matrix Coefficients
  const c0 = p1;
  const c1 = 0.5 * (p2 - p0);
  const c2 = 0.5 * (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3);
  const c3 = 0.5 * (-p0 + 3.0 * p1 - 3.0 * p2 + p3);

  // Interpolated result
  return c0 + c1 * t + c2 * t2 + c3 * t3;
};
