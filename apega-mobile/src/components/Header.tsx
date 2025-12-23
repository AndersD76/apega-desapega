import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  showSearch?: boolean;
  cartCount?: number;
}

export function Header({
  onSearchPress,
  onNotificationPress,
  onCartPress,
  showSearch = true,
  cartCount = 0,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>apega</Text>
        <Text style={styles.logoAccent}>desapega</Text>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <Pressable style={styles.searchContainer} onPress={onSearchPress}>
          <Ionicons name="search" size={18} color={colors.gray400} />
          <Text style={styles.searchPlaceholder}>Buscar produtos, marcas...</Text>
        </Pressable>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={colors.gray700} />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={onCartPress}>
          <Ionicons name="bag-outline" size={24} color={colors.gray700} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  logoAccent: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.gray400,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.brand,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Header;
