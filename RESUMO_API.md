# Resumo Executivo - API Apega Desapega

## Status: ✅ DOCUMENTAÇÃO COMPLETA

**Total de Linhas:** 8,383
**Total de Seções:** 28
**Total de Endpoints:** 195+
**Data de Conclusão:** Novembro 2025

---

## 📋 Índice Completo

### **PARTE 1: APIs INTERNAS** (Seções 1-14)

#### **1. AUTENTICAÇÃO**
- 6 endpoints (register, login, refresh, forgot password, reset password, logout)
- JWT token authentication
- Rate limit: 5 req/min

#### **2. USUÁRIOS**
- 7 endpoints (get current user, update profile, update avatar, change password, get user by ID, get user products, get user reviews)
- Profile management
- Avatar upload (max 5MB)

#### **3. PRODUTOS**
- 16 endpoints (CRUD completo, upload de imagens, favoritos, Q&A, visualizações, produtos similares)
- Max 8 imagens por produto
- Validações: título 10-60 chars, descrição 50-500 chars

#### **4. CATEGORIAS E MARCAS**
- 7 endpoints (categorias, detalhes, marcas, tamanhos, cores, condições)
- Hierarquia de categorias/subcategorias
- Contadores de produtos

#### **5. CARRINHO**
- 7 endpoints (get cart, add/remove items, apply/remove coupon, clear cart, calculate shipping)
- Sistema de cupons (desconto fixo ou percentual)
- Cálculo de frete integrado

#### **6. ENDEREÇOS**
- 6 endpoints (list, get by ID, create, update, delete, ZIP code lookup)
- Max 5 endereços por usuário
- Validação de CEP

#### **7. PEDIDOS (Compradora)**
- 7 endpoints (list orders, get details, create order/checkout, tracking, cancel, review, download invoice)
- Timeline de status (pending → paid → shipped → delivered)
- Sistema de avaliação (1-5 estrelas)

#### **8. OFERTAS**
- 6 endpoints (make offer, list sent/received offers, accept/reject, cancel)
- Expiração em 24h
- Max 3 ofertas pendentes por usuário
- Sistema de contra-oferta

#### **9. VENDAS (Vendedora)**
- 6 endpoints (list sales, get details, generate shipping label, mark as shipped, statistics, dashboard)
- Comissão: 10% por venda
- Estatísticas e analytics
- Integração com Correios

#### **10. MENSAGENS**
- 7 endpoints (list conversations, get details, get messages, send message, start conversation, mark as read, block user)
- Rate limit: 50 mensagens/min
- Max 1000 chars por mensagem
- Sistema de bloqueio

#### **11. NOTIFICAÇÕES**
- 6 endpoints (list notifications, mark as read, mark all as read, get settings, update settings, register push device)
- Push + Email preferences
- Firebase device registration
- Deep linking

#### **12. BUSCA**
- 4 endpoints (search products, autocomplete, trending searches, search history)
- Filtros avançados
- Relevância ranking
- Autocomplete com highlights

#### **13. SUPORTE**
- 5 endpoints (list help articles, get article, create support ticket, list tickets, get ticket details)
- Status workflow: open → in_progress → resolved → closed
- Anexos (max 10MB)

#### **14. INTEGRAÇÃO CORREIOS**
- 3 endpoints (calculate shipping, track package, lookup CEP)
- Serviços: PAC (04510), SEDEX (04014)
- Rastreamento em tempo real
- Validação de CEP

---

### **PARTE 2: APIs EXTERNAS** (Seções 15-19)

#### **15. PAGAMENTO (STRIPE/MERCADO PAGO)**
- **Stripe:** 4 endpoints
  - Create token (client-side)
  - Create payment intent
  - Confirm payment
  - Create refund
  - 3D Secure support

- **Mercado Pago:** 3 endpoints
  - Create payment (cartão de crédito)
  - PIX payment (QR code)
  - Refund
  - Parcelamento em até 12x

#### **16. UPLOAD DE IMAGENS (AWS S3 / CLOUDINARY)**
- **AWS S3:**
  - Presigned URLs (1h expiration)
  - Public-read ACL
  - Max 5MB por arquivo

- **Cloudinary:**
  - Upload direto
  - Image transformations (thumbnails, responsive)
  - Auto format/quality
  - WebP support

#### **17. GEOLOCALIZAÇÃO (GOOGLE MAPS API)**
- 4 funcionalidades:
  - Geocoding (endereço → coordenadas)
  - Reverse geocoding (coordenadas → endereço)
  - Place autocomplete
  - Distance matrix
