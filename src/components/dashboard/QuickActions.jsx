/**
 * Quick Actions Component
 * Displays a grid of quick action buttons with icons
 */

import { cn } from '../../utils/cn';

const QuickActions = ({ actions = [], loading = false, className }) => {
  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-6 w-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border transition-all text-left',
                action.disabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm',
                action.variant === 'primary' && !action.disabled && 'bg-primary-50 border-primary-200',
                action.variant === 'danger' && !action.disabled && 'hover:border-red-300 hover:bg-red-50'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'h-5 w-5 mb-2',
                    action.disabled ? 'text-gray-400' : action.iconColor || 'text-primary-600'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  action.disabled ? 'text-gray-400' : 'text-gray-900'
                )}
              >
                {action.label}
              </span>
              {action.badge && (
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                  {action.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
