import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../api';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const defaultContextValue: AuthContextData = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext<AuthContextData>(defaultContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use setTimeout to ensure loading state updates properly
    const timer = setTimeout(() => {
      loadStoredUser();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  async function loadStoredUser() {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        // Refresh user data from server (don't block on this)
        authService.getMe()
          .then(response => {
            if (response.success) {
              setUser(response.user);
            }
          })
          .catch(async () => {
            // Token might be expired
            await authService.logout();
            setUser(null);
          });
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error('Email ou senha incorretos');
      }
    } catch (error: any) {
      // Handle axios error response
      const message = error?.response?.data?.message || error?.message || 'Email ou senha incorretos';
      throw new Error(message);
    }
  }

  async function register(data: { email: string; password: string; name: string; phone?: string }) {
    try {
      const response = await authService.register(data);
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error('Não foi possível criar a conta');
      }
    } catch (error: any) {
      // Handle axios error response
      const message = error?.response?.data?.message || error?.message || 'Não foi possível criar a conta';
      throw new Error(message);
    }
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function updateUser(data: Partial<User>) {
    const response = await authService.updateProfile(data);
    if (response.success) {
      setUser(response.user);
    }
  }

  async function refreshUser() {
    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
