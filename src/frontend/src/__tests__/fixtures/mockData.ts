import { DeviceType, DeviceStatus, AlertSeverity, AlertType } from '../../types';

export const mockDevices = [
  {
    id: 'device-1',
    name: 'Main Router',
    type: DeviceType.ROUTER,
    status: DeviceStatus.ONLINE,
    ipAddress: '192.168.1.1',
    macAddress: '00:11:22:33:44:55',
    firmwareVersion: '1.0.0',
    organizationId: 'org-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'device-2',
    name: 'Office Switch',
    type: DeviceType.SWITCH,
    status: DeviceStatus.ONLINE,
    ipAddress: '192.168.1.2',
    macAddress: '00:11:22:33:44:56',
    firmwareVersion: '2.0.0',
    organizationId: 'org-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'device-3',
    name: 'Access Point',
    type: DeviceType.ACCESS_POINT,
    status: DeviceStatus.DEGRADED,
    ipAddress: '192.168.1.3',
    macAddress: '00:11:22:33:44:57',
    firmwareVersion: '1.5.0',
    organizationId: 'org-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockStats = {
  total: 10,
  byStatus: {
    [DeviceStatus.ONLINE]: 7,
    [DeviceStatus.OFFLINE]: 2,
    [DeviceStatus.DEGRADED]: 1,
    [DeviceStatus.MAINTENANCE]: 0,
    [DeviceStatus.UNKNOWN]: 0,
  },
  byType: {
    [DeviceType.ROUTER]: 3,
    [DeviceType.SWITCH]: 4,
    [DeviceType.ACCESS_POINT]: 2,
    [DeviceType.GATEWAY]: 1,
    [DeviceType.MESH_NODE]: 0,
    [DeviceType.MODEM]: 0,
    [DeviceType.REPEATER]: 0,
  },
};

export const mockMetrics = {
  deviceStats: mockStats,
  alertCounts: {
    [AlertSeverity.CRITICAL]: 1,
    [AlertSeverity.HIGH]: 3,
    [AlertSeverity.MEDIUM]: 5,
    [AlertSeverity.LOW]: 8,
    [AlertSeverity.INFO]: 12,
  },
  avgLatency: 45.5,
  avgPacketLoss: 0.2,
  totalBandwidth: {
    up: 5000,
    down: 15000,
  },
  recentAlerts: [],
};

export const mockAlerts = [
  {
    id: 'alert-1',
    type: AlertType.HIGH_LATENCY,
    severity: AlertSeverity.HIGH,
    title: 'High latency detected',
    message: 'Device Main Router experiencing high latency (150ms)',
    deviceId: 'device-1',
    organizationId: 'org-123',
    acknowledgedAt: null,
    resolvedAt: null,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'alert-2',
    type: AlertType.DEVICE_OFFLINE,
    severity: AlertSeverity.CRITICAL,
    title: 'Device offline',
    message: 'Device Backup Router is offline',
    deviceId: 'device-4',
    organizationId: 'org-123',
    acknowledgedAt: null,
    resolvedAt: null,
    createdAt: '2024-01-15T09:00:00Z',
  },
];

export const mockTelemetry = {
  id: 'telemetry-1',
  deviceId: 'device-1',
  latencyMs: 45,
  jitterMs: 5,
  packetLoss: 0.1,
  bandwidthUp: 100,
  bandwidthDown: 500,
  cpuUsage: 35,
  memoryUsage: 60,
  diskUsage: 45,
  temperature: 42,
  signalStrength: -65,
  connectedClients: 25,
  timestamp: '2024-01-15T10:00:00Z',
};
