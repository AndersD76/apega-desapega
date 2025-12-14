import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { mockItems } from '../data/mockData';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import PremiumCard from '../components/PremiumCard';

const { width } = Dimensions.get('window');

interface FavoritesScreenProps {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) return '0';
    return price.toFixed(0);
  };

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        title="favoritos"
        variant="light"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {mockItems.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <PremiumCard
                item={item}
                onPress={() => navigation.navigate('ItemDetail', { item })}
                onFavoritePress={() => {}}
                isFavorite={true}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Favorites" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
