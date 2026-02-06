import axios from 'axios';
import type {
  NetworkDevice,
  TelemetryData,
  Alert,
  DashboardMetrics,
  DeviceStats,
  PaginatedResponse,
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Device API
export const deviceApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<NetworkDevice>> => {
    const { data } = await api.get('/devices', { params });
    return data;
  },

  get: async (id: string): Promise<NetworkDevice> => {
    const { data } = await api.get(`/devices/${id}`);
    return data;
  },

  create: async (device: Partial<NetworkDevice>): Promise<NetworkDevice> => {
    const { data } = await api.post('/devices', device);
    return data;
  },

  update: async (id: string, device: Partial<NetworkDevice>): Promise<NetworkDevice> => {
    const { data } = await api.put(`/devices/${id}`, device);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },

  getStats: async (): Promise<DeviceStats> => {
    const { data } = await api.get('/devices/stats');
    return data;
  },

  getTopology: async () => {
    const { data } = await api.get('/devices/topology');
    return data;
  },
};

// Telemetry API
export const telemetryApi = {
  getLatest: async (deviceId: string): Promise<TelemetryData> => {
    const { data } = await api.get(`/telemetry/device/${deviceId}/latest`);
    return data;
  },

  getHistory: async (
    deviceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<TelemetryData[]> => {
    const { data } = await api.get(`/telemetry/device/${deviceId}/history`, {
      params: { startTime: startTime.toISOString(), endTime: endTime.toISOString() },
    });
    return data;
  },

  getDashboard: async (): Promise<DashboardMetrics> => {
    const { data } = await api.get('/telemetry/dashboard');
    return data;
  },
};

// Alert API
export const alertApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    severity?: string;
  }): Promise<PaginatedResponse<Alert>> => {
    const { data } = await api.get('/alerts', { params });
    return data;
  },

  acknowledge: async (id: string): Promise<Alert> => {
    const { data } = await api.post(`/alerts/${id}/acknowledge`);
    return data;
  },

  resolve: async (id: string): Promise<Alert> => {
    const { data } = await api.post(`/alerts/${id}/resolve`);
    return data;
  },
};

// Health API
export const healthApi = {
  check: async () => {
    const { data } = await axios.get('/health');
    return data;
  },

  detailed: async () => {
    const { data } = await axios.get('/health/detailed');
    return data;
  },
};

export default api;
