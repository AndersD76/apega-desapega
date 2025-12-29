import api from './config';

export interface Tag {
  id: string;
  slug: string;
  name: string;
  category: 'ano' | 'estilo' | 'colecao' | 'especial';
  color: string;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface TagsResponse {
  success: boolean;
  tags: Tag[];
  grouped: {
    ano: Tag[];
    estilo: Tag[];
    colecao: Tag[];
    especial: Tag[];
  };
}

export const tagsService = {
  async getTags(): Promise<TagsResponse> {
    const response = await api.get('/tags');
    return response.data;
  },

  async getProductTags(productId: string): Promise<{ success: boolean; tags: Tag[] }> {
    const response = await api.get(`/tags/product/${productId}`);
    return response.data;
  },

  async setProductTags(productId: string, tagIds: string[]): Promise<{ success: boolean; tags: Tag[] }> {
    const response = await api.post(`/tags/product/${productId}`, { tagIds });
    return response.data;
  },

  async getProductsByTag(slug: string, page = 1, limit = 20): Promise<any> {
    const response = await api.get(`/tags/${slug}/products?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default tagsService;
