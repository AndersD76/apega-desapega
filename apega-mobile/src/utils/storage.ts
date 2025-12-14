import { Platform } from 'react-native';

class Storage {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      return localStorage.getItem(key);
    } else {
      // Use AsyncStorage on mobile
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      localStorage.setItem(key, value);
    } else {
      // Use AsyncStorage on mobile
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      localStorage.removeItem(key);
    } else {
      // Use AsyncStorage on mobile
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    }
  }
}

export default new Storage();
