/**
 * Doctor Lab Order Details
 * Simple, clean view for clinical diagnostic records
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, User, FileText, Activity, Clock, Calendar } from 'lucide-react';
import { useGetDoctorOrderDetailQuery } from '../../features/lab/labApi';
import { Card, Button, Badge, Toast } from '../../ui';
import { StatusTimeline } from '../../components/lab/StatusTimeline';
import { LAB_ORDER_STATUS_LABELS } from '../../features/lab/constants';

export default function DoctorLabOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  const { data: order, isLoading, error, refetch } = useGetDoctorOrderDetailQuery(orderId, {
    skip: !orderId,
  });

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  const handleDownloadReport = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_GATEWAY_BASE_URL}/doctors/lab-orders/${orderId}/report/download`, '_blank');
    } catch (error) {
      showToast('error', 'Failed to initialize report download');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] p-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-64 bg-white border animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] p-10">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white border rounded-3xl p-8 shadow-sm">
            <p className="text-gray-900 font-bold text-lg mb-2">Record Not Found</p>
            <p className="text-gray-500 mb-6">The diagnostic record you are looking for is unavailable.</p>
            <Button variant="outline" onClick={() => navigate('/doctor/labs/orders')} className="w-full rounded-xl">
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isReportReady = order.status === 'report_ready' || order.reportPublishedAt;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/doctor/labs/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-10 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Diagnostic History
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Context */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    <FileText size={12} />
                    Diagnostic Order
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">#{order.id?.substring(0, 12)}</h1>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isReportReady ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                  {LAB_ORDER_STATUS_LABELS[order.status] || order.status}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div className="p-2.5 bg-white text-gray-400 rounded-xl shadow-sm">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Profile</p>
                    <p className="text-lg font-bold text-gray-900">{order.patient?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div className="p-2.5 bg-white text-indigo-500 rounded-xl shadow-sm">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Tracking</p>
                    <button
                      onClick={() => navigate(`/doctor/labs/tracking/${orderId}`)}
                      className="text-lg font-bold text-indigo-600 hover:underline"
                    >
                      View Live Map
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-gray-400" />
                Tests in Order
              </h3>
              <div className="space-y-3">
                {order.tests?.map((test) => (
                  <div key={test.id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:border-gray-100 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{test.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{test.code}</p>
                    </div>
                    <p className="text-lg font-black text-indigo-600">€{test.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Collection Timeline</h3>
              <StatusTimeline events={order.trackingEvents || []} />
            </div>
          </div>

          {/* Right Column: Actions & Details */}
          <div className="lg:col-span-4 space-y-8">
            {isReportReady ? (
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/20 transition-all duration-700" />
                <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                  <Download size={24} />
                  Report Ready
                </h3>
                <p className="text-indigo-100 text-sm mb-8 leading-relaxed italic">
                  The clinical diagnostic report has been finalized and is ready for your analysis.
                </p>
                <button
                  onClick={handleDownloadReport}
                  className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
                >
                  Download Analysis PDF
                </button>
              </div>
            ) : (
              <div className="bg-white border rounded-3xl p-8 shadow-sm border-indigo-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-indigo-400" />
                  Processing...
                </h3>
                <p className="text-gray-500 text-sm italic leading-relaxed">
                  The diagnostics are currently in progress. You will be notified once the final report is ready.
                </p>
              </div>
            )}

            <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Collection Point</h4>
                <div className="flex gap-4">
                  <div className="mt-1 text-gray-400"><MapPin size={18} /></div>
                  <div className="text-sm font-bold text-gray-700 leading-relaxed">
                    <p className="text-gray-900 font-black">{order.address?.line1}</p>
                    {order.address?.line2 && <p>{order.address?.line2}</p>}
                    <p>{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Requested Slot</h4>
                <div className="flex gap-4">
                  <div className="mt-1 text-gray-400"><Calendar size={18} /></div>
                  <div className="text-sm font-black text-gray-900">
                    {order.preferredSlotStart ? (
                      <>
                        <p>{new Date(order.preferredSlotStart).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        <p className="text-indigo-600 mt-1 uppercase text-[10px] tracking-widest">
                          {new Date(order.preferredSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {order.preferredSlotEnd && new Date(order.preferredSlotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    ) : 'Pending Slot'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
