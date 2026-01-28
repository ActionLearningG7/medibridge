/**
 * Modal Component
 * Dialog modal with backdrop and animations
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal = React.forwardRef(
  (
    {
      isOpen = false,
      onClose,
      title,
      children,
      footer,
      size = 'md',
      className = '',
      closeButton = true,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            ref={ref}
            className={`relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${sizeClasses[size]} ${className}`}
            role="dialog"
            aria-modal="true"
            {...props}
          >
            {/* Header */}
            {(title || closeButton) && (
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">{footer}</div>}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
