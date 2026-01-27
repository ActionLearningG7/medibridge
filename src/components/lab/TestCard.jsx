/**
 * TestCard Component
 * Individual test card displaying test details
 */

import React from 'react';
import { Plus } from 'lucide-react';
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
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      {/* Header with code and badges */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {test.testCode || test.code}
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            {test.fastingRequired && (
              <Badge variant="warning" size="sm">
                Fasting
              </Badge>
            )}
            {test.homeCollectionSupported && (
              <Badge variant="success" size="sm">
                Home
              </Badge>
            )}
          </div>
        </div>

        {/* Test name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {test.name}
        </h3>

        {/* Sample type */}
        <p className="text-xs text-gray-600 mb-3">
          Sample: <span className="font-medium capitalize">{test.sampleType}</span>
        </p>
      </div>

      {/* Price and description */}
      <div className="px-4 py-3 bg-gray-50 flex-grow">
        {test.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {test.description}
          </p>
        )}

        {test.turnaroundTime && (
          <p className="text-xs text-gray-500">
            Results: {test.turnaroundTime}
          </p>
        )}
      </div>

      {/* Footer with price and button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-lg font-bold text-primary-600">
              ₹{test.price}
            </p>
          </div>
          <Button
            size="sm"
            variant={isInCart ? 'outline' : 'primary'}
            onClick={handleAdd}
            disabled={isLoading || isInCart}
            className={isInCart ? 'opacity-60' : ''}
          >
            {isInCart ? (
              <span className="text-xs">In Cart</span>
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
