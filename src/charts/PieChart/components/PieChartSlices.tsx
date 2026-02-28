import React, { useEffect, useMemo, useRef } from 'react';
import { Group, Path, type SkPath } from '@shopify/react-native-skia';
import {
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { usePieChart } from '../PieChartContext';
import { buildPieLayout, getPieLayoutSignature } from '../utils';
import { useOptionalPieChartLayout } from '../PieChartLayoutContext';

export interface PieChartSlicesPropsInterface {
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
}

export const PieChartSlices: React.FC<PieChartSlicesPropsInterface> = ({
  rounded = false,
  sliceThickness,
  sliceGapAngle,
  selectedSliceOffset,
  minDonutHoleRatio = 0.6,
}) => {
  const layoutContext = useOptionalPieChartLayout();
  const {
    data,
    radius,
    innerRadius,
    centerX,
    centerY,
    startAngle,
    direction,
    sliceGapAngle: rootGap,
  } = usePieChart();

  // 1) Resolve effective geometry from props/context.
  // This mirrors Canvas rules so drawing and hit-test stay consistent.
  const requestedThickness = sliceThickness ?? radius - innerRadius;
  const clampedThickness = Math.max(1, Math.min(requestedThickness, radius));
  const effectiveInnerRadius = Math.max(radius - clampedThickness, 0);
  const effectiveThickness = radius - effectiveInnerRadius;
  const minDonutHoleRadius = radius * minDonutHoleRatio;
  const isPieMode = effectiveInnerRadius <= minDonutHoleRadius;
  const requestedGap = sliceGapAngle ?? rootGap;
  const effectiveGap = isPieMode ? 0 : requestedGap;
  const cornerRadius =
    rounded && !isPieMode ? Math.max(0, effectiveThickness / 2) : 0;

  // 2) If Canvas already computed a compatible layout, reuse it.
  // This removes duplicate d3 + SVG->Skia work and improves frame stability.
  const shouldUseLayoutFromCanvas =
    !!layoutContext &&
    (sliceThickness === undefined ||
      sliceThickness === layoutContext.sliceThickness) &&
    (sliceGapAngle === undefined ||
      sliceGapAngle === layoutContext.sliceGapAngle) &&
    rounded === layoutContext.rounded &&
    minDonutHoleRatio === layoutContext.minDonutHoleRatio;

  // 3) Signature used by animation dedupe and layout cache.
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

  const layout = useMemo(() => {
    if (shouldUseLayoutFromCanvas) {
      // Reuse precomputed layout from Canvas whenever possible.
      return layoutContext.layout;
    }

    return buildPieLayout({
      data,
      innerRadius: effectiveInnerRadius,
      outerRadius: radius,
      sliceGapAngle: effectiveGap,
      cornerRadius,
      startAngle,
      direction,
      layoutSignature,
    });
  }, [
    shouldUseLayoutFromCanvas,
    layoutContext,
    data,
    effectiveInnerRadius,
    radius,
    effectiveGap,
    cornerRadius,
    startAngle,
    direction,
    layoutSignature,
  ]);

  // 4) Animation key:
  // - uses shared Canvas signature when layout is reused
  // - otherwise uses local signature
  // This prevents replaying entry animation on unrelated parent rerenders.
  const animationKey = shouldUseLayoutFromCanvas
    ? layoutContext.layoutSignature
    : layoutSignature;

  const effectiveSelectedSliceOffset =
    selectedSliceOffset ?? layoutContext?.selectedSliceOffset ?? 12;

  const revealProgress = useSharedValue(0);
  const previousAnimationKeyRef = useRef<string | null>(null);

  // 5) Re-run reveal animation only when layout meaningfully changes.
  useEffect(() => {
    if (previousAnimationKeyRef.current === animationKey) return;
    previousAnimationKeyRef.current = animationKey;

    revealProgress.value = 0;
    revealProgress.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [animationKey, revealProgress]);

  return (
    <Group transform={[{ translateX: centerX }, { translateY: centerY }]}>
      {layout.map((slice) => {
        if (!slice.path) return null;
        return (
          <SelectableSlice
            key={`slice-${slice.index}`}
            index={slice.index}
            midAngle={slice.midAngle}
            path={slice.path}
            color={slice.data.color ?? '#9CA3AF'}
            selectedSliceOffset={effectiveSelectedSliceOffset}
            revealProgress={revealProgress}
            total={layout.length}
          />
        );
      })}
    </Group>
  );
};

// Isolated slice component:
// keeps per-slice animation state localized and cheap to update.
const SelectableSlice: React.FC<{
  index: number;
  midAngle: number;
  path: SkPath;
  color: string;
  selectedSliceOffset: number;
  revealProgress: { value: number };
  total: number;
}> = ({
  index,
  midAngle,
  path,
  color,
  selectedSliceOffset,
  revealProgress,
  total,
}) => {
  const { selectedIndex } = usePieChart();
  const offsetProgress = useSharedValue(0);

  // Animate only when this specific slice's selected state changes.
  useAnimatedReaction(
    () => selectedIndex.value === index,
    (isSelected) => {
      offsetProgress.value = withTiming(isSelected ? 1 : 0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    },
    [selectedIndex, index]
  );

  const transform = useDerivedValue(() => {
    const totalSafe = Math.max(total, 1);
    const start = (index / totalSafe) * 0.35;
    const normalized = Math.max(
      0,
      Math.min(1, (revealProgress.value - start) / (1 - start))
    );

    const radians = midAngle - Math.PI / 2;
    const tx = Math.cos(radians) * selectedSliceOffset * offsetProgress.value;
    const ty = Math.sin(radians) * selectedSliceOffset * offsetProgress.value;

    // Light pop-in from center avoids path-trim artifacts on rounded donuts.
    const scale = 0.92 + 0.08 * normalized;
    return [
      { translateX: tx },
      { translateY: ty },
      { scaleX: scale },
      { scaleY: scale },
    ];
  }, [
    midAngle,
    selectedSliceOffset,
    offsetProgress,
    revealProgress,
    index,
    total,
  ]);

  const opacity = useDerivedValue(() => {
    const totalSafe = Math.max(total, 1);
    const start = (index / totalSafe) * 0.35;
    return Math.max(
      0,
      Math.min(1, (revealProgress.value - start) / (1 - start))
    );
  }, [index, total, revealProgress]);

  return (
    <Path path={path} color={color} transform={transform} opacity={opacity} />
  );
};

export default PieChartSlices;
