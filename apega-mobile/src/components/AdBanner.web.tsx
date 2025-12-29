import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner' | 'leaderboard';
  style?: object;
}

// Na web, AdMob não é suportado - retorna null
export function AdBanner({ style }: AdBannerProps) {
  return null;
}

export function FallbackAdBanner({ style }: { style?: object }) {
  return (
    <View style={[styles.fallbackContainer, style]}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackLabel}>Anúncio</Text>
        <Text style={styles.fallbackText}>Espaço disponível para publicidade</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    marginVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fallbackContent: {
    padding: 16,
    alignItems: 'center',
  },
  fallbackLabel: {
    fontSize: 10,
    color: '#adb5bd',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 13,
    color: '#868e96',
  },
});

export default AdBanner;
