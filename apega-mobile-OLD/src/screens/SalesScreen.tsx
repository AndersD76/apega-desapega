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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, FEES } from '../constants/theme';
import { getSales, getSalesStats, type Order as ApiOrder, type SalesStats } from '../services/orders';
import { BottomNavigation, Header, MainHeader, Tab, Button, Modal } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const isWeb = Platform.OS === 'web';

type Props = NativeStackScreenProps<RootStackParamList, 'Sales'>;

type TabItem = { id: string; label: string };

interface Sale {
  id: string;
  orderId: string;
  product: {
    name: string;
    size: string;
    image: string;
  };
  buyer: string;
  amount: number;
  sellerReceives: number;
  urgent?: boolean;
  status: 'pending_shipment' | 'in_transit' | 'delivered';
}

// Componente de card de metrica
const MetricCard = ({
  icon,
  label,
  value,
  color,
  gradient
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  gradient?: [string, string];
}) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

export default function SalesScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 900;

  const [activeTab, setActiveTab] = useState<string>('pending');
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const revenue = stats?.totalRevenue || 0;
  const salesCount = stats?.totalOrders || sales.length;

  const normalizeStatus = (status: ApiOrder['status']): Sale['status'] => {
    if (status === 'in_transit' || status === 'shipped') return 'in_transit';
    if (status === 'delivered' || status === 'completed') return 'delivered';
    return 'pending_shipment';
  };

  const mapOrderToSale = (order: ApiOrder): Sale => ({
    id: order.id,
    orderId: order.order_number || order.id,
    product: {
      name: order.product_title || '---',
      size: order.product_size || '',
      image: order.product_image || '',
    },
    buyer: order.buyer_name || '---',
    amount: order.product_price || 0,
    sellerReceives: order.seller_receives || 0,
    status: normalizeStatus(order.status),
  });

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const [salesResponse, statsResponse] = await Promise.all([
        getSales(),
        getSalesStats(),
      ]);
      if (salesResponse.orders) setSales(salesResponse.orders.map(mapOrderToSale));
      if (statsResponse.stats) setStats(statsResponse.stats);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales])
  );

  const pendingCount = sales.filter((s) => s.status === 'pending_shipment').length;
  const inTransitCount = sales.filter((s) => s.status === 'in_transit').length;
  const deliveredCount = sales.filter((s) => s.status === 'delivered').length;

  const tabs: TabItem[] = [
    { id: 'pending', label: `Aguardando (${pendingCount})` },
    { id: 'transit', label: `Em transito (${inTransitCount})` },
    { id: 'delivered', label: 'Entregues' },
  ];

  const filteredSales = sales.filter((sale) => {
    if (activeTab === 'pending') return sale.status === 'pending_shipment';
    if (activeTab === 'transit') return sale.status === 'in_transit';
    if (activeTab === 'delivered') return sale.status === 'delivered';
    return true;
  });

  const handleGenerateLabel = (sale: Sale) => {
    setSelectedSale(sale);
    setShowLabelModal(true);
  };

  const handleMarkShipped = (sale: Sale) => {
    setSelectedSale(sale);
    setShowShipModal(true);
  };

  const getStatusIcon = (status: Sale['status']) => {
    switch (status) {
      case 'pending_shipment': return 'cube-outline';
      case 'in_transit': return 'airplane-outline';
      case 'delivered': return 'checkmark-circle-outline';
    }
  };

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'pending_shipment': return COLORS.warning;
      case 'in_transit': return COLORS.info;
      case 'delivered': return COLORS.success;
    }
  };

  const renderSaleCard = (sale: Sale) => (
    <View key={sale.id} style={styles.saleCard}>
      {/* Header */}
      <View style={styles.saleHeader}>
        <View style={styles.saleOrderInfo}>
          <Text style={styles.saleOrderId}>#{sale.orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(sale.status)}15` }]}>
            <Ionicons name={getStatusIcon(sale.status) as any} size={12} color={getStatusColor(sale.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(sale.status) }]}>
              {sale.status === 'pending_shipment' ? 'Aguardando' : sale.status === 'in_transit' ? 'Em transito' : 'Entregue'}
            </Text>
          </View>
        </View>
      </View>

      {/* Product */}
      <View style={styles.saleProduct}>
        {sale.product.image ? (
          <Image source={{ uri: sale.product.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Ionicons name="shirt-outline" size={24} color={COLORS.textTertiary} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{sale.product.name}</Text>
          {sale.product.size && <Text style={styles.productSize}>Tamanho {sale.product.size}</Text>}
          <Text style={styles.buyerName}>Comprador: {sale.buyer}</Text>
        </View>
      </View>

      {/* Valores */}
      <View style={styles.saleValues}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Valor da venda</Text>
          <Text style={styles.valueAmount}>R$ {(sale.amount || 0).toFixed(2)}</Text>
        </View>
        {FEES.commissionPercentage > 0 && (
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Comissao ({FEES.commissionPercentage}%)</Text>
            <Text style={styles.valueDeduction}>- R$ {((sale.amount || 0) * FEES.commissionRate).toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.valueRow, styles.valueRowHighlight]}>
          <Text style={styles.valueLabelHighlight}>Voce recebe</Text>
          <Text style={styles.valueHighlight}>R$ {(sale.sellerReceives || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Actions */}
      {sale.status === 'pending_shipment' && (
        <View style={styles.saleActions}>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => handleGenerateLabel(sale)}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonSecondaryText}>Gerar etiqueta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={() => handleMarkShipped(sale)}>
            <Ionicons name="paper-plane" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonPrimaryText}>Marcar enviado</Text>
          </TouchableOpacity>
        </View>
      )}

      {sale.status === 'in_transit' && (
        <View style={styles.saleActions}>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => {}}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonSecondaryText}>Mensagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => {}}>
            <Ionicons name="location-outline" size={16} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonSecondaryText}>Rastrear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {isWeb ? (
        <MainHeader navigation={navigation} title="Vendas" />
      ) : (
        <Header navigation={navigation} title="Vendas" />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Dashboard Header */}
        <LinearGradient
          colors={COLORS.gradientPrimary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dashboardCard, isDesktop && styles.dashboardCardDesktop]}
        >
          <View style={styles.dashboardHeader}>
            <View>
              <Text style={styles.dashboardLabel}>Faturamento do mes</Text>
              <Text style={styles.dashboardValue}>R$ {revenue.toFixed(2)}</Text>
            </View>
            <View style={styles.dashboardBadge}>
              <Ionicons name="trending-up" size={16} color={COLORS.success} />
              <Text style={styles.dashboardBadgeText}>{salesCount} vendas</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Metricas */}
        <View style={[styles.metricsRow, isDesktop && styles.metricsRowDesktop]}>
          <MetricCard
            icon="cube"
            label="Pendentes"
            value={pendingCount.toString()}
            color={COLORS.warning}
          />
          <MetricCard
            icon="airplane"
            label="Em transito"
            value={inTransitCount.toString()}
            color={COLORS.info}
          />
          <MetricCard
            icon="checkmark-circle"
            label="Entregues"
            value={deliveredCount.toString()}
            color={COLORS.success}
          />
        </View>

        {/* Tabs */}
        <Tab items={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

        {/* Sales List */}
        <View style={[styles.salesList, isDesktop && styles.salesListDesktop]}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Carregando vendas...</Text>
            </View>
          ) : filteredSales.length > 0 ? (
            filteredSales.map(renderSaleCard)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="cube-outline" size={48} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma venda aqui</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'pending'
                  ? 'Suas vendas pendentes aparecerao aqui'
                  : activeTab === 'transit'
                  ? 'Pedidos em transito aparecerao aqui'
                  : 'Vendas concluidas aparecerao aqui'
                }
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation navigation={navigation} activeRoute="Sales" />

      {/* Modal de etiqueta */}
      <Modal visible={showLabelModal} onClose={() => setShowLabelModal(false)} title="Etiqueta de envio" type="bottom">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalOrderId}>Pedido #{selectedSale?.orderId}</Text>
          </View>
          <View style={styles.modalBlock}>
            <Text style={styles.modalLabel}>DESTINATARIO</Text>
            <Text style={styles.modalValue}>{selectedSale?.buyer}</Text>
          </View>
          <View style={styles.modalBlock}>
            <Text style={styles.modalLabel}>PRODUTO</Text>
            <Text style={styles.modalValue}>{selectedSale?.product.name}</Text>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={() => setShowLabelModal(false)}>
            <LinearGradient
              colors={COLORS.gradientPrimary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalButtonGradient}
            >
              <Ionicons name="download-outline" size={20} color={COLORS.white} />
              <Text style={styles.modalButtonText}>Gerar etiqueta</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal de confirmacao de envio */}
      <Modal visible={showShipModal} onClose={() => setShowShipModal(false)} title="Confirmar envio" type="bottom">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalOrderId}>Pedido #{selectedSale?.orderId}</Text>
          </View>
          <Text style={styles.modalDescription}>
            Confirme que voce enviou o produto para o comprador
          </Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setShowShipModal(false)}>
            <LinearGradient
              colors={COLORS.gradientPrimary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
              <Text style={styles.modalButtonText}>Confirmar envio</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  dashboardCard: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: 24,
    ...SHADOWS.lg,
  },
  dashboardCardDesktop: {
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dashboardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dashboardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  dashboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  dashboardBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: 12,
    marginBottom: 20,
  },
  metricsRowDesktop: {
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.xs,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  salesList: {
    padding: SPACING.md,
  },
  salesListDesktop: {
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  saleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  saleHeader: {
    marginBottom: 16,
  },
  saleOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saleOrderId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saleProduct: {
    flexDirection: 'row',
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
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productSize: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  buyerName: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  saleValues: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueRowHighlight: {
    marginBottom: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 4,
  },
  valueLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  valueAmount: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  valueDeduction: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
  },
  valueLabelHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  valueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saleActions: {
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
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContent: {
    paddingBottom: 24,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalOrderId: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBlock: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
