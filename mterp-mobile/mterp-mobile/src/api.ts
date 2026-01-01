import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GANTI DENGAN IP LAPTOP KAMU
const API_URL = 'http://server.megatama-enerco.com/api'; 

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