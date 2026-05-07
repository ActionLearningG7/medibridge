/**
 * Create Collection Task Modal
 * Specialized modal for assigning personnel to unassigned lab orders
 */

import React, { useState, useMemo } from 'react';
import { Modal, Button, Input } from '../../ui';
import { useGetAvailablePhlebotomistsQuery } from '../../app/api/adminUserApi';
import { Search, Loader2, UserPlus, Info, MapPin } from 'lucide-react';

export default function CreateCollectionTaskModal({
  isOpen,
  orderId,
  orderNumber,
  testCount,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [selectedPhlebotomistId, setSelectedPhlebotomistId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available phlebotomists - skip if modal is closed
  const { data: phlebotomistsResponse, isLoading: isLoadingPhlebotomists } = useGetAvailablePhlebotomistsQuery(
    {},
    { skip: !isOpen }
  );

  const phlebotomists = useMemo(() => phlebotomistsResponse?.content || [], [phlebotomistsResponse]);

  const filteredPhlebotomists = useMemo(() => {
    if (!searchQuery.trim()) return phlebotomists;
    const q = searchQuery.toLowerCase();
    return phlebotomists.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.toLowerCase().includes(q)
    );
  }, [searchQuery, phlebotomists]);

  const handleSubmit = () => {
    if (!selectedPhlebotomistId) return;
    onSubmit(orderId, selectedPhlebotomistId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPhlebotomistId('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Dispatch Lab Mission">
      <div className="space-y-8 py-4">

        {/* Context Briefing */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex items-start gap-4">
          <div className="mt-1 text-indigo-600"><Info size={24} strokeWidth={2.5} /></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target Order</span>
              <span className="text-[10px] font-black font-mono bg-white px-2 py-0.5 rounded border border-indigo-100 italic">#{orderNumber?.slice(-8)}</span>
            </div>
            <p className="text-indigo-900 font-black tracking-tight">{testCount} Clinical Diagnostics Identified</p>
            <div className="flex items-center gap-1.5 mt-2 text-indigo-400">
              <MapPin size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Deployment Area: Standard Zone</span>
            </div>
          </div>
        </div>

        {/* Personnel Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-slate-900 uppercase tracking-tight">Available Personnel</label>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{filteredPhlebotomists.length} Online</span>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search by name, ID or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-indigo-500 shadow-sm transition-all"
              disabled={isLoadingPhlebotomists}
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoadingPhlebotomists ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest italic">Synchronizing Fleet...</p>
              </div>
            ) : filteredPhlebotomists.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-sm font-bold text-slate-400 italic">No available units in the selected sector.</p>
              </div>
            ) : (
              filteredPhlebotomists.map((p) => (
                <div
                  key={p.userId}
                  onClick={() => setSelectedPhlebotomistId(p.userId)}
                  className={`p-4 cursor-pointer transition-all rounded-[1.5rem] border-2 flex items-center justify-between group ${selectedPhlebotomistId === p.userId
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200'
                    : 'bg-white border-slate-50 hover:border-indigo-100'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPhlebotomistId === p.userId ? 'bg-white/10' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                      <UserPlus size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-black tracking-tight ${selectedPhlebotomistId === p.userId ? 'text-white' : 'text-slate-900'}`}>
                        {p.firstName} {p.lastName}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPhlebotomistId === p.userId ? 'text-indigo-200' : 'text-slate-400'}`}>
                        ID: {p.userId?.slice(0, 8)} • {p.shiftType}
                      </p>
                    </div>
                  </div>
                  {selectedPhlebotomistId === p.userId && <CheckCircle size={18} className="text-white" />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex gap-4 pt-6 border-t border-slate-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 h-16 rounded-[1.5rem] font-black text-slate-600 tracking-tight"
          >
            Abort Discovery
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPhlebotomistId || isLoading}
            loading={isLoading}
            className="flex-1 h-16 rounded-[1.5rem] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-100 tracking-tight"
          >
            Dispatch Unit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const CheckCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
