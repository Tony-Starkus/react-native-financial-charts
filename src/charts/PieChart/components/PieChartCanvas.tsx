import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { PieChartContext, usePieChart } from '../PieChartContext';
import { buildPieLayout, getPieLayoutSignature } from '../utils';
import { PieChartLayoutContext } from '../PieChartLayoutContext';

export interface PieChartCanvasPropsInterface {
  children: React.ReactNode;
  /** Enables rounded arc corners in donut mode. */
  rounded?: boolean;
  /** Thickness of the arc stroke. Can force donut -> pie transition. */
  sliceThickness?: number;
  /** Visual gap between slices (degrees). */
  sliceGapAngle?: number;
  /** Distance (px) a selected slice moves away from center. */
  selectedSliceOffset?: number;
  /** Relative threshold to switch from donut to pie mode. */
  minDonutHoleRatio?: number;
  /** Enables/disables tap selection interaction. */
  selectable?: boolean;
}

const PieChartCanvas: React.FC<PieChartCanvasPropsInterface> = ({
  children,
  rounded = false,
  sliceThickness,
  sliceGapAngle,
  selectedSliceOffset = 12,
  minDonutHoleRatio = 0.6,
  selectable = false,
}) => {
  const pieContext = usePieChart();
  const {
    data,
    centerX,
    centerY,
    radius,
    innerRadius,
    size,
    startAngle,
    direction,
    sliceGapAngle: rootGap,
    selectedIndex,
    notifySelection,
  } = pieContext;

  // 1) Resolve effective drawing thickness.
  // Clamp to avoid invalid geometry and very large values.
  const requestedThickness = sliceThickness ?? radius - innerRadius;
  const clampedThickness = Math.max(1, Math.min(requestedThickness, radius));
  const effectiveInnerRadius = Math.max(radius - clampedThickness, 0);
  const effectiveThickness = radius - effectiveInnerRadius;

  // 2) Auto-switch to pie mode when the donut hole becomes too small.
  // This prevents awkward "almost pie" visuals with tiny center holes.
  const minDonutHoleRadius = radius * minDonutHoleRatio;
  const isPieMode = effectiveInnerRadius <= minDonutHoleRadius;

  // 3) In pie mode, disable gap and rounded corners to avoid bubble artifacts.
  const requestedGap = sliceGapAngle ?? rootGap;
  const effectiveGap = isPieMode ? 0 : requestedGap;
  const cornerRadius =
    rounded && !isPieMode ? Math.max(0, effectiveThickness / 2) : 0;

  // 4) Build a stable signature for the current layout inputs.
  // This signature is reused both by:
  // - local memoization
  // - global LRU cache inside buildPieLayout.
  const layoutSignature = useMemo(
    () =>
      getPieLayoutSignature({
        data,
        innerRadius: effectiveInnerRadius,
        outerRadius: radius,
        sliceGapAngle: effectiveGap,
        cornerRadius,
        startAngle,
        direction,
      }),
    [
      data,
      effectiveInnerRadius,
      radius,
      effectiveGap,
      cornerRadius,
      startAngle,
      direction,
    ]
  );

  // 5) Build the geometric layout once per input set.
  // The result includes paths + metadata needed by render and hit-test.
  const layout = useMemo(
    () =>
      buildPieLayout({
        data,
        innerRadius: effectiveInnerRadius,
        outerRadius: radius,
        sliceGapAngle: effectiveGap,
        cornerRadius,
        startAngle,
        direction,
        layoutSignature,
      }),
    [
      data,
      effectiveInnerRadius,
      radius,
      effectiveGap,
      cornerRadius,
      startAngle,
      direction,
      layoutSignature,
    ]
  );

  // 6) Tap gesture:
  // - runs on JS thread (`runOnJS(true)`) because we call JS callbacks.
  // - performs hit-test against already-built Skia paths.
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .enabled(selectable)
    .onStart((event) => {
      const { x, y } = event;

      if (!layout.length) {
        selectedIndex.value = -1;
        notifySelection(-1);
        return;
      }

      const localX = x - centerX;
      const localY = y - centerY;
      let foundIndex = -1;

      // Check from topmost to bottommost to match visual stacking.
      for (let i = layout.length - 1; i >= 0; i--) {
        const slice = layout[i];
        if (!slice?.path) continue;

        const isSelectedSlice = selectedIndex.value === i;
        const radians = slice.midAngle - Math.PI / 2;
        const offsetX = isSelectedSlice
          ? Math.cos(radians) * selectedSliceOffset
          : 0;
        const offsetY = isSelectedSlice
          ? Math.sin(radians) * selectedSliceOffset
          : 0;

        // Invert the visual translation before hit-test.
        const testX = localX - offsetX;
        const testY = localY - offsetY;

        if (slice.path.contains(testX, testY)) {
          foundIndex = i;
          break;
        }
      }

      // Toggle selection: tapping selected slice deselects it.
      const nextIndex = selectedIndex.value === foundIndex ? -1 : foundIndex;
      selectedIndex.value = nextIndex;
      notifySelection(nextIndex);
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        style={[styles.container, { width: size, height: size }]}
        collapsable={false}
      >
        <Canvas style={StyleSheet.absoluteFill}>
          <PieChartContext.Provider value={pieContext}>
            {/* Shared layout context avoids duplicate layout computation in Slices. */}
            <PieChartLayoutContext.Provider
              value={{
                layout,
                layoutSignature,
                selectedSliceOffset,
                rounded,
                sliceThickness,
                sliceGapAngle,
                minDonutHoleRatio,
              }}
            >
              {children}
            </PieChartLayoutContext.Provider>
          </PieChartContext.Provider>
        </Canvas>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export default PieChartCanvas;
