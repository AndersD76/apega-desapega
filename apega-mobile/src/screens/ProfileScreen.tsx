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
const MAX_CONTENT_WIDTH = 600;

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = isWeb && windowWidth > 768;

  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);

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
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const pickAvatar = async () => {
    if (isWeb) {
      pickAvatarFromGallery();
      return;
    }
    Alert.alert('Foto de Perfil', 'Escolha uma opcao:', [
      { text: 'Tirar Foto', onPress: pickAvatarFromCamera },
      { text: 'Escolher da Galeria', onPress: pickAvatarFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const pickAvatarFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao Necessaria', 'Permita acesso a camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const pickAvatarFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao Necessaria', 'Permita acesso a galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    setLocalAvatarUri(uri);
    try {
      const formData = new FormData();

      if (isWeb) {
        // Web: converter blob URL para File
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('image', file);
      } else {
        // Mobile: usar objeto com uri
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', { uri, name: filename, type: mimeType } as any);
      }

      formData.append('type', 'avatar');

      console.log('[Upload] Iniciando upload de avatar...');
      const uploadResponse = await api.upload('/users/upload-image', formData);
      console.log('[Upload] Resposta:', uploadResponse);

      if (uploadResponse.success) {
        console.log('[Upload] Sucesso! URL:', uploadResponse.url);
        await refreshUser();
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
      } else {
        throw new Error(uploadResponse.message || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('[Upload] Erro:', error);
      Alert.alert('Erro', error.message || 'Nao foi possivel atualizar a foto.');
      setLocalAvatarUri(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Banner functions
  const pickBanner = async () => {
    if (isWeb) {
      pickBannerFromGallery();
      return;
    }
    Alert.alert('Banner da Loja', 'Escolha uma opcao:', [
      { text: 'Tirar Foto', onPress: pickBannerFromCamera },
      { text: 'Escolher da Galeria', onPress: pickBannerFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const pickBannerFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao Necessaria', 'Permita acesso a camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadBanner(result.assets[0].uri);
    }
  };

  const pickBannerFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao Necessaria', 'Permita acesso a galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadBanner(result.assets[0].uri);
    }
  };

  const uploadBanner = async (uri: string) => {
    setUploadingBanner(true);
    setLocalBannerUri(uri);
    try {
      const formData = new FormData();

      if (isWeb) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], 'banner.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('image', file);
      } else {
        const filename = uri.split('/').pop() || 'banner.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', { uri, name: filename, type: mimeType } as any);
      }

      formData.append('type', 'banner');

      console.log('[Upload] Iniciando upload de banner...');
      const uploadResponse = await api.upload('/users/upload-image', formData);
      console.log('[Upload] Resposta:', uploadResponse);

      if (uploadResponse.success) {
        console.log('[Upload] Sucesso! URL:', uploadResponse.url);
        await refreshUser();
        Alert.alert('Sucesso', 'Banner atualizado com sucesso!');
      } else {
        throw new Error(uploadResponse.message || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('[Upload] Erro:', error);
      Alert.alert('Erro', error.message || 'Nao foi possivel atualizar o banner.');
      setLocalBannerUri(null);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F7" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.contentWrapper, isDesktop && styles.contentWrapperDesktop]}>
            <View style={styles.loginCard}>
              <View style={styles.loginIconBg}>
                <Ionicons name="person-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.loginTitle}>Entre na sua conta</Text>
              <Text style={styles.loginSubtitle}>
                Acesse para vender, comprar e acompanhar seus pedidos
              </Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginBtnText}>Entrar ou criar conta</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Beneficios de ter uma conta</Text>
              {[
                { icon: 'heart-outline', label: 'Salvar favoritos', color: '#EF4444' },
                { icon: 'pricetag-outline', label: 'Vender suas pecas', color: '#10B981' },
                { icon: 'cube-outline', label: 'Acompanhar pedidos', color: '#6366F1' },
                { icon: 'wallet-outline', label: 'Receber pagamentos', color: '#F59E0B' },
              ].map((item, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={[styles.benefitIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.benefitLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <BottomNavigation navigation={navigation} activeRoute="Profile" />
      </View>
    );
  }

  // Authenticated
  const isPremium = user?.subscription_type === 'premium';
  const isOfficial = user?.is_official;
  const avatarUri = localAvatarUri || user.avatar_url;
  const bannerUri = localBannerUri || user.banner_url;
  const rating = typeof user.rating === 'number' ? user.rating : parseFloat(user.rating || '0');

  const menuItems = [
    { icon: 'storefront-outline', label: 'Minha Loja', route: 'MyStore', color: COLORS.primary },
    { icon: 'trending-up-outline', label: 'Minhas Vendas', route: 'Sales', color: '#1976D2' },
    { icon: 'cube-outline', label: 'Meus Pedidos', route: 'Orders', color: '#F57C00' },
    { icon: 'heart-outline', label: 'Favoritos', route: 'Favorites', color: '#E91E63' },
    { icon: 'wallet-outline', label: 'Saldo', route: 'Balance', color: '#4CAF50' },
    { icon: 'location-outline', label: 'Enderecos', route: 'Addresses', color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F7" />
      <MainHeader navigation={navigation} title="Meu Perfil" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.contentWrapper, isDesktop && styles.contentWrapperDesktop]}>
          {/* Profile Header Card with Banner */}
          <View style={styles.profileCard}>
            {/* Banner */}
            <TouchableOpacity style={styles.bannerContainer} onPress={pickBanner} activeOpacity={0.8}>
              {bannerUri ? (
                <Image source={{ uri: bannerUri }} style={styles.banner} />
              ) : (
                <LinearGradient
                  colors={[COLORS.primary, '#4CAF50']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bannerPlaceholder}
                />
              )}
              <View style={styles.bannerOverlay}>
                {uploadingBanner ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="camera" size={18} color="#fff" />
                    <Text style={styles.bannerText}>Alterar Banner</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Profile Info */}
            <View style={styles.profileInfoSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraBtn}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name || 'Usuario'}</Text>
                  {isOfficial && (
                    <Ionicons name="checkmark-circle" size={18} color="#2196F3" />
                  )}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
                  {isPremium && <Ionicons name="diamond" size={12} color="#7B1FA2" />}
                  <Text style={[styles.planText, isPremium && styles.planTextPremium]}>
                    {isPremium ? 'Premium' : 'Free'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.gray[600]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.total_sales || 0}</Text>
              <Text style={styles.statLabel}>Vendas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.total_reviews || 0}</Text>
              <Text style={styles.statLabel}>Avaliacoes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>Nota</Text>
            </View>
          </View>

          {/* Sell Button */}
          <TouchableOpacity
            style={styles.sellBtn}
            onPress={() => navigation.navigate('NewItem')}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.sellBtnText}>Vender uma peca</Text>
          </TouchableOpacity>

          {/* Menu */}
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={() => navigation.navigate(item.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}12` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium Card */}
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumCard}
              onPress={() => navigation.navigate('Subscription')}
            >
              <LinearGradient
                colors={['#7B1FA2', '#9C27B0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumGradient}
              >
                <Ionicons name="diamond" size={28} color="#FFD700" />
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>Seja Premium</Text>
                  <Text style={styles.premiumDesc}>Destaque seus anuncios e pague menos taxa</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Help & Logout */}
          <View style={styles.footerCard}>
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => navigation.navigate('Help')}
            >
              <Ionicons name="help-circle-outline" size={22} color={COLORS.gray[600]} />
              <Text style={styles.footerLabel}>Ajuda</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerItem, styles.logoutItem]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.footerLabel, styles.logoutLabel]}>Sair da conta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>apega desapega v1.0.0</Text>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentWrapper: {
    padding: 16,
  },
  contentWrapperDesktop: {
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  // Login Card
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  loginIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  benefitLabel: {
    fontSize: 15,
    color: '#333',
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  bannerContainer: {
    height: 100,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: -30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  planBadgePremium: {
    backgroundColor: '#FFD700',
  },
  planText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  planTextPremium: {
    color: '#7B1FA2',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Sell Button
  sellBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(107, 144, 128, 0.3)' },
      default: { elevation: 4 },
    }),
  },
  sellBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Menu Card
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },

  // Premium Card
  premiumCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(123, 31, 162, 0.2)' },
      default: { elevation: 4 },
    }),
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  premiumContent: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  premiumDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Footer Card
  footerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  footerLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 14,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutLabel: {
    color: '#EF4444',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
