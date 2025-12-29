import api from './config';

export interface ShippingOption {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: number;
  custom_price?: number;
  discount?: number;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  custom_delivery_time?: number;
  custom_delivery_range?: {
    min: number;
    max: number;
  };
  packages: Array<{
    price: number;
    discount: number;
    format: string;
    weight: string;
    insurance_value: number;
    dimensions: {
      height: number;
      width: number;
      length: number;
    };
  }>;
}

export interface ShippingLabel {
  id: string;
  tracking_code: string;
  label_url: string;
  status: string;
  created_at: string;
}

export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingInfo {
  tracking_code: string;
  status: string;
  events: TrackingEvent[];
  estimated_delivery?: string;
}

export const shippingService = {
  /**
   * Calculate shipping options for a product
   */
  async calculateShipping(data: {
    from_zipcode: string;
    to_zipcode: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    product_value?: number;
  }): Promise<{ success: boolean; options: ShippingOption[] }> {
    const response = await api.post('/shipping/calculate', data);
    return response.data;
  },

  /**
   * Calculate shipping for a product by ID (uses seller's address as origin)
   */
  async calculateForProduct(
    productId: string,
    toZipcode: string
  ): Promise<{ success: boolean; services?: ShippingOption[]; cheapest?: ShippingOption; fastest?: ShippingOption; error?: string }> {
    try {
      const response = await api.post('/shipping/calculate', {
        product_id: productId,
        to_zipcode: toZipcode.replace(/\D/g, ''),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Erro ao calcular frete',
      };
    }
  },

  /**
   * Generate shipping label for an order
   */
  async generateLabel(data: {
    order_id: string;
    service_id: number;
    from: {
      name: string;
      phone: string;
      email: string;
      address: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
    };
    to: {
      name: string;
      phone: string;
      email: string;
      address: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
    };
    package: {
      weight: number;
      height: number;
      width: number;
      length: number;
    };
    products: Array<{
      name: string;
      quantity: number;
      value: number;
    }>;
  }): Promise<{ success: boolean; label: ShippingLabel }> {
    const response = await api.post('/shipping/label', data);
    return response.data;
  },

  /**
   * Track a shipment
   */
  async trackShipment(trackingCode: string): Promise<{ success: boolean; tracking: TrackingInfo }> {
    const response = await api.get(`/shipping/tracking/${trackingCode}`);
    return response.data;
  },

  /**
   * Get shipping label by order ID
   */
  async getLabelByOrder(orderId: string): Promise<{ success: boolean; label: ShippingLabel }> {
    const response = await api.get(`/shipping/label/${orderId}`);
    return response.data;
  },

  /**
   * Cancel a shipping label
   */
  async cancelLabel(labelId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/shipping/label/${labelId}`);
    return response.data;
  },

  /**
   * Get available shipping services
   */
  async getServices(): Promise<{ success: boolean; services: Array<{ id: number; name: string; company: string }> }> {
    const response = await api.get('/shipping/services');
    return response.data;
  },
};

export default shippingService;
