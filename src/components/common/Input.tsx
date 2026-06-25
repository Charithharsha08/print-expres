import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: object;
  inputStyle?: object;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  hint,
  leftIcon,
  rightIcon,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
  onBlur,
  onFocus,
  maxLength,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrap,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
          multiline && styles.multiline,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
  style={[
    styles.input,
    leftIcon ? styles.inputPadLeft : null,
    rightIcon || isPassword ? styles.inputPadRight : null,
    multiline && styles.inputMulti,
    inputStyle,
  ]}
  value={value}
  onChangeText={onChangeText}
  placeholder={placeholder}
  placeholderTextColor={COLORS.textMuted}
  secureTextEntry={isPassword && !showPassword}
  keyboardType={keyboardType}
  autoCapitalize={autoCapitalize}
  autoCorrect={false}
  editable={editable}
  multiline={multiline}
  numberOfLines={multiline ? numberOfLines : undefined}
  maxLength={maxLength}
  onFocus={(e) => {
    setFocused(true);
    onFocus?.(e);
  }}
  onBlur={(e) => {
    setFocused(false);
    onBlur?.(e);
  }}
  {...rest}
/>

       {isPassword ? (
  <TouchableOpacity
    style={styles.iconRight}
    onPress={() => setShowPassword((v) => !v)}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    activeOpacity={0.7}
  >
    <Ionicons
      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
      size={22}
      color={COLORS.textMuted}
    />
  </TouchableOpacity>
) : rightIcon ? (
  <View style={styles.iconRight}>{rightIcon}</View>
) : null}

        {rightIcon && !isPassword && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC', // softer slate background when inactive
    minHeight: 48,
  },
  focused: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.surface,
},
  errored:   { borderColor: COLORS.error, backgroundColor: COLORS.surface },
  disabled:  { backgroundColor: COLORS.surfaceAlt, opacity: 0.7 },
  multiline: { alignItems: 'flex-start', minHeight: 100 },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  inputPadLeft:  { paddingLeft: 8 },
  inputPadRight: { paddingRight: 8 },
  inputMulti:    { paddingTop: 12, textAlignVertical: 'top' },

  iconLeft:  { paddingLeft: SPACING.md },
  iconRight: { paddingRight: SPACING.md },
  eyeIcon:   { fontSize: 16 },

  error: { fontSize: 12, color: COLORS.error, marginTop: 4, fontWeight: '500' },
  hint:  { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});

export default Input;
