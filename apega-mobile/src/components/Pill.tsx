import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export type PillType = 'default' | 'color';

interface PillProps {
  label?: string;
  type?: PillType;
  color?: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function Pill({
  label,
  type = 'default',
  color,
  active = false,
  onPress,
  style
}: PillProps) {
  if (type === 'color') {
    return (
      <TouchableOpacity
        style={[
          styles.colorPill,
          { backgroundColor: color || COLORS.gray[300] },
          active && styles.colorPillActive,
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      />
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        active && styles.pillActive,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.pillText,
        active && styles.pillTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS['2xl'],
    backgroundColor: COLORS.white,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  pillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
  },

  pillTextActive: {
    color: COLORS.white,
  },

  // Color Pills
  colorPill: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },

  colorPillActive: {
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
