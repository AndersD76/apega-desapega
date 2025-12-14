# SERVIÇOS DE INTEGRAÇÃO - APEGA DESAPEGA

## ✅ Todos os Serviços Foram Criados com Sucesso!

Criei 6 serviços completos de integração com APIs externas, prontos para uso.

---

## 📂 Arquivos Criados

### 1. [payment.service.js](./backend/src/services/payment.service.js) - Pagamentos
**Integrações:** Mercado Pago + Stripe

**Funcionalidades Mercado Pago:**
- ✅ Criar preferência de pagamento (checkout)
- ✅ Processar pagamento PIX (QR Code)
- ✅ Consultar status de pagamento
- ✅ Processar reembolso
- ✅ Webhook handler

**Funcionalidades Stripe:**
- ✅ Criar Payment Intent
- ✅ Confirmar pagamento
- ✅ Consultar status
- ✅ Processar reembolso
- ✅ Criar cliente
- ✅ Webhook handler

**Como usar:**
```javascript
const paymentService = require('./services/payment.service');

// Mercado Pago - Criar PIX
const pixData = await paymentService.createMercadoPagoPix({
  amount: 100.00,
  description: 'Compra no Apega Desapega',
  email: 'comprador@email.com',
  orderId: 'ord_123'
});
console.log(pixData.qrCode); // QR Code para pagamento

// Stripe - Criar Payment Intent
const payment = await paymentService.createStripePaymentIntent({
  amount: 100.00,
  currency: 'brl',
  orderId: 'ord_123'
});
console.log(payment.clientSecret); // Para confirmar no frontend
```

---

### 2. [notification.service.js](./backend/src/services/notification.service.js) - Push Notifications
**Integração:** Firebase Cloud Messaging (FCM)

**Funcionalidades:**
- ✅ Enviar notificação para dispositivo específico
- ✅ Enviar para múltiplos dispositivos
- ✅ Enviar para tópico
- ✅ Inscrever/desinscrever de tópicos
- ✅ **10 templates prontos** (nova mensagem, venda confirmada, pedido enviado, etc.)

**Como usar:**
```javascript
const notificationService = require('./services/notification.service');

// Enviar notificação de venda confirmada
await notificationService.sendSaleConfirmedNotification(
  'device_token_aqui',
  'João Silva',
  'Vestido Floral',
  150.00
);

// Enviar notificação personalizada
await notificationService.sendToDevice('device_token', {
  title: 'Título da Notificação',
  body: 'Mensagem aqui',
  data: { custom: 'data' },
  imageUrl: 'https://...'
});
```

---

### 3. [maps.service.js](./backend/src/services/maps.service.js) - Geolocalização
**Integração:** Google Maps API

**Funcionalidades:**
- ✅ Geocoding (endereço → coordenadas)
- ✅ Reverse Geocoding (coordenadas → endereço)
- ✅ Buscar CEP (ViaCEP + Google Maps)
- ✅ Autocomplete de endereços
- ✅ Detalhes de lugar por Place ID
- ✅ Calcular distância entre pontos
- ✅ Matriz de distâncias
- ✅ Cálculo Haversine (sem API, offline)

**Como usar:**
```javascript
const mapsService = require('./services/maps.service');

// Buscar CEP
const cepData = await mapsService.searchCep('01310100');
console.log(cepData.street); // Avenida Paulista
console.log(cepData.city); // São Paulo
console.log(cepData.location); // { lat, lng }

// Geocoding
const location = await mapsService.geocode('Avenida Paulista, 1000, São Paulo');
console.log(location.location); // { lat: -23.561, lng: -46.656 }

// Calcular distância
const distance = await mapsService.calculateDistance(
  { lat: -23.561, lng: -46.656 },
  { lat: -22.906, lng: -43.172 }
);
console.log(distance.distance.text); // "434 km"
console.log(distance.duration.text); // "5 horas 30 min"

// Autocomplete
const suggestions = await mapsService.autocomplete('Avenida Paul');
console.log(suggestions.predictions); // Lista de sugestões
```

---

### 4. [shipping.service.js](./backend/src/services/shipping.service.js) - Logística
**Integração:** Melhor Envio

**Funcionalidades:**
- ✅ OAuth2 (autorização e refresh token)
- ✅ Calcular frete (múltiplas transportadoras)
- ✅ Adicionar envio ao carrinho
- ✅ Fazer checkout
- ✅ Gerar etiqueta de envio
- ✅ Imprimir etiqueta (PDF)
- ✅ Rastrear envio
- ✅ Cancelar envio
- ✅ Listar transportadoras e serviços

