import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

export function WalletScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { user } = auth || {};

  const balance = Number(user?.balance || 0);

  const handleWithdraw = () => {
    if (balance < 20) {
      Alert.alert('Saldo insuficiente', 'O valor mínimo para saque é R$ 20,00');
      return;
    }
    Alert.alert('Solicitar Saque', 'Deseja solicitar o saque do saldo disponível?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => Alert.alert('Sucesso', 'Solicitação de saque enviada!') },
    ]);
  };

  const transactions = [
    // Placeholder - would come from API
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Carteira</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient colors={['#5D8A7D', '#7BA396']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Text style={styles.balanceValue}>R$ {formatPrice(balance)}</Text>
          <Pressable style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Ionicons name="wallet-outline" size={18} color="#5D8A7D" />
            <Text style={styles.withdrawBtnText}>Solicitar Saque</Text>
          </Pressable>
        </LinearGradient>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color="#5D8A7D" />
            <Text style={styles.infoTitle}>Prazo de liberação</Text>
            <Text style={styles.infoText}>O saldo é liberado 7 dias após a entrega confirmada</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={24} color="#5D8A7D" />
            <Text style={styles.infoTitle}>Valor mínimo</Text>
            <Text style={styles.infoText}>O valor mínimo para saque é de R$ 20,00</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#E8E8E8" />
              <Text style={styles.emptyTitle}>Nenhuma transação</Text>
              <Text style={styles.emptyText}>Suas transações aparecerão aqui</Text>
            </View>
          ) : (
            transactions.map((tx: any, idx: number) => (
              <View key={idx} style={styles.transactionItem}>
                <View style={styles.txIcon}>
                  <Ionicons name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={20} color={tx.type === 'credit' ? '#10B981' : '#EF4444'} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.description}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                  {tx.type === 'credit' ? '+' : '-'} R$ {formatPrice(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },

  // Balance Card
  balanceCard: { margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  balanceValue: { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 20 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  withdrawBtnText: { fontSize: 15, fontWeight: '600', color: '#5D8A7D' },

  // Info Cards
  infoCards: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  infoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginTop: 8, textAlign: 'center' },
  infoText: { fontSize: 11, color: '#737373', marginTop: 4, textAlign: 'center', lineHeight: 16 },

  // Section
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#737373', marginTop: 4 },

  // Transaction
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  txIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  txDate: { fontSize: 12, color: '#A3A3A3', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '600' },
});

export default WalletScreen;
