import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
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
import { BottomNavigation, Header, MainHeader } from '../components';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { getMyProducts, Product } from '../services/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;
type ProfileTab = 'all' | 'active' | 'sold';

// Stat Item Component
const StatItem = ({ value, label }: { value: number; label: string }) => (
  <View className="items-center">
    <Text className="text-xl font-bold text-text-primary">{value}</Text>
    <Text className="text-xs text-text-secondary mt-0.5">{label}</Text>
  </View>
);

// Tab Button Component
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
    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-full border ${
      isActive
        ? 'border-primary bg-primary-extraLight'
        : 'border-border bg-surface'
    }`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon as any}
      size={18}
      color={isActive ? '#61005D' : '#9CA3AF'}
    />
    <Text className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-text-tertiary'}`}>
      {label}
    </Text>
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

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#61005D" />
      </View>
    );
  }

  // Guest state
  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-background">
        {isWeb ? (
          <MainHeader navigation={navigation} title="Perfil" />
        ) : (
          <Header navigation={navigation} title="Perfil" showBack={false} />
        )}

        <View className="flex-1 items-center justify-center p-8">
          <LinearGradient
            colors={['#61005D', '#A855F7']}
            className="w-24 h-24 rounded-full items-center justify-center mb-6 shadow-primary"
          >
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </LinearGradient>

          <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
            Entre para continuar
          </Text>
          <Text className="text-[15px] text-text-secondary text-center mb-8 leading-6">
            Crie sua loja, anuncie pecas e acompanhe suas vendas
          </Text>

          <TouchableOpacity
            className="w-full max-w-[280px] mb-4"
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#61005D', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 rounded-xl items-center shadow-primary"
            >
              <Text className="text-base font-bold text-white">Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[15px] font-semibold text-primary">
              Criar conta gratuita
            </Text>
          </TouchableOpacity>
        </View>

        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');

  return (
    <View className="flex-1 bg-background">
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
            <View className="flex-row items-center pt-5 pb-4">
              {/* Avatar with gradient ring */}
              <LinearGradient
                colors={['#61005D', '#A855F7']}
                className="w-[90px] h-[90px] rounded-full p-[3px] mr-5"
              >
                <View className="flex-1 bg-surface rounded-full items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Text className="text-3xl font-bold text-primary">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
              </LinearGradient>

              {/* Stats */}
              <View className="flex-1 flex-row justify-around">
                <StatItem value={stats.total} label="pecas" />
                <StatItem value={user.total_followers || 0} label="seguidores" />
                <StatItem value={user.total_following || 0} label="seguindo" />
              </View>
            </View>

            {/* Profile Info */}
            <View className="mb-5">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Text className="text-lg font-bold text-text-primary">
                  {user.store_name || user.name}
                </Text>
                {user.is_verified && (
                  <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                )}
              </View>

              {(user.store_description || user.bio) && (
                <Text className="text-sm text-text-secondary leading-5 mt-1">
                  {user.store_description || user.bio}
                </Text>
              )}

              {user.city && user.state && (
                <View className="flex-row items-center gap-1 mt-2">
                  <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                  <Text className="text-[13px] text-text-tertiary">
                    {user.city}, {user.state}
                  </Text>
                </View>
              )}

              {user.total_reviews > 0 && (
                <View className="flex-row items-center gap-1 mt-2">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="text-[13px] text-text-secondary">
                    {rating.toFixed(1)} ({user.total_reviews} avaliacoes)
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-1.5 py-3 bg-surface border border-border rounded-xl shadow-card"
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="pencil-outline" size={16} color="#111827" />
                <Text className="text-[13px] font-semibold text-text-primary">
                  Editar perfil
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-1.5 py-3 bg-primary-extraLight border border-primary-extraLight rounded-xl"
                onPress={() => navigation.navigate('Sales')}
              >
                <Ionicons name="stats-chart" size={16} color="#61005D" />
                <Text className="text-[13px] font-semibold text-primary">
                  Painel de vendas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row gap-2 mb-5">
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
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#61005D" />
            </View>
          ) : (
            <View className="items-center py-16 px-8">
              <View className="w-20 h-20 rounded-full bg-background-dark items-center justify-center mb-4">
                <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-bold text-text-primary mb-1.5">
                Nenhuma peca ainda
              </Text>
              <Text className="text-sm text-text-secondary text-center mb-6">
                Comece a vender suas pecas agora
              </Text>
              <TouchableOpacity
                className="rounded-xl overflow-hidden"
                onPress={() => navigation.navigate('NewItem')}
              >
                <LinearGradient
                  colors={['#61005D', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center gap-2 px-6 py-3.5"
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text className="text-[15px] font-semibold text-white">
                    Anunciar peca
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#61005D"
            colors={['#61005D']}
          />
        }
        contentContainerStyle={{ paddingBottom: isWeb ? 40 : 100 }}
      />

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
    </View>
  );
}
