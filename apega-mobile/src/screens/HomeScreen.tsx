import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  useWindowDimensions,
  ImageBackground,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { productsService, categoriesService, Product, Category } from '../api';

// Fashion images
const HERO_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80';

const CATEGORIES = [
  { id: '1', name: 'Roupas', icon: 'shirt', image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400' },
  { id: '2', name: 'Bolsas', icon: 'bag-handle', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  { id: '3', name: 'Calçados', icon: 'footsteps', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400' },
  { id: '4', name: 'Acessórios', icon: 'watch', image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=400' },
  { id: '5', name: 'Joias', icon: 'diamond', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
  { id: '6', name: 'Masculino', icon: 'man', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400' },
];

const COLLECTIONS = [
  { id: '1', title: 'Verão 2024', subtitle: 'Peças leves', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', gradient: ['#FF6B6B', '#FF8E53'] },
  { id: '2', title: 'Vintage', subtitle: 'Achados únicos', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', gradient: ['#9B59B6', '#8E44AD'] },
  { id: '3', title: 'Premium', subtitle: 'Marcas top', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', gradient: ['#3498DB', '#2980B9'] },
];

const MOCK_PRODUCTS = [
  { id: 'p1', title: 'Vestido Floral Farm', price: 189, original_price: 459, brand: 'Farm', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', condition: 'seminovo', seller: 'Maria S.', city: 'São Paulo' },
  { id: 'p2', title: 'Bolsa Couro Schutz', price: 299, original_price: 890, brand: 'Schutz', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', condition: 'novo', seller: 'Ana P.', city: 'Rio de Janeiro' },
  { id: 'p3', title: 'Blazer Estruturado', price: 159, original_price: 399, brand: 'Zara', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', condition: 'seminovo', seller: 'Julia M.', city: 'Curitiba' },
  { id: 'p4', title: 'Tênis Nike Air Max', price: 249, original_price: 699, brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', condition: 'usado', seller: 'Carlos R.', city: 'Belo Horizonte' },
  { id: 'p5', title: 'Saia Midi Plissada', price: 129, original_price: 320, brand: 'Animale', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uh9a?w=400', condition: 'seminovo', seller: 'Fernanda L.', city: 'Porto Alegre' },
  { id: 'p6', title: 'Camisa Linho Premium', price: 89, original_price: 199, brand: 'Renner', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', condition: 'novo', seller: 'Patricia K.', city: 'Florianópolis' },
  { id: 'p7', title: 'Vestido Midi Estampado', price: 179, original_price: 450, brand: 'Amaro', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', condition: 'seminovo', seller: 'Lucia A.', city: 'Brasília' },
  { id: 'p8', title: 'Jaqueta Jeans Vintage', price: 199, original_price: 380, brand: 'Levis', image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400', condition: 'vintage', seller: 'Renata G.', city: 'Salvador' },
];

export function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Responsive
  const isDesktop = width > 900;
  const isTablet = width > 600 && width <= 900;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;
  const productWidth = (width - 32 - (numColumns - 1) * 12) / numColumns;

  const fetchData = useCallback(async () => {
    try {
      const res = await productsService.getProducts({ limit: 20 });
      if (res.products?.length > 0) {
        setProducts(res.products);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5D8A7D" />}
      >
        {/* HERO */}
        <ImageBackground source={{ uri: HERO_IMAGE }} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']} style={styles.heroOverlay}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Text style={styles.logo}>apega</Text>
                <Text style={styles.logoLight}>desapega</Text>
              </View>
              <View style={styles.headerIcons}>
                <Pressable style={styles.iconBtn}>
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconBtn}>
                  <Ionicons name="bag-outline" size={24} color="#fff" />
                  <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>2</Text></View>
                </Pressable>
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>MODA SUSTENTÁVEL</Text>
              </View>
              <Text style={styles.heroTitle}>Seu estilo,{'\n'}nova história</Text>
              <Text style={styles.heroSubtitle}>Peças únicas com até 80% off</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar marcas, peças..."
              placeholderTextColor="#A3A3A3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable style={styles.filterBtn}>
              <Ionicons name="options-outline" size={20} color="#5D8A7D" />
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <Pressable><Text style={styles.seeAll}>Ver todas</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <Pressable key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Image source={{ uri: cat.image }} style={styles.categoryImg} contentFit="cover" />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient colors={['#FF6B6B', '#FF8E53']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGrad}>
            <View>
              <Text style={styles.promoSmall}>OFERTA ESPECIAL</Text>
              <Text style={styles.promoTitle}>Até 70% OFF</Text>
              <Text style={styles.promoSub}>em peças selecionadas</Text>
            </View>
            <Pressable style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Ver ofertas</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Coleções</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsRow}>
            {COLLECTIONS.map((col) => (
              <Pressable key={col.id} style={styles.collectionCard}>
                <Image source={{ uri: col.image }} style={styles.collectionImg} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.collectionOverlay}>
                  <Text style={styles.collectionTitle}>{col.title}</Text>
                  <Text style={styles.collectionSub}>{col.subtitle}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Novidades ✨</Text>
              <Text style={styles.sectionSub}>Acabou de chegar</Text>
            </View>
            <Pressable style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Ver tudo</Text>
              <Ionicons name="chevron-forward" size={16} color="#5D8A7D" />
            </Pressable>
          </View>

          <View style={[styles.productsGrid, { gap: 12 }]}>
            {displayProducts.slice(0, isDesktop ? 8 : 6).map((item: any, idx: number) => {
              const img = item.image_url || item.image || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].image;
              const discount = item.original_price ? Math.round(((item.original_price - item.price) / item.original_price) * 100) : 0;

              return (
                <Pressable key={item.id} style={[styles.productCard, { width: productWidth }]}>
                  <View style={styles.productImgWrap}>
                    <Image source={{ uri: img }} style={styles.productImg} contentFit="cover" />
                    <Pressable style={styles.heartBtn}>
                      <Ionicons name="heart-outline" size={18} color="#fff" />
                    </Pressable>
                    {discount > 0 && (
                      <View style={styles.discountTag}>
                        <Text style={styles.discountText}>-{discount}%</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productBrand}>{item.brand || 'Marca'}</Text>
                    <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>R$ {item.price}</Text>
                      {item.original_price && <Text style={styles.oldPrice}>R$ {item.original_price}</Text>}
                    </View>
                    <View style={styles.sellerRow}>
                      <Ionicons name="location-outline" size={12} color="#A3A3A3" />
                      <Text style={styles.sellerText}>{item.city || item.seller_city || 'Brasil'}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Carregar mais</Text>
          </Pressable>
        </View>

        {/* Sell CTA */}
        <View style={styles.sellCta}>
          <LinearGradient colors={['#5D8A7D', '#4A7266']} style={styles.sellCtaGrad}>
            <View style={styles.sellCtaContent}>
              <Text style={styles.sellCtaTitle}>Tem peças paradas?</Text>
              <Text style={styles.sellCtaSub}>Transforme em dinheiro vendendo aqui</Text>
              <Pressable style={styles.sellCtaBtn}>
                <Ionicons name="camera-outline" size={20} color="#5D8A7D" />
                <Text style={styles.sellCtaBtnText}>Começar a vender</Text>
              </Pressable>
            </View>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300' }} style={styles.sellCtaImg} contentFit="cover" />
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogoWrap}>
            <Text style={styles.footerLogo}>apega</Text>
            <Text style={styles.footerLogoLight}>desapega</Text>
          </View>
          <Text style={styles.footerSlogan}>Moda sustentável é nosso modo de mudar o mundo 🌱</Text>
          <View style={styles.footerLinks}>
            <Pressable><Text style={styles.footerLink}>Sobre</Text></Pressable>
            <Pressable><Text style={styles.footerLink}>Ajuda</Text></Pressable>
            <Pressable><Text style={styles.footerLink}>Termos</Text></Pressable>
          </View>
          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn}><Ionicons name="logo-instagram" size={20} color="#525252" /></Pressable>
            <Pressable style={styles.socialBtn}><Ionicons name="logo-tiktok" size={20} color="#525252" /></Pressable>
            <Pressable style={styles.socialBtn}><Ionicons name="logo-whatsapp" size={20} color="#525252" /></Pressable>
          </View>
          <Text style={styles.copyright}>© 2024 Apega Desapega</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Hero
  hero: { height: 420 },
  heroOverlay: { flex: 1, paddingHorizontal: 16, paddingBottom: 32, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoWrap: { flexDirection: 'row', alignItems: 'baseline' },
  logo: { fontSize: 26, fontWeight: '800', color: '#fff' },
  logoLight: { fontSize: 26, fontWeight: '300', color: 'rgba(255,255,255,0.8)' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#FF6B6B', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroContent: {},
  heroTag: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  heroTagText: { fontSize: 11, fontWeight: '700', color: '#5D8A7D', letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#fff', lineHeight: 42 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 8 },

  // Search
  searchWrap: { paddingHorizontal: 16, marginTop: -24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 16, height: 52, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', elevation: 8, gap: 12 } as any,
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F0ED', alignItems: 'center', justifyContent: 'center' },

  // Sections
  section: { marginTop: 28 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  sectionSub: { fontSize: 13, color: '#737373', marginTop: 2 },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#5D8A7D' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Categories
  categoriesRow: { paddingHorizontal: 16, gap: 16 },
  categoryItem: { alignItems: 'center', width: 72 },
  categoryCircle: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: '#5D8A7D', marginBottom: 6 },
  categoryImg: { width: '100%', height: '100%' },
  categoryName: { fontSize: 11, fontWeight: '600', color: '#525252', textAlign: 'center' },

  // Promo
  promoBanner: { marginHorizontal: 16, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  promoGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20 },
  promoSmall: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1, marginBottom: 4 },
  promoTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  promoBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  promoBtnText: { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },

  // Collections
  collectionsRow: { paddingHorizontal: 16, gap: 12 },
  collectionCard: { width: 160, height: 200, borderRadius: 16, overflow: 'hidden' },
  collectionImg: { width: '100%', height: '100%' },
  collectionOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 14 },
  collectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  collectionSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Products
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  productCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', elevation: 3 } as any,
  productImgWrap: { aspectRatio: 0.85, position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  discountTag: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF6B6B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  discountText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  productInfo: { padding: 12 },
  productBrand: { fontSize: 10, fontWeight: '700', color: '#5D8A7D', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  price: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  oldPrice: { fontSize: 12, color: '#A3A3A3', textDecorationLine: 'line-through' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  sellerText: { fontSize: 11, color: '#A3A3A3' },
  loadMoreBtn: { alignSelf: 'center', marginTop: 16, paddingHorizontal: 32, paddingVertical: 14, borderWidth: 2, borderColor: '#5D8A7D', borderRadius: 28 },
  loadMoreText: { fontSize: 14, fontWeight: '600', color: '#5D8A7D' },

  // Sell CTA
  sellCta: { marginHorizontal: 16, marginTop: 32, borderRadius: 20, overflow: 'hidden' },
  sellCtaGrad: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  sellCtaContent: { flex: 1 },
  sellCtaTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  sellCtaSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 16 },
  sellCtaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  sellCtaBtnText: { fontSize: 13, fontWeight: '600', color: '#5D8A7D' },
  sellCtaImg: { width: 100, height: 100, borderRadius: 16, marginLeft: 16 },

  // Footer
  footer: { marginTop: 40, paddingVertical: 32, paddingHorizontal: 16, backgroundColor: '#FAFAFA', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  footerLogoWrap: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  footerLogo: { fontSize: 24, fontWeight: '800', color: '#5D8A7D' },
  footerLogoLight: { fontSize: 24, fontWeight: '300', color: '#A3A3A3' },
  footerSlogan: { fontSize: 13, color: '#737373', textAlign: 'center', marginBottom: 20 },
  footerLinks: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  footerLink: { fontSize: 14, fontWeight: '500', color: '#525252' },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8E8E8' },
  copyright: { fontSize: 12, color: '#A3A3A3' },
});

export default HomeScreen;
