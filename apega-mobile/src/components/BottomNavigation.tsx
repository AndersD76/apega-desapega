import React from 'react';
import { View, Text, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
          className="items-center justify-center -mt-6 mx-1"
          onPress={() => handlePress(item.key)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#61005D', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-14 h-14 rounded-full items-center justify-center border-4 border-surface shadow-primary"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.key}
        className="flex-1 items-center justify-center py-1"
        onPress={() => handlePress(item.key)}
        activeOpacity={0.7}
      >
        <View className={`items-center justify-center w-11 h-8 rounded-2xl ${isActive ? 'bg-primary-extraLight' : ''}`}>
          <Ionicons
            name={isActive ? (item.icon as any) : (`${item.icon}-outline` as any)}
            size={24}
            color={isActive ? '#61005D' : '#9CA3AF'}
          />
        </View>
        <Text className={`text-[11px] mt-1 ${isActive ? 'text-primary font-semibold' : 'text-text-tertiary font-medium'}`}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const NavContent = () => (
    <View
      className="flex-row items-end justify-around pt-2 px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {NAV_ITEMS.map(renderNavItem)}
    </View>
  );

  // Use BlurView on iOS for glassmorphism effect
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        tint="light"
        className="absolute bottom-0 left-0 right-0"
      >
        <NavContent />
      </BlurView>
    );
  }

  // Fallback for Android and Web
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-glass-dark border-t border-glass-border shadow-nav">
      <NavContent />
    </View>
  );
}
