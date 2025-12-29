# Configuração do Google AdMob - Apega Desapega

Este guia explica como configurar o Google AdMob para monetizar o app com anúncios.

## 1. Criar Conta no AdMob

1. Acesse [admob.google.com](https://admob.google.com)
2. Faça login com sua conta Google
3. Aceite os termos de serviço
4. Configure suas informações de pagamento

## 2. Registrar o App

### Para Android:
1. No painel do AdMob, clique em "Apps" > "Adicionar app"
2. Selecione "Android"
3. Se ainda não publicou o app, selecione "Não"
4. Nome do app: `Apega Desapega`
5. Copie o **App ID** (formato: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)

### Para iOS:
1. Repita o processo selecionando "iOS"
2. Nome do app: `Apega Desapega`
3. Copie o **App ID**

## 3. Criar Unidades de Anúncio

Para cada plataforma (Android e iOS), crie:

### Banner (Recomendado para ProductDetailScreen)
1. Vá em "Unidades de anúncio" > "Adicionar unidade de anúncio"
2. Selecione "Banner"
3. Nome: `product_detail_banner`
4. Copie o **Ad Unit ID** (formato: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

### Banner Médio Retângulo (Opcional)
1. Adicione outra unidade de banner
2. Nome: `product_detail_rectangle`
3. Copie o **Ad Unit ID**

## 4. Atualizar o Código

### 4.1 Atualizar app.json

Substitua os IDs de placeholder pelos seus IDs reais:

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-SEU_APP_ID_ANDROID",
      "iosAppId": "ca-app-pub-SEU_APP_ID_IOS"
    }
  ]
]
```

### 4.2 Atualizar AdBanner.tsx

Em `src/components/AdBanner.tsx`, substitua os IDs:

```typescript
// IDs de PRODUÇÃO
production: {
  android: {
    banner: 'ca-app-pub-SEU_AD_UNIT_ANDROID',
  },
  ios: {
    banner: 'ca-app-pub-SEU_AD_UNIT_IOS',
  },
},
```

### 4.3 Ativar Produção

Quando estiver pronto, mude:

```typescript
const USE_PRODUCTION_ADS = true;
```

## 5. Gerar Build de Desenvolvimento

O AdMob **não funciona** no Expo Go. Você precisa criar um build de desenvolvimento:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Criar build de desenvolvimento para Android
eas build --profile development --platform android

# Criar build de desenvolvimento para iOS
eas build --profile development --platform ios
```

## 6. Configurar eas.json

Crie ou atualize o arquivo `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## 7. Testar Anúncios

### Durante Desenvolvimento (IDs de Teste)
- Os IDs de teste já estão configurados no código
- Não geram receita, mas são seguros para testar

### Em Produção
- Use seus IDs reais
- **NUNCA** clique nos seus próprios anúncios (viola políticas)
- Monitore métricas no painel do AdMob

## 8. Tipos de Anúncios Disponíveis

| Tipo | Tamanho | Uso Recomendado |
|------|---------|-----------------|
| Banner | 320x50 | Header/Footer |
| Large Banner | 320x100 | Seções |
| Medium Rectangle | 300x250 | Entre conteúdo |
| Full Banner | 468x60 | Tablets |

## 9. Estimativa de Ganhos

Os ganhos variam muito, mas para referência:

- **CPC** (Custo Por Clique): R$ 0,05 - R$ 0,50
- **CPM** (Custo Por 1000 Impressões): R$ 0,50 - R$ 5,00
- **eCPM médio Brasil**: R$ 1,00 - R$ 3,00

Com 10.000 usuários ativos diários:
- ~30.000 impressões/dia
- Potencial: R$ 30 - R$ 150/dia

## 10. Boas Práticas

1. **Posicionamento**: Coloque anúncios onde não atrapalhem a UX
2. **Frequência**: Não exagere na quantidade de anúncios
3. **Relevância**: Anúncios em contexto convertem melhor
4. **Teste A/B**: Experimente diferentes posições e tamanhos
5. **Monitoramento**: Acompanhe métricas de fill rate e eCPM

## Suporte

- [Documentação AdMob](https://developers.google.com/admob)
- [react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo + AdMob Guide](https://docs.expo.dev/guides/using-react-native-google-mobile-ads/)
