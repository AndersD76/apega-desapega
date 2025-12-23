import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const isWeb = Platform.OS === 'web';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  likes?: number;
  views?: number;
  isFavorited?: boolean;
  isSold?: boolean;
  condition?: string;
  size?: string;
  isNew?: boolean;
  onPress: () => void;
  onFavorite?: () => void;
  numColumns?: number;
  compact?: boolean;
}

export default function ProductCard({
  image,
  title,
  price,
  originalPrice,
  likes = 0,
  isFavorited = false,
  isSold = false,
  condition,
  size,
  isNew = false,
  onPress,
  onFavorite,
  numColumns = 2,
  compact = false,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const containerPadding = isWeb ? 32 : 16;
  const gap = 12;
  const cardWidth = (width - containerPadding * 2 - gap * (numColumns - 1)) / numColumns;
  const imageHeight = cardWidth * 1.2;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const getConditionColor = () => {
    switch (condition?.toLowerCase()) {
      case 'novo':
      case 'novo com etiqueta':
        return COLORS.success;
      case 'seminovo':
        return COLORS.primary;
      default:
        return COLORS.warning;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="shirt-outline" size={32} color={COLORS.gray[300]} />
          </View>
        )}

        {/* Gradient overlay no topo */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent']}
          style={styles.topGradient}
        />

        {/* Botao de favorito */}
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        )}

        {/* Badge de desconto */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Badge de novo */}
        {isNew && !hasDiscount && (
          <LinearGradient
            colors={COLORS.gradientPrimary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newBadge}
          >
            <Text style={styles.newBadgeText}>NOVO</Text>
          </LinearGradient>
        )}

        {/* Overlay de vendido */}
        {isSold && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.soldText}>VENDIDO</Text>
            </View>
          </View>
        )}

        {/* Likes no canto inferior */}
        {likes > 0 && !isSold && (
          <View style={styles.likesContainer}>
            <Ionicons name="heart" size={12} color={COLORS.white} />
            <Text style={styles.likesText}>{likes}</Text>
          </View>
        )}
      </View>

      <View style={[styles.info, compact && styles.infoCompact]}>
        {/* Preco */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>R$ {price.toFixed(0)}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>R$ {originalPrice?.toFixed(0)}</Text>
          )}
        </View>

        {/* Titulo */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Tags de tamanho e condicao */}
        {!compact && (size || condition) && (
          <View style={styles.tagsRow}>
            {size && (
              <View style={styles.sizeTag}>
                <Text style={styles.sizeText}>{size}</Text>
              </View>
            )}
            {condition && (
              <View style={[styles.conditionDot, { backgroundColor: getConditionColor() }]} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: COLORS.backgroundDark,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.badge,
  },
  discountText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.badge,
  },
  newBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  soldText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  likesContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  likesText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  infoCompact: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  title: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeTag: {
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.badge,
  },
  sizeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
