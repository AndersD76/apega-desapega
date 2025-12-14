import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation, AppHeader, Button } from '../components';
import { loadToken, removeToken } from '../services/api';
import { getCurrentUser } from '../services/authService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface User {
  id: string;
  name: string;
  email: string;
  rating: number;
  total_reviews: number;
  total_sales: number;
  avatar_url: string | null;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor?: string;
}

export default function ProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on focus
  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await loadToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Try to get current user
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    setUser(null);
    setIsAuthenticated(false);
    navigation.navigate('Login');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const renderSectionTitle = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderDivider = () => <View style={styles.divider} />;

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={item.iconColor || COLORS.textPrimary}
        style={styles.menuIcon}
      />
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  // Menu sections - usando dados reais quando disponíveis
  const activityMenu: MenuItem[] = [
    {
      icon: 'heart',
      title: 'favoritos',
      subtitle: 'produtos salvos',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      icon: 'cube',
      title: 'pedidos',
      subtitle: 'histórico de compras',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'briefcase',
      title: 'vendas',
      subtitle: user?.total_sales ? `${user.total_sales} vendas` : 'suas vendas',
      onPress: () => navigation.navigate('Sales'),
    },
    {
      icon: 'star',
      title: 'avaliações',
      subtitle: user?.total_reviews ? `${user.total_reviews} avaliações` : 'avaliações recebidas',
      onPress: () => navigation.navigate('Reviews'),
    },
  ];

  const storeMenu: MenuItem[] = [
    {
      icon: 'storefront',
      title: 'minha loja',
      subtitle: 'gerenciar produtos',
      onPress: () => navigation.navigate('MyStore'),
    },
    {
      icon: 'add-circle',
      title: 'anunciar produto',
      subtitle: 'adicione novos produtos',
      onPress: () => navigation.navigate('NewItem'),
    },
    {
      icon: 'bar-chart',
      title: 'estatísticas',
      subtitle: 'veja seu desempenho',
      onPress: () => navigation.navigate('Sales'),
    },
  ];

  const financialMenu: MenuItem[] = [
    {
      icon: 'star',
      title: 'seja premium',
      subtitle: 'taxa de apenas 1% por venda',
      onPress: () => navigation.navigate('Subscription'),
      iconColor: COLORS.premium,
    },
    {
      icon: 'wallet',
      title: 'saldo e cashback',
      subtitle: 'ver saldo disponível',
      onPress: () => navigation.navigate('Balance'),
    },
    {
      icon: 'card',
      title: 'formas de pagamento',
      subtitle: 'gerenciar cartões',
      onPress: () => navigation.navigate('Payments'),
    },
    {
      icon: 'location',
      title: 'endereços',
      subtitle: 'endereços de entrega',
      onPress: () => navigation.navigate('Addresses'),
    },
  ];

  const moreMenu: MenuItem[] = [
    {
      icon: 'help-circle',
      title: 'ajuda e suporte',
      subtitle: 'tire suas dúvidas',
      onPress: () => navigation.navigate('Help'),
    },
    {
      icon: 'document-text',
      title: 'termos e privacidade',
      subtitle: 'políticas do app',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      icon: 'log-out',
      title: 'sair',
      subtitle: 'desconectar da conta',
      onPress: handleLogout,
      iconColor: COLORS.error,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} />
        <View style={styles.loginPromptContainer}>
          <View style={styles.loginPromptIcon}>
            <Ionicons name="person-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.loginPromptTitle}>entre na sua conta</Text>
          <Text style={styles.loginPromptText}>
            faça login para acessar seu perfil, favoritos, compras e muito mais
          </Text>
          <Button
            label="entrar"
            variant="primary"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerText}>
              não tem conta? <Text style={styles.registerLink}>cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Authenticated - show profile
  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={i < Math.floor(user.rating || 0) ? '#FFD700' : COLORS.gray[300]}
              />
            ))}
            <Text style={styles.ratingText}>({user.total_reviews || 0} avaliações)</Text>
          </View>

          <Button
            label="editar perfil"
            variant="primary"
            onPress={handleEditProfile}
            style={styles.editButton}
          />
        </View>

        {renderDivider()}

        {/* Sua Atividade */}
        {renderSectionTitle('sua atividade')}
        {activityMenu.map(renderMenuItem)}

        {renderDivider()}

        {/* Sua Loja */}
        {renderSectionTitle('sua loja')}
        {storeMenu.map(renderMenuItem)}

        {renderDivider()}

        {/* Financeiro */}
        {renderSectionTitle('financeiro')}
        {financialMenu.map(renderMenuItem)}

        {renderDivider()}

        {/* Mais Opções */}
        {renderSectionTitle('mais opções')}
        {moreMenu.map(renderMenuItem)}

        {/* Version */}
        <Text style={styles.version}>versão 1.0.0</Text>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loginPromptIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(98, 139, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  loginPromptTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  loginPromptText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  loginButton: {
    minWidth: 200,
    marginBottom: SPACING.md,
  },
  registerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  editButton: {
    minWidth: 200,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 64,
    ...SHADOWS.xs,
  },
  menuIcon: {
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  version: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
