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

const ChartTooltipDate: React.FC<IProps> = ({
  style,
  containerStyle,
  format,
}) => {
  const { currentX, isActive, currentTimestamp, width, padding } = useChart();

  // Shared value to track the dynamic width of the tooltip
  const tooltipWidth = useSharedValue(0);

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

  const textProps = useAnimatedProps(() => {
    if (format) return { text: format(currentTimestamp.value) };
    const date = new Date(currentTimestamp.value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return { text: `${day}/${month}/${year}` };
  });

  return (
    <Animated.View
      onLayout={(event) =>
        (tooltipWidth.value = event.nativeEvent.layout.width)
      }
      style={[styles.tooltipContainer, containerAnimatedStyle, containerStyle]}
    >
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue="00/00/0000"
        style={[styles.tooltipChipText, style]}
        animatedProps={textProps}
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
    bottom: 10,
  },
  tooltipChipText: {
    color: '#858CA2',
    fontWeight: '600',
    fontSize: 11,
    padding: 0,
    textAlign: 'center',
  },
});

export default ChartTooltipDate;
