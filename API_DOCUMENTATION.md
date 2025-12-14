# API Documentation - Apega Desapega

## Base URL
```
Production: https://api.apegadesapega.com.br/v1
Staging: https://staging-api.apegadesapega.com.br/v1
Development: http://localhost:3000/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

---

## 1. AUTENTICAÇÃO

### 1.1 Register
**POST** `/auth/register`

Create a new user account.

**Request:**
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "senha123",
  "phone": "(11) 98765-4321",
  "acceptTerms": true
}
```

**Response (201):**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "(11) 98765-4321",
    "avatar": null,
    "createdAt": "2025-11-06T10:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
}
```

**Errors:**
- 400 - Email já cadastrado
- 422 - Senha fraca (min 8 caracteres)

---

### 1.2 Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "maria@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg",
    "rating": 4.9,
    "reviewCount": 127
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  }
}
```

**Errors:**
- 401 - Credenciais inválidas
- 403 - Conta bloqueada/suspensa

---

### 1.3 Refresh Token
**POST** `/auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 3600
}
```

---

### 1.4 Forgot Password
**POST** `/auth/forgot-password`

**Request:**
```json
{
  "email": "maria@email.com"
}
```

**Response (200):**
```json
{
  "message": "e-mail de recuperação enviado",
  "expiresIn": 3600
}
```

---

### 1.5 Reset Password
**POST** `/auth/reset-password`

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "nova_senha123"
}
```

**Response (200):**
```json
{
  "message": "senha alterada com sucesso"
}
```

---

### 1.6 Logout
**POST** `/auth/logout`

**Headers:** Authorization required

**Response (200):**
```json
{
  "message": "logout realizado com sucesso"
}
```

---

## 2. USUÁRIOS

### 2.1 Get Current User
**GET** `/users/me`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "usr_abc123",
  "name": "Maria Silva",
  "username": "maria-silva",
  "email": "maria@email.com",
  "phone": "(11) 98765-4321",
  "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg",
  "rating": 4.9,
  "reviewCount": 127,
  "location": {
    "city": "Passo Fundo",
    "state": "RS"
  },
  "sellerStats": {
    "productsSold": 156,
    "totalRevenue": 45000.50,
    "activeProducts": 342,
    "rating": 4.9,
    "responseTime": "2h",
    "responseRate": 98
  },
  "buyerStats": {
    "orderCount": 12,
    "totalSpent": 1230.00
  },
  "preferences": {
    "notifications": {
      "push": true,
      "email": false,
      "sms": false
    },
    "privacy": {
      "showOnline": true,
      "showLastSeen": false
    }
  },
  "wallet": {
    "balance": 156.50,
    "cashback": 23.40
  },
  "createdAt": "2023-06-15T10:00:00Z",
  "memberSince": "2023-06-15"
}
```

---

### 2.2 Update Profile
**PATCH** `/users/me`

**Headers:** Authorization required

**Request:**
```json
{
  "name": "Maria Silva Santos",
  "phone": "(11) 91234-5678",
  "location": {
    "city": "Porto Alegre",
    "state": "RS"
  }
}
```

**Response (200):**
```json
{
  "id": "usr_abc123",
  "name": "Maria Silva Santos",
  "phone": "(11) 91234-5678",
  "location": {
    "city": "Porto Alegre",
    "state": "RS"
  },
  "updatedAt": "2025-11-06T11:00:00Z"
}
```

---

### 2.3 Update Avatar
**POST** `/users/me/avatar`

**Headers:** Authorization required, Content-Type: multipart/form-data

**Request:**
```
FormData:
  avatar: [file]
```

**Response (200):**
```json
{
  "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg"
}
```

**Errors:**
- 400 - Formato inválido (jpg/png)
- 413 - Arquivo muito grande (max 5MB)

---

### 2.4 Change Password
**POST** `/users/me/change-password`

**Headers:** Authorization required

**Request:**
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha123"
}
```

**Response (200):**
```json
{
  "message": "senha alterada com sucesso"
}
```

**Errors:**
- 401 - Senha atual incorreta
- 422 - Nova senha muito fraca

---

### 2.5 Get User by ID
**GET** `/users/:id`

Get public user profile (seller page).

**Response (200):**
```json
{
  "id": "usr_abc123",
  "name": "Maria Silva",
  "username": "maria-silva",
  "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg",
  "rating": 4.9,
  "reviewCount": 127,
  "location": {
    "city": "Passo Fundo",
    "state": "RS"
  },
  "memberSince": "2023-06-15",
  "stats": {
    "productsSold": 156,
    "activeProducts": 342,
    "responseTime": "2h",
    "responseRate": 98
  },
  "featured": true
}
```

---

### 2.6 Get User Products
**GET** `/users/:id/products`

**Query Params:**
- page=1
- limit=20
- sort=newest|price_asc|price_desc

**Response (200):**
```json
{
  "products": [...],
  "pagination": {...}
}
```

---

### 2.7 Get User Reviews
**GET** `/users/:id/reviews`

**Query Params:**
- page=1
- limit=20

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "rev_abc123",
      "rating": 5,
      "comment": "excelente vendedora! produto chegou rápido",
      "reviewer": {
        "id": "usr_def456",
        "name": "Ana Costa",
        "avatar": "https://..."
      },
      "order": {
        "id": "ord_abc123",
        "productTitle": "Vestido floral midi"
      },
      "createdAt": "2025-11-05T14:00:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.9,
    "totalReviews": 127,
    "distribution": {
      "5": 98,
      "4": 23,
      "3": 4,
      "2": 1,
      "1": 1
    }
  },
  "pagination": {...}
}
```

---

## 3. PRODUTOS

### 3.1 List Products (Feed)
**GET** `/products`

**Query Params:**
- page=1
- limit=20
- category=vestidos
- subcategory=midi
- size=M
- condition=usado
- min_price=0
- max_price=200
- brand=farm
- color=rosa
- sort=relevance|newest|price_asc|price_desc
- location_city=passo-fundo
- location_state=RS
- accepts_offers=true
- first_purchase_discount=true
- featured_sellers=true
- search=floral

**Response (200):**
```json
{
  "products": [
    {
      "id": "prd_abc123",
      "title": "Vestido floral midi",
      "description": "Vestido lindo e delicado...",
      "price": 65.00,
      "original_price": 75.00,
      "discount_percentage": 13,
      "images": [
        {
          "url": "https://cdn.apega.com/products/prd_abc123_1.jpg",
          "thumb": "https://cdn.apega.com/products/prd_abc123_1_thumb.jpg",
          "order": 1
        }
      ],
      "category": {
        "id": "cat_vestidos",
        "name": "Vestidos",
        "slug": "vestidos"
      },
      "subcategory": {
        "id": "subcat_midi",
        "name": "Midi",
        "slug": "midi"
      },
      "brand": "Farm",
      "size": "M",
      "color": "rosa",
      "condition": "usado",
      "seller": {
        "id": "usr_abc123",
        "name": "Maria Silva",
        "username": "maria-silva",
        "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg",
        "rating": 4.9,
        "total_reviews": 127,
        "featured": true,
        "response_time": "2h"
      },
      "location": {
        "city": "Passo Fundo",
        "state": "RS"
      },
      "stats": {
        "views": 234,
        "favorites": 15
      },
      "shipping": {
        "free_shipping": false,
        "estimated_days_min": 5,
        "estimated_days_max": 7
      },
      "created_at": "2025-11-01T10:00:00Z",
      "is_favorited": false,
      "accepts_offers": true,
      "first_purchase_discount": true,
      "status": "active"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 45,
    "total_items": 890,
    "per_page": 20,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "category": "vestidos",
    "size": "M",
    "price_range": [0, 200]
  }
}
```

---

### 3.2 Get Product by ID
**GET** `/products/:id`

**Headers (optional):** Authorization

**Response (200):**
```json
{
  "id": "prd_abc123",
  "title": "Vestido floral midi",
  "description": "Vestido midi floral lindo, super fresquinho. Usado 2x. Medidas: busto 90cm, cintura 70cm, comprimento 110cm.",
  "price": 65.00,
  "original_price": 75.00,
  "discount_percentage": 13,
  "first_purchase_discount": true,
  "cashback_amount": 11.25,
  "cashback_percentage": 15,
  "images": [
    {
      "id": "img_1",
      "url": "https://cdn.apega.com/products/prd_abc123_1.jpg",
      "thumb": "https://cdn.apega.com/products/prd_abc123_1_thumb.jpg",
      "order": 1
    },
    {
      "id": "img_2",
      "url": "https://cdn.apega.com/products/prd_abc123_2.jpg",
      "thumb": "https://cdn.apega.com/products/prd_abc123_2_thumb.jpg",
      "order": 2
    }
  ],
  "category": {
    "id": "cat_vestidos",
    "name": "Vestidos",
    "slug": "vestidos"
  },
  "subcategory": {
    "id": "subcat_midi",
    "name": "Midi",
    "slug": "midi"
  },
  "brand": "Farm",
  "size": "M",
  "color": "rosa",
  "condition": "usado",
  "composition": "algodão",
  "measurements": {
    "bust": "90cm",
    "waist": "70cm",
    "length": "110cm"
  },
  "accepts_offers": true,
  "min_offer_price": 55.00,
  "seller": {
    "id": "usr_abc123",
    "name": "Maria Silva",
    "username": "maria-silva",
    "avatar": "https://cdn.apega.com/avatars/usr_abc123.jpg",
    "rating": 4.9,
    "total_reviews": 127,
    "total_sales": 156,
    "response_time": "2h",
    "response_rate": 98,
    "featured": true,
    "seller_since": "2023-01-15T00:00:00Z"
  },
  "location": {
    "city": "Passo Fundo",
    "state": "RS",
    "state_code": "RS"
  },
  "shipping": {
    "free_shipping": false,
    "free_shipping_threshold": 150.00,
    "methods": [
      {
        "name": "PAC",
        "price": 15.00,
        "estimated_days_min": 5,
        "estimated_days_max": 7
      },
      {
        "name": "SEDEX",
        "price": 25.00,
        "estimated_days_min": 2,
        "estimated_days_max": 3
      }
    ]
  },
  "stats": {
    "views": 234,
    "favorites": 15,
    "questions": 3
  },
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-01T10:00:00Z",
  "is_favorited": false,
  "status": "active",
  "share_url": "https://apega.me/p/vestido-floral-midi-prd_abc123"
}
```

**Errors:**
- 404 - Produto não encontrado
- 410 - Produto removido/vendido

---

### 3.3 Create Product
**POST** `/products`

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Vestido floral midi",
  "description": "Vestido midi floral lindo, super fresquinho. Usado 2x. Medidas: busto 90cm, cintura 70cm, comprimento 110cm.",
  "price": 65.00,
  "original_price": 75.00,
  "category_id": "cat_vestidos",
  "subcategory_id": "subcat_midi",
  "brand": "Farm",
  "size": "M",
  "color": "rosa",
  "condition": "usado",
  "composition": "algodão",
  "measurements": {
    "bust": "90cm",
    "waist": "70cm",
    "length": "110cm"
  },
  "accepts_offers": true,
  "min_offer_price": 55.00,
  "images": [
    "temp_img_abc123.jpg",
    "temp_img_def456.jpg"
  ]
}
```

**Response (201):**
```json
{
  "id": "prd_def456",
  "title": "Vestido floral midi",
  "price": 65.00,
  "status": "active",
  "images": [
    {
      "url": "https://cdn.apega.com/products/prd_def456_1.jpg",
      "order": 1
    },
    {
      "url": "https://cdn.apega.com/products/prd_def456_2.jpg",
      "order": 2
    }
  ],
  "share_url": "https://apega.me/p/vestido-floral-midi-prd_def456",
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 400 - Dados inválidos
- 413 - Muitas imagens (max 8)
- 422 - Preço inválido (min R$ 5,00)

**Validações:**
- title: 10-60 caracteres
- description: 50-500 caracteres
- price: min R$ 5,00
- images: mín 1, máx 8
- category_id: obrigatório
- size: obrigatório
- condition: obrigatório

---

### 3.4 Update Product
**PUT** `/products/:id`

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Vestido floral midi - ATUALIZADO",
  "price": 60.00,
  "description": "Nova descrição..."
}
```

**Response (200):**
```json
{
  "id": "prd_abc123",
  "title": "Vestido floral midi - ATUALIZADO",
  "price": 60.00,
  "updated_at": "2025-11-06T10:30:00Z"
}
```

**Errors:**
- 403 - Não é dono do produto
- 409 - Produto já vendido

---

### 3.5 Delete Product
**DELETE** `/products/:id`

**Headers:** Authorization required

**Response (204):** No Content

**Errors:**
- 403 - Não é dono do produto
- 409 - Produto com vendas/ofertas ativas

---

### 3.6 Upload Images
**POST** `/products/:id/images`

**Headers:** Authorization required, Content-Type: multipart/form-data

**Request:**
```
FormData:
  images: [file1, file2, file3]
