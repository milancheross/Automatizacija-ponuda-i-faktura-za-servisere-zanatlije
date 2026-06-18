import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
console.log('API BASE_URL:', BASE_URL);
