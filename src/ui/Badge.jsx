/**
 * Badge Component
 * Status badge with multiple variants and sizes
 */

import React from 'react';

const badgeVariants = {
  primary: 'bg-primary-100 text-primary-800 border border-primary-200',
  success: 'bg-green-100 text-green-800 border border-green-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  gray: 'bg-gray-100 text-gray-800 border border-gray-200',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge = React.forwardRef(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-medium rounded-full ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
