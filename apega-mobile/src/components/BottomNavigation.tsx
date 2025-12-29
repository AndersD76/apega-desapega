import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';

type TabName = 'Home' | 'Search' | 'Sell' | 'Favorites' | 'Profile';

interface BottomNavigationProps {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const tabs: { key: TabName; icon: keyof typeof Ionicons.glyphMap; iconFilled: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'Home', icon: 'home-outline', iconFilled: 'home', label: 'Início' },
  { key: 'Search', icon: 'search-outline', iconFilled: 'search', label: 'Buscar' },
  { key: 'Sell', icon: 'add', iconFilled: 'add', label: 'Vender' },
  { key: 'Favorites', icon: 'heart-outline', iconFilled: 'heart', label: 'Favoritos' },
  { key: 'Profile', icon: 'person-outline', iconFilled: 'person', label: 'Perfil' },
];

export function BottomNavigation({ currentTab, onTabPress }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {/* Blur effect background */}
      <View style={styles.blur} />

      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const isSell = tab.key === 'Sell';

          if (isSell) {
            return (
              <Pressable
                key={tab.key}
                style={styles.sellButtonContainer}
                onPress={() => onTabPress(tab.key)}
              >
                <LinearGradient
                  colors={[colors.brand, colors.brandLight]}
                  style={styles.sellButton}
                >
                  <Ionicons name="add" size={28} color={colors.white} />
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress(tab.key)}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Ionicons
                  name={isActive ? tab.iconFilled : tab.icon}
                  size={22}
                  color={isActive ? colors.brand : colors.gray400}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  iconContainerActive: {
    backgroundColor: colors.brandMuted,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray400,
  },
  labelActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  sellButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: -20,
  },
  sellButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brand(0.4),
  },
});

export default BottomNavigation;
