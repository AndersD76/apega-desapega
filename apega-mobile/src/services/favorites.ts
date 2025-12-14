import api from './api';
import { Product } from './products';

export interface FavoriteItem extends Product {
  favorite_id: string;
  favorited_at: string;
}

// Listar favoritos
export const getFavorites = async (): Promise<{ favorites: FavoriteItem[] }> => {
  return api.get('/favorites');
};

// Adicionar aos favoritos
export const addToFavorites = async (productId: string): Promise<void> => {
  await api.post(`/favorites/${productId}`);
};

// Remover dos favoritos
export const removeFromFavorites = async (productId: string): Promise<void> => {
  await api.delete(`/favorites/${productId}`);
};

// Toggle favorito
export const toggleFavorite = async (productId: string, isFavorited: boolean): Promise<void> => {
  if (isFavorited) {
    await removeFromFavorites(productId);
  } else {
    await addToFavorites(productId);
  }
};

export default {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
};
