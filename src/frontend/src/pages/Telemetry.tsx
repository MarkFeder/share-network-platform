import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceApi, telemetryApi } from '../services/api';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Telemetry</h1>
        <p className="text-gray-500">Real-time device metrics and analytics</p>
      </div>

      {/* Filters */}
      <div className="card">
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
      </div>

      {/* Metrics */}
      {selectedDevice ? (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : telemetry ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Latency"
              value={telemetry.latencyMs?.toFixed(1) ?? '-'}
              unit="ms"
              status={getMetricStatus(telemetry.latencyMs, 100, 500)}
            />
            <MetricCard
              title="Packet Loss"
              value={telemetry.packetLoss?.toFixed(2) ?? '-'}
              unit="%"
              status={getMetricStatus(telemetry.packetLoss, 1, 5)}
            />
            <MetricCard
              title="CPU Usage"
              value={telemetry.cpuUsage?.toFixed(1) ?? '-'}
              unit="%"
              status={getMetricStatus(telemetry.cpuUsage, 80, 95)}
            />
            <MetricCard
              title="Memory Usage"
              value={telemetry.memoryUsage?.toFixed(1) ?? '-'}
              unit="%"
              status={getMetricStatus(telemetry.memoryUsage, 85, 95)}
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
              status={getSignalStatus(telemetry.signalStrength)}
            />
            <MetricCard
              title="Connected Clients"
              value={telemetry.connectedClients ?? '-'}
              unit=""
            />
          </div>
        ) : (
          <div className="card text-center text-gray-500 py-12">
            No telemetry data available
          </div>
        )
      ) : (
        <div className="card text-center text-gray-500 py-12">
          Select a device to view telemetry data
        </div>
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
  status?: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <div className="card">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${status ? statusColors[status] : 'text-gray-900'}`}>
        {value}
        <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function getMetricStatus(
  value: number | undefined,
  warningThreshold: number,
  criticalThreshold: number
): 'good' | 'warning' | 'critical' | undefined {
  if (value === undefined) return undefined;
  if (value >= criticalThreshold) return 'critical';
  if (value >= warningThreshold) return 'warning';
  return 'good';
}

function getSignalStatus(value: number | undefined): 'good' | 'warning' | 'critical' | undefined {
  if (value === undefined) return undefined;
  if (value <= -80) return 'critical';
  if (value <= -70) return 'warning';
  return 'good';
}
