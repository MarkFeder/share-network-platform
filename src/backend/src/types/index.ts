import { Request } from 'express';

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

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface TelemetryInput {
  deviceId: string;
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
  metadata?: Record<string, unknown>;
}

export interface DeviceInput {
  name: string;
  type: DeviceType;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  parentDeviceId?: string;
  metadata?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export interface DeviceStats {
  total: number;
  byStatus: Record<DeviceStatus, number>;
  byType: Record<DeviceType, number>;
}

export interface DashboardMetrics {
  deviceStats: DeviceStats;
  alertCounts: Record<AlertSeverity, number>;
  avgLatency: number;
  avgPacketLoss: number;
  totalBandwidth: {
    up: number;
    down: number;
  };
  recentAlerts: Array<{
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    createdAt: Date;
  }>;
}
