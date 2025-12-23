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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { BottomNavigation, MainHeader } from '../components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';
const MAX_CONTENT_WIDTH = 800;

// Banner images for non-authenticated state
const BANNER_IMAGES = [
  { uri: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80', title: 'SUA CONTA', subtitle: 'Gerencie seus dados' },
  { uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', title: 'VENDA CONOSCO', subtitle: 'Lucre com moda circular' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = isWeb && windowWidth > 768;
  const isTablet = isWeb && windowWidth > 480 && windowWidth <= 768;
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);

  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();

  // Banner carousel for non-authenticated
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerFade = useRef(new Animated.Value(1)).current;

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);

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

  // Image picking functions
  const pickImage = async (type: 'avatar' | 'banner') => {
    if (isWeb) {
      pickImageFromGallery(type);
      return;
    }

    Alert.alert(
      type === 'avatar' ? 'Foto de Perfil' : 'Foto de Capa',
      'Escolha uma opcao:',
      [
        { text: 'Tirar Foto', onPress: () => pickImageFromCamera(type) },
        { text: 'Escolher da Galeria', onPress: () => pickImageFromGallery(type) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const pickImageFromCamera = async (type: 'avatar' | 'banner') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissao Necessaria', 'E necessario permitir acesso a camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri, type);
    }
  };

  const pickImageFromGallery = async (type: 'avatar' | 'banner') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissao Necessaria', 'E necessario permitir acesso a galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri, type);
    }
  };

  const uploadImage = async (uri: string, type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      setUploadingAvatar(true);
      setLocalAvatarUri(uri);
    } else {
      setUploadingBanner(true);
      setLocalBannerUri(uri);
    }

    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || `${type}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type: mimeType,
      } as any);
      formData.append('type', type);

      const response = await api.upload('/users/upload-image', formData);

      if (response.success) {
        await refreshUser();
        Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
      } else {
        throw new Error(response.message || 'Erro ao atualizar imagem');
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Nao foi possivel atualizar a imagem. Tente novamente.');
      if (type === 'avatar') setLocalAvatarUri(null);
      else setLocalBannerUri(null);
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>carregando...</Text>
        </View>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <MainHeader navigation={navigation} title="Perfil" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && { alignItems: 'center' },
          ]}
        >
          <View style={[
            styles.contentWrapper,
            isDesktop && { maxWidth: MAX_CONTENT_WIDTH, width: '100%' }
          ]}>
            {/* Banner Hero */}
            <Animated.View style={[styles.heroBanner, { opacity: bannerFade }]}>
              <Image
                source={{ uri: BANNER_IMAGES[currentBanner].uri }}
                style={styles.heroBannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.heroBannerOverlay}
              />
              <View style={styles.heroBannerContent}>
                <Text style={styles.heroBannerTitle}>
                  {BANNER_IMAGES[currentBanner].title}
                </Text>
                <Text style={styles.heroBannerSubtitle}>
                  {BANNER_IMAGES[currentBanner].subtitle}
                </Text>
              </View>
            </Animated.View>

            {/* Login Hero */}
            <View style={styles.loginHero}>
              <View style={styles.loginIconCircle}>
                <Ionicons name="heart" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.loginTitle}>Oi, bora desapegar?</Text>
              <Text style={styles.loginSubtitle}>
                Entre pra salvar favoritos, vender suas pecas e acompanhar seus pedidos
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
                  <Text style={styles.featureDesc}>salve as pecas que voce amou</Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="pricetag" size={20} color="#10B981" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureLabel}>venda facil</Text>
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

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Authenticated - Profile
  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');
  const isPremium = user?.subscription_type === 'premium' || user?.isPremium;
  const isOfficial = user?.is_official;
  const avatarUri = localAvatarUri || user.avatar_url;
  const bannerUri = localBannerUri || user.banner_url;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isDesktop && { alignItems: 'center' }}
      >
        <View style={[
          styles.profileWrapper,
          isDesktop && { maxWidth: MAX_CONTENT_WIDTH, width: '100%' }
        ]}>
          {/* Cover Photo - Clickable */}
          <TouchableOpacity
            style={[styles.coverPhotoContainer, { paddingTop: insets.top }]}
            onPress={() => pickImage('banner')}
            activeOpacity={0.9}
          >
            {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={styles.coverPhotoImage} />
            ) : (
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverPhotoGradient}
              />
            )}

            {/* Edit Banner Overlay */}
            <View style={styles.editBannerOverlay}>
              {uploadingBanner ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.editBannerText}>Alterar capa</Text>
                </>
              )}
            </View>

            {/* Official/Premium Badge */}
            {(isOfficial || isPremium) && (
              <View style={styles.topBadge}>
                {isOfficial && (
                  <View style={styles.officialBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.officialBadgeText}>Loja Oficial</Text>
                  </View>
                )}
                {isPremium && !isOfficial && (
                  <View style={styles.premiumTopBadge}>
                    <Ionicons name="diamond" size={14} color="#fff" />
                    <Text style={styles.premiumTopBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Card */}
          <View style={[styles.profileCard, isDesktop && styles.profileCardDesktop]}>
            {/* Avatar - Clickable */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => pickImage('avatar')}
              activeOpacity={0.9}
            >
              <View style={[styles.avatarRing, isPremium && styles.avatarRingPremium]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, isPremium && styles.avatarPlaceholderPremium]}>
                    <Text style={styles.avatarInitial}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Camera icon overlay */}
              <View style={styles.avatarCameraOverlay}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </View>

              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Name & Handle */}
            <View style={styles.nameSection}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
                {isOfficial && (
                  <Ionicons name="checkmark-circle" size={20} color="#2196F3" style={{ marginLeft: 6 }} />
                )}
              </View>
              <Text style={styles.userHandle}>@{user.name?.toLowerCase().replace(/\s/g, '') || 'usuario'}</Text>
            </View>

            {/* Plan Badge */}
            <View style={[styles.planBadge, isPremium ? styles.planBadgePremium : styles.planBadgeFree]}>
              {isPremium && <Ionicons name="diamond" size={12} color="#7B1FA2" style={{ marginRight: 4 }} />}
              <Text style={[styles.planBadgeText, isPremium && styles.planBadgeTextPremium]}>
                {isPremium ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
              <TouchableOpacity style={styles.statBox}>
                <Text style={styles.statNumber}>{user.total_sales || 0}</Text>
                <Text style={styles.statLabel}>vendas</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statBox}>
                <Text style={styles.statNumber}>{user.total_reviews || 0}</Text>
                <Text style={styles.statLabel}>avaliacoes</Text>
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
            <View style={[styles.actionButtonsRow, isDesktop && styles.actionButtonsRowDesktop]}>
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

          {/* Quick Actions Grid */}
          <View style={[styles.quickActionsGrid, isDesktop && styles.quickActionsGridDesktop]}>
            <TouchableOpacity
              style={[styles.quickActionCard, isDesktop && styles.quickActionCardDesktop]}
              onPress={() => navigation.navigate('MyStore')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="storefront" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Minha Loja</Text>
              <Text style={styles.quickActionDesc}>Gerencie seus anuncios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, isDesktop && styles.quickActionCardDesktop]}
              onPress={() => navigation.navigate('Sales')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="trending-up" size={24} color="#1976D2" />
              </View>
              <Text style={styles.quickActionLabel}>Vendas</Text>
              <Text style={styles.quickActionDesc}>Acompanhe resultados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, isDesktop && styles.quickActionCardDesktop]}
              onPress={() => navigation.navigate('Orders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="cube" size={24} color="#F57C00" />
              </View>
              <Text style={styles.quickActionLabel}>Pedidos</Text>
              <Text style={styles.quickActionDesc}>Suas compras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, isDesktop && styles.quickActionCardDesktop]}
              onPress={() => navigation.navigate('Favorites')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart" size={24} color="#E91E63" />
              </View>
              <Text style={styles.quickActionLabel}>Favoritos</Text>
              <Text style={styles.quickActionDesc}>Pecas salvas</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Section */}
          <View style={[styles.menuSection, isDesktop && styles.menuSectionDesktop]}>
            <Text style={styles.menuSectionTitle}>Configuracoes</Text>

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
                <Text style={styles.menuItemText}>Enderecos</Text>
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
        </View>
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
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  profileWrapper: {
    flex: 1,
    width: '100%',
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

  // Hero Banner (non-auth)
  heroBanner: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
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
  heroBannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '500',
  },

  // Login Hero
  loginHero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
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

  // Cover Photo (auth)
  coverPhotoContainer: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoGradient: {
    width: '100%',
    height: '100%',
  },
  editBannerOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  topBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  officialBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  premiumTopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  premiumTopBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
    marginTop: -50,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
      default: { elevation: 4 },
    }),
  },
  profileCardDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 20,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: -50,
    position: 'relative',
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    padding: 4,
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
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderPremium: {
    backgroundColor: '#7B1FA2',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  avatarCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 4,
    right: 30,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray[800],
    textAlign: 'center',
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 12,
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
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '100%',
  },
  statsRowDesktop: {
    maxWidth: 400,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.gray[300],
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  actionButtonsRowDesktop: {
    maxWidth: 400,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryActionBtnText: {
    fontSize: 16,
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
    paddingVertical: 16,
    borderRadius: 14,
  },
  secondaryActionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionsGridDesktop: {
    justifyContent: 'center',
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  quickActionCardDesktop: {
    width: 180,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  quickActionDesc: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 4,
  },

  // Menu Section
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  menuSectionDesktop: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    fontSize: 16,
    color: COLORS.gray[700],
  },
  menuBadge: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Version
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
