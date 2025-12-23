import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, LAYOUT } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconSize = 20,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const getContainerStyles = (): ViewStyle[] => {
    const baseStyles = [styles.button];

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyles.push(styles.buttonPrimary);
        break;
      case 'secondary':
        baseStyles.push(styles.buttonSecondary);
        break;
      case 'icon':
        baseStyles.push(styles.buttonIcon);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonSmall);
        break;
      case 'medium':
        baseStyles.push(styles.buttonMedium);
        break;
      case 'large':
        baseStyles.push(styles.buttonLarge);
        break;
    }

    // Full width
    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    // Disabled
    if (disabled) {
      baseStyles.push(styles.buttonDisabled);
    }

    return baseStyles;
  };

  const getTextStyles = (): TextStyle[] => {
    const baseStyles = [styles.buttonText];

    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyles.push(styles.textPrimary);
        break;
      case 'secondary':
        baseStyles.push(styles.textSecondary);
        break;
    }

    // Size text styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.textSmall);
        break;
      case 'medium':
        baseStyles.push(styles.textMedium);
        break;
      case 'large':
        baseStyles.push(styles.textLarge);
        break;
    }

    // Disabled
    if (disabled) {
      baseStyles.push(styles.textDisabled);
    }

    return baseStyles;
  };

  const getIconColor = () => {
    if (disabled) return COLORS.gray[400];
    if (variant === 'secondary' || variant === 'icon') return COLORS.primary;
    return COLORS.white;
  };

  return (
    <TouchableOpacity
      style={[...getContainerStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'icon' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon && variant !== 'icon' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} style={styles.iconLeft} />
          )}
          {icon && variant === 'icon' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} />
          )}
          {label && variant !== 'icon' && (
            <Text style={[...getTextStyles(), textStyle]}>{label}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    minHeight: LAYOUT.minTouchTarget,
  },

  // Variants
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  buttonIcon: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: LAYOUT.minTouchTarget,
    height: LAYOUT.minTouchTarget,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // Sizes
  buttonSmall: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  buttonMedium: {
    minHeight: LAYOUT.minTouchTarget,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  buttonLarge: {
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },

  // States
  buttonDisabled: {
    opacity: 0.5,
  },

  fullWidth: {
    width: '100%',
  },

  // Text
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },

  textPrimary: {
    color: COLORS.white,
  },

  textSecondary: {
    color: COLORS.primary,
  },

  textSmall: {
    fontSize: 12,
  },

  textMedium: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  textLarge: {
    fontSize: TYPOGRAPHY.sizes.base,
  },

  textDisabled: {
    opacity: 0.7,
  },

  iconLeft: {
    marginRight: SPACING.xs,
  },
});
