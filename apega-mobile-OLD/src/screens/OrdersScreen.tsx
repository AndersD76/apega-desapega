import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BottomNavigation, Header, MainHeader, Tab, Button } from '../components';
import { getPurchases, type Order as ApiOrder } from '../services/orders';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

type NormalizedStatus = 'pending' | 'in_transit' | 'delivered';

// Componente de timeline step
const TimelineStep = ({
  icon,
  label,
  isActive,
  isCompleted,
  isLast
}: {
  icon: string;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
}) => (
  <View style={styles.timelineStep}>
    <View style={styles.timelineIconRow}>
      <View style={[
        styles.timelineIconWrap,
        isCompleted && styles.timelineIconCompleted,
        isActive && styles.timelineIconActive
      ]}>
        <Ionicons
          name={icon as any}
          size={16}
          color={isCompleted || isActive ? COLORS.white : COLORS.textTertiary}
        />
      </View>
      {!isLast && (
        <View style={[
          styles.timelineLine,
          isCompleted && styles.timelineLineCompleted
        ]} />
      )}
    </View>
    <Text style={[
      styles.timelineLabel,
      (isActive || isCompleted) && styles.timelineLabelActive
    ]}>
      {label}
    </Text>
  </View>
);

export default function OrdersScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 900;

  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Aguardando' },
    { id: 'transit', label: 'Em transito' },
    { id: 'delivered', label: 'Entregues' },
  ];

  const normalizeStatus = (status: ApiOrder['status']): NormalizedStatus => {
    if (status === 'in_transit' || status === 'shipped') return 'in_transit';
    if (status === 'delivered' || status === 'completed') return 'delivered';
    return 'pending';
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPurchases();
      if (response.orders) setOrders(response.orders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    const normalized = normalizeStatus(order.status);
    if (activeTab === 'pending') return normalized === 'pending';
    if (activeTab === 'transit') return normalized === 'in_transit';
    if (activeTab === 'delivered') return normalized === 'delivered';
    return true;
  });

  const getStatusConfig = (status: ApiOrder['status']) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':
        return { label: 'Aguardando envio', color: COLORS.warning, icon: 'time-outline' };
      case 'in_transit':
        return { label: 'Em transito', color: COLORS.info, icon: 'airplane-outline' };
      case 'delivered':
        return { label: 'Entregue', color: COLORS.success, icon: 'checkmark-circle-outline' };
    }
  };

  const getTimelineState = (status: ApiOrder['status']) => {
    const normalized = normalizeStatus(status);
    return {
      pending: { active: normalized === 'pending', completed: normalized === 'in_transit' || normalized === 'delivered' },
      shipped: { active: normalized === 'in_transit', completed: normalized === 'delivered' },
      delivered: { active: normalized === 'delivered', completed: false },
    };
  };

  const renderOrderCard = (order: ApiOrder) => {
    const statusConfig = getStatusConfig(order.status);
    const timeline = getTimelineState(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        activeOpacity={0.95}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Pedido #{order.order_number || order.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Product */}
        <View style={styles.orderProduct}>
          {order.product_image ? (
            <Image source={{ uri: order.product_image }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Ionicons name="shirt-outline" size={28} color={COLORS.textTertiary} />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{order.product_title}</Text>
            {order.product_size && (
              <View style={styles.productSizeBadge}>
                <Text style={styles.productSizeText}>Tam {order.product_size}</Text>
              </View>
            )}
            <Text style={styles.sellerName}>Vendedor: {order.seller_name || '---'}</Text>
          </View>
          <Text style={styles.orderAmount}>
            R$ {(order.total_amount || order.product_price || 0).toFixed(0)}
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          <TimelineStep
            icon="cart"
            label="Comprado"
            isCompleted={timeline.pending.completed}
            isActive={timeline.pending.active}
          />
          <TimelineStep
            icon="paper-plane"
            label="Enviado"
            isCompleted={timeline.shipped.completed}
            isActive={timeline.shipped.active}
          />
          <TimelineStep
            icon="checkmark-circle"
            label="Entregue"
            isCompleted={false}
            isActive={timeline.delivered.active}
            isLast
          />
        </View>

        {/* Actions */}
        <View style={styles.orderActions}>
          {normalizeStatus(order.status) === 'in_transit' && order.shipping_code && (
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => {}}>
              <Ionicons name="location-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.actionButtonSecondaryText}>Rastrear pedido</Text>
            </TouchableOpacity>
          )}
          {normalizeStatus(order.status) === 'delivered' && (
            <TouchableOpacity
              style={styles.actionButtonPrimary}
              onPress={() => navigation.navigate('Reviews' as any)}
            >
              <Ionicons name="star-outline" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonPrimaryText}>Avaliar compra</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => {}}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonSecondaryText}>Mensagem</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <MainHeader navigation={navigation} title="Meus Pedidos" />
      ) : (
        <Header navigation={navigation} title="Meus Pedidos" />
      )}

      <Tab items={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando pedidos...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={COLORS.gradientPrimary as [string, string]}
              style={styles.emptyIconWrap}
            >
              <Ionicons name="bag-handle" size={40} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptySubtitle}>
              Seus pedidos aparecerao aqui quando voce fizer sua primeira compra
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Home')}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Explorar pecas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 100 }} />
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
  content: {
    padding: SPACING.md,
  },
  contentDesktop: {
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: 16,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: 16,
  },
  productImagePlaceholder: {
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  productSizeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 4,
  },
  productSizeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sellerName: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineIconActive: {
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginLeft: -8,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.button,
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.button,
    ...SHADOWS.primary,
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...SHADOWS.primary,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
