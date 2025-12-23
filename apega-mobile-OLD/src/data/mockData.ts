// Dados Mock para teste do fluxo completo do app
import { COLORS } from '../constants/theme';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isPremium: boolean;
  role: 'customer' | 'supplier' | 'admin';
  rating: number;
  totalSales: number;
  memberSince: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  size: string;
  brand: string;
  condition: 'novo' | 'seminovo' | 'usado';
  images: string[];
  isPremium: boolean;
  isExclusive: boolean;
  seller: User;
  createdAt: string;
  views: number;
  favorites: number;
  available: boolean;
  tags: string[];
}

// USUÁRIOS/CLIENTES MOCK
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(54) 99999-1111',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isPremium: true,
    role: 'customer',
    rating: 4.8,
    totalSales: 45,
    memberSince: '2023-01-15',
    address: {
      street: 'Rua das Flores, 123',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99010-000',
    },
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(54) 99999-2222',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isPremium: false,
    role: 'customer',
    rating: 4.5,
    totalSales: 12,
    memberSince: '2023-06-20',
    address: {
      street: 'Av. Brasil, 456',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99020-000',
    },
  },
  {
    id: '3',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@email.com',
    phone: '(54) 99999-3333',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isPremium: true,
    role: 'supplier',
    rating: 4.9,
    totalSales: 120,
    memberSince: '2022-03-10',
    address: {
      street: 'Rua Independência, 789',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99030-000',
    },
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao.oliveira@email.com',
    phone: '(54) 99999-4444',
    avatar: 'https://i.pravatar.cc/150?img=8',
    isPremium: false,
    role: 'customer',
    rating: 4.3,
    totalSales: 8,
    memberSince: '2023-09-05',
    address: {
      street: 'Rua 7 de Setembro, 321',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99040-000',
    },
  },
];

// FORNECEDORES (SUPPLIERS) MOCK
export const mockSuppliers: User[] = [
  {
    id: '5',
    name: 'Boutique Estilo',
    email: 'contato@boutiqueestilo.com',
    phone: '(54) 99999-5555',
    avatar: 'https://ui-avatars.com/api/?name=Boutique+Estilo&background=6B9080&color=fff',
    isPremium: true,
    role: 'supplier',
    rating: 4.9,
    totalSales: 350,
    memberSince: '2021-05-15',
    address: {
      street: 'Av. Brasil Leste, 185',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99050-000',
    },
  },
  {
    id: '6',
    name: 'Moda Sustentável PF',
    email: 'contato@modasustentavel.com',
    phone: '(54) 99999-6666',
    avatar: 'https://ui-avatars.com/api/?name=Moda+Sustentavel&background=D4AF37&color=000',
    isPremium: true,
    role: 'supplier',
    rating: 4.8,
    totalSales: 280,
    memberSince: '2021-08-20',
    address: {
      street: 'Rua Morom, 500',
      city: 'Passo Fundo',
      state: 'RS',
      zipCode: '99060-000',
    },
  },
];

// PEÇAS/ITENS MOCK - Vazio para usar API real
export const mockItems: Item[] = [];

