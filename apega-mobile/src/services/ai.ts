import { api } from './api';

export interface AIAnalysisResult {
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
  caracteristicas: string[];
  palavrasChave: string[];
}

export interface AIAccessStatus {
  hasAccess: boolean;
  isPremium: boolean;
  isEarlyUser: boolean;
  features: {
    analysis: boolean;
    virtualTryOn: boolean;
    imageEnhancement: boolean;
  };
}

export interface FreeSlotsInfo {
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
}

// Verificar status de acesso do usuário
export const checkAIAccess = async (): Promise<AIAccessStatus> => {
  try {
    const response = await api.get('/ai/status');
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao verificar acesso IA:', error);
    throw error;
  }
};

// Analisar roupa com IA
export const analyzeClothing = async (imageUrl: string): Promise<AIAnalysisResult> => {
  try {
    const response = await api.post('/ai/analyze', { imageUrl });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao analisar roupa:', error);
    throw error;
  }
};

// Melhorar descrição
export const improveDescription = async (
  description: string,
  productInfo?: { brand?: string; size?: string; condition?: string }
): Promise<{ improvedDescription: string }> => {
  try {
    const response = await api.post('/ai/improve-description', {
      description,
      productInfo,
    });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao melhorar descrição:', error);
    throw error;
  }
};

// Prova virtual (Premium only)
export const virtualTryOn = async (
  clothingImageUrl: string,
  modelImageUrl?: string
): Promise<{ resultUrl: string }> => {
  try {
    const response = await api.post('/ai/virtual-tryon', {
      clothingImageUrl,
      modelImageUrl,
    });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro na prova virtual:', error);
    throw error;
  }
};

// Melhorar imagem (Premium only)
export const enhanceImage = async (
  imageUrl: string,
  options?: { removeBackground?: boolean; enhance?: boolean }
): Promise<{ enhancedUrl: string }> => {
  try {
    const response = await api.post('/ai/enhance-image', {
      imageUrl,
      ...options,
    });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao melhorar imagem:', error);
    throw error;
  }
};

// Remover fundo (Premium only)
export const removeBackground = async (
  imageUrl: string
): Promise<{ resultUrl: string }> => {
  try {
    const response = await api.post('/ai/remove-background', { imageUrl });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao remover fundo:', error);
    throw error;
  }
};

// Verificar vagas gratuitas restantes
export const checkFreeSlots = async (): Promise<FreeSlotsInfo> => {
  try {
    const response = await api.get('/ai/free-slots');
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao verificar vagas:', error);
    throw error;
  }
};
