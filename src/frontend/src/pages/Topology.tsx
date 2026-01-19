import { useQuery } from '@tanstack/react-query';
import { deviceApi } from '../services/api';
import { DeviceStatus } from '../types';
import {
  PageLoader,
  PageHeader,
  Card,
  EmptyState,
} from '../components/common';
import { statusColors, getStatusColor } from '../utils';

export default function Topology() {
  const { data: topology, isLoading } = useQuery({
    queryKey: ['topology'],
    queryFn: deviceApi.getTopology,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Topology"
        description="Visual representation of your network"
      />

      <Card className="min-h-[500px]">
        {topology && topology.nodes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topology.nodes.map((node: { id: string; name: string; type: string; status: DeviceStatus }) => (
              <div
                key={node.id}
                className="p-4 border rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status, 'background')}`} />
                  <div>
                    <p className="font-medium">{node.name}</p>
                    <p className="text-sm text-gray-500">{node.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No devices"
            description="No devices to display in the topology"
          />
        )}
      </Card>

      {/* Legend */}
      <Card>
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.values(DeviceStatus).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors.background[status]}`} />
              <span className="text-sm text-gray-600 capitalize">
                {status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
