import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, CATEGORIES, FEES } from '../constants/theme';
import { Input, Button, Pill, Modal } from '../components';
import { createProduct } from '../services/products';

interface CreateProductScreenProps {
  navigation: any;
}

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'único'];
const CONDITIONS = ['novo', 'seminovo', 'usado'];
const COLORS_PICKER = ['⚪', '⚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤'];
const BRANDS = ['farm', 'zara', 'forever 21', 'renner', 'c&a', 'riachuelo', 'outras'];

export default function CreateProductScreen({ navigation }: CreateProductScreenProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [condition, setCondition] = useState('');
  const [composition, setComposition] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [acceptOffers, setAcceptOffers] = useState(false);
  const [minOfferPrice, setMinOfferPrice] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPhoto = () => {
    if (photos.length < 8) {
      // Placeholder - integrate with image picker
      setPhotos([...photos, `photo-${photos.length + 1}`]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handlePublish = async () => {
    // Validations
    if (!title || title.length < 10) {
      Alert.alert('Erro', 'Título deve ter no mínimo 10 caracteres');
      return;
    }
    if (!description || description.length < 20) {
      Alert.alert('Erro', 'Descrição deve ter no mínimo 20 caracteres');
      return;
    }
    if (!selectedSize) {
      Alert.alert('Erro', 'Selecione um tamanho');
      return;
    }
    if (!condition) {
      Alert.alert('Erro', 'Selecione a condição do produto');
      return;
    }
    if (!price || parseFloat(price) < 5) {
      Alert.alert('Erro', 'Preço deve ser maior que R$ 5,00');
      return;
    }

    setIsLoading(true);
    try {
      await createProduct({
        title,
        description,
        brand: brand || undefined,
        size: selectedSize,
        color: selectedColors.join(', ') || undefined,
        condition: condition as 'novo' | 'seminovo' | 'usado',
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao criar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const discountPercentage = originalPrice && price
    ? Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>anunciar produto</Text>
        <TouchableOpacity onPress={handlePublish}>
          <Ionicons name="checkmark" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Photos Upload */}
        <Text style={styles.label}>
          fotos do produto <Text style={styles.required}>*</Text>
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosScroll}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoNumber}>{index + 1}</Text>
                <Ionicons name="image" size={32} color={COLORS.textTertiary} />
              </View>
              <TouchableOpacity
                style={styles.photoRemove}
                onPress={() => handleRemovePhoto(index)}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 8 && (
            <TouchableOpacity style={styles.photoAdd} onPress={handleAddPhoto}>
              <Ionicons name="add" size={32} color={COLORS.textTertiary} />
              <Ionicons name="camera" size={24} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </ScrollView>

        <Text style={styles.photoHint}>↓ arraste para ordenar</Text>

        {/* Tip Banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>dica:</Text> use fotos com boa luz e mostre detalhes do produto
          </Text>
        </View>

        {renderDivider()}

        {/* Informações Básicas */}
        <Text style={styles.sectionTitle}>informações básicas</Text>

        <Input
          label="título"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="Vestido floral midi"
          maxLength={60}
          showCharCounter
        />

        <Input
          type="textarea"
          label="descrição"
          required
          value={description}
          onChangeText={setDescription}
          placeholder="Vestido midi floral lindo, super fresquinho..."
          maxLength={500}
          showCharCounter
        />

        <View style={styles.tipBanner}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            seja detalhista! quanto mais informações, mais confiança
          </Text>
        </View>

        <Text style={styles.label}>
          categoria <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dropdown}>
          <RNTextInput
            style={styles.dropdownText}
            value={category}
            placeholder="Selecione a categoria"
            editable={false}
          />
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </View>

        <Text style={styles.label}>marca</Text>
        <View style={styles.dropdown}>
          <RNTextInput
            style={styles.dropdownText}
            value={brand}
            placeholder="Selecione a marca"
            editable={false}
          />
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </View>

        <Text style={styles.label}>
          tamanho <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pillsContainer}>
          {SIZES.map((size) => (
            <Pill
              key={size}
              label={size}
              active={selectedSize === size}
              onPress={() => setSelectedSize(size)}
              style={styles.pillItem}
            />
          ))}
        </View>

        <Text style={styles.label}>cor</Text>
        <View style={styles.colorsContainer}>
          {COLORS_PICKER.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorItem,
                selectedColors.includes(color) && styles.colorItemActive,
              ]}
              onPress={() => handleColorToggle(color)}
            >
              <Text style={styles.colorEmoji}>{color}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>
          condição <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pillsContainer}>
          {CONDITIONS.map((cond) => (
            <Pill
              key={cond}
              label={cond}
              active={condition === cond}
              onPress={() => setCondition(cond)}
              style={styles.pillItem}
            />
          ))}
        </View>

        <Input
          label="composição"
          value={composition}
          onChangeText={setComposition}
          placeholder="algodão"
        />

        {renderDivider()}

        {/* Preço e Negociação */}
        <Text style={styles.sectionTitle}>preço e negociação</Text>

        <Input
          label="preço de venda"
          required
          value={price}
          onChangeText={setPrice}
          placeholder="R$"
          keyboardType="numeric"
        />

        <Input
          label="preço original (opcional)"
          value={originalPrice}
          onChangeText={setOriginalPrice}
          placeholder="R$"
          keyboardType="numeric"
        />

        {/* Commission Calculator */}
        {price && parseFloat(price) > 0 && (
          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>
              <Ionicons name="calculator" size={16} color={COLORS.textPrimary} /> seu ganho estimado
            </Text>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Preço de venda</Text>
              <Text style={styles.earningsValue}>R$ {parseFloat(price).toFixed(2)}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Comissão ({FEES.commissionPercentage}%)</Text>
              <Text style={styles.earningsCommission}>- R$ {(parseFloat(price) * FEES.commissionRate).toFixed(2)}</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsRow}>
              <Text style={styles.earningsTotalLabel}>Você recebe</Text>
              <Text style={styles.earningsTotalValue}>R$ {(parseFloat(price) * (1 - FEES.commissionRate)).toFixed(2)}</Text>
            </View>
            <Text style={styles.earningsNote}>
              Assinantes Premium não pagam comissão
            </Text>
          </View>
        )}

        {originalPrice && price && discountPercentage > 0 && (
          <View style={styles.tipBanner}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              mostre o desconto de {discountPercentage}% que está oferecendo
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptOffers(!acceptOffers)}
        >
          <Ionicons
            name={acceptOffers ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptOffers ? COLORS.primary : COLORS.gray[400]}
          />
          <Text style={styles.checkboxLabel}>aceito ofertas</Text>
        </TouchableOpacity>

        {acceptOffers && (
          <Input
            label="valor mínimo para ofertas"
            value={minOfferPrice}
            onChangeText={setMinOfferPrice}
            placeholder="R$"
            keyboardType="numeric"
          />
        )}

        {renderDivider()}

        {/* Preview */}
        <Text style={styles.sectionTitle}>prévia do anúncio</Text>
        <Text style={styles.previewLabel}>veja como ficará:</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewImage}>
            {photos.length > 0 ? (
              <Text style={styles.previewImageText}>[IMAGEM]</Text>
            ) : (
              <Ionicons name="image-outline" size={48} color={COLORS.textTertiary} />
            )}
            {discountPercentage > 0 && (
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>{discountPercentage}%</Text>
              </View>
            )}
            <View style={styles.previewHeart}>
              <Ionicons name="heart-outline" size={16} color={COLORS.textPrimary} />
            </View>
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewPrice}>R$ {price || '0,00'}</Text>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {title || 'Título do produto'}
            </Text>
            <Text style={styles.previewMeta}>
              {brand || 'marca'} • {selectedSize || 'M'} • {condition || 'usado'}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Actions */}
      <View style={styles.actions}>
        <Button
          label="cancelar"
          variant="secondary"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          label={isLoading ? 'publicando...' : 'publicar'}
          variant="primary"
          onPress={handlePublish}
          disabled={isLoading}
          style={styles.actionButton}
        />
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        type="center"
        showCloseButton={false}
      >
        <View style={styles.successModal}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          <Text style={styles.successTitle}>produto publicado!</Text>
          <Text style={styles.successText}>
            seu produto está no ar e pronto para receber visitas
          </Text>
          <Button
            label="ver produto"
            variant="primary"
            onPress={() => {
              setShowSuccessModal(false);
              navigation.goBack();
            }}
            fullWidth
            style={{ marginBottom: SPACING.sm }}
          />
          <Button
            label="anunciar outro"
            variant="secondary"
            onPress={() => {
              setShowSuccessModal(false);
              // Reset form
            }}
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

const renderDivider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  photosScroll: {
    marginBottom: SPACING.sm,
  },
  photoItem: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    backgroundColor: COLORS.textPrimary,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  photoAdd: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.md,
  },
  tipBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.md,
  },
  dropdownText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  pillItem: {
    marginBottom: 0,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemActive: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    ...SHADOWS.sm,
  },
  colorEmoji: {
    fontSize: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  earningsCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.xs,
  },
  earningsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  earningsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  earningsValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
  },
  earningsCommission: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  earningsTotalLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  earningsTotalValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
  earningsNote: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImageText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textTertiary,
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
  },
  previewBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#92400E',
  },
  previewHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    padding: SPACING.sm,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  previewTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: 18,
  },
  previewMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
  },
  successModal: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
});
