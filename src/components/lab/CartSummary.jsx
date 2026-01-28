/**
 * CartSummary Component
 * Sticky summary of cart contents
 */

import React from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { Button, Badge } from '../../ui';
import { useNavigate } from 'react-router-dom';

export const CartSummary = ({
  testCount,
  totalPrice,
  isEmpty,
  onCheckout,
}) => {
  const navigate = useNavigate();

  if (isEmpty) {
    return (
      <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white border-t border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-600">
          <ShoppingCart className="h-4 w-4 inline-block mr-2 opacity-50" />
          Your cart is empty
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white border-t border-gray-200 shadow-lg">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900">Cart Summary</span>
          </div>
          <Badge variant="primary">
            {testCount}
          </Badge>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Price info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated taxes</span>
            <span className="font-medium text-gray-900">Calculated at checkout</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-primary-600">
            ₹{totalPrice}
          </span>
        </div>

        {/* CTA Button */}
        <Button
          fullWidth
          onClick={() => navigate('/patient/labs/booking')}
          className="flex items-center justify-center gap-2"
        >
          Proceed to Booking
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* View cart link */}
        <button
          onClick={() => navigate('/patient/labs/cart')}
          className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View cart details
        </button>
      </div>
    </div>
  );
};
