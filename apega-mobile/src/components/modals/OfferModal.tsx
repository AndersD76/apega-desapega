import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import Modal from '../Modal';
import Button from '../Button';
import Badge from '../Badge';

interface OfferModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'make' | 'respond';
  productTitle?: string;
  productPrice?: number;
  offerValue?: number;
  offerMessage?: string;
  onMakeOffer?: (value: number, message: string) => void;
  onAcceptOffer?: () => void;
  onRejectOffer?: () => void;
  onCounterOffer?: (value: number, message: string) => void;
}

export default function OfferModal({
  visible,
  onClose,
  type,
  productTitle = '',
  productPrice = 0,
  offerValue = 0,
  offerMessage = '',
  onMakeOffer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
}: OfferModalProps) {
  const [value, setValue] = useState(type === 'make' ? '' : String(offerValue));
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMakeOffer = () => {
    const numValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numValue > 0 && numValue <= productPrice) {
      onMakeOffer?.(numValue, message);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setValue('');
        setMessage('');
      }, 2000);
    }
  };

  const handleAccept = () => {
    onAcceptOffer?.();
    onClose();
  };

  const handleReject = () => {
    onRejectOffer?.();
    onClose();
  };

  const handleCounter = () => {
    const numValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    if (numValue > 0 && numValue <= productPrice) {
      onCounterOffer?.(numValue, message);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setValue('');
        setMessage('');
      }, 2000);
    }
  };

  const formatCurrency = (val: string) => {
    const numStr = val.replace(/[^\d]/g, '');
    if (!numStr) return '';
    const num = parseInt(numStr) / 100;
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleValueChange = (text: string) => {
    setValue(formatCurrency(text));
  };

  const discount = productPrice > 0 && value
    ? Math.round(((productPrice - parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'))) / productPrice) * 100)
    : 0;

  // Success Modal
  if (showSuccess) {
    return (
      <Modal visible={visible} onClose={onClose} type="center" showCloseButton={false}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>
            {type === 'make' ? 'oferta enviada!' : 'contraoferta enviada!'}
          </Text>
          <Text style={styles.successMessage}>
            {type === 'make'
              ? 'aguarde a resposta do vendedor. você será notificado quando houver uma resposta.'
              : 'o comprador receberá sua contraoferta e você será notificado quando houver uma resposta.'}
          </Text>
        </View>
      </Modal>
    );
  }

  // Make Offer Modal
  if (type === 'make') {
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        type="bottom"
        title="fazer oferta"
      >
        <View style={styles.content}>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {productTitle}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>preço:</Text>
              <Text style={styles.priceValue}>
                R$ {(productPrice || 0).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          <View style={styles.tipBanner}>
            <Ionicons name="bulb" size={20} color={COLORS.warning} />
            <Text style={styles.tipText}>
              ofertas entre 70-90% do valor têm mais chance de serem aceitas
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              sua oferta <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={handleValueChange}
                placeholder="R$ 0,00"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textTertiary}
              />
              {discount > 0 && (
                <Badge type="discount" label={`-${discount}%`} />
              )}
            </View>
            {discount > 0 && discount > 30 && (
              <Text style={styles.warningText}>
                ofertas muito baixas podem ser recusadas
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>mensagem (opcional)</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="adicione uma mensagem para o vendedor..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCounter}>{message.length}/200</Text>
          </View>

          <View style={styles.actions}>
            <Button
              label="cancelar"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              label="enviar oferta"
              variant="primary"
              onPress={handleMakeOffer}
              disabled={!value || parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) === 0}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Respond to Offer Modal
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="bottom"
      title="responder oferta"
    >
      <View style={styles.content}>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {productTitle}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>seu preço:</Text>
            <Text style={styles.priceValue}>
              R$ {(productPrice || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <Text style={styles.offerLabel}>oferta recebida</Text>
            {discount > 0 && (
              <Badge type="discount" label={`-${discount}%`} />
            )}
          </View>
          <Text style={styles.offerValue}>
            R$ {(offerValue || 0).toFixed(2).replace('.', ',')}
          </Text>
          {offerMessage && (
            <View style={styles.offerMessageContainer}>
              <Ionicons name="chatbubble" size={16} color={COLORS.textSecondary} />
              <Text style={styles.offerMessageText}>{offerMessage}</Text>
            </View>
          )}
        </View>

        <View style={styles.responseOptions}>
          <TouchableOpacity
            style={styles.responseOption}
            onPress={handleAccept}
            activeOpacity={0.7}
          >
            <View style={[styles.responseIcon, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="checkmark" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.responseLabel}>aceitar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.responseOption}
            onPress={() => {
              // Show counter offer form
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.responseIcon, { backgroundColor: COLORS.warningLight }]}>
              <Ionicons name="swap-horizontal" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.responseLabel}>contrapropor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.responseOption}
            onPress={handleReject}
            activeOpacity={0.7}
          >
            <View style={[styles.responseIcon, { backgroundColor: COLORS.errorLight }]}>
              <Ionicons name="close" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.responseLabel}>recusar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.tipText}>
            ao aceitar, o comprador será notificado e você deverá aguardar o pagamento
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  productInfo: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  productTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  valueInput: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
  messageInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  charCounter: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  offerCard: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  offerLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  offerValue: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  offerMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '20',
  },
  offerMessageText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  responseOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  responseOption: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  responseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  successContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
