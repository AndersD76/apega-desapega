# 🔧 Guia de Configuração - APIs Externas

## Apega Desapega Marketplace

Este guia contém todas as instruções necessárias para configurar as 8 APIs externas utilizadas no projeto.

---

## 📋 **ÍNDICE**

1. [Stripe (Pagamentos)](#1-stripe)
2. [Mercado Pago (Pagamentos)](#2-mercado-pago)
3. [AWS S3 (Upload de Imagens)](#3-aws-s3)
4. [Cloudinary (Upload de Imagens - Alternativa)](#4-cloudinary)
5. [Google Maps API (Geolocalização)](#5-google-maps-api)
6. [Firebase Cloud Messaging (Push Notifications)](#6-firebase-cloud-messaging)
7. [Google Analytics 4 (Analytics)](#7-google-analytics-4)
8. [Melhor Envio (Logística)](#8-melhor-envio)

---

## 1. **STRIPE**

### 📌 O que é
Processador de pagamentos internacional (cartão de crédito).

### 🔗 URL
https://stripe.com

### 📝 Passos de Configuração

#### 1.1. Criar Conta
1. Acesse https://dashboard.stripe.com/register
2. Preencha os dados da empresa
3. Ative sua conta (pode exigir verificação)

#### 1.2. Obter Chaves API
1. Vá para: **Developers** > **API keys**
2. Copie as chaves:
   - **Publishable key** (começa com `pk_`)
   - **Secret key** (começa com `sk_`)

#### 1.3. Configurar Webhooks
1. Vá para: **Developers** > **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://sua-api.com/webhooks/stripe`
4. Eventos para assinar:
   ```
   payment_intent.succeeded
   payment_intent.payment_failed
   charge.refunded
   ```
5. Copie o **Signing secret** (começa com `whsec_`)

#### 1.4. Variáveis de Ambiente
```bash
# .env
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 💰 Custos
- **Gratuito** para começar (modo teste)
- **Produção**: 2,9% + $0,30 por transação bem-sucedida

### 📚 Documentação
- Docs: https://stripe.com/docs/api
- Node.js SDK: https://github.com/stripe/stripe-node

---

## 2. **MERCADO PAGO**

### 📌 O que é
Processador de pagamentos brasileiro (cartão, PIX, boleto).

### 🔗 URL
https://www.mercadopago.com.br/developers

### 📝 Passos de Configuração

#### 2.1. Criar Conta de Desenvolvedor
1. Acesse https://www.mercadopago.com.br/developers
2. Faça login com sua conta Mercado Pago
3. Crie uma aplicação

#### 2.2. Obter Credenciais
1. Vá para: **Suas integrações** > **Credenciais**
2. Escolha o modo (Test / Production)
3. Copie:
   - **Public Key**
   - **Access Token**

#### 2.3. Configurar Notificações (Webhooks)
1. Vá para: **Suas integrações** > **Notificações**
2. URL: `https://sua-api.com/webhooks/mercadopago`
3. Eventos:
   ```
   payment
   merchant_order
   ```

#### 2.4. Ativar PIX
1. Acesse **Suas integrações** > **Checkout Pro**
2. Ative a opção PIX
3. Configure QR Code dinâmico

#### 2.5. Variáveis de Ambiente
```bash
# .env
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
```

### 💰 Custos
- **Gratuito** para teste (sandbox)
- **Produção**:
  - Cartão: 4,99% por transação
  - PIX: 0,99% por transação
  - Boleto: R$ 3,49 por transação

### 📚 Documentação
- Docs: https://www.mercadopago.com.br/developers/pt/docs
- Node.js SDK: https://github.com/mercadopago/sdk-nodejs

---

## 3. **AWS S3**

### 📌 O que é
Serviço de armazenamento de objetos da Amazon (para upload de imagens).

### 🔗 URL
https://aws.amazon.com/s3/

### 📝 Passos de Configuração

#### 3.1. Criar Conta AWS
1. Acesse https://aws.amazon.com
2. Crie uma conta (requer cartão de crédito)

#### 3.2. Criar Bucket S3
1. Vá para: **S3** no console AWS
2. Clique em **Create bucket**
3. Configurações:
   - **Nome**: `apega-desapega-images` (único globalmente)
   - **Região**: `us-east-1` (ou mais próxima)
   - **Block Public Access**: Desmarque para imagens públicas
   - **Versioning**: Desabilitado (para MVP)

#### 3.3. Configurar CORS
1. Selecione seu bucket
2. Vá para: **Permissions** > **CORS**
3. Cole a configuração:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### 3.4. Criar Usuário IAM
1. Vá para: **IAM** > **Users** > **Add user**
2. Nome: `apega-api-user`
3. Access type: **Programmatic access**
4. Permissions: **AmazonS3FullAccess** (ou política customizada)
5. Copie:
   - **Access Key ID**
   - **Secret Access Key**

#### 3.5. Configurar Bucket Policy (Leitura Pública)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::apega-desapega-images/*"
    }
  ]
}
```

#### 3.6. Variáveis de Ambiente
```bash
# .env
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=apega-desapega-images
```

### 💰 Custos
- **Free Tier**: 5GB de armazenamento + 20.000 GET requests/mês por 12 meses
- **Produção**: ~$0,023 por GB/mês

### 📚 Documentação
- Docs: https://docs.aws.amazon.com/s3/
- Node.js SDK: https://docs.aws.amazon.com/sdk-for-javascript/

---

## 4. **CLOUDINARY** (Alternativa ao S3)

### 📌 O que é
Serviço de gestão e otimização de imagens na nuvem.

### 🔗 URL
https://cloudinary.com

### 📝 Passos de Configuração

#### 4.1. Criar Conta
1. Acesse https://cloudinary.com/users/register/free
2. Preencha o formulário
3. Verifique seu email

#### 4.2. Obter Credenciais
1. Acesse: **Dashboard**
2. Copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

#### 4.3. Configurar Upload Preset
1. Vá para: **Settings** > **Upload**
2. Scroll até **Upload presets**
3. Clique em **Add upload preset**
4. Configurações:
   - **Preset name**: `apega_products`
   - **Signing Mode**: Unsigned
   - **Folder**: `products`
   - **Transformations**:
     - Width: 1200px
     - Quality: auto
     - Format: auto (WebP support)

#### 4.4. Variáveis de Ambiente
```bash
# .env
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
CLOUDINARY_UPLOAD_PRESET=apega_products
```

### 💰 Custos
- **Free Tier**: 25 GB armazenamento + 25 GB bandwidth/mês
- **Produção**: A partir de $99/mês

### 📚 Documentação
- Docs: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration

---

## 5. **GOOGLE MAPS API**

### 📌 O que é
API de geolocalização (geocoding, autocomplete, cálculo de distância).

### 🔗 URL
https://console.cloud.google.com/

### 📝 Passos de Configuração

#### 5.1. Criar Projeto no Google Cloud
1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto: **Apega Desapega**
3. Aguarde criação (~30 segundos)

#### 5.2. Ativar APIs Necessárias
1. Vá para: **APIs & Services** > **Library**
2. Ative as seguintes APIs:
   - **Geocoding API**
   - **Places API**
   - **Distance Matrix API**
   - **Maps SDK for Android** (mobile)
   - **Maps SDK for iOS** (mobile)

#### 5.3. Criar Chave API
1. Vá para: **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **API key**
3. Copie a chave gerada

#### 5.4. Restringir Chave API (Recomendado)
1. Clique na chave criada
2. **API restrictions**:
   - Selecione: Restrict key
   - Escolha apenas as APIs necessárias
3. **Application restrictions**:
   - Para backend: HTTP referrers ou IP addresses
   - Para mobile: Android/iOS apps

#### 5.5. Variáveis de Ambiente
```bash
# .env (Backend)
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxx

# app.json (Frontend - Expo)
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyxxxxxx"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyxxxxxx"
      }
    }
  }
}
```

### 💰 Custos
- **Free Tier**: $200 de crédito/mês
- Geocoding: $5 por 1.000 requests (after free tier)
- Places Autocomplete: $2,83 por 1.000 requests

### 📚 Documentação
- Docs: https://developers.google.com/maps/documentation
- Node.js Client: https://github.com/googlemaps/google-maps-services-js

---

## 6. **FIREBASE CLOUD MESSAGING**

### 📌 O que é
Serviço de push notifications para iOS, Android e Web.

### 🔗 URL
https://console.firebase.google.com/

### 📝 Passos de Configuração

#### 6.1. Criar Projeto Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em **Add project**
3. Nome: **Apega Desapega**
4. Desabilite Analytics (ou mantenha se quiser integrar com GA4)

#### 6.2. Adicionar App Android
1. No console, clique em **Add app** > **Android**
2. Package name: `com.apegadesapega.app` (deve coincidir com app.json)
3. Baixe `google-services.json`
4. Coloque em: `apega-mobile/android/app/google-services.json`

#### 6.3. Adicionar App iOS
1. Clique em **Add app** > **iOS**
2. Bundle ID: `com.apegadesapega.app`
3. Baixe `GoogleService-Info.plist`
4. Coloque em: `apega-mobile/ios/GoogleService-Info.plist`

#### 6.4. Obter Credenciais de Servidor
1. Vá para: **Project settings** > **Service accounts**
2. Clique em **Generate new private key**
3. Salve o arquivo JSON em local seguro
4. Copie o conteúdo para variável de ambiente

#### 6.5. Configurar Expo
Instale o plugin:
```bash
cd apega-mobile
expo install expo-notifications @react-native-firebase/app @react-native-firebase/messaging
```

app.json:
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      [
        "@react-native-firebase/messaging",
        {
          "iosNSUserTrackingUsageDescription": "Enviar notificações sobre pedidos e mensagens"
        }
      ]
    ]
  }
}
```

#### 6.6. Variáveis de Ambiente
```bash
# .env (Backend)
FIREBASE_PROJECT_ID=apega-desapega
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@apega-desapega.iam.gserviceaccount.com
```

### 💰 Custos
- **Gratuito** (100% free para FCM)

### 📚 Documentação
- Docs: https://firebase.google.com/docs/cloud-messaging
- Admin SDK (Node): https://firebase.google.com/docs/admin/setup

---

## 7. **GOOGLE ANALYTICS 4**

### 📌 O que é
Ferramenta de analytics para rastrear eventos e comportamento de usuários.

### 🔗 URL
https://analytics.google.com/

### 📝 Passos de Configuração

#### 7.1. Criar Propriedade GA4
1. Acesse https://analytics.google.com/
2. Clique em **Admin** (canto inferior esquerdo)
3. **Create Property**
4. Nome: **Apega Desapega**
5. Selecione **Time zone**: Brazil
6. Escolha **E-commerce** como categoria

#### 7.2. Criar Data Stream (Web)
1. Em **Property** > **Data Streams**
2. Clique em **Add stream** > **Web**
3. URL: `https://apega.com.br` (ou seu domínio)
4. Stream name: **Apega Web**
5. Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

#### 7.3. Criar Data Stream (Mobile)
1. **Add stream** > **iOS app** e **Android app**
2. Para Android:
   - Package name: `com.apegadesapega.app`
3. Para iOS:
   - Bundle ID: `com.apegadesapega.app`
4. Baixe os arquivos de configuração

#### 7.4. Configurar Eventos de E-commerce
No GA4, vá para **Events** e verifique se os seguintes eventos estão configurados:
- `view_item`
- `add_to_cart`
- `begin_checkout`
- `purchase`
- `search`

#### 7.5. Integrar com Expo/React Native
```bash
cd apega-mobile
npm install @react-native-firebase/analytics
```

app.json:
```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/analytics"
    ]
  }
}
```

#### 7.6. Variáveis de Ambiente
```bash
# .env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=xxxxx (para Measurement Protocol API)
```

### 💰 Custos
- **Gratuito** até 10M eventos/mês

### 📚 Documentação
- Docs: https://developers.google.com/analytics/devguides/collection/ga4
- React Native: https://rnfirebase.io/analytics/usage

---

## 8. **MELHOR ENVIO**

### 📌 O que é
Plataforma de gestão de envios com desconto em transportadoras (Correios, Jadlog, Azul Cargo).

### 🔗 URL
https://melhorenvio.com.br

### 📝 Passos de Configuração

#### 8.1. Criar Conta
1. Acesse https://melhorenvio.com.br/cadastre-se
2. Escolha **Pessoa Jurídica** (ou Física para testes)
3. Preencha os dados
4. Verifique email

#### 8.2. Criar Aplicação
1. Acesse: https://melhorenvio.com.br/painel/gerenciar/tokens
2. Clique em **Criar aplicação**
3. Configurações:
   - Nome: **Apega Desapega API**
   - Redirect URI: `https://sua-api.com/auth/melhor-envio/callback`
   - Scopes: Marque todos

#### 8.3. Obter Credenciais
1. Após criar, copie:
   - **Client ID**
   - **Client Secret**
2. Guarde em local seguro

#### 8.4. Gerar Token de Acesso (OAuth2)
**Endpoint de autorização:**
```
https://melhorenvio.com.br/oauth/authorize?
  client_id=SEU_CLIENT_ID&
  redirect_uri=https://sua-api.com/auth/melhor-envio/callback&
  response_type=code&
  scope=cart-read cart-write shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping
```

**Após callback, trocar code por token:**
```bash
POST https://melhorenvio.com.br/oauth/token
{
  "grant_type": "authorization_code",
  "client_id": "SEU_CLIENT_ID",
  "client_secret": "SEU_CLIENT_SECRET",
  "code": "CODE_RECEBIDO",
  "redirect_uri": "https://sua-api.com/auth/melhor-envio/callback"
}
```

**Response:**
```json
{
  "access_token": "Bearer xxxxx",
  "refresh_token": "xxxxx",
  "expires_in": 2592000
}
```

#### 8.5. Configurar Webhooks
1. Vá para: **Configurações** > **Webhooks**
2. URL: `https://sua-api.com/webhooks/melhor-envio`
3. Eventos:
   - `order.created`
   - `order.posted`
   - `order.delivered`
   - `tracking.update`

#### 8.6. Adicionar Saldo (Ambiente de Produção)
1. Vá para: **Carteira**
2. Adicione créditos via PIX/Boleto/Cartão
3. Mínimo recomendado: R$ 100

#### 8.7. Variáveis de Ambiente
```bash
# .env
MELHOR_ENVIO_CLIENT_ID=xxxxx
MELHOR_ENVIO_CLIENT_SECRET=xxxxx
MELHOR_ENVIO_ACCESS_TOKEN=Bearer xxxxx
MELHOR_ENVIO_REFRESH_TOKEN=xxxxx
MELHOR_ENVIO_SANDBOX=true # mudar para false em produção
```

### 💰 Custos
- **Gratuito** para criar conta
- **Descontos**: 10-40% em fretes (vs preço de balcão)
- Você paga apenas o frete com desconto

### 📚 Documentação
- Docs: https://docs.melhorenvio.com.br/
- API Reference: https://api.melhorenvio.com.br/docs/

---

## 📦 **RESUMO DE CUSTOS MENSAIS**

| Serviço | Plano Gratuito | Custo Produção (Estimado) |
|---------|----------------|---------------------------|
| Stripe | Ilimitado (teste) | 2,9% + $0,30/transação |
| Mercado Pago | Ilimitado (sandbox) | 0,99% - 4,99%/transação |
| AWS S3 | 5GB + 20k requests/mês (12 meses) | ~$5-10/mês |
| Cloudinary | 25GB storage + 25GB bandwidth | $0 (Free Tier suficiente para MVP) |
| Google Maps | $200 crédito/mês | ~$20-50/mês |
| Firebase (FCM) | Ilimitado | $0 (sempre gratuito) |
| Google Analytics | 10M eventos/mês | $0 (sempre gratuito) |
| Melhor Envio | Ilimitado | Apenas frete (com desconto) |

**Total estimado para MVP**: **$0 - $30/mês** (fora pagamentos e fretes)

---

## 🚀 **PRÓXIMOS PASSOS**

Após configurar todas as APIs:

1. ✅ Preencha o arquivo `.env` (use o template `.env.example`)
2. ✅ Teste cada integração individualmente
3. ✅ Configure webhooks em produção
4. ✅ Ative modo sandbox/teste antes de produção
5. ✅ Monitore limites de uso (dashboards de cada serviço)

---

## 📞 **SUPORTE**

Dúvidas sobre configuração?
- Email: dev@apegadesapega.com.br
- Documentação completa: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Última atualização**: Novembro 2025
**Versão**: 1.0
