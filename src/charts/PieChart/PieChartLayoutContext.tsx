import { createContext, useContext } from 'react';
import type { PieArcLayoutItem } from './utils';

export interface PieChartLayoutContextInterface {
  // Shared layout computed in Canvas and reused by Slices.
  // This avoids running expensive d3 + SVG->Skia conversion twice.
  layout: PieArcLayoutItem[];
  // Stable layout identifier used for animation dedupe.
  layoutSignature: string;
  // Visual offset used when a slice is selected.
  selectedSliceOffset: number;
  // Rendering parameters mirrored from Canvas.
  rounded: boolean;
  sliceThickness?: number;
  sliceGapAngle?: number;
  minDonutHoleRatio: number;
}

export const PieChartLayoutContext = createContext<
  PieChartLayoutContextInterface | undefined
>(undefined);

export const useOptionalPieChartLayout = () => {
  // Optional by design: PieChart.Slices can still compute its own layout
  // when rendered outside PieChart.Canvas (advanced/custom composition).
  return useContext(PieChartLayoutContext);
};
