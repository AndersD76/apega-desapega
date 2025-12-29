import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import {
  HomeScreen,
  ProfileScreen,
  LoginScreen,
  SearchScreen,
  FavoritesScreen,
  SellScreen,
  ProductDetailScreen,
  RegisterScreen,
  CartScreen,
  CheckoutScreen,
  MyProductsScreen,
  OrdersScreen,
  MessagesScreen,
  ChatScreen,
  SettingsScreen,
  EditProfileScreen,
  AddressesScreen,
  SubscriptionScreen,
  WalletScreen,
  HelpScreen,
  EditProductScreen,
  SellerProfileScreen,
  PoliciesScreen,
  PremiumScreen,
} from './src/screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar - Clean Design
function CustomTabBar({ state, descriptors, navigation }: any) {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Search: { active: 'search', inactive: 'search-outline' },
    Sell: { active: 'add-circle', inactive: 'add-circle-outline' },
    Favorites: { active: 'heart', inactive: 'heart-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isSell = route.name === 'Sell';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isSell) {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.sellTab}>
              <View style={styles.sellButton}>
                <Ionicons name="add" size={28} color="#fff" />
              </View>
              <Text style={styles.sellLabel}>Desapegar</Text>
            </Pressable>
          );
        }

        const iconConfig = icons[route.name];

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <Ionicons
              name={(isFocused ? iconConfig.active : iconConfig.inactive) as any}
              size={24}
              color={isFocused ? '#5D8A7D' : '#9CA3AF'}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {options.title || route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Apegar' }} />
      <Tab.Screen name="Sell" component={SellScreen} options={{ title: 'Desapegar' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="MyProducts" component={MyProductsScreen} />
              <Stack.Screen name="EditProduct" component={EditProductScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              <Stack.Screen name="Messages" component={MessagesScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Addresses" component={AddressesScreen} />
              <Stack.Screen name="Subscription" component={SubscriptionScreen} />
              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen name="Help" component={HelpScreen} />
              <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
              <Stack.Screen name="Policies" component={PoliciesScreen} />
              <Stack.Screen name="Premium" component={PremiumScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#5D8A7D',
    fontWeight: '600',
  },
  sellTab: {
    flex: 1,
    alignItems: 'center',
    marginTop: -20,
  },
  sellButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5D8A7D',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(93, 138, 125, 0.4)' }
      : { shadowColor: '#5D8A7D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }
    ),
  } as any,
  sellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5D8A7D',
    marginTop: 4,
  },
});
