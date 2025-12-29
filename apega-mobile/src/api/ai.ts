import api from './config';
import * as FileSystem from 'expo-file-system';

export interface ClothingAnalysis {
  tipo: string;
  marca: string;
  condicao: string;
  cores: string[];
  materiais: string[];
  tamanho: string;
  estilo: string;
  precoSugerido: {
    minimo: number;
    maximo: number;
    recomendado: number;
  };
  descricaoSugerida: string;
  tituloSugerido: string;
  caracteristicas: string[];
  palavrasChave: string[];
  condicaoDetalhes?: string;
  estacao?: string;
  dicasVenda?: string[];
  pontosAtencao?: string[];
}

export interface ImageEnhanceResult {
  enhanced_url: string;
  original_url: string;
}

export interface BackgroundRemovalResult {
  processed_url: string;
  original_url: string;
}

export interface VirtualTryOnResult {
  result_url: string;
  model_used: string;
}

export const aiService = {
  /**
   * Analyze a clothing image using AI
   * Supports local file URI or remote URL
   */
  async analyzeClothing(imageUri: string): Promise<{
    success: boolean;
    analysis: ClothingAnalysis;
    suggestedCategory: string;
    imageUrl: string;
  }> {
    // Detectar se estamos no ambiente web
    const isWeb = typeof document !== 'undefined';

    // Se for uma URI local (file://, content://, blob:) e estamos no mobile
    if (!isWeb && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
      const formData = new FormData();

      // Extrair nome do arquivo e tipo
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore - React Native FormData aceita objeto com uri
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await api.post('/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // No ambiente WEB com blob: URI, converter para File
    if (isWeb && imageUri.startsWith('blob:')) {
      try {
        const blobResponse = await fetch(imageUri);
        const blob = await blobResponse.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/ai/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error converting blob:', error);
        throw error;
      }
    }

    // Se for URL remota (http/https), enviar como JSON
    if (imageUri.startsWith('http')) {
      const response = await api.post('/ai/analyze', { imageUrl: imageUri });
      return response.data;
    }

    // Fallback: tentar enviar como URL
    const response = await api.post('/ai/analyze', { imageUrl: imageUri });
    return response.data;
  },

  /**
   * Check AI status and user access level
   */
  async getStatus(): Promise<{
    hasAccess: boolean;
    accessType: 'free' | 'premium';
    isPremium: boolean;
    features: Record<string, boolean>;
  }> {
    const response = await api.get('/ai/status');
    return response.data;
  },

  /**
   * Enhance product image quality
   * Supports local file URI or remote URL
   */
  async enhanceImage(imageUri: string): Promise<{ success: boolean; result: ImageEnhanceResult }> {
    const isWeb = typeof document !== 'undefined';

    // Se for uma URI local, fazer upload via FormData
    if (!isWeb && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      // @ts-ignore
      formData.append('image', { uri: imageUri, name: filename, type });
      const response = await api.post('/ai/enhance-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // Web com blob:
    if (isWeb && imageUri.startsWith('blob:')) {
      const blobResponse = await fetch(imageUri);
      const blob = await blobResponse.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/ai/enhance-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // URL remota
    const response = await api.post('/ai/enhance-image', { imageUrl: imageUri });
    return response.data;
  },

  /**
   * Remove background from product image
   * Supports local file URI or remote URL
   */
  async removeBackground(imageUri: string): Promise<{ success: boolean; result: BackgroundRemovalResult }> {
    const isWeb = typeof document !== 'undefined';

    // Se for uma URI local, fazer upload via FormData
    if (!isWeb && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      // @ts-ignore
      formData.append('image', { uri: imageUri, name: filename, type });
      const response = await api.post('/ai/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // Web com blob:
    if (isWeb && imageUri.startsWith('blob:')) {
      const blobResponse = await fetch(imageUri);
      const blob = await blobResponse.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/ai/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // URL remota
    const response = await api.post('/ai/remove-background', { imageUrl: imageUri });
    return response.data;
  },

  /**
   * Generate virtual try-on preview
   */
  async virtualTryOn(
    clothingImageUrl: string,
    modelImageUrl?: string
  ): Promise<{ success: boolean; result: VirtualTryOnResult }> {
    const response = await api.post('/ai/virtual-try-on', {
      clothing_image_url: clothingImageUrl,
      model_image_url: modelImageUrl,
    });
    return response.data;
  },

  /**
   * Get AI suggested price for a product
   */
  async getSuggestedPrice(data: {
    category: string;
    brand?: string;
    condition: string;
    original_price?: number;
  }): Promise<{ success: boolean; price: { min: number; max: number; recommended: number } }> {
    const response = await api.post('/ai/suggest-price', data);
    return response.data;
  },

  /**
   * Generate product description using AI
   */
  async generateDescription(data: {
    title: string;
    category: string;
    brand?: string;
    condition: string;
    material?: string;
    size?: string;
  }): Promise<{ success: boolean; description: string }> {
    const response = await api.post('/ai/generate-description', data);
    return response.data;
  },
};

export default aiService;
