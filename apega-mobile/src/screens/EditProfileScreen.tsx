import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../api/users';

const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200';
const PLACEHOLDER_BANNER = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800';

export function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');

  const pickImage = async (type: 'avatar' | 'banner') => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissao necessaria', 'Precisamos de permissao para acessar suas fotos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri, type);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Nao foi possivel selecionar a imagem');
    }
  };

  const takePhoto = async (type: 'avatar' | 'banner') => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissao necessaria', 'Precisamos de permissao para usar a camera.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImage(imageUri, type);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Nao foi possivel tirar a foto');
    }
  };

  const uploadImage = async (imageUri: string, type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      setUploadingAvatar(true);
    } else {
      setUploadingBanner(true);
    }

    try {
      const response = await usersService.uploadImage(imageUri, type);
      if (response.success) {
        if (type === 'avatar') {
          setAvatarUrl(response.url);
        } else {
          setBannerUrl(response.url);
        }
        // Refresh user in context
        if (refreshUser) {
          await refreshUser();
        }
        Alert.alert('Sucesso', 'Imagem atualizada com sucesso!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Nao foi possivel enviar a imagem');
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const handleChangePhoto = (type: 'avatar' | 'banner') => {
    const title = type === 'avatar' ? 'Alterar foto de perfil' : 'Alterar foto de capa';
    Alert.alert(title, 'Escolha uma opcao', [
      { text: 'Tirar foto', onPress: () => takePhoto(type) },
      { text: 'Escolher da galeria', onPress: () => pickImage(type) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome e obrigatorio');
      return;
    }

    setLoading(true);
    try {
      const response = await usersService.updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        instagram: instagram.trim() || undefined,
      });

      if (response.success) {
        // Refresh user in context
        if (refreshUser) {
          await refreshUser();
        }
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Nao foi possivel atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveBtn, loading && styles.saveBtnDisabled]}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <Pressable
          style={styles.bannerSection}
          onPress={() => handleChangePhoto('banner')}
          disabled={uploadingBanner}
        >
          <Image
            source={{ uri: bannerUrl || PLACEHOLDER_BANNER }}
            style={styles.banner}
            contentFit="cover"
          />
          {uploadingBanner ? (
            <View style={styles.bannerOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.bannerOverlay}>
              <View style={styles.changeBannerBtn}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.changeBannerText}>Alterar capa</Text>
              </View>
            </View>
          )}
        </Pressable>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {uploadingAvatar ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#5D8A7D" />
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#A3A3A3" />
              </View>
            )}
            <Pressable
              style={styles.changeAvatarBtn}
              onPress={() => handleChangePhoto('avatar')}
              disabled={uploadingAvatar}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </Pressable>
          </View>
          <Pressable onPress={() => handleChangePhoto('avatar')} disabled={uploadingAvatar}>
            <Text style={styles.changePhotoText}>
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor="#A3A3A3"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
            />
            <Text style={styles.hint}>O email nao pode ser alterado</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#A3A3A3"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conte um pouco sobre voce..."
              placeholderTextColor="#A3A3A3"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Sao Paulo, SP"
              placeholderTextColor="#A3A3A3"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="logo-instagram" size={20} color="#A3A3A3" />
              <TextInput
                style={styles.inputIcon}
                placeholder="@seuinstagram"
                placeholderTextColor="#A3A3A3"
                value={instagram}
                onChangeText={setInstagram}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  saveBtn: { fontSize: 16, fontWeight: '600', color: '#5D8A7D' },
  saveBtnDisabled: { color: '#A3A3A3' },

  // Banner
  bannerSection: { position: 'relative', height: 140 },
  banner: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changeBannerText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Avatar
  avatarSection: { alignItems: 'center', marginTop: -50, paddingBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  changeAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#5D8A7D', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  changePhotoText: { fontSize: 14, fontWeight: '600', color: '#5D8A7D', marginTop: 12 },

  // Form
  form: { gap: 20, paddingHorizontal: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: '#525252' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A' },
  inputDisabled: { backgroundColor: '#FAFAFA', color: '#A3A3A3' },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 14 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, gap: 10 },
  inputIcon: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1A1A1A' },
  hint: { fontSize: 12, color: '#A3A3A3', marginTop: 4 },
  charCount: { fontSize: 12, color: '#A3A3A3', textAlign: 'right', marginTop: 4 },
});

export default EditProfileScreen;
