/**
 * Modern Skeleton Loading Components
 * Matches the updated premium UI aesthetics
 */

// Base Skeleton with improved pulse color
export const Skeleton = ({ className = '', width, height }) => {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-lg ${className}`}
      style={style}
    />
  );
};

// Text Skeleton
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-3 sm:h-4"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

// Card Skeleton
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl border-2 border-gray-50 shadow-sm p-6 ${className}`}>
      <Skeleton className="h-6 w-2/3 mb-4 rounded-xl" />
      <SkeletonText lines={3} />
      <div className="mt-6 flex space-x-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
};

// Table Skeleton
export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-3xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1 rounded-md" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-5">
            <div className="flex space-x-6 items-center">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  {colIndex === 0 ? (
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-2xl" />
                      <Skeleton className="h-4 flex-1 rounded-md" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 rounded-md" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// List Skeleton (Now matches AppointmentList)
export const SkeletonList = ({ items = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-[2rem] border-2 border-gray-50 p-5 shadow-sm">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-3 w-32 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full max-w-lg rounded-md" />
            </div>
            <Skeleton className="hidden sm:block h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm = ({ fields = 4, className = '' }) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-32 mb-3 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
    </div>
  );
};

// Profile Skeleton
export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl p-8 border-2 border-gray-50 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-6 mb-10">
        <Skeleton className="h-24 w-24 rounded-3xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-5 w-48 rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-10 border-b border-gray-100 pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-32 rounded-t-xl" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <Skeleton className="h-6 w-40 mb-5 rounded-lg" />
            <div className="grid grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-5 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stats Skeleton (Matches Appointments page grid)
export const SkeletonStats = ({ count = 4, className = '' }) => {
  // Avoid dynamic grid classes that might be purged
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-6 ${gridCols[count] || gridCols[4]} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-3xl border-2 border-gray-50 p-6 shadow-sm">
          <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
          <Skeleton className="h-3 w-24 mb-2 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Page Skeleton
export const SkeletonPage = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 py-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <Skeleton className="h-4 w-32 mb-3 rounded-md" />
            <Skeleton className="h-12 w-80 rounded-2xl mb-2" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-14 w-48 rounded-2xl" />
        </div>

        {/* Stats */}
        <SkeletonStats count={4} className="mb-12" />

        {/* List */}
        <SkeletonList items={5} />
      </div>
    </div>
  );
};

export default Skeleton;
