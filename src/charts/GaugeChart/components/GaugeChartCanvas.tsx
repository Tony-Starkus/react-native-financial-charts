import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { GaugeChartContext, useGaugeChart } from '../GaugeChartContext';

export interface GaugeChartCanvasPropsInterface {
  /** Skia children (`Track`, `Segments`, `Progress`, `Ticks`, `Needle`). */
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GaugeChartCanvas: React.FC<GaugeChartCanvasPropsInterface> = ({
  children,
  style,
}) => {
  const context = useGaugeChart();

  return (
    <View
      style={[{ width: context.width, height: context.height }, style]}
      pointerEvents="none"
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Skia Canvas is a separate React tree: re-provide the context. */}
        <GaugeChartContext.Provider value={context}>
          {children}
        </GaugeChartContext.Provider>
      </Canvas>
    </View>
  );
};

export default GaugeChartCanvas;
