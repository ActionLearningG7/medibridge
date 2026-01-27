/**
 * CancelConfirmationModal Component
 * Modal for order cancellation confirmation
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui';

export const CancelConfirmationModal = ({
  isOpen,
  orderId,
  isLoading,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Cancel Order?</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to cancel order <span className="font-semibold">#{orderId}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. You'll need to book a new order if you wish to proceed with lab tests.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Keep Order
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(orderId)}
            disabled={isLoading}
            loading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      </div>
    </div>
  );
};
