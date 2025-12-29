# Guia de Deploy - Apega Desapega

## Parte 1: Deploy do Backend no Railway

### 1.1 Criar Conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Aceite os termos

### 1.2 Criar Novo Projeto
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Conecte o repositório do backend (ou selecione "Empty Project" para deploy manual)

### 1.3 Deploy via CLI (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# No diretório do backend
cd "e:\APPS EM DESENVOLVIMENTO\App Brechó\apega-backend"

# Criar novo projeto
railway init

# Deploy
railway up
```

### 1.4 Configurar Variáveis de Ambiente
No painel do Railway, vá em **Variables** e adicione:

```
PORT=3001
NODE_ENV=production
DATABASE_URL=sua_url_do_neon
JWT_SECRET=gere_uma_chave_segura_aqui
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
MERCADOPAGO_ACCESS_TOKEN=seu_token_mp
MELHORENVIO_TOKEN=seu_token_me
ANTHROPIC_API_KEY=sua_key_anthropic
REPLICATE_API_TOKEN=seu_token_replicate
REMOVE_BG_API_KEY=sua_key_removebg
PHOTOROOM_API_KEY=sua_key_photoroom
```

### 1.5 Gerar Domínio Público
1. No Railway, vá em **Settings** > **Domains**
2. Clique em **"Generate Domain"**
3. Copie a URL (ex: `apega-backend-production.up.railway.app`)

---

## Parte 2: Configurar Banco de Dados (Neon PostgreSQL)

### 2.1 Criar Conta no Neon
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto: **"apega-desapega"**

### 2.2 Obter Connection String
1. No dashboard, clique em **"Connection Details"**
2. Copie a **Connection String** (formato: `postgresql://user:pass@host/db?sslmode=require`)
3. Cole no Railway como `DATABASE_URL`

### 2.3 Inicializar Banco de Dados
Após configurar a DATABASE_URL no Railway, execute:
```bash
railway run npm run db:init
```

Ou localmente:
```bash
cd apega-backend
npm run db:init
```

---

## Parte 3: Atualizar App Mobile para Produção

### 3.1 Atualizar URL da API
Em `apega-mobile/src/api/config.ts`, altere:
```typescript
const USE_PRODUCTION = true;
```

E atualize a URL de produção:
```typescript
const PRODUCTION_URL = 'https://SEU-PROJETO.up.railway.app/api';
```

### 3.2 Verificar app.json
```json
{
  "expo": {
    "name": "Apega Desapega",
    "slug": "apega-desapega",
    "version": "1.0.0",
    "android": {
      "package": "com.apegadesapega.app",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.apegadesapega.app",
      "buildNumber": "1.0.0"
    }
  }
}
```

---

## Parte 4: Publicar na Play Store (Teste Interno)

### 4.1 Criar Conta de Desenvolvedor Google
1. Acesse [play.google.com/console](https://play.google.com/console)
2. Pague a taxa única de **US$25**
3. Complete a verificação de identidade

### 4.2 Configurar EAS Build
```bash
# No diretório do app mobile
cd apega-mobile

# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure
```

### 4.3 Gerar Keystore (Primeira vez)
O EAS gerencia automaticamente. Ou gere manualmente:
```bash
keytool -genkeypair -v -keystore apega-upload-key.keystore -alias apega-key -keyalg RSA -keysize 2048 -validity 10000
```

### 4.4 Criar Build de Produção
```bash
# Build AAB para Play Store
eas build --platform android --profile production

# Ou APK para teste direto
eas build --platform android --profile preview
```

### 4.5 Criar App na Play Console

1. **Criar App**
   - Nome: "Apega Desapega"
   - Idioma: Português (Brasil)
   - App ou jogo: App
   - Gratuito ou pago: Gratuito

2. **Configurar Ficha**
   - Descrição curta (até 80 caracteres):
     ```
     Compre e venda roupas e acessórios de segunda mão. Moda sustentável!
     ```
   - Descrição longa (até 4000 caracteres):
     ```
     Apega Desapega é o seu brechó online!

     🛍️ COMPRE
     - Roupas, bolsas, calçados e acessórios
     - Peças únicas com até 80% de desconto
     - Marcas premium por menos

     💰 VENDA
     - Anuncie grátis em segundos
     - Ganhe dinheiro com peças paradas
     - IA ajuda a fotografar e precificar

     🌱 SUSTENTABILIDADE
     - Moda circular
     - Consumo consciente
     - Menos desperdício

     ✨ RECURSOS
     - Chat em tempo real com vendedores
     - Pagamento seguro via Mercado Pago
     - Frete calculado automaticamente
     - Avaliações de compradores e vendedores
     ```

3. **Screenshots**
   - Mínimo 2 screenshots
   - Tamanhos: 1080x1920 ou 1920x1080
   - Tire prints do app funcionando

4. **Ícone**
   - 512x512 PNG
   - Usar o ícone do app

5. **Gráfico de Recurso**
   - 1024x500 PNG
   - Banner promocional

### 4.6 Upload do AAB

1. Vá em **Produção** > **Criar nova versão**
2. Faça upload do arquivo `.aab` gerado pelo EAS
3. Adicione notas da versão:
   ```
   Versão inicial do Apega Desapega!
   - Compre e venda roupas e acessórios
   - Chat em tempo real
   - IA para fotos e preços
   ```

### 4.7 Teste Interno (Recomendado para Início)

1. Vá em **Testes** > **Teste interno**
2. Crie uma **lista de testadores**
3. Adicione emails dos testadores
4. Faça upload do AAB
5. Publique para teste interno

Os testadores receberão um link para baixar o app.

### 4.8 Checklist de Publicação

- [ ] Política de privacidade (URL pública)
- [ ] Classificação de conteúdo preenchida
- [ ] Declarações de anúncios
- [ ] Segurança de dados preenchida
- [ ] Screenshots em português
- [ ] Ícone e banner configurados

---

## Parte 5: Comandos Úteis

### Railway
```bash
# Ver logs
railway logs

# Abrir console
railway shell

# Listar serviços
railway status

# Redeploy
railway up
```

### EAS Build
```bash
# Build de desenvolvimento (APK)
eas build --profile development --platform android

# Build de preview (APK para testers)
eas build --profile preview --platform android

# Build de produção (AAB para Play Store)
eas build --profile production --platform android

# Verificar builds
eas build:list

# Baixar último build
eas build:download
```

### Expo
```bash
# Iniciar dev server
npx expo start

# Limpar cache
npx expo start --clear

# Exportar para web
npx expo export --platform web
```

---

## Parte 6: Checklist Final

### Backend
- [ ] Railway configurado
- [ ] Variáveis de ambiente setadas
- [ ] Banco de dados conectado
- [ ] Health check funcionando
- [ ] CORS configurado

### Mobile
- [ ] API_URL apontando para produção
- [ ] AdMob IDs configurados
- [ ] app.json com package correto
- [ ] eas.json configurado
- [ ] Build de produção gerado

### Play Store
- [ ] Conta de desenvolvedor ativa
- [ ] App criado no Console
- [ ] Ficha da loja preenchida
- [ ] Screenshots e ícones
- [ ] Política de privacidade
- [ ] Classificação de conteúdo
- [ ] AAB enviado
- [ ] Teste interno ativo

---

## Suporte

- [Documentação Railway](https://docs.railway.app)
- [Documentação Neon](https://neon.tech/docs)
- [Documentação EAS](https://docs.expo.dev/build/introduction/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
