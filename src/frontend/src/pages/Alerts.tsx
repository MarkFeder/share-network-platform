import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AlertSeverity } from '../types';
import {
  PageLoader,
  PageHeader,
  Card,
  SeverityBadge,
  EmptyState,
} from '../components/common';
import { useAlerts } from '../hooks';
import { severityColors } from '../utils';
import clsx from 'clsx';

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data, isLoading } = useAlerts({
    severity: severityFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Monitor and manage system alerts"
      />

      {/* Filters */}
      <Card>
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
      </Card>

      {/* Alerts list */}
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-4">
          {data?.data.length === 0 ? (
            <EmptyState
              title="No alerts"
              description="There are no alerts matching your criteria"
            />
          ) : (
            data?.data.map((alert) => (
              <Card
                key={alert.id}
                className={clsx(
                  'border-l-4',
                  severityColors.border[alert.severity]
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge severity={alert.severity} />
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
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
