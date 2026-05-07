import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Filter, Search, Grid, List as ListIcon, RefreshCcw, Info } from 'lucide-react';
import { useGetLabTestsQuery } from '../../features/lab/labApi';
import {
  addTestToCart,
  setSearchFilter,
  setSampleTypeFilter,
  setFastingFilter,
  resetFilters,
} from '../../features/lab/labSlice';
import {
  selectSearchFilter,
  selectSampleTypeFilter,
  selectFastingFilter,
  selectCartItems,
  selectCartTotalPrice,
  selectIsCartEmpty,
  selectHasActiveFilters,
} from '../../features/lab/selectors';
import { Button, Card, Input } from '../../ui';
import { TestCard } from '../../components/lab/TestCard';
import { TestFilters } from '../../components/lab/TestFilters';
import { CartSummary } from '../../components/lab/CartSummary';
import { TestCardSkeleton } from '../../components/lab/TestCardSkeleton';

export default function LabCatalog() {
  const dispatch = useDispatch();
  const [homeCollectionFilter, setHomeCollectionFilter] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  // Get filters from Redux
  const search = useSelector(selectSearchFilter);
  const sampleType = useSelector(selectSampleTypeFilter);
  const fastingRequired = useSelector(selectFastingFilter);
  const hasActiveFilters = useSelector(selectHasActiveFilters);

  // Get cart state
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalPrice);
  const isCartEmpty = useSelector(selectIsCartEmpty);

  // Build API query params
  const queryParams = {
    search: search || undefined,
    sampleType: sampleType || undefined,
    fastingRequired: fastingRequired !== null ? fastingRequired : undefined,
    homeCollection: homeCollectionFilter || undefined,
    sortBy,
  };

  // Fetch tests from API
  const { data: tests = [], isLoading, error, refetch } = useGetLabTestsQuery(queryParams);

  // Check if test is in cart
  const isTestInCart = (testId) => cartItems.some((item) => item.testId === testId);

  // Handle add to cart
  const handleAddToCart = (test) => {
    dispatch(
      addTestToCart({
        testId: test.id,
        testCode: test.testCode || test.code,
        testName: test.name || test.testName,
        price: test.price,
        sampleType: test.sampleType,
      })
    );
  };

  // Handle filter changes
  const handleSearchChange = (value) => {
    dispatch(setSearchFilter(value));
  };

  const handleSampleTypeChange = (value) => {
    dispatch(setSampleTypeFilter(value));
  };

  const handleFastingChange = (value) => {
    dispatch(setFastingFilter(value));
  };

  const handleHomeCollectionChange = (checked) => {
    setHomeCollectionFilter(checked);
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setHomeCollectionFilter(false);
    setSortBy('popularity');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest">
                <ShoppingBag className="w-4 h-4" />
                Medical Marketplace
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Diagnostics Catalog</h1>
              <p className="text-gray-500 font-medium max-w-xl">
                Browse our comprehensive range of clinical diagnostics and health packages with premium home collection services.
              </p>
            </div>
            {!isCartEmpty && (
              <Button
                size="lg"
                onClick={() => window.location.href = '/patient/labs/booking'}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-100 animate-in fade-in slide-in-from-right-4 transition-all hover:scale-105 active:scale-95"
              >
                Checkout Now (€{cartTotal})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="sticky top-8">
              <div className="flex items-center gap-2 mb-6 px-1">
                <Filter className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900">Catalogue Filters</h3>
              </div>
              <TestFilters
                search={search}
                onSearchChange={handleSearchChange}
                sampleType={sampleType}
                onSampleTypeChange={handleSampleTypeChange}
                fastingRequired={fastingRequired}
                onFastingChange={handleFastingChange}
                homeCollection={homeCollectionFilter}
                onHomeCollectionChange={handleHomeCollectionChange}
                onReset={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Top Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[2rem] border-2 border-gray-50 shadow-sm">
              <p className="text-sm font-bold text-gray-500 ml-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin text-primary-500" />
                    Synchronizing Catalog...
                  </span>
                ) : (
                  <><span className="text-primary-600">{tests.length}</span> Diagnostic Packages Available</>
                )}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-bold text-gray-700 border-2 border-gray-50 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-primary-100 focus:ring-0 cursor-pointer w-full sm:w-auto hover:bg-gray-100 transition-colors"
                >
                  <option value="popularity">Popular Recommendations</option>
                  <option value="price-asc">Affordable First</option>
                  <option value="price-desc">Premium Packages</option>
                  <option value="rating">Top Rated Only</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-12 text-center animate-in fade-in slide-in-from-top-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm">
                  <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-red-900 mb-2">Service Temporarily Unavailable</h3>
                <p className="text-red-700 mb-8 font-medium">{error?.data?.message || 'We are having trouble connecting to the laboratory services.'}</p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-100 font-bold px-8 rounded-xl"
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && tests.length === 0 && (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Matching Diagnostics</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">
                  We couldn't find any tests matching your criteria. Try adjusting your clinical filters or searching for another term.
                </p>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50 font-bold px-8 rounded-xl"
                >
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TestCardSkeleton key={`skeleton-${i}`} />
                ))
              ) : (
                tests.map((test, index) => (
                  <TestCard
                    key={test.id || `test-${index}`}
                    test={test}
                    isInCart={isTestInCart(test.id)}
                    onAddToCart={handleAddToCart}
                    isLoading={isLoading}
                  />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <CartSummary
        testCount={cartItems.length}
        totalPrice={cartTotal}
        isEmpty={isCartEmpty}
        onCheckout={() => window.location.href = '/patient/labs/booking'}
      />
    </div>
  );
}
