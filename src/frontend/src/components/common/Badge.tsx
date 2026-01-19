import clsx from 'clsx';
import { DeviceStatus, AlertSeverity, DeviceType } from '../../types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge helper
export function StatusBadge({ status }: { status: DeviceStatus }) {
  const variants: Record<DeviceStatus, BadgeVariant> = {
    [DeviceStatus.ONLINE]: 'success',
    [DeviceStatus.OFFLINE]: 'error',
    [DeviceStatus.DEGRADED]: 'warning',
    [DeviceStatus.MAINTENANCE]: 'info',
    [DeviceStatus.UNKNOWN]: 'default',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}

// Severity badge helper
export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const variants: Record<AlertSeverity, BadgeVariant> = {
    [AlertSeverity.CRITICAL]: 'error',
    [AlertSeverity.HIGH]: 'error',
    [AlertSeverity.MEDIUM]: 'warning',
    [AlertSeverity.LOW]: 'info',
    [AlertSeverity.INFO]: 'default',
  };

  return <Badge variant={variants[severity]}>{severity}</Badge>;
}

// Device type badge helper
export function DeviceTypeBadge({ type }: { type: DeviceType }) {
  return <Badge variant="info">{type.replace('_', ' ')}</Badge>;
}
