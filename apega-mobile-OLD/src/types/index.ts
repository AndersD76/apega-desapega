export interface Item {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  brand?: string;
  size?: string;
  condition?: 'novo' | 'semi-novo' | 'usado';
  imageUrl: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  city: string;
  sellerId: string;
  createdAt: Date;
}

export interface Seller {
  id: string;
  name: string;
  whatsapp: string;
  createdAt: Date;
}