```

**Response (200):**
```json
{
  "images": [
    {
      "id": "img_4",
      "url": "https://cdn.apega.com/products/prd_abc123_4.jpg",
      "thumb": "https://cdn.apega.com/products/prd_abc123_4_thumb.jpg",
      "order": 4
    }
  ],
  "total_images": 5
}
```

**Errors:**
- 400 - Formato inválido (jpg/png)
- 413 - Arquivo muito grande (max 5MB cada)
- 422 - Limite excedido (max 8 total)

---

### 3.7 Delete Image
**DELETE** `/products/:id/images/:imageId`

**Headers:** Authorization required

**Response (204):** No Content

**Errors:**
- 400 - Última imagem (min 1)
- 403 - Não é dono do produto

---

### 3.8 Reorder Images
**PUT** `/products/:id/images/reorder`

**Headers:** Authorization required

**Request:**
```json
{
  "order": ["img_3", "img_1", "img_2"]
}
```

**Response (200):**
```json
{
  "images": [
    {"id": "img_3", "order": 1},
    {"id": "img_1", "order": 2},
    {"id": "img_2", "order": 3}
  ]
}
```

---

### 3.9 Add to Favorites
**POST** `/products/:id/favorite`

**Headers:** Authorization required

**Response (200):**
```json
{
  "favorited": true,
  "favorites_count": 16
}
```

**Errors:**
- 409 - Já está nos favoritos

---

### 3.10 Remove from Favorites
**DELETE** `/products/:id/favorite`

**Headers:** Authorization required

**Response (200):**
```json
{
  "favorited": false,
  "favorites_count": 15
}
```

---

### 3.11 Get Similar Products
**GET** `/products/:id/similar`

**Query Params:**
- limit=10

**Response (200):**
```json
{
  "products": [...]
}
```

---

### 3.12 Get Product Questions
**GET** `/products/:id/questions`

**Query Params:**
- page=1
- limit=20

**Response (200):**
```json
{
  "questions": [
    {
      "id": "qst_abc123",
      "question": "Qual a medida do busto?",
      "answer": "90cm de busto",
      "user": {
        "id": "usr_def456",
        "name": "Ana Paula",
        "avatar": "https://..."
      },
      "created_at": "2025-11-05T14:30:00Z",
      "answered_at": "2025-11-05T15:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 3.13 Ask Question
**POST** `/products/:id/questions`

**Headers:** Authorization required

**Request:**
```json
{
  "question": "Aceita troca?"
}
```

**Response (201):**
```json
{
  "id": "qst_def456",
  "question": "Aceita troca?",
  "answer": null,
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 422 - Pergunta muito curta (min 10 chars)
- 429 - Limite de perguntas (max 3/dia por produto)

**Validações:**
- question: 10-200 caracteres
- Não pode perguntar no próprio produto

---

### 3.14 Answer Question (Seller)
**PUT** `/products/questions/:id/answer`

**Headers:** Authorization required

**Request:**
```json
{
  "answer": "Não aceito trocas, apenas venda"
}
```

**Response (200):**
```json
{
  "id": "qst_def456",
  "question": "Aceita troca?",
  "answer": "Não aceito trocas, apenas venda",
  "answered_at": "2025-11-06T11:00:00Z"
}
```

**Errors:**
- 403 - Não é dono do produto
- 409 - Já foi respondida

---

### 3.15 Register View
**POST** `/products/:id/views`

**Request:**
```json
{
  "source": "feed|search|direct|share"
}
```

**Response (204):** No Content

**Note:** Não requer autenticação, rate limit por IP

---

### 3.16 Get My Products (Seller)
**GET** `/products/me`

**Headers:** Authorization required

**Query Params:**
- status=active|sold|inactive
- page=1
- limit=20
- sort=newest|oldest|price_asc|price_desc

**Response (200):**
```json
{
  "products": [
    {
      "id": "prd_abc123",
      "title": "Vestido floral midi",
      "price": 65.00,
      "images": [...],
      "status": "active",
      "stats": {
        "views": 234,
        "favorites": 15,
        "questions": 3,
        "offers": 2
      },
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "total_active": 342,
    "total_sold": 156,
    "total_inactive": 12
  }
}
```

---

## 4. CATEGORIAS E MARCAS

### 4.1 List Categories
**GET** `/categories`

**Response (200):**
```json
{
  "categories": [
    {
      "id": "cat_vestidos",
      "name": "Vestidos",
      "slug": "vestidos",
      "icon": "👗",
      "products_count": 1234,
      "subcategories": [
        {
          "id": "subcat_midi",
          "name": "Midi",
          "slug": "midi",
          "products_count": 456
        }
      ]
    }
  ]
}
```

---

### 4.2 Get Category Details
**GET** `/categories/:slug`

**Response (200):**
```json
{
  "id": "cat_vestidos",
  "name": "Vestidos",
  "slug": "vestidos",
  "icon": "👗",
  "description": "Encontre vestidos únicos de todos os estilos",
  "products_count": 1234,
  "subcategories": [...],
  "popular_brands": [
    {
      "name": "Farm",
      "products_count": 234
    }
  ],
  "popular_sizes": [
    {
      "size": "M",
      "products_count": 456
    }
  ]
}
```

---

### 4.3 List Brands
**GET** `/brands`

**Query Params:**
- search=farm
- limit=50

**Response (200):**
```json
{
  "brands": [
    {
      "id": "brnd_farm",
      "name": "Farm",
      "slug": "farm",
      "logo": "https://cdn.apega.com/brands/farm.jpg",
      "products_count": 567,
      "featured": true
    }
  ]
}
```

---

### 4.4 Get Brand Details
**GET** `/brands/:slug`

**Response (200):**
```json
{
  "id": "brnd_farm",
  "name": "Farm",
  "slug": "farm",
  "logo": "https://cdn.apega.com/brands/farm.jpg",
  "description": "Marca brasileira de moda feminina",
  "products_count": 567,
  "featured": true,
  "popular_categories": [
    {
      "category": "Vestidos",
      "products_count": 234
    }
  ]
}
```

---

### 4.5 List Sizes
**GET** `/sizes`

**Response (200):**
```json
{
  "sizes": [
    {"value": "PP", "label": "PP", "order": 1},
    {"value": "P", "label": "P", "order": 2},
    {"value": "M", "label": "M", "order": 3},
    {"value": "G", "label": "G", "order": 4},
    {"value": "GG", "label": "GG", "order": 5},
    {"value": "XG", "label": "XG", "order": 6},
    {"value": "unico", "label": "Único", "order": 7}
  ]
}
```

---

### 4.6 List Colors
**GET** `/colors`

**Response (200):**
```json
{
  "colors": [
    {"value": "branco", "label": "Branco", "hex": "#FFFFFF"},
    {"value": "preto", "label": "Preto", "hex": "#000000"},
    {"value": "rosa", "label": "Rosa", "hex": "#FFC0CB"}
  ]
}
```

---

### 4.7 List Conditions
**GET** `/conditions`

**Response (200):**
```json
{
  "conditions": [
    {
      "value": "novo",
      "label": "Novo",
      "description": "Produto nunca usado, com etiqueta"
    },
    {
      "value": "seminovo",
      "label": "Seminovo",
      "description": "Produto usado poucas vezes, em ótimo estado"
    },
    {
      "value": "usado",
      "label": "Usado",
      "description": "Produto usado, com sinais de uso"
    }
  ]
}
```

---

## 5. CARRINHO

### 5.1 Get Cart
**GET** `/cart`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "cart_abc123",
  "items": [
    {
      "id": "cart_item_1",
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "price": 65.00,
        "original_price": 75.00,
        "image": "https://cdn.apega.com/products/prd_abc123_1_thumb.jpg",
        "size": "M",
        "condition": "usado",
        "seller": {
          "id": "usr_abc123",
          "name": "Maria Silva"
        },
        "status": "available"
      },
      "quantity": 1,
      "subtotal": 65.00,
      "added_at": "2025-11-06T10:00:00Z"
    },
    {
      "id": "cart_item_3",
      "product": {
        "id": "prd_ghi789",
        "title": "Bolsa tiracolo caramelo",
        "price": 80.00,
        "status": "unavailable"
      },
      "unavailable_reason": "sold"
    }
  ],
  "summary": {
    "subtotal": 190.00,
    "discount": 19.00,
    "discount_first_purchase": true,
    "discount_code": null,
    "shipping": 15.00,
    "total": 186.00,
    "cashback": 18.60,
    "cashback_percentage": 10,
    "installments": {
      "max_installments": 12,
      "installment_amount": 15.50,
      "interest_free": true
    }
  },
  "sellers_count": 3,
  "items_count": 3,
  "available_items_count": 2,
  "unavailable_items_count": 1,
  "free_shipping_threshold": 150.00,
  "free_shipping_progress": 0.76,
  "updated_at": "2025-11-06T10:00:00Z"
}
```

---

### 5.2 Add to Cart
**POST** `/cart/items`

**Headers:** Authorization required

**Request:**
```json
{
  "product_id": "prd_abc123"
}
```

**Response (201):**
```json
{
  "id": "cart_item_4",
  "product_id": "prd_abc123",
  "quantity": 1,
  "added_at": "2025-11-06T10:30:00Z",
  "cart": {
    "items_count": 4,
    "total": 251.00
  }
}
```

**Errors:**
- 404 - Produto não encontrado
- 409 - Produto já está no carrinho
- 410 - Produto não disponível (vendido)
- 422 - Não pode adicionar próprio produto

---

### 5.3 Remove from Cart
**DELETE** `/cart/items/:itemId`

**Headers:** Authorization required

**Response (204):** No Content

---

### 5.4 Apply Coupon
**POST** `/cart/coupon`

**Headers:** Authorization required

**Request:**
```json
{
  "code": "DESFRUTAR"
}
```

**Response (200):**
```json
{
  "coupon": {
    "code": "DESFRUTAR",
    "discount_type": "percentage",
    "discount_value": 30,
    "discount_amount": 57.00,
    "valid_until": "2025-12-31T23:59:59Z"
  },
  "summary": {
    "subtotal": 190.00,
    "discount": 57.00,
    "shipping": 15.00,
    "total": 148.00,
    "cashback": 14.80
  }
}
```

**Errors:**
- 404 - Cupom não encontrado
- 410 - Cupom expirado
- 422 - Cupom não aplicável
- 409 - Cupom já aplicado

---

### 5.5 Remove Coupon
**DELETE** `/cart/coupon`

**Headers:** Authorization required

**Response (200):**
```json
{
  "summary": {
    "subtotal": 190.00,
    "discount": 19.00,
    "shipping": 15.00,
    "total": 186.00
  }
}
```

---

### 5.6 Clear Cart
**DELETE** `/cart`

**Headers:** Authorization required

**Response (204):** No Content

---

### 5.7 Calculate Shipping
**GET** `/cart/shipping`

**Headers:** Authorization required

**Query Params:**
- zip_code=99010000

**Response (200):**
```json
{
  "zip_code": "99010000",
  "methods": [
    {
      "name": "PAC",
      "price": 15.00,
      "estimated_days_min": 5,
      "estimated_days_max": 7,
      "available": true
    },
    {
      "name": "SEDEX",
      "price": 25.00,
      "estimated_days_min": 2,
      "estimated_days_max": 3,
      "available": true
    }
  ],
  "free_shipping": false,
  "free_shipping_threshold": 150.00,
  "missing_for_free_shipping": 0
}
```

**Errors:**
- 400 - CEP inválido
- 404 - CEP não encontrado

---

## 6. ENDEREÇOS

### 6.1 List Addresses
**GET** `/addresses`

**Headers:** Authorization required

**Response (200):**
```json
{
  "addresses": [
    {
      "id": "addr_abc123",
      "nickname": "Casa",
      "recipient_name": "Maria Silva",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "Passo Fundo",
      "state": "RS",
      "state_code": "RS",
      "zip_code": "99010-000",
      "is_default": true,
      "created_at": "2023-01-15T10:00:00Z",
      "updated_at": "2023-01-15T10:00:00Z"
    }
  ]
}
```

---

### 6.2 Get Address by ID
**GET** `/addresses/:id`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "addr_abc123",
  "nickname": "Casa",
  "recipient_name": "Maria Silva",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Centro",
  "city": "Passo Fundo",
  "state": "RS",
  "state_code": "RS",
  "zip_code": "99010-000",
  "is_default": true,
  "created_at": "2023-01-15T10:00:00Z"
}
```

**Errors:**
- 404 - Endereço não encontrado

---

### 6.3 Create Address
**POST** `/addresses`

**Headers:** Authorization required

**Request:**
```json
{
  "nickname": "Trabalho",
  "recipient_name": "Maria Silva",
  "street": "Av Brasil Leste",
  "number": "185",
  "complement": "Sala 10",
  "neighborhood": "Centro",
  "city": "Passo Fundo",
  "state": "RS",
  "zip_code": "99010-100",
  "is_default": false
}
```

**Response (201):**
```json
{
  "id": "addr_def456",
  "nickname": "Trabalho",
  "zip_code": "99010-100",
  "is_default": false,
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 422 - Dados inválidos (CEP, campos obrigatórios)
- 429 - Limite de endereços (max 5)

**Validações:**
- recipient_name: 3-100 chars
- zip_code: formato 00000-000

---

### 6.4 Update Address
**PUT** `/addresses/:id`

**Headers:** Authorization required

**Request:**
```json
{
  "complement": "Sala 11",
  "is_default": true
}
```

**Response (200):**
```json
{
  "id": "addr_def456",
  "complement": "Sala 11",
  "is_default": true,
  "updated_at": "2025-11-06T10:30:00Z"
}
```

**Errors:**
- 404 - Endereço não encontrado
- 403 - Não é seu endereço

---

### 6.5 Delete Address
**DELETE** `/addresses/:id`

**Headers:** Authorization required

**Response (204):** No Content

**Errors:**
- 404 - Endereço não encontrado
- 409 - Endereço padrão (defina outro antes)
- 409 - Endereço em uso em pedido ativo

---

### 6.6 Lookup Address by ZIP Code
**GET** `/addresses/zip-code/:zipCode`

**Response (200):**
```json
{
  "zip_code": "99010-000",
  "street": "Rua das Flores",
  "neighborhood": "Centro",
  "city": "Passo Fundo",
  "state": "Rio Grande do Sul",
  "state_code": "RS"
}
```

**Errors:**
- 400 - CEP inválido
- 404 - CEP não encontrado

**Note:** Não requer autenticação

---

## 7. PEDIDOS (Compradora)

### 7.1 List Orders
**GET** `/orders`

**Headers:** Authorization required

**Query Params:**
- status=pending|paid|shipped|delivered|cancelled
- page=1
- limit=20
- sort=newest|oldest

**Response (200):**
```json
{
  "orders": [
    {
      "id": "ord_abc123",
      "order_number": "1234",
      "status": "shipped",
      "status_label": "Em trânsito",
      "total": 186.00,
      "items_count": 3,
      "seller": {
        "id": "usr_abc123",
        "name": "Maria Silva",
        "avatar": "https://..."
      },
      "items_preview": [
        {
          "product_title": "Vestido floral midi",
          "product_image": "https://..."
        }
      ],
      "shipping": {
        "method": "PAC",
        "estimated_delivery": "2025-11-20",
        "tracking_code": "BR123456789BR"
      },
      "created_at": "2025-11-15T10:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "total_orders": 12,
    "pending": 0,
    "shipped": 5,
    "delivered": 7,
    "total_spent": 1250.00
  }
}
```

---

### 7.2 Get Order Details
**GET** `/orders/:id`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "ord_abc123",
  "order_number": "1234",
  "status": "shipped",
  "status_label": "Em trânsito",
  "timeline": [
    {
      "status": "created",
      "label": "Pedido realizado",
      "date": "2025-11-15T10:00:00Z",
      "completed": true
    },
    {
      "status": "paid",
      "label": "Pagamento confirmado",
      "date": "2025-11-15T10:05:00Z",
      "completed": true
    },
    {
      "status": "shipped",
      "label": "Pedido enviado",
      "date": "2025-11-17T16:45:00Z",
      "completed": true
    }
  ],
  "items": [
    {
      "id": "ord_item_1",
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "image": "https://...",
        "size": "M"
      },
      "price": 65.00,
      "quantity": 1,
      "subtotal": 65.00
    }
  ],
  "shipping_address": {
    "recipient_name": "Ana Paula Silva",
    "street": "Rua das Flores",
    "number": "123",
    "city": "Passo Fundo",
    "state": "RS",
    "zip_code": "99010-000"
  },
  "shipping": {
    "method": "PAC",
    "cost": 15.00,
    "tracking_code": "BR123456789BR",
    "tracking_url": "https://rastreamento.correios.com.br/BR123456789BR"
  },
  "payment": {
    "method": "credit_card",
    "card_brand": "Visa",
    "card_last_digits": "1234",
    "installments": 12,
    "paid_at": "2025-11-15T10:05:00Z"
  },
  "summary": {
    "subtotal": 190.00,
    "discount": 19.00,
    "shipping": 15.00,
    "total": 186.00,
    "cashback_earned": 18.60
  },
  "can_cancel": false,
  "can_review": false,
  "created_at": "2025-11-15T10:00:00Z"
}
```

**Errors:**
- 404 - Pedido não encontrado
- 403 - Não é seu pedido

---

### 7.3 Create Order (Checkout)
**POST** `/orders`

**Headers:** Authorization required

**Request:**
```json
{
  "items": ["cart_item_1", "cart_item_2"],
  "address_id": "addr_abc123",
  "payment_method": "credit_card",
  "payment_details": {
    "card_token": "tok_abc123xyz",
    "installments": 12
  },
  "shipping_method": "PAC",
  "coupon_code": "DESFRUTAR"
}
```

**Response (201):**
```json
{
  "id": "ord_ghi789",
  "order_number": "1235",
  "status": "pending",
  "total": 186.00,
  "payment_url": "https://pay.apega.com/ord_ghi789",
  "expires_at": "2025-11-06T11:00:00Z",
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 400 - Carrinho vazio
- 404 - Endereço não encontrado
- 422 - Método de pagamento inválido
- 410 - Produto não disponível

**Validações:**
- items: mín 1, máx 10 por pedido
- payment_method: credit_card|pix|boleto

---

### 7.4 Get Order Tracking
**GET** `/orders/:id/tracking`

**Headers:** Authorization required

**Response (200):**
```json
{
  "order_id": "ord_abc123",
  "tracking_code": "BR123456789BR",
  "status": "in_transit",
  "estimated_delivery": "2025-11-20",
  "events": [
    {
      "date": "2025-11-19T14:30:00Z",
      "status": "in_transit",
      "description": "Objeto em trânsito",
      "location": "Porto Alegre - RS"
    }
  ],
  "carrier": "Correios",
  "carrier_url": "https://rastreamento.correios.com.br/BR123456789BR"
}
```

**Errors:**
- 404 - Código de rastreio não disponível

---

### 7.5 Cancel Order
**POST** `/orders/:id/cancel`

**Headers:** Authorization required

**Request:**
```json
{
  "reason": "changed_mind",
  "details": "Encontrei o produto em outro lugar"
}
```

**Response (200):**
```json
{
  "id": "ord_abc123",
  "status": "cancelled",
  "refund": {
    "status": "processing",
    "amount": 186.00,
    "estimated_date": "2025-11-13T00:00:00Z"
  },
  "cancelled_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 403 - Não pode cancelar (prazo expirado)
- 409 - Pedido já cancelado/entregue

**Reasons:**
- changed_mind, found_better_price, wrong_product, shipping_delay, other

---

### 7.6 Review Order
**POST** `/orders/:id/review`

**Headers:** Authorization required

**Request:**
```json
{
  "product_rating": 5,
  "seller_rating": 5,
  "comment": "Produto lindo! Veio muito bem embalado",
  "as_described": true,
  "recommend_seller": true,
  "images": ["review_img_abc123.jpg"]
}
```

**Response (201):**
```json
{
  "id": "rev_abc123",
  "order_id": "ord_abc123",
  "product_rating": 5,
  "seller_rating": 5,
  "comment": "Produto lindo! Veio muito bem embalado",
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 403 - Pedido não entregue ainda
- 409 - Já foi avaliado
- 422 - Dados inválidos

**Validações:**
- product_rating: 1-5
- seller_rating: 1-5
- comment: 10-500 chars
- images: max 3

---

### 7.7 Download Invoice
**GET** `/orders/:id/invoice`

**Headers:** Authorization required

**Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="nota_fiscal_1234.pdf"

[PDF Binary Data]
```

**Errors:**
- 404 - Nota fiscal não disponível

---

## 8. OFERTAS

### 8.1 Make Offer
**POST** `/products/:id/offers`

**Headers:** Authorization required

**Request:**
```json
{
  "amount": 55.00,
  "message": "Olá! Aceita R$ 55?"
}
```

**Response (201):**
```json
{
  "id": "off_abc123",
  "product_id": "prd_abc123",
  "amount": 55.00,
  "message": "Olá! Aceita R$ 55?",
  "status": "pending",
  "expires_at": "2025-11-07T10:00:00Z",
  "created_at": "2025-11-06T10:00:00Z"
}
```

**Errors:**
- 404 - Produto não encontrado
- 403 - Produto não aceita ofertas
- 422 - Valor abaixo do mínimo
- 409 - Já tem oferta pendente
- 422 - Não pode fazer oferta no próprio produto

**Validações:**
- amount >= min_offer_price
- message: max 200 chars (opcional)
- Limite: 3 ofertas pendentes por usuário

---

### 8.2 List Sent Offers
**GET** `/offers/sent`

**Headers:** Authorization required

**Query Params:**
- status=pending|accepted|rejected|expired
- page=1
- limit=20

**Response (200):**
```json
{
  "offers": [
    {
      "id": "off_abc123",
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "price": 65.00,
        "image": "https://..."
      },
      "amount": 55.00,
      "message": "Olá! Aceita R$ 55?",
      "status": "pending",
      "expires_at": "2025-11-07T10:00:00Z",
      "counter_offer": null
    }
  ],
  "pagination": {...}
}
```

---

### 8.3 List Received Offers (Seller)
**GET** `/offers/received`

**Headers:** Authorization required

**Query Params:**
- status=pending|accepted|rejected|expired
- page=1
- limit=20

**Response (200):**
```json
{
  "offers": [
    {
      "id": "off_abc123",
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "price": 65.00,
        "image": "https://..."
      },
      "buyer": {
        "id": "usr_def456",
        "name": "Ana Paula",
        "avatar": "https://..."
      },
      "amount": 55.00,
      "message": "Olá! Aceita R$ 55?",
      "status": "pending",
      "you_receive": 49.50,
      "commission": 5.50,
      "expires_at": "2025-11-07T10:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "pending": 2,
    "accepted_today": 5
  }
}
```

---

### 8.4 Accept Offer (Seller)
**PUT** `/offers/:id/accept`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "off_abc123",
  "status": "accepted",
  "product": {
    "id": "prd_abc123",
    "new_price": 55.00,
    "status": "reserved"
  },
  "checkout_url": "https://apega.me/checkout/off_abc123",
  "accepted_at": "2025-11-06T11:00:00Z",
  "expires_at": "2025-11-06T23:00:00Z"
}
```

**Errors:**
- 403 - Não é seu produto
- 409 - Oferta já respondida
- 410 - Produto não disponível

---

### 8.5 Reject Offer (Seller)
**PUT** `/offers/:id/reject`

**Headers:** Authorization required

**Request (with counter offer):**
```json
{
  "counter_offer": 60.00,
  "message": "Posso fazer R$ 60!"
}
```

**Response (200):**
```json
{
  "id": "off_abc123",
  "status": "rejected",
  "counter_offer": {
    "amount": 60.00,
    "message": "Posso fazer R$ 60!",
    "expires_at": "2025-11-07T11:00:00Z"
  },
  "rejected_at": "2025-11-06T11:00:00Z"
}
```

**Note:** counter_offer é opcional

---

### 8.6 Cancel Offer
**DELETE** `/offers/:id`

**Headers:** Authorization required

**Response (204):** No Content

**Errors:**
- 403 - Não é sua oferta
- 409 - Oferta já aceita

---

## 9. VENDAS (Vendedora)

### 9.1 List Sales
**GET** `/sales`

**Headers:** Authorization required

**Query Params:**
- status=pending_shipment|shipped|delivered|cancelled
- page=1
- limit=20
- sort=newest|oldest|amount_asc|amount_desc

**Response (200):**
```json
{
  "sales": [
    {
      "id": "sale_abc123",
      "sale_number": "5678",
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "image": "https://...",
        "size": "M"
      },
      "buyer": {
        "id": "usr_def456",
        "name": "Ana Paula",
        "avatar": "https://..."
      },
      "amount": 65.00,
      "commission": 6.50,
      "net_amount": 58.50,
      "status": "pending_shipment",
      "status_label": "Aguardando envio",
      "ship_by": "2025-11-18T23:59:59Z",
      "shipping_label_url": "https://cdn.apega.com/labels/sale_abc123.pdf",
      "created_at": "2025-11-15T10:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "total_revenue": 450.00,
    "total_net": 405.00,
    "total_commission": 45.00,
    "total_sales": 12,
    "pending_shipment": 2
  }
}
```

---

### 9.2 Get Sale Details
**GET** `/sales/:id`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "sale_abc123",
  "sale_number": "5678",
  "product": {
    "id": "prd_abc123",
    "title": "Vestido floral midi",
    "image": "https://...",
    "size": "M"
  },
  "buyer": {
    "id": "usr_def456",
    "name": "Ana Paula",
    "email": "ana@email.com",
    "phone": "(51) 99999-9999",
    "avatar": "https://..."
  },
  "amount": 65.00,
  "commission": 6.50,
  "commission_percentage": 10,
  "net_amount": 58.50,
  "status": "pending_shipment",
  "ship_by": "2025-11-18T23:59:59Z",
  "shipping_address": {
    "recipient_name": "Ana Paula Silva",
    "street": "Av. Ipiranga",
    "number": "500",
    "city": "Porto Alegre",
    "state": "RS",
    "zip_code": "90000-000"
  },
  "shipping": {
    "method": "PAC",
    "cost": 15.00
  },
  "shipping_label": {
    "pdf_url": "https://cdn.apega.com/labels/sale_abc123.pdf",
    "tracking_code": null
  },
  "payout": {
    "status": "pending",
    "amount": 58.50,
    "estimated_date": "2025-11-25"
  },
  "created_at": "2025-11-15T10:00:00Z"
}
```

**Errors:**
- 404 - Venda não encontrada
- 403 - Não é sua venda

---

### 9.3 Generate Shipping Label
**POST** `/sales/:id/shipping-label`

**Headers:** Authorization required

**Request:**
```json
{
  "shipping_method": "PAC"
}
```

**Response (200):**
```json
{
  "label": {
    "pdf_url": "https://cdn.apega.com/labels/sale_abc123.pdf",
    "tracking_code": "BR123456789BR",
    "carrier": "Correios",
    "estimated_days": 7,
    "ship_by": "2025-11-18T23:59:59Z"
  }
}
```

**Errors:**
- 409 - Etiqueta já gerada
- 422 - Método de envio inválido

---

### 9.4 Mark as Shipped
**POST** `/sales/:id/ship`

**Headers:** Authorization required

**Request:**
```json
{
  "tracking_code": "BR123456789BR",
  "shipping_method": "PAC",
  "shipped_at": "2025-11-17T16:45:00Z"
}
```

**Response (200):**
```json
{
  "id": "sale_abc123",
  "status": "shipped",
  "tracking_code": "BR123456789BR",
  "tracking_url": "https://rastreamento.correios.com.br/BR123456789BR",
  "estimated_delivery": "2025-11-24",
  "shipped_at": "2025-11-17T16:45:00Z"
}
```

**Errors:**
- 409 - Já foi marcada como enviada
- 422 - Código de rastreio inválido

---

### 9.5 Get Sales Statistics
**GET** `/sales/statistics`

**Headers:** Authorization required

**Query Params:**
- period=week|month|year|custom
- start_date=2025-11-01 (if period=custom)
- end_date=2025-11-30 (if period=custom)

**Response (200):**
```json
{
  "period": {
    "type": "month",
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z",
    "label": "Novembro 2025"
  },
  "revenue": {
    "total": 450.00,
    "net": 405.00,
    "commission": 45.00,
    "change_percentage": 15,
    "chart_data": [
      {
        "date": "2025-11-01",
        "amount": 65.00
      }
    ]
  },
  "sales": {
    "total": 12,
    "change_percentage": 3,
    "average_ticket": 37.50
  },
  "views": {
    "total": 1234,
    "average_per_product": 3.6
  },
  "rating": {
    "average": 4.8,
    "total_reviews": 8,
    "distribution": {
      "5": 6,
      "4": 2,
      "3": 0,
      "2": 0,
      "1": 0
    }
  },
  "top_products": [
    {
      "id": "prd_abc123",
      "title": "Vestido floral midi",
      "views": 234,
      "sales": 1,
      "revenue": 65.00
    }
  ],
  "conversion_rate": 3.2,
  "response_time": "2h",
  "response_rate": 98
}
```

---

### 9.6 Get Sales Dashboard
**GET** `/sales/dashboard`

**Headers:** Authorization required

**Response (200):**
```json
{
  "today": {
    "revenue": 130.00,
    "sales": 2,
    "views": 45,
    "messages": 8,
    "pending_shipments": 2
  },
  "this_week": {
    "revenue": 320.00,
    "sales": 7
  },
  "this_month": {
    "revenue": 450.00,
    "sales": 12
  },
  "pending_actions": {
    "pending_shipments": 2,
    "unanswered_questions": 3,
    "pending_offers": 1
  },
  "recent_sales": [
    {
      "id": "sale_abc123",
      "product_title": "Vestido floral midi",
      "buyer_name": "Ana Paula",
      "amount": 65.00,
      "status": "pending_shipment",
      "created_at": "2025-11-06T10:00:00Z"
    }
  ]
}
```

---

## 10. MENSAGENS

### 10.1 List Conversations
**GET** `/conversations`

**Headers:** Authorization required

**Query Params:**
- page=1
- limit=20
- unread_only=false

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conv_abc123",
      "participant": {
        "id": "usr_def456",
        "name": "Ana Paula",
        "avatar": "https://...",
        "online": true
      },
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi",
        "image": "https://...",
        "price": 65.00,
        "status": "available"
      },
      "last_message": {
        "text": "Aceita R$ 55?",
        "sender_id": "usr_def456",
        "sent_at": "2025-11-06T11:35:00Z",
        "is_read": false
      },
      "unread_count": 1,
      "updated_at": "2025-11-06T11:35:00Z"
    }
  ],
  "pagination": {...},
  "unread_total": 3
}
```

---

### 10.2 Get Conversation Details
**GET** `/conversations/:id`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "conv_abc123",
  "participant": {
    "id": "usr_def456",
    "name": "Ana Paula",
    "avatar": "https://...",
    "online": true
  },
  "product": {
    "id": "prd_abc123",
    "title": "Vestido floral midi",
    "price": 65.00,
    "status": "available"
  },
  "can_message": true,
  "blocked": false
}
```

---

### 10.3 Get Conversation Messages
**GET** `/conversations/:id/messages`

**Headers:** Authorization required

**Query Params:**
- page=1
- limit=50
- before_id=msg_xyz789

**Response (200):**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "conversation_id": "conv_abc123",
      "text": "Olá! O vestido ainda está disponível?",
      "sender_id": "usr_def456",
      "type": "text",
      "sent_at": "2025-11-06T11:30:00Z",
      "is_read": true
    }
  ],
  "pagination": {
    "has_more": false
  }
}
```

**Message Types:**
- text, image, system

---

### 10.4 Send Message
**POST** `/conversations/:id/messages`

**Headers:** Authorization required

**Request:**
```json
{
  "text": "Posso fazer R$ 60!",
  "type": "text"
}
```

**Response (201):**
```json
{
  "id": "msg_008",
  "text": "Posso fazer R$ 60!",
  "sender_id": "usr_abc123",
  "sent_at": "2025-11-06T11:36:00Z"
}
```

**Errors:**
- 422 - Mensagem vazia ou muito longa (max 1000 chars)
- 429 - Limite de mensagens (max 50/min)

---

### 10.5 Start Conversation
**POST** `/conversations`

**Headers:** Authorization required

**Request:**
```json
{
  "product_id": "prd_abc123",
  "message": "Olá! O vestido ainda está disponível?"
}
```

**Response (201):**
```json
{
  "id": "conv_ghi789",
  "participant": {
    "id": "usr_abc123",
    "name": "Maria Silva"
  },
  "created_at": "2025-11-06T12:00:00Z"
}
```

**Errors:**
- 409 - Conversa já existe
- 422 - Não pode conversar com você mesmo

---

### 10.6 Mark as Read
**PUT** `/conversations/:id/read`

**Headers:** Authorization required

**Response (200):**
```json
{
  "unread_count": 0,
  "last_read_at": "2025-11-06T12:00:00Z"
}
```

---

### 10.7 Block User
**POST** `/conversations/:id/block`

**Headers:** Authorization required

**Request:**
```json
{
  "reason": "spam",
  "details": "Enviando mensagens indesejadas"
}
```

**Response (200):**
```json
{
  "blocked": true,
  "blocked_at": "2025-11-06T12:00:00Z"
}
```

**Reasons:** spam, harassment, inappropriate, other

---

## 11. NOTIFICAÇÕES

### 11.1 List Notifications
**GET** `/notifications`

**Headers:** Authorization required

**Query Params:**
- type=message|offer|sale|order|review|follow|favorite|system
- unread_only=false
- page=1
- limit=20

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "not_abc123",
      "type": "message",
      "title": "Nova mensagem",
      "message": "Ana Paula perguntou sobre o produto",
      "icon": "💬",
      "data": {
        "conversation_id": "conv_abc123",
        "sender_id": "usr_def456"
      },
      "action_url": "/conversations/conv_abc123",
      "is_read": false,
      "created_at": "2025-11-06T11:35:00Z"
    }
  ],
  "pagination": {...},
  "unread_count": 3
}
```

**Notification Types:**
- message, offer, sale, order, review, follow, favorite, system

---

### 11.2 Mark Notification as Read
**PUT** `/notifications/:id/read`

**Headers:** Authorization required

**Response (200):**
```json
{
  "is_read": true,
  "read_at": "2025-11-06T12:00:00Z"
}
```

---

### 11.3 Mark All as Read
**PUT** `/notifications/read-all`

**Headers:** Authorization required

**Response (200):**
```json
{
  "unread_count": 0,
  "marked_as_read": 5
}
```

---

### 11.4 Get Notification Settings
**GET** `/notifications/settings`

**Headers:** Authorization required

**Response (200):**
```json
{
  "push_enabled": true,
  "email_enabled": true,
  "preferences": {
    "messages": {
      "push": true,
      "email": false
    },
    "offers": {
      "push": true,
      "email": true
    },
    "marketing": {
      "push": true,
      "email": true
    }
  }
}
```

---

### 11.5 Update Settings
**PUT** `/notifications/settings`

**Headers:** Authorization required

**Request:**
```json
{
  "push_enabled": true,
  "preferences": {
    "marketing": {
      "push": false,
      "email": false
    }
  }
}
```

**Response (200):**
```json
{
  "push_enabled": true,
  "preferences": {...}
}
```

---

### 11.6 Register Push Device
**POST** `/notifications/device`

**Headers:** Authorization required

**Request:**
```json
{
  "token": "firebase_device_token",
  "platform": "ios",
  "device_model": "iPhone 13",
  "os_version": "17.0"
}
```

**Response (201):**
```json
{
  "device_id": "dev_abc123",
  "registered_at": "2025-11-06T12:00:00Z"
}
```

**Platforms:** ios, android, web

---

## 12. BUSCA

### 12.1 Search Products
**GET** `/search`

**Query Params:**
- q=vestido floral
- category, size, condition, brand, color
- min_price, max_price
- location_state, location_city
- sort=relevance|newest|price_asc|price_desc
- page=1
- limit=20

**Response (200):**
```json
{
  "query": "vestido floral",
  "total_results": 234,
  "products": [...],
  "filters": {
    "categories": [
      {
        "id": "cat_vestidos",
        "name": "Vestidos",
        "count": 180
      }
    ],
    "brands": [...],
    "price_range": {
      "min": 20.00,
      "max": 300.00
    }
  },
  "suggestions": ["vestido midi", "vestido longo"],
  "pagination": {...}
}
```

---

### 12.2 Autocomplete
**GET** `/search/autocomplete`

**Query Params:**
- q=vest
- limit=10

**Response (200):**
```json
{
  "suggestions": [
    {
      "type": "query",
      "text": "vestido floral",
      "highlight": "<strong>vest</strong>ido floral",
      "popularity": 234
    },
    {
      "type": "category",
      "text": "Vestidos",
      "id": "cat_vestidos",
      "products_count": 1234
    },
    {
      "type": "product",
      "text": "Vestido floral midi",
      "id": "prd_abc123",
      "price": 65.00
    }
  ]
}
```

---

### 12.3 Trending Searches
**GET** `/search/trending`

**Query Params:**
- limit=10

**Response (200):**
```json
{
  "trending": [
    {
      "query": "vestido midi",
      "rank": 1,
      "growth_percentage": 45
    }
  ],
  "updated_at": "2025-11-06T12:00:00Z"
}
```

---

### 12.4 Search History
**GET** `/search/history`

**Headers:** Authorization required

**Response (200):**
```json
{
  "history": [
    {
      "id": "hist_abc123",
      "query": "vestido floral",
      "filters": {
        "category": "vestidos",
        "size": "M"
      },
      "created_at": "2025-11-06T12:00:00Z"
    }
  ]
}
```

---

## 13. SUPORTE

### 13.1 List Help Articles
**GET** `/help/articles`

**Query Params:**
- category=buying|selling|shipping|payments
- search=rastreamento
- page=1
- limit=20

**Response (200):**
```json
{
  "articles": [
    {
      "id": "art_abc123",
      "title": "Como rastrear meu pedido?",
      "summary": "Aprenda a acompanhar seu pedido...",
      "category": "shipping",
      "views": 1234,
      "helpful_votes": 98
    }
  ],
  "pagination": {...}
}
```

---

### 13.2 Get Article
**GET** `/help/articles/:id`

**Response (200):**
```json
{
  "id": "art_abc123",
  "title": "Como rastrear meu pedido?",
  "content": "Para rastrear seu pedido...",
  "category": "shipping",
  "related_articles": [...],
  "helpful_votes": 98,
  "views": 1234
}
```

---

### 13.3 Create Support Ticket
**POST** `/support/tickets`

**Headers:** Authorization required

**Request:**
```json
{
  "subject": "Problema com entrega",
  "message": "Meu pedido não chegou...",
  "category": "shipping",
  "order_id": "ord_abc123",
  "attachments": ["attachment_abc123.jpg"]
}
```

**Response (201):**
```json
{
  "id": "ticket_abc123",
  "number": "SUPP-123",
  "status": "open",
  "created_at": "2025-11-06T12:00:00Z"
}
```

**Categories:** order, payment, shipping, product, account, other

---

### 13.4 List Tickets
**GET** `/support/tickets`

**Headers:** Authorization required

**Query Params:**
- status=open|in_progress|resolved|closed
- page=1
- limit=20

**Response (200):**
```json
{
  "tickets": [
    {
      "id": "ticket_abc123",
      "number": "SUPP-123",
      "subject": "Problema com entrega",
      "status": "in_progress",
      "last_reply_at": "2025-11-06T14:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 13.5 Get Ticket Details
**GET** `/support/tickets/:id`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": "ticket_abc123",
  "number": "SUPP-123",
  "subject": "Problema com entrega",
  "status": "in_progress",
  "messages": [
    {
      "id": "msg_1",
      "text": "Meu pedido não chegou...",
      "sender_type": "user",
      "created_at": "2025-11-06T12:00:00Z"
    },
    {
      "id": "msg_2",
      "text": "Olá! Vou verificar...",
      "sender_type": "agent",
      "created_at": "2025-11-06T13:00:00Z"
    }
  ]
}
```

---

## 14. INTEGRAÇÃO CORREIOS

### 14.1 Calculate Shipping
**Correios API:** POST `/preco/nacional`

**Request:**
```json
{
  "cepOrigem": "99010000",
  "cepDestino": "90000000",
  "peso": "0.5",
  "servicos": ["04014", "04510"]
}
```

**Response:**
```json
{
  "servicos": [
    {
      "codigo": "04510",
      "nome": "PAC",
      "valor": "15.00",
      "prazoEntrega": "7"
    },
    {
      "codigo": "04014",
      "nome": "SEDEX",
      "valor": "25.00",
      "prazoEntrega": "3"
    }
  ]
}
```

---

### 14.2 Track Package
**Correios API:** GET `/rastreamento/{codigo}`

**Response:**
```json
{
  "objetos": [
    {
      "codigo": "BR123456789BR",
      "eventos": [
        {
          "data": "2025-11-19T14:30:00",
          "tipo": "OEC",
          "descricao": "Objeto em transferência",
          "unidade": {
            "cidade": "Porto Alegre",
            "uf": "RS"
          }
        }
      ]
    }
  ]
}
```

**Event Types:**
- PO: Postado
- RO: Recebido
- DO: Saiu para entrega
- BDE: Entregue

---

### 14.3 Lookup CEP
**Correios API:** GET `/cep/{cep}`

**Response:**
```json
{
  "cep": "99010-000",
  "logradouro": "Rua das Flores",
  "bairro": "Centro",
  "localidade": "Passo Fundo",
  "uf": "RS"
}
```

---

## Error Handling

**Error Response Structure:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro legível",
    "details": {
      "field": "campo específico com erro",
      "reason": "razão detalhada"
    }
  }
}
```

### Common Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | VALIDATION_ERROR | Dados inválidos |
| 401 | UNAUTHORIZED | Token ausente/inválido |
| 403 | FORBIDDEN | Sem permissão |
| 404 | NOT_FOUND | Recurso não encontrado |
| 409 | CONFLICT | Conflito |
| 410 | GONE | Recurso removido |
| 422 | UNPROCESSABLE_ENTITY | Entidade não processável |
| 429 | RATE_LIMIT_EXCEEDED | Muitas requisições |
| 500 | INTERNAL_ERROR | Erro interno |

---

## Rate Limiting

- **Auth endpoints:** 5 req/min
- **Read (GET):** 100 req/min
- **Write (POST/PATCH/DELETE):** 30 req/min

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642260000
```

---

## Pagination

**Query Params:**
- page (default: 1)
- limit (default: 20, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 12,
    "total_items": 235,
    "per_page": 20,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## File Uploads

**Supported formats:** JPG, PNG, WebP
**Size limits:**
- Avatar: Max 5MB, 1000x1000px
- Product: Max 10MB, 2000x2000px, max 8 images

---

## 15. PAGAMENTO (STRIPE/MERCADO PAGO)

### 15.1 Stripe - Create Token
**Stripe API:** POST `https://api.stripe.com/v1/tokens`

**Headers:**
```
Authorization: Bearer {stripe_publishable_key}
```

**Request:**
```json
{
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2026,
    "cvc": "123"
  }
}
```

**Response (200):**
```json
{
  "id": "tok_1234567890abcdef",
  "object": "token",
  "card": {
    "id": "card_1234567890",
    "brand": "Visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2026
  },
  "created": 1699999999
}
```

---

### 15.2 Stripe - Create Payment Intent
**Stripe API:** POST `https://api.stripe.com/v1/payment_intents`

**Request:**
```json
{
  "amount": 18600,
  "currency": "brl",
  "payment_method_types": ["card"],
  "metadata": {
    "order_id": "ord_abc123",
    "user_id": "usr_abc123"
  },
  "statement_descriptor": "APEGA DESAPEGA",
  "description": "Pedido #1234"
}
```

**Response (200):**
```json
{
  "id": "pi_1234567890",
  "object": "payment_intent",
  "amount": 18600,
  "currency": "brl",
  "status": "requires_payment_method",
  "client_secret": "pi_1234567890_secret_xyz",
  "created": 1699999999
}
```

**Status:**
- requires_payment_method: Aguardando método
- requires_confirmation: Aguardando confirmação
- requires_action: Requer ação (3D Secure)
- processing: Processando
- succeeded: Sucesso
- canceled: Cancelado

---

### 15.3 Stripe - Confirm Payment
**Stripe API:** POST `https://api.stripe.com/v1/payment_intents/{id}/confirm`

**Request:**
```json
{
  "payment_method": "tok_1234567890abcdef"
}
```

**Response (200):**
```json
{
  "id": "pi_1234567890",
  "status": "succeeded",
  "amount": 18600,
  "charges": {
    "data": [
      {
        "id": "ch_1234567890",
        "amount": 18600,
        "paid": true,
        "receipt_url": "https://pay.stripe.com/receipts/xyz"
      }
    ]
  }
}
```

---

### 15.4 Stripe - Create Refund
**Stripe API:** POST `https://api.stripe.com/v1/refunds`

**Request:**
```json
{
  "charge": "ch_1234567890",
  "amount": 18600,
  "reason": "requested_by_customer",
  "metadata": {
    "order_id": "ord_abc123",
    "cancelled_by": "usr_abc123"
  }
}
```

**Response (200):**
```json
{
  "id": "re_1234567890",
  "object": "refund",
  "amount": 18600,
  "status": "succeeded",
  "charge": "ch_1234567890",
  "created": 1699999999
}
```

**Reasons:**
- duplicate, fraudulent, requested_by_customer

---

### 15.5 Mercado Pago - Create Payment
**Mercado Pago API:** POST `https://api.mercadopago.com/v1/payments`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "transaction_amount": 186.00,
  "description": "Pedido #1234",
  "payment_method_id": "visa",
  "token": "card_token_here",
  "installments": 12,
  "payer": {
    "email": "maria@email.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  },
  "external_reference": "ord_abc123",
  "notification_url": "https://api.apegadesapega.com.br/webhooks/mercadopago"
}
```

**Response (201):**
```json
{
  "id": 12345678,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 186.00,
  "installments": 12,
  "installment_amount": 15.50,
  "date_approved": "2025-11-06T10:05:00.000-04:00",
  "authorization_code": "123456"
}
```

**Status:**
- approved: Aprovado
- pending: Pendente
- in_process: Em análise
- rejected: Rejeitado
- cancelled: Cancelado
- refunded: Reembolsado

---

### 15.6 Mercado Pago - PIX Payment
**Mercado Pago API:** POST `https://api.mercadopago.com/v1/payments`

**Request:**
```json
{
  "transaction_amount": 186.00,
  "description": "Pedido #1234",
  "payment_method_id": "pix",
  "payer": {
    "email": "maria@email.com"
  },
  "external_reference": "ord_abc123"
}
```

**Response (201):**
```json
{
  "id": 12345678,
  "status": "pending",
  "status_detail": "pending_waiting_payment",
  "point_of_interaction": {
    "type": "PIX",
    "transaction_data": {
      "qr_code": "00020126580014br.gov.bcb.pix...",
      "qr_code_base64": "iVBORw0KGgoAAAANS...",
      "ticket_url": "https://www.mercadopago.com.br/payments/12345678"
    }
  },
  "date_of_expiration": "2025-11-06T10:30:00.000-04:00"
}
```

---

## 16. UPLOAD DE IMAGENS (AWS S3 / CLOUDINARY)

### 16.1 AWS S3 - Generate Presigned URL (Backend)

**Backend generates presigned URL:**
```python
import boto3

s3_client = boto3.client('s3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name='us-east-1'
)

presigned_data = s3_client.generate_presigned_post(
    Bucket='apega-desapega-products',
    Key=f"products/{user_id}/{timestamp}_{file_name}",
    Fields={
        'acl': 'public-read',
        'Content-Type': file_type
    },
    Conditions=[
        {'acl': 'public-read'},
        {'Content-Type': file_type},
        ['content-length-range', 0, 5242880]  # max 5MB
    ],
    ExpiresIn=3600
)
```

**Response:**
```json
{
  "url": "https://apega-desapega-products.s3.amazonaws.com/",
  "fields": {
    "key": "products/usr_abc123/1699999999_image.jpg",
    "acl": "public-read",
    "Content-Type": "image/jpeg",
    "policy": "eyJleHBpcmF0aW9uIjoi...",
    "x-amz-signature": "..."
  },
  "key": "products/usr_abc123/1699999999_image.jpg"
}
```

---

### 16.2 Cloudinary - Upload Image
**Cloudinary API:** POST `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`

**Request (multipart/form-data):**
```
file: [file or base64]
upload_preset: apega_products
folder: products/usr_abc123
public_id: product_image_1699999999
tags: product,vestido,usr_abc123
```

**Response (200):**
```json
{
  "public_id": "products/usr_abc123/product_image_1699999999",
  "version": 1699999999,
  "width": 1200,
  "height": 1500,
  "format": "jpg",
  "resource_type": "image",
  "bytes": 245678,
  "url": "http://res.cloudinary.com/apega/image/upload/v1699999999/products/usr_abc123/product_image_1699999999.jpg",
  "secure_url": "https://res.cloudinary.com/apega/image/upload/v1699999999/products/usr_abc123/product_image_1699999999.jpg"
}
```

---

### 16.3 Cloudinary - Image Transformations

**URL Pattern:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
```

**Examples:**

Thumbnail (200x200, crop):
```
https://res.cloudinary.com/apega/image/upload/w_200,h_200,c_fill/products/image.jpg
```

Optimized quality:
```
https://res.cloudinary.com/apega/image/upload/w_200,h_200,c_fill,q_auto,f_auto/products/image.jpg
```

Responsive sizes:
```
https://res.cloudinary.com/apega/image/upload/w_400,c_scale/products/image.jpg
https://res.cloudinary.com/apega/image/upload/w_800,c_scale/products/image.jpg
```

---

### 16.4 Cloudinary - Delete Image
**Cloudinary API:** DELETE `https://api.cloudinary.com/v1_1/{cloud_name}/resources/{resource_type}/upload`

**Request:**
```json
{
  "public_ids": [
    "products/usr_abc123/product_image_1699999999"
  ],
  "invalidate": true
}
```

**Response (200):**
```json
{
  "deleted": {
    "products/usr_abc123/product_image_1699999999": "deleted"
  }
}
```

---

## 17. GEOLOCALIZAÇÃO (GOOGLE MAPS API)

### 17.1 Geocoding (Address → Coordinates)
**Google Maps API:** GET `https://maps.googleapis.com/maps/api/geocode/json`

**Query Params:**
- address: Rua das Flores, 123, Passo Fundo, RS, Brasil
- key: {google_maps_api_key}
- language: pt-BR

**Response (200):**
```json
{
  "results": [
    {
      "formatted_address": "R. das Flores, 123 - Centro, Passo Fundo - RS, 99010-000, Brasil",
      "geometry": {
        "location": {
          "lat": -28.2631,
          "lng": -52.4068
        },
        "location_type": "ROOFTOP"
      },
      "place_id": "ChIJXxYxWxPz5JQRqQUqMH6fYrQ",
      "address_components": [
        {
          "long_name": "Passo Fundo",
          "short_name": "Passo Fundo",
          "types": ["locality", "political"]
        },
        {
          "long_name": "Rio Grande do Sul",
          "short_name": "RS",
          "types": ["administrative_area_level_1", "political"]
        }
      ]
    }
  ],
  "status": "OK"
}
```

---

### 17.2 Reverse Geocoding (Coordinates → Address)
**Google Maps API:** GET `https://maps.googleapis.com/maps/api/geocode/json`

**Query Params:**
- latlng: -28.2631,-52.4068
- key: {google_maps_api_key}
- language: pt-BR
- result_type: street_address

**Response (200):**
```json
{
  "results": [
    {
      "formatted_address": "R. das Flores, 123 - Centro, Passo Fundo - RS, 99010-000, Brasil",
      "geometry": {
        "location": {
          "lat": -28.2631,
          "lng": -52.4068
        }
      },
      "place_id": "ChIJXxYxWxPz5JQRqQUqMH6fYrQ"
    }
  ],
  "status": "OK"
}
```

---

### 17.3 Place Autocomplete
**Google Maps API:** GET `https://maps.googleapis.com/maps/api/place/autocomplete/json`

**Query Params:**
- input: rua das flores
- location: -28.2631,-52.4068
- radius: 50000
- components: country:br
- types: address
- language: pt-BR
- key: {google_maps_api_key}

**Response (200):**
```json
{
  "predictions": [
    {
      "description": "Rua das Flores - Centro, Passo Fundo - RS, Brasil",
      "place_id": "ChIJXxYxWxPz5JQRqQUqMH6fYrQ",
      "structured_formatting": {
        "main_text": "Rua das Flores",
        "secondary_text": "Centro, Passo Fundo - RS, Brasil"
      }
    }
  ],
  "status": "OK"
}
```

---

### 17.4 Distance Matrix
**Google Maps API:** GET `https://maps.googleapis.com/maps/api/distancematrix/json`

**Query Params:**
- origins: -28.2631,-52.4068
- destinations: -30.0346,-51.2177
- mode: driving
- language: pt-BR
- key: {google_maps_api_key}

**Response (200):**
```json
{
  "destination_addresses": ["Porto Alegre, RS, Brasil"],
  "origin_addresses": ["Passo Fundo, RS, Brasil"],
  "rows": [
    {
      "elements": [
        {
          "distance": {
            "text": "293 km",
            "value": 293000
          },
          "duration": {
            "text": "3 horas 25 minutos",
            "value": 12300
          },
          "status": "OK"
        }
      ]
    }
  ],
  "status": "OK"
}
```

**Modes:** driving, walking, bicycling, transit

---

## 18. NOTIFICAÇÕES PUSH (FIREBASE CLOUD MESSAGING)

### 18.1 Send Push Notification
**FCM API:** POST `https://fcm.googleapis.com/v1/projects/{project_id}/messages:send`

**Headers:**
```
Authorization: Bearer {oauth2_token}
Content-Type: application/json
```

**Request:**
```json
{
  "message": {
    "token": "device_registration_token_here",
    "notification": {
      "title": "Nova mensagem",
      "body": "Ana Paula perguntou sobre o produto"
    },
    "data": {
      "type": "message",
      "conversation_id": "conv_abc123",
      "sender_id": "usr_def456",
      "click_action": "OPEN_CONVERSATION"
    },
    "android": {
      "priority": "high",
      "notification": {
        "icon": "ic_notification",
        "color": "#6B9080",
        "sound": "default",
        "channel_id": "messages"
      }
    },
    "apns": {
      "headers": {
        "apns-priority": "10"
      },
      "payload": {
        "aps": {
          "alert": {
            "title": "Nova mensagem",
            "body": "Ana Paula perguntou sobre o produto"
          },
          "badge": 1,
          "sound": "default"
        }
      }
    }
  }
}
```

**Response (200):**
```json
{
  "name": "projects/apega-desapega/messages/0:1699999999999999%abc123"
}
```

---

### 18.2 Send to Topic
**FCM API:** POST `https://fcm.googleapis.com/v1/projects/{project_id}/messages:send`

**Request:**
```json
{
  "message": {
    "topic": "user_usr_abc123",
    "notification": {
      "title": "Venda realizada",
      "body": "Você vendeu o vestido floral por R$ 65,00"
    },
    "data": {
      "type": "sale",
      "sale_id": "sale_abc123"
    }
  }
}
```

---

### 18.3 Notification Templates

**Nova mensagem:**
```json
{
  "title": "Nova mensagem",
  "body": "{sender_name} perguntou sobre o produto",
  "data": {
    "type": "message",
    "conversation_id": "{conversation_id}",
    "click_action": "OPEN_CONVERSATION"
  }
}
```

**Nova oferta:**
```json
{
  "title": "Nova oferta recebida",
  "body": "{buyer_name} ofereceu R$ {amount} no {product_title}",
  "data": {
    "type": "offer",
    "offer_id": "{offer_id}",
    "click_action": "OPEN_OFFER"
  }
}
```

**Venda realizada:**
```json
{
  "title": "Venda realizada 🎉",
  "body": "Você vendeu o {product_title} por R$ {amount}",
  "data": {
    "type": "sale",
    "sale_id": "{sale_id}",
    "click_action": "OPEN_SALE"
  }
}
```

**Pedido enviado:**
```json
{
  "title": "Pedido enviado 📦",
  "body": "Seu pedido #{order_number} foi postado",
  "data": {
    "type": "order",
    "order_id": "{order_id}",
    "click_action": "OPEN_ORDER"
  }
}
```

---

## 19. ANALYTICS (GOOGLE ANALYTICS 4)

### 19.1 Send Events
**GA4 Measurement Protocol:** POST `https://www.google-analytics.com/mp/collect`

**Query Params:**
- measurement_id: G-XXXXXXXXXX
- api_secret: {api_secret}

**Request:**
```json
{
  "client_id": "user_usr_abc123",
  "user_id": "usr_abc123",
  "events": [
    {
      "name": "view_item",
      "params": {
        "currency": "BRL",
        "value": 65.00,
        "items": [
          {
            "item_id": "prd_abc123",
            "item_name": "Vestido floral midi",
            "item_category": "Vestidos",
            "item_category2": "Midi",
            "item_brand": "Farm",
            "price": 65.00,
            "quantity": 1
          }
        ]
      }
    }
  ]
}
```

**Response (204):** No Content

---

### 19.2 E-commerce Events

**View Item:**
```json
{
  "name": "view_item",
  "params": {
    "currency": "BRL",
    "value": 65.00,
    "items": [{
      "item_id": "prd_abc123",
      "item_name": "Vestido floral midi",
      "item_category": "Vestidos",
      "price": 65.00
    }]
  }
}
```

**Add to Cart:**
```json
{
  "name": "add_to_cart",
  "params": {
    "currency": "BRL",
    "value": 65.00,
    "items": [{
      "item_id": "prd_abc123",
      "item_name": "Vestido floral midi",
      "price": 65.00,
      "quantity": 1
    }]
  }
}
```

**Begin Checkout:**
```json
{
  "name": "begin_checkout",
  "params": {
    "currency": "BRL",
    "value": 186.00,
    "coupon": "DESFRUTAR",
    "items": [...]
  }
}
```

**Purchase:**
```json
{
  "name": "purchase",
  "params": {
    "transaction_id": "ord_abc123",
    "value": 186.00,
    "tax": 0,
    "shipping": 15.00,
    "currency": "BRL",
    "coupon": "DESFRUTAR",
    "items": [...]
  }
}
```

**Search:**
```json
{
  "name": "search",
  "params": {
    "search_term": "vestido floral"
  }
}
```

---

### 19.3 Custom Events

**Product Favorited:**
```json
{
  "name": "product_favorited",
  "params": {
    "item_id": "prd_abc123",
    "item_name": "Vestido floral midi",
    "seller_id": "usr_abc123"
  }
}
```

**Offer Sent:**
```json
{
  "name": "offer_sent",
  "params": {
    "item_id": "prd_abc123",
    "offer_amount": 55.00,
    "original_price": 65.00
  }
}
```

**Message Sent:**
```json
{
  "name": "message_sent",
  "params": {
    "conversation_type": "buyer_seller",
    "message_length": 25
  }
}
```

---

## 20. ENVIO E LOGÍSTICA (MELHOR ENVIO)

### 20.1 Calculate Shipping
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/shipment/calculate`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

**Request:**
```json
{
  "from": {
    "postal_code": "99010000"
  },
  "to": {
    "postal_code": "90000000"
  },
  "package": {
    "weight": 0.5,
    "width": 20,
    "height": 10,
    "length": 15
  },
  "options": {
    "insurance_value": 65.00,
    "receipt": false,
    "own_hand": false
  },
  "services": "1,2,3"
}
```

**Services:**
- 1: PAC (Correios)
- 2: SEDEX (Correios)
- 3: SEDEX 10 (Correios)
- 17: Jadlog Package
- 40: Jadlog .Com
- 44: Azul Cargo Express

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "PAC",
    "price": "15.00",
    "custom_price": "13.50",
    "discount": "10%",
    "currency": "R$",
    "delivery_time": 7,
    "delivery_range": {
      "min": 5,
      "max": 7
    },
    "company": {
      "id": 1,
      "name": "Correios",
      "picture": "https://melhorenvio.com.br/images/shipping-companies/correios.png"
    },
    "error": null
  },
  {
    "id": 2,
    "name": "SEDEX",
    "price": "25.00",
    "custom_price": "22.50",
    "discount": "10%",
    "currency": "R$",
    "delivery_time": 3,
    "delivery_range": {
      "min": 2,
      "max": 3
    },
    "company": {
      "id": 1,
      "name": "Correios"
    },
    "error": null
  }
]
```

---

### 20.2 Add to Cart
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/cart`

**Request:**
```json
{
  "service": 1,
  "from": {
    "name": "Maria Silva",
    "phone": "54999999999",
    "email": "maria@email.com",
    "document": "12345678900",
    "address": "Rua das Flores",
    "complement": "Apto 45",
    "number": "123",
    "district": "Centro",
    "city": "Passo Fundo",
    "state_abbr": "RS",
    "country_id": "BR",
    "postal_code": "99010000"
  },
  "to": {
    "name": "Ana Paula Silva",
    "phone": "51999999999",
    "email": "ana@email.com",
    "document": "98765432100",
    "address": "Av Ipiranga",
    "complement": "Apto 101",
    "number": "500",
    "district": "Centro",
    "city": "Porto Alegre",
    "state_abbr": "RS",
    "country_id": "BR",
    "postal_code": "90000000"
  },
  "products": [
    {
      "name": "Vestido floral midi",
      "quantity": 1,
      "unitary_value": 65.00
    }
  ],
  "volumes": [
    {
      "height": 10,
      "width": 20,
      "length": 15,
      "weight": 0.5
    }
  ],
  "options": {
    "insurance_value": 65.00,
    "receipt": false,
    "own_hand": false,
    "platform": "Apega Desapega",
    "tags": [
      {
        "tag": "sale_abc123",
        "url": "https://apegadesapega.com.br/sales/sale_abc123"
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "id": "abc123-def456-ghi789",
  "protocol": "ORD-123456",
  "service_id": 1,
  "service_name": "PAC",
  "price": "13.50",
  "status": "pending",
  "created_at": "2025-11-17 16:45:00"
}
```

---

### 20.3 Checkout Shipment
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/shipment/checkout`

**Request:**
```json
{
  "orders": [
    "abc123-def456-ghi789"
  ]
}
```

**Response (200):**
```json
{
  "purchase": {
    "id": "purchase_123",
    "protocol": "PUR-123456",
    "total": "13.50",
    "discount": "1.50",
    "status": "paid",
    "paid_at": "2025-11-17 16:50:00",
    "orders": [
      {
        "id": "abc123-def456-ghi789",
        "protocol": "ORD-123456",
        "status": "released"
      }
    ]
  }
}
```

---

### 20.4 Generate Label
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/shipment/generate`

**Request:**
```json
{
  "orders": [
    "abc123-def456-ghi789"
  ]
}
```

**Response (200):**
```json
{
  "success": [
    {
      "order_id": "abc123-def456-ghi789",
      "tracking": "BR123456789BR",
      "status": "printed"
    }
  ],
  "errors": []
}
```

---

### 20.5 Print Label
**Melhor Envio API:** GET `https://melhorenvio.com.br/api/v2/me/shipment/print`

**Query Params:**
- orders: abc123-def456-ghi789
- mode: public

**Response (200):**
```json
{
  "url": "https://melhorenvio.com.br/shipment/print/pdf/12345"
}
```

**Note:** Access the URL to download the PDF label

---

### 20.6 Track Shipment
**Melhor Envio API:** GET `https://melhorenvio.com.br/api/v2/me/shipment/tracking`

**Query Params:**
- orders: abc123-def456-ghi789

**Response (200):**
```json
[
  {
    "id": "abc123-def456-ghi789",
    "protocol": "ORD-123456",
    "status": "posted",
    "tracking": "BR123456789BR",
    "melhorenvio_tracking": "https://melhorenvio.com.br/rastreio/BR123456789BR",
    "created_at": "2025-11-17 16:45:00",
    "paid_at": "2025-11-17 16:50:00",
    "generated_at": "2025-11-17 17:00:00",
    "posted_at": "2025-11-18 09:15:00",
    "delivered_at": null,
    "canceled_at": null
  }
]
```

**Status:**
- pending: Pendente
- released: Liberado para impressão
- printed: Etiqueta impressa
- posted: Postado
- delivered: Entregue
- canceled: Cancelado
- expired: Expirado

---

### 20.7 Cancel Shipment
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/shipment/cancel`

**Request:**
```json
{
  "order": {
    "id": "abc123-def456-ghi789"
  }
}
```

**Response (200):**
```json
{
  "canceled": true,
  "protocol": "ORD-123456",
  "message": "Envio cancelado com sucesso"
}
```

**Note:** Can only cancel before posting

---

### 20.8 Check Balance
**Melhor Envio API:** GET `https://melhorenvio.com.br/api/v2/me/balance`

**Response (200):**
```json
{
  "balance": 150.00,
  "pending": 13.50,
  "available": 136.50
}
```

---

### 20.9 Save Address
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/addresses`

**Request:**
```json
{
  "label": "Casa",
  "postal_code": "99010000",
  "address": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "district": "Centro",
  "city": "Passo Fundo",
  "state_abbr": "RS",
  "country_id": "BR"
}
```

**Response (201):**
```json
{
  "id": "addr_me_123",
  "label": "Casa",
  "postal_code": "99010000",
  "address": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "district": "Centro",
  "city": "Passo Fundo",
  "state_abbr": "RS",
  "country_id": "BR"
}
```

---

### 20.10 Request Collection
**Melhor Envio API:** POST `https://melhorenvio.com.br/api/v2/me/shipment/request-collection`

**Request:**
```json
{
  "orders": [
    "abc123-def456-ghi789"
  ],
  "date": "2025-11-19",
  "time": "morning"
}
```

**Time Options:**
- morning: 08:00 - 12:00
- afternoon: 14:00 - 18:00

**Response (201):**
```json
{
  "id": "col_123",
  "protocol": "COL-123456",
  "date": "2025-11-19",
  "time": "morning",
  "status": "scheduled",
  "orders_count": 2
}
```

---

### 20.11 Webhooks (Melhor Envio)

**Webhook URL:** `https://api.apegadesapega.com.br/webhooks/melhorenvio`

**Events:**
- order.created
- order.released
- order.printed
- order.posted
- order.delivered
- order.canceled
- tracking.updated

**Example Payload (tracking.updated):**
```json
{
  "event": "tracking.updated",
  "order_id": "abc123-def456-ghi789",
  "protocol": "ORD-123456",
  "tracking": "BR123456789BR",
  "status": "posted",
  "tracking_events": [
    {
      "date": "2025-11-18 09:15:00",
      "status": "posted",
      "description": "Objeto postado",
      "location": "AGF PASSO FUNDO - Passo Fundo/RS"
    },
    {
      "date": "2025-11-18 14:30:00",
      "status": "in_transit",
      "description": "Objeto em transferência",
      "location": "CDD PORTO ALEGRE - Porto Alegre/RS"
    }
  ]
}
```

**Validation:**
- Verify header `X-Melhorenvio-Signature`
- Compare with HMAC-SHA256 hash

---

### 20.12 Default Dimensions by Category

**Category Dimensions:**
```json
{
  "vestidos": {
    "height": 10,
    "width": 30,
    "length": 40,
    "weight": 0.5
  },
  "blusas": {
    "height": 5,
    "width": 30,
    "length": 40,
    "weight": 0.3
  },
  "calcas": {
    "height": 8,
    "width": 30,
    "length": 40,
    "weight": 0.4
  },
  "sapatos": {
    "height": 12,
    "width": 30,
    "length": 35,
    "weight": 0.8
  },
  "bolsas": {
    "height": 15,
    "width": 30,
    "length": 40,
    "weight": 0.6
  },
  "acessorios": {
    "height": 5,
    "width": 20,
    "length": 20,
    "weight": 0.2
  }
}
```

---

### 20.13 Shipping Flow

**Complete Flow:**
1. Sale confirmed
2. Create shipment in Melhor Envio
3. Checkout shipment
4. Generate label
5. Send notification to seller (print label within 2 business days)
6. Seller posts package
7. Track shipment via webhooks
8. Notify buyer on each update
9. Confirm delivery
10. Request review
11. Release payment to seller (after 7 days)

**Integration Notes:**

**Benefits:**
- Discount on shipping (10-40%)
- Multiple carriers (Correios, Jadlog, Azul Cargo)
- Automatic label generation
- Unified tracking
- Scheduled collection

**Costs:**
- Melhor Envio: 10-40% discount on shipping
- Label fee: R$ 0
- Minimum balance: R$ 10

**Limits:**
- Maximum weight: 30kg (Correios)
- Dimensions: sum of sides ≤ 200cm
- Declared value: up to R$ 10,000

**Timeframes:**
- Posting: within 2 business days after sale
- PAC: 5-10 business days
- SEDEX: 2-4 business days
- Jadlog: 4-6 business days

**Insurance:**
- Automatic on declared value
- Coverage: loss, theft, damage
- Deductible: R$ 0
- Claim period: 30 days

---

## 21. REVIEWS E REPUTAÇÃO

Sistema completo de avaliações mútuas entre compradoras e vendedoras, com cálculo de reputação, badges e moderação.

---

### 21.1 List Pending Reviews

**Endpoint:** `GET /reviews/pending`

**Description:** Lista todas as avaliações pendentes do usuário (compras ou vendas que ainda não foram avaliadas).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `type` (optional): `buyer` ou `seller` (default: ambos)

**Response:** `200 OK`
```json
{
  "pending_reviews": [
    {
      "id": "rev_123",
      "order_id": "ord_789",
      "product": {
        "id": "prod_456",
        "title": "Vestido Floral",
        "image": "https://cdn.example.com/vestido.jpg"
      },
      "type": "buyer_to_seller",
      "other_user": {
        "id": "user_321",
        "username": "maria_vendedora",
        "avatar": "https://cdn.example.com/maria.jpg"
      },
      "delivered_at": "2025-11-01T14:30:00Z",
      "expires_at": "2025-11-16T14:30:00Z",
      "days_remaining": 10
    }
  ],
  "total": 1
}
```

**Notes:**
- Avaliações podem ser feitas até 15 dias após a entrega
- Se ambos não avaliarem em 15 dias, a janela expira
- Tipo `buyer_to_seller`: compradora avalia vendedora
- Tipo `seller_to_buyer`: vendedora avalia compradora

---

### 21.2 Create Review

**Endpoint:** `POST /reviews`

**Description:** Cria uma avaliação (compradora → vendedora ou vendedora → compradora).

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "order_id": "ord_789",
  "type": "buyer_to_seller",
  "rating": {
    "overall": 5,
    "communication": 5,
    "product_quality": 5,
    "shipping_speed": 4,
    "packaging": 5
  },
  "comment": "Produto exatamente como descrito! Vendedora super atenciosa e rápida no envio. Recomendo!",
  "would_recommend": true,
  "tags": ["produto_como_descrito", "envio_rapido", "bem_embalado"]
}
```

**Response:** `201 Created`
```json
{
  "review": {
    "id": "rev_123",
    "order_id": "ord_789",
    "type": "buyer_to_seller",
    "reviewer": {
      "id": "user_123",
      "username": "ana_compradora",
      "avatar": "https://cdn.example.com/ana.jpg"
    },
    "reviewee": {
      "id": "user_321",
      "username": "maria_vendedora",
      "avatar": "https://cdn.example.com/maria.jpg"
    },
    "rating": {
      "overall": 5,
      "communication": 5,
      "product_quality": 5,
      "shipping_speed": 4,
      "packaging": 5
    },
    "comment": "Produto exatamente como descrito! Vendedora super atenciosa...",
    "would_recommend": true,
    "tags": ["produto_como_descrito", "envio_rapido", "bem_embalado"],
    "is_anonymous": true,
    "created_at": "2025-11-06T10:00:00Z",
    "helpful_count": 0
  },
  "message": "Avaliação criada com sucesso! Ela será visível quando a outra pessoa também avaliar ou após 15 dias."
}
```

**Validations:**
- `overall`: 1-5 (obrigatório)
- `communication`, `product_quality`, `shipping_speed`, `packaging`: 1-5 (opcional)
- `comment`: 20-500 caracteres (opcional)
- `tags`: array de strings pré-definidas (opcional)

**Available Tags:**
```json
[
  "produto_como_descrito",
  "produto_melhor_que_esperado",
  "produto_pior_que_esperado",
  "envio_rapido",
  "envio_demorado",
  "bem_embalado",
  "embalagem_ruim",
  "comunicacao_excelente",
  "comunicacao_ruim",
  "vendedor_confiavel",
  "problema_resolvido"
]
```

**Error Responses:**

`400 Bad Request` - Dados inválidos
```json
{
  "error": {
    "code": "INVALID_RATING",
    "message": "Rating overall deve ser entre 1 e 5"
  }
}
```

`403 Forbidden` - Não pode avaliar
```json
{
  "error": {
    "code": "REVIEW_WINDOW_EXPIRED",
    "message": "O prazo para avaliar este pedido já expirou (15 dias após entrega)"
  }
}
```

`409 Conflict` - Já avaliado
```json
{
  "error": {
    "code": "ALREADY_REVIEWED",
    "message": "Você já avaliou este pedido"
  }
}
```

**Notes:**
- Avaliações são anônimas até que ambos avaliem ou 15 dias se passem
- Após revelação, não podem mais ser editadas
- Sistema detecta e modera avaliações com linguagem inadequada
- Compradora avalia: qualidade do produto, descrição, embalagem, envio
- Vendedora avalia: comunicação da compradora, pagamento rápido

---

### 21.3 List Received Reviews

**Endpoint:** `GET /reviews/received`

**Description:** Lista todas as avaliações que o usuário recebeu.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 50)
- `rating` (optional): filtrar por rating (1-5)
- `type` (optional): `as_seller` ou `as_buyer`

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "rev_123",
      "type": "buyer_to_seller",
      "reviewer": {
        "id": "user_123",
        "username": "ana_compradora",
        "avatar": "https://cdn.example.com/ana.jpg"
      },
      "rating": {
        "overall": 5,
        "communication": 5,
        "product_quality": 5,
        "shipping_speed": 4,
        "packaging": 5
      },
      "comment": "Produto exatamente como descrito!",
      "would_recommend": true,
      "tags": ["produto_como_descrito", "envio_rapido"],
      "created_at": "2025-11-06T10:00:00Z",
      "helpful_count": 12,
      "response": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 98,
    "per_page": 20
  },
  "summary": {
    "total_reviews": 98,
    "average_rating": 4.8,
    "rating_distribution": {
      "5": 82,
      "4": 12,
      "3": 3,
      "2": 1,
      "1": 0
    },
    "would_recommend_percentage": 96
  }
}
```

---

### 21.4 List Given Reviews

**Endpoint:** `GET /reviews/given`

**Description:** Lista todas as avaliações que o usuário deu.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "rev_456",
      "order_id": "ord_789",
      "type": "buyer_to_seller",
      "reviewee": {
        "id": "user_321",
        "username": "maria_vendedora",
        "avatar": "https://cdn.example.com/maria.jpg"
      },
      "product": {
        "id": "prod_456",
        "title": "Vestido Floral",
        "image": "https://cdn.example.com/vestido.jpg"
      },
      "rating": {
        "overall": 5
      },
      "comment": "Produto excelente!",
      "created_at": "2025-11-06T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "per_page": 20
  }
}
```

---

### 21.5 Respond to Review

**Endpoint:** `POST /reviews/:id/response`

**Description:** Vendedora responde a uma avaliação recebida.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "response": "Obrigada pelo feedback! Foi um prazer atender você. Volte sempre! 💕"
}
```

**Response:** `200 OK`
```json
{
  "response": {
    "id": "resp_123",
    "review_id": "rev_123",
    "text": "Obrigada pelo feedback! Foi um prazer atender você. Volte sempre! 💕",
    "created_at": "2025-11-06T11:00:00Z"
  }
}
```

**Validations:**
- `response`: 10-300 caracteres
- Apenas o avaliado pode responder
- Apenas 1 resposta por avaliação

**Error Responses:**

`403 Forbidden`
```json
{
  "error": {
    "code": "NOT_REVIEWEE",
    "message": "Apenas o avaliado pode responder a esta avaliação"
  }
}
```

`409 Conflict`
```json
{
  "error": {
    "code": "ALREADY_RESPONDED",
    "message": "Você já respondeu a esta avaliação"
  }
}
```

---

### 21.6 Mark Review as Helpful

**Endpoint:** `POST /reviews/:id/helpful`

**Description:** Marca uma avaliação como útil.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "helpful_count": 13,
  "user_marked_helpful": true
}
```

**Notes:**
- Usuário pode marcar/desmarcar (toggle)
- Não pode marcar própria avaliação como útil

---

### 21.7 Report Review

**Endpoint:** `POST /reviews/:id/report`

**Description:** Reporta uma avaliação inadequada.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "inappropriate_language",
  "details": "A avaliação contém xingamentos"
}
```

**Response:** `200 OK`
```json
{
  "report": {
    "id": "report_123",
    "review_id": "rev_123",
    "reason": "inappropriate_language",
    "status": "pending",
    "created_at": "2025-11-06T12:00:00Z"
  },
  "message": "Denúncia recebida. Nossa equipe irá analisar em até 24h."
}
```

**Report Reasons:**
```json
[
  "inappropriate_language",
  "personal_information",
  "spam",
  "not_related",
  "fake_review",
  "offensive_content"
]
```

---

### 21.8 Get User Public Reviews

**Endpoint:** `GET /users/:username/reviews`

**Description:** Exibe avaliações públicas de um usuário (perfil público).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `type` (optional): `as_seller` ou `as_buyer`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user_321",
    "username": "maria_vendedora",
    "avatar": "https://cdn.example.com/maria.jpg",
    "seller_score": 95,
    "seller_since": "2024-01-15T00:00:00Z"
  },
  "reviews_summary": {
    "total_reviews": 156,
    "average_rating": 4.9,
    "rating_distribution": {
      "5": 142,
      "4": 12,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "would_recommend_percentage": 98,
    "badges": [
      {
        "type": "top_seller",
        "label": "Top Vendedora",
        "icon": "⭐",
        "earned_at": "2025-01-01T00:00:00Z"
      },
      {
        "type": "fast_shipping",
        "label": "Envio Rápido",
        "icon": "📦",
        "earned_at": "2025-03-15T00:00:00Z"
      },
      {
        "type": "excellent_communication",
        "label": "Comunicação Excelente",
        "icon": "💬",
        "earned_at": "2025-06-01T00:00:00Z"
      }
    ]
  },
  "reviews": [
    {
      "id": "rev_123",
      "reviewer": {
        "username": "ana_compradora",
        "avatar": "https://cdn.example.com/ana.jpg"
      },
      "rating": {
        "overall": 5
      },
      "comment": "Produto exatamente como descrito!",
      "tags": ["produto_como_descrito", "envio_rapido"],
      "created_at": "2025-11-06T10:00:00Z",
      "helpful_count": 12,
      "response": {
        "text": "Obrigada! 💕",
        "created_at": "2025-11-06T11:00:00Z"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 16,
    "total_items": 156,
    "per_page": 10
  }
}
```

---

### 21.9 Rating Calculation Algorithm

**Overall Rating Calculation (Weighted by Recency):**

```python
def calculate_overall_rating(reviews):
    """
    Calcula rating médio ponderado por recência.
    Avaliações mais recentes têm mais peso.
    """
    weighted_sum = 0
    total_weight = 0

    for review in reviews:
        days_old = (datetime.now() - review.created_at).days

        # Peso baseado na idade da avaliação
        if days_old <= 30:
            weight = 1.0      # Último mês: peso total
        elif days_old <= 90:
            weight = 0.8      # 1-3 meses: 80%
        elif days_old <= 180:
            weight = 0.6      # 3-6 meses: 60%
        else:
            weight = 0.4      # Mais de 6 meses: 40%

        weighted_sum += review.overall_rating * weight
        total_weight += weight

    if total_weight == 0:
        return None

    return round(weighted_sum / total_weight, 2)
```

**Seller Score Calculation (0-100):**

```python
def calculate_seller_score(user):
    """
    Calcula score de 0-100 baseado em múltiplos fatores.
    """
    score = 0

    # 1. Rating médio (40 pontos)
    if user.average_rating:
        score += (user.average_rating / 5) * 40

    # 2. Total de avaliações (20 pontos)
    # Máximo em 100 avaliações
    score += min(user.total_reviews / 100 * 20, 20)

    # 3. Percentual de recomendação (20 pontos)
    if user.total_reviews > 0:
        score += (user.would_recommend_percentage / 100) * 20

    # 4. Taxa de resposta a mensagens (10 pontos)
    if user.total_messages_received > 0:
        response_rate = user.messages_responded / user.total_messages_received
        score += response_rate * 10

    # 5. Tempo médio de resposta (10 pontos)
    if user.avg_response_time_hours:
        if user.avg_response_time_hours <= 2:
            score += 10      # Menos de 2h: pontuação máxima
        elif user.avg_response_time_hours <= 6:
            score += 7       # 2-6h
        elif user.avg_response_time_hours <= 24:
            score += 5       # 6-24h
        else:
            score += 2       # Mais de 24h

    return min(int(score), 100)
```

---

### 21.10 Badges System

**Badge Types:**

1. **Top Seller (Top Vendedora)** ⭐
   - Critérios: Score ≥ 90 + 50+ avaliações

2. **Fast Shipping (Envio Rápido)** 📦
   - Critérios: 80%+ dos pedidos enviados em < 48h

3. **Excellent Communication (Comunicação Excelente)** 💬
   - Critérios: Taxa de resposta ≥ 95% + tempo médio < 6h

4. **Reliable (Confiável)** ✓
   - Critérios: 100+ vendas + 0% de cancelamentos

5. **Rising Star (Estrela em Ascensão)** 🌟
   - Critérios: Conta nova (< 3 meses) + 10+ vendas + rating ≥ 4.8

**Badge Verification:**
- Verificadas automaticamente a cada 24h
- Removidas se critérios não forem mais atendidos
- Exibidas no perfil e nos cards de produto

---

### 21.11 Review Moderation

**Automatic Flagging:**

Sistema detecta automaticamente:
- Palavrões e linguagem ofensiva
- Informações pessoais (telefone, email, CPF)
- Spam (mensagens repetitivas)
- URLs externas (tentativa de desviar compra)

**Moderation Flow:**
```
Review Criada → Auto-flagging → Revisão Manual (se flagged) → Aprovação/Remoção
```

**Actions:**
- **Aprovada**: Publicada normalmente
- **Editada**: Moderador remove partes inadequadas
- **Removida**: Violação grave, usuário notificado
- **Conta Suspensa**: Múltiplas violações

---

### 21.12 Review Display Rules

**Visibility:**
- Avaliações são anônimas até:
  - Ambos avaliarem, OU
  - 15 dias após entrega

**Default Sort Order:**
- Mais úteis primeiro (helpful_count)
- Mais recentes em caso de empate

**Display:**
- Perfil público: 10 por página
- Produto: mostrar últimas 5 avaliações da vendedora
- Dashboard vendedora: todas as avaliações

---

## 22. CARTEIRA DIGITAL E PAGAMENTOS

Sistema de carteira digital para gerenciar saldo, saques (PIX e transferência bancária) e histórico de transações.

---

### 22.1 Get Wallet Balance

**Endpoint:** `GET /wallet`

**Description:** Retorna saldo da carteira e resumo de transações.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "wallet": {
    "user_id": "user_123",
    "balance": {
      "available": 450.00,
      "pending": 230.00,
      "total": 680.00
    },
    "currency": "BRL",
    "last_updated": "2025-11-06T10:00:00Z"
  },
  "pending_sales": [
    {
      "sale_id": "sale_789",
      "product_title": "Vestido Floral",
      "amount": 115.00,
      "net_amount": 103.50,
      "commission": 11.50,
      "delivered_at": "2025-11-01T14:30:00Z",
      "release_date": "2025-11-08T14:30:00Z",
      "days_remaining": 2
    }
  ],
  "recent_transactions": [
    {
      "id": "txn_456",
      "type": "credit",
      "amount": 92.00,
      "description": "Venda: Bolsa Couro Marrom",
      "status": "completed",
      "created_at": "2025-11-05T09:15:00Z"
    },
    {
      "id": "txn_455",
      "type": "debit",
      "amount": 200.00,
      "description": "Saque via PIX",
      "status": "completed",
      "created_at": "2025-11-04T16:20:00Z"
    }
  ]
}
```

**Balance Types:**
- `available`: Disponível para saque imediato
- `pending`: Aguardando período de segurança (7 dias após entrega)
- `total`: Soma de available + pending

**Notes:**
- Saldo atualizado em tempo real
- Período de segurança: 7 dias após entrega confirmada
- Comissão padrão: 10% por venda

---

### 22.2 Get Transaction History

**Endpoint:** `GET /wallet/transactions`

**Description:** Histórico completo de transações da carteira.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `type` (optional): `credit`, `debit`, `refund`
- `status` (optional): `pending`, `completed`, `failed`, `cancelled`
- `date_from` (optional): ISO 8601 date
- `date_to` (optional): ISO 8601 date

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "txn_789",
      "type": "credit",
      "amount": 92.00,
      "description": "Venda: Bolsa Couro Marrom",
      "reference_type": "sale",
      "reference_id": "sale_456",
      "status": "completed",
      "created_at": "2025-11-05T09:15:00Z",
      "completed_at": "2025-11-05T09:15:01Z"
    },
    {
      "id": "txn_788",
      "type": "debit",
      "amount": 200.00,
      "description": "Saque via PIX",
      "reference_type": "withdrawal",
      "reference_id": "wd_123",
      "status": "completed",
      "fee": 0.00,
      "created_at": "2025-11-04T16:20:00Z",
      "completed_at": "2025-11-04T16:25:00Z"
    },
    {
      "id": "txn_787",
      "type": "refund",
      "amount": 65.00,
      "description": "Estorno: Pedido #12345 cancelado",
      "reference_type": "order",
      "reference_id": "ord_999",
      "status": "completed",
      "created_at": "2025-11-03T11:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 8,
    "total_items": 156,
    "per_page": 20
  },
  "summary": {
    "total_credits": 2450.00,
    "total_debits": 1800.00,
    "net_balance": 650.00
  }
}
```

**Transaction Types:**
- `credit`: Entrada de dinheiro (vendas, reembolsos recebidos)
- `debit`: Saída de dinheiro (saques, reembolsos dados)
- `refund`: Estornos (cancelamentos)

**Transaction Status:**
- `pending`: Aguardando processamento
- `completed`: Concluída com sucesso
- `failed`: Falhou (erro no processamento)
- `cancelled`: Cancelada pelo usuário

---

### 22.3 Request Withdrawal

**Endpoint:** `POST /wallet/withdrawals`

**Description:** Solicita saque via PIX ou transferência bancária.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body (PIX):**
```json
{
  "amount": 150.00,
  "method": "pix",
  "pix_key": "12345678900",
  "pix_key_type": "cpf"
}
```

**Request Body (Bank Transfer):**
```json
{
  "amount": 300.00,
  "method": "bank_transfer",
  "bank_account": {
    "bank_code": "001",
    "bank_name": "Banco do Brasil",
    "agency": "1234",
    "account": "12345-6",
    "account_type": "checking",
    "document": "12345678900",
    "holder_name": "Maria Silva"
  }
}
```

**Response:** `201 Created`
```json
{
  "withdrawal": {
    "id": "wd_789",
    "user_id": "user_123",
    "amount": 150.00,
    "fee": 0.00,
    "net_amount": 150.00,
    "method": "pix",
    "pix_key": "123.456.789-00",
    "pix_key_type": "cpf",
    "status": "pending",
    "created_at": "2025-11-06T14:00:00Z",
    "estimated_completion": "2025-11-06T14:30:00Z"
  },
  "message": "Saque solicitado! Processamento em até 30 minutos."
}
```

**PIX Key Types:**
```json
["cpf", "cnpj", "email", "phone", "random"]
```

**Account Types:**
```json
["checking", "savings"]
```

**Validations:**
- Valor mínimo: R$ 10,00
- Valor máximo por saque: R$ 5.000,00
- Máximo 3 saques por dia
- Saldo disponível deve ser suficiente
- CPF/CNPJ deve estar validado

**Error Responses:**

`400 Bad Request` - Valor inválido
```json
{
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Valor mínimo para saque é R$ 10,00"
  }
}
```

`403 Forbidden` - Saldo insuficiente
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo disponível insuficiente. Disponível: R$ 50,00"
  }
}
```

