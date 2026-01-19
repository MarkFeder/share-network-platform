import { useQuery } from '@tanstack/react-query';
import { deviceApi } from '../services/api';
import { DeviceStatus } from '../types';

export default function Topology() {
  const { data: topology, isLoading } = useQuery({
    queryKey: ['topology'],
    queryFn: deviceApi.getTopology,
  });

  const getStatusColor = (status: DeviceStatus) => {
    const colors = {
      [DeviceStatus.ONLINE]: 'bg-green-500',
      [DeviceStatus.OFFLINE]: 'bg-red-500',
      [DeviceStatus.DEGRADED]: 'bg-yellow-500',
      [DeviceStatus.MAINTENANCE]: 'bg-blue-500',
      [DeviceStatus.UNKNOWN]: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Topology</h1>
        <p className="text-gray-500">Visual representation of your network</p>
      </div>

      <div className="card min-h-[500px]">
        {topology && topology.nodes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topology.nodes.map((node: { id: string; name: string; type: string; status: DeviceStatus }) => (
              <div
                key={node.id}
                className="p-4 border rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                  <div>
                    <p className="font-medium">{node.name}</p>
                    <p className="text-sm text-gray-500">{node.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No devices to display
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.values(DeviceStatus).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              <span className="text-sm text-gray-600 capitalize">
                {status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
