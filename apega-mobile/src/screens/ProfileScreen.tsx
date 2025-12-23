import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { BottomNavigation, MainHeader } from '../components';
import { useAuth } from '../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';
const MAX_CONTENT_WIDTH = 600;

// Banner images
const BANNER_IMAGES = [
  { uri: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80', title: 'SUA CONTA', subtitle: 'Gerencie seus dados' },
  { uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', title: 'VENDA CONOSCO', subtitle: 'Lucre com moda circular' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = isWeb && windowWidth > 768;

  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();

  // Banner carousel
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(bannerFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
        Animated.timing(bannerFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerFade]);

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        if (!isAuthenticated) return;
        const freshUser = await refreshUser();
        if (!freshUser) {
          await logout();
        }
      };
      refresh();
    }, [isAuthenticated, refreshUser, logout])
  );

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.webWrapper, isDesktop && styles.webWrapperDesktop]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>carregando...</Text>
          </View>
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Not authenticated - Enjoei style login prompt
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <MainHeader navigation={navigation} title="Perfil" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.scrollContentDesktop,
          ]}
        >
          <View style={[
            styles.contentWrapper,
            isDesktop && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }
          ]}>
            {/* Banner Hero */}
            <Animated.View style={[
              styles.heroBanner,
              { opacity: bannerFade },
              isDesktop && styles.heroBannerDesktop
            ]}>
              <Image
                source={{ uri: BANNER_IMAGES[currentBanner].uri }}
                style={styles.heroBannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.heroBannerOverlay}
              />
              <View style={styles.heroBannerContent}>
                <Text style={[styles.heroBannerTitle, isDesktop && styles.heroBannerTitleDesktop]}>
                  {BANNER_IMAGES[currentBanner].title}
                </Text>
                <Text style={[styles.heroBannerSubtitle, isDesktop && styles.heroBannerSubtitleDesktop]}>
                  {BANNER_IMAGES[currentBanner].subtitle}
                </Text>
              </View>
              <View style={styles.bannerDots}>
                {BANNER_IMAGES.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.bannerDot, currentBanner === index && styles.bannerDotActive]}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Login Hero */}
            <View style={styles.loginHero}>
              <View style={styles.loginIconCircle}>
                <Ionicons name="heart" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.loginTitle}>Oi, bora desapegar?</Text>
              <Text style={styles.loginSubtitle}>
                Entre pra salvar favoritos, vender suas peças e acompanhar seus pedidos
              </Text>
            </View>

            {/* Login Actions */}
            <View style={styles.loginActions}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>entrar ou criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>por que entrar?</Text>

              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="heart" size={20} color="#EF4444" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>favoritos</Text>
                  <Text style={styles.featureDesc}>salve as peças que você amou</Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="pricetag" size={20} color="#10B981" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>venda fácil</Text>
                  <Text style={styles.featureDesc}>anuncie e ganhe dinheiro</Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="cube" size={20} color="#6366F1" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>pedidos</Text>
                  <Text style={styles.featureDesc}>acompanhe tudo em um lugar</Text>
                </View>
              </View>
            </View>

            {/* About Section - Story of Apega Desapega */}
            <View style={styles.aboutSection}>
              <LinearGradient
                colors={['#f8f4f0', '#fff5eb']}
                style={styles.aboutGradient}
              >
                <Text style={styles.aboutTitle}>nossa história</Text>

                <View style={styles.founderCard}>
                  <View style={styles.founderImagePlaceholder}>
                    <Ionicons name="person" size={32} color={COLORS.primary} />
                  </View>
                  <View style={styles.founderInfo}>
                    <Text style={styles.founderName}>amanda maier</Text>
                    <Text style={styles.founderRole}>fundadora</Text>
                  </View>
                </View>

                <Text style={styles.aboutText}>
                  a apega desapega nasceu de uma lojinha física em passo fundo, rio grande do sul.
                  começou pequena, com a paixão da amanda por moda circular e sustentabilidade.
                </Text>

                <Text style={styles.aboutText}>
                  hoje somos um brechó destaque no RS, conectando pessoas que amam moda consciente.
                  cada peça tem história, e agora você pode fazer parte da nossa.
                </Text>

                <View style={styles.aboutBadges}>
                  <View style={styles.aboutBadge}>
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                    <Text style={styles.aboutBadgeText}>passo fundo, rs</Text>
                  </View>
                  <View style={styles.aboutBadge}>
                    <Ionicons name="leaf" size={14} color="#10B981" />
                    <Text style={styles.aboutBadgeText}>moda sustentável</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Authenticated - Profile Dashboard (Instagram Style)
  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');
  const isPremium = user?.subscription_type === 'premium' || user?.isPremium;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo & Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.coverPhoto, { paddingTop: insets.top }]}
          >
            {/* Settings button */}
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Decorative elements */}
            <View style={styles.coverDecor1} />
            <View style={styles.coverDecor2} />
          </LinearGradient>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={[styles.avatarRing, isPremium && styles.avatarRingPremium]}>
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, isPremium && styles.avatarPlaceholderPremium]}>
                    <Text style={styles.avatarInitial}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Name & Handle */}
            <Text style={styles.userName}>{user.name || 'Usuário'}</Text>
            <Text style={styles.userHandle}>@{user.name?.toLowerCase().replace(/\s/g, '') || 'usuario'}</Text>

            {/* Premium/Free Badge */}
            <View style={[styles.planBadge, isPremium ? styles.planBadgePremium : styles.planBadgeFree]}>
              {isPremium && <Ionicons name="diamond" size={12} color="#7B1FA2" style={{ marginRight: 4 }} />}
              <Text style={[styles.planBadgeText, isPremium && styles.planBadgeTextPremium]}>
                {isPremium ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statBox}>
                <Text style={styles.statNumber}>{user.total_sales || 0}</Text>
                <Text style={styles.statLabel}>vendas</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statBox}>
                <Text style={styles.statNumber}>{user.total_reviews || 0}</Text>
                <Text style={styles.statLabel}>avaliações</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <View style={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(rating) ? 'star' : 'star-outline'}
                      size={14}
                      color={i < Math.floor(rating) ? '#FFD700' : '#ddd'}
                    />
                  ))}
                </View>
                <Text style={styles.statLabel}>{rating.toFixed(1)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => navigation.navigate('NewItem')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.primaryActionBtnText}>Vender</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.gray[700]} />
                <Text style={styles.secondaryActionBtnText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('MyStore')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="storefront" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Minha Loja</Text>
            <Text style={styles.quickActionDesc}>Gerencie seus anúncios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Sales')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up" size={24} color="#1976D2" />
            </View>
            <Text style={styles.quickActionLabel}>Vendas</Text>
            <Text style={styles.quickActionDesc}>Acompanhe resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cube" size={24} color="#F57C00" />
            </View>
            <Text style={styles.quickActionLabel}>Pedidos</Text>
            <Text style={styles.quickActionDesc}>Suas compras</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Favorites')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="heart" size={24} color="#E91E63" />
            </View>
            <Text style={styles.quickActionLabel}>Favoritos</Text>
            <Text style={styles.quickActionDesc}>Peças salvas</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Configurações</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Balance')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="wallet-outline" size={22} color={COLORS.gray[600]} />
              <Text style={styles.menuItemText}>Saldo e Pagamentos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Addresses')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={22} color={COLORS.gray[600]} />
              <Text style={styles.menuItemText}>Endereços</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Subscription')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="diamond-outline" size={22} color="#7B1FA2" />
              <Text style={styles.menuItemText}>{isPremium ? 'Gerenciar Premium' : 'Seja Premium'}</Text>
            </View>
            {!isPremium && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>UPGRADE</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.gray[600]} />
              <Text style={styles.menuItemText}>Ajuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemLogout]} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Sair</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>apega desapega v1.0.0</Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  webWrapper: {
    flex: 1,
  },
  webWrapperDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FAF9F7',
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  logoLight: {
    fontWeight: '400',
    color: COLORS.gray[400],
  },
  navDesktop: {
    flexDirection: 'row',
    gap: 32,
  },
  navLink: {
    fontSize: 15,
    color: COLORS.gray[700],
    fontWeight: '500',
  },

  // Hero Banner
  heroBanner: {
    height: 180,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBannerDesktop: {
    height: 220,
    marginHorizontal: 0,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBannerContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
  },
  heroBannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
  },
  heroBannerTitleDesktop: {
    fontSize: 36,
  },
  heroBannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '500',
  },
  heroBannerSubtitleDesktop: {
    fontSize: 16,
  },
  bannerDots: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    flexDirection: 'row',
    gap: 8,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  bannerDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },

  // Login Hero
  loginHero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    position: 'relative',
  },
  loginIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  loginSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Login Actions
  loginActions: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Features
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 15,
    color: '#666',
  },

  // About Section
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  aboutGradient: {
    borderRadius: 16,
    padding: 24,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  founderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  founderImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  founderRole: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  aboutBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  aboutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  aboutBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Profile Card (authenticated)
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F7',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 20,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[700],
  },

  // Menu Section
  menuSection: {
    marginHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },

  // Version
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },

  // ===== NEW INSTAGRAM STYLE PROFILE =====
  profileHeader: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  coverPhoto: {
    height: 140,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 16,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverDecor1: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(201,162,39,0.15)',
  },
  coverDecor2: {
    position: 'absolute',
    bottom: 30,
    right: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201,162,39,0.1)',
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: -50,
    position: 'relative',
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    padding: 3,
    ...Platform.select({
      web: { boxShadow: '0 4px 15px rgba(0,0,0,0.15)' },
      default: { elevation: 5 },
    }),
  },
  avatarRingPremium: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderPremium: {
    backgroundColor: '#7B1FA2',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[800],
    textAlign: 'center',
    marginTop: 12,
  },
  userHandle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 2,
  },
  planBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  planBadgeFree: {
    backgroundColor: COLORS.gray[200],
  },
  planBadgePremium: {
    backgroundColor: '#FFD700',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[600],
    letterSpacing: 0.5,
  },
  planBadgeTextPremium: {
    color: '#7B1FA2',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.gray[300],
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryActionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[700],
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  quickActionDesc: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },

  // Menu Section
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLogout: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.gray[700],
  },
  menuBadge: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
