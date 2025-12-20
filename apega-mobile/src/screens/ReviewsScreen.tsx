import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 768;
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Tab } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Reviews'>;

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
  type: 'received' | 'given';
}

const MOCK_REVIEWS: Review[] = [];

export default function ReviewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('received');

  const tabs = [
    { id: 'received', label: 'recebidas' },
    { id: 'given', label: 'feitas' },
  ];

  const filteredReviews = MOCK_REVIEWS.filter(review => review.type === activeTab);

  const averageRating = MOCK_REVIEWS
    .filter(r => r.type === 'received')
    .reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.filter(r => r.type === 'received').length || 0;

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : COLORS.gray[300]}
        />
      ))}
    </View>
  );

  const renderReviewCard = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.white} />
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          {renderStars(review.rating)}
        </View>
        <Text style={styles.reviewDate}>{review.date}</Text>
      </View>

      {review.product && (
        <Text style={styles.productName}>sobre: {review.product}</Text>
      )}

      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>avaliações</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Rating Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
        {renderStars(Math.round(averageRating))}
        <Text style={styles.totalReviews}>
          {MOCK_REVIEWS.filter(r => r.type === 'received').length} avaliações recebidas
        </Text>
      </View>

      <Tab
        items={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filteredReviews.length > 0 ? (
          filteredReviews.map(renderReviewCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>nenhuma avaliação</Text>
            <Text style={styles.emptySubtitle}>
              suas avaliações aparecerão aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginHorizontal: isDesktop ? 60 : SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    maxWidth: isDesktop ? 700 : undefined,
    alignSelf: isDesktop ? 'center' : undefined,
    width: isDesktop ? '100%' : undefined,
    ...SHADOWS.xs,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: SPACING.xs,
  },
  totalReviews: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    paddingBottom: SPACING.xl,
    maxWidth: isDesktop ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
