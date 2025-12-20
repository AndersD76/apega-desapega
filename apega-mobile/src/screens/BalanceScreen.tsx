import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, FEES } from '../constants/theme';
import { Button } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 768;

type Props = NativeStackScreenProps<RootStackParamList, 'Balance'>;

interface Transaction {
  id: string;
  type: 'sale' | 'cashback' | 'withdraw';
  description: string;
  amount: number;
  date: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [];

export default function BalanceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  // Dados serão carregados da API
  const balance = 0;
  const cashback = 0;
  const pending = 0;

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'sale': return 'arrow-down-circle';
      case 'cashback': return 'gift';
      case 'withdraw': return 'arrow-up-circle';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'sale': return COLORS.success;
      case 'cashback': return COLORS.primary;
      case 'withdraw': return COLORS.error;
    }
  };

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
        <Text style={styles.headerTitle}>saldo e cashback</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>saldo disponível</Text>
          <Text style={styles.balanceAmount}>R$ {balance.toFixed(2)}</Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>cashback acumulado</Text>
              <Text style={styles.balanceItemValue}>R$ {cashback.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>a liberar</Text>
              <Text style={styles.balanceItemValue}>R$ {pending.toFixed(2)}</Text>
            </View>
          </View>

          <Button
            label="sacar"
            variant="secondary"
            onPress={() => console.log('Withdraw')}
            fullWidth
            style={{ marginTop: SPACING.md, backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>

        {/* Commission Info */}
        <View style={styles.commissionCard}>
          <View style={styles.commissionHeader}>
            <Ionicons name="calculator" size={24} color={COLORS.textPrimary} />
            <Text style={styles.commissionTitle}>taxas de venda</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>comissão por venda</Text>
            <Text style={styles.commissionValue}>{FEES.commissionPercentage}%</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>assinantes premium</Text>
            <Text style={[styles.commissionValue, { color: COLORS.primary }]}>{FEES.premiumCommissionPercentage}%</Text>
          </View>
          <TouchableOpacity
            style={styles.premiumLink}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.premiumLinkText}>veja os benefícios do plano premium</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="gift" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>cashback</Text>
            <Text style={styles.infoText}>ganhe 5% de volta em todas as compras</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
            <Text style={styles.infoTitle}>liberação</Text>
            <Text style={styles.infoText}>saldo liberado após entrega confirmada</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>movimentações</Text>

          {MOCK_TRANSACTIONS.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                <Ionicons
                  name={getTransactionIcon(transaction.type)}
                  size={20}
                  color={getTransactionColor(transaction.type)}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.amount >= 0 ? COLORS.success : COLORS.error }
              ]}>
                {transaction.amount >= 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
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
  content: {
    padding: SPACING.md,
    paddingHorizontal: isDesktop ? 60 : SPACING.md,
    maxWidth: isDesktop ? 700 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginVertical: SPACING.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceItemValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
    marginTop: 2,
  },
  commissionCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  commissionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  commissionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  commissionValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  premiumLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  premiumLinkText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.xs,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
