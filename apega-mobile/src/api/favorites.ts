import api from './config';
import { Product } from './products';

export const favoritesService = {
  async getFavorites(): Promise<{ success: boolean; favorites: Product[] }> {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addFavorite(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/favorites/${productId}`);
    return response.data;
  },

  async removeFavorite(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/favorites/${productId}`);
    return response.data;
  },

  async toggleFavorite(productId: string, isFavorited: boolean): Promise<{ success: boolean }> {
    if (isFavorited) {
      await this.removeFavorite(productId);
    } else {
      await this.addFavorite(productId);
    }
    return { success: true };
  },
};

export default favoritesService;
