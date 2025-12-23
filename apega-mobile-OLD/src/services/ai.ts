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
  tituloSugerido?: string;
  caracteristicas: string[];
  palavrasChave: string[];
  // Campos extras
  condicaoDetalhes?: string;
  estacao?: string;
  dicasVenda?: string[];
  pontosAtencao?: string[];
}

export interface AIAccessStatus {
  hasAccess: boolean;
  isPremium: boolean;
  accessType: 'premium' | 'free';
  features: {
    analyzeClothing: boolean;
    suggestPrice: boolean;
    improveDescription: boolean;
    removeBackground: boolean;
    enhanceImage: boolean;
    virtualTryOn: boolean;
  };
}

export interface AIPricingInfo {
  plans: {
    free: {
      name: string;
      aiFeatures: boolean;
      description: string;
    };
    premium: {
      name: string;
      aiFeatures: boolean;
      price: number;
      description: string;
      features: string[];
    };
  };
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

// Analisar roupa com IA (apenas 1 imagem por produto)
export const analyzeClothing = async (imageUrl: string): Promise<AIAnalysisResult> => {
  try {
    const response = await api.post('/ai/analyze', { imageUrl });
    return response.analysis || response.data?.analysis || response;
  } catch (error: any) {
    console.error('Erro ao analisar roupa:', error);
    throw error;
  }
};

// Melhorar descrição
export const improveDescription = async (
  analysis: AIAnalysisResult,
  userDescription?: string
): Promise<{ titulo: string; descricao: string; hashtags: string[] }> => {
  try {
    const response = await api.post('/ai/improve-description', {
      analysis,
      userDescription,
    });
    return response.improved || response.data?.improved || response;
  } catch (error: any) {
    console.error('Erro ao melhorar descrição:', error);
    throw error;
  }
};

// Remover fundo da imagem (Premium only)
export const removeBackground = async (
  imageUrl: string
): Promise<{ success: boolean; imageBase64: string; provider: string }> => {
  try {
    const response = await api.post('/ai/remove-background', { imageUrl });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao remover fundo:', error);
    throw error;
  }
};

// Melhorar imagem (Premium only)
export const enhanceImage = async (
  imageUrl: string
): Promise<{ success: boolean; imageBase64: string; provider: string }> => {
  try {
    const response = await api.post('/ai/enhance-image', { imageUrl });
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao melhorar imagem:', error);
    throw error;
  }
};

// Prova virtual (Premium only - em breve)
export const virtualTryOn = async (
  clothingImageUrl: string,
  modelImageUrl?: string
): Promise<{ success: boolean; outputUrl: string; provider: string }> => {
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

// Obter informações de preços/planos
export const getAIPricing = async (): Promise<AIPricingInfo> => {
  try {
    const response = await api.get('/ai/pricing');
    return response.data || response;
  } catch (error: any) {
    console.error('Erro ao buscar preços:', error);
    throw error;
  }
};
