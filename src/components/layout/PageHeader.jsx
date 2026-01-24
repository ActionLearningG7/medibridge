/**
 * PageHeader Component
 * Standardized page header with title, subtitle, and action buttons
 */

import { cn } from '../../utils/cn';
import Breadcrumbs from './Breadcrumbs';

const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  children,
}) => {
  return (
    <div className={cn('mb-8', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 max-w-3xl">
              {subtitle}
            </p>
          )}

          {/* Custom children content */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Actions Section */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
