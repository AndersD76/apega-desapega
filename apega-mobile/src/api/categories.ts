import api from './config';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  description?: string;
  product_count?: number;
  sort_order: number;
  is_active: boolean;
}

export const categoriesService = {
  async getCategories(): Promise<{ success: boolean; categories: Category[] }> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategory(slug: string): Promise<{ success: boolean; category: Category }> {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },
};

export default categoriesService;
