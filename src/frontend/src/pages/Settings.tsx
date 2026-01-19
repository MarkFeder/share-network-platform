import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../services/api';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    slack: true,
  });

  const [alertThresholds, setAlertThresholds] = useState({
    latency: 100,
    packetLoss: 1,
    cpuUsage: 80,
    memoryUsage: 85,
  });

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.detailed,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure platform settings and preferences</p>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Database</span>
            <span
              className={`badge ${
                health?.checks?.database ? 'badge-success' : 'badge-danger'
              }`}
            >
              {health?.checks?.database ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Redis</span>
            <span
              className={`badge ${
                health?.checks?.redis ? 'badge-success' : 'badge-danger'
              }`}
            >
              {health?.checks?.redis ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Uptime</span>
            <span className="font-medium">
              {health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize text-gray-700">{key} Notifications</span>
              <button
                onClick={() =>
                  setNotifications({ ...notifications, [key]: !value })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latency Warning (ms)
            </label>
            <input
              type="number"
              className="input"
              value={alertThresholds.latency}
              onChange={(e) =>
                setAlertThresholds({
                  ...alertThresholds,
                  latency: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Packet Loss Warning (%)
            </label>
            <input
              type="number"
              className="input"
              value={alertThresholds.packetLoss}
              onChange={(e) =>
                setAlertThresholds({
                  ...alertThresholds,
                  packetLoss: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPU Usage Warning (%)
            </label>
            <input
              type="number"
              className="input"
              value={alertThresholds.cpuUsage}
              onChange={(e) =>
                setAlertThresholds({
                  ...alertThresholds,
                  cpuUsage: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Usage Warning (%)
            </label>
            <input
              type="number"
              className="input"
              value={alertThresholds.memoryUsage}
              onChange={(e) =>
                setAlertThresholds({
                  ...alertThresholds,
                  memoryUsage: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
