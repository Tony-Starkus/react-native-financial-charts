import type { PropsWithChildren } from 'react';
import { ChartContext, useChart } from '../LineChartContext';
import { Canvas } from '@shopify/react-native-skia';

/**
 * The wrapper for all Skia elements.
 */
const ChartCanvas: React.FC<PropsWithChildren> = ({ children }) => {
  const ctx = useChart();
  const { width, height } = ctx;
  const safeWidth = width || 1;
  const safeHeight = height || 1;

  return (
    // Skia 'Canvas' uses its own render three, separate from standard React Native views.
    <Canvas
      style={{
        width: safeWidth,
        height: safeHeight,
      }}
    >
      {/* It's necessary to re-provider the Context because the Skia Canvas creates a context boundary. */}
      <ChartContext.Provider value={ctx}>{children}</ChartContext.Provider>
    </Canvas>
  );
};

export default ChartCanvas;
