import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { alertApi } from '../services/api';
import { AlertSeverity } from '../types';
import clsx from 'clsx';

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', severityFilter],
    queryFn: () => alertApi.list({ severity: severityFilter || undefined }),
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    const styles = {
      [AlertSeverity.CRITICAL]: 'bg-red-100 text-red-800',
      [AlertSeverity.HIGH]: 'bg-orange-100 text-orange-800',
      [AlertSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [AlertSeverity.LOW]: 'bg-blue-100 text-blue-800',
      [AlertSeverity.INFO]: 'bg-gray-100 text-gray-800',
    };
    return styles[severity];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-500">Monitor and manage system alerts</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="input w-full sm:w-48"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            {Object.values(AlertSeverity).map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.length === 0 ? (
            <div className="card text-center text-gray-500 py-12">
              No alerts found
            </div>
          ) : (
            data?.data.map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'card border-l-4',
                  alert.severity === AlertSeverity.CRITICAL && 'border-l-red-500',
                  alert.severity === AlertSeverity.HIGH && 'border-l-orange-500',
                  alert.severity === AlertSeverity.MEDIUM && 'border-l-yellow-500',
                  alert.severity === AlertSeverity.LOW && 'border-l-blue-500',
                  alert.severity === AlertSeverity.INFO && 'border-l-gray-500'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('badge', getSeverityBadge(alert.severity))}>
                        {alert.severity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  {!alert.acknowledgedAt && (
                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Acknowledge"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Dismiss"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {alert.acknowledgedAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    Acknowledged at {new Date(alert.acknowledgedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
