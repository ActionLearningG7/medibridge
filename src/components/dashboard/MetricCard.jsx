/**
 * Metric Card Component
 * Displays a single metric with icon, value, label, and optional change indicator
 */

import { cn } from '../../utils/cn';

const MetricCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100',
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  footer,
  loading = false,
  onClick,
  className,
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-12 w-12 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
        {change && <div className="h-4 bg-gray-200 rounded w-16" />}
        {footer && <div className="h-4 bg-gray-200 rounded w-full mt-4" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div className={cn('p-3 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <span className={cn('text-sm font-medium', changeColors[changeType])}>
            {change}
          </span>
        )}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">{footer}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