`429 Too Many Requests` - Limite de saques
```json
{
  "error": {
    "code": "WITHDRAWAL_LIMIT_EXCEEDED",
    "message": "Você atingiu o limite de 3 saques por dia. Tente novamente amanhã."
  }
}
```

**Processing Times:**
- **PIX**: 5-30 minutos
- **Bank Transfer (TED)**: Mesmo dia útil (até 17h)
- **Bank Transfer (DOC)**: 1-2 dias úteis

---

### 22.4 List Withdrawals

**Endpoint:** `GET /wallet/withdrawals`

**Description:** Lista histórico de saques.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): `pending`, `processing`, `completed`, `failed`, `cancelled`

**Response:** `200 OK`
```json
{
  "withdrawals": [
    {
      "id": "wd_789",
      "amount": 150.00,
      "fee": 0.00,
      "net_amount": 150.00,
      "method": "pix",
      "pix_key": "123.456.789-00",
      "status": "completed",
      "created_at": "2025-11-06T14:00:00Z",
      "completed_at": "2025-11-06T14:15:00Z"
    },
    {
      "id": "wd_788",
      "amount": 300.00,
      "fee": 0.00,
      "net_amount": 300.00,
      "method": "bank_transfer",
      "bank_account": {
        "bank_name": "Banco do Brasil",
        "agency": "1234",
        "account": "12345-6"
      },
      "status": "processing",
      "created_at": "2025-11-05T10:00:00Z",
      "estimated_completion": "2025-11-05T17:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "per_page": 20
  }
}
```

