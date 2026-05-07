/**
 * Lab Test Order Builder Component
 * Used by doctor during video consultation to order lab tests for patient
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';
import { useGetLabTestsQuery } from '../../features/lab/labApi';

const LabTestOrderBuilder = ({
  appointmentId,
  patientId,
  patientName = 'Patient',
  onSuccess,
  onCancel,
}) => {
  const { showToast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [collectionAddress, setCollectionAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch lab test catalog
  const { data: catalogData, isLoading: isLoadingCatalog } = useGetLabTestsQuery();

  const labTests = useMemo(() => {
    if (!catalogData) return [];

    // Handle different response formats
    if (Array.isArray(catalogData)) {
      return catalogData;
    }
    if (catalogData.content && Array.isArray(catalogData.content)) {
      return catalogData.content;
    }
    if (catalogData.tests && Array.isArray(catalogData.tests)) {
      return catalogData.tests;
    }
    return [];
  }, [catalogData]);

  // Filter tests based on search
  const filteredTests = useMemo(() => {
    if (!searchTerm.trim()) return labTests;

    const q = searchTerm.toLowerCase();
    return labTests.filter(test =>
      (test.testName || test.name || '').toLowerCase().includes(q) ||
      (test.testCode || test.code || '').toLowerCase().includes(q) ||
      (test.description || '').toLowerCase().includes(q)
    );
  }, [labTests, searchTerm]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
  }, [selectedTests]);

  // Add test to selected
  const handleAddTest = (test) => {
    if (selectedTests.some(t => t.id === test.id)) {
      showToast.warning(`${test.testName || test.name} already selected`);
      return;
    }
    setSelectedTests([...selectedTests, test]);
  };

  // Remove test from selected
  const handleRemoveTest = (testId) => {
    setSelectedTests(selectedTests.filter(t => t.id !== testId));
  };

  // Update address field
  const handleAddressChange = (field, value) => {
    setCollectionAddress(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!selectedTests.length) {
      newErrors.tests = 'Please select at least one test';
    }

    if (!collectionAddress.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }

    if (!collectionAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!collectionAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!collectionAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit order
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await createLabOrder({
      //   appointmentId,
      //   patientId,
      //   tests: selectedTests.map(t => ({ testId: t.id, testCode: t.testCode || t.code })),
      //   collectionAddress,
      // }).unwrap();

      // Mock success for now
      console.log('📋 Lab order to be created:', {
        appointmentId,
        patientId,
        tests: selectedTests,
        collectionAddress,
      });

      setIsSuccess(true);
      showToast.success('Lab order created successfully');

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Failed to create lab order:', err);
      showToast.error(err?.data?.message || 'Failed to create lab order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lab Order Created!</h2>

          <p className="text-gray-600 mb-6">
            Lab test order for {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} has been created for {patientName}.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Tests:</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {selectedTests.map(test => (
                <li key={test.id}>
                  • {test.testName || test.name} ({test.testCode || test.code})
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            The patient will be notified to schedule collection
          </p>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Order Lab Tests</h2>
          <p className="text-sm text-gray-600 mt-1">
            For: <span className="font-semibold">{patientName}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Test Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Select Lab Tests</h3>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tests by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Loading */}
            {isLoadingCatalog && (
              <div className="text-center py-8">
                <div className="inline-block">
                  <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Available Tests */}
            {!isLoadingCatalog && (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {filteredTests.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No tests found</p>
                ) : (
                  filteredTests.map(test => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {test.testName || test.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {test.testCode || test.code} • ₹{test.price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddTest(test)}
                        disabled={selectedTests.some(t => t.id === test.id)}
                        className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Add test"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Tests */}
          {selectedTests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Selected Tests ({selectedTests.length})</h3>
                <span className="text-lg font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
              </div>

              <div className="space-y-2 bg-blue-50 rounded-lg p-4">
                {selectedTests.map(test => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {test.testName || test.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {test.testCode || test.code} • ₹{test.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTest(test.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove test"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.tests && (
                <p className="text-sm text-red-600 mt-2">{errors.tests}</p>
              )}
            </div>
          )}

          {/* Collection Address */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Collection Address
            </h3>

            <div className="space-y-3">
              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={collectionAddress.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.line1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.line1 && <p className="text-sm text-red-600 mt-1">{errors.line1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apt, suite, etc."
                  value={collectionAddress.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={collectionAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={collectionAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  placeholder="ZIP code"
                  value={collectionAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Collection Instructions</p>
              <p>Patient will receive notification with collection details and can schedule sample collection at their preferred time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedTests.length === 0}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LabTestOrderBuilder;
