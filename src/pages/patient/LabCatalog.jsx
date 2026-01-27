/**
 * LabCatalog Page - Patient
 * Browse and add lab tests to cart
 * Real API integration with filters, loading, and empty states
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { PageHeader, Card } from '../../ui';
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
        testCode: test.testCode || test.code, // Backend returns testCode, mock uses code
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

  // Empty state
  if (!isLoading && tests.length === 0 && hasActiveFilters) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Lab Tests" subtitle="Browse and book lab tests from home" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
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
            <div className="lg:col-span-3">
              <Card className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <button
                  onClick={handleResetFilters}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Lab Tests" subtitle="Browse and book lab tests from home" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center py-12 border-red-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to load tests</h3>
            <p className="text-red-700 mb-4">{error?.data?.message || 'Please try again'}</p>
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Try again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 sm:pb-0">
      <PageHeader
        title="Lab Tests"
        subtitle="Browse and book lab tests from home"
        actions={[
          {
            label: 'View Cart',
            variant: 'outline',
            onClick: () => window.location.href = '/patient/labs/booking',
            disabled: isCartEmpty,
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
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

          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${tests.length} tests found`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TestCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test, index) => (
                  <TestCard
                    key={test.id || `test-${index}`}
                    test={test}
                    isInCart={isTestInCart(test.id)}
                    onAddToCart={handleAddToCart}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
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
