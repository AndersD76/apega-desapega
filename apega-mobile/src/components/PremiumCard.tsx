import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import Badge from './Badge';

interface PremiumCardProps {
  item: {
    id: string;
    title: string;
    price: number;
    images: string[];
    brand: string;
    size?: string;
    condition?: string;
    discount?: number;
    cashback?: number;
    isPremium?: boolean;
  };
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export default function PremiumCard({
  item,
  onPress,
  onFavoritePress,
  isFavorite = false
}: PremiumCardProps) {
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) return '0';
    return price.toFixed(0);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {item.discount && (
          <Badge
            type="discount"
            label={`-${item.discount}%`}
            style={styles.discountBadge}
          />
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardPrice}>R$ {formatPrice(item.price)}</Text>
        {item.cashback && (
          <Text style={styles.cardCashback}>
            +R$ {(item.cashback || 0).toFixed(0)} de volta
          </Text>
        )}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta}>{item.brand} • {item.size || 'M'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.8, // 4:5 ratio as per design guide
    backgroundColor: COLORS.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  favoriteButton: {
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
  cardInfo: {
    padding: SPACING.sm,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  cardCashback: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.success,
    marginTop: 4,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: 18,
  },
  cardMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
});
