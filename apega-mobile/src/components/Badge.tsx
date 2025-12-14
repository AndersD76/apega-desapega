import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export type BadgeType = 'discount' | 'cashback' | 'condition' | 'featured' | 'status';
export type StatusType = 'shipped' | 'delivered' | 'pending' | 'processing' | 'cancelled';

interface BadgeProps {
  type: BadgeType;
  label: string;
  status?: StatusType;
  icon?: boolean;
  style?: ViewStyle;
}

export default function Badge({ type, label, status, icon, style }: BadgeProps) {
  const getStyles = () => {
    switch (type) {
      case 'discount':
        return styles.badgeDiscount;
      case 'cashback':
        return styles.badgeCashback;
      case 'condition':
        return styles.badgeCondition;
      case 'featured':
        return styles.badgeFeatured;
      case 'status':
        return [styles.badgeStatus, getStatusStyles(status)];
      default:
        return styles.badgeCondition;
    }
  };

  const getStatusStyles = (statusType?: StatusType) => {
    switch (statusType) {
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'pending':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getTextStyles = () => {
    switch (type) {
      case 'discount':
        return styles.textDiscount;
      case 'cashback':
        return styles.textCashback;
      case 'condition':
        return styles.textCondition;
      case 'featured':
        return styles.textFeatured;
      case 'status':
        return [styles.textStatus, getStatusTextStyles(status)];
      default:
        return styles.textCondition;
    }
  };

  const getStatusTextStyles = (statusType?: StatusType) => {
    switch (statusType) {
      case 'shipped':
        return styles.textStatusShipped;
      case 'delivered':
        return styles.textStatusDelivered;
      case 'pending':
        return styles.textStatusPending;
      case 'processing':
        return styles.textStatusProcessing;
      case 'cancelled':
        return styles.textStatusCancelled;
      default:
        return styles.textStatusPending;
    }
  };

  return (
    <View style={[getStyles(), style]}>
      {icon && type === 'cashback' && (
        <Text style={styles.icon}>💵</Text>
      )}
      <Text style={getTextStyles()}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Badge Discount
  badgeDiscount: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  textDiscount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#92400E',
  },

  // Badge Cashback
  badgeCashback: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  textCashback: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#065F46',
  },
  icon: {
    fontSize: 14,
  },

  // Badge Condition
  badgeCondition: {
    backgroundColor: COLORS.gray[100],
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  textCondition: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    textTransform: 'lowercase',
  },

  // Badge Featured
  badgeFeatured: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  textFeatured: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },

  // Badge Status
  badgeStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  textStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Status Variants
  statusShipped: {
    backgroundColor: '#DBEAFE',
  },
  textStatusShipped: {
    color: '#1E40AF',
  },

  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  textStatusDelivered: {
    color: '#065F46',
  },

  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  textStatusPending: {
    color: '#92400E',
  },

  statusProcessing: {
    backgroundColor: '#E0E7FF',
  },
  textStatusProcessing: {
    color: '#3730A3',
  },

  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  textStatusCancelled: {
    color: '#991B1B',
  },
});
