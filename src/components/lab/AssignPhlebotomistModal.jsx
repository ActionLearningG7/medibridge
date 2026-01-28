/**
 * Assign Phlebotomist Modal
 * Modal for assigning/reassigning lab tasks to phlebotomists
 */

import React, { useState, useMemo } from 'react';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { useGetAvailablePhlebotomistsQuery } from '../../app/api/adminUserApi';
import { Modal, Button, Input, Badge } from '../../ui';

export default function AssignPhlebotomistModal({
  isOpen,
  onClose,
  onAssign,
  isLoading,
  mode = 'assign',
}) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Fetch available phlebotomists
  const { data: response, isLoading: isFetching } = useGetAvailablePhlebotomistsQuery(
    {},
    {
      skip: !isOpen,
    }
  );

  const phlebotomists = response?.content || [];

  // Filter phlebotomists based on search
  const filtered = useMemo(
    () =>
      phlebotomists.filter((p) =>
        `${p.firstName} ${p.lastName} ${p.email} ${p.employeeId}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [phlebotomists, search]
  );

  const handleAssign = () => {
    if (selectedId) {
      onAssign(selectedId);
      setSelectedId(null);
      setSearch('');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'assign' ? 'Assign Phlebotomist' : 'Reassign Phlebotomist'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={isFetching}
              />
            </div>
          </div>

          {/* Loading State */}
          {isFetching && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto" />
              <p className="text-gray-600 mt-4">Loading phlebotomists...</p>
            </div>
          )}

          {/* Empty State */}
          {!isFetching && filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {search ? 'No phlebotomists match your search' : 'No available phlebotomists'}
              </p>
            </div>
          )}

          {/* Phlebotomists List */}
          {!isFetching && filtered.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((phlebotomist) => (
                <button
                  key={phlebotomist.userId}
                  onClick={() => setSelectedId(phlebotomist.userId)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedId === phlebotomist.userId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {phlebotomist.firstName} {phlebotomist.lastName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <p>{phlebotomist.email}</p>
                        <p className="text-xs mt-1">ID: {phlebotomist.employeeId}</p>
                      </div>
                      {phlebotomist.licenseNumber && (
                        <div className="text-xs text-gray-600 mt-2">
                          License: {phlebotomist.licenseNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={phlebotomist.status === 'ACTIVE' ? 'success' : 'secondary'}
                      >
                        {phlebotomist.status}
                      </Badge>
                      {selectedId === phlebotomist.userId && (
                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedId || isLoading}
            loading={isLoading}
          >
            {mode === 'assign' ? 'Assign' : 'Reassign'} Phlebotomist
          </Button>
        </div>
      </div>
    </Modal>
  );
}
