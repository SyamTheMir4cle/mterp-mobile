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


// === TOOL MANAGEMENT NEW FEATURES ===

// 1. Dashboard Global (Warehouse vs Deployed)
export const getToolDashboard = async (search = '') => {
  const response = await api.get(`/inventory/dashboard?search=${search}`);
  return response.data;
};

// 2. Assign Alat dari Gudang ke Project (Admin Only)
export const assignToolToProject = async (data: {
  toolId: string;
  projectId: string;
  quantity: number;
  notes?: string;
}) => {
  const response = await api.post('/inventory/assign', data);
  return response.data;
};

// 3. Tag Penggunaan Harian (Admin Only)
export const tagToolUsage = async (data: {
  projectToolId: string;
  usedByWorker: string;
  workItem: string;
  notes?: string;
}) => {
  const response = await api.post('/inventory/usage', data);
  return response.data;
};

// 4. Ambil list alat di Project Tertentu (Untuk Dropdown Tagging / Laporan)
export const getProjectTools = async (projectId: string) => {
  const response = await api.get(`/inventory/project/${projectId}`);
  return response.data;
};

// 5. Kembalikan Alat ke Gudang (Optional)
export const returnToolToWarehouse = async (data: {
  projectToolId: string;
  quantity: number;
}) => {
  const response = await api.post('/inventory/return-warehouse', data);
  return response.data;
};

export default api;