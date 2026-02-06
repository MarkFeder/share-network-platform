import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DeviceStatus, DeviceType } from '../types';
import {
  PageLoader,
  PageHeader,
  Card,
  StatusBadge,
  DeviceTypeBadge,
} from '../components/common';
import { useDevices } from '../hooks';
import { PAGINATION } from '../utils';

export default function Devices() {
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data, isLoading } = useDevices({
    page,
    limit: PAGINATION.DEFAULT_LIMIT / 2,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const addDeviceButton = (
    <button className="btn-primary">
      <PlusIcon className="w-5 h-5 mr-2" />
      Add Device
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        description="Manage your network devices"
        actions={addDeviceButton}
      />

      {/* Filters */}
      <Card>
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
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <PageLoader />
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
                      <td>
                        <DeviceTypeBadge type={device.type} />
                      </td>
                      <td>
                        <StatusBadge status={device.status} />
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
      </Card>
    </div>
  );
}
