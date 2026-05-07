import React from 'react';

export const TestCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden flex flex-col h-[420px] animate-pulse">
      {/* Top Section */}
      <div className="p-6 pb-0 flex justify-between items-start">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-10 w-10 bg-gray-100 rounded-xl" />
      </div>

      {/* Main Info */}
      <div className="p-6 pt-4 flex-grow space-y-4">
        <div className="h-8 w-full bg-gray-100 rounded-xl" />
        <div className="h-8 w-2/3 bg-gray-100 rounded-xl" />

        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-100 rounded-lg" />
          <div className="h-6 w-24 bg-gray-100 rounded-lg" />
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-gray-50 rounded-lg" />
          <div className="h-4 w-5/6 bg-gray-50 rounded-lg" />
        </div>

        <div className="flex gap-4 pt-4">
          <div className="h-4 w-16 bg-gray-100 rounded-lg" />
          <div className="h-4 w-16 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-6 pt-0 border-t-2 border-gray-50 bg-gray-50/30">
        <div className="flex justify-between items-end mt-4">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-gray-100 rounded-full" />
            <div className="h-10 w-24 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-14 w-14 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