/* Dados mockados removidos - agora usando API Neon PostgreSQL
  {
    id: '1',
    title: 'Vestido Longo Floral',
    description: 'Vestido longo maravilhoso com estampa floral delicada. Tecido leve e fluido, perfeito para eventos especiais. Usado apenas uma vez.',
    price: 389.90,
    originalPrice: 989.00,
    category: 'feminino',
    size: 'M',
    brand: 'Farm',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
    ],
    isPremium: true,
    isExclusive: true,
    seller: mockUsers[0],
    createdAt: '2024-01-05',
    views: 245,
    favorites: 18,
    available: true,
    tags: ['festa', 'casamento', 'verão'],
  },
  {
    id: '2',
    title: 'Bolsa Couro Legítimo',
    description: 'Bolsa de couro legítimo marrom, modelo clássico atemporal. Interior espaçoso com vários compartimentos. Estado impecável.',
    price: 649.00,
    originalPrice: 1890.00,
    category: 'bolsas',
    size: 'Único',
    brand: 'Arezzo',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    ],
    isPremium: true,
    isExclusive: true,
    seller: mockSuppliers[0],
    createdAt: '2024-01-10',
    views: 189,
    favorites: 32,
    available: true,
    tags: ['couro', 'clássico', 'trabalho'],
  },
  {
    id: '3',
    title: 'Blazer Alfaiataria Premium',
    description: 'Blazer de alfaiataria em tecido nobre. Corte perfeito, caimento impecável. Ideal para looks executivos sofisticados.',
    price: 449.00,
    originalPrice: 1290.00,
    category: 'feminino',
    size: 'P',
    brand: 'Zara',
    condition: 'novo',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    ],
    isPremium: true,
    isExclusive: true,
    seller: mockSuppliers[1],
    createdAt: '2024-01-12',
    views: 312,
    favorites: 45,
    available: true,
    tags: ['trabalho', 'executivo', 'elegante'],
  },

  // PEÇAS NORMAIS
  {
    id: '4',
    title: 'Calça Jeans Skinny',
    description: 'Calça jeans skinny azul escuro, cintura alta. Modelagem que valoriza o corpo. Marca renomada com qualidade garantida.',
    price: 189.90,
    originalPrice: 549.00,
    category: 'feminino',
    size: '38',
    brand: 'Levi\'s',
    condition: 'usado',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[1],
    createdAt: '2024-01-08',
    views: 156,
    favorites: 12,
    available: true,
    tags: ['casual', 'dia a dia'],
  },
  {
    id: '5',
    title: 'Tênis Esportivo',
    description: 'Tênis esportivo confortável para corrida e caminhada. Pouco usado, em ótimo estado. Palmilha anatômica.',
    price: 329.00,
    originalPrice: 799.00,
    category: 'calcados',
    size: '39',
    brand: 'Nike',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[2],
    createdAt: '2024-01-09',
    views: 98,
    favorites: 8,
    available: true,
    tags: ['esporte', 'corrida', 'conforto'],
  },
  {
    id: '6',
    title: 'Camisa Social Masculina',
    description: 'Camisa social slim fit, cor azul claro. Tecido de alta qualidade, fácil de passar. Perfeita para o ambiente corporativo.',
    price: 129.00,
    originalPrice: 349.00,
    category: 'masculino',
    size: 'M',
    brand: 'Richards',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[3],
    createdAt: '2024-01-11',
    views: 67,
    favorites: 5,
    available: true,
    tags: ['trabalho', 'formal'],
  },
  {
    id: '7',
    title: 'Vestido Infantil Princesa',
    description: 'Lindo vestido infantil rosa com tule e brilho. Perfeito para festas e aniversários. Usado apenas uma vez.',
    price: 149.00,
    originalPrice: 429.00,
    category: 'infantil',
    size: '6A',
    brand: 'Lilica Ripilica',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[0],
    createdAt: '2024-01-06',
    views: 134,
    favorites: 15,
    available: true,
    tags: ['festa', 'infantil', 'princesa'],
  },
  {
    id: '8',
    title: 'Jaqueta Jeans Premium',
    description: 'Jaqueta jeans oversized super estilosa. Lavagem especial, detalhes em rasgos. Tendência do momento!',
    price: 379.00,
    originalPrice: 899.00,
    category: 'feminino',
    size: 'M',
    brand: 'Calvin Klein',
    condition: 'novo',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    ],
    isPremium: true,
    isExclusive: false,
    seller: mockSuppliers[0],
    createdAt: '2024-01-13',
    views: 276,
    favorites: 28,
    available: true,
    tags: ['casual', 'tendência', 'oversized'],
  },
  {
    id: '9',
    title: 'Relógio Smartwatch',
    description: 'Smartwatch com diversas funções: monitor cardíaco, GPS, notificações. Pulseira extra inclusa. Seminovo em perfeito estado.',
    price: 899.00,
    originalPrice: 2499.00,
    category: 'acessorios',
    size: 'Único',
    brand: 'Samsung',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    ],
    isPremium: true,
    isExclusive: true,
    seller: mockSuppliers[1],
    createdAt: '2024-01-14',
    views: 412,
    favorites: 52,
    available: true,
    tags: ['tecnologia', 'esporte', 'saúde'],
  },
  {
    id: '10',
    title: 'Saia Midi Plissada',
    description: 'Saia midi plissada em tecido fluido. Cor nude versátil para diversas combinações. Estado de nova!',
    price: 149.00,
    originalPrice: 399.00,
    category: 'feminino',
    size: 'P',
    brand: 'C&A',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[1],
    createdAt: '2024-01-07',
    views: 89,
    favorites: 11,
    available: true,
    tags: ['elegante', 'trabalho', 'versátil'],
  },
  {
    id: '11',
    title: 'Sandália Salto Alto',
    description: 'Sandália elegante em couro sintético com salto alto fino. Perfeita para festas e eventos especiais. Número 37.',
    price: 159.00,
    originalPrice: 389.00,
    category: 'calcados',
    size: '37',
    brand: 'Schutz',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[2],
    createdAt: '2024-01-15',
    views: 145,
    favorites: 22,
    available: true,
    tags: ['festa', 'elegante', 'salto'],
  },
  {
    id: '12',
    title: 'Óculos de Sol Ray-Ban',
    description: 'Óculos de sol Ray-Ban Aviador original. Proteção UV400, lentes polarizadas. Com estojo e certificado de autenticidade.',
    price: 429.00,
    originalPrice: 899.00,
    category: 'acessorios',
    size: 'Único',
    brand: 'Ray-Ban',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    ],
    isPremium: true,
    isExclusive: false,
    seller: mockSuppliers[0],
    createdAt: '2024-01-16',
    views: 298,
    favorites: 41,
    available: true,
    tags: ['acessório', 'sol', 'premium'],
  },
  {
    id: '13',
    title: 'Conjunto Moletom',
    description: 'Conjunto de moletom completo: blusa com capuz e calça. Super confortável para o dia a dia. Tecido macio e quentinho.',
    price: 189.00,
    originalPrice: 459.00,
    category: 'feminino',
    size: 'M',
    brand: 'Adidas',
    condition: 'novo',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[0],
    createdAt: '2024-01-17',
    views: 187,
    favorites: 26,
    available: true,
    tags: ['casual', 'conforto', 'inverno'],
  },
  {
    id: '14',
    title: 'Brincos Dourados',
    description: 'Brincos argola dourados grandes. Acabamento brilhante, hipoalergênicos. Tendência fashion do momento!',
    price: 79.00,
    originalPrice: 189.00,
    category: 'acessorios',
    size: 'Único',
    brand: 'Vivara',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[1],
    createdAt: '2024-01-18',
    views: 134,
    favorites: 18,
    available: true,
    tags: ['joia', 'acessório', 'festa'],
  },
  {
    id: '15',
    title: 'Macaquinho Linho',
    description: 'Macaquinho leve em linho natural. Perfeito para o verão, super fresquinho e confortável. Cor off-white.',
    price: 169.00,
    originalPrice: 429.00,
    category: 'feminino',
    size: 'G',
    brand: 'Animale',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockSuppliers[1],
    createdAt: '2024-01-19',
    views: 203,
    favorites: 29,
    available: true,
    tags: ['verão', 'linho', 'conforto'],
  },
  {
    id: '16',
    title: 'Botas Couro Marrom',
    description: 'Botas de cano médio em couro legítimo marrom. Estilo country moderno, super versátil. Tamanho 38.',
    price: 349.00,
    originalPrice: 789.00,
    category: 'calcados',
    size: '38',
    brand: 'Santa Lolla',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400',
    ],
    isPremium: true,
    isExclusive: false,
    seller: mockSuppliers[0],
    createdAt: '2024-01-20',
    views: 256,
    favorites: 38,
    available: true,
    tags: ['bota', 'couro', 'inverno'],
  },
  {
    id: '17',
    title: 'Colar Prata',
    description: 'Colar delicado em prata 925 com pingente de coração. Elegante e atemporal. Presente perfeito!',
    price: 119.00,
    originalPrice: 299.00,
    category: 'acessorios',
    size: 'Único',
    brand: 'Pandora',
    condition: 'novo',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[2],
    createdAt: '2024-01-21',
    views: 167,
    favorites: 24,
    available: true,
    tags: ['joia', 'prata', 'delicado'],
  },
  {
    id: '18',
    title: 'Kimono Estampado',
    description: 'Kimono longo com estampa floral vibrante. Peça coringa para compor looks incríveis. Tecido fluido e leve.',
    price: 139.00,
    originalPrice: 349.00,
    category: 'feminino',
    size: 'Único',
    brand: 'Mixed',
    condition: 'novo',
    images: [
      'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[0],
    createdAt: '2024-01-22',
    views: 192,
    favorites: 31,
    available: true,
    tags: ['estampa', 'verão', 'boho'],
  },
  {
    id: '19',
    title: 'Mochila Couro Preta',
    description: 'Mochila urbana em couro sintético de alta qualidade. Diversos compartimentos, ideal para o dia a dia.',
    price: 229.00,
    originalPrice: 549.00,
    category: 'bolsas',
    size: 'Único',
    brand: 'Colcci',
    condition: 'seminovo',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockSuppliers[1],
    createdAt: '2024-01-23',
    views: 278,
    favorites: 43,
    available: true,
    tags: ['mochila', 'urbano', 'prático'],
  },
  {
    id: '20',
    title: 'Shorts Jeans Destroyed',
    description: 'Shorts jeans com efeito destroyed moderno. Cintura alta, super confortável e estiloso. Tam 40.',
    price: 99.00,
    originalPrice: 259.00,
    category: 'feminino',
    size: '40',
    brand: 'Zara',
    condition: 'usado',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
    ],
    isPremium: false,
    isExclusive: false,
    seller: mockUsers[1],
    createdAt: '2024-01-24',
    views: 143,
    favorites: 19,
    available: true,
    tags: ['jeans', 'verão', 'casual'],
  },
*/