**Withdrawal Status:**
- `pending`: Aguardando processamento
- `processing`: Em processamento
- `completed`: Concluído com sucesso
- `failed`: Falhou (erro bancário)
- `cancelled`: Cancelado pelo usuário

---

### 22.5 Get Withdrawal Details

**Endpoint:** `GET /wallet/withdrawals/:id`

**Description:** Detalhes de um saque específico.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "withdrawal": {
    "id": "wd_789",
    "user_id": "user_123",
    "amount": 150.00,
    "fee": 0.00,
    "net_amount": 150.00,
    "method": "pix",
    "pix_key": "123.456.789-00",
    "pix_key_type": "cpf",
    "status": "completed",
    "created_at": "2025-11-06T14:00:00Z",
    "processed_at": "2025-11-06T14:10:00Z",
    "completed_at": "2025-11-06T14:15:00Z",
    "transaction_id": "txn_999",
    "receipt_url": "https://cdn.example.com/receipts/wd_789.pdf"
  }
}
```

---

### 22.6 Cancel Withdrawal

**Endpoint:** `DELETE /wallet/withdrawals/:id`

**Description:** Cancela um saque pendente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "message": "Saque cancelado com sucesso",
  "refunded_amount": 150.00
}
```

**Error Responses:**

`400 Bad Request`
```json
{
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Apenas saques com status 'pending' podem ser cancelados"
  }
}
```

