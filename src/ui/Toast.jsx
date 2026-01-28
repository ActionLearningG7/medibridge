/**
 * Toast Component
 * Toast notifications with auto-dismiss
 */

import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

const toastVariants = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: Check },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertCircle },
};

export const Toast = React.forwardRef(
  (
    {
      variant = 'info',
      title,
      message,
      duration = 5000,
      onClose,
      isOpen = true,
      className = '',
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
      if (!isVisible) {
        onClose?.();
      }
    }, [isVisible, onClose]);

    useEffect(() => {
      if (!isOpen) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }, [isOpen, duration]);

    if (!isVisible) return null;

    const variant_config = toastVariants[variant];
    const IconComponent = variant_config.icon;

    return (
      <div
        ref={ref}
        className={`fixed bottom-4 right-4 z-40 flex items-start gap-3 p-4 border rounded-lg max-w-md ${variant_config.bg} ${variant_config.border} animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}
      >
        <IconComponent className={`h-5 w-5 flex-shrink-0 mt-0.5 ${variant_config.text}`} />
        <div className="flex-1">
          {title && <p className={`font-medium ${variant_config.text}`}>{title}</p>}
          {message && <p className={`text-sm ${variant_config.text}`}>{message}</p>}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (options) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...options }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        {...toast}
        onClose={() => removeToast(toast.id)}
        isOpen={true}
      />
    ))}
  </div>
);
