import { ExclamationTriangleIcon, InboxIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

type EmptyStateType = 'no-data' | 'no-results' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons = {
  'no-data': InboxIcon,
  'no-results': MagnifyingGlassIcon,
  'error': ExclamationTriangleIcon,
};

const iconColors = {
  'no-data': 'text-gray-400',
  'no-results': 'text-gray-400',
  'error': 'text-red-400',
};

export function EmptyState({
  type = 'no-data',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <div className={clsx('text-center py-12', className)}>
      <Icon className={clsx('mx-auto h-12 w-12', iconColors[type])} />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            className="btn-primary"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
