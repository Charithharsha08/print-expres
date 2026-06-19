import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: object;
  textStyle?: object;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, { damping: 12, stiffness: 250 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}` as keyof typeof styles],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : COLORS.primary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}` as keyof typeof styles],
              styles[`labelSize_${size}` as keyof typeof styles],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};


const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { marginRight: 2 },

  // Variants
  primary:   { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.surfaceAlt },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: COLORS.error },

  // Sizes
  size_sm: { paddingVertical: 8,  paddingHorizontal: SPACING.md, minHeight: 36 },
  size_md: { paddingVertical: 13, paddingHorizontal: SPACING.lg, minHeight: 48 },
  size_lg: { paddingVertical: 17, paddingHorizontal: SPACING.xl, minHeight: 56 },

  // Label colors
  label:          { fontWeight: '600', letterSpacing: 0.2 },
  label_primary:  { color: COLORS.textOnDark },
  label_secondary:{ color: COLORS.textPrimary },
  label_outline:  { color: COLORS.primary },
  label_ghost:    { color: COLORS.primary },
  label_danger:   { color: COLORS.textOnDark },

  // Label sizes
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 16 },

  disabled: { opacity: 0.45 },
});

export default Button;