- Suporte: driving, walking, bicycling, transit

#### **18. NOTIFICAÇÕES PUSH (FIREBASE CLOUD MESSAGING)**
- 2 métodos de envio:
  - Send to device token
  - Send to topic
- Plataformas: iOS, Android, Web
- Templates pré-definidos:
  - Nova mensagem
  - Nova oferta
  - Venda realizada
  - Pedido enviado/entregue

#### **19. ANALYTICS (GOOGLE ANALYTICS 4)**
- E-commerce events:
  - view_item, add_to_cart, begin_checkout, purchase, search
- Custom events:
  - product_favorited, offer_sent, message_sent
- Measurement Protocol API
- User properties e custom dimensions

#### **20. ENVIO E LOGÍSTICA (MELHOR ENVIO)**
- 13 endpoints principais:
  - Calculate shipping (múltiplas transportadoras)
  - Add to cart, Checkout shipment
  - Generate label, Print label
  - Track shipment, Cancel shipment
  - Check balance, Save address
  - Request collection
  - Webhooks (tracking updates)
- **Benefícios:**
  - Desconto de 10-40% no frete
  - Múltiplas transportadoras (Correios, Jadlog, Azul Cargo)
  - Geração automática de etiquetas
  - Rastreamento unificado
  - Coleta agendada
- **Dimensões padrão por categoria:**
  - Vestidos, blusas, calças, sapatos, bolsas, acessórios
- **Fluxo completo:**
  - Venda confirmada → Criar envio → Gerar etiqueta → Postar → Rastrear → Entregar

#### **21. REVIEWS E REPUTAÇÃO**
- 8 endpoints (list pending, create, received, given, respond, helpful, report, public reviews)
- Sistema de avaliação mútua (compradora ↔ vendedora)
- Janela de 15 dias após entrega
- Avaliações anônimas até ambos avaliarem
- **Rating multi-dimensional:**
  - Overall, communication, product quality, shipping speed, packaging
- **Seller Score (0-100):**
  - 40pts: Rating médio
  - 20pts: Total de reviews
  - 20pts: Recomendação %
  - 10pts: Taxa de resposta
  - 10pts: Tempo de resposta
- **Badges automáticos:**
  - Top Seller (score ≥90 + 50+ reviews)
  - Fast Shipping (80%+ enviados em <48h)
  - Excellent Communication (95%+ resposta + <6h)
  - Reliable (100+ vendas + 0% cancelamentos)
  - Rising Star (nova + 10+ vendas + 4.8+ rating)
- **Moderação automática:**
  - Detecção de linguagem ofensiva
  - Filtragem de informações pessoais
  - Anti-spam

#### **22. CARTEIRA DIGITAL E PAGAMENTOS**
- 8 endpoints (wallet, transactions, withdrawals CRUD, bank accounts)
- **Saldo segregado:**
  - Available: Disponível para saque
  - Pending: Aguardando 7 dias após entrega
  - Total: Soma de ambos
- **Métodos de saque:**
  - PIX (5-30 minutos)
  - TED (mesmo dia útil)
  - DOC (1-2 dias úteis)
- **Limites:**
  - Mínimo: R$ 10,00
  - Máximo por saque: R$ 5.000,00
  - Máximo 3 saques/dia
- **Fluxo automático:**
  - Venda confirmada → Pending (7 dias) → Available → Saque → Conta bancária
- **Segurança:**
  - Período de segurança: 7 dias
  - KYC obrigatório (CPF/CNPJ)
  - 2FA para saques >R$ 1.000
  - Dados criptografados (AES-256)
- **Compliance:**
  - Limite mensal: R$ 50.000,00
  - Transações >R$ 10.000 reportadas (AML)

#### **23. CASHBACK**
- 4 endpoints (balance, transactions, apply, remove)
- **Sistema de recompensas:**
  - Primeira compra: 15% de cashback
  - Demais compras: 10% de cashback
  - Não pode sacar, apenas usar como desconto
- **Validade:**
  - 180 dias (6 meses)
  - Aviso 7 dias antes de expirar
  - Expiração automática
- **Regras de uso:**
  - Mínimo: R$ 5,00
  - Máximo: 50% do subtotal
  - Não combina com cupons
- **Saldo segregado:**
  - Available: Pronto para usar
  - Pending: Aguardando 7 dias após entrega
  - Expired: Cashback expirado
