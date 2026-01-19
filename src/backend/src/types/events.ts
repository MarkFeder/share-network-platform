import { CHANNELS, EVENT_TYPES, Channel, EventType } from '../config/constants.js';
import { AlertSeverity, AlertType, DeviceStatus } from './index.js';

/**
 * Type-safe Socket.IO event definitions
 */

// Base event interface
export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  organizationId: string;
}

// Device events
export interface DeviceRegisteredEvent extends BaseEvent {
  type: typeof EVENT_TYPES.DEVICE_REGISTERED;
  payload: {
    device: {
      id: string;
      name: string;
      type: string;
      status: DeviceStatus;
    };
  };
}

export interface DeviceUpdatedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.DEVICE_UPDATED;
  payload: {
    device: {
      id: string;
      name: string;
      type: string;
      status: DeviceStatus;
    };
  };
}

export interface DeviceDeletedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.DEVICE_DELETED;
  payload: {
    deviceId: string;
  };
}

export interface DeviceStatusChangedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.DEVICE_STATUS_CHANGED;
  payload: {
    deviceId: string;
    status: DeviceStatus;
    previousStatus?: DeviceStatus;
  };
}

// Telemetry events
export interface TelemetryReceivedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.TELEMETRY_RECEIVED;
  payload: {
    deviceId: string;
    latencyMs?: number;
    packetLoss?: number;
    cpuUsage?: number;
  };
}

// Alert events
export interface AlertCreatedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.ALERT_CREATED;
  payload: {
    alertId: string;
    type: AlertType;
    severity: AlertSeverity;
    deviceId: string;
    message: string;
  };
}

export interface AlertAcknowledgedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.ALERT_ACKNOWLEDGED;
  payload: {
    alertId: string;
    acknowledgedBy: string;
  };
}

export interface AlertResolvedEvent extends BaseEvent {
  type: typeof EVENT_TYPES.ALERT_RESOLVED;
  payload: {
    alertId: string;
    resolvedBy?: string;
  };
}

// Union types for each channel
export type DeviceEvent =
  | DeviceRegisteredEvent
  | DeviceUpdatedEvent
  | DeviceDeletedEvent
  | DeviceStatusChangedEvent;

export type TelemetryEvent = TelemetryReceivedEvent;

export type AlertEvent =
  | AlertCreatedEvent
  | AlertAcknowledgedEvent
  | AlertResolvedEvent;

export type SystemEvent = DeviceEvent | TelemetryEvent | AlertEvent;

// Channel to event type mapping
export interface ChannelEventMap {
  [CHANNELS.DEVICE_EVENTS]: DeviceEvent;
  [CHANNELS.TELEMETRY_EVENTS]: TelemetryEvent;
  [CHANNELS.ALERT_EVENTS]: AlertEvent;
}

// Type-safe publish function signature
export type PublishFn = <C extends Channel>(
  channel: C,
  event: Omit<ChannelEventMap[C], 'timestamp'>
) => Promise<void>;
