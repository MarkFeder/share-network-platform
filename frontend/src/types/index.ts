export enum DeviceType {
  ROUTER = 'ROUTER',
  ACCESS_POINT = 'ACCESS_POINT',
  GATEWAY = 'GATEWAY',
  MESH_NODE = 'MESH_NODE',
  SWITCH = 'SWITCH',
  MODEM = 'MODEM',
  REPEATER = 'REPEATER',
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  DEGRADED = 'DEGRADED',
  MAINTENANCE = 'MAINTENANCE',
  UNKNOWN = 'UNKNOWN',
}

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum AlertType {
  DEVICE_OFFLINE = 'DEVICE_OFFLINE',
  HIGH_LATENCY = 'HIGH_LATENCY',
  PACKET_LOSS = 'PACKET_LOSS',
  HIGH_CPU = 'HIGH_CPU',
  HIGH_MEMORY = 'HIGH_MEMORY',
  LOW_SIGNAL = 'LOW_SIGNAL',
  FIRMWARE_UPDATE = 'FIRMWARE_UPDATE',
  SECURITY = 'SECURITY',
  CUSTOM = 'CUSTOM',
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  organizationId: string;
  parentDeviceId?: string;
  metadata?: Record<string, unknown>;
  config?: Record<string, unknown>;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryData {
  id: string;
  deviceId: string;
  timestamp: string;
  latencyMs?: number;
  jitterMs?: number;
  packetLoss?: number;
  bandwidthUp?: number;
  bandwidthDown?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  temperature?: number;
  signalStrength?: number;
  connectedClients?: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  deviceId?: string;
  organizationId: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  avgLatency: number;
  avgPacketLoss: number;
  totalBandwidth: {
    up: number;
    down: number;
  };
  alertCounts: Record<AlertSeverity, number>;
  dataPoints: number;
}

export interface DeviceStats {
  total: number;
  byStatus: Record<DeviceStatus, number>;
  byType: Record<DeviceType, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}
