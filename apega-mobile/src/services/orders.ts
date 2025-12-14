import api from './api';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  product_price: number;
  shipping_price: number;
  commission_rate: number;
  commission_amount: number;
  seller_receives: number;
  total_amount: number;
  status: OrderStatus;
  payment_method?: string;
  shipping_code?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  // Joins
  product_title?: string;
  product_brand?: string;
  product_size?: string;
  product_image?: string;
  seller_name?: string;
  seller_avatar?: string;
  buyer_name?: string;
  buyer_avatar?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'pending_shipment'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  pendingShipment: number;
  inTransit: number;
}

// Listar minhas compras
export const getPurchases = async (status?: string): Promise<{ orders: Order[] }> => {
  const endpoint = status && status !== 'all'
    ? `/orders/purchases?status=${status}`
    : '/orders/purchases';
  return api.get(endpoint);
};

// Listar minhas vendas
export const getSales = async (status?: string): Promise<{ orders: Order[] }> => {
  const endpoint = status && status !== 'all'
    ? `/orders/sales?status=${status}`
    : '/orders/sales';
  return api.get(endpoint);
};

// Obter detalhes do pedido
export const getOrder = async (id: string): Promise<{ order: Order }> => {
  return api.get(`/orders/${id}`);
};

// Criar pedido (comprar)
export const createOrder = async (data: {
  product_id: string;
  address_id?: string;
  payment_method?: string;
}): Promise<{ order: Order }> => {
  return api.post('/orders', data);
};

// Atualizar status do pedido
export const updateOrderStatus = async (
  id: string,
  data: {
    status: OrderStatus;
    shipping_code?: string;
    shipping_carrier?: string;
  }
): Promise<{ order: Order }> => {
  return api.patch(`/orders/${id}/status`, data);
};

// Estatísticas de vendas
export const getSalesStats = async (): Promise<{ stats: SalesStats }> => {
  return api.get('/orders/stats/sales');
};

export default {
  getPurchases,
  getSales,
  getOrder,
  createOrder,
  updateOrderStatus,
  getSalesStats,
};
