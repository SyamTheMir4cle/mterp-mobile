import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GANTI DENGAN IP LAPTOP KAMU
const API_URL = 'http://192.168.100.103:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;