import { createContext, useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {
  GaugeChartContextInterface,
  GaugeChartRootPropsInterface,
} from './interfaces';
import {
  clamp,
  computeGaugeLayout,
  DEFAULT_END_ANGLE,
  DEFAULT_START_ANGLE,
  normalizeGaugeAngles,
  normalizeGaugeSegments,
  valueToProgress,
} from './utils';

export const GaugeChartContext = createContext<
  GaugeChartContextInterface | undefined
>(undefined);

const EMPTY_SEGMENTS: GaugeChartRootPropsInterface['segments'] = [];

const GaugeChartProvider: React.FC<GaugeChartRootPropsInterface> = ({
  value,
  min = 0,
  max = 100,
  width = 300,
  height,
  startAngle: startAngleProp = DEFAULT_START_ANGLE,
  endAngle: endAngleProp = DEFAULT_END_ANGLE,
  strokeWidth = 20,
  padding = 8,
  segments = EMPTY_SEGMENTS,
  animated = true,
  animationDuration = 600,
  containerStyle,
  children,
}) => {
  const { startAngle, sweepAngle, endAngle } = useMemo(
    () => normalizeGaugeAngles(startAngleProp, endAngleProp),
    [startAngleProp, endAngleProp]
  );

  const layout = useMemo(
    () =>
      computeGaugeLayout({
        width,
        height,
        startAngle,
        sweepAngle,
        strokeWidth,
        padding,
      }),
    [width, height, startAngle, sweepAngle, strokeWidth, padding]
  );

  const normalizedSegments = useMemo(
    () => normalizeGaugeSegments(segments ?? [], min, max),
    [segments, min, max]
  );

  const safeValue =
    max > min && Number.isFinite(value) ? clamp(value, min, max) : min;

  // Start from `min` when animated so the first render sweeps into place.
  const animatedValue = useSharedValue(animated ? min : safeValue);

  useEffect(() => {
    animatedValue.value =
      animated && animationDuration > 0
        ? withTiming(safeValue, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
          })
        : safeValue;
  }, [safeValue, animated, animationDuration, animatedValue]);

  const progress = useDerivedValue(
    () => valueToProgress(animatedValue.value, min, max),
    [min, max]
  );

  return (
    <GaugeChartContext.Provider
      value={{
        min,
        max,
        value: safeValue,
        animatedValue,
        progress,
        startAngle,
        sweepAngle,
        endAngle,
        strokeWidth,
        segments: normalizedSegments,
        ...layout,
      }}
    >
      <View
        style={[
          styles.container,
          { width: layout.width, height: layout.height },
          containerStyle,
        ]}
      >
        {children}
      </View>
    </GaugeChartContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export const useGaugeChart = () => {
  const context = useContext(GaugeChartContext);
  if (!context)
    throw new Error(
      'GaugeChart components must be used within GaugeChart.Root'
    );
  return context;
};

export default GaugeChartProvider;
