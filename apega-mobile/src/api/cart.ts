import api from './config';

export interface CartItem {
  cart_item_id: string;
  added_at: string;
  id: string;
  title: string;
  description?: string;
  brand?: string;
  size?: string;
  condition: string;
  price: number;
  original_price?: number;
  image_url?: string;
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  store_name?: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  summary: CartSummary;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/cart', { product_id: productId });
    return response.data;
  },

  async removeFromCart(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  async clearCart(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/cart');
    return response.data;
  },
};

export default cartService;