**Notes:**
- Apenas saques com status `pending` podem ser cancelados
- Valor é devolvido instantaneamente ao saldo disponível

---

### 22.7 Add Bank Account

**Endpoint:** `POST /wallet/bank-accounts`

**Description:** Adiciona conta bancária para saques futuros.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bank_code": "001",
  "agency": "1234",
  "account": "12345-6",
  "account_type": "checking",
  "document": "12345678900",
  "holder_name": "Maria Silva",
  "is_default": true
}
```

**Response:** `201 Created`
```json
{
  "bank_account": {
    "id": "ba_123",
    "bank_code": "001",
    "bank_name": "Banco do Brasil",
    "agency": "1234",
    "account": "12345-6",
    "account_type": "checking",
    "holder_name": "Maria Silva",
    "is_default": true,
    "verified": false,
    "created_at": "2025-11-06T15:00:00Z"
  }
}
```

**Brazilian Bank Codes (Examples):**
```json
{
  "001": "Banco do Brasil",
  "033": "Santander",
  "104": "Caixa Econômica",
  "237": "Bradesco",
  "341": "Itaú",
  "260": "Nubank",
  "077": "Banco Inter",
  "212": "Banco Original"
}
```

**Validations:**
- `bank_code`: Código de 3 dígitos
- `agency`: 4-5 dígitos
- `account`: Formato válido com dígito verificador
- `document`: CPF ou CNPJ válido
- `holder_name`: Deve coincidir com documento

**Notes:**
- Máximo 5 contas por usuário
- Verificação pode exigir depósito teste (micro-depósito)

---

### 22.8 List Bank Accounts

**Endpoint:** `GET /wallet/bank-accounts`

**Description:** Lista contas bancárias cadastradas.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "bank_accounts": [
    {
      "id": "ba_123",
      "bank_code": "001",
      "bank_name": "Banco do Brasil",
      "agency": "1234",
      "account": "***45-6",
      "account_type": "checking",
      "is_default": true,
      "verified": true
    },
    {
      "id": "ba_124",
      "bank_code": "260",
      "bank_name": "Nubank",
      "agency": "0001",
      "account": "***89-0",
      "account_type": "checking",
      "is_default": false,
      "verified": false
    }
  ]
}
```

