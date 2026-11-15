import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useAnimatedProps } from 'react-native-reanimated';
import AnimatedTextInput from '../../../components/AnimatedTextInput';
import { useGaugeChart } from '../GaugeChartContext';

export interface GaugeChartValuePropsInterface {
  /**
   * Formats the animated value. Runs on the UI thread: must be a worklet
   * (add `'worklet';`) and use only worklet-safe APIs.
   */
  format?: (value: number) => string;
  /**
   * Vertical offset of the label center relative to the arc center, in pixels.
   * Defaults to `radius * 0.35` (below the needle pivot).
   */
  offsetY?: number;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Animated numeric label. Render it inside `GaugeChart.Root`, outside `Canvas`.
 */
const GaugeChartValue: React.FC<GaugeChartValuePropsInterface> = ({
  format,
  offsetY,
  style,
  containerStyle,
}) => {
  const { animatedValue, cy, radius } = useGaugeChart();

  const textProps = useAnimatedProps(() => {
    if (format) return { text: format(animatedValue.value) };
    return { text: `${Math.round(animatedValue.value)}` };
  });

  // Fixed-height row centered on `cy + offsetY`.
  const rowHeight = 40;
  const top = cy + (offsetY ?? radius * 0.35) - rowHeight / 2;

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { top, height: rowHeight }, containerStyle]}
    >
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue=""
        animatedProps={textProps}
        style={[styles.text, style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
});

GaugeChartValue.displayName = 'GaugeChartValue';

export default GaugeChartValue;
