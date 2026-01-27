/**
 * TestFilters Component
 * Filter controls for lab tests
 */

import React from 'react';
import { X } from 'lucide-react';
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search tests..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="text-sm"
      />

      {/* Sample Type */}
      <Select
        label="Sample Type"
        options={SAMPLE_TYPES}
        value={sampleType || ''}
        onChange={(e) => onSampleTypeChange(e.target.value || null)}
        placeholder="All types"
        className="text-sm"
      />

      {/* Fasting Required */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">
          Fasting Required
        </label>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fasting"
              checked={fastingRequired === null}
              onChange={() => onFastingChange(null)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">All</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fasting"
              checked={fastingRequired === true}
              onChange={() => onFastingChange(true)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fasting"
              checked={fastingRequired === false}
              onChange={() => onFastingChange(false)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>

      {/* Home Collection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={homeCollection}
            onChange={(e) => onHomeCollectionChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Home collection available
          </span>
        </label>
      </div>
    </div>
  );
};
