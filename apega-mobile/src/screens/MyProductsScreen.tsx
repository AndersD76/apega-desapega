import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { productsService } from '../api';
import { formatPrice } from '../utils/format';

const TABS = [
  { id: 'active', name: 'Ativos' },
  { id: 'sold', name: 'Vendidos' },
  { id: 'paused', name: 'Pausados' },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400';


export function MyProductsScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('active');
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const numColumns = width > 600 ? 3 : 2;
  const productWidth = (width - 32 - (numColumns - 1) * 12) / numColumns;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productsService.getMyProducts(activeTab);
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // Atualiza quando a tela ganha foco (ex: após editar)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleEdit = (product: any) => {
    navigation.navigate('EditProduct', { product });
  };

  const handlePause = async (product: any) => {
    const newStatus = product.status === 'paused' ? 'active' : 'paused';
    const actionText = newStatus === 'paused' ? 'pausar' : 'reativar';

    Alert.alert(
      newStatus === 'paused' ? 'Pausar anúncio' : 'Reativar anúncio',
      `Deseja ${actionText} este anúncio?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: newStatus === 'paused' ? 'Pausar' : 'Reativar',
          onPress: async () => {
            try {
              await productsService.updateProduct(product.id, { status: newStatus });
              // Atualizar lista local
              setProducts(prev =>
                prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
              );
              Alert.alert('Sucesso', `Anúncio ${newStatus === 'paused' ? 'pausado' : 'reativado'} com sucesso!`);
            } catch (error) {
              console.error('Error updating product:', error);
              Alert.alert('Erro', 'Não foi possível alterar o status do anúncio.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (product: any) => {
    Alert.alert(
      'Excluir anúncio',
      'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsService.deleteProduct(product.id);
              // Remover da lista local
              setProducts(prev => prev.filter(p => p.id !== product.id));
              Alert.alert('Sucesso', 'Anúncio excluído com sucesso!');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Erro', 'Não foi possível excluir o anúncio.');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: any) => (
    <Pressable
      style={[styles.productCard, { width: productWidth }]}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImgWrap}>
        <Image source={{ uri: item.image_url || item.image || PLACEHOLDER_IMAGE }} style={styles.productImg} contentFit="cover" />
        {item.status === 'sold' && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>VENDIDO</Text>
          </View>
        )}
        {item.status === 'paused' && (
          <View style={styles.pausedOverlay}>
            <Ionicons name="pause-circle" size={24} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productPrice}>R$ {formatPrice(item.price)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={14} color="#A3A3A3" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={14} color="#A3A3A3" />
            <Text style={styles.statText}>{item.favorites}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil-outline" size={16} color="#5D8A7D" />
        </Pressable>
        {item.status === 'active' && (
          <Pressable style={styles.actionBtn} onPress={() => handlePause(item)}>
            <Ionicons name="pause-outline" size={16} color="#F59E0B" />
          </Pressable>
        )}
        {item.status === 'paused' && (
          <Pressable style={styles.actionBtn} onPress={() => handlePause(item)}>
            <Ionicons name="play-outline" size={16} color="#10B981" />
          </Pressable>
        )}
        <Pressable style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Meus Anúncios</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('Main', { screen: 'Sell' })}>
          <Ionicons name="add" size={24} color="#5D8A7D" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.name}
            </Text>
            {activeTab === tab.id && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5D8A7D" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bag-outline" size={48} color="#A3A3A3" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'Nenhum anúncio ativo' :
               activeTab === 'sold' ? 'Nenhuma venda ainda' : 'Nenhum anúncio pausado'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'Comece a vender suas peças' :
               activeTab === 'sold' ? 'Suas vendas aparecerão aqui' : 'Seus anúncios pausados aparecerão aqui'}
            </Text>
            {activeTab === 'active' && (
              <Pressable onPress={() => navigation.navigate('Main', { screen: 'Sell' })}>
                <LinearGradient colors={['#5D8A7D', '#4A7266']} style={styles.createBtn}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createBtnText}>Criar anúncio</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0ED', alignItems: 'center', justifyContent: 'center' },

  // Tabs
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '500', color: '#737373' },
  tabTextActive: { color: '#5D8A7D', fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: 0, left: '25%', right: '25%', height: 2, backgroundColor: '#5D8A7D', borderRadius: 1 },

  // Products
  productsGrid: { padding: 16 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  productCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  productImgWrap: { aspectRatio: 1, position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  soldOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  soldText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  pausedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  productInfo: { padding: 10 },
  productTitle: { fontSize: 13, fontWeight: '500', color: '#1A1A1A' },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#5D8A7D', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#A3A3A3' },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#737373', textAlign: 'center', marginBottom: 24 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  createBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default MyProductsScreen;
