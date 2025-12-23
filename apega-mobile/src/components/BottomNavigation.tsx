import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const isWeb = Platform.OS === 'web';

interface BottomNavigationProps {
  navigation: any;
  activeRoute?: string;
}

const NAV_ITEMS = [
  { key: 'Home', icon: 'home', label: 'inicio' },
  { key: 'Search', icon: 'search', label: 'buscar' },
  { key: 'NewItem', icon: 'add', label: 'vender', isCenter: true },
  { key: 'Favorites', icon: 'heart', label: 'curtidos' },
  { key: 'Profile', icon: 'person', label: 'perfil' },
];

export default function BottomNavigation({ navigation, activeRoute = 'Home' }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const isDesktop = isWeb && width > 768;

  if (isDesktop) {
    return null;
  }

  const navigateWithAuth = (route: string, redirectTo?: string) => {
    if (isAuthenticated) {
      navigation.navigate(route);
    } else if (redirectTo) {
      navigation.navigate('Login', { redirectTo });
    } else {
      navigation.navigate('Login');
    }
  };

  const handlePress = (key: string) => {
    if (key === 'NewItem') {
      navigateWithAuth(key, 'NewItem');
    } else if (key === 'Favorites') {
      navigateWithAuth(key);
    } else {
      navigation.navigate(key);
    }
  };

  const renderNavItem = (item: typeof NAV_ITEMS[0]) => {
    const isActive = activeRoute === item.key;

    if (item.isCenter) {
      return (
        <TouchableOpacity
          key={item.key}
          style={styles.centerButton}
          onPress={() => handlePress(item.key)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerButtonGradient}
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.key}
        style={styles.navItem}
        onPress={() => handlePress(item.key)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
          <Ionicons
            name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)}
            size={24}
            color={isActive ? COLORS.primary : COLORS.textTertiary}
          />
        </View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const NavContent = () => (
    <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {NAV_ITEMS.map(renderNavItem)}
    </View>
  );

  // Usa BlurView no iOS para efeito glassmorphism
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={80} tint="light" style={styles.container}>
        <NavContent />
      </BlurView>
    );
  }

  // Fallback para Android e Web com fundo semi-transparente
  return (
    <View style={[styles.container, styles.containerFallback]}>
      <NavContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {},
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      },
    }),
  },
  containerFallback: {
    backgroundColor: COLORS.glassDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    borderRadius: 16,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primaryExtraLight,
  },
  navLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    marginHorizontal: 4,
  },
  centerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
    ...SHADOWS.primary,
  },
});
