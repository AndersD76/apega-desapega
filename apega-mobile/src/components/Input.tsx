import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export type InputType = 'field' | 'textarea';

interface InputProps extends TextInputProps {
  type?: InputType;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCounter?: boolean;
  style?: ViewStyle;
}

export default function Input({
  type = 'field',
  label,
  required = false,
  error,
  helperText,
  maxLength,
  showCharCounter = false,
  style,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChangeText = (text: string) => {
    setCharCount(text.length);
    onChangeText?.(text);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];

    if (type === 'textarea') {
      baseStyle.push(styles.textarea);
    }

    if (isFocused && !error) {
      baseStyle.push(styles.inputFocused);
    }

    if (error) {
      baseStyle.push(styles.inputError);
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Field */}
      <TextInput
        style={getInputStyle()}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={COLORS.textTertiary}
        maxLength={maxLength}
        multiline={type === 'textarea'}
        numberOfLines={type === 'textarea' ? 5 : 1}
        textAlignVertical={type === 'textarea' ? 'top' : 'center'}
        {...props}
      />

      {/* Character Counter */}
      {showCharCounter && maxLength && type === 'textarea' && (
        <Text style={styles.charCounter}>
          {charCount}/{maxLength}
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },

  labelContainer: {
    marginBottom: SPACING[2],
  },

  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
  },

  required: {
    color: COLORS.error,
    marginLeft: 4,
  },

  input: {
    width: '100%',
    height: 44,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },

  textarea: {
    minHeight: 120,
    paddingVertical: SPACING[3],
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.sm,
  },

  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  inputError: {
    borderColor: COLORS.error,
  },

  charCounter: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },

  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: 4,
  },

  helperText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