**Notes:**
- Número da conta é mascarado por segurança
- Contas não verificadas podem ter restrições

---

### 22.9 Automatic Fund Release

**Celery Task (Backend):**

```python
from celery import shared_task
from datetime import timedelta
from django.utils import timezone

@shared_task
def release_pending_sales():
    """
    Executa diariamente via cron.
    Libera fundos de vendas após 7 dias da entrega confirmada.
    """
    cutoff_date = timezone.now() - timedelta(days=7)

    # Busca vendas entregues há mais de 7 dias e ainda não liberadas
    sales = Sale.objects.filter(
        status="delivered",
        delivered_at__lte=cutoff_date,
        released_to_wallet=False
    )

    for sale in sales:
        seller = sale.product.seller

        # Adiciona ao saldo disponível
        seller.wallet_balance += sale.net_amount
        seller.save()

        # Cria transação
        Transaction.objects.create(
            user=seller,
            type="credit",
            amount=sale.net_amount,
            description=f"Venda: {sale.product.title}",
            reference_type="sale",
            reference_id=sale.id,
            status="completed"
        )

        # Marca como liberado
        sale.released_to_wallet = True
        sale.wallet_released_at = timezone.now()
        sale.save()

        # Notifica vendedora
        send_notification(
            user=seller,
            type="funds_released",
            title="Saldo liberado! 💰",
            body=f"R$ {sale.net_amount} da venda '{sale.product.title}' foi liberado na sua carteira."
        )
```

**Cron Schedule:**
```bash
# Execute diariamente às 3h AM
0 3 * * * python manage.py release_pending_sales
```

---

### 22.10 Transaction Flow

**Complete Flow:**

```
1. Venda Confirmada (Pagamento aprovado)
   ↓
2. Dinheiro vai para "pending" (período de segurança)
   ↓
3. Produto enviado pela vendedora
   ↓
4. Compradora confirma recebimento
   ↓
5. Aguarda 7 dias (período de segurança)
   ↓
6. Task automática libera fundos
   ↓
7. Dinheiro vai para "available" (pode sacar)
   ↓
8. Vendedora solicita saque
   ↓
9. Processamento (PIX: 30min / TED: mesmo dia)
   ↓
10. Dinheiro depositado na conta bancária
```

**Example Calculation:**

```
Venda: R$ 100,00
Comissão (10%): - R$ 10,00
Valor líquido: R$ 90,00

→ R$ 90,00 vai para "pending"
→ Após 7 dias: R$ 90,00 vai para "available"
→ Vendedora pode sacar R$ 90,00
```

---

### 22.11 Withdrawal Fees

**Current Fees:** R$ 0,00 (sem taxa)

**Future Pricing (if implemented):**
- PIX: R$ 0,00 (grátis)
- TED: R$ 2,00
- DOC: R$ 5,00

**Free Withdrawal Program:**
- 1 saque grátis por mês
- Saques adicionais: taxas normais

---

### 22.12 Security & Compliance

**KYC (Know Your Customer):**
- CPF/CNPJ obrigatório e validado
- Nome deve coincidir com documento
- Verificação de conta bancária (micro-depósito ou validação instantânea)

**AML (Anti-Money Laundering):**
- Limite diário: R$ 5.000,00
- Limite mensal: R$ 50.000,00
- Transações acima de R$ 10.000,00 são reportadas

**Fraud Prevention:**
- Período de segurança de 7 dias
- Bloqueio automático de padrões suspeitos
- Verificação 2FA para saques acima de R$ 1.000,00

**Data Protection:**
- Dados bancários criptografados (AES-256)
- Número de conta mascarado na exibição
- Logs de auditoria completos

---

## 23. CASHBACK

Sistema de cashback para incentivar compras recorrentes. Compradora ganha créditos que podem ser usados como desconto em futuras compras.

---

### 23.1 Get Cashback Balance

**Endpoint:** `GET /cashback`

**Description:** Retorna saldo de cashback da compradora.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "balance": {
    "available": 45.50,
    "pending": 18.60,
    "expired": 12.00,
    "total_earned": 156.10
  },
  "pending_cashback": [
    {
      "order_id": "ord_abc123",
      "amount": 18.60,
      "percentage": 10,
      "will_be_available_at": "2025-11-27T00:00:00Z",
      "days_remaining": 4,
      "reason": "Aguardando período de segurança (7 dias após entrega)"
    }
  ],
  "expiring_soon": [
    {
      "amount": 8.50,
      "expires_at": "2025-12-15T00:00:00Z",
      "days_remaining": 32
    }
  ],
  "stats": {
    "total_earned": 156.10,
    "total_used": 98.60,
    "total_expired": 12.00,
    "average_per_purchase": 15.61,
    "next_expiration_date": "2025-12-15"
  }
}
```

**Balance Types:**
- `available`: Cashback disponível para uso imediato
- `pending`: Aguardando período de segurança (7 dias após entrega)
- `expired`: Total de cashback que expirou
- `total_earned`: Total acumulado desde o cadastro

**Notes:**
- Cashback é creditado após 7 dias da entrega confirmada
- Validade: 180 dias (6 meses)
- Primeira compra: 15% de cashback (bônus)
- Demais compras: 10% de cashback

---

### 23.2 Get Cashback Transactions

**Endpoint:** `GET /cashback/transactions`

**Description:** Histórico completo de transações de cashback.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `type` (optional): `earned`, `used`, `expired`, `refunded`, `bonus`
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "cb_txn_abc123",
      "type": "earned",
      "amount": 18.60,
      "percentage": 10,
      "order": {
        "id": "ord_abc123",
        "order_number": "1234",
        "total": 186.00,
        "product": {
          "title": "Vestido Floral",
          "image": "https://cdn.example.com/vestido.jpg"
        }
      },
      "status": "pending",
      "available_at": "2025-11-27T00:00:00Z",
      "expires_at": "2026-05-27T00:00:00Z",
      "created_at": "2025-11-20T16:20:00Z"
    },
    {
      "id": "cb_txn_def456",
      "type": "used",
      "amount": -20.00,
      "order": {
        "id": "ord_def456",
        "order_number": "1235",
        "total": 150.00
      },
      "status": "completed",
      "created_at": "2025-11-18T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 8,
    "total_items": 156,
    "per_page": 20
  }
}
```

**Transaction Types:**
- `earned`: Cashback ganho em compra
- `used`: Cashback usado como desconto
- `expired`: Cashback expirado (180 dias)
- `refunded`: Estorno de cashback (compra cancelada)
- `bonus`: Bônus especial (campanha, primeira compra, etc.)

---

### 23.3 Apply Cashback to Cart

**Endpoint:** `POST /cashback/apply`

**Description:** Aplica cashback como desconto no carrinho.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 20.00
}
```

**Response:** `200 OK`
```json
{
  "applied": 20.00,
  "remaining_balance": 25.50,
  "cart_summary": {
    "subtotal": 186.00,
    "cashback_discount": -20.00,
    "shipping": 15.00,
    "total": 181.00
  }
}
```

**Validations:**
- Valor mínimo: R$ 5,00
- Valor máximo: 50% do subtotal do carrinho
- Saldo disponível deve ser suficiente

---

### 23.4 Remove Cashback from Cart

**Endpoint:** `DELETE /cashback/apply`

**Description:** Remove cashback aplicado no carrinho.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "removed": 20.00,
  "balance": 45.50,
  "cart_summary": {
    "subtotal": 186.00,
    "cashback_discount": 0,
    "shipping": 15.00,
    "total": 201.00
  }
}
```

---

## 24. SISTEMA DE DISPUTAS

Sistema completo de mediação de conflitos entre compradoras e vendedoras quando há problemas com pedidos.

---

### 24.1 Create Dispute

**Endpoint:** `POST /disputes`

**Description:** Abre uma disputa sobre um pedido com problema.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "order_id": "ord_abc123",
  "reason": "not_as_described",
  "description": "O vestido veio em tamanho diferente do anunciado.",
  "desired_resolution": "refund",
  "evidence": [
    {
      "type": "image",
      "url": "dispute_img_abc123.jpg",
      "description": "Etiqueta mostrando tamanho P"
    }
  ]
}
```

**Dispute Reasons:**
- `not_received`: Produto não recebido
- `not_as_described`: Diferente do anunciado
- `defective`: Com defeito ou danificado
- `damaged`: Danificado no transporte
- `wrong_item`: Item errado enviado
- `late_shipping`: Atraso excessivo no envio

**Desired Resolutions:**
- `refund`: Reembolso total
- `partial_refund`: Reembolso parcial
- `replacement`: Troca do produto
- `return`: Devolução com reembolso

**Response:** `201 Created`
```json
{
  "id": "disp_abc123",
  "dispute_number": "DISP-1234",
  "status": "open",
  "seller_response_deadline": "2025-11-24T23:59:59Z",
  "created_at": "2025-11-21T10:00:00Z"
}
```

**Validations:**
- Prazo: 7 dias após entrega
- `description`: 50-1000 caracteres
- `evidence`: máximo 5 itens

---

### 24.2 List Disputes

**Endpoint:** `GET /disputes`

**Description:** Lista todas as disputas do usuário.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): `open`, `in_review`, `resolved`
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "disputes": [
    {
      "id": "disp_abc123",
      "dispute_number": "DISP-1234",
      "order": {
        "order_number": "1234",
        "product": {
          "title": "Vestido floral midi"
        }
      },
      "reason": "not_as_described",
      "status": "open",
      "created_at": "2025-11-21T10:00:00Z"
    }
  ]
}
```

---

### 24.3 Get Dispute Details

**Endpoint:** `GET /disputes/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": "disp_abc123",
  "dispute_number": "DISP-1234",
  "order": {...},
  "reason": "not_as_described",
  "status": "in_review",
  "timeline": [...],
  "evidence": [...],
  "messages": [...]
}
```

---

### 24.4 Send Dispute Message

**Endpoint:** `POST /disputes/:id/messages`

**Request Body:**
```json
{
  "text": "Aceito fazer o reembolso total."
}
```

**Response:** `201 Created`

---

### 24.5 Add Evidence

**Endpoint:** `POST /disputes/:id/evidence`

**Request Body:**
```json
{
  "type": "image",
  "url": "dispute_img_ghi789.jpg",
  "description": "Medição do vestido"
}
```

**Response:** `201 Created`

---

### 24.6 Seller Respond

**Endpoint:** `POST /disputes/:id/respond`

**Request Body:**
```json
{
  "response": "accept_refund",
  "message": "Reconheço o erro."
}
```

**Response:** `200 OK`

---

### 24.7 Escalate to Platform

**Endpoint:** `POST /disputes/:id/escalate`

**Response:** `200 OK`

---

## 25. ADMIN PANEL

Sistema administrativo completo para gestão da plataforma, moderação de conteúdo, análise de métricas e suporte.

---

### 25.1 Admin Authentication

**Endpoint:** `POST /admin/auth/login`

**Description:** Login para administradores.

**Request Body:**
```json
{
  "email": "admin@apegadesapega.com.br",
  "password": "Admin@123",
  "two_factor_code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "admin": {
    "id": "admin_abc123",
    "name": "Admin User",
    "email": "admin@apegadesapega.com.br",
    "role": "admin",
    "permissions": [
      "users.view",
      "users.edit",
      "products.moderate",
      "disputes.resolve"
    ]
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 28800
}
```

**Admin Roles:**
- `super_admin`: Acesso total
- `admin`: Gestão e moderação
- `moderator`: Apenas moderação de conteúdo
- `support`: Apenas suporte e disputas
- `analyst`: Apenas visualização de analytics

**Notes:**
- Admin tokens expiram em 8 horas
- 2FA obrigatório para todos os admins

---

### 25.2 Admin Dashboard

**Endpoint:** `GET /admin/dashboard`

**Description:** Dashboard principal com métricas e alertas.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `period`: `today`, `week`, `month`, `year`
- `compare_previous`: `true`/`false`

**Response:** `200 OK`
```json
{
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z",
    "label": "Novembro 2025"
  },
  "overview": {
    "total_users": 12543,
    "new_users": 342,
    "new_users_change": 15.2,
    "active_users": 3421,
    "total_sellers": 4532,
    "new_sellers": 89
  },
  "revenue": {
    "total": 125430.00,
    "change": 18.7,
    "gmv": 1254300.00,
    "commission": 125430.00,
    "average_order_value": 186.50
  },
  "orders": {
    "total": 673,
    "change": 12.5,
    "pending": 45,
    "shipped": 234,
    "delivered": 378,
    "cancelled": 16,
    "cancellation_rate": 2.4,
    "conversion_rate": 3.8
  },
  "support": {
    "pending_disputes": 8,
    "pending_tickets": 23,
    "avg_response_time_hours": 4.2,
    "flagged_reviews": 5
  },
  "alerts": [
    {
      "type": "warning",
      "title": "8 disputas pendentes",
      "message": "Há disputas aguardando análise há mais de 2 dias",
      "action_url": "/admin/disputes?status=pending",
      "priority": "high"
    }
  ]
}
```

---

### 25.3 User Management

**Endpoint:** `GET /admin/users`

**Description:** Lista usuários com filtros avançados.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `search`: Nome ou email
- `role`: `buyer`, `seller`, `both`
- `status`: `active`, `suspended`, `banned`
- `verified`: `true`/`false`
- `sort`: `newest`, `oldest`, `most_active`, `most_sales`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "usr_abc123",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "(54) 99999-9999",
      "status": "active",
      "is_seller": true,
      "is_featured": true,
      "email_verified": true,
      "stats": {
        "total_sales": 156,
        "average_rating": 4.9,
        "dispute_rate": 1.2,
        "wallet_balance": 450.00
      },
      "flags": [],
      "created_at": "2023-01-15T10:00:00Z",
      "last_active": "2025-11-21T09:30:00Z"
    }
  ],
  "pagination": {...},
  "stats": {
    "total": 12543,
    "active": 11234,
    "suspended": 89,
    "banned": 34
  }
}
```

**User Flags:**
- `multiple_disputes`
- `high_cancellation_rate`
- `suspicious_activity`
- `reported_multiple_times`
- `fake_reviews_suspected`

---

### 25.4 User Actions

**Suspend User:** `POST /admin/users/:id/suspend`
```json
{
  "reason": "Múltiplos atrasos no envio",
  "duration_days": 7,
  "notify_user": true,
  "message": "Sua conta foi suspensa por 7 dias..."
}
```

**Ban User:** `POST /admin/users/:id/ban`
```json
{
  "reason": "Fraude comprovada",
  "permanent": true,
  "refund_pending_orders": true,
  "notify_user": true
}
```

**Verify User:** `POST /admin/users/:id/verify`
```json
{
  "verify_email": true,
  "verify_phone": true,
  "verify_identity": true,
  "notes": "Documentos verificados manualmente"
}
```

**Feature Seller:** `POST /admin/users/:id/featured`
```json
{
  "featured": true,
  "reason": "Vendedora top com excelente rating"
}
```

---

### 25.5 Product Management

**Endpoint:** `GET /admin/products`

**Description:** Lista produtos para moderação.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: `active`, `pending`, `rejected`, `removed`
- `search`: Título do produto
- `category`: Nome da categoria
- `reported`: `true`/`false`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "prd_abc123",
      "title": "Vestido floral midi",
      "price": 65.00,
      "images": [...],
      "category": "Vestidos",
      "status": "active",
      "seller": {
        "id": "usr_abc123",
        "name": "Maria Silva",
        "rating": 4.9
      },
      "stats": {
        "views": 234,
        "favorites": 15,
        "reports": 0
      },
      "flags": [],
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "stats": {
    "total": 45234,
    "active": 43567,
    "pending": 67,
    "rejected": 234,
    "reported": 12
  }
}
```

**Product Flags:**
- `suspicious_brand`: Marca suspeita (falsificação)
- `price_too_low`: Preço muito baixo
- `inappropriate_images`: Imagens inapropriadas
- `misleading_description`: Descrição enganosa
- `prohibited_item`: Item proibido

---

### 25.6 Product Actions

**Approve Product:** `PUT /admin/products/:id/approve`
```json
{
  "notes": "Produto aprovado - sem problemas"
}
```

**Reject Product:** `POST /admin/products/:id/reject`
```json
{
  "reason": "suspected_counterfeit",
  "message": "Produto suspeito de falsificação...",
  "notify_seller": true
}
```

**Rejection Reasons:**
- `suspected_counterfeit`
- `inappropriate_content`
- `prohibited_item`
- `misleading_description`
- `poor_quality_images`
- `incomplete_information`

**Remove Product:** `DELETE /admin/products/:id`
```json
{
  "reason": "prohibited_item",
  "notify_seller": true,
  "ban_similar": false
}
```

---

### 25.7 Order Management

**Endpoint:** `GET /admin/orders`

