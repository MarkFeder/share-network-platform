/**
 * Frontend application constants
 */

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Alert thresholds (synced with backend)
export const ALERT_THRESHOLDS = {
  latencyMs: { warning: 100, critical: 500 },
  packetLoss: { warning: 1, critical: 5 },
  cpuUsage: { warning: 80, critical: 95 },
  memoryUsage: { warning: 85, critical: 95 },
  signalStrength: { warning: -70, critical: -80 },
  temperature: { warning: 70, critical: 85 },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  TELEMETRY: 30000,    // 30 seconds
  DASHBOARD: 60000,    // 1 minute
  ALERTS: 30000,       // 30 seconds
  DEVICES: 60000,      // 1 minute
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  DEVICES: '/devices',
  TELEMETRY: '/telemetry',
  ALERTS: '/alerts',
  TOPOLOGY: '/topology',
  SETTINGS: '/settings',
} as const;
