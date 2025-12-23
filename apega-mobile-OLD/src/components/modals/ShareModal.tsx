import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share as RNShare,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Modal from '../Modal';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  productTitle: string;
  productPrice: number;
  productUrl: string;
}

interface ShareOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

export default function ShareModal({
  visible,
  onClose,
  productTitle,
  productPrice,
  productUrl,
}: ShareModalProps) {
  const shareMessage = `Olha que legal! ${productTitle} por R$ ${(productPrice || 0).toFixed(2).replace('.', ',')} no Apega Desapega 💚\n\n${productUrl}`;

  const handleNativeShare = async () => {
    try {
      await RNShare.share({
        message: shareMessage,
        url: productUrl,
        title: productTitle,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = () => {
    // In a real app, use Clipboard API
    Alert.alert('link copiado!', 'o link foi copiado para sua área de transferência');
    onClose();
  };

  const handleShareWhatsApp = () => {
    console.log('Share via WhatsApp');
    onClose();
  };

  const handleShareInstagram = () => {
    console.log('Share via Instagram');
    onClose();
  };

  const handleShareFacebook = () => {
    console.log('Share via Facebook');
    onClose();
  };

  const handleShareTwitter = () => {
    console.log('Share via Twitter');
    onClose();
  };

  const handleShareEmail = () => {
    console.log('Share via Email');
    onClose();
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      label: 'whatsapp',
      color: '#25D366',
      onPress: handleShareWhatsApp,
    },
    {
      id: 'instagram',
      icon: 'logo-instagram',
      label: 'instagram',
      color: '#E4405F',
      onPress: handleShareInstagram,
    },
    {
      id: 'facebook',
      icon: 'logo-facebook',
      label: 'facebook',
      color: '#1877F2',
      onPress: handleShareFacebook,
    },
    {
      id: 'twitter',
      icon: 'logo-twitter',
      label: 'twitter',
      color: '#1DA1F2',
      onPress: handleShareTwitter,
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'e-mail',
      color: COLORS.textSecondary,
      onPress: handleShareEmail,
    },
    {
      id: 'more',
      icon: 'share-social',
      label: 'mais',
      color: COLORS.textSecondary,
      onPress: handleNativeShare,
    },
  ];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      type="bottom"
      title="compartilhar"
    >
      <View style={styles.content}>
        <View style={styles.productPreview}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {productTitle}
          </Text>
          <Text style={styles.productPrice}>
            R$ {(productPrice || 0).toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View style={styles.shareGrid}>
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.shareOption}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.shareIconContainer,
                  { backgroundColor: option.color + '15' },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={option.color}
                />
              </View>
              <Text style={styles.shareLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.copyLinkButton}
          onPress={handleCopyLink}
          activeOpacity={0.7}
        >
          <Ionicons name="link" size={24} color={COLORS.primary} />
          <View style={styles.copyLinkContent}>
            <Text style={styles.copyLinkTitle}>copiar link</Text>
            <Text style={styles.copyLinkUrl} numberOfLines={1}>
              {productUrl}
            </Text>
          </View>
          <Ionicons name="copy" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
  productPreview: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  productTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  shareOption: {
    alignItems: 'center',
    width: 80,
  },
  shareIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  shareLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  copyLinkContent: {
    flex: 1,
  },
  copyLinkTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  copyLinkUrl: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
});
