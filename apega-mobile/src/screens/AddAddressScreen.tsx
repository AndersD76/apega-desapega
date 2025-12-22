import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

const isWeb = Platform.OS === 'web';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Button } from '../components';
import { api, loadToken } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddAddress'>;

export default function AddAddressScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 768;
  const styles = useMemo(() => createStyles(isDesktop), [isDesktop]);
  const editAddress = route.params?.address;

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Campos do formulário
  const [label, setLabel] = useState(editAddress?.label || 'Casa');
  const [recipientName, setRecipientName] = useState(editAddress?.recipient_name || '');
  const [zipcode, setZipcode] = useState(editAddress?.zipcode || '');
  const [street, setStreet] = useState(editAddress?.street || '');
  const [number, setNumber] = useState(editAddress?.number || '');
  const [complement, setComplement] = useState(editAddress?.complement || '');
  const [neighborhood, setNeighborhood] = useState(editAddress?.neighborhood || '');
  const [city, setCity] = useState(editAddress?.city || '');
  const [state, setState] = useState(editAddress?.state || '');
  const [isDefault, setIsDefault] = useState(editAddress?.is_default || false);

  const labels = ['Casa', 'Trabalho', 'Outro'];

  // Formatar CEP
  const formatCep = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Buscar endereço pelo CEP
  const searchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado');
        return;
      }

      setStreet(data.logradouro || '');
      setNeighborhood(data.bairro || '');
      setCity(data.localidade || '');
      setState(data.uf || '');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  // Salvar endereço
  const handleSave = async () => {
    // Validações
    if (!recipientName.trim()) {
      Alert.alert('Erro', 'Preencha o nome do destinatário');
      return;
    }
    if (!zipcode.trim() || zipcode.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Preencha um CEP válido');
      return;
    }
    if (!street.trim()) {
      Alert.alert('Erro', 'Preencha a rua');
      return;
    }
    if (!number.trim()) {
      Alert.alert('Erro', 'Preencha o número');
      return;
    }
    if (!neighborhood.trim()) {
      Alert.alert('Erro', 'Preencha o bairro');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Erro', 'Preencha a cidade');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Erro', 'Preencha o estado');
      return;
    }

    setLoading(true);
    try {
      // Garantir que o token está carregado
      await loadToken();

      const addressData = {
        label,
        recipient_name: recipientName.trim(),
        zipcode: zipcode.replace(/\D/g, ''),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        is_default: isDefault,
      };

      if (editAddress) {
        await api.put(`/addresses/${editAddress.id}`, addressData);
      } else {
        await api.post('/addresses', addressData);
      }

      Alert.alert(
        'Sucesso',
        editAddress ? 'Endereço atualizado!' : 'Endereço cadastrado!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o endereço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editAddress ? 'editar endereço' : 'novo endereço'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Tipo de endereço */}
          <Text style={styles.label}>Tipo de endereço</Text>
          <View style={styles.labelSelector}>
            {labels.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.labelOption, label === l && styles.labelOptionActive]}
                onPress={() => setLabel(l)}
              >
                <Ionicons
                  name={l === 'Casa' ? 'home' : l === 'Trabalho' ? 'business' : 'location'}
                  size={16}
                  color={label === l ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[styles.labelOptionText, label === l && styles.labelOptionTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nome do destinatário */}
          <Text style={styles.label}>Nome do destinatário *</Text>
          <TextInput
            style={styles.input}
            value={recipientName}
            onChangeText={setRecipientName}
            placeholder="Nome completo"
            placeholderTextColor={COLORS.textTertiary}
          />

          {/* CEP */}
          <Text style={styles.label}>CEP *</Text>
          <View style={styles.cepContainer}>
            <TextInput
              style={[styles.input, styles.cepInput]}
              value={zipcode}
              onChangeText={(text) => {
                const formatted = formatCep(text);
                setZipcode(formatted);
                if (formatted.replace(/\D/g, '').length === 8) {
                  searchCep(formatted);
                }
              }}
              placeholder="00000-000"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
              maxLength={9}
            />
            {loadingCep && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.cepLoader} />
            )}
          </View>

          {/* Rua */}
          <Text style={styles.label}>Rua *</Text>
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Nome da rua"
            placeholderTextColor={COLORS.textTertiary}
          />

          {/* Número e Complemento */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="123"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={complement}
                onChangeText={setComplement}
                placeholder="Apto, Bloco..."
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
          </View>

          {/* Bairro */}
          <Text style={styles.label}>Bairro *</Text>
          <TextInput
            style={styles.input}
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Nome do bairro"
            placeholderTextColor={COLORS.textTertiary}
          />

          {/* Cidade e Estado */}
          <View style={styles.row}>
            <View style={[styles.halfInput, { flex: 2 }]}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Nome da cidade"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={[styles.halfInput, { flex: 1 }]}>
              <Text style={styles.label}>UF *</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={(text) => setState(text.toUpperCase().slice(0, 2))}
                placeholder="SP"
                placeholderTextColor={COLORS.textTertiary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Endereço padrão */}
          <TouchableOpacity
            style={styles.defaultCheckbox}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
              {isDefault && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Definir como endereço padrão</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
        <Button
          label={loading ? 'Salvando...' : 'Salvar endereço'}
          onPress={handleSave}
          disabled={loading}
          fullWidth
        />
      </View>
    </View>
  );
}

const createStyles = (isDesktop: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    maxWidth: isDesktop ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  labelSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  labelOptionTextActive: {
    color: COLORS.white,
  },
  cepContainer: {
    position: 'relative',
  },
  cepInput: {
    paddingRight: 50,
  },
  cepLoader: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    marginTop: -10,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: SPACING.md,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
});