**Como usar:**
```javascript
const shippingService = require('./services/shipping.service');

// Calcular frete
const shippingOptions = await shippingService.calculateShipping({
  from: { postal_code: '01310100' },
  to: { postal_code: '20040020' },
  products: [{
    id: 'prod_1',
    width: 20,
    height: 30,
    length: 10,
    weight: 0.5,
    insurance_value: 100.00,
    quantity: 1
  }]
});

shippingOptions.forEach(option => {
  console.log(`${option.name}: R$ ${option.price} - ${option.deliveryTime} dias`);
});

// Adicionar ao carrinho e gerar etiqueta
const cartItem = await shippingService.addToCart({
  service: 1, // PAC
  from: { /* dados vendedor */ },
  to: { /* dados comprador */ },
  products: [{ /* produtos */ }],
  volumes: [{ /* dimensões */ }]
});

const checkout = await shippingService.checkout(cartItem.cartItemId);
const label = await shippingService.generateLabel([cartItem.cartItemId]);
const pdf = await shippingService.printLabel([cartItem.cartItemId]);
console.log(pdf.url); // URL do PDF da etiqueta
```

---

### 5. [email.service.js](./backend/src/services/email.service.js) - Email
**Integração:** Nodemailer (SMTP)

**Funcionalidades:**
- ✅ Enviar email com template HTML
- ✅ **10 templates prontos** (boas-vindas, recuperação de senha, confirmações, etc.)
- ✅ Template base responsivo
- ✅ Suporte a anexos

**Como usar:**
```javascript
const emailService = require('./services/email.service');

// Email de boas-vindas
await emailService.sendWelcomeEmail(
  'usuario@email.com',
  'Maria Silva'
);

// Email de venda confirmada
await emailService.sendSaleConfirmedEmail('vendedor@email.com', {
  buyerName: 'João',
  productTitle: 'Vestido Floral',
  amount: 150.00,
  orderId: 'ord_123'
});

// Email personalizado
await emailService.sendEmail({
  to: 'usuario@email.com',
  subject: 'Assunto do Email',
  html: '<h1>Conteúdo HTML</h1>',
  attachments: [
    {
      filename: 'documento.pdf',
      path: '/caminho/para/arquivo.pdf'
    }
  ]
});
```

---

### 6. [analytics.service.js](./backend/src/services/analytics.service.js) - Analytics
**Integração:** Google Analytics 4

**Funcionalidades:**
- ✅ Eventos de e-commerce (view_item, add_to_cart, purchase, refund)
- ✅ Eventos personalizados (sign_up, login, search, share)
- ✅ Eventos do marketplace (make_offer, publish_product, send_message)
- ✅ Envio em batch
- ✅ Validação de eventos

**Como usar:**
```javascript
const analyticsService = require('./services/analytics.service');

// Rastrear visualização de produto
await analyticsService.trackViewItem('client_id_123', {
  id: 'prod_1',
  title: 'Vestido Floral',
  category: 'Vestidos',
  brand: 'Zara',
  price: 150.00
}, 'user_456');

// Rastrear compra
await analyticsService.trackPurchase('client_id_123', {
  orderId: 'ord_789',
  total: 165.00,
  shipping: 15.00,
  items: [{
    id: 'prod_1',
    title: 'Vestido Floral',
    category: 'Vestidos',
    price: 150.00,
    quantity: 1
  }]
}, 'user_456');

// Evento personalizado
await analyticsService.trackCustomEvent('client_id_123', 'custom_event', {
  param1: 'value1',
  param2: 'value2'
});
```

---

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente (.env)

Você já tem o [.env.example](./backend/.env.example) completo. Copie e configure:

```bash
cp backend/.env.example backend/.env
```

### 2. APIs que Precisam de Configuração

#### 🔴 **ESSENCIAL (configure primeiro):**

1. **Cloudinary** ✅ (já configurado)
   - Usado em: `upload.service.js`

2. **Mercado Pago** (5 min)
   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
   MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
   ```
   - Criar conta em: https://mercadopago.com.br
   - Obter credenciais em: Configurações → Credenciais

3. **Gmail SMTP** (2 min) - Para emails
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASS=senha-de-app-do-gmail
   ```
   - Gerar senha de app: https://myaccount.google.com/apppasswords

#### 🟡 **IMPORTANTE (adicionar depois):**

4. **Melhor Envio** (15 min)
   ```env
   MELHOR_ENVIO_CLIENT_ID=seu-client-id
   MELHOR_ENVIO_CLIENT_SECRET=seu-client-secret
   ```
   - Criar conta: https://melhorenvio.com.br
   - Criar aplicação em: Configurações → Aplicações