**Description:** Lista todos os pedidos.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: `pending`, `paid`, `shipped`, `delivered`, `cancelled`
- `search`: Número do pedido
- `buyer_id`, `seller_id`
- `start_date`, `end_date`
- `min_amount`, `max_amount`
- `has_dispute`: `true`/`false`

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": "ord_abc123",
      "order_number": "1234",
      "buyer": {
        "id": "usr_abc123",
        "name": "Ana Paula"
      },
      "seller": {
        "id": "usr_def456",
        "name": "Maria Silva"
      },
      "total": 186.00,
      "status": "delivered",
      "payment_method": "credit_card",
      "has_dispute": false,
      "created_at": "2025-11-15T10:00:00Z"
    }
  ],
  "stats": {
    "total": 8543,
    "pending": 45,
    "shipped": 234,
    "delivered": 7890,
    "cancelled": 374
  }
}
```

---

### 25.8 Order Actions

**Refund Order:** `POST /admin/orders/:id/refund`
```json
{
  "amount": 186.00,
  "reason": "admin_request",
  "notes": "Reembolso devido a problema com produto",
  "refund_shipping": true,
  "deduct_from_seller": true
}
```

**Cancel Order:** `POST /admin/orders/:id/cancel`
```json
{
  "reason": "admin_intervention",
  "notes": "Cancelado por solicitação administrativa",
  "refund": true,
  "notify_parties": true
}
```

---

### 25.9 Dispute Management

**Endpoint:** `GET /admin/disputes`

**Description:** Lista disputas para mediação.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: `open`, `in_review`, `resolved`, `closed`
- `priority`: `high`, `medium`, `low`
- `assigned_to`: ID do admin
- `age_days`: Disputas com X dias ou mais

**Response:** `200 OK`
```json
{
  "disputes": [
    {
      "id": "disp_abc123",
      "dispute_number": "DISP-1234",
      "order": {
        "order_number": "1234",
        "total": 186.00
      },
      "buyer": {
        "name": "Ana Paula"
      },
      "seller": {
        "name": "Maria Silva"
      },
      "reason": "not_as_described",
      "status": "in_review",
      "priority": "high",
      "assigned_to": {
        "id": "admin_123",
        "name": "Admin User"
      },
      "age_days": 3,
      "deadline": "2025-11-25T17:00:00Z",
      "created_at": "2025-11-21T10:00:00Z"
    }
  ],
  "stats": {
    "open": 8,
    "in_review": 15,
    "resolved_today": 5,
    "avg_resolution_time_days": 4.2
  }
}
```

---

### 25.10 Dispute Actions

**Assign Dispute:** `POST /admin/disputes/:id/assign`
```json
{
  "admin_id": "admin_123",
  "priority": "high",
  "notes": "Caso prioritário"
}
```

**Add Internal Note:** `POST /admin/disputes/:id/notes`
```json
{
  "note": "Verificar fotos enviadas pela compradora"
}
```

**Resolve Dispute:** `POST /admin/disputes/:id/resolve`
```json
{
  "resolution_type": "refund",
  "refund_amount": 186.00,
  "refund_to": "buyer",
  "compensate_seller": false,
  "reason": "Produto diferente do anunciado",
  "notes": "Reembolso total aprovado",
  "notify_parties": true
}
```

**Resolution Types:**
- `refund`: Reembolso total
- `partial_refund`: Reembolso parcial
- `buyer_keeps_product`: Compradora fica com produto + compensação
- `return_refund`: Devolução + reembolso
- `no_action`: Sem ação (favor da vendedora)

---

### 25.11 Analytics

**Endpoint:** `GET /admin/analytics/revenue`

**Description:** Análise detalhada de receita.

**Query Parameters:**
- `start_date`, `end_date`
- `group_by`: `day`, `week`, `month`
- `breakdown_by`: `category`, `seller_tier`, `payment_method`

**Response:** `200 OK`
```json
{
  "total_revenue": 125430.00,
  "total_gmv": 1254300.00,
  "commission_rate": 10.0,
  "chart_data": [
    {
      "date": "2025-11-01",
      "revenue": 4230.00,
      "gmv": 42300.00,
      "orders": 25
    }
  ],
  "breakdown": {
    "by_category": [
      {
        "category": "Vestidos",
        "revenue": 35123.00,
        "percentage": 28.0,
        "orders": 234
      }
    ]
  },
  "top_sellers": [
    {
      "seller_id": "usr_abc123",
      "name": "Maria Silva",
      "revenue": 12543.00,
      "orders": 89,
      "commission": 1254.30
    }
  ]
}
```

---

### 25.12 Activity Log

**Endpoint:** `GET /admin/users/:id/activity-log`

**Description:** Log completo de atividades do usuário.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `type`: `login`, `purchase`, `sale`, `message`, `dispute`
- `start_date`, `end_date`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "type": "login",
      "description": "Login via mobile app",
      "ip": "201.23.45.67",
      "device": "iPhone 13",
      "location": "Passo Fundo, RS",
      "timestamp": "2025-11-21T09:00:00Z"
    },
    {
      "type": "sale",
      "description": "Venda realizada #5678",
      "amount": 65.00,
      "timestamp": "2025-11-18T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 25.13 Moderação de Reviews

**Endpoint:** `GET /admin/reviews`

**Description:** Listar reviews para moderação.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: `active`, `flagged`, `removed`
- `rating`: `1`, `2`, `3`, `4`, `5`
- `has_response`: `true`, `false`
- `flagged`: `true`
- `sort`: `newest`, `oldest`, `most_helpful`, `most_flagged`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "rev_abc123",
      "type": "buyer_to_seller",
      "reviewer": {
        "id": "usr_abc123",
        "name": "Ana Paula"
      },
      "reviewed_user": {
        "id": "usr_def456",
        "name": "Maria Silva"
      },
      "product": {
        "id": "prd_abc123",
        "title": "Vestido floral midi"
      },
      "overall_rating": 5,
      "comment": "Produto lindo! Recomendo!",
      "images": [...],
      "status": "active",
      "flags": [],
      "reports_count": 0,
      "helpful_count": 8,
      "created_at": "2025-11-25T10:00:00Z"
    },
    {
      "id": "rev_def456",
      "type": "buyer_to_seller",
      "reviewer": {
        "id": "usr_ghi789",
        "name": "Julia Santos"
      },
      "reviewed_user": {
        "id": "usr_abc123",
        "name": "Carla Mendes"
      },
      "overall_rating": 1,
      "comment": "Vendedora horrível, produto falso! Não comprem!!!",
      "status": "flagged",
      "flags": ["profanity", "spam"],
      "reports_count": 3,
      "created_at": "2025-11-24T14:00:00Z"
    }
  ],
  "pagination": {...},
  "stats": {
    "total": 12543,
    "active": 12234,
    "flagged": 23,
    "removed": 286,
    "avg_rating": 4.7
  }
}
```

**Review Flags:**
- `profanity`: Linguagem ofensiva
- `spam`: Spam
- `fake`: Avaliação falsa
- `irrelevant`: Não relevante
- `personal_info`: Informações pessoais
- `defamatory`: Difamatório

---

**Endpoint:** `GET /admin/reviews/:id`

**Description:** Detalhes da review.

**Response:** `200 OK`
```json
{
  "id": "rev_abc123",
  "type": "buyer_to_seller",
  "reviewer": {
    "id": "usr_abc123",
    "name": "Ana Paula Silva",
    "email": "ana@email.com",
    "total_reviews": 12,
    "average_rating_given": 4.5
  },
  "reviewed_user": {
    "id": "usr_def456",
    "name": "Maria Silva",
    "average_rating": 4.9,
    "total_reviews": 127
  },
  "order": {
    "id": "ord_abc123",
    "order_number": "1234",
    "delivered_at": "2025-11-20T16:20:00Z"
  },
  "product": {
    "id": "prd_abc123",
    "title": "Vestido floral midi",
    "image": "https://..."
  },
  "ratings": {
    "as_described": 5,
    "quality": 5,
    "communication": 5,
    "shipping_time": 4,
    "packaging": 5
  },
  "overall_rating": 5,
  "comment": "Produto lindo! Veio muito bem embalado e a vendedora foi super atenciosa. Recomendo!",
  "images": [...],
  "would_recommend": true,
  "status": "active",
  "flags": [],
  "reports": [],
  "seller_response": {
    "comment": "Obrigada pelo carinho! 💚",
    "created_at": "2025-11-25T14:00:00Z"
  },
  "moderation": {
    "auto_flagged": false,
    "reviewed_by": null,
    "reviewed_at": null
  },
  "helpful_count": 8,
  "not_helpful_count": 0,
  "created_at": "2025-11-25T10:00:00Z"
}
```

---

**Endpoint:** `PUT /admin/reviews/:id/approve`

**Description:** Aprovar review.

**Request:**
```json
{
  "notes": "Review aprovada - sem problemas identificados"
}
```

**Response:** `200 OK`
```json
{
  "review_id": "rev_abc123",
  "status": "active",
  "approved_by": "admin_123",
  "approved_at": "2025-11-21T10:00:00Z"
}
```

---

**Endpoint:** `DELETE /admin/reviews/:id`

**Description:** Remover review.

**Request:**
```json
{
  "reason": "spam",
  "notes": "Review contém spam e links externos",
  "notify_reviewer": true,
  "warn_user": false
}
```

**Response:** `204 No Content`

---

**Endpoint:** `PUT /admin/reviews/:id/edit`

**Description:** Editar review (remover partes inapropriadas).

**Request:**
```json
{
  "comment": "Produto bom, mas vendedora demorou para responder.",
  "reason": "Removido linguagem ofensiva",
  "original_comment": "Produto bom, mas vendedora [REMOVIDO] demorou para responder."
}
```

**Response:** `200 OK`
```json
{
  "review_id": "rev_abc123",
  "comment": "Produto bom, mas vendedora demorou para responder.",
  "edited": true,
  "edited_by": "admin_123",
  "edited_at": "2025-11-21T10:00:00Z"
}
```

---

**Endpoint:** `GET /admin/reviews/reports`

**Description:** Reviews denunciadas.

**Query Parameters:**
- `status`: `pending`, `reviewed`, `dismissed`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": "rev_rep_abc123",
      "review": {
        "id": "rev_def456",
        "comment": "Vendedora horrível, produto falso!",
        "rating": 1,
        "reviewer": "Julia Santos"
      },
      "reporter": {
        "id": "usr_abc123",
        "name": "Maria Silva"
      },
      "reason": "offensive",
      "details": "Review contém linguagem ofensiva",
      "status": "pending",
      "created_at": "2025-11-24T15:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

**Endpoint:** `POST /admin/reviews/reports/:id/review`

**Description:** Analisar denúncia de review.

**Request:**
```json
{
  "action": "remove_review",
  "notes": "Review removida - linguagem ofensiva confirmada",
  "warn_reviewer": true
}
```

**Actions:**
- `remove_review`: Remover review
- `edit_review`: Editar review
- `warn_reviewer`: Avisar reviewer
- `dismiss`: Descartar denúncia

**Response:** `200 OK`
```json
{
  "report_id": "rev_rep_abc123",
  "status": "reviewed",
  "action_taken": "remove_review",
  "reviewed_by": "admin_123",
  "reviewed_at": "2025-11-25T10:00:00Z"
}
```

---

### 25.14 Cupons e Promoções

**Endpoint:** `GET /admin/coupons`

**Description:** Listar cupons.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: `active`, `expired`, `disabled`
- `type`: `percentage`, `fixed`, `free_shipping`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "coupons": [
    {
      "id": "coup_abc123",
      "code": "DESFRUTAR",
      "type": "percentage",
      "discount_value": 30,
      "status": "active",
      "usage": {
        "used": 234,
        "limit": 1000
      },
      "valid_from": "2025-11-01T00:00:00Z",
      "valid_until": "2025-12-31T23:59:59Z",
      "created_at": "2025-10-25T10:00:00Z"
    },
    {
      "id": "coup_def456",
      "code": "PRIMEIRACOMPRA",
      "type": "percentage",
      "discount_value": 20,
      "status": "active",
      "restrictions": {
        "first_purchase_only": true
      },
      "usage": {
        "used": 567,
        "limit": null
      },
      "valid_from": "2025-01-01T00:00:00Z",
      "valid_until": null,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {...},
  "stats": {
    "total_active": 12,
    "total_used_today": 45,
    "total_discount_given_today": 1234.50
  }
}
```

---

**Endpoint:** `GET /admin/coupons/:id`

**Description:** Detalhes do cupom.

**Response:** `200 OK`
```json
{
  "id": "coup_abc123",
  "code": "DESFRUTAR",
  "type": "percentage",
  "discount_value": 30,
  "max_discount_amount": 100.00,
  "status": "active",
  "restrictions": {
    "min_purchase_amount": 50.00,
    "max_uses_per_user": 1,
    "first_purchase_only": false,
    "categories": ["vestidos", "blusas"],
    "excluded_categories": [],
    "sellers": [],
    "excluded_sellers": []
  },
  "usage": {
    "used": 234,
    "limit": 1000,
    "remaining": 766
  },
  "valid_from": "2025-11-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "stats": {
    "total_discount_given": 12543.50,
    "total_orders": 234,
    "average_order_value": 186.50,
    "conversion_rate": 3.2
  },
  "recent_uses": [
    {
      "order_id": "ord_abc123",
      "user": "Ana Paula",
      "discount_applied": 55.80,
      "order_total": 186.00,
      "used_at": "2025-11-21T10:00:00Z"
    }
  ],
  "created_by": {
    "id": "admin_123",
    "name": "Admin User"
  },
  "created_at": "2025-10-25T10:00:00Z",
  "updated_at": "2025-10-25T10:00:00Z"
}
```

---

**Endpoint:** `POST /admin/coupons`

**Description:** Criar cupom.

**Request:**
```json
{
  "code": "BLACKFRIDAY2025",
  "type": "percentage",
  "discount_value": 40,
  "max_discount_amount": 150.00,
  "description": "Black Friday - 40% OFF",
  "restrictions": {
    "min_purchase_amount": 100.00,
    "max_uses_per_user": 1,
    "usage_limit": 500,
    "first_purchase_only": false,
    "categories": [],
    "excluded_categories": [],
    "sellers": [],
    "excluded_sellers": []
  },
  "valid_from": "2025-11-29T00:00:00Z",
  "valid_until": "2025-11-29T23:59:59Z",
  "stackable": false,
  "public": true
}
```

**Coupon Types:**
- `percentage`: Percentual (ex: 30%)
- `fixed`: Valor fixo (ex: R$ 20)
- `free_shipping`: Frete grátis
- `cashback_bonus`: Cashback extra

**Validations:**
- `code`: 6-20 chars, uppercase, alphanumeric + underscores
- `discount_value`: > 0
- Se `percentage`: <= 100
- `valid_until`: > `valid_from`
- `usage_limit`: >= 0

**Response:** `201 Created`
```json
{
  "id": "coup_ghi789",
  "code": "BLACKFRIDAY2025",
  "type": "percentage",
  "discount_value": 40,
  "status": "active",
  "created_at": "2025-11-21T10:00:00Z"
}
```

---

**Endpoint:** `PUT /admin/coupons/:id`

**Description:** Atualizar cupom.

**Request:**
```json
{
  "status": "disabled",
  "valid_until": "2025-12-15T23:59:59Z",
  "usage_limit": 1500
}
```

**Response:** `200 OK`
```json
{
  "id": "coup_abc123",
  "code": "DESFRUTAR",
  "status": "disabled",
  "updated_at": "2025-11-21T10:30:00Z"
}
```

---

**Endpoint:** `DELETE /admin/coupons/:id`

**Description:** Deletar cupom.

**Note:** Só pode deletar se não tiver sido usado ainda.

**Response:** `204 No Content`

---

**Endpoint:** `GET /admin/coupons/:id/usage`

**Description:** Histórico de uso do cupom.

**Query Parameters:**
- `start_date`, `end_date`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "uses": [
    {
      "order_id": "ord_abc123",
      "user": {
        "id": "usr_abc123",
        "name": "Ana Paula"
      },
      "order_total": 186.00,
      "discount_applied": 55.80,
      "used_at": "2025-11-21T10:00:00Z"
    }
  ],
  "pagination": {...},
  "stats": {
    "total_uses": 234,
    "total_discount": 12543.50,
    "average_discount": 53.61,
    "average_order_value": 186.50
  }
}
```

---

**Endpoint:** `POST /admin/promotions`

**Description:** Criar promoção em destaque.

**Request:**
```json
{
  "title": "Black Friday 2025",
  "description": "Até 70% OFF em produtos selecionados",
  "banner_image": "promo_banner_blackfriday.jpg",
  "coupon_code": "BLACKFRIDAY2025",
  "categories": ["vestidos", "blusas", "calcas"],
  "featured_products": ["prd_abc123", "prd_def456"],
  "start_date": "2025-11-29T00:00:00Z",
  "end_date": "2025-11-29T23:59:59Z",
  "active": true,
  "priority": 1
}
```

**Response:** `201 Created`
```json
{
  "id": "promo_abc123",
  "title": "Black Friday 2025",
  "banner_image": "https://cdn.apega.com/promotions/promo_abc123.jpg",
  "url": "/promocoes/black-friday-2025",
  "active": true,
  "created_at": "2025-11-21T10:00:00Z"
}
```

---

**Endpoint:** `GET /admin/promotions`

**Description:** Listar promoções.

**Response:** `200 OK`
```json
{
  "promotions": [
    {
      "id": "promo_abc123",
      "title": "Black Friday 2025",
      "banner_image": "https://...",
      "coupon_code": "BLACKFRIDAY2025",
      "active": true,
      "stats": {
        "views": 12543,
        "clicks": 3421,
        "conversion_rate": 2.8,
        "revenue": 45234.00
      },
      "start_date": "2025-11-29T00:00:00Z",
      "end_date": "2025-11-29T23:59:59Z"
    }
  ]
}
```

---

## 26. EMAIL TEMPLATES

Sistema completo de templates de email para comunicação com usuários.

### 26.1 Estrutura Base

**Layout base HTML:**

