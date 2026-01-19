import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceApi, telemetryApi } from '../services/api';
import {
  LoadingSpinner,
  PageHeader,
  Card,
  EmptyState,
} from '../components/common';
import {
  getMetricStatus,
  getSignalStatus,
  MetricStatus,
  ALERT_THRESHOLDS,
} from '../utils';

export default function Telemetry() {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('1h');

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list({ limit: 100 }),
  });

  const { data: telemetry, isLoading } = useQuery({
    queryKey: ['telemetry', selectedDevice],
    queryFn: () => telemetryApi.getLatest(selectedDevice),
    enabled: !!selectedDevice,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telemetry"
        description="Real-time device metrics and analytics"
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="input flex-1"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="">Select a device</option>
            {devices?.data.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
          <select
            className="input w-full sm:w-40"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </Card>

      {/* Metrics */}
      {selectedDevice ? (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : telemetry ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Latency"
              value={telemetry.latencyMs?.toFixed(1) ?? '-'}
              unit="ms"
              status={telemetry.latencyMs ? getMetricStatus(telemetry.latencyMs, ALERT_THRESHOLDS.latencyMs) : undefined}
            />
            <MetricCard
              title="Packet Loss"
              value={telemetry.packetLoss?.toFixed(2) ?? '-'}
              unit="%"
              status={telemetry.packetLoss ? getMetricStatus(telemetry.packetLoss, ALERT_THRESHOLDS.packetLoss) : undefined}
            />
            <MetricCard
              title="CPU Usage"
              value={telemetry.cpuUsage?.toFixed(1) ?? '-'}
              unit="%"
              status={telemetry.cpuUsage ? getMetricStatus(telemetry.cpuUsage, ALERT_THRESHOLDS.cpuUsage) : undefined}
            />
            <MetricCard
              title="Memory Usage"
              value={telemetry.memoryUsage?.toFixed(1) ?? '-'}
              unit="%"
              status={telemetry.memoryUsage ? getMetricStatus(telemetry.memoryUsage, ALERT_THRESHOLDS.memoryUsage) : undefined}
            />
            <MetricCard
              title="Bandwidth Up"
              value={telemetry.bandwidthUp?.toFixed(1) ?? '-'}
              unit="Mbps"
            />
            <MetricCard
              title="Bandwidth Down"
              value={telemetry.bandwidthDown?.toFixed(1) ?? '-'}
              unit="Mbps"
            />
            <MetricCard
              title="Signal Strength"
              value={telemetry.signalStrength ?? '-'}
              unit="dBm"
              status={telemetry.signalStrength ? getSignalStatus(telemetry.signalStrength) : undefined}
            />
            <MetricCard
              title="Connected Clients"
              value={telemetry.connectedClients ?? '-'}
              unit=""
            />
          </div>
        ) : (
          <EmptyState
            title="No telemetry data"
            description="No telemetry data available for this device"
          />
        )
      ) : (
        <EmptyState
          title="Select a device"
          description="Select a device to view telemetry data"
        />
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  status,
}: {
  title: string;
  value: string | number;
  unit: string;
  status?: MetricStatus;
}) {
  const statusTextColors: Record<MetricStatus, string> = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <Card>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${status ? statusTextColors[status] : 'text-gray-900'}`}>
        {value}
        <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </Card>
  );
}
