import { useState } from 'react';
import {
  PageLoader,
  PageHeader,
  Card,
  EmptyState,
  MetricCard,
} from '../components/common';
import { useDevices, useTelemetry } from '../hooks';
import {
  getMetricStatus,
  getSignalStatus,
  ALERT_THRESHOLDS,
} from '../utils';

export default function Telemetry() {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('1h');

  const { data: devices } = useDevices({ limit: 100 });
  const { data: telemetry, isLoading } = useTelemetry(selectedDevice);

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
          <PageLoader />
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
