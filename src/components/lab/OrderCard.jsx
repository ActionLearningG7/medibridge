/**
 * OrderCard Component
 * Individual order card for LabOrders list
 */

import React from 'react';
import { Eye, MapPin, Calendar, Pill } from 'lucide-react';
import { Badge, Button } from '../../ui';
import { LAB_ORDER_STATUS_LABELS, LAB_ORDER_STATUS_COLORS } from '../../features/lab/constants';

export const OrderCard = ({
  order,
  onViewDetails,
  onTrack,
  onCancel,
}) => {
  const statusColor = LAB_ORDER_STATUS_COLORS[order.status] || '#6B7280';
  const statusLabel = LAB_ORDER_STATUS_LABELS[order.status] || order.status;

  const isActive = ['pending', 'confirmed', 'sample_collection_scheduled', 'sample_collected', 'in_processing',
    'PENDING', 'CONFIRMED', 'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(order.status);
  const isCancellable = ['pending', 'confirmed', 'PENDING', 'CONFIRMED', 'SCHEDULED'].includes(order.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600">Order ID</p>
          <p className="text-lg font-semibold text-gray-900">#{order.id}</p>
        </div>
        <Badge
          variant={
            order.status === 'completed' || order.status === 'report_ready'
              ? 'success'
              : order.status === 'cancelled' || order.status === 'failed'
                ? 'danger'
                : 'warning'
          }
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Pill className="h-4 w-4" />
          <span>{order.testCount || 1} test{order.testCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        {order.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{order.address.city}</span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="border-t pt-3 mb-4">
        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
        <p className="text-2xl font-bold text-primary-600">₹{order.totalPrice}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(order.id)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>

        {isActive && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTrack(order.id)}
            className="flex-1"
          >
            Track
          </Button>
        )}

        {isCancellable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(order.id)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
