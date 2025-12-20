import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation } from '../components';
import { getMyProducts, updateProduct, deleteProduct, Product as APIProduct } from '../services/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 768;

type Props = NativeStackScreenProps<RootStackParamList, 'MyStore'>;

interface Product {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'paused' | 'sold';
  views: number;
  favorites: number;
  image_url?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function MyStoreScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await getMyProducts();
      const mappedProducts: Product[] = (response.products || []).map((p: APIProduct) => ({
        id: p.id,
        title: p.title || 'Sem título',
        price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
        status: p.status as 'active' | 'paused' | 'sold',
        views: p.views || 0,
        favorites: p.favorites || 0,
        image_url: p.image_url,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation, fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const tabs: TabItem[] = [
    { id: 'active', label: 'Ativos', icon: 'checkmark-circle', color: COLORS.success },
    { id: 'paused', label: 'Pausados', icon: 'pause-circle', color: '#F59E0B' },
    { id: 'sold', label: 'Vendidos', icon: 'bag-check', color: COLORS.primary },
  ];

  const getTabCount = (tabId: string) => products.filter(p => p.status === tabId).length;

  const filteredProducts = products.filter(product => product.status === activeTab);

  const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return 'R$ 0,00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'R$ 0,00';
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalFavorites = products.reduce((sum, p) => sum + p.favorites, 0);
  const totalSold = products.filter(p => p.status === 'sold').length;

  const openActionMenu = (product: Product) => {
    setSelectedProduct(product);
    setShowActionMenu(true);
  };

  const handleEdit = () => {
    setShowActionMenu(false);
    if (selectedProduct) {
      navigation.navigate('EditProduct', { productId: selectedProduct.id });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedProduct) return;
    const newStatus = selectedProduct.status === 'active' ? 'paused' : 'active';
    try {
      await updateProduct(selectedProduct.id, { status: newStatus });
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, status: newStatus } : p
      ));
      setShowActionMenu(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status do produto');
    }
  };

  const handleDelete = () => {
    setShowActionMenu(false);
    Alert.alert(
      'Remover produto?',
      'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            if (!selectedProduct) return;
            try {
              await deleteProduct(selectedProduct.id);
              setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o produto');
            }
          }
        }
      ]
    );
  };

  const renderProductCard = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <TouchableOpacity
        style={styles.productCardContent}
        onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color={COLORS.gray[400]} />
            </View>
          )}

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            product.status === 'active' && styles.statusActive,
            product.status === 'paused' && styles.statusPaused,
            product.status === 'sold' && styles.statusSold,
          ]}>
            <Text style={styles.statusText}>
              {product.status === 'active' ? 'Ativo' : product.status === 'paused' ? 'Pausado' : 'Vendido'}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{product.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{product.favorites}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => openActionMenu(product)}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={activeTab === 'active' ? 'storefront-outline' : activeTab === 'paused' ? 'pause-circle-outline' : 'bag-check-outline'}
          size={48}
          color={COLORS.gray[400]}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'active' ? 'Nenhum produto ativo' :
         activeTab === 'paused' ? 'Nenhum produto pausado' :
         'Nenhum produto vendido'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'active' ? 'Adicione produtos para começar a vender' :
         activeTab === 'paused' ? 'Seus produtos pausados aparecerão aqui' :
         'Seus produtos vendidos aparecerão aqui'}
      </Text>
      {activeTab === 'active' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('NewItem', {})}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.emptyButtonGradient}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.emptyButtonText}>Adicionar produto</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minha Loja</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewItem', {})}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.dashboardStats}>
          <View style={styles.dashboardStatItem}>
            <View style={[styles.dashboardStatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="cube-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.dashboardStatValue}>{products.length}</Text>
            <Text style={styles.dashboardStatLabel}>Produtos</Text>
          </View>
          <View style={styles.dashboardStatDivider} />
          <View style={styles.dashboardStatItem}>
            <View style={[styles.dashboardStatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="eye-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.dashboardStatValue}>{totalViews}</Text>
            <Text style={styles.dashboardStatLabel}>Visualizações</Text>
          </View>
          <View style={styles.dashboardStatDivider} />
          <View style={styles.dashboardStatItem}>
            <View style={[styles.dashboardStatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="heart-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.dashboardStatValue}>{totalFavorites}</Text>
            <Text style={styles.dashboardStatLabel}>Favoritos</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? tab.color : COLORS.gray[400]}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && { color: tab.color }
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabBadge,
                activeTab === tab.id && { backgroundColor: tab.color }
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.id && { color: COLORS.white }
                ]}>
                  {getTabCount(tab.id)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.productsList}>
            {filteredProducts.map(renderProductCard)}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Profile" />

      {/* Action Menu Modal */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionMenuContainer}>
            <View style={styles.actionMenu}>
              <View style={styles.actionMenuHeader}>
                <Text style={styles.actionMenuTitle} numberOfLines={1}>
                  {selectedProduct?.title}
                </Text>
                <Text style={styles.actionMenuPrice}>
                  {formatPrice(selectedProduct?.price)}
                </Text>
              </View>

              <TouchableOpacity style={styles.actionMenuItem} onPress={handleEdit}>
                <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="create-outline" size={20} color="#6366F1" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Editar produto</Text>
                  <Text style={styles.actionDescription}>Alterar informações</Text>
                </View>
              </TouchableOpacity>

              {selectedProduct?.status !== 'sold' && (
                <TouchableOpacity style={styles.actionMenuItem} onPress={handleToggleStatus}>
                  <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons
                      name={selectedProduct?.status === 'active' ? 'pause-outline' : 'play-outline'}
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionText}>
                      {selectedProduct?.status === 'active' ? 'Pausar anúncio' : 'Ativar anúncio'}
                    </Text>
                    <Text style={styles.actionDescription}>
                      {selectedProduct?.status === 'active' ? 'Ocultar da listagem' : 'Voltar para listagem'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionMenuItem} onPress={() => {
                setShowActionMenu(false);
                if (selectedProduct) {
                  navigation.navigate('ItemDetail', { itemId: selectedProduct.id });
                }
              }}>
                <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="eye-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Ver como comprador</Text>
                  <Text style={styles.actionDescription}>Visualizar anúncio</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionMenuItem} onPress={handleDelete}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Remover produto</Text>
                  <Text style={styles.actionDescription}>Excluir permanentemente</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionMenuCancel}
                onPress={() => setShowActionMenu(false)}
              >
                <Text style={styles.actionMenuCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.lg,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  dashboardStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  dashboardStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dashboardStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  dashboardStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  dashboardStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    gap: 4,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  content: {
    padding: SPACING.md,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    maxWidth: isDesktop ? 900 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  productsList: {
    gap: SPACING.md,
    flexDirection: isDesktop ? 'row' : 'column',
    flexWrap: isDesktop ? 'wrap' : 'nowrap',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    width: isDesktop ? 'calc(50% - 8px)' : '100%',
    ...SHADOWS.md,
  },
  productCardContent: {
    flexDirection: 'row',
    flex: 1,
    padding: SPACING.sm,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusPaused: {
    backgroundColor: '#F59E0B',
  },
  statusSold: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[100],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Action Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionMenuContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  actionMenu: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
  },
  actionMenuHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    alignItems: 'center',
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionMenuPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: SPACING.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionMenuCancel: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  actionMenuCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
