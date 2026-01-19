import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ServerStackIcon,
  SignalIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { deviceApi, telemetryApi } from '../services/api';
import { DeviceStatus, AlertSeverity } from '../types';
import { PageLoader, PageHeader, Card } from '../components/common';
import { statusColors } from '../utils';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['deviceStats'],
    queryFn: deviceApi.getStats,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: telemetryApi.getDashboard,
  });

  const statCards = [
    {
      name: 'Total Devices',
      value: stats?.total ?? '-',
      icon: ServerStackIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Online',
      value: stats?.byStatus[DeviceStatus.ONLINE] ?? '-',
      icon: SignalIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Avg Latency',
      value: metrics ? `${metrics.avgLatency.toFixed(1)}ms` : '-',
      icon: ClockIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Alerts',
      value: metrics
        ? (metrics.alertCounts[AlertSeverity.CRITICAL] || 0) +
          (metrics.alertCounts[AlertSeverity.HIGH] || 0)
        : '-',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
  ];

  if (statsLoading || metricsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Network overview and key metrics"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bandwidth card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Bandwidth Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpIcon className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-600">Upload</span>
              </div>
              <span className="text-xl font-bold">
                {metrics ? `${(metrics.totalBandwidth.up / 1000).toFixed(1)} Gbps` : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDownIcon className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">Download</span>
              </div>
              <span className="text-xl font-bold">
                {metrics ? `${(metrics.totalBandwidth.down / 1000).toFixed(1)} Gbps` : '-'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Device Status</h3>
          <div className="space-y-3">
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      statusColors.dot[status as DeviceStatus] || 'bg-gray-400'
                    }`}
                  />
                  <span className="text-gray-600 capitalize">{status.toLowerCase()}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
