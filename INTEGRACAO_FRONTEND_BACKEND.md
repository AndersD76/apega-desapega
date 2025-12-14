# INTEGRAÇÃO FRONTEND-BACKEND - APEGA DESAPEGA

## Índice
1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Setup do Backend](#2-setup-do-backend)
3. [Setup do Frontend Mobile](#3-setup-do-frontend-mobile)
4. [Configuração do Cliente API](#4-configuração-do-cliente-api)
5. [Fluxo de Autenticação](#5-fluxo-de-autenticação)
6. [Tratamento de Erros](#6-tratamento-de-erros)
7. [Upload de Imagens](#7-upload-de-imagens)
8. [Push Notifications](#8-push-notifications)
9. [Testes de Integração](#9-testes-de-integração)
10. [Deployment](#10-deployment)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE MOBILE                          │
│                   (React Native + Expo)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Screens    │  │  Components  │  │   Services   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│                    ┌──────▼───────┐                        │
│                    │  API Client  │                        │
│                    │  (axios/fetch)│                       │
│                    └──────┬───────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                   HTTPS (REST API)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      BACKEND API                            │
│                   (Node.js + Express)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Routes  │─▶│Controllers│─▶│ Services │─▶│  Models  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬────┘  │
│                                                    │        │
│  ┌──────────────────────────────────────────┐    │        │
│  │         Middlewares                      │    │        │
│  │  - Authentication (JWT)                  │    │        │
│  │  - Error Handling                        │    │        │
│  │  - Validation                            │    │        │
│  │  - Rate Limiting                         │    │        │
│  └──────────────────────────────────────────┘    │        │
└───────────────────────────────────────────────────┼────────┘
                                                    │
                            ┌───────────────────────┼────────────────┐
                            │                       │                │
                      ┌─────▼─────┐         ┌──────▼──────┐  ┌─────▼─────┐
                      │PostgreSQL │         │   Redis     │  │    S3     │
                      │(Database) │         │   (Cache)   │  │ (Storage) │
                      └───────────┘         └─────────────┘  └───────────┘
```

### Comunicação

**Cliente → Backend:**
- REST API (JSON)
- Headers: Authorization (Bearer token), Content-Type
- Base URL: `http://localhost:3001` (dev) ou `https://api.apegadesapega.com.br` (prod)

**Backend → Cliente:**
- JSON responses
- HTTP status codes padrão
- Error messages estruturadas

**Backend → Serviços Externos:**
- Stripe/Mercado Pago (pagamentos)
- AWS S3/Cloudinary (imagens)
- Firebase FCM (push notifications)
- Google Maps (geolocalização)
- Melhor Envio (logística)

---

## 2. Setup do Backend

### 2.1. Pré-requisitos

```bash
# Node.js (v18+)
node --version

# PostgreSQL (v14+)
psql --version

# Redis (v6+)
redis-cli --version

# npm ou yarn
npm --version
```

### 2.2. Instalação

```bash
# 1. Navegar para o diretório do backend
cd backend

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env baseado no .env.example
cp .env.example .env

# 4. Editar .env com suas credenciais
# Veja CONFIGURACAO_APIS_EXTERNAS.md para obter as chaves
```

### 2.3. Configurar Banco de Dados

```bash
# Criar banco de dados PostgreSQL
createdb apega_desapega_db

# Rodar migrations (se usar Prisma)
npx prisma migrate dev

# Ou rodar migrations (se usar Sequelize/TypeORM)
npm run migrate

# Seed inicial (opcional)
npm run seed
```

### 2.4. Iniciar Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start

# O servidor estará rodando em http://localhost:3001
```

### 2.5. Estrutura de Diretórios (Sugerida)

```
backend/
├── src/
│   ├── config/           # Configurações (database, redis, s3, etc.)
│   ├── controllers/      # Lógica de requisições
│   ├── middleware/       # Autenticação, validação, etc.
│   ├── models/          # Modelos do banco de dados
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Funções auxiliares
│   ├── validators/      # Schemas de validação (Joi/Yup)
│   └── app.js           # Configuração do Express
├── prisma/              # Schema Prisma (ou migrations)
├── tests/               # Testes unitários e de integração
├── .env.example         # Variáveis de ambiente (template)
├── .env                 # Variáveis de ambiente (não commitar)
├── package.json
└── README.md
```

---

## 3. Setup do Frontend Mobile

### 3.1. Pré-requisitos

```bash
# Node.js (v18+)
node --version

# Expo CLI
npm install -g expo-cli
expo --version

# Para iOS: Xcode (somente macOS)
# Para Android: Android Studio
```

### 3.2. Instalação

```bash
# 1. Navegar para o diretório do app mobile
cd apega-mobile

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env baseado no .env.example
cp .env.example .env

# 4. Editar .env com a URL da API e chaves
# EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 3.3. Configurar app.json

```json
{
  "expo": {
    "name": "Apega Desapega",
    "slug": "apega-desapega",
    "version": "1.0.0",
    "scheme": "apegadesapega",
    "plugins": [
      "@react-native-firebase/app",
      [
        "@react-native-firebase/messaging",
        {
          "iosNSUserTrackingUsageDescription": "Enviar notificações sobre pedidos e mensagens"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.apegadesapega.app",
      "config": {
        "googleMapsApiKey": "SUA_GOOGLE_MAPS_API_KEY"
      }
    },
    "android": {
      "package": "com.apegadesapega.app",
      "config": {
        "googleMaps": {
          "apiKey": "SUA_GOOGLE_MAPS_API_KEY"
        }
      },
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 3.4. Iniciar App

```bash
# Modo desenvolvimento
npm start

# iOS Simulator (requer macOS)
npm run ios

# Android Emulator
npm run android

# Web (para testes rápidos)
npm run web
```

### 3.5. Estrutura de Diretórios

```
apega-mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── modals/     # Modais (Filters, Offer, Share, etc.)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── screens/        # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── SalesScreen.tsx
│   │   └── ...
│   ├── services/       # Integração com API
│   │   ├── api.ts      # Cliente axios configurado
│   │   ├── auth.ts     # Serviços de autenticação
│   │   ├── products.ts # Serviços de produtos
│   │   └── ...
│   ├── navigation/     # React Navigation
│   ├── constants/      # Constantes (theme, colors, etc.)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Funções auxiliares
│   └── types/          # TypeScript types
├── assets/             # Imagens, fontes, etc.
├── .env.example        # Variáveis de ambiente (template)
├── .env                # Variáveis de ambiente (não commitar)
├── app.json            # Configuração do Expo
├── package.json
└── tsconfig.json
```

---

## 4. Configuração do Cliente API

### 4.1. Criar Cliente Axios (apega-mobile/src/services/api.ts)

```typescript
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Base URL da API
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = 'v1';

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Adicionar token JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@apega:token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Refresh token automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Se erro 401 (não autorizado) e não foi retry ainda
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@apega:refresh_token');

        if (refreshToken) {
          // Tentar renovar o token
          const response = await axios.post(`${API_URL}/api/${API_VERSION}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Salvar novos tokens
          await AsyncStorage.setItem('@apega:token', access_token);
          await AsyncStorage.setItem('@apega:refresh_token', refresh_token);

          // Retentar requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se refresh falhar, fazer logout
        await AsyncStorage.multiRemove(['@apega:token', '@apega:refresh_token', '@apega:user']);
        // Redirecionar para tela de login
        // navigation.navigate('Login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 4.2. Serviço de Autenticação (apega-mobile/src/services/auth.ts)

```typescript
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    is_seller: boolean;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    // Salvar tokens no AsyncStorage
    await AsyncStorage.setItem('@apega:token', data.access_token);
    await AsyncStorage.setItem('@apega:refresh_token', data.refresh_token);
    await AsyncStorage.setItem('@apega:user', JSON.stringify(data.user));

    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const data = response.data;

    // Salvar tokens no AsyncStorage
    await AsyncStorage.setItem('@apega:token', data.access_token);
    await AsyncStorage.setItem('@apega:refresh_token', data.refresh_token);
    await AsyncStorage.setItem('@apega:user', JSON.stringify(data.user));

    return data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Mesmo se falhar no servidor, fazer logout local
      console.error('Logout error:', error);
    } finally {
      // Limpar tokens locais
      await AsyncStorage.multiRemove(['@apega:token', '@apega:refresh_token', '@apega:user']);
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('@apega:user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('@apega:token');
    return !!token;
  }
}

export default new AuthService();
```

### 4.3. Serviço de Produtos (apega-mobile/src/services/products.ts)

```typescript
import api from './api';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  brand?: string;
  size?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  seller_id: string;
  created_at: string;
}

export interface ProductFilters {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  brand?: string;
  size?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class ProductService {
  async getProducts(filters?: ProductFilters) {
    const response = await api.get('/products', { params: filters });
    return response.data;
  }

  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: FormData) {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<Product>) {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  async favoriteProduct(id: string) {
    const response = await api.post(`/products/${id}/favorite`);
    return response.data;
  }

  async unfavoriteProduct(id: string) {
    const response = await api.delete(`/products/${id}/favorite`);
    return response.data;
  }

  async getFavorites() {
    const response = await api.get('/products/favorites');
    return response.data;
  }
}

export default new ProductService();
```

---

## 5. Fluxo de Autenticação

### 5.1. Diagrama de Fluxo

```
┌─────────┐                                    ┌─────────┐
│  App    │                                    │  API    │
└────┬────┘                                    └────┬────┘
     │                                              │
     │ POST /auth/register ou /auth/login          │
     │ { email, password }                         │
     ├────────────────────────────────────────────▶│
     │                                              │
     │                                              │ Validar credenciais
     │                                              │ Gerar JWT tokens
     │                                              │
     │ { user, access_token, refresh_token }       │
     │◀────────────────────────────────────────────┤
     │                                              │
     │ Salvar tokens no AsyncStorage               │
     │ Redirecionar para Home                      │
     │                                              │
     │                                              │
     │ Requisições subsequentes                    │
     │ Header: Authorization: Bearer {token}       │
     ├────────────────────────────────────────────▶│
     │                                              │
     │                                              │ Validar token JWT
     │                                              │ Processar requisição
     │                                              │
     │ { data }                                     │
     │◀────────────────────────────────────────────┤
     │                                              │
     │                                              │
     │ (Se token expirar) → 401 Unauthorized       │
     │◀────────────────────────────────────────────┤
     │                                              │
     │ POST /auth/refresh                          │
     │ { refresh_token }                           │
     ├────────────────────────────────────────────▶│
     │                                              │
     │                                              │ Validar refresh token
     │                                              │ Gerar novos tokens
     │                                              │
     │ { access_token, refresh_token }             │
     │◀────────────────────────────────────────────┤
     │                                              │
     │ Salvar novos tokens                         │
     │ Retentar requisição original                │
     │                                              │
```

### 5.2. Implementação no React Native

```typescript
// apega-mobile/src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService, { AuthResponse } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_seller: boolean;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await AuthService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      const response = await AuthService.register({ name, email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 6. Tratamento de Erros

### 6.1. Padronização de Erros da API

**Backend - Formato de Erro:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email já está em uso",
    "details": {
      "field": "email",
      "value": "usuario@example.com"
    }
  }
}
```

**Códigos de Erro Comuns:**
- `VALIDATION_ERROR` - Erro de validação
- `AUTHENTICATION_ERROR` - Credenciais inválidas
- `AUTHORIZATION_ERROR` - Sem permissão
- `NOT_FOUND` - Recurso não encontrado
- `RATE_LIMIT_EXCEEDED` - Muitas requisições
- `INTERNAL_SERVER_ERROR` - Erro interno

### 6.2. Tratamento no Frontend

```typescript
// apega-mobile/src/utils/errorHandler.ts
import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Erro de rede
    if (!error.response) {
      return 'Sem conexão com a internet. Verifique sua conexão.';
    }

    // Erro da API
    const apiError = error.response.data?.error as ApiError;

    if (apiError) {
      return apiError.message;
    }

    // Fallback baseado no status
    switch (error.response.status) {
      case 400:
        return 'Dados inválidos. Verifique os campos.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 429:
        return 'Muitas tentativas. Aguarde alguns minutos.';
      case 500:
        return 'Erro no servidor. Tente novamente mais tarde.';
      default:
        return 'Erro desconhecido. Tente novamente.';
    }
  }

  return 'Erro inesperado. Tente novamente.';
}
```

### 6.3. Uso em Componentes

```typescript
// apega-mobile/src/screens/LoginScreen.tsx
import { handleApiError } from '../utils/errorHandler';
import { Alert } from 'react-native';

async function handleLogin() {
  try {
    setLoading(true);
    await signIn(email, password);
    // Navegar para Home
  } catch (error) {
    const errorMessage = handleApiError(error);
    Alert.alert('Erro no Login', errorMessage);
  } finally {
    setLoading(false);
  }
}
```

---

## 7. Upload de Imagens

### 7.1. Fluxo de Upload (S3 Presigned URL)

```
┌─────────┐                  ┌─────────┐                 ┌─────────┐
│  App    │                  │  API    │                 │   S3    │
└────┬────┘                  └────┬────┘                 └────┬────┘
     │                            │                           │
     │ POST /images/presigned     │                           │
     │ { filename, content_type } │                           │
     ├───────────────────────────▶│                           │
     │                            │                           │
     │                            │ Gerar presigned URL       │
     │                            ├──────────────────────────▶│
     │                            │                           │
     │                            │ { url, fields }           │
     │                            │◀──────────────────────────┤
     │                            │                           │
     │ { upload_url, image_url }  │                           │
     │◀───────────────────────────┤                           │
     │                            │                           │
     │ PUT upload_url             │                           │
     │ (Binary image data)        │                           │
     ├────────────────────────────┼──────────────────────────▶│
     │                            │                           │
     │                            │                     Upload success
     │                            │                           │
     │ POST /products             │                           │
     │ { ..., images: [image_url] }│                          │
     ├───────────────────────────▶│                           │
     │                            │                           │
```

### 7.2. Implementação Mobile

```typescript
// apega-mobile/src/services/images.ts
import api from './api';
import * as FileSystem from 'expo-file-system';

interface PresignedUrlResponse {
  upload_url: string;
  image_url: string;
  expires_in: number;
}

class ImageService {
  async uploadImage(uri: string): Promise<string> {
    try {
      // 1. Obter presigned URL do backend
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const response = await api.post<PresignedUrlResponse>('/images/presigned', {
        filename,
        content_type: type,
      });

      const { upload_url, image_url } = response.data;

      // 2. Upload direto para S3
      await FileSystem.uploadAsync(upload_url, uri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': type,
        },
      });

      // 3. Retornar URL pública da imagem
      return image_url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async uploadMultipleImages(uris: string[]): Promise<string[]> {
    const uploadPromises = uris.map((uri) => this.uploadImage(uri));
    return Promise.all(uploadPromises);
  }
}

export default new ImageService();
```

---

## 8. Push Notifications

### 8.1. Setup Firebase (Mobile)

```typescript
// apega-mobile/src/services/notifications.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

class NotificationService {
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permission status:', authStatus);
      return true;
    }
    return false;
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
      return null;
    }
  }

  async registerDevice() {
    try {
      const token = await this.getToken();

      if (token) {
        // Registrar token no backend
        await api.post('/notifications/register-device', {
          device_token: token,
          device_type: Platform.OS,
        });

        await AsyncStorage.setItem('@apega:fcm_token', token);
      }
    } catch (error) {
      console.error('Register device error:', error);
    }
  }

  setupNotificationListeners() {
    // Foreground notifications
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification:', remoteMessage);
      // Mostrar notificação local ou atualizar UI
    });

    // Background/Quit notifications
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification:', remoteMessage);
    });

    // Notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      // Navegar para tela específica
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit:', remoteMessage);
          // Navegar para tela específica
        }
      });
  }
}

