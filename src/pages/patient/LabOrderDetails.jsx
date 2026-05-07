import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Phone, MapPin, User, Loader2, Calendar, CreditCard, ShieldCheck, Activity, ChevronRight, Info } from 'lucide-react';
import { useGetPatientOrderDetailQuery, useCancelPatientOrderMutation } from '../../features/lab/labApi';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Toast } from '../../ui';
import { StatusTimeline } from '../../components/lab/StatusTimeline';
import { CancelConfirmationModal } from '../../components/lab/CancelConfirmationModal';
import { LAB_ORDER_STATUS_LABELS } from '../../features/lab/constants';

export default function LabOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false });

  const [pollInterval, setPollInterval] = useState(0);

  // Fetch order details
  const { data: order, isLoading, error, refetch } = useGetPatientOrderDetailQuery(orderId, {
    skip: !orderId,
    pollingInterval: pollInterval,
  });

  useEffect(() => {
    if (order?.status === 'PAYMENT_PENDING') {
      setPollInterval(3000);
      const timeout = setTimeout(() => setPollInterval(0), 30000);
      return () => clearTimeout(timeout);
    } else {
      setPollInterval(0);
    }
  }, [order?.status]);

  const [cancelOrder, { isLoading: isCancelLoading }] = useCancelPatientOrderMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prev => ({ ...prev, isOpen: false })), 5000);
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId).unwrap();
      showToast('success', 'Safe cancellation confirmed');
      setCancelModalState({ isOpen: false });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Cancellation failed');
    }
  };

  const handleDownloadReport = async () => {
    try {
      window.open(`/api/lab-orders/${orderId}/report/download`, '_blank');
    } catch (error) {
      showToast('error', 'Report download failed');
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-12 rounded-[3rem] shadow-2xl border-none">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-8">
            <Info className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Access Denied</h2>
          <p className="text-gray-500 font-medium mb-10">The diagnostic manifest path you followed appears to be invalid.</p>
          <Button onClick={() => navigate('/patient/labs/orders')} className="w-full h-14 rounded-2xl bg-primary-600 font-black">
            Return to Orders
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white rounded-[3rem] animate-pulse" />
              <div className="h-96 bg-white rounded-[3rem] animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-white rounded-[3rem] animate-pulse" />
              <div className="h-48 bg-white rounded-[3rem] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-12 rounded-[3rem] shadow-2xl border-none">
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Connection Error</h2>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => refetch()} className="rounded-2xl font-black h-12 px-8">Retry</Button>
            <Button onClick={() => navigate('/patient/labs/orders')} className="rounded-2xl font-black h-12 px-8 bg-gray-900">Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusLabel = LAB_ORDER_STATUS_LABELS[order.status] || order.status;
  const isCancellable = ['pending', 'confirmed', 'PENDING', 'CONFIRMED', 'SCHEDULED'].includes(order.status);
  const isActive = ['pending', 'confirmed', 'sample_collection_scheduled', 'sample_collected', 'in_processing',
    'PENDING', 'CONFIRMED', 'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(order.status);
  const isReportReady = order.status === 'report_ready' || order.reportPublishedAt;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <button
                onClick={() => navigate('/patient/labs/orders')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-colors group"
              >
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                Back to Registry
              </button>
              <div>
                <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  Live Diagnostic Manifest
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Order #{order.id}</h1>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={isReportReady ? 'success' : 'warning'} className="rounded-xl px-6 py-3 font-black uppercase tracking-widest text-xs shadow-sm">
                  {statusLabel}
                </Badge>
                {order.status === 'PAYMENT_PENDING' && (
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 italic text-xs font-bold text-blue-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Synchronizing Payment Verification...
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {isActive && (
                <Button
                  onClick={() => navigate(`/patient/labs/tracking/${order.id}`)}
                  className="h-14 px-10 rounded-2xl bg-primary-600 hover:bg-primary-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 flex items-center gap-3"
                >
                  <Activity className="h-4 w-4" />
                  Live Tracking
                </Button>
              )}
              {isCancellable && (
                <Button
                  variant="outline"
                  onClick={() => setCancelModalState({ isOpen: true })}
                  className="h-14 px-8 rounded-2xl border-2 border-red-50 hover:bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest"
                >
                  Terminate Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Info Stream */}
          <div className="lg:col-span-2 space-y-10">

            {/* Manifest Items */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Diagnostic Portfolio</h3>
              </div>
              <Card className="rounded-[3rem] border-2 border-gray-50 overflow-hidden shadow-sm">
                <div className="p-10 space-y-4">
                  {order.tests?.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-6 bg-gray-50/50 rounded-3xl group hover:bg-primary-50 transition-all duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none block">{test.code}</span>
                        <p className="font-black text-gray-900 tracking-tight text-lg">{test.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-gray-900 leading-none">€</span>
                          <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{test.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 pt-8 border-t-2 border-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-gray-900 tracking-tight leading-none text-xl mb-1">Total Gross Amount</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Including processing fees</p>
                    </div>
                    <div className="flex items-baseline gap-1 bg-primary-900 text-white px-8 py-4 rounded-3xl shadow-xl shadow-primary-900/20">
                      <span className="text-xl font-bold opacity-80">€</span>
                      <span className="text-4xl font-black tracking-tighter">{(order.totalPrice || 0) + (order.tax || 0)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Analysis Status */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Diagnostic Lifecycle</h3>
              </div>
              <Card className="rounded-[3rem] border-2 border-gray-50 p-10 shadow-sm">
                <StatusTimeline events={order.trackingEvents || []} />
              </Card>
            </section>
          </div>

          {/* Contextual Sidebar */}
          <div className="space-y-10">

            {/* Report Access Card */}
            {isReportReady ? (
              <Card className="rounded-[3rem] overflow-hidden border-none bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
                <div className="p-10 space-y-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <Download className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight leading-none mb-3">Clinical Report Generated</h3>
                    <p className="text-xs font-bold text-emerald-100 leading-relaxed mb-8 opacity-80 uppercase tracking-widest">Verified by Chief Pathologist</p>
                    <Button onClick={handleDownloadReport} className="w-full h-16 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black flex items-center justify-center gap-3 border-none text-sm uppercase tracking-widest shadow-xl shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Extract Analysis
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="rounded-[3rem] border-2 border-gray-50 p-10 bg-primary-50/30">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">
                  <Info className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-4">Report In-Sync</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  Your clinical analysis is currently being processed by our laboratory automation engine. You will be notified via SMS/Email once the final report is securely generated.
                </p>
              </Card>
            )}

            {/* Visit Context */}
            <Card className="rounded-[3rem] border-2 border-gray-50 p-10 shadow-sm space-y-8">
              {/* Collection Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scheduled Visit</h4>
                </div>
                {order.preferredSlotStart ? (
                  <div>
                    <p className="font-black text-gray-900 text-lg tracking-tight mb-1">
                      {new Date(order.preferredSlotStart).toLocaleDateString('en-IE', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {new Date(order.preferredSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(order.preferredSlotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} window
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="font-black text-gray-400 text-lg tracking-tight italic opacity-50">TBD</p>
                )}
              </div>

              {/* Phlebotomist Context */}
              {order.phlebotomistAssignment ? (
                <div className="pt-8 border-t-2 border-gray-50 space-y-6">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Field Clinical Specialist</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center text-2xl font-black text-gray-300">
                      {order.phlebotomistAssignment.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none mb-1">{order.phlebotomistAssignment.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-3">{order.phlebotomistAssignment.experience}yrs Field Experience</p>
                      <a href={`tel:${order.phlebotomistAssignment.phone}`} className="inline-flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest hover:text-primary-700 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        Secure Call
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-8 border-t-2 border-gray-50 p-6 bg-gray-50/50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-tight text-center">Assigning clinical specialist...</p>
                </div>
              )}

              {/* Address Context */}
              <div className="pt-8 border-t-2 border-gray-50 space-y-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Collection Site</h4>
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-snug">{order.address?.line1}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">
                    {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CancelConfirmationModal
        isOpen={cancelModalState.isOpen}
        orderId={orderId}
        isLoading={isCancelLoading}
        onConfirm={handleCancel}
        onClose={() => setCancelModalState({ isOpen: false })}
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