Todos os emails seguem uma estrutura consistente com:
- Header com logo Apega Desapega
- Corpo do conteúdo
- Footer com links e informações legais
- Responsivo (max-width: 600px)
- Cores da marca (#6B9080)

**Elementos disponíveis:**
- Botões (CTAs)
- Divisores
- Boxes de destaque
- Tabelas de informações
- Imagens de produtos

---

**Endpoint:** `POST /admin/emails/send`

**Description:** Enviar email (admin).

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request:**
```json
{
  "template": "welcome",
  "to": "user@email.com",
  "variables": {
    "user_name": "Maria Silva",
    "verify_url": "https://apegadesapega.com.br/verificar/abc123"
  }
}
```

**Response:** `200 OK`
```json
{
  "email_id": "email_abc123",
  "status": "queued",
  "sent_at": null
}
```

---

**Endpoint:** `GET /admin/emails`

**Description:** Listar emails enviados.

**Query Parameters:**
- `template`: Template name
- `status`: `sent`, `failed`, `bounced`
- `user_id`: User ID
- `start_date`, `end_date`
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "emails": [
    {
      "id": "email_abc123",
      "template": "welcome",
      "to": "user@email.com",
      "subject": "Bem-vinda ao Apega Desapega! 💚",
      "status": "sent",
      "sent_at": "2025-11-21T10:00:00Z",
      "opened_at": "2025-11-21T10:15:00Z",
      "clicked": true
    }
  ],
  "pagination": {...},
  "stats": {
    "sent": 12543,
    "delivered": 12234,
    "opened": 8765,
    "clicked": 4321,
    "open_rate": 71.7,
    "click_rate": 35.3
  }
}
```

---

### 26.2 Templates Disponíveis

**1. Confirmação de Cadastro (`welcome`)**

Subject: Bem-vinda ao Apega Desapega! 💚

Variables:
- `user_name`: Nome do usuário
- `verify_url`: URL de confirmação

---

**2. Recuperação de Senha (`password_reset`)**

Subject: Redefinir sua senha

Variables:
- `user_name`: Nome do usuário
- `reset_url`: URL de reset (expira em 1h)

---

**3. Venda Realizada (`sale_confirmed`)**

Subject: Você vendeu {{product_title}}! 🎉

Variables:
- `seller_name`: Nome da vendedora
- `product_title`: Título do produto
- `product_image`: URL da imagem
- `sale_amount`: Valor da venda
- `net_amount`: Valor líquido (após taxa)
- `shipping_label_url`: URL da etiqueta
- `buyer_name`: Nome da compradora
- `buyer_address`: Endereço completo

---

**4. Compra Confirmada (`purchase_confirmed`)**

Subject: Seu pedido #{{order_number}} foi confirmado! ✓

Variables:
- `buyer_name`: Nome da compradora
- `order_number`: Número do pedido
- `items`: Array de produtos
- `subtotal`, `discount`, `shipping`, `total`: Valores
- `cashback`: Valor do cashback
- `order_url`: URL do pedido
- `estimated_delivery`: Previsão de entrega

---

**5. Pedido Enviado (`order_shipped`)**

Subject: Seu pedido #{{order_number}} foi enviado! 📦

Variables:
- `buyer_name`: Nome da compradora
- `order_number`: Número do pedido
- `tracking_code`: Código de rastreio
- `shipping_method`: Método de envio
- `estimated_delivery`: Previsão de entrega
- `tracking_url`: URL de rastreamento

---

**6. Pedido Entregue (`order_delivered`)**

Subject: Seu pedido foi entregue! Avalie sua compra ⭐

Variables:
- `buyer_name`: Nome da compradora
- `order_number`: Número do pedido
- `review_url`: URL para avaliação
- `dispute_url`: URL para disputa

---

**7. Nova Mensagem (`new_message`)**

Subject: {{sender_name}} enviou uma mensagem sobre {{product_title}}

Variables:
- `recipient_name`: Nome do destinatário
- `sender_name`: Nome do remetente
- `product_title`: Título do produto
- `message_preview`: Preview da mensagem
- `conversation_url`: URL da conversa

---

**8. Nova Oferta Recebida (`offer_received`)**

Subject: Nova oferta de R$ {{offer_amount}} em {{product_title}}! 💰

Variables:
- `seller_name`: Nome da vendedora
- `buyer_name`: Nome da compradora
- `offer_amount`: Valor da oferta
- `product_title`: Título do produto
- `product_image`: Imagem do produto
- `product_price`: Preço original
- `seller_receives`: Valor que a vendedora recebe
- `offer_message`: Mensagem da oferta (opcional)
- `accept_url`: URL para aceitar
- `counter_url`: URL para contra-ofertar

---

**9. Oferta Aceita (`offer_accepted`)**

Subject: Sua oferta foi aceita! 🎉

Variables:
- `buyer_name`: Nome da compradora
- `seller_name`: Nome da vendedora
- `offer_amount`: Valor da oferta
- `checkout_url`: URL do checkout

---

**10. Disputa Aberta (`dispute_opened`)**

Subject: Disputa aberta para pedido #{{order_number}}

Variables:
- `user_name`: Nome do usuário
- `order_number`: Número do pedido
- `dispute_reason`: Motivo da disputa
- `dispute_description`: Descrição
- `is_seller`: Boolean (true se for vendedora)
- `dispute_url`: URL da disputa

---

**11. Disputa Resolvida (`dispute_resolved`)**

Subject: Disputa #{{dispute_number}} resolvida

Variables:
- `user_name`: Nome do usuário
- `dispute_number`: Número da disputa
- `resolution_type`: Tipo de resolução
- `resolution_description`: Descrição
- `refund_amount`: Valor do reembolso (opcional)
- `dispute_url`: URL da disputa

---

**12. Lembrete de Avaliação (`review_reminder`)**

Subject: Avalie sua compra e ganhe 50 pontos! ⭐

Variables:
- `buyer_name`: Nome da compradora
- `product_title`: Título do produto
- `review_url`: URL para avaliação

---

**13. Saldo Liberado (`balance_released`)**

Subject: R$ {{amount}} liberados na sua carteira! 💰

Variables:
- `seller_name`: Nome da vendedora
- `sale_number`: Número da venda
- `amount`: Valor liberado
- `total_balance`: Saldo total
- `wallet_url`: URL da carteira

---

**14. Saque Processado (`withdrawal_processed`)**

Subject: Seu saque foi processado! ✓

Variables:
- `user_name`: Nome do usuário
- `amount`: Valor do saque
- `method`: Método (PIX, TED, DOC)
- `pix_key`: Chave PIX (opcional)
- `bank_account`: Dados bancários (opcional)
- `bank_name`, `agency`, `account`: Detalhes do banco
- `processed_at`: Data de processamento

---

**15. Promoção Especial (`promotion`)**

Subject: 🔥 Black Friday: até 70% OFF!

Variables:
- `user_name`: Nome do usuário
- `shop_url`: URL da loja/promoção

---

## 27. DOCUMENTOS LEGAIS

Sistema completo de documentos legais para conformidade com legislação brasileira (CDC, LGPD, etc).

### 27.1 Termos de Uso

**Endpoint:** `GET /legal/terms`

**Description:** Obter termos de uso.

**Response:** `200 OK`
```json
{
  "version": "1.2",
  "last_updated": "2025-11-01T00:00:00Z",
  "content": "TERMOS E CONDIÇÕES DE USO...",
  "content_html": "<h1>TERMOS E CONDIÇÕES DE USO</h1>...",
  "require_acceptance": true,
  "acceptance_required_version": "1.2"
}
```

**Estrutura do Documento:**

1. **Aceitação dos Termos**
2. **Definições** (Plataforma, Usuária, Compradora, Vendedora, Produto, Transação)
3. **Cadastro e Conta**
   - Requisitos: 18+ anos, informações verdadeiras
   - Proibições: múltiplas contas, uso ilegal
4. **Anúncio e Venda de Produtos**
   - Responsabilidades da vendedora
   - Produtos proibidos (falsificados, ilegais, adultos, armas, drogas, animais)
   - Moderação
5. **Compra de Produtos**
   - Responsabilidades da compradora
   - Direito de arrependimento (não se aplica C2C)
   - Garantia
6. **Pagamentos e Taxas**
   - Taxa de serviço: 10%
   - Liberação após 7 dias
   - Reembolsos em 5 dias úteis
7. **Envio e Entrega**
8. **Disputas e Resolução de Conflitos**
9. **Avaliações e Reviews**
10. **Propriedade Intelectual**
11. **Limitação de Responsabilidade**
12. **Privacidade e Dados Pessoais**
13. **Suspensão e Cancelamento**
14. **Lei Aplicável e Foro**
15. **Disposições Gerais**
16. **Contato**

---

**Endpoint:** `POST /legal/terms/accept`

**Description:** Aceitar termos de uso.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "version": "1.2",
  "accepted": true,
  "ip": "201.23.45.67"
}
```

**Response:** `200 OK`
```json
{
  "user_id": "usr_abc123",
  "accepted_version": "1.2",
  "accepted_at": "2025-11-21T10:00:00Z"
}
```

---

### 27.2 Política de Privacidade (LGPD)

**Endpoint:** `GET /legal/privacy`

**Description:** Obter política de privacidade (conforme LGPD - Lei 13.709/2018).

**Response:** `200 OK`
```json
{
  "version": "2.0",
  "last_updated": "2025-11-01T00:00:00Z",
  "content": "POLÍTICA DE PRIVACIDADE...",
  "controller": {
    "name": "[RAZÃO SOCIAL]",
    "cnpj": "[CNPJ]",
    "address": "[ENDEREÇO]",
    "dpo_email": "privacidade@apegadesapega.com.br"
  }
}
```

**Estrutura do Documento:**

1. **Introdução**
2. **Controlador de Dados** (DPO, CNPJ, endereço)
3. **Dados Coletados**
   - Fornecidos: nome, email, CPF, telefone, endereços, dados bancários
   - Automáticos: IP, dispositivo, navegador, localização, cookies
   - Transações: histórico, valores, mensagens, avaliações
4. **Finalidade do Uso de Dados**
   - Execução do serviço
   - Segurança e prevenção de fraudes
   - Melhorias e personalização
   - Comunicação
5. **Base Legal (LGPD Art. 7º)**
   - Execução de contrato
   - Legítimo interesse
   - Consentimento
   - Cumprimento de obrigação legal
6. **Compartilhamento de Dados**
   - Com outras usuárias (nome, foto, cidade)
   - Provedores (Stripe, Correios, AWS, SendGrid, Google Analytics)
   - Autoridades legais (quando exigido)
7. **Armazenamento e Segurança**
   - Localização: Brasil e EUA
   - Retenção: 5 anos após exclusão
   - Criptografia: SSL/TLS, AES-256
   - 2FA, backups, monitoramento 24/7
8. **Cookies**
   - Essenciais, analíticos, marketing
9. **Seus Direitos (LGPD Art. 18)**
   - Confirmação e acesso
   - Correção
   - Anonimização, bloqueio, eliminação
   - Portabilidade
   - Revogação de consentimento
10. **Crianças e Adolescentes** (18+ apenas)
11. **Alterações nesta Política**
12. **Contato**

---

**Endpoint:** `POST /legal/privacy/consent`

**Description:** Registrar consentimento específico.

**Request:**
```json
{
  "consent_type": "marketing",
  "granted": true
}
```

**Consent Types:**
- `marketing`: Comunicações promocionais
- `analytics`: Cookies analíticos
- `profiling`: Análise de perfil

**Response:** `200 OK`
```json
{
  "consent_id": "consent_abc123",
  "type": "marketing",
  "granted": true,
  "granted_at": "2025-11-21T10:00:00Z"
}
```

---

**Endpoint:** `GET /legal/privacy/my-data`

**Description:** Baixar meus dados (portabilidade LGPD Art. 18, V).

**Response:** `200 OK`
```json
{
  "data_export_url": "https://cdn.apega.com/exports/usr_abc123.zip",
  "generated_at": "2025-11-21T10:00:00Z",
  "expires_at": "2025-11-28T10:00:00Z",
  "includes": [
    "profile",
    "addresses",
    "orders",
    "messages",
    "reviews",
    "favorites"
  ]
}
```

---

**Endpoint:** `POST /legal/privacy/delete-account`

**Description:** Solicitar exclusão de conta e dados.

**Request:**
```json
{
  "password": "Senha@123",
  "reason": "Não uso mais a plataforma",
  "confirm": true
}
```

**Response:** `200 OK`
```json
{
  "deletion_scheduled": true,
  "deletion_date": "2025-12-21T00:00:00Z",
  "grace_period_days": 30,
  "message": "Sua conta será excluída em 30 dias. Durante este período, você pode cancelar a solicitação."
}
```

---

### 27.3 Política de Trocas e Devoluções

**Endpoint:** `GET /legal/returns-policy`

**Description:** Obter política de trocas e devoluções.

**Response:** `200 OK`
```json
{
  "version": "1.0",
  "last_updated": "2025-11-01T00:00:00Z",
  "content": "POLÍTICA DE TROCAS E DEVOLUÇÕES...",
  "key_points": {
    "right_of_withdrawal": "Não se aplica (C2C)",
    "valid_reasons": [
      "not_received",
      "not_as_described",
      "defective",
      "damaged_in_transit"
    ],
    "deadline_days": 7,
    "refund_period_days": 5
  }
}
```

**Estrutura do Documento:**

1. **Direito de Arrependimento**
   - Não se aplica CDC Art. 49 (C2C)
   - Vendedora pode aceitar voluntariamente
2. **Devoluções por Problema**
   - Motivos válidos
   - Prazo: 7 dias após entrega
   - Processo via disputa
3. **Responsabilidades**
   - Compradora: inspecionar, documentar, não usar
   - Vendedora: anunciar honestamente, aceitar devoluções
4. **Custos de Devolução**
   - Produto com problema: vendedora arca
   - Arrependimento: compradora arca
5. **Reembolsos**
   - Prazo: 5 dias úteis
   - Método: mesmo do pagamento
6. **Trocas**
   - Não processadas pela plataforma
   - Acordo direto entre partes
7. **Exceções**
   - Produtos customizados
   - Higiene pessoal
   - Danificados por mau uso

---

**Endpoint:** `POST /orders/:id/return-request`

**Description:** Solicitar devolução de pedido.

**Request:**
```json
{
  "reason": "not_as_described",
  "description": "Produto veio em tamanho diferente do anunciado",
  "images": ["evidence1.jpg", "evidence2.jpg"]
}
```

**Response:** `201 Created`
```json
{
  "return_request_id": "ret_abc123",
  "order_id": "ord_abc123",
  "status": "pending_seller_response",
  "deadline": "2025-11-24T10:00:00Z",
  "created_at": "2025-11-21T10:00:00Z"
}
```

---

### 27.4 FAQ Estruturado

**Endpoint:** `GET /faq`

**Description:** Listar perguntas frequentes.

**Query Parameters:**
- `category`: `purchases`, `sales`, `payments`, `shipping`, `account`, `security`
- `search`: Busca por palavra-chave

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "slug": "purchases",
      "name": "Compras",
      "icon": "🛍️",
      "questions": [
        {
          "id": "faq_001",
          "question": "Como comprar um produto?",
          "answer": "1. Navegue pelos produtos ou use a busca\n2. Clique no produto de interesse\n3. Verifique tamanho, condição e descrição\n4. Clique em 'Comprar agora' ou 'Adicionar ao carrinho'\n5. Finalize o pagamento\n6. Aguarde confirmação e envio",
          "helpful_count": 234,
          "views": 1234,
          "category": "purchases"
        }
      ]
    }
  ]
}
```

**Categorias:**

1. **Compras** (🛍️)
   - Como comprar
   - Fazer ofertas
   - Rastrear pedido
   - Produto não chegou
   - Cancelar compra
   - Garantia

2. **Vendas** (💰)
   - Como vender
   - Custos
   - Quando recebe dinheiro
   - Aceitar ofertas
   - Envio
   - Produtos permitidos

3. **Pagamentos** (💳)
   - Formas de pagamento
   - Segurança
   - Quando processado
   - Usar cashback
   - Reembolso

4. **Envio** (📦)
   - Custo do frete
   - Prazo de entrega
   - Frete grátis
   - Rastreamento
   - Produto danificado

5. **Conta** (👤)
   - Criar conta
   - Recuperar senha
   - Alterar dados
   - Múltiplas contas
   - Excluir conta

6. **Segurança** (🔒)
   - Vendedoras confiáveis
   - Suspeita de fraude
   - Compartilhar endereço
   - Reportar problema

---

**Endpoint:** `GET /faq/:id`

**Description:** Detalhes de uma pergunta.

**Response:** `200 OK`
```json
{
  "id": "faq_001",
  "question": "Como comprar um produto?",
  "answer": "...",
  "answer_html": "<ol><li>Navegue pelos produtos...</li></ol>",
  "category": "purchases",
  "helpful_count": 234,
  "not_helpful_count": 12,
  "views": 1234,
  "related_questions": ["faq_002", "faq_003"],
  "updated_at": "2025-11-01T00:00:00Z"
}
```

---

**Endpoint:** `POST /faq/:id/helpful`

**Description:** Marcar pergunta como útil.

**Request:**
```json
{
  "helpful": true
}
```

**Response:** `200 OK`
```json
{
  "faq_id": "faq_001",
  "helpful_count": 235
}
```

---

## 28. SISTEMA DE ONBOARDING

Sistema completo de onboarding para novas usuárias (compradora e vendedora).

### 28.1 Tutorial Primeira Vez (Compradora)

**Flow:** 5 telas interativas ao primeiro login.

**Telas:**

1. **Bem-vinda**
   - Logo e mensagem de boas-vindas
   - "Seu marketplace de moda feminina circular e sustentável"

2. **Como Funciona**
   - Ícone: 🔍
   - "Explore peças únicas"
   - "Navegue por milhares de produtos de outras apegadas"

3. **Cashback**
   - Ícone: 💚
   - "Ganhe cashback"
   - "10% de cashback em toda compra!"

4. **Segurança**
   - Ícone: 🔒
   - "Compre com segurança"
   - "Pagamento protegido e dinheiro retido até confirmação"

5. **Pronta!**
   - Ícone: ✨
   - "Você ganhou R$ 10 de bônus na sua primeira compra"
   - Cupom: PRIMEIRACOMPRA

**Tooltips Interativos:**

Após onboarding, tooltips aparecem nas features principais:
- Favoritar produto (💚)
- Fazer oferta (💰)
- Filtros (🔍)
- Mensagens (💬)

---

**Endpoint:** `POST /onboarding/complete`

**Description:** Marcar onboarding como completo.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "type": "buyer",
  "completed_steps": [
    "welcome",
    "how_it_works",
    "cashback",
    "security",
    "ready"
  ],
  "skipped": false
}
```

**Response:** `200 OK`
```json
{
  "user_id": "usr_abc123",
  "onboarding_type": "buyer",
  "completed": true,
  "completed_at": "2025-11-21T10:00:00Z",
  "reward": {
    "type": "coupon",
    "code": "PRIMEIRACOMPRA",
    "discount_value": 10.00
  }
}
```

---

**Endpoint:** `GET /onboarding/status`

**Description:** Verificar status do onboarding.

**Response:** `200 OK`
```json
{
  "buyer_onboarding": {
    "completed": true,
    "completed_at": "2025-11-21T10:00:00Z",
    "reward_claimed": true
  },
  "seller_onboarding": {
    "completed": false,
    "progress_percentage": 50,
    "checklist": {
      "profile_photo": true,
      "address": true,
      "bank_account": false,
      "first_product": false
    }
  },
  "tooltips_shown": ["favorite", "offer"],
  "tooltips_pending": ["filters", "messages"]
}
```

---

**Endpoint:** `POST /tooltips/:id/dismiss`

**Description:** Dispensar tooltip.

**Request:**
```json
{
  "tooltip_id": "favorite"
}
```

**Response:** `200 OK`
```json
{
  "tooltip_id": "favorite",
  "dismissed": true,
  "dismissed_at": "2025-11-21T10:00:00Z"
}
```

---

### 28.2 Tutorial Primeira Vez (Vendedora)

**Flow:** 6 telas + checklist interativo.

**Telas:**

1. **Venda suas Peças**
   - Ícone: 💰
   - "Transforme seu guarda-roupa em dinheiro"

2. **Como Anunciar**
   - Ícone: 📷
   - "Tire boas fotos"
   - Dicas: luz natural, fundo limpo, mostrar detalhes

3. **Precificação**
   - Ícone: 💵
   - "Defina o preço certo"
   - "Pesquise produtos similares e seja competitiva"
   - Lembrete: taxa de 10%

4. **Envio**
   - Ícone: 📦
   - "Envio simplificado"
   - "Nós geramos a etiqueta, você só embala e posta!"

5. **Pagamentos**
   - Ícone: 💳
   - "Receba seus ganhos"
   - "Após 7 dias da entrega, o valor é liberado"

6. **Checklist**
   - ☐ Adicionar foto de perfil
   - ☐ Cadastrar endereço
   - ☐ Adicionar dados bancários
   - ☐ Anunciar primeiro produto

---

**Endpoint:** `POST /onboarding/seller/start`

**Description:** Iniciar onboarding vendedora.

**Response:** `200 OK`
```json
{
  "user_id": "usr_abc123",
  "onboarding_type": "seller",
  "started_at": "2025-11-21T10:00:00Z",
  "checklist": {
    "profile_photo": false,
    "address": false,
    "bank_account": false,
    "first_product": false
  }
}
```

---

**Endpoint:** `GET /onboarding/seller/checklist`

**Description:** Obter checklist vendedora.

**Response:** `200 OK`
```json
{
  "checklist": {
    "profile_photo": {
      "completed": true,
      "completed_at": "2025-11-21T10:00:00Z"
    },
    "address": {
      "completed": true,
      "completed_at": "2025-11-21T10:05:00Z"
    },
    "bank_account": {
      "completed": false,
      "required_for": "Sacar valores de vendas"
    },
    "first_product": {
      "completed": false,
      "required_for": "Começar a vender"
    }
  },
  "completion_percentage": 50,
  "next_step": {
    "action": "add_bank_account",
    "url": "/settings/payment-methods",
    "label": "Adicionar dados bancários"
  },
  "reward": {
    "type": "featured_listing",
    "description": "Primeiro produto em destaque grátis!",
    "unlocked_at": 100
  }
}
```

---

**Endpoint:** `POST /onboarding/seller/checklist/:item/complete`

**Description:** Marcar item do checklist como completo.

**Request:**
```json
{
  "item": "bank_account"
}
```

**Response:** `200 OK`
```json
{
  "item": "bank_account",
  "completed": true,
  "completed_at": "2025-11-21T10:30:00Z",
  "checklist_completion": 75,
  "reward_unlocked": false
}
```

---

**Primeiro Anúncio Assistido:**

Wizard guiado em 5 passos para criar primeiro produto:

1. **Fotos** (com dicas de fotografia)
2. **Título e Categoria** (com sugestões)
3. **Detalhes** (tamanho, cor, condição, marca)
4. **Preço** (com sugestão baseada em similares)
5. **Descrição** (com template sugerido)

---

## Support

- Email: api@apegadesapega.com.br
- Docs: https://docs.apegadesapega.com.br
- Status: https://status.apegadesapega.com.br
