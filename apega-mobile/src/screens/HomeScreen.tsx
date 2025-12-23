import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useWindowDimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader, BottomNavigation, MainHeader } from '../components';
import ProductCard from '../components/ProductCard';
import { COLORS, CATEGORIES } from '../constants/theme';
import { getProducts, Product } from '../services/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Category Story Component - Instagram style
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
    <TouchableOpacity
      className="items-center w-[72px]"
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive ? (
        <LinearGradient
          colors={['#61005D', '#A855F7']}
          className="w-16 h-16 rounded-full p-[3px] mb-2"
        >
          <View className="flex-1 bg-white rounded-full items-center justify-center">
            <Ionicons
              name={getIconName() as any}
              size={22}
              color="#61005D"
            />
          </View>
        </LinearGradient>
      ) : (
        <View className="w-16 h-16 rounded-full border-2 border-border p-[3px] mb-2">
          <View className="flex-1 bg-surface rounded-full items-center justify-center">
            <Ionicons
              name={getIconName() as any}
              size={22}
              color="#6B7280"
            />
          </View>
        </View>
      )}
      <Text
        className={`text-[11px] text-center font-medium ${
          isActive ? 'text-primary font-semibold' : 'text-text-secondary'
        }`}
        numberOfLines={1}
      >
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
      {/* Hero Section */}
      <LinearGradient
        colors={['#61005D', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 mt-4 mb-5 overflow-hidden"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-[10px] font-bold text-white/70 tracking-widest mb-2">
              MODA CIRCULAR
            </Text>
            <Text className="text-2xl font-extrabold text-white leading-8 mb-2">
              Encontre pecas{'\n'}com historia
            </Text>
            <Text className="text-sm text-white/85 font-medium">
              Curadoria especial, precos justos
            </Text>
          </View>
          <View className="opacity-80">
            <Ionicons name="leaf" size={48} color="rgba(255,255,255,0.25)" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View
        className={`flex-row items-center bg-surface border-[1.5px] rounded-2xl px-4 py-3.5 gap-3 mb-5 ${
          searchFocused ? 'border-primary bg-white' : 'border-border'
        }`}
      >
        <Ionicons
          name="search"
          size={20}
          color={searchFocused ? '#61005D' : '#9CA3AF'}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar marca, peca, tamanho..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-[15px] text-text-primary"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <View className="w-5 h-5 rounded-full bg-text-tertiary items-center justify-center">
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}
        className="mb-5 -mx-4"
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
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xl font-bold text-text-primary tracking-tight">
            Destaques
          </Text>
          <Text className="text-[13px] text-text-tertiary mt-0.5">
            {products.length} pecas disponiveis
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="options-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View className="items-center py-16 px-8">
      <View className="w-24 h-24 rounded-full bg-background-dark items-center justify-center mb-5">
        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-text-primary mb-2">
        Nada encontrado
      </Text>
      <Text className="text-[15px] text-text-secondary text-center mb-6">
        Tente outra busca ou categoria
      </Text>
      <TouchableOpacity
        className="px-6 py-3 bg-primary-extraLight rounded-xl"
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      >
        <Text className="text-sm font-semibold text-primary">
          Limpar filtros
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {isWeb ? (
        <MainHeader navigation={navigation} />
      ) : (
        <AppHeader navigation={navigation} />
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#61005D" />
          <Text className="text-[15px] text-text-secondary">
            Carregando pecas...
          </Text>
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
              tintColor="#61005D"
              colors={['#61005D']}
            />
          }
          contentContainerStyle={{ paddingBottom: isWeb ? 40 : 100 }}
        />
      )}

      <BottomNavigation navigation={navigation} activeRoute="Home" />
    </View>
  );
}
