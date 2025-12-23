import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import BottomNavigation from '../components/BottomNavigation';
import { getFavorites, removeFromFavorites, FavoriteItem } from '../services/favorites';
import { useAuth } from '../contexts/AuthContext';

const isWeb = Platform.OS === 'web';

interface FavoritesScreenProps {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 768;
  const cardWidth = isDesktop ? (width - 160) / 4 : (width - 48) / 2;
  const styles = useMemo(() => createStyles(isDesktop, cardWidth), [isDesktop, cardWidth]);
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const response = await getFavorites();
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });
    return unsubscribe;
  }, [navigation, fetchFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFromFavorites(productId);
      setFavorites(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return 'R$ 0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'R$ 0';
    return `R$ ${numPrice.toFixed(0)}`;
  };

  const getConditionStyle = (condition: string | undefined) => {
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('novo') && !cond.includes('semi')) return { bg: '#10B981', label: 'Novo' };
    if (cond.includes('seminovo') || cond.includes('semi')) return { bg: COLORS.primary, label: 'Seminovo' };
    return { bg: '#F59E0B', label: 'Usado' };
  };

  const renderProductCard = (item: FavoriteItem) => {
    const conditionInfo = getConditionStyle(item.condition);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[COLORS.primaryExtraLight, COLORS.primaryLight]}
              style={[styles.cardImage, styles.placeholderImage]}
            >
              <Ionicons name="image-outline" size={40} color={COLORS.primary} />
            </LinearGradient>
          )}

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>

          {/* Condition Badge */}
          <View style={[styles.conditionBadge, { backgroundColor: conditionInfo.bg }]}>
            <Text style={styles.conditionText}>{conditionInfo.label}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          {item.brand && (
            <Text style={styles.brandText}>{item.brand}</Text>
          )}
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
          {item.size && (
            <View style={styles.sizeTag}>
              <Text style={styles.sizeText}>Tam: {item.size}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>Faca login para ver seus favoritos</Text>
          <Text style={styles.emptySubtitle}>
            Salve suas pecas favoritas e acompanhe precos
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Entrar na Conta</Text>
          </TouchableOpacity>
        </View>

        <BottomNavigation navigation={navigation} activeRoute="Favorites" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        >
          {/* Count */}
          <View style={styles.countSection}>
            <Text style={styles.countText}>
              {favorites.length} {favorites.length === 1 ? 'peca favorita' : 'pecas favoritas'}
            </Text>
          </View>

          {favorites.length === 0 ? (
            <View style={styles.emptyStateInline}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={64} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
              <Text style={styles.emptySubtitle}>
                Toque no coracao nas pecas que voce gostar para salva-las aqui
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.exploreButtonText}>Explorar Pecas</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {favorites.map(renderProductCard)}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <BottomNavigation navigation={navigation} activeRoute="Favorites" />
    </View>
  );
}

const createStyles = (isDesktop: boolean, cardWidth: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 40,
  },

  // Count Section
  countSection: {
    paddingHorizontal: isDesktop ? 60 : 20,
    marginBottom: 20,
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[800],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray[500],
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isDesktop ? 52 : 12,
  },

  // Card
  card: {
    width: cardWidth,
    marginHorizontal: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: COLORS.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardInfo: {
    padding: 16,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  sizeTag: {
    backgroundColor: COLORS.primaryExtraLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateInline: {
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
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  exploreButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