// Função para buscar itens com filtros
export const getFilteredItems = (filters?: {
  category?: string;
  isPremium?: boolean;
  priceRange?: { min: number; max: number };
  condition?: string;
  search?: string;
}) => {
  let filtered = [...mockItems];

  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter(item => item.category === filters.category);
  }

  if (filters?.isPremium !== undefined) {
    filtered = filtered.filter(item => item.isPremium === filters.isPremium);
  }

  if (filters?.priceRange) {
    filtered = filtered.filter(
      item =>
        item.price >= filters.priceRange!.min &&
        item.price <= filters.priceRange!.max
    );
  }

  if (filters?.condition) {
    filtered = filtered.filter(item => item.condition === filters.condition);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
};

// Função para buscar item por ID
export const getItemById = (id: string) => {
  return mockItems.find(item => item.id === id);
};

// Função para buscar usuário por ID
export const getUserById = (id: string) => {
  const allUsers = [...mockUsers, ...mockSuppliers];
  return allUsers.find(user => user.id === id);
};

// Estatísticas do app
export const appStats = {
  totalItems: mockItems.length,
  premiumItems: mockItems.filter(i => i.isPremium).length,
  totalUsers: mockUsers.length + mockSuppliers.length,
  premiumUsers: [...mockUsers, ...mockSuppliers].filter(u => u.isPremium).length,
  totalSales: 1250,
  averageRating: 4.7,
};
