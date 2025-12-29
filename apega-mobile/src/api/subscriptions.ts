import api from './config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period?: string;
  monthlyPrice?: string;
  savings?: string;
  features: string[];
  aiFeatures: boolean;
  popular?: boolean;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionType: 'free' | 'premium' | 'premium_plus';
  expiresAt?: string;
}

export interface PixPayment {
  id: string;
  status: string;
  pix_qr_code: string;
  pix_qr_code_base64: string;
  expires_at: string;
}

export interface BoletoPayment {
  id: string;
  status: string;
  barcode: string;
  boleto_url: string;
  expires_at: string;
}

export const subscriptionsService = {
  async getPlans(): Promise<{ success: boolean; plans: SubscriptionPlan[] }> {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  async getStatus(): Promise<{ success: boolean } & SubscriptionStatus> {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  async createPixPayment(plan: 'monthly' | 'yearly'): Promise<{
    success: boolean;
    payment: PixPayment;
    plan: string;
    price: number;
  }> {
    const response = await api.post('/subscriptions/pix', { plan });
    return response.data;
  },

  async createBoletoPayment(plan: 'monthly' | 'yearly'): Promise<{
    success: boolean;
    payment: BoletoPayment;
    plan: string;
    price: number;
  }> {
    const response = await api.post('/subscriptions/boleto', { plan });
    return response.data;
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },
};

export default subscriptionsService;
