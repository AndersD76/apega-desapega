import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader, BottomNavigation, MainHeader } from '../components';
import ProductCard from '../components/ProductCard';
import { COLORS, CATEGORIES, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { getProducts, Product } from '../services/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Componente de Story para categorias (estilo Instagram)
const CategoryStory = ({
  category,
  isActive,
  onPress
}: {
  category: { id: string; name: string; icon: string };
  isActive: boolean;
  onPress: () => void;
}) => {
  const getIconName = () => {
    switch (category.id) {
      case 'all': return 'grid';
      case 'vestidos': return 'shirt';
      case 'blusas': return 'shirt-outline';
      case 'calcas': return 'body';
      case 'saias': return 'woman';
      case 'shorts': return 'woman-outline';
      case 'conjuntos': return 'layers';
      case 'acessorios': return 'watch';
      case 'calcados': return 'footsteps';
      case 'bolsas': return 'bag-handle';
      case 'premium': return 'diamond';
      default: return 'pricetag';
    }
  };

  return (
    <TouchableOpacity style={styles.storyContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={isActive ? COLORS.gradientPrimary as [string, string] : ['transparent', 'transparent']}
        style={[styles.storyRing, !isActive && styles.storyRingInactive]}
      >
        <View style={styles.storyInner}>
          <Ionicons
            name={getIconName() as any}
            size={22}
            color={isActive ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
      </LinearGradient>
      <Text style={[styles.storyLabel, isActive && styles.storyLabelActive]} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 1024;
  const isTablet = isWeb && width > 768 && width <= 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const contentPadding = isWeb ? 32 : 16;

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: 40,
        sort: 'recent',
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(false);
  }, [fetchProducts]);

  const data = useMemo(() => products || [], [products]);

  const renderItem = ({ item }: { item: Product }) => {
    const imageUrl = item.image_url || (item.images && item.images[0]?.image_url) || '';
    const priceValue = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return (
      <ProductCard
        id={item.id}
        image={imageUrl}
        title={item.brand ? `${item.brand} - ${item.title}` : item.title}
        price={priceValue}
        originalPrice={item.original_price}
        size={item.size}
        condition={item.condition}
        numColumns={numColumns}
        onPress={() => navigation.navigate('ItemDetail', { item })}
      />
    );
  };

  const ListHeader = () => (
    <View style={{ paddingHorizontal: contentPadding }}>
      {/* Hero Section com gradiente */}
      <LinearGradient
        colors={COLORS.gradientPrimary as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>MODA CIRCULAR</Text>
          <Text style={styles.heroTitle}>Encontre pecas{'\n'}com historia</Text>
          <Text style={styles.heroSubtitle}>
            Curadoria especial, precos justos
          </Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="leaf" size={48} color="rgba(255,255,255,0.25)" />
        </View>
      </LinearGradient>

      {/* Barra de busca moderna */}
      <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
        <Ionicons
          name="search"
          size={20}
          color={searchFocused ? COLORS.primary : COLORS.textTertiary}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar marca, peca, tamanho..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <View style={styles.clearButton}>
              <Ionicons name="close" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
        style={styles.storiesScroll}
      >
        {CATEGORIES.map((cat) => (
          <CategoryStory
            key={cat.id}
            category={cat}
            isActive={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <Text style={styles.sectionMeta}>{products.length} pecas disponiveis</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="options-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>Nada encontrado</Text>
      <Text style={styles.emptySubtitle}>Tente outra busca ou categoria</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      >
        <Text style={styles.emptyButtonText}>Limpar filtros</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isWeb ? (
        <MainHeader navigation={navigation} />
      ) : (
        <AppHeader navigation={navigation} />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando pecas...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: 12, paddingHorizontal: contentPadding } : undefined}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: isWeb ? 40 : 100 }}
        />
      )}

      <BottomNavigation navigation={navigation} activeRoute="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS['2xl'],
    padding: 24,
    marginTop: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroContent: {
    flex: 1,
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  heroIconWrap: {
    opacity: 0.8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 20,
    ...SHADOWS.xs,
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storiesScroll: {
    marginHorizontal: -16,
    marginBottom: 20,
  },
  storiesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 70,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    marginBottom: 8,
  },
  storyRingInactive: {
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  storyInner: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  storyLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  sectionMeta: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryExtraLight,
    borderRadius: BORDER_RADIUS.button,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
