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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        // Refresh user data from server
        try {
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.user);
          }
        } catch (error) {
          // Token might be expired
          await authService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.user);
    } else {
      throw new Error('Login failed');
    }
  }

  async function register(data: { email: string; password: string; name: string; phone?: string }) {
    const response = await authService.register(data);
    if (response.success) {
      setUser(response.user);
    } else {
      throw new Error('Registration failed');
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
