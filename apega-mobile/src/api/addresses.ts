import api from './config';

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  is_default: boolean;
  created_at: string;
}

export const addressesService = {
  async getAddresses(): Promise<{ success: boolean; addresses: Address[] }> {
    const response = await api.get('/addresses');
    return response.data;
  },

  async getDefaultAddress(): Promise<{ success: boolean; address: Address | null }> {
    try {
      const response = await api.get('/addresses');
      if (response.data.success && response.data.addresses) {
        const defaultAddr = response.data.addresses.find((a: Address) => a.is_default);
        return { success: true, address: defaultAddr || response.data.addresses[0] || null };
      }
      return { success: false, address: null };
    } catch (error) {
      return { success: false, address: null };
    }
  },

  async getAddress(id: string): Promise<{ success: boolean; address: Address }> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(data: Omit<Address, 'id' | 'user_id' | 'created_at'>): Promise<{ success: boolean; address: Address }> {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  async updateAddress(id: string, data: Partial<Address>): Promise<{ success: boolean; address: Address }> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  async setDefault(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },

  async searchByCep(cep: string): Promise<{
    success: boolean;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }> {
    const response = await api.get(`/addresses/cep/${cep}`);
    return response.data;
  },
};

export default addressesService;
