import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components';
import { COLORS } from '../constants/theme';
import { getProducts, Product } from '../services/products';
import { loadToken } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 900;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface DisplayItem {
  id: string;
  title: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  size?: string;
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSellPress = async () => {
    const token = await loadToken();
    if (token) {
      (navigation as any).navigate('NewItem');
    } else {
      navigation.navigate('Login');
    }
  };

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getProducts({ limit: 20, sort: 'recent' });
      setProducts(response.products || []);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(false);
  }, [fetchProducts]);

  const allItems: DisplayItem[] = useMemo(() => {
    return products.map(product => {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0);
      const originalPrice = product.original_price
        ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price)
        : undefined;

      return {
        id: product.id,
        title: product.title || '',
        brand: product.brand,
        price: isNaN(price) ? 0 : price,
        originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
        images: product.images?.map(img => img.image_url) || (product.image_url ? [product.image_url] : []),
        size: product.size,
      };
    });
  }, [products]);

  const formatPrice = (price: number) => `R$ ${price.toFixed(0)}`;

  // Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons name="bag-outline" size={40} color={COLORS.primary} />
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando peças incríveis...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.logo}>apega</Text>
        </TouchableOpacity>

        {isDesktop && (
          <View style={styles.navDesktop}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
              <Ionicons name="compass-outline" size={20} color={COLORS.gray[600]} />
              <Text style={styles.navText}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={handleSellPress}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.gray[600]} />
              <Text style={styles.navText}>Vender</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
              <Ionicons name="heart-outline" size={20} color={COLORS.gray[600]} />
              <Text style={styles.navText}>Salvos</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="leaf" size={14} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>Moda Circular</Text>
            </View>
            <Text style={styles.heroTitle}>Peças únicas{'\n'}com história</Text>
            <Text style={styles.heroSubtitle}>
              De Passo Fundo para o seu closet.{'\n'}Moda sustentável é nosso propósito.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroButtonText}>Explorar coleção</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroDecor}>
            <Ionicons name="shirt-outline" size={120} color="rgba(255,255,255,0.1)" />
          </View>
        </LinearGradient>

        {/* Quick Categories */}
        <View style={styles.categories}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {[
              { icon: 'woman-outline', label: 'Vestidos' },
              { icon: 'shirt-outline', label: 'Blusas' },
              { icon: 'bag-outline', label: 'Bolsas' },
              { icon: 'footsteps-outline', label: 'Calçados' },
              { icon: 'diamond-outline', label: 'Acessórios' },
              { icon: 'star-outline', label: 'Premium' },
            ].map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={index === 5 ? [COLORS.premium, COLORS.premiumDark] : [COLORS.gray[100], COLORS.gray[200]]}
                  style={styles.categoryIcon}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={index === 5 ? '#fff' : COLORS.primary}
                  />
                </LinearGradient>
                <Text style={[styles.categoryLabel, index === 5 && { color: COLORS.premium }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        {allItems.length > 0 && (
          <>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flash" size={22} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Novidades</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.seeAllText}>Ver tudo</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Featured Item */}
            {allItems[0] && (
              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() => navigation.navigate('ItemDetail', { item: allItems[0] })}
                activeOpacity={0.95}
              >
                <Image
                  source={{ uri: allItems[0].images[0] }}
                  style={styles.featuredImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.featuredOverlay}
                >
                  <View style={styles.featuredInfo}>
                    {allItems[0].brand && (
                      <View style={styles.featuredBrand}>
                        <Ionicons name="diamond" size={12} color="#fff" />
                        <Text style={styles.featuredBrandText}>{allItems[0].brand}</Text>
                      </View>
                    )}
                    <Text style={styles.featuredTitle} numberOfLines={1}>{allItems[0].title}</Text>
                    <Text style={styles.featuredPrice}>{formatPrice(allItems[0].price)}</Text>
                  </View>
                  <TouchableOpacity style={styles.featuredHeart}>
                    <Ionicons name="heart-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Grid */}
            <View style={styles.grid}>
              {allItems.slice(1, 9).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  onPress={() => navigation.navigate('ItemDetail', { item })}
                  activeOpacity={0.95}
                >
                  <View style={styles.gridImageContainer}>
                    {item.images[0] ? (
                      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
                    ) : (
                      <View style={[styles.gridImage, styles.placeholder]}>
                        <Ionicons name="image-outline" size={32} color={COLORS.gray[300]} />
                      </View>
                    )}
                    <TouchableOpacity style={styles.gridHeart}>
                      <Ionicons name="heart-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                    {item.originalPrice && (
                      <View style={styles.discountTag}>
                        <Text style={styles.discountTagText}>
                          -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.gridInfo}>
                    {item.brand && (
                      <Text style={styles.gridBrand}>{item.brand}</Text>
                    )}
                    <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.gridPriceRow}>
                      <Text style={styles.gridPrice}>{formatPrice(item.price)}</Text>
                      {item.originalPrice && (
                        <Text style={styles.gridOriginalPrice}>{formatPrice(item.originalPrice)}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA Vender */}
            <View style={styles.sellCTA}>
              <LinearGradient
                colors={[COLORS.gray[800], COLORS.gray[900]]}
                style={styles.sellGradient}
              >
                <View style={styles.sellContent}>
                  <View style={styles.sellIcon}>
                    <Ionicons name="camera-outline" size={32} color="#fff" />
                  </View>
                  <View style={styles.sellText}>
                    <Text style={styles.sellTitle}>Desapegue do que não usa</Text>
                    <Text style={styles.sellSubtitle}>
                      Venda suas peças e dê uma nova vida para elas
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.sellButton} onPress={handleSellPress}>
                  <Text style={styles.sellButtonText}>Começar a vender</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.gray[900]} />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* More Items */}
            {allItems.length > 9 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="sparkles" size={22} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Mais peças para você</Text>
                  </View>
                </View>
                <View style={styles.grid}>
                  {allItems.slice(9, 17).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.gridItem}
                      onPress={() => navigation.navigate('ItemDetail', { item })}
                      activeOpacity={0.95}
                    >
                      <View style={styles.gridImageContainer}>
                        {item.images[0] ? (
                          <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
                        ) : (
                          <View style={[styles.gridImage, styles.placeholder]}>
                            <Ionicons name="image-outline" size={32} color={COLORS.gray[300]} />
                          </View>
                        )}
                        <TouchableOpacity style={styles.gridHeart}>
                          <Ionicons name="heart-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.gridInfo}>
                        {item.brand && (
                          <Text style={styles.gridBrand}>{item.brand}</Text>
                        )}
                        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.gridPrice}>{formatPrice(item.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Empty State */}
        {allItems.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bag-outline" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma peça ainda</Text>
            <Text style={styles.emptySubtitle}>Seja a primeira a anunciar!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleSellPress}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Anunciar peça</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <Text style={styles.footerLogo}>apega desapega</Text>
            <View style={styles.footerBadge}>
              <Ionicons name="leaf" size={14} color={COLORS.success} />
              <Text style={styles.footerBadgeText}>Moda Sustentável</Text>
            </View>
          </View>
          <Text style={styles.footerText}>
            Nascemos em Passo Fundo, RS.{'\n'}
            Fundado por Amanda Maier.
          </Text>
          <View style={styles.footerSocial}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-instagram" size={22} color={COLORS.gray[600]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-whatsapp" size={22} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.footerMotto}>Moda com propósito ♻️</Text>
        </View>

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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.gray[500],
    marginTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isDesktop ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  navDesktop: {
    flexDirection: 'row',
    gap: 32,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navText: {
    fontSize: 15,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  profileBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  hero: {
    marginHorizontal: isDesktop ? 60 : 16,
    marginBottom: 24,
    borderRadius: 24,
    padding: isDesktop ? 48 : 28,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    maxWidth: isDesktop ? 500 : '100%',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  heroTitle: {
    fontSize: isDesktop ? 48 : 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: isDesktop ? 56 : 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    marginBottom: 24,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroDecor: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },

  // Categories
  categories: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: isDesktop ? 60 : 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[700],
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isDesktop ? 60 : 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.gray[800],
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Featured
  featuredCard: {
    marginHorizontal: isDesktop ? 60 : 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: isDesktop ? 400 : 320,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[200],
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredInfo: {},
  featuredBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  featuredBrandText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  featuredPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  featuredHeart: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isDesktop ? 52 : 8,
  },
  gridItem: {
    width: isDesktop ? '25%' : '50%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  gridImageContainer: {
    aspectRatio: 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
    marginBottom: 10,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  gridHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  gridInfo: {
    paddingHorizontal: 4,
  },
  gridBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: 6,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.gray[900],
  },
  gridOriginalPrice: {
    fontSize: 13,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },

  // Sell CTA
  sellCTA: {
    marginHorizontal: isDesktop ? 60 : 16,
    marginVertical: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sellGradient: {
    padding: isDesktop ? 40 : 24,
  },
  sellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sellIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellText: {
    flex: 1,
  },
  sellTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  sellSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  sellButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[900],
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray[800],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    marginTop: 32,
    marginHorizontal: isDesktop ? 60 : 16,
  },
  footerBrand: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  footerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  footerSocial: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerMotto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
});