- **Processamento automático:**
  - Crédito após 7 dias da entrega
  - Task diária para expiração
  - Notificações de aviso

#### **24. SISTEMA DE DISPUTAS**
- 7 endpoints (create, list, details, message, evidence, respond, escalate)
- **Motivos de disputa:**
  - Produto não recebido
  - Diferente do anunciado
  - Com defeito/danificado
  - Item errado
  - Atraso no envio
- **Resoluções possíveis:**
  - Reembolso total
  - Reembolso parcial
  - Troca do produto
  - Devolução
- **Prazos:**
  - Abrir disputa: 7 dias após entrega
  - Resposta vendedora: 3 dias úteis
  - Resolução plataforma: 5 dias úteis
  - Auto-escalação: se vendedora não responder
- **Evidências:**
  - Máximo 5 por parte
  - Tipos: image, screenshot, video, document
  - Máximo 10MB por arquivo
- **Mediação:**
  - Chat entre comprador/vendedor
  - Plataforma analisa caso
  - Impacto no seller score
  - Processamento automático de reembolsos

#### **25. ADMIN PANEL**
- 12+ endpoints (auth, dashboard, users, products, orders, disputes, analytics, logs)
- **Roles e permissões:**
  - super_admin: Acesso total (gestão de admins, configurações)
  - admin: Gestão e moderação completa
  - moderator: Moderação de conteúdo (produtos, usuários)
  - support: Suporte e disputas
  - analyst: Apenas visualização de analytics
- **Autenticação admin:**
  - 2FA obrigatório (Google Authenticator/Authy)
  - Token expira em 8h (vs 30 dias usuário comum)
  - Rate limit: 10 req/min
- **Dashboard:**
  - Overview: Total de usuários, receita, pedidos, vendas
  - Suporte: Disputas pendentes, tickets abertos
  - Alertas: Itens de alta prioridade
- **Gestão de usuários:**
  - Listar com filtros (status, role, flags)
  - Suspender (temporário, 7 dias padrão)
  - Banir (permanente)
  - Verificar (verified badge)
  - Featured (destaque na home)
  - Flags: multiple_disputes, high_cancellation_rate, suspicious_activity, fake_reviews_suspected
- **Moderação de produtos:**
  - Aprovar/reprovar produtos
  - Remover produtos
  - Motivos: suspected_counterfeit, prohibited_item, misleading_description, inappropriate_images, price_too_low, suspicious_brand
- **Gestão de pedidos:**
  - Emitir reembolso (total ou parcial)
  - Cancelar pedido
  - Histórico completo
- **Mediação de disputas:**
  - Atribuir a mediador
  - Resolver disputa (refund, partial_refund, favor_seller)
  - Chat e notas internas
  - Revisar evidências
  - Impacto no seller score
- **Analytics:**
  - Receita por período
  - Breakdown por categoria
  - Breakdown por vendedor (top 10)
  - Breakdown por método de pagamento
  - GMV (Gross Merchandise Value)
  - Comissão total
- **Activity logs:**
  - Todas ações do usuário
  - IP, device fingerprint, localização
  - Timestamps completos
  - Auditoria completa
- **Moderação de reviews:**
  - Listar reviews (active, flagged, removed)
  - Aprovar/rejeitar reviews
  - Editar reviews (remover conteúdo inapropriado)
  - Analisar denúncias
  - Flags: profanity, spam, fake, irrelevant, personal_info, defamatory
- **Cupons e promoções:**
  - Criar cupons (percentage, fixed, free_shipping, cashback_bonus)
  - Gerenciar status (active, expired, disabled)
  - Restrições (min_purchase, max_uses, first_purchase_only, categories)
  - Histórico de uso e analytics
  - Promoções em destaque (banners, featured products)
  - Métricas: conversion rate, revenue, average order value

#### **26. EMAIL TEMPLATES**
- 2 endpoints (send email, list emails)
- **15 templates disponíveis:**
  - welcome: Confirmação de cadastro
  - password_reset: Recuperação de senha
  - sale_confirmed: Venda realizada (vendedora)
  - purchase_confirmed: Compra confirmada (compradora)
  - order_shipped: Pedido enviado
  - order_delivered: Pedido entregue
  - new_message: Nova mensagem
  - offer_received: Nova oferta recebida
  - offer_accepted: Oferta aceita
  - dispute_opened: Disputa aberta
  - dispute_resolved: Disputa resolvida
  - review_reminder: Lembrete de avaliação
  - balance_released: Saldo liberado
  - withdrawal_processed: Saque processado
  - promotion: Promoção especial
