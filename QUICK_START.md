# APEGA DESAPEGA - QUICK START GUIDE

**Comece a desenvolver em menos de 10 minutos!**

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [ ] **Node.js** (v18+) - [Download](https://nodejs.org/)
- [ ] **PostgreSQL** (v14+) - [Download](https://www.postgresql.org/download/)
- [ ] **Redis** (v6+) - [Download](https://redis.io/download/)
- [ ] **Expo CLI** - `npm install -g expo-cli`
- [ ] **Git** - [Download](https://git-scm.com/)

---

## 🚀 Setup Rápido (5 minutos)

### 1. Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Criar banco de dados
createdb apega_desapega_db

# Rodar migrations
npx prisma migrate dev
# OU (se usar outro ORM):
npm run migrate

# Iniciar servidor (porta 3001)
npm run dev
```

**✅ Backend rodando em:** `http://localhost:3001`

---

### 2. Frontend Mobile

```bash
# Navegar para o diretório mobile
cd apega-mobile

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env e definir URL da API
# EXPO_PUBLIC_API_URL=http://localhost:3001

# Iniciar aplicação
npm start

# Escolha:
# - Pressione 'w' para abrir no navegador (web)
# - Pressione 'i' para iOS (requer macOS)
# - Pressione 'a' para Android (requer emulador)
# - Ou escaneie o QR code com o app Expo Go
```

**✅ App rodando!**

---

## ⚙️ Configuração Mínima (apenas para testar localmente)

Para rodar o projeto localmente e testar as funcionalidades básicas, você precisa configurar apenas as variáveis essenciais:

### Backend (.env)

```bash
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/apega_desapega_db"

# JWT (use qualquer string aleatória forte)
JWT_SECRET="seu-secret-super-seguro-aqui-mude-em-producao"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui-diferente-do-jwt"

# Servidor
PORT=3001
NODE_ENV="development"

# Redis (se estiver rodando localmente)
REDIS_URL="redis://localhost:6379"
```

### Mobile (.env)

```bash
# URL da API
EXPO_PUBLIC_API_URL=http://localhost:3001

# Ambiente
EXPO_PUBLIC_ENV=development
```

**Pronto! Com essas configurações você já pode:**
- ✅ Criar usuários
- ✅ Fazer login
- ✅ Listar produtos
- ✅ Criar produtos (sem upload de imagens ainda)
- ✅ Adicionar favoritos
- ✅ Enviar mensagens

---

## 🔑 APIs Externas (Configuração Completa)

Para funcionalidades avançadas, você precisará configurar as APIs externas. Veja o guia completo em [CONFIGURACAO_APIS_EXTERNAS.md](./CONFIGURACAO_APIS_EXTERNAS.md).

### Prioridade de Configuração

**🔴 Essencial (para MVP):**
1. **Upload de Imagens** (escolha uma):
   - Cloudinary (mais fácil, plano grátis generoso)
   - AWS S3 (mais escalável, requer configuração)

2. **Pagamentos** (escolha uma):
   - Mercado Pago (mais usado no Brasil, PIX nativo)
   - Stripe (internacional, mais features)

**🟡 Importante (adicionar em seguida):**
3. **Logística:** Melhor Envio (cálculo de frete e etiquetas)
4. **Maps:** Google Maps API (geolocalização)
5. **Push:** Firebase FCM (notificações)

**🟢 Opcional (melhorias):**
6. **Analytics:** Google Analytics 4
7. **Email:** SMTP (Gmail ou SendGrid)

---

## 📊 Estrutura do Projeto

```
Apega Desapega/
├── backend/                      # API Node.js
│   ├── src/
│   │   ├── controllers/         # Lógica de requisições
│   │   ├── models/              # Modelos do banco
│   │   ├── routes/              # Definição de rotas
│   │   ├── services/            # Lógica de negócio
│   │   └── middleware/          # Auth, validação, etc.
│   ├── .env.example             # Template de variáveis
│   └── package.json
│
├── apega-mobile/                # App React Native
│   ├── src/
│   │   ├── screens/            # Telas do app
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── services/           # API client, auth, etc.
│   │   └── navigation/         # React Navigation
│   ├── .env.example            # Template de variáveis
│   └── package.json
│
├── API_DOCUMENTATION.md         # Documentação completa da API (8,383 linhas)
├── RESUMO_API.md               # Índice navegável da API
├── CONFIGURACAO_APIS_EXTERNAS.md  # Guia de setup de APIs externas
├── INTEGRACAO_FRONTEND_BACKEND.md # Guia de integração completo
├── QUICK_START.md              # Este arquivo
└── RESUMO_EXECUTIVO.txt        # Visão geral do projeto
```

---

## 🧪 Testar a Integração

### 1. Verificar se Backend está rodando

```bash
# Testar endpoint de health check
curl http://localhost:3001/health

# Ou abra no navegador:
# http://localhost:3001/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T10:00:00Z"
}
```

### 2. Testar Registro de Usuário

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "user": {
    "id": "usr_abc123",
    "name": "Teste User",
    "email": "teste@example.com"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 604800
}
```

### 3. Testar Login no App Mobile

1. Abra o app mobile
2. Vá para tela de Login
3. Use as credenciais criadas:
   - Email: `teste@example.com`
   - Senha: `senha123`
4. Clique em "Entrar"

**✅ Se funcionou:** Você será redirecionado para a Home

---

## 📚 Documentação Completa

### Para Desenvolvedores Backend
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentação técnica completa de todos os 195+ endpoints
- [CONFIGURACAO_APIS_EXTERNAS.md](./CONFIGURACAO_APIS_EXTERNAS.md) - Como configurar Stripe, S3, Firebase, etc.

### Para Desenvolvedores Frontend
- [INTEGRACAO_FRONTEND_BACKEND.md](./INTEGRACAO_FRONTEND_BACKEND.md) - Como integrar mobile com backend
- Código de exemplo em `apega-mobile/src/services/` - Cliente API, autenticação, etc.

### Para Product Managers / Stakeholders
- [RESUMO_EXECUTIVO.txt](./RESUMO_EXECUTIVO.txt) - Visão geral do projeto
- [RESUMO_API.md](./RESUMO_API.md) - Índice navegável das funcionalidades

---

## 🎯 Próximos Passos

Agora que o projeto está rodando localmente, você pode:

### Opção 1: Desenvolvimento Backend
1. Implementar endpoints da API seguindo [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Começar com módulos essenciais:
   - [ ] Autenticação (LOGIN, REGISTER) ✅ Prioridade 1
   - [ ] Produtos (CRUD) ✅ Prioridade 1
   - [ ] Upload de Imagens ✅ Prioridade 1
   - [ ] Carrinho e Checkout ✅ Prioridade 2
   - [ ] Mensagens ✅ Prioridade 2

### Opção 2: Desenvolvimento Frontend
1. Implementar telas faltantes (algumas já estão criadas em `src/screens/`)
2. Integrar com backend usando os services em `src/services/`
3. Telas prioritárias:
   - [ ] Home/Feed de Produtos ✅ Prioridade 1
   - [ ] Detalhes do Produto ✅ Prioridade 1
   - [ ] Carrinho ✅ Prioridade 2
   - [ ] Checkout ✅ Prioridade 2

### Opção 3: DevOps / Infraestrutura
1. Configurar APIs externas (veja [CONFIGURACAO_APIS_EXTERNAS.md](./CONFIGURACAO_APIS_EXTERNAS.md))
2. Setup de CI/CD
3. Deploy em staging/produção
4. Configurar monitoramento (Sentry, New Relic)

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `ECONNREFUSED` ou `database connection failed`
- ✅ Verifique se PostgreSQL está rodando: `psql --version`
- ✅ Verifique se o banco de dados foi criado: `psql -l | grep apega`
- ✅ Verifique se as credenciais no .env estão corretas

**Erro:** `Redis connection failed`
- ✅ Verifique se Redis está rodando: `redis-cli ping` (deve retornar "PONG")
- ✅ Se não estiver usando Redis ainda, você pode comentar no código

### Mobile não conecta com backend

**Erro:** `Network request failed` ou `timeout`
- ✅ Verifique se o backend está rodando em `http://localhost:3001`
- ✅ Se estiver testando em dispositivo físico, use o IP da sua máquina:
  ```bash
  # Descobrir seu IP local
  ipconfig  # Windows
  ifconfig  # Mac/Linux

  # Atualizar .env mobile
  EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3001
  ```

### Expo não inicia

**Erro:** `expo: command not found`
- ✅ Instale Expo CLI globalmente: `npm install -g expo-cli`

**Erro:** `Unable to resolve module`
- ✅ Limpe cache e reinstale:
  ```bash
  rm -rf node_modules
  npm install
  expo start -c
  ```

---

## 💬 Suporte

- **Documentação:** Veja os arquivos .md na raiz do projeto
- **Issues:** Reporte bugs ou sugestões (se tiver repositório configurado)
- **Email:** api@apegadesapega.com.br (exemplo)

---

## 🎉 Checklist de Setup Completo

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Redis instalado e rodando
- [ ] Backend: `npm install` concluído
- [ ] Backend: `.env` configurado
- [ ] Backend: banco de dados criado
- [ ] Backend: migrations rodadas
- [ ] Backend: servidor rodando em `http://localhost:3001`
- [ ] Frontend: `npm install` concluído
- [ ] Frontend: `.env` configurado
- [ ] Frontend: app rodando no Expo
- [ ] Teste: registro de usuário funcionando
- [ ] Teste: login funcionando
- [ ] APIs externas configuradas (opcional para MVP)

---

**Pronto! Você está pronto para começar a desenvolver! 🚀**

**Tempo estimado de setup:** 5-10 minutos
**Última atualização:** Novembro 2025
