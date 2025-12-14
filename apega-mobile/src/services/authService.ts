import { api, loadToken } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  avatar_url?: string | null;
  rating: number;
  total_reviews: number;
  total_sales: number;
  subscription_type: 'free' | 'premium';
  city?: string;
  state?: string;
  store_name?: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro ao fazer login',
    };
  }
};

// Register
export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro ao criar conta',
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Make sure token is loaded
    await loadToken();

    const response = await api.get<{ user: User }>('/auth/me');
    if (response.success && response.user) {
      return response.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update profile
export const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const response = await api.put<{ success: boolean; user: User }>('/auth/profile', data);
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro ao atualizar perfil',
    };
  }
};

export default {
  login,
  register,
  getCurrentUser,
  updateProfile,
};
