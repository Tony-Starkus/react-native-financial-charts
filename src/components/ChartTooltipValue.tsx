import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useChart } from '../ChartContext';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import AnimatedTextInput from './AnimatedTextInput';

export interface IProps {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  format?: (value: number) => string;
}

const ChartTooltipPrice: React.FC<IProps> = ({
  style,
  containerStyle,
  format,
}) => {
  const { currentX, isActive, currentValue, width, padding } = useChart();

  // Track te dynamic width of tooltip
  const tooltipWidth = useSharedValue(0);

  // Moves the tooltip left/right with the cursor
  const containerAnimatedStyle = useAnimatedStyle(() => {
    // 1. Calculate the ideal centered position
    let translateX = currentX.value - tooltipWidth.value / 2;

    // 2. Clamp logic (Boundary Protection)
    // Left Boundary: Ensure tooltip doesn't go off-screen to the left (using padding to align with line chart path)
    if (translateX < padding) {
      translateX = padding;
    }

    // Right Boundary: Ensure tooltip doesn't go off-screen to the right (using padding to align with line chart path)
    if (translateX + tooltipWidth.value > width - padding) {
      translateX = width - padding - tooltipWidth.value;
    }

    return {
      opacity: withSpring(isActive.value ? 1 : 0),
      transform: [
        // Calculate dynamic centering (Position X - Half of Width)
        { translateX },
      ],
    };
  });

  // Updates the text content directly on the Native UI Thread
  // This is a special Reanimated feature for TextInput/Text inputs.
  const textProps = useAnimatedProps(() => {
    if (format) return { text: format(currentValue.value) };
    return { text: `$ ${currentValue.value.toFixed(2)}` };
  });

  return (
    <Animated.View
      onLayout={(event) =>
        (tooltipWidth.value = event.nativeEvent.layout.width)
      }
      style={[styles.tooltipContainer, containerStyle, containerAnimatedStyle]}
    >
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false} // Makes it look like a Text label, not an input
        defaultValue=""
        animatedProps={textProps}
        style={[styles.tooltipChipText, style]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#323546',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 20,
    top: 10,
  },
  tooltipChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    padding: 0,
    textAlign: 'center',
  },
});

export default ChartTooltipPrice;
