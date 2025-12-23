import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { BottomNavigation, Header, MainHeader } from '../components';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { getMyProducts, Product } from '../services/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type ProfileTab = 'all' | 'active' | 'sold';

// Componente de estatistica
const StatItem = ({ value, label }: { value: number; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Componente de Tab
const TabButton = ({
  label,
  icon,
  isActive,
  onPress
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon as any}
      size={18}
      color={isActive ? COLORS.primary : COLORS.textTertiary}
    />
    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 1024;
  const isTablet = isWeb && width > 768 && width <= 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('all');

  const contentPadding = isWeb ? 32 : 16;

  const loadProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingProducts(true);
    try {
      const response = await getMyProducts(activeTab === 'all' ? undefined : activeTab);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
      loadProducts();
    }
  }, [isAuthenticated, refreshUser, loadProducts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadProducts();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const activeCount = products.filter((p) => p.status === 'active').length;
    const soldCount = products.filter((p) => p.status === 'sold').length;
    return {
      active: activeCount,
      sold: soldCount,
      total: products.length,
    };
  }, [products]);

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = item.image_url || (item.images && item.images[0]?.image_url) || '';
    const priceValue = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return (
      <ProductCard
        id={item.id}
        image={imageUrl}
        title={item.title}
        price={priceValue}
        originalPrice={item.original_price}
        condition={item.condition}
        numColumns={numColumns}
        onPress={() => navigation.navigate('ItemDetail', { item })}
        compact
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        {isWeb ? (
          <MainHeader navigation={navigation} title="Perfil" />
        ) : (
          <Header navigation={navigation} title="Perfil" showBack={false} />
        )}
        <View style={styles.guestContainer}>
          <LinearGradient
            colors={COLORS.gradientPrimary as [string, string]}
            style={styles.guestIconWrap}
          >
            <Ionicons name="person" size={48} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.guestTitle}>Entre para continuar</Text>
          <Text style={styles.guestSubtitle}>
            Crie sua loja, anuncie pecas e acompanhe suas vendas
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerLink}>Criar conta gratuita</Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');

  return (
    <View style={styles.container}>
      {isWeb ? (
        <MainHeader navigation={navigation} title="Perfil" />
      ) : (
        <Header navigation={navigation} title="Perfil" showBack={false} />
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 12, paddingHorizontal: contentPadding } : undefined}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: contentPadding }}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              {/* Avatar com gradiente */}
              <LinearGradient
                colors={COLORS.gradientPrimary as [string, string]}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
              </LinearGradient>

              {/* Stats */}
              <View style={styles.statsRow}>
                <StatItem value={stats.total} label="pecas" />
                <StatItem value={user.total_followers || 0} label="seguidores" />
                <StatItem value={user.total_following || 0} label="seguindo" />
              </View>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{user.store_name || user.name}</Text>
                {user.is_verified && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.info} />
                )}
              </View>

              {(user.store_description || user.bio) && (
                <Text style={styles.profileBio}>{user.store_description || user.bio}</Text>
              )}

              {user.city && user.state && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.locationText}>{user.city}, {user.state}</Text>
                </View>
              )}

              {user.total_reviews > 0 && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={COLORS.premium} />
                  <Text style={styles.ratingText}>
                    {rating.toFixed(1)} ({user.total_reviews} avaliacoes)
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="pencil-outline" size={16} color={COLORS.textPrimary} />
                <Text style={styles.actionButtonText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => navigation.navigate('Sales')}
              >
                <Ionicons name="stats-chart" size={16} color={COLORS.primary} />
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  Painel de vendas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
              <TabButton
                label="Todos"
                icon="grid-outline"
                isActive={activeTab === 'all'}
                onPress={() => setActiveTab('all')}
              />
              <TabButton
                label="Ativos"
                icon="pricetag-outline"
                isActive={activeTab === 'active'}
                onPress={() => setActiveTab('active')}
              />
              <TabButton
                label="Vendidos"
                icon="checkmark-circle-outline"
                isActive={activeTab === 'sold'}
                onPress={() => setActiveTab('sold')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          loadingProducts ? (
            <View style={styles.loadingProducts}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="camera-outline" size={40} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma peca ainda</Text>
              <Text style={styles.emptySubtitle}>
                Comece a vender suas pecas agora
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('NewItem')}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add" size={20} color={COLORS.white} />
                  <Text style={styles.emptyButtonText}>Anunciar peca</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: isWeb ? 40 : 100 }}
      />

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
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...SHADOWS.primary,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 16,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    marginRight: 20,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.button,
    ...SHADOWS.xs,
  },
  actionButtonPrimary: {
    borderColor: COLORS.primaryExtraLight,
    backgroundColor: COLORS.primaryExtraLight,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionButtonTextPrimary: {
    color: COLORS.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
  },
  tabButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryExtraLight,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  loadingProducts: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
