import { DeviceStatus, AlertSeverity, DeviceType } from '../types';

/**
 * Centralized style utilities for consistent styling across components
 */

// Status colors for different contexts
export const statusColors = {
  background: {
    [DeviceStatus.ONLINE]: 'bg-green-500',
    [DeviceStatus.OFFLINE]: 'bg-red-500',
    [DeviceStatus.DEGRADED]: 'bg-yellow-500',
    [DeviceStatus.MAINTENANCE]: 'bg-blue-500',
    [DeviceStatus.UNKNOWN]: 'bg-gray-500',
  },
  text: {
    [DeviceStatus.ONLINE]: 'text-green-600',
    [DeviceStatus.OFFLINE]: 'text-red-600',
    [DeviceStatus.DEGRADED]: 'text-yellow-600',
    [DeviceStatus.MAINTENANCE]: 'text-blue-600',
    [DeviceStatus.UNKNOWN]: 'text-gray-600',
  },
  badge: {
    [DeviceStatus.ONLINE]: 'bg-green-100 text-green-800',
    [DeviceStatus.OFFLINE]: 'bg-red-100 text-red-800',
    [DeviceStatus.DEGRADED]: 'bg-yellow-100 text-yellow-800',
    [DeviceStatus.MAINTENANCE]: 'bg-blue-100 text-blue-800',
    [DeviceStatus.UNKNOWN]: 'bg-gray-100 text-gray-800',
  },
  dot: {
    [DeviceStatus.ONLINE]: 'bg-green-400',
    [DeviceStatus.OFFLINE]: 'bg-red-400',
    [DeviceStatus.DEGRADED]: 'bg-yellow-400',
    [DeviceStatus.MAINTENANCE]: 'bg-blue-400',
    [DeviceStatus.UNKNOWN]: 'bg-gray-400',
  },
} as const;

// Severity colors
export const severityColors = {
  background: {
    [AlertSeverity.CRITICAL]: 'bg-red-500',
    [AlertSeverity.HIGH]: 'bg-orange-500',
    [AlertSeverity.MEDIUM]: 'bg-yellow-500',
    [AlertSeverity.LOW]: 'bg-blue-500',
    [AlertSeverity.INFO]: 'bg-gray-500',
  },
  text: {
    [AlertSeverity.CRITICAL]: 'text-red-600',
    [AlertSeverity.HIGH]: 'text-orange-600',
    [AlertSeverity.MEDIUM]: 'text-yellow-600',
    [AlertSeverity.LOW]: 'text-blue-600',
    [AlertSeverity.INFO]: 'text-gray-600',
  },
  badge: {
    [AlertSeverity.CRITICAL]: 'bg-red-100 text-red-800',
    [AlertSeverity.HIGH]: 'bg-orange-100 text-orange-800',
    [AlertSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [AlertSeverity.LOW]: 'bg-blue-100 text-blue-800',
    [AlertSeverity.INFO]: 'bg-gray-100 text-gray-800',
  },
  border: {
    [AlertSeverity.CRITICAL]: 'border-red-500',
    [AlertSeverity.HIGH]: 'border-orange-500',
    [AlertSeverity.MEDIUM]: 'border-yellow-500',
    [AlertSeverity.LOW]: 'border-blue-500',
    [AlertSeverity.INFO]: 'border-gray-500',
  },
} as const;

// Device type icons (for use with dynamic rendering)
export const deviceTypeLabels: Record<DeviceType, string> = {
  [DeviceType.ROUTER]: 'Router',
  [DeviceType.ACCESS_POINT]: 'Access Point',
  [DeviceType.GATEWAY]: 'Gateway',
  [DeviceType.MESH_NODE]: 'Mesh Node',
  [DeviceType.SWITCH]: 'Switch',
  [DeviceType.MODEM]: 'Modem',
  [DeviceType.REPEATER]: 'Repeater',
};

// Helper functions
export function getStatusColor(status: DeviceStatus, type: keyof typeof statusColors = 'background'): string {
  return statusColors[type][status];
}

export function getSeverityColor(severity: AlertSeverity, type: keyof typeof severityColors = 'badge'): string {
  return severityColors[type][severity];
}

// Metric status helpers
export type MetricStatus = 'good' | 'warning' | 'critical';

export function getMetricStatus(value: number, thresholds: { warning: number; critical: number }): MetricStatus {
  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'good';
}

export const metricStatusColors: Record<MetricStatus, { bg: string; text: string }> = {
  good: { bg: 'bg-green-100', text: 'text-green-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const metricStatusTextColors: Record<MetricStatus, string> = {
  good: 'text-green-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
};

// Signal strength helper (returns status based on dBm)
export function getSignalStatus(dbm: number): MetricStatus {
  if (dbm >= -50) return 'good';
  if (dbm >= -70) return 'warning';
  return 'critical';
}
