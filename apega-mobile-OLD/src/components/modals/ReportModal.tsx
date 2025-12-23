import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Modal from '../Modal';
import Button from '../Button';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'product' | 'user' | 'review';
  targetName: string;
  onSubmit: (reason: string, details: string) => void;
}

const REPORT_REASONS = {
  product: [
    { id: 'fake', label: 'produto falso ou réplica' },
    { id: 'misleading', label: 'descrição enganosa' },
    { id: 'prohibited', label: 'produto proibido' },
    { id: 'offensive', label: 'conteúdo ofensivo' },
    { id: 'spam', label: 'spam ou publicidade' },
    { id: 'copyright', label: 'violação de direitos autorais' },
    { id: 'other', label: 'outro motivo' },
  ],
  user: [
    { id: 'fraud', label: 'tentativa de fraude' },
    { id: 'harassment', label: 'assédio ou intimidação' },
    { id: 'impersonation', label: 'falsidade ideológica' },
    { id: 'spam', label: 'spam excessivo' },
    { id: 'offensive', label: 'comportamento ofensivo' },
    { id: 'scam', label: 'possível golpe' },
    { id: 'other', label: 'outro motivo' },
  ],
  review: [
    { id: 'fake', label: 'avaliação falsa' },
    { id: 'offensive', label: 'conteúdo ofensivo' },
    { id: 'spam', label: 'spam ou irrelevante' },
    { id: 'inappropriate', label: 'conteúdo inapropriado' },
    { id: 'other', label: 'outro motivo' },
  ],
};

export default function ReportModal({
  visible,
  onClose,
  type,
  targetName,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const reasons = REPORT_REASONS[type];

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, details);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setSelectedReason('');
        setDetails('');
      }, 2000);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'product':
        return 'produto';
      case 'user':
        return 'usuário';
      case 'review':
        return 'avaliação';
      default:
        return '';
    }
  };

  // Success Modal
  if (showSuccess) {
    return (
      <Modal visible={visible} onClose={onClose} type="center" showCloseButton={false}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>denúncia enviada!</Text>
          <Text style={styles.successMessage}>
            obrigada por nos ajudar a manter a comunidade segura. nossa equipe
            irá analisar sua denúncia em até 24 horas.
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="bottom"
      title={`denunciar ${getTypeLabel()}`}
    >
      <View style={styles.content}>
        <View style={styles.warningBanner}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.info} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>denúncia anônima e segura</Text>
            <Text style={styles.warningText}>
              suas informações são confidenciais e o {getTypeLabel()} denunciado não
              será notificado.
            </Text>
          </View>
        </View>

        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>
            você está denunciando:
          </Text>
          <Text style={styles.targetName}>{targetName}</Text>
        </View>

        <Text style={styles.sectionTitle}>motivo da denúncia *</Text>
        <View style={styles.reasonsList}>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonOption,
                selectedReason === reason.id && styles.reasonOptionActive,
              ]}
              onPress={() => setSelectedReason(reason.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioButton,
                  selectedReason === reason.id && styles.radioButtonActive,
                ]}
              >
                {selectedReason === reason.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.reasonLabel,
                  selectedReason === reason.id && styles.reasonLabelActive,
                ]}
              >
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>detalhes adicionais (opcional)</Text>
        <TextInput
          style={styles.detailsInput}
          value={details}
          onChangeText={setDetails}
          placeholder="conte-nos mais sobre o problema..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCounter}>{details.length}/500</Text>

        <View style={styles.actions}>
          <Button
            label="cancelar"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            label="enviar denúncia"
            variant="primary"
            onPress={handleSubmit}
            disabled={!selectedReason}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  targetInfo: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  targetName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  reasonsList: {
    marginBottom: SPACING.lg,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  reasonOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  reasonLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
  },
  reasonLabelActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  detailsInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  charCounter: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
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
