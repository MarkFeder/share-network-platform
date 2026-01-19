/**
 * Centralized application constants
 */

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  DEVICE: 300,        // 5 minutes
  DEVICE_LIST: 60,    // 1 minute
  TELEMETRY: 60,      // 1 minute
  SESSION: 86400,     // 24 hours
} as const;

// Alert thresholds
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
  MAX_LIMIT: 100,
  MAX_BATCH_SIZE: 1000,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  WINDOW_MS: 60000,   // 1 minute
  MAX_REQUESTS: 100,
} as const;

// Socket.IO event channels
export const CHANNELS = {
  DEVICE_EVENTS: 'device:events',
  TELEMETRY_EVENTS: 'telemetry:events',
  ALERT_EVENTS: 'alert:events',
} as const;

// Event types
export const EVENT_TYPES = {
  DEVICE_REGISTERED: 'device:registered',
  DEVICE_UPDATED: 'device:updated',
  DEVICE_DELETED: 'device:deleted',
  DEVICE_STATUS_CHANGED: 'device:status_changed',
  TELEMETRY_RECEIVED: 'telemetry:received',
  ALERT_CREATED: 'alert:created',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',
  ALERT_RESOLVED: 'alert:resolved',
} as const;

export type Channel = typeof CHANNELS[keyof typeof CHANNELS];
export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
