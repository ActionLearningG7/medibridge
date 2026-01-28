/**
 * PageHeader Component
 * Reusable page header with title, subtitle, and action buttons
 */

import React from 'react';

export const PageHeader = React.forwardRef(
  (
    {
      title,
      subtitle,
      actions,
      breadcrumbs,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 ${className}`}
        {...props}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 mb-4 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {item.href ? (
                  <a href={item.href} className="text-primary-600 hover:text-primary-700">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-gray-600">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action.render ? (
                    action.render()
                  ) : (
                    <button
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        action.variant === 'outline'
                          ? 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {action.icon && <action.icon className="h-4 w-4" />}
                      {action.label}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
