import React from 'react';
import { Plus, Check, Clock, ShieldCheck, Home, AlertCircle } from 'lucide-react';
import { Badge, Button } from '../../ui';

export const TestCard = ({
  test,
  isInCart = false,
  onAddToCart,
  isLoading = false,
}) => {
  const handleAdd = (e) => {
    e.preventDefault();
    onAddToCart(test);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border-2 border-gray-50 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-100/20 transition-all duration-500 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95">
      {/* Top Section: Badges and Code */}
      <div className="p-6 pb-0 flex justify-between items-start">
        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">
          {test.testCode || test.code}
        </span>
        <div className="flex -space-x-1">
          {test.homeCollectionSupported && (
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl shadow-sm border border-emerald-100" title="Home Collection Available">
              <Home className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="p-6 pt-4 flex-grow space-y-4">
        <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
          {test.name || test.testName}
        </h3>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3 py-1 rounded-lg text-[10px] font-bold">
            {test.sampleType?.toUpperCase()} SAMPLE
          </Badge>
          {test.fastingRequired && (
            <Badge className="bg-amber-50 text-amber-700 border-none px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> FASTING REQ.
            </Badge>
          )}
        </div>

        {test.description && (
          <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
            {test.description}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">{test.turnaroundTime || '24-48h'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold">Verified</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-6 pt-0 border-t-2 border-gray-50 bg-gray-50/30">
        <div className="flex justify-between items-end mt-4">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Price</span>
            <div className="flex items-baseline gap-0.5 mt-[-4px]">
              <span className="text-xl font-bold text-gray-900">€</span>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{test.price}</span>
            </div>
          </div>

          <Button
            size="lg"
            variant={isInCart ? 'outline' : 'primary'}
            onClick={handleAdd}
            disabled={isLoading || isInCart}
            className={`rounded-2xl h-14 w-14 p-0 shadow-lg transition-all duration-300 ${isInCart
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 cursor-default shadow-none'
                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-200 active:scale-90'
              }`}
          >
            {isInCart ? (
              <Check className="h-6 w-6 stroke-[3]" />
            ) : (
              <Plus className="h-6 w-6 stroke-[3]" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
