import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

interface HeaderProps {
  navigation: any;
  title: string;
  showBack?: boolean;
  variant?: 'light' | 'dark' | 'primary';
  rightActions?: React.ReactNode;
}

export default function Header({
  navigation,
  title,
  showBack = true,
  variant = 'light',
  rightActions
}: HeaderProps) {
  const isDark = variant === 'dark' || variant === 'primary';
  const backgroundColor = variant === 'primary' ? COLORS.primary : variant === 'dark' ? COLORS.textPrimary : COLORS.white;
  const textColor = isDark ? COLORS.white : COLORS.textPrimary;
  const iconColor = isDark ? COLORS.white : COLORS.textPrimary;

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
        </View>

        {rightActions && (
          <View style={styles.headerRight}>
            {rightActions}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: (StatusBar.currentHeight || 40) + 12,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: 4,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
