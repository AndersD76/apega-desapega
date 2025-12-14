import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation, AppHeader, Tab, Button } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

interface Order {
  id: string;
  orderId: string;
  product: {
    name: string;
    size: string;
    image: string;
  };
  seller: string;
  amount: number;
  status: 'pending' | 'in_transit' | 'delivered';
  date: string;
  trackingCode?: string;
}

const MOCK_ORDERS: Order[] = [];

export default function OrdersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'todos' },
    { id: 'pending', label: 'aguardando' },
    { id: 'transit', label: 'em trânsito' },
    { id: 'delivered', label: 'entregues' },
  ];

  const filteredOrders = MOCK_ORDERS.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'transit') return order.status === 'in_transit';
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'aguardando envio';
      case 'in_transit': return 'em trânsito';
      case 'delivered': return 'entregue';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'in_transit': return COLORS.info || '#3B82F6';
      case 'delivered': return COLORS.success;
    }
  };

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => console.log('Order details', order.id)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>pedido #{order.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderProduct}>
        <View style={styles.productImage}>
          <Ionicons name="image" size={32} color={COLORS.textTertiary} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{order.product.name}</Text>
          {order.product.size && (
            <Text style={styles.productSize}>tamanho {order.product.size}</Text>
          )}
          <Text style={styles.sellerName}>vendedor: {order.seller}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.orderDate}>{order.date}</Text>
          <Text style={styles.orderAmount}>R$ {order.amount.toFixed(2)}</Text>
        </View>
        {order.status === 'in_transit' && order.trackingCode && (
          <Button
            label="rastrear"
            variant="secondary"
            size="small"
            onPress={() => console.log('Track', order.trackingCode)}
          />
        )}
        {order.status === 'delivered' && (
          <Button
            label="avaliar"
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('Reviews' as any)}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>meus pedidos</Text>
        <View style={{ width: 24 }} />
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
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>nenhum pedido</Text>
            <Text style={styles.emptySubtitle}>
              seus pedidos aparecerão aqui
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Profile" />
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
    paddingHorizontal: SPACING.md,
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
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  orderProduct: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  productSize: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  sellerName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  orderAmount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
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
