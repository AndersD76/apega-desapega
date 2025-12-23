import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const imageHeight = cardWidth * 1.25;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const getConditionColor = () => {
    switch (condition?.toLowerCase()) {
      case 'novo':
      case 'novo com etiqueta':
        return 'bg-success';
      case 'seminovo':
        return 'bg-primary';
      default:
        return 'bg-warning';
    }
  };

  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl overflow-hidden mb-4 shadow-card"
      style={{ width: cardWidth }}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Image Container */}
      <View className="relative bg-background-dark overflow-hidden" style={{ height: imageHeight }}>
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-background-dark">
            <Ionicons name="shirt-outline" size={32} color="#D1D5DB" />
          </View>
        )}

        {/* Top gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.25)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-14"
        />

        {/* Favorite button */}
        {onFavorite && (
          <TouchableOpacity
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/25 items-center justify-center"
            onPress={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <View className="absolute top-2.5 left-2.5 bg-error px-2 py-1 rounded-md">
            <Text className="text-white text-[11px] font-bold tracking-wide">
              -{discountPercent}%
            </Text>
          </View>
        )}

        {/* New badge */}
        {isNew && !hasDiscount && (
          <LinearGradient
            colors={['#61005D', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md"
          >
            <Text className="text-white text-[10px] font-extrabold tracking-widest">
              NOVO
            </Text>
          </LinearGradient>
        )}

        {/* Sold overlay */}
        {isSold && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center">
            <View className="flex-row items-center gap-1.5 bg-black/50 px-4 py-2 rounded-full">
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold tracking-widest">
                VENDIDO
              </Text>
            </View>
          </View>
        )}

        {/* Likes container */}
        {likes > 0 && !isSold && (
          <View className="absolute bottom-2.5 left-2.5 flex-row items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
            <Ionicons name="heart" size={12} color="#FFFFFF" />
            <Text className="text-white text-[11px] font-semibold">
              {likes}
            </Text>
          </View>
        )}
      </View>

      {/* Info section */}
      <View className={compact ? 'p-2.5' : 'p-3'}>
        {/* Price row */}
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-base font-extrabold text-text-primary tracking-tight">
            R$ {price.toFixed(0)}
          </Text>
          {hasDiscount && (
            <Text className="text-[13px] text-text-tertiary line-through">
              R$ {originalPrice?.toFixed(0)}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text className="text-[13px] text-text-secondary leading-[18px] mb-2" numberOfLines={2}>
          {title}
        </Text>

        {/* Size and condition tags */}
        {!compact && (size || condition) && (
          <View className="flex-row items-center gap-2">
            {size && (
              <View className="bg-background-dark px-2.5 py-1 rounded-md">
                <Text className="text-[11px] text-text-secondary font-semibold">
                  {size}
                </Text>
              </View>
            )}
            {condition && (
              <View className={`w-2 h-2 rounded-full ${getConditionColor()}`} />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
