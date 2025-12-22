// Sistema de Design Completo - Apega Desapega
// Design moderno e profissional superior ao Enjoei

export const COLORS = {
  // Cores principais do MIV - Verde Sage
  primary: '#6B9080',
  primaryDark: '#527363',
  primaryLight: '#8FB5A5',
  primaryExtraLight: '#B5CFBD',

  // Cores de Acento - Roxo para CTAs
  purple: '#6B1E6F',
  purpleDark: '#4A1450',
  purpleLight: '#EDE5F5',

  // Premium/Gold
  premium: '#D4AF37',
  premiumDark: '#B8941F',
  premiumLight: '#F5E6C8',

  // Cores neutras (escala completa)
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Cores de estado
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds e superfícies
  background: '#F9FAFB',
  backgroundDark: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradientes
  gradientPrimary: ['#6B9080', '#4A6B5C'],
  gradientPremium: ['#D4AF37', '#B8941F'],
  gradientDark: ['#374151', '#1F2937'],

  // Bordas
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Social colors
  whatsapp: '#25D366',
  instagram: '#E4405F',
  facebook: '#1877F2',
};

export const TYPOGRAPHY = {
  // Fonte principal
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    heading: 'System',
  },

  // Tamanhos (conforme guia)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },

  // Pesos
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  // Aliases para compatibilidade
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const ANIMATIONS = {
  durations: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const LAYOUT = {
  screenPadding: SPACING.md,
  cardSpacing: SPACING.md,
  sectionSpacing: SPACING.lg,
  navHeight: 56,           // Header sticky conforme guia
  bottomNavHeight: 64,     // Bottom navigation conforme guia
  headerHeight: 56,        // Alias
  tabBarHeight: 64,        // Alias
  borderWidth: 1,
  borderWidthThick: 2,
  minTouchTarget: 44,      // Acessibilidade
};

// Informações da marca
export const BRAND = {
  name: 'apegadesapega',
  slogan: 'MODA SUSTENTÁVEL É NOSSO\nMODO DE MUDAR O MUNDO',
  city: 'Passo Fundo - RS',
  phone: '(54) 9.9609-6202',
  phoneFormatted: '+5554996096202',
  address: 'Av: Brasil Leste 185',
  instagram: '@apegadesapegars',
  email: 'contato@apegadesapega.com.br',
};

// Taxas e Comissões
export const FEES = {
  // Promocional: 0% para primeiras 50 vendedoras
  commissionRate: 0.00, // 0% de comissão (promocional para primeiros 50) - depois será 20%
  commissionPercentage: 0,
  premiumCommissionRate: 0.00, // 0% promocional - depois será 10%
  premiumCommissionPercentage: 0,
  // Taxas normais (após promoção)
  regularCommissionRate: 0.20, // 20% taxa normal para free
  regularPremiumCommissionRate: 0.10, // 10% taxa para premium
  minCommission: 0.00, // Sem comissão mínima durante promoção
  // Cashback
  cashbackRate: 0.02, // 2% de cashback para usuários free
  cashbackPercentage: 2,
  premiumCashbackRate: 0.005, // 0.5% de cashback para premium
  premiumCashbackPercentage: 0.5,
};

// Planos Premium
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    features: [
      'Até 5 anúncios ativos',
      'Fotos básicas',
      'Suporte por email',
      'Visualização de peças normais',
    ],
    limits: {
      maxItems: 5,
      maxPhotos: 3,
      prioritySupport: false,
      premiumAccess: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 49.90,
    priceYearly: 499.90,
    features: [
      'Anúncios ilimitados',
      'Até 10 fotos por anúncio',
      'Acesso a peças exclusivas',
      'Destaque nos resultados',
      'Suporte prioritário',
      'Badge Premium no perfil',
      'Estatísticas avançadas',
      'Taxa reduzida de apenas 1%',
    ],
    limits: {
      maxItems: -1, // ilimitado
      maxPhotos: 10,
      prioritySupport: true,
      premiumAccess: true,
      zeroFees: true,
      analytics: true,
      featured: true,
    },
    color: COLORS.premium,
  },
};

// Categorias de produtos - Apenas Feminino
export const CATEGORIES = [
  { id: 'all', name: 'Todas', icon: 'apps' },
  { id: 'vestidos', name: 'Vestidos', icon: 'woman' },
  { id: 'blusas', name: 'Blusas', icon: 'shirt' },
  { id: 'calcas', name: 'Calças', icon: 'pants' },
  { id: 'saias', name: 'Saias', icon: 'skirt' },
  { id: 'shorts', name: 'Shorts', icon: 'shorts' },
  { id: 'conjuntos', name: 'Conjuntos', icon: 'set' },
  { id: 'acessorios', name: 'Acessórios', icon: 'watch' },
  { id: 'calcados', name: 'Calçados', icon: 'shoe' },
  { id: 'bolsas', name: 'Bolsas', icon: 'bag' },
  { id: 'premium', name: 'Premium', icon: 'star' },
];

// Condições dos produtos
export const CONDITIONS = [
  { id: 'novo', label: 'Novo com etiqueta', color: COLORS.success },
  { id: 'seminovo', label: 'Seminovo', color: COLORS.primary },
  { id: 'usado', label: 'Usado', color: COLORS.warning },
];

// Tamanhos
export const SIZES = {
  feminino: ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44', '46'],
  masculino: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'],
  infantil: ['RN', '3M', '6M', '1A', '2A', '3A', '4A', '6A', '8A', '10A', '12A', '14A'],
  calcados: ['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
};

// Export default theme object
export default {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  layout: LAYOUT,
  brand: BRAND,
  subscriptionPlans: SUBSCRIPTION_PLANS,
  categories: CATEGORIES,
  conditions: CONDITIONS,
  sizes: SIZES,
};
