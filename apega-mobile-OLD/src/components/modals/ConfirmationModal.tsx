import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import Modal from '../Modal';
import Button from '../Button';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ICONS = {
  info: { name: 'information-circle' as const, color: COLORS.info },
  warning: { name: 'warning' as const, color: COLORS.warning },
  error: { name: 'alert-circle' as const, color: COLORS.error },
  success: { name: 'checkmark-circle' as const, color: COLORS.success },
};

const BACKGROUNDS = {
  info: COLORS.infoLight,
  warning: COLORS.warningLight,
  error: COLORS.errorLight,
  success: COLORS.successLight,
};

export default function ConfirmationModal({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  confirmLabel = 'confirmar',
  cancelLabel = 'cancelar',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const icon = ICONS[type];
  const backgroundColor = BACKGROUNDS[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="center"
      showCloseButton={false}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Ionicons name={icon.name} size={48} color={icon.color} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          <Button
            label={cancelLabel}
            variant="secondary"
            onPress={handleCancel}
            style={{ flex: 1 }}
          />
          <Button
            label={confirmLabel}
            variant="primary"
            onPress={handleConfirm}
            style={[
              { flex: 1 },
              type === 'error' && { backgroundColor: COLORS.error },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
});
