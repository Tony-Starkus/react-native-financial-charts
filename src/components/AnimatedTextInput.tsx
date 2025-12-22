import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

// This trick allows animate the 'text' property of a TextInput directly from Reanimated
// Because React Native <Text> nodes cannot have their text updated 60 times a second without performance issues.
// <TextInput editable={false} /> acts as a hgh-performance Label.

// 1. Whitelist the native 'text' prop so Reanimated can modify it directly
Animated.addWhitelistedNativeProps({ text: true });

// 2. Extends the standard props to include 'text'
interface AnimatedTextInputProps extends TextInputProps {
  text?: string;
}

// 3. Create the component
const AnimatedTextInputComponent = Animated.createAnimatedComponent(TextInput);

// 4. Export with strict typing casting
// We cast it as a Component that accepts AnimatedTextInputProps
const AnimatedTextInput =
  AnimatedTextInputComponent as unknown as React.ComponentClass<
    AnimatedProps<AnimatedTextInputProps>
  >;

export default AnimatedTextInput;
