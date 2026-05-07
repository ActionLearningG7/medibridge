import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, RefreshCcw, ChevronRight, Inbox, AlertCircle } from 'lucide-react';
import { useGetPatientOrdersQuery, useCancelPatientOrderMutation } from '../../features/lab/labApi';
import { Card, Input, Select, Button, Toast } from '../../ui';
import { OrderCard } from '../../components/lab/OrderCard';
import { CancelConfirmationModal } from '../../components/lab/CancelConfirmationModal';
import { LAB_ORDER_STATUS_OPTIONS } from '../../features/lab/constants';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Manifests' },
  ...LAB_ORDER_STATUS_OPTIONS,
];

export default function LabOrders() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false, orderId: null });
  const [listPollInterval, setListPollInterval] = useState(0);

  // Build query params
  const queryParams = {
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  // Fetch orders
  const { data: response = {}, isLoading, error, refetch } = useGetPatientOrdersQuery(queryParams, {
    pollingInterval: listPollInterval
  });

  const orders = response.content || [];

  // Handle list polling
  React.useEffect(() => {
    const hasPending = orders?.some(o => o.status === 'PAYMENT_PENDING');
    if (hasPending) {
      setListPollInterval(3000);
      const timer = setTimeout(() => setListPollInterval(0), 45000);
      return () => clearTimeout(timer);
    } else {
      setListPollInterval(0);
    }
  }, [orders]);

  const [cancelOrder, { isLoading: isCancelLoading }] = useCancelPatientOrderMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prev => ({ ...prev, isOpen: false })), 5000);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId).unwrap();
      showToast('success', 'Safe cancellation confirmed');
      setCancelModalState({ isOpen: false, orderId: null });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Cancellation failed');
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                <Inbox className="w-3.5 h-3.5" />
                Laboratory Records
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Diagnostic Orders</h1>
              <p className="text-gray-500 font-medium mt-3">Manage and track your active clinical diagnostics</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="h-12 w-12 rounded-2xl border-2 border-gray-50 hover:bg-gray-50 p-0 flex items-center justify-center shrink-0"
              >
                <RefreshCcw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin text-primary-500' : ''}`} />
              </Button>
              <Button
                onClick={() => navigate('/patient/labs/catalog')}
                className="h-12 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-200"
              >
                Book New Test
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Side Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-500" />
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Filtering</h3>
                </div>
                {hasActiveFilters && (
                  <button onClick={handleResetFilters} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <Select
                  label="Manifest Status"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border-none rounded-2xl font-bold h-12"
                />

                <div className="space-y-4 pt-2 border-t border-gray-50">
                  <Input
                    type="date"
                    label="From Date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-gray-50 border-none rounded-2xl font-bold h-12"
                  />
                  <Input
                    type="date"
                    label="To Date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-gray-50 border-none rounded-2xl font-bold h-12"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-black text-blue-900 text-xs tracking-tight mb-1 uppercase">Automated Updates</h4>
                <p className="text-[10px] font-bold text-blue-800 leading-normal opacity-70">
                  Orders update in real-time. Sample collection status and final reports will appear here automatically.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Error state */}
            {error && (
              <div className="bg-red-50 rounded-[2.5rem] border-2 border-red-100 p-10 text-center mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">System Outage</h3>
                <p className="text-gray-500 font-medium mb-8">Unable to retrieve diagnostic manifests from the laboratory hub.</p>
                <Button
                  onClick={() => refetch()}
                  className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl font-black"
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Loading state placeholders */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 h-[280px] animate-pulse">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-6 w-32 bg-gray-100 rounded-full" />
                      <div className="h-10 w-24 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-8 w-full bg-gray-50 rounded-xl" />
                      <div className="h-6 w-2/3 bg-gray-50 rounded-xl" />
                      <div className="pt-4 flex gap-3">
                        <div className="h-12 flex-1 bg-gray-100 rounded-2xl" />
                        <div className="h-12 flex-1 bg-gray-100 rounded-2xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && orders.length === 0 && (
              <div className="bg-white rounded-[3rem] border-2 border-gray-50 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <Inbox className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Records Found</h3>
                <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                  {hasActiveFilters
                    ? 'Adjust your parameters or reset the filters to see more results.'
                    : 'Your laboratory history is currently empty. Begin your first diagnostic journey today.'}
                </p>
                {hasActiveFilters ? (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="h-14 px-10 rounded-2xl font-black border-2"
                  >
                    Reset Grid
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/patient/labs/catalog')}
                    className="h-14 px-10 rounded-2xl bg-primary-600 hover:bg-primary-700 font-black shadow-xl shadow-primary-100"
                  >
                    Enter Catalog
                  </Button>
                )}
              </div>
            )}

            {/* Orders list */}
            {!isLoading && orders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-6 duration-700">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(orderId) => navigate(`/patient/labs/orders/${orderId}`)}
                    onTrack={(orderId) => navigate(`/patient/labs/tracking/${orderId}`)}
                    onCancel={(orderId) => setCancelModalState({ isOpen: true, orderId })}
                  />
                ))}
              </div>
            )}

            {!isLoading && orders.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="bg-white px-6 py-2 rounded-full border-2 border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                  Displaying {orders.length} Diagnostic Record{orders.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </main>
        </div>
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
          title={toastState.type === 'success' ? 'Safe Sync' : 'Alert'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
