import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation, AppHeader } from '../components';
import { getProducts, Product } from '../services/products';
import { loadToken } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getCardWidth, moderateScale, screenWidth, isSmallDevice, isTablet, isWeb } from '../utils/responsive';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = isWeb ? 220 : 200;
const ITEM_WIDTH = getCardWidth(isTablet ? 3 : 2, 12, 16);
const GRID_COLUMNS = isTablet ? 3 : 2;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const CATEGORIES = [
  { id: 'all', name: 'Tudo', icon: 'grid-outline', color: COLORS.primary },
  { id: 'novidades', name: 'Novidades', icon: 'sparkles', color: '#FF6B6B' },
  { id: 'ofertas', name: 'Ofertas', icon: 'pricetag', color: '#4ECDC4' },
  { id: 'vestidos', name: 'Vestidos', icon: 'woman-outline', color: '#A855F7' },
  { id: 'blusas', name: 'Blusas', icon: 'shirt-outline', color: '#F472B6' },
  { id: 'calcas', name: 'Calças', icon: 'accessibility-outline', color: '#60A5FA' },
  { id: 'calcados', name: 'Calçados', icon: 'footsteps-outline', color: '#FBBF24' },
  { id: 'bolsas', name: 'Bolsas', icon: 'bag-handle-outline', color: '#34D399' },
  { id: 'acessorios', name: 'Acessórios', icon: 'watch-outline', color: '#F97316' },
];

