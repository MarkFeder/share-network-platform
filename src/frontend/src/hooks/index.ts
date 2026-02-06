import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { deviceApi, telemetryApi, alertApi } from '../services/api';
import { REFRESH_INTERVALS, QUERY_KEYS } from '../utils/constants';

// Socket connection hook
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('/', {
      transports: ['websocket'],
      autoConnect: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}

// Real-time device updates
export function useDeviceUpdates(organizationId: string) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe:devices', organizationId);

    socket.on('device:update', () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICE_STATS] });
    });

    return () => {
      socket.off('device:update');
    };
  }, [socket, organizationId, queryClient]);
}

// Real-time telemetry updates
export function useTelemetryUpdates(deviceId: string) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !deviceId) return;

    socket.emit('subscribe:telemetry', deviceId);

    socket.on('telemetry:update', () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TELEMETRY, deviceId] });
    });

    return () => {
      socket.off('telemetry:update');
    };
  }, [socket, deviceId, queryClient]);
}

// Real-time alert updates
export function useAlertUpdates(organizationId: string) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe:alerts', organizationId);

    socket.on('alert:update', () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    });

    return () => {
      socket.off('alert:update');
    };
  }, [socket, organizationId, queryClient]);
}

// Devices hook
export function useDevices(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.DEVICES, params],
    queryFn: () => deviceApi.list(params),
  });
}

// Device stats hook
export function useDeviceStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.DEVICE_STATS],
    queryFn: deviceApi.getStats,
  });
}

// Telemetry hook
export function useTelemetry(deviceId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TELEMETRY, deviceId],
    queryFn: () => telemetryApi.getLatest(deviceId),
    enabled: !!deviceId,
    refetchInterval: REFRESH_INTERVALS.TELEMETRY,
  });
}

// Dashboard metrics hook
export function useDashboardMetrics() {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
    queryFn: telemetryApi.getDashboard,
    refetchInterval: REFRESH_INTERVALS.DASHBOARD,
  });
}

// Alerts hook
export function useAlerts(params?: { severity?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.ALERTS, params],
    queryFn: () => alertApi.list(params),
  });
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Interval hook
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
