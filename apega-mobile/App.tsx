import "./global.css";
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ProductsProvider } from './src/contexts/ProductsContext';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <AppNavigator />
      </ProductsProvider>
    </AuthProvider>
  );
}
