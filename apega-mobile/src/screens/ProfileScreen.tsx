import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
  useWindowDimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { BottomNavigation, MainHeader } from '../components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  status: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  category?: string;
  brand?: string;
  condition?: string;
}

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = isWeb && windowWidth > 768;

  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'active' | 'sold'>('grid');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
  });

  // Calculate grid columns based on screen width
  const numColumns = isDesktop ? 4 : 3;
  const spacing = 2;
  const imageSize = (windowWidth - (spacing * (numColumns + 1))) / numColumns;

  const loadProducts = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingProducts(true);
      const response = await api.get<{ products: Product[] }>('/products/my');
      const prods = response.products || [];
      setProducts(prods);

      // Calculate stats
      const active = prods.filter(p => p.status === 'active').length;
      const sold = prods.filter(p => p.status === 'sold').length;
      setStats({
        totalProducts: prods.length,
        activeProducts: active,
        soldProducts: sold,
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        if (!isAuthenticated) return;
        await refreshUser();
        await loadProducts();
      };
      refresh();
    }, [isAuthenticated])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadProducts();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'active':
        return products.filter(p => p.status === 'active');
      case 'sold':
        return products.filter(p => p.status === 'sold');
      default:
        return products;
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <MainHeader navigation={navigation} title="Minha Loja" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.loginScrollContent}
        >
          <View style={styles.loginContainer}>
            <View style={styles.loginIconBg}>
              <Ionicons name="storefront-outline" size={56} color={COLORS.primary} />
            </View>
            <Text style={styles.loginTitle}>Crie sua loja</Text>
            <Text style={styles.loginSubtitle}>
              Entre para criar sua loja, anunciar pecas e acompanhar suas vendas
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>Entrar ou criar conta</Text>
            </TouchableOpacity>

            <View style={styles.benefitsSection}>
              {[
                { icon: 'camera-outline', label: 'Anuncie em segundos' },
                { icon: 'cash-outline', label: 'Receba pagamentos' },
                { icon: 'people-outline', label: 'Alcance milhares' },
                { icon: 'star-outline', label: 'Construa reputacao' },
              ].map((item, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                  <Text style={styles.benefitText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Authenticated - Instagram Style Profile
  const isPremium = user?.subscription_type === 'premium';
  const isOfficial = user?.is_official;
  const avatarUri = user.avatar_url;
  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');
  const filteredProducts = getFilteredProducts();

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = item.images?.[0] || '';
    const isSold = item.status === 'sold';

    return (
      <TouchableOpacity
        style={[styles.productItem, { width: imageSize, height: imageSize }]}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        activeOpacity={0.9}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productPlaceholder}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}

        {/* Overlay with stats */}
        <View style={styles.productOverlay}>
          <View style={styles.productStats}>
            <View style={styles.productStat}>
              <Ionicons name="heart" size={14} color="#fff" />
              <Text style={styles.productStatText}>{item.favorites_count || 0}</Text>
            </View>
            <View style={styles.productStat}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.productStatText}>{item.views_count || 0}</Text>
            </View>
          </View>
        </View>

        {/* Price tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
        </View>

        {/* Sold badge */}
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>VENDIDO</Text>
          </View>
        )}

        {/* Multiple images indicator */}
        {item.images && item.images.length > 1 && (
          <View style={styles.multipleIndicator}>
            <Ionicons name="copy" size={14} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Avatar and Stats Row */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('EditProfile')}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[COLORS.primary, '#4CAF50']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitial}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            )}
            {isPremium && (
              <View style={styles.premiumRing} />
            )}
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Pecas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Followers', { type: 'followers' } as any)}
            >
              <Text style={styles.statNumber}>{user.total_followers || 0}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Followers', { type: 'following' } as any)}
            >
              <Text style={styles.statNumber}>{user.total_following || 0}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name and Bio */}
        <View style={styles.bioSection}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user.store_name || user.name || 'Minha Loja'}</Text>
            {isOfficial && (
              <Ionicons name="checkmark-circle" size={18} color="#3897f0" />
            )}
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color="#7B1FA2" />
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          <Text style={styles.userHandle}>@{user.email?.split('@')[0] || 'usuario'}</Text>

          {user.store_description || user.bio ? (
            <Text style={styles.bioText}>{user.store_description || user.bio}</Text>
          ) : null}

          {user.city && user.state && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText}>{user.city}, {user.state}</Text>
            </View>
          )}

          {/* Rating */}
          {user.total_reviews > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({user.total_reviews} avaliacoes)</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => {/* Share profile */}}
          >
            <Ionicons name="share-outline" size={18} color="#262626" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings' as any)}
          >
            <Ionicons name="settings-outline" size={18} color="#262626" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('NewItem')}
          >
            <LinearGradient
              colors={[COLORS.primary, '#4CAF50']}
              style={styles.quickActionIcon}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Anunciar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('Sales')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up" size={22} color="#1976D2" />
            </View>
            <Text style={styles.quickActionLabel}>Vendas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cube" size={22} color="#F57C00" />
            </View>
            <Text style={styles.quickActionLabel}>Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('Balance')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="wallet" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.quickActionLabel}>Saldo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grid' && styles.tabActive]}
          onPress={() => setActiveTab('grid')}
        >
          <Ionicons
            name="grid-outline"
            size={24}
            color={activeTab === 'grid' ? '#262626' : '#8e8e8e'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name="pricetag-outline"
            size={24}
            color={activeTab === 'active' ? '#262626' : '#8e8e8e'}
          />
          {stats.activeProducts > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{stats.activeProducts}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sold' && styles.tabActive]}
          onPress={() => setActiveTab('sold')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color={activeTab === 'sold' ? '#262626' : '#8e8e8e'}
          />
          {stats.soldProducts > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{stats.soldProducts}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loadingProducts && (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === 'sold' ? 'checkmark-circle-outline' : 'camera-outline'}
            size={64}
            color="#dbdbdb"
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'sold' ? 'Nenhuma venda ainda' : 'Nenhuma peca ainda'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'sold'
              ? 'Quando voce vender, aparecera aqui'
              : 'Comece a vender suas pecas agora'
            }
          </Text>
          {activeTab !== 'sold' && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('NewItem')}
            >
              <Text style={styles.emptyBtnText}>Anunciar primeira peca</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Instagram-style Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.headerUsername}>{user.store_name || user.name}</Text>
          {isOfficial && (
            <Ionicons name="checkmark-circle" size={16} color="#3897f0" />
          )}
          <Ionicons name="chevron-down" size={16} color="#262626" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('NewItem')}
          >
            <Ionicons name="add-circle-outline" size={28} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Help')}
          >
            <Ionicons name="menu-outline" size={28} color="#262626" />
          </TouchableOpacity>
        </View>
      </View>

      {loadingProducts && products.length === 0 ? (
        <View style={styles.loadingProducts}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerUsername: {
    fontSize: 22,
    fontWeight: '700',
    color: '#262626',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 4,
  },

  // Login State
  loginScrollContent: {
    flexGrow: 1,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loginIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 12,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 48,
    gap: 24,
  },
  benefitItem: {
    alignItems: 'center',
    width: 100,
  },
  benefitText: {
    fontSize: 12,
    color: '#262626',
    marginTop: 8,
    textAlign: 'center',
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
  },
  premiumRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: '#7B1FA2',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e8e',
    marginTop: 2,
  },

  // Bio Section
  bioSection: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B1FA2',
  },
  userHandle: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
  },
  reviewsText: {
    fontSize: 13,
    color: '#8e8e8e',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  editProfileBtn: {
    flex: 1,
    backgroundColor: '#efefef',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  shareBtn: {
    backgroundColor: '#efefef',
    padding: 8,
    borderRadius: 8,
  },
  settingsBtn: {
    backgroundColor: '#efefef',
    padding: 8,
    borderRadius: 8,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#efefef',
  },
  quickActionBtn: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#262626',
    fontWeight: '500',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabActive: {
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: '30%',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Grid
  gridContent: {
    paddingBottom: 100,
  },
  gridRow: {
    gap: 2,
    paddingHorizontal: 1,
  },
  productItem: {
    position: 'relative',
    margin: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  productStats: {
    flexDirection: 'row',
    gap: 16,
  },
  productStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  priceTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  soldBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  multipleIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: '#262626',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