export default new NotificationService();
```

### 8.2. Inicializar no App

```typescript
// apega-mobile/App.tsx
import NotificationService from './src/services/notifications';

useEffect(() => {
  // Solicitar permissão
  NotificationService.requestPermission();

  // Registrar device token
  NotificationService.registerDevice();

  // Setup listeners
  NotificationService.setupNotificationListeners();
}, []);
```

---

## 9. Testes de Integração

### 9.1. Teste Backend API

```bash
# Criar arquivo de teste
# backend/tests/integration/auth.test.js

npm test
```

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  it('POST /auth/register - deve criar novo usuário', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Teste User',
        email: 'teste@example.com',
        password: 'senha123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.email).toBe('teste@example.com');
  });

  it('POST /auth/login - deve fazer login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'teste@example.com',
        password: 'senha123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });

  it('POST /auth/login - deve retornar erro com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'teste@example.com',
        password: 'senha_errada',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });
});
```

### 9.2. Teste Frontend (Componentes)

```typescript
// apega-mobile/src/screens/__tests__/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import AuthService from '../../services/auth';

jest.mock('../../services/auth');

describe('LoginScreen', () => {
  it('deve fazer login com sucesso', async () => {
    const mockLogin = jest.spyOn(AuthService, 'login').mockResolvedValue({
      user: { id: '1', name: 'Teste', email: 'teste@example.com', is_seller: false },
      access_token: 'token123',
      refresh_token: 'refresh123',
      expires_in: 3600,
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'teste@example.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), 'senha123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'teste@example.com',
        password: 'senha123',
      });
    });
  });
});
```

