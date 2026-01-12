import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { deviceApi } from '../services/api';
import { DeviceStatus, DeviceType } from '../types';
import clsx from 'clsx';

export default function Devices() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['devices', page, statusFilter, typeFilter],
    queryFn: () =>
      deviceApi.list({
        page,
        limit: 10,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
  });

  const getStatusBadge = (status: DeviceStatus) => {
    const styles = {
      [DeviceStatus.ONLINE]: 'badge-success',
      [DeviceStatus.OFFLINE]: 'badge-danger',
      [DeviceStatus.DEGRADED]: 'badge-warning',
      [DeviceStatus.MAINTENANCE]: 'badge-info',
      [DeviceStatus.UNKNOWN]: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-500">Manage your network devices</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Device
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.values(DeviceStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="input w-full sm:w-40"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.values(DeviceType).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Last Seen</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.data.map((device) => (
                    <tr key={device.id}>
                      <td className="font-medium">{device.name}</td>
                      <td className="text-gray-500">
                        {device.type.replace('_', ' ')}
                      </td>
                      <td>
                        <span className={clsx('badge', getStatusBadge(device.status))}>
                          {device.status}
                        </span>
                      </td>
                      <td className="text-gray-500 font-mono text-xs">
                        {device.ipAddress || '-'}
                      </td>
                      <td className="text-gray-500">{device.locationName || '-'}</td>
                      <td className="text-gray-500">
                        {device.lastSeenAt
                          ? new Date(device.lastSeenAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td>
                        <button className="text-primary-600 hover:text-primary-800">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1} to{' '}
                  {Math.min(page * 10, data.pagination.total)} of{' '}
                  {data.pagination.total} devices
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary text-sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
