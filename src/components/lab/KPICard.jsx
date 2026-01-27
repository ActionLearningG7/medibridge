/**
 * KPICard Component
 * Displays key performance indicator with icon and trend
 */

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  loading,
}) => {
  const colorClasses = {
    primary: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  };

  const iconColorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <div className={`rounded-lg border ${colorClasses[color]} p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-12 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold mt-2">{value}</p>
          )}
          {trend && trendValue !== undefined && (
            <div className="mt-3 flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}% from yesterday
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${iconColorClasses[color]} p-3 rounded-lg bg-white bg-opacity-50`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};
