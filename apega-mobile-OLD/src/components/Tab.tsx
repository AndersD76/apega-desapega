import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export interface TabItem {
  id: string;
  label: string;
}

interface TabProps {
  items: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  scrollable?: boolean;
  style?: ViewStyle;
}

export default function Tab({
  items,
  activeTab,
  onTabPress,
  scrollable = true,
  style,
}: TabProps) {
  const renderTab = (item: TabItem) => {
    const isActive = item.id === activeTab;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.tabItem,
          isActive && styles.tabItemActive,
        ]}
        onPress={() => onTabPress(item.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabLabel,
            isActive && styles.tabLabelActive,
          ]}
        >
          {item.label}
        </Text>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.container, style]}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map(renderTab)}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, styles.containerStatic, style]}>
      {items.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  containerStatic: {
    flexDirection: 'row',
  },

  scrollContent: {
    paddingHorizontal: SPACING.md,
  },

  tabItem: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    minHeight: 44, // Minimum touch target
  },

  tabItemActive: {
    // Active state styling
  },

  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },

  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
});
