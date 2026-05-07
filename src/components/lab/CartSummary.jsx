import React from 'react';
import { ShoppingBag, ArrowRight, X, Trash2 } from 'lucide-react';
import { Button } from '../../ui';
import { useNavigate } from 'react-router-dom';

export const CartSummary = ({
  testCount,
  totalPrice,
  isEmpty,
  onCheckout,
}) => {
  const navigate = useNavigate();

  if (isEmpty) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-[2.5rem] p-4 pr-6 flex items-center justify-between shadow-2xl shadow-primary-900/40 border border-white/10">
        {/* Left Side: Count and Preview */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20">
            <ShoppingBag className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-white font-black text-lg tracking-tight leading-none mb-1">
              {testCount} {testCount === 1 ? 'Diagnostic' : 'Diagnostics'}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-primary-400 text-[10px] font-black uppercase tracking-widest bg-primary-950/50 px-2 py-0.5 rounded-md">Selected</span>
              <p className="text-gray-400 text-xs font-bold truncate max-w-[120px] sm:max-w-[200px]">
                Ready for checkout
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Price and CTA */}
        <div className="flex items-center gap-6">
          <div className="text-right flex flex-col items-end">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Bill</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-primary-400 font-bold text-sm">€</span>
              <span className="text-2xl font-black text-white tracking-tighter leading-none">{totalPrice}</span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/patient/labs/booking')}
            className="group bg-white hover:bg-gray-100 text-gray-900 h-14 px-8 rounded-2xl font-black flex items-center gap-2 border-none transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Checkout
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </Button>
        </div>
      </div>
    </div>
  );
};
