/**
 * Create Collection Task Modal
 * Modal for assigning unassigned lab orders to phlebotomists
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input } from '../../ui';
import { useGetAvailablePhlebotomistsQuery } from '../../app/api/adminUserApi';
import { Search, Loader } from 'lucide-react';

export default function CreateCollectionTaskModal({
  isOpen,
  orderId,
  orderNumber,
  testCount,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [selectedPhlebotomistId, setSelectedPhlebotomistId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPhlebotomists, setFilteredPhlebotomists] = useState([]);

  // Fetch available phlebotomists - skip if modal is closed
  const { data: phlebotomistsResponse, isLoading: isLoadingPhlebotomists } = useGetAvailablePhlebotomistsQuery(
    {},
    {
      skip: !isOpen, // Only fetch when modal is open
    }
  );

  // Memoize phlebotomists array to prevent infinite loop
  const phlebotomists = useMemo(() => phlebotomistsResponse?.content || [], [phlebotomistsResponse]);

  // Filter phlebotomists based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPhlebotomists(phlebotomists);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = phlebotomists.filter((phlebotomist) => {
        const name = phlebotomist.firstName && phlebotomist.lastName
          ? `${phlebotomist.firstName} ${phlebotomist.lastName}`.toLowerCase()
          : '';
        const email = phlebotomist.email?.toLowerCase() || '';
        const phone = phlebotomist.phoneNumber?.toLowerCase() || '';

        return name.includes(query) || email.includes(query) || phone.includes(query);
      });
      setFilteredPhlebotomists(filtered);
    }
  }, [searchQuery, phlebotomists]);

  const handleSubmit = () => {
    if (!selectedPhlebotomistId.trim()) {
      alert('Please select a phlebotomist');
      return;
    }
    onSubmit(orderId, selectedPhlebotomistId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPhlebotomistId('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Collection Task">
      <div className="space-y-6">
        {/* Order Details Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Order Details</p>
          <div className="mt-2 space-y-1">
            <p className="font-semibold text-gray-900">{orderNumber}</p>
            <p className="text-xs text-gray-600">{testCount} test(s)</p>
          </div>
        </div>

        {/* Phlebotomist Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            Select Phlebotomist
          </label>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isLoadingPhlebotomists}
            />
          </div>

          {/* Phlebotomist List */}
          {isLoadingPhlebotomists ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Loading phlebotomists...</span>
            </div>
          ) : filteredPhlebotomists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">
                {searchQuery ? 'No phlebotomists match your search' : 'No active phlebotomists available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredPhlebotomists.map((phlebotomist) => (
                <div
                  key={phlebotomist.userId}
                  onClick={() => setSelectedPhlebotomistId(phlebotomist.userId)}
                  className={`p-3 cursor-pointer transition-colors ${selectedPhlebotomistId === phlebotomist.userId
                      ? 'bg-blue-100 border-l-4 border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                >
                  <p className="font-medium text-sm text-gray-900">
                    {phlebotomist.firstName} {phlebotomist.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{phlebotomist.email}</p>
                  {phlebotomist.phoneNumber && (
                    <p className="text-xs text-gray-500">{phlebotomist.phoneNumber}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected Indicator */}
          {selectedPhlebotomistId && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs font-medium text-green-900">
                ✓ Selected:{' '}
                {phlebotomists.find((p) => p.userId === selectedPhlebotomistId)?.firstName}{' '}
                {phlebotomists.find((p) => p.userId === selectedPhlebotomistId)?.lastName}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPhlebotomistId || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            Create & Assign Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