### 9.3. Teste Manual de Integração

**Checklist:**

- [ ] Registro de novo usuário
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (deve retornar erro)
- [ ] Refresh token automático após expiração
- [ ] Listar produtos (sem autenticação)
- [ ] Criar produto (com autenticação)
- [ ] Upload de imagem
- [ ] Adicionar produto aos favoritos
- [ ] Enviar mensagem
- [ ] Receber notificação push
- [ ] Criar oferta
- [ ] Checkout (integração com Stripe/Mercado Pago)

---

## 10. Deployment

### 10.1. Backend

**Opções de Hospedagem:**
- AWS EC2 / Elastic Beanstalk
- DigitalOcean Droplet / App Platform
- Heroku
- Railway
- Render

**Passos Gerais:**

```bash
# 1. Configurar variáveis de ambiente no servidor
# 2. Fazer build da aplicação (se necessário)
npm run build

# 3. Rodar migrations no banco de produção
npm run migrate:prod

# 4. Iniciar aplicação
npm start

# 5. Configurar PM2 para gerenciar processo
pm2 start npm --name "apega-api" -- start
pm2 startup
pm2 save

# 6. Configurar Nginx como reverse proxy
# /etc/nginx/sites-available/apega-api
server {
    listen 80;
    server_name api.apegadesapega.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 7. Configurar SSL com Let's Encrypt
sudo certbot --nginx -d api.apegadesapega.com.br
```

### 10.2. Frontend Mobile

**Expo EAS Build:**

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login no Expo
eas login

# 3. Configurar projeto
eas build:configure

# 4. Build para iOS (requer conta Apple Developer)
eas build --platform ios

# 5. Build para Android
eas build --platform android

# 6. Submit para lojas
eas submit --platform ios
eas submit --platform android
```

**Variáveis de Ambiente (Produção):**

```bash
# Atualizar .env para produção
EXPO_PUBLIC_API_URL=https://api.apegadesapega.com.br
EXPO_PUBLIC_ENV=production
```

---

## Resumo Final

✅ **Backend configurado** com Node.js, PostgreSQL, Redis
✅ **Frontend mobile** com React Native + Expo
✅ **Cliente API** com axios e refresh token automático
✅ **Autenticação JWT** com contexto React
✅ **Tratamento de erros** padronizado
✅ **Upload de imagens** via S3 presigned URLs
✅ **Push notifications** via Firebase FCM
✅ **Testes** unitários e de integração
✅ **Deployment** em produção

**Próximo passo:** Testar a integração completa seguindo o checklist da seção 9.3!

---

**Última atualização:** Novembro 2025
**Versão:** 1.0
