import React from 'react';
import { X, Search as SearchIcon, Beaker, Apple, Home as HomeIcon } from 'lucide-react';
import { Input, Select, Button } from '../../ui';

const SAMPLE_TYPES = [
  { value: 'blood', label: 'Blood' },
  { value: 'urine', label: 'Urine' },
  { value: 'saliva', label: 'Saliva' },
  { value: 'swab', label: 'Swab' },
  { value: 'stool', label: 'Stool' },
  { value: 'csf', label: 'CSF' },
];

export const TestFilters = ({
  search,
  onSearchChange,
  sampleType,
  onSampleTypeChange,
  fastingRequired,
  onFastingChange,
  homeCollection,
  onHomeCollectionChange,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-[2rem] border-2 border-gray-50 p-6 space-y-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-black text-gray-900 tracking-tight">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3 stroke-[3]" />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Keyword Search</label>
        <div className="relative group">
          <Input
            placeholder="Search diagnostics..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 transition-all font-medium"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        </div>
      </div>

      {/* Sample Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Biological Sample</label>
        <div className="relative">
          <Select
            options={SAMPLE_TYPES}
            value={sampleType || ''}
            onChange={(e) => onSampleTypeChange(e.target.value || null)}
            placeholder="All Specimens"
            className="h-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 transition-all font-bold text-gray-700 appearance-none pl-11"
          />
          <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Fasting Required */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 ml-1">
          <Apple className="w-4 h-4 text-gray-400" />
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Dietary Options</label>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-2xl">
          {[
            { label: 'Any', value: null },
            { label: 'Fasting', value: true },
            { label: 'Non-Fast', value: false }
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onFastingChange(opt.value)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${fastingRequired === opt.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Home Collection */}
      <div className="pt-2">
        <label
          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${homeCollection
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100'
              : 'bg-white border-gray-50 hover:border-gray-100 text-gray-600'
            }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${homeCollection ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
            }`}>
            <HomeIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-tight">Home Service</span>
            <span className="text-[10px] opacity-70 font-bold whitespace-nowrap">Phlebotomist visits home</span>
          </div>
          <input
            type="checkbox"
            checked={homeCollection}
            onChange={(e) => onHomeCollectionChange(e.target.checked)}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