// Item type for display
interface DisplayItem {
  id: string;
  title: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  size?: string;
  color?: string;
  condition: string;
  description?: string;
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    city?: string;
  };
}

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Verificar auth antes de vender
  const handleSellPress = async () => {
    const token = await loadToken();
    if (token) {
      navigation.navigate('NewItem');
    } else {
      navigation.navigate('Login');
    }
  };

  // Carregar produtos da API
  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getProducts({ limit: 50, sort: 'recent' });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar produtos ao montar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(false);
  }, [fetchProducts]);

  // Converter produtos da API para o formato de exibição
  const allItems: DisplayItem[] = useMemo(() => {
    return products.map(product => {
      const price = typeof product.price === 'string'
        ? parseFloat(product.price)
        : (product.price || 0);
      const originalPrice = product.original_price
        ? (typeof product.original_price === 'string'
            ? parseFloat(product.original_price)
            : product.original_price)
        : undefined;

      return {
        id: product.id,
        title: product.title || 'Sem título',
        brand: product.brand,
        price: isNaN(price) ? 0 : price,
        originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
        images: product.images?.map(img => img.image_url) ||
                (product.image_url ? [product.image_url] : ['https://via.placeholder.com/400']),
        category: product.category_name,
        size: product.size,
        color: product.color,
        condition: product.condition || 'usado',
        description: product.description,
        seller: {
          id: product.seller_id,
          name: product.seller_name || 'Vendedor',
          avatar: product.seller_avatar,
          rating: product.seller_rating,
          city: product.seller_city,
        },
      };
    });
  }, [products]);

  const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return 'R$ 0,00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'R$ 0,00';
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  // Filtrar produtos por categoria
  const getFilteredItems = () => {
    if (selectedCategory === 'all') return allItems;
    if (selectedCategory === 'novidades') return allItems.slice(0, 10);
    if (selectedCategory === 'ofertas') return allItems.filter(i => i.originalPrice && ((i.originalPrice - i.price) / i.originalPrice) >= 0.2);
    return allItems.filter(i => i.category?.toLowerCase() === selectedCategory);
  };

  const filteredItems = getFilteredItems();

  // Premium Product Card
  const renderProductCard = (item: DisplayItem) => {
    const discount = item.originalPrice && item.originalPrice > 0 && item.price > 0
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.productCard}
        onPress={() => navigation.navigate('ItemDetail', { item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.03)']}
            style={styles.imageGradient}
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>

          {/* Condition Tag */}
          <View style={[styles.conditionTag,
            item.condition === 'novo' && styles.conditionNew,
            item.condition === 'seminovo' && styles.conditionSeminew
          ]}>
            <Text style={styles.conditionText}>
              {item.condition === 'novo' ? 'Novo' : item.condition === 'seminovo' ? 'Seminovo' : 'Usado'}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          {item.brand && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {item.brand.toUpperCase()}
            </Text>
          )}
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.priceRow}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          </View>

          {item.size && (
            <View style={styles.sizeTag}>
              <Text style={styles.sizeText}>Tam. {item.size}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Hero Section
  const renderHero = () => (
    <View style={styles.heroSection}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroEyebrow}>MODA SUSTENTÁVEL</Text>
            <Text style={styles.heroTitle}>Seu estilo,{'\n'}nova história</Text>
            <Text style={styles.heroSubtitle}>
              Peças únicas com até 70% off
            </Text>
            <TouchableOpacity style={styles.heroCta} onPress={handleSellPress}>
              <Text style={styles.heroCtaText}>Vender agora</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroImageContainer}>
            <View style={styles.heroCircle}>
              <Ionicons name="leaf" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allItems.length}+</Text>
            <Text style={styles.statLabel}>Peças</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>70%</Text>
            <Text style={styles.statLabel}>Economia</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>♻️</Text>
            <Text style={styles.statLabel}>Sustentável</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Categories Section
  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.categoryIcon,
              { backgroundColor: selectedCategory === category.id ? category.color : COLORS.gray[100] }
            ]}>
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? COLORS.white : category.color}
              />
            </View>
            <Text style={[
              styles.categoryName,
              selectedCategory === category.id && styles.categoryNameActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.emptyHero}
      >
        <Ionicons name="sparkles" size={48} color="rgba(255,255,255,0.8)" />
        <Text style={styles.emptyHeroTitle}>Bem-vinda ao Apega Desapega!</Text>
        <Text style={styles.emptyHeroSubtitle}>
          Marketplace de moda circular
        </Text>
      </LinearGradient>

      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="camera" size={24} color="#EF4444" />
          </View>
          <Text style={styles.featureTitle}>Fotografe</Text>
          <Text style={styles.featureDesc}>Tire fotos das suas peças</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="pricetag" size={24} color="#6366F1" />
          </View>
          <Text style={styles.featureTitle}>Precifique</Text>
          <Text style={styles.featureDesc}>Defina seu preço</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash" size={24} color="#10B981" />
          </View>
          <Text style={styles.featureTitle}>Venda</Text>
          <Text style={styles.featureDesc}>Receba o pagamento</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="leaf" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.featureTitle}>Sustentável</Text>
          <Text style={styles.featureDesc}>Moda consciente</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.emptyCta} onPress={handleSellPress}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyCtaGradient}
        >
          <Ionicons name="add-circle" size={22} color={COLORS.white} />
          <Text style={styles.emptyCtaText}>Desapegar minha primeira peça</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} cartCount={0} notificationCount={0} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando peças incríveis...</Text>
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} cartCount={0} notificationCount={0} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderHero()}
        {renderCategories()}

        {allItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'all' ? 'Explorar' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredItems.length} {filteredItems.length === 1 ? 'peça disponível' : 'peças disponíveis'}
                </Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Products Grid */}
            {filteredItems.length === 0 ? (
              <View style={styles.emptyCategory}>
                <Ionicons name="search-outline" size={48} color={COLORS.gray[300]} />
                <Text style={styles.emptyCategoryText}>Nenhuma peça nesta categoria</Text>
                <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                  <Text style={styles.emptyCategoryLink}>Ver todas as peças</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredItems.map(renderProductCard)}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
  },

  // Hero Section
  heroSection: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroGradient: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: isSmallDevice ? 28 : 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.md,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Categories
  categoriesSection: {
    marginTop: SPACING.lg,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  categoryItemActive: {},
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },

  // Product Card - Premium Design
  productCard: {
    width: ITEM_WIDTH,
    marginHorizontal: 6,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 0.85,
    backgroundColor: COLORS.gray[100],
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionNew: {
    backgroundColor: COLORS.success,
  },
  conditionSeminew: {
    backgroundColor: COLORS.primary,
  },
  conditionText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray[500],
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 17,
    marginBottom: 6,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sizeTag: {
    marginTop: 6,
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sizeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Empty State
  emptyStateContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  emptyHero: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  emptyHeroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2 - 2,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyCta: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  emptyCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Empty Category
  emptyCategory: {
    paddingVertical: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyCategoryText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyCategoryLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
