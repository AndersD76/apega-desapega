import api from './config';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  product_title: string;
  product_brand?: string;
  product_size?: string;
  product_image?: string;
  product_price: number;
  shipping_price: number;
  commission_rate: number;
  commission_amount: number;
  seller_receives: number;
  total_amount: number;
  shipping_address_id?: string;
  payment_method?: string;
  status: 'pending_payment' | 'paid' | 'pending_shipment' | 'shipped' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  shipping_code?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  seller_name?: string;
  seller_avatar?: string;
  buyer_name?: string;
  buyer_avatar?: string;
  has_review?: boolean;
  created_at: string;
}

export interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  pendingShipment: number;
  inTransit: number;
}

export const ordersService = {
  async getPurchases(status?: string): Promise<{ success: boolean; orders: Order[] }> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const response = await api.get(`/orders/purchases${params}`);
    return response.data;
  },

  async getSales(status?: string): Promise<{ success: boolean; orders: Order[] }> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const response = await api.get(`/orders/sales${params}`);
    return response.data;
  },

  async getOrder(id: string): Promise<{ success: boolean; order: Order }> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: {
    product_id: string;
    address_id?: string;
    payment_method?: string;
  }): Promise<{ success: boolean; order: Order; message: string }> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateOrderStatus(
    id: string,
    data: {
      status: string;
      shipping_code?: string;
      shipping_carrier?: string;
    }
  ): Promise<{ success: boolean; order: Order }> {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  },

  async getSalesStats(): Promise<{ success: boolean; stats: OrderStats }> {
    const response = await api.get('/orders/stats/sales');
    return response.data;
  },
};

export default ordersService;
