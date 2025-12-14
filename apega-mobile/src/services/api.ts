import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL base da API - ajustar conforme ambiente
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://api.apegadesapega.com.br/api';
  }
  // No navegador, usar localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api';
  }
  // No celular, usar IP da rede local
  return 'http://192.168.0.128:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Token de autenticação
let authToken: string | null = null;

// Carregar token do storage
export const loadToken = async (): Promise<string | null> => {
  try {
    authToken = await AsyncStorage.getItem('@apega:token');
    return authToken;
  } catch {
    return null;
  }
};

// Salvar token
export const saveToken = async (token: string): Promise<void> => {
  try {
    authToken = token;
    await AsyncStorage.setItem('@apega:token', token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

// Remover token (logout)
export const removeToken = async (): Promise<void> => {
  try {
    authToken = null;
    await AsyncStorage.removeItem('@apega:token');
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};

// Interface de resposta da API
export interface ApiResponse<T = any> {
  success?: boolean;
  error?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Função principal de requisição
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Adicionar token se disponível
    if (authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Métodos HTTP simplificados
export const api = {
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  // Upload de arquivo (FormData)
  upload: async <T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no upload');
      }

      return data;
    } catch (error: any) {
      console.error(`Upload Error [${endpoint}]:`, error);
      throw error;
    }
  },
};

export default api;
