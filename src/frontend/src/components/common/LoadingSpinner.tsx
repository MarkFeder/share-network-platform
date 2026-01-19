import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ size = 'md', className, fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full border-primary-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-64">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" />
    </div>
  );
}