5. **Firebase FCM** (20 min)
   - Service Account Key (JSON)
   - Configurar variáveis: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, etc.

6. **Google Maps** (10 min)
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ```
   - Console: https://console.cloud.google.com

#### 🟢 **OPCIONAL:**

7. **Stripe** (se não usar Mercado Pago)
8. **Google Analytics 4**

---

## 📖 Documentação Completa

Consulte estes arquivos para mais detalhes:

- [CONFIGURACAO_APIS_EXTERNAS.md](./CONFIGURACAO_APIS_EXTERNAS.md) - Passo a passo completo de cada API
- [INTEGRACAO_FRONTEND_BACKEND.md](./INTEGRACAO_FRONTEND_BACKEND.md) - Como integrar com o frontend
- [QUICK_START.md](./QUICK_START.md) - Setup rápido do projeto

---

## 🧪 Como Testar os Serviços

Crie um arquivo de teste: `backend/test-services.js`

```javascript
require('dotenv').config();

async function testServices() {
  console.log('\n=== TESTANDO SERVIÇOS ===\n');

  // 1. Testar Email
  const emailService = require('./src/services/email.service');
  if (emailService.isConfigured()) {
    console.log('✅ Email configurado');
    // await emailService.sendWelcomeEmail('seu-email@gmail.com', 'Teste');
  } else {
    console.log('❌ Email não configurado');
  }

  // 2. Testar Mercado Pago
  const paymentService = require('./src/services/payment.service');
  console.log('✅ Payment Service carregado');

  // 3. Testar Firebase
  const notificationService = require('./src/services/notification.service');
  if (notificationService.isInitialized()) {
    console.log('✅ Firebase configurado');
  } else {
    console.log('❌ Firebase não configurado');
  }

  // 4. Testar Google Maps
  const mapsService = require('./src/services/maps.service');
  if (mapsService.isConfigured()) {
    console.log('✅ Google Maps configurado');
    const cepData = await mapsService.searchCep('01310100');
    console.log('   CEP:', cepData.cep, '-', cepData.street);
  } else {
    console.log('❌ Google Maps não configurado');
  }

  // 5. Testar Melhor Envio
  const shippingService = require('./src/services/shipping.service');
  if (shippingService.isConfigured()) {
    console.log('✅ Melhor Envio configurado');
  } else {
    console.log('❌ Melhor Envio não configurado');
  }

  // 6. Testar Analytics
  const analyticsService = require('./src/services/analytics.service');
  if (analyticsService.isConfigured()) {
    console.log('✅ Google Analytics configurado');
  } else {
    console.log('❌ Google Analytics não configurado');
  }

  console.log('\n=== TESTE CONCLUÍDO ===\n');
}

testServices().catch(console.error);
```

Execute:
```bash
node backend/test-services.js
```

---

## 📊 Resumo

### ✅ O Que Foi Criado

| Serviço | Arquivo | Linhas | Status |
|---------|---------|--------|--------|
| Pagamentos | payment.service.js | ~450 | ✅ Pronto |
| Notificações | notification.service.js | ~400 | ✅ Pronto |
| Geolocalização | maps.service.js | ~450 | ✅ Pronto |
| Logística | shipping.service.js | ~450 | ✅ Pronto |
| Email | email.service.js | ~500 | ✅ Pronto |
| Analytics | analytics.service.js | ~400 | ✅ Pronto |
| **TOTAL** | **6 arquivos** | **~2.650 linhas** | **✅ Completo** |

### ✅ O Que Já Estava Pronto

| Serviço | Arquivo | Status |
|---------|---------|--------|
| Upload de Imagens | upload.service.js | ✅ Cloudinary configurado |
| Processamento de Imagens | image-processing.service.js | ✅ Pronto |

### 📦 Dependências Instaladas

```json
{
  "stripe": "^14.10.0",
  "firebase-admin": "^12.0.0",
  "mercadopago": "^2.0.1",
  "nodemailer": "^6.9.7",
  "axios": "^1.6.2",
  "cloudinary": "^1.41.0"
}
```

---

## 🎯 Próximos Passos

1. ✅ Configurar as APIs essenciais (Mercado Pago, Gmail)
2. ✅ Testar os serviços com `test-services.js`
3. ✅ Integrar os serviços nos controllers
4. ✅ Implementar webhooks
5. ✅ Testar integração completa

---

**Tudo pronto para uso! 🚀**

Última atualização: Novembro 2025