- **Estrutura base:**
  - Layout HTML responsivo (max-width: 600px)
  - Header com logo
  - Footer com links legais
  - Elementos: botões, divisores, boxes, tabelas, imagens
  - Cores da marca (#6B9080)
- **Analytics de email:**
  - Open rate, click rate
  - Status: sent, delivered, opened, clicked, failed, bounced
  - Tracking individual por email

#### **27. DOCUMENTOS LEGAIS**
- 8+ endpoints (terms, privacy, returns, faq)
- **Termos de Uso:**
  - 16 seções (aceitação, definições, cadastro, produtos, pagamentos, disputas, etc.)
  - Versionamento e aceite obrigatório
  - Produtos proibidos e limitação de responsabilidade
- **Política de Privacidade (LGPD):**
  - Conformidade com Lei 13.709/2018
  - Controlador de dados e DPO
  - Base legal (execução de contrato, legítimo interesse, consentimento)
  - Direitos do titular (Art. 18): acesso, correção, portabilidade, eliminação
  - Retenção: 5 anos após exclusão
  - Criptografia: SSL/TLS, AES-256
- **Gestão de consentimento:**
  - Tipos: marketing, analytics, profiling
  - Portabilidade de dados (ZIP export)
  - Exclusão de conta (30 dias grace period)
- **Política de Trocas:**
  - Não se aplica CDC Art. 49 (C2C)
  - Devoluções por problema (7 dias)
  - Reembolso em 5 dias úteis
- **FAQ Estruturado:**
  - 6 categorias (compras, vendas, pagamentos, envio, conta, segurança)
  - Sistema de helpful/not helpful
  - Perguntas relacionadas

#### **28. SISTEMA DE ONBOARDING**
- 7+ endpoints (onboarding buyer/seller, tooltips, checklist)
- **Tutorial Compradora:**
  - 5 telas interativas (bem-vinda, como funciona, cashback, segurança, pronta)
  - Recompensa: R$ 10 de bônus (cupom PRIMEIRACOMPRA)
  - Tooltips contextuais (favoritar, oferta, filtros, mensagens)
- **Tutorial Vendedora:**
  - 6 telas (vender, fotos, preço, envio, pagamentos, checklist)
  - Checklist interativo (foto, endereço, dados bancários, 1º produto)
  - Progress tracking (completion percentage)
  - Recompensa: primeiro produto em destaque grátis
- **Primeiro Anúncio Assistido:**
  - Wizard em 5 passos
  - Dicas contextuais (fotografia, precificação)
  - Templates sugeridos
  - Sugestão de preço baseada em similares
- **Gestão de tooltips:**
  - Controle de exibição (shown/pending)
  - Dismiss individual
  - Tracking de interações

---

## 🔒 Segurança

### Autenticação
- Bearer token JWT
- Refresh token com 30 dias de validade
- Password reset com token expirável (1h)

### Rate Limiting
- Auth endpoints: 5 req/min
- Read (GET): 100 req/min
- Write (POST/PATCH/DELETE): 30 req/min

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642260000
```

---

## 📊 Paginação

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

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

## ⚠️ Error Handling

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (dados inválidos) |
| 401 | Unauthorized (token ausente/inválido) |
| 403 | Forbidden (sem permissão) |
| 404 | Not Found (recurso não encontrado) |
| 409 | Conflict (conflito) |
| 410 | Gone (recurso removido) |
| 422 | Unprocessable Entity |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

### Error Response Format
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

---

## 📁 Estrutura de URLs

### Base URLs
```
Production:   https://api.apegadesapega.com.br/v1
Staging:      https://staging-api.apegadesapega.com.br/v1
Development:  http://localhost:3000/v1
```

### Padrões de Endpoints
- **Recursos:** `/products`, `/users`, `/orders`
- **Subrecursos:** `/products/:id/images`, `/users/:id/reviews`
- **Ações:** `/products/:id/favorite`, `/orders/:id/cancel`
- **Listagens:** `/products/me`, `/offers/sent`, `/offers/received`

---

## 🎯 Casos de Uso Principais

### 1. Fluxo de Compra Completo
1. `GET /products` - Listar produtos
2. `GET /products/:id` - Ver detalhes
3. `POST /products/:id/favorite` - Favoritar
4. `POST /cart/items` - Adicionar ao carrinho
5. `POST /cart/coupon` - Aplicar cupom
6. `GET /cart/shipping` - Calcular frete
7. `POST /orders` - Finalizar compra (checkout)
8. `GET /orders/:id/tracking` - Rastrear pedido
9. `POST /orders/:id/review` - Avaliar compra

### 2. Fluxo de Venda Completo
1. `POST /products` - Cadastrar produto
2. `POST /products/:id/images` - Upload de fotos
3. `GET /offers/received` - Ver ofertas
4. `PUT /offers/:id/accept` - Aceitar oferta
5. `GET /sales` - Ver vendas
6. `POST /sales/:id/shipping-label` - Gerar etiqueta
7. `POST /sales/:id/ship` - Marcar como enviado
8. `GET /sales/statistics` - Ver estatísticas

### 3. Fluxo de Negociação
1. `POST /products/:id/offers` - Fazer oferta
2. `GET /offers/sent` - Ver ofertas enviadas
3. `PUT /offers/:id/reject` - Vendedor rejeita com contra-oferta
4. `POST /products/:id/offers` - Comprador faz nova oferta
5. `PUT /offers/:id/accept` - Vendedor aceita
6. `POST /orders` - Checkout automático

### 4. Fluxo de Mensagens
1. `POST /conversations` - Iniciar conversa
2. `GET /conversations/:id/messages` - Ver mensagens
3. `POST /conversations/:id/messages` - Enviar mensagem
4. `PUT /conversations/:id/read` - Marcar como lida
5. `POST /conversations/:id/block` - Bloquear usuário (se necessário)

---

## 🚀 Integrações Externas

### Pagamento
- **Stripe:** Cartão de crédito internacional
- **Mercado Pago:** Cartão, PIX, parcelamento

### Infraestrutura
- **AWS S3 / Cloudinary:** Upload e CDN de imagens
- **Google Maps API:** Geocoding e autocomplete
- **Firebase FCM:** Push notifications
- **Google Analytics 4:** Analytics e tracking

### Logística
- **Correios API:** Cálculo de frete e rastreamento
- **Serviços:** PAC, SEDEX

---

## 📈 Métricas e Performance

### Timeouts
- Autenticação: 10s
- GET requests: 15s
- POST/PUT/DELETE: 30s
- Upload de imagens: 60s
- Pagamentos: 30s

### Caching
- CEP lookup: 30 dias TTL
- Geocoding: 90 dias TTL
- Categorias/Marcas: 7 dias TTL
- Produtos: 5 minutos TTL

### Webhooks
- Retry: 3 tentativas (exponential backoff)
- Timeout: 10s
- Validação: Signature verification
- Idempotência: Required

---

## 📞 Suporte

- **Email:** api@apegadesapega.com.br
- **Documentação:** https://docs.apegadesapega.com.br
- **Status:** https://status.apegadesapega.com.br
- **Arquivo Completo:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## ✅ Checklist de Implementação

### Backend
- [ ] Implementar autenticação JWT
- [ ] Criar todos os 100+ endpoints
- [ ] Integrar Stripe/Mercado Pago
- [ ] Configurar AWS S3 ou Cloudinary
- [ ] Integrar API Correios
- [ ] Configurar Firebase FCM
- [ ] Implementar webhooks
- [ ] Setup Google Analytics 4
- [ ] Implementar rate limiting
- [ ] Criar testes unitários e de integração
- [ ] Deploy em produção

### Frontend (React Native)
- [ ] Implementar autenticação
- [ ] Criar todas as telas (Home, Produto, Carrinho, etc.)
- [ ] Integrar upload de imagens
- [ ] Implementar push notifications
- [ ] Integrar Google Maps (autocomplete)
- [ ] Implementar analytics tracking
- [ ] Criar sistema de mensagens em tempo real
- [ ] Implementar deep linking
- [ ] Testes E2E
- [ ] Deploy na App Store e Google Play

### Infraestrutura
- [ ] Configurar CDN (CloudFront)
- [ ] Setup load balancer
- [ ] Configurar banco de dados (PostgreSQL/MongoDB)
- [ ] Setup Redis (cache e queue)
- [ ] Configurar monitoramento (Sentry, New Relic)
- [ ] Backup automático
- [ ] CI/CD pipeline
- [ ] Documentação de deploy

---

**Última Atualização:** Novembro 2025
**Versão da API:** v1
**Status:** Pronto para Implementação ✅
