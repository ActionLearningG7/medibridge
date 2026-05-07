import React from 'react';
import { Eye, MapPin, Calendar, Pill, ChevronRight, Activity, Clock, FileText } from 'lucide-react';
import { Badge, Button } from '../../ui';
import { LAB_ORDER_STATUS_LABELS } from '../../features/lab/constants';

export const OrderCard = ({
  order,
  onViewDetails,
  onTrack,
  onCancel,
}) => {
  const statusLabel = LAB_ORDER_STATUS_LABELS[order.status] || order.status;

  const isActive = ['pending', 'confirmed', 'sample_collection_scheduled', 'sample_collected', 'in_processing',
    'PENDING', 'CONFIRMED', 'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(order.status);

  const isCancellable = ['pending', 'confirmed', 'PENDING', 'CONFIRMED', 'SCHEDULED'].includes(order.status);

  const isCompleted = ['completed', 'report_ready'].includes(order.status.toLowerCase()) || order.reportPublishedAt;

  const getStatusColor = (status) => {
    if (isCompleted) return 'bg-green-50 text-green-700 border-green-100';
    if (['cancelled', 'failed'].includes(status?.toLowerCase())) return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-200/40 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
            <span className="text-[10px] font-mono text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded">#{order.id?.substring(0, 8)}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {order.testCount || 1} {order.testCount === 1 ? 'Diagnostic Test' : 'Diagnostic Tests'}
          </h3>
        </div>

        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
          {statusLabel}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
            <Calendar size={14} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Booked On</p>
            <p className="text-xs font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center px-4 py-2 bg-gray-50/50 rounded-xl">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Charge</p>
          <div className="text-xl font-bold text-gray-900">€{order.totalPrice}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-sm"
        >
          <FileText size={14} />
          Details
        </button>

        {isActive && (
          <button
            onClick={() => onTrack(order.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
          >
            <Activity size={14} />
            Track
          </button>
        )}

        {isCancellable && !isActive && onCancel && (
          <button
            onClick={() => onCancel(order.id)}
            className="px-4 py-2.5 text-red-500 border border-red-50 rounded-xl hover:bg-red-50 transition-all"
          >
            <Clock size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
