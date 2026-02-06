import { Card } from './Card';
import { MetricStatus, metricStatusTextColors } from '../../utils/styles';

export function MetricCard({
  title,
  value,
  unit,
  status,
}: {
  title: string;
  value: string | number;
  unit: string;
  status?: MetricStatus;
}) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${status ? metricStatusTextColors[status] : 'text-gray-900'}`}>
        {value}
        <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </Card>
  );
}
