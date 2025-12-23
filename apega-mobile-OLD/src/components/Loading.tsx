import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export type LoadingType = 'spinner' | 'skeleton-card' | 'skeleton-text';

interface LoadingProps {
  type?: LoadingType;
  style?: ViewStyle;
}

export default function Loading({ type = 'spinner', style }: LoadingProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'spinner') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [type]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (type === 'spinner') {
    return (
      <View style={[styles.spinnerContainer, style]}>
        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spin }] },
          ]}
        />
      </View>
    );
  }

  if (type === 'skeleton-card') {
    return (
      <View style={[styles.skeletonCard, style]}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonInfo}>
          <View style={[styles.skeletonText, styles.skeletonTextShort]} />
          <View style={[styles.skeletonText, styles.skeletonTextLong]} />
          <View style={[styles.skeletonText, styles.skeletonTextShort]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.skeletonText, style]} />
  );
}

const styles = StyleSheet.create({
  // Spinner
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },

  spinner: {
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: COLORS.gray[100],
    borderTopColor: COLORS.primary,
    borderRadius: 12,
  },

  // Skeleton Card
  skeletonCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },

  skeletonImage: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: COLORS.gray[100],
  },

  skeletonInfo: {
    padding: SPACING.sm,
  },

  skeletonText: {
    height: 16,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    marginBottom: 8,
  },

  skeletonTextShort: {
    width: '60%',
  },

  skeletonTextLong: {
    width: '90%',
  },
});

// Shimmer Effect Component (opcional, para efeito mais avançado)
export function Shimmer({ style }: { style?: ViewStyle }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1000, 1000],
  });

  return (
    <View style={[styles.shimmerContainer, style]}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

const shimmerStyles = StyleSheet.create({
  shimmerContainer: {
    overflow: 'hidden',
  },

  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
