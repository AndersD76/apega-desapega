# 📱 Apega Desapega - App Mobile (React Native)

## 🎯 App 100% Mobile Nativo

Este é o app mobile nativo para iOS e Android do Apega Desapega.

---

## ✅ O Que Já Está Pronto

- ✅ Projeto Expo criado
- ✅ Dependências instaladas:
  - Firebase (banco de dados)
  - Expo Camera (tirar fotos)
  - Expo Image Picker (galeria)
  - React Navigation (navegação)

---

## 🚀 Como Rodar o App AGORA

### Opção 1: Expo Go (Mais Rápido - Recomendado)

1. **Instalar Expo Go no seu celular:**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Iniciar o servidor:**
   ```bash
   cd "E:\APPS EM DESENVOLVIMENTO\App Brechó\apega-mobile"
   npx expo start
   ```

3. **Escanear QR Code:**
   - iOS: Abra a câmera e aponte para o QR Code
   - Android: Abra o Expo Go e escaneie

4. **Pronto!** O app vai carregar no seu celular

---

### Opção 2: Emulador Android

1. Instalar Android Studio
2. Configurar emulador
3. Rodar: `npm run android`

---

### Opção 3: Simulador iOS (Só macOS)

1. Instalar Xcode
2. Rodar: `npm run ios`

---

## 📁 Estrutura do Projeto

```
apega-mobile/
├── App.tsx                 # Componente principal
├── app.json                # Configurações do Expo
├── package.json            # Dependências
├── assets/                 # Imagens, ícones
├── src/                    # Código-fonte (A CRIAR)
│   ├── config/
│   │   └── firebase.ts     # Config Firebase
│   ├── screens/            # Telas
│   │   ├── HomeScreen.tsx
│   │   ├── ItemDetailScreen.tsx
│   │   └── NewItemScreen.tsx
│   ├── components/         # Componentes
│   │   ├── ItemCard.tsx
│   │   └── CameraView.tsx
│   ├── navigation/         # Navegação
│   │   └── AppNavigator.tsx
│   └── types/              # TypeScript
│       └── index.ts
└── README_MOBILE.md        # Este arquivo
```

---

## 🔥 Próximos Passos (Você vai fazer)

### Passo 1: Configurar Firebase (5 min)

Criar arquivo: `src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCXReDgeu7ORLCz84LQv_c52sLFZVAUls",
  authDomain: "apega-app.firebaseapp.com",
  projectId: "apega-app",
  storageBucket: "apega-app.firebasestorage.app",
  messagingSenderId: "693684026669",
  appId: "1:693684026669:web:f832dde25ae2a38e8c27a4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

### Passo 2: Criar Types (2 min)

Criar arquivo: `src/types/index.ts`

```typescript
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
```

---

### Passo 3: Criar Navegação (5 min)

Criar arquivo: `src/navigation/AppNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import NewItemScreen from '../screens/NewItemScreen';

export type RootStackParamList = {
  Home: undefined;
  ItemDetail: { itemId: string };
  NewItem: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Apega Desapega' }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: 'Detalhes' }}
        />
        <Stack.Screen
          name="NewItem"
          component={NewItemScreen}
          options={{ title: 'Novo Anúncio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

### Passo 4: Atualizar App.tsx

Editar: `App.tsx`

```typescript
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

---

### Passo 5: Criar HomeScreen (10 min)

Criar arquivo: `src/screens/HomeScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Item } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const itemsRef = collection(db, 'items');
      const q = query(itemsRef, where('status', '==', 'AVAILABLE'));
      const snapshot = await getDocs(q);

      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Item[];

      setItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{formatPrice(item.priceCents)}</Text>
        <Text style={styles.details}>
          {item.brand && `${item.brand} • `}{item.size || 'Tam. único'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma peça disponível</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewItem')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
```

---

## 🎯 Resultado Esperado

Depois de seguir todos os passos:

1. ✅ App abre no celular
2. ✅ Lista de peças aparece
3. ✅ Consegue clicar e ver detalhes
4. ✅ Botão "+" abre tela de novo anúncio
5. ✅ Consegue tirar foto e criar anúncio

---

## 📱 Como Testar

1. Rodar: `npx expo start`
2. Escanear QR Code com Expo Go
3. Ver lista de peças
4. Clicar em uma peça
5. Ver detalhes
6. Voltar
7. Clicar no botão "+"
8. Ver formulário

---

## 🚀 Deploy (Depois)

### Testflight (iOS - Beta)
```bash
eas build --platform ios
eas submit --platform ios
```

### Google Play (Android - Beta)
```bash
eas build --platform android
eas submit --platform android
```

---

## 💡 Próximas Funcionalidades

- [ ] Tela de detalhes completa
- [ ] Formulário de novo anúncio
- [ ] Integração com câmera
- [ ] Upload de fotos para Firebase Storage
- [ ] Botão WhatsApp
- [ ] Push notifications
- [ ] Favoritos
- [ ] Busca e filtros

---

## 📚 Documentação

- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase](https://firebase.google.com/docs)

---

**Pronto para começar?** Siga os passos acima e terá um app mobile 100% funcional!
