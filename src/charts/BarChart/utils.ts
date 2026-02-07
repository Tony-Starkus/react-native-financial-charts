/**
 * Calculates a "nice" scale for chart axes.
 * Ensures ticks are round numbers (1, 2, 5, 10, 0.1, 0.01, etc.)
 */

export const calculateNiceScale = (
  minValue: number,
  maxValue: number,
  maxTicks: number = 5
) => {
  // Edge case: All values are 0 or equal
  if (minValue === maxValue) {
    if (maxValue === 0) maxValue = 1;
    else maxValue = maxValue + Math.abs(maxValue) * 0.1;
  }

  // Ensure range is never 0
  const range = maxValue - minValue;

  // 1. Calculate a "rough" step based on the desired number of ticks
  const roughStep = range / (maxTicks - 1);

  // 2. Normalize this step to a number between 1 and 10 (mantissa)
  // Example: 0.0000153 -> log10 is -4.8 -> exponent is -5 -> 1.53
  const stepPower = Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / Math.pow(10, stepPower);

  // 3. Choose a "nice" step from standard intervals [1, 2, 5, 10]
  let niceStep;
  if (normalizedStep < 1.5) niceStep = 1;
  else if (normalizedStep < 3) niceStep = 2;
  else if (normalizedStep < 7) niceStep = 5;
  else niceStep = 10;

  const step = niceStep * Math.pow(10, stepPower);

  // 4. Recalculate Min/Max based on the new nice step
  const niceMin = Math.floor(minValue / step) * step;
  const niceMax = Math.ceil(maxValue / step) * step;

  // 5. Generate Ticks
  // Determine precision needed to fix floating point errors
  // If step is 0.00002 (power -5), we need 5 decimal places
  const precision = stepPower < 0 ? Math.abs(stepPower) : 0;

  const ticks = [];
  const count = Math.round((niceMax - niceMin) / step);

  for (let i = 0; i <= count; i++) {
    const val = niceMin + i * step;
    // Fix artifacts like 0.00006000000000000001
    ticks.push(parseFloat(val.toFixed(precision)));
  }

  return {
    min: niceMin,
    max: niceMax,
    tickSpacing: step,
    ticks,
  };
};
