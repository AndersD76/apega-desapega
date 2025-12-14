import api from './api';
import { Product } from './products';

export interface CartItem extends Product {
  cart_item_id: string;
  added_at: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

interface CartResponse {
  success: boolean;
  items: CartItem[];
  summary: CartSummary;
}

// Listar itens do carrinho
export const getCart = async (): Promise<CartResponse> => {
  return api.get('/cart');
};

// Adicionar ao carrinho
export const addToCart = async (productId: string): Promise<void> => {
  await api.post('/cart', { product_id: productId });
};

// Remover do carrinho
export const removeFromCart = async (productId: string): Promise<void> => {
  await api.delete(`/cart/${productId}`);
};

// Limpar carrinho
export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
