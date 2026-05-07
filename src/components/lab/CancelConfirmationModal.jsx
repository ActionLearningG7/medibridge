import React from 'react';
import { AlertTriangle, ShieldX, ArrowLeft } from 'lucide-react';
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-primary-900/10 max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
        {/* Visual Impact Area */}
        <div className="bg-red-50 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full translate-x-16 -translate-y-16 opacity-50" />
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-200/50 relative z-10">
            <ShieldX className="h-10 w-10 text-red-600 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none relative z-10">Terminate Order</h2>
          <p className="text-red-600/60 font-black text-[10px] uppercase tracking-[0.2em] mt-3 relative z-10">Critical Authorization Required</p>
        </div>

        {/* Action Briefing */}
        <div className="p-10 space-y-6">
          <div className="p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-500 font-medium leading-relaxed">
              You are about to terminate diagnostic manifest <span className="text-gray-900 font-black">#{orderId}</span>. This protocol is irreversible and will immediately halt all pending collection tasks.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              variant="danger"
              onClick={() => onConfirm(orderId)}
              disabled={isLoading}
              className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                </div>
              ) : (
                'Confirm Termination'
              )}
            </Button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="h-12 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Keep Active Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
