/**
 * LabOrders Page - Patient
 * List of patient's lab orders with filters and actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPatientOrdersQuery, useCancelPatientOrderMutation } from '../../features/lab/labApi';
import { PageHeader, Card, Input, Select, Button, Toast } from '../../ui';
import { OrderCard } from '../../components/lab/OrderCard';
import { CancelConfirmationModal } from '../../components/lab/CancelConfirmationModal';
import { LAB_ORDER_STATUS_OPTIONS } from '../../features/lab/constants';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...LAB_ORDER_STATUS_OPTIONS,
];

export default function LabOrders() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false, orderId: null });

  // Build query params
  const queryParams = {
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  // Fetch orders
  const { data: response = {}, isLoading, error, refetch } = useGetPatientOrdersQuery(queryParams);

  // Extract content array from paginated response
  const orders = response.content || [];

  // Cancel mutation
  const [cancelOrder, { isLoading: isCancelLoading }] = useCancelPatientOrderMutation();

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId).unwrap();
      showToast('success', 'Order cancelled successfully');
      setCancelModalState({ isOpen: false, orderId: null });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to cancel order');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Lab Orders"
        subtitle="View and manage your lab test bookings"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Status"
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              <Input
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Error state */}
        {error && (
          <Card className="mb-8 p-6 border-red-200 bg-red-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-red-900">Failed to load orders</p>
                <p className="text-sm text-red-700">{error?.data?.message || 'Please try again'}</p>
                {error?.status === 404 && (
                  <p className="text-xs text-red-600 mt-2">
                    ℹ️ The backend endpoint <code className="bg-red-100 px-2 py-1 rounded font-mono">GET /lab-orders/me</code> is not responding.
                    Please ensure your backend API gateway is running and has this endpoint implemented.
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-9 bg-gray-200 rounded flex-1" />
                    <div className="h-9 bg-gray-200 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && orders.length === 0 && (
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'You haven\'t booked any lab tests yet'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/patient/labs/catalog')}>
                Browse Lab Tests
              </Button>
            )}
          </Card>
        )}

        {/* Orders grid */}
        {!isLoading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={(orderId) => navigate(`/patient/labs/orders/${orderId}`)}
                onTrack={(orderId) => navigate(`/patient/labs/tracking/${orderId}`)}
                onCancel={(orderId) =>
                  setCancelModalState({ isOpen: true, orderId })
                }
              />
            ))}
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <CancelConfirmationModal
        isOpen={cancelModalState.isOpen}
        orderId={cancelModalState.orderId}
        isLoading={isCancelLoading}
        onConfirm={handleCancelOrder}
        onClose={() => setCancelModalState({ isOpen: false, orderId: null })}
      />

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
