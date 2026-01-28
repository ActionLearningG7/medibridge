/**
 * TestCardSkeleton Component
 * Loading skeleton for test cards
 */

import React from 'react';

export const TestCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="flex gap-1">
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>

      {/* Description area */}
      <div className="px-4 py-3 bg-gray-50 space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 w-8 bg-gray-200 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
};
