/**
 * Doctor Lab Orders Page
 * Clean and professional view for prescribed tests
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDoctorOrdersQuery } from '../../features/lab/labApi';
import { PageHeader, Card, Input, Select, Button, Toast } from '../../ui';
import { OrderCard } from '../../components/lab/OrderCard';
import { LAB_ORDER_STATUS_OPTIONS } from '../../features/lab/constants';
import { Filter, Search, RotateCcw, Plus } from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...LAB_ORDER_STATUS_OPTIONS,
];

export default function DoctorLabOrders() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  const queryParams = {
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data: response = {}, isLoading, error, refetch } = useGetDoctorOrdersQuery(queryParams);
  const orders = response.content || [];

  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Simplified Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Diagnostic Orders</h1>
            <p className="text-gray-500 mt-1">Monitor and track laboratory tests prescribed for your patients.</p>
          </div>
          <Button
            onClick={() => navigate('/doctor/labs/booking')}
            className="rounded-xl px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            New Order
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Current Status"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50/50"
            />
            <Input
              type="date"
              label="Start Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-50/50"
            />
            <Input
              type="date"
              label="End Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-50/50"
            />
          </div>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-xl px-4 text-gray-500 border-gray-200"
              >
                <RotateCcw size={16} />
              </Button>
            )}
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="rounded-xl px-6 border-indigo-100 text-indigo-600 hover:bg-indigo-50"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Error / Loading / Empty States */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-8 flex justify-between items-center">
            <p className="text-rose-800 font-medium">Failed to retrieve clinical orders.</p>
            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border rounded-3xl py-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              {hasActiveFilters ? "No records match your selected criteria." : "You haven't prescribed any tests yet."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleResetFilters} className="rounded-xl px-8">Reset Filters</Button>
            ) : (
              <Button onClick={() => navigate('/doctor/labs/booking')} className="rounded-xl px-8 bg-indigo-600">Prescribe Tests</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={(orderId) => navigate(`/doctor/labs/orders/${orderId}`)}
                onTrack={(orderId) => navigate(`/doctor/labs/tracking/${orderId}`)}
              />
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Cataloged {orders.length} Patient Record{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
