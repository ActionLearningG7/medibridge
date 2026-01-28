/**
 * Admin Phlebotomists List Page
 * Display and manage phlebotomist accounts
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useGetPhlebotomistsQuery, useUpdatePhlebotomistStatusMutation } from '../../app/api/adminUserApi';
import { PageHeader, Card, Button, Input, Badge } from '../../ui';
import CreatePhlebotomistModal from '../../components/admin/CreatePhlebotomistModal';

export default function AdminPhlebotomists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Fetch phlebotomists
  const { data: response, isLoading, error, refetch } = useGetPhlebotomistsQuery({
    page,
    size: 20,
    search: search || undefined,
    status: status || undefined,
  });

  const phlebotomists = response?.content || [];
  const totalPages = response?.totalPages || 1;

  // Debug logging
  React.useEffect(() => {
    if (phlebotomists.length > 0) {
      console.log('🔍 Phlebotomist data sample:', phlebotomists[0]);
      console.log('   Keys:', Object.keys(phlebotomists[0]));
      console.log('   ID field:', phlebotomists[0].id || phlebotomists[0].userId || phlebotomists[0].phlebotomistId);
    }
  }, [phlebotomists]);

  // Update status mutation
  const [updateStatus] = useUpdatePhlebotomistStatusMutation();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      setMenuOpenId(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Phlebotomists"
        subtitle="Manage phlebotomist accounts and assignments"
        actions={[
          {
            label: 'Add Phlebotomist',
            onClick: () => setShowCreateModal(true),
            variant: 'primary',
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto" />
            <p className="text-gray-600 mt-4">Loading phlebotomists...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load phlebotomists</p>
            <p className="text-sm text-red-700 mt-1">{error?.data?.message || 'Please try again'}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </Card>
        )}

        {/* Table */}
        {!isLoading && phlebotomists.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {phlebotomists.map((phlebotomist) => {
                    // API returns userId as the primary identifier
                    const phlebId = phlebotomist.userId;

                    if (!phlebId) {
                      console.error('❌ Phlebotomist missing userId:', phlebotomist);
                    }

                    return (
                    <tr key={phlebId || phlebotomist.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {phlebotomist.firstName} {phlebotomist.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{phlebotomist.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {phlebotomist.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {phlebotomist.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {phlebotomist.licenseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            phlebotomist.status === 'ACTIVE'
                              ? 'success'
                              : phlebotomist.status === 'INACTIVE'
                              ? 'secondary'
                              : 'warning'
                          }
                        >
                          {phlebotomist.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setMenuOpenId(menuOpenId === phlebId ? null : phlebId)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                          </button>
                          {menuOpenId === phlebId && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  if (phlebId) {
                                    navigate(`/admin/phlebotomists/${phlebId}`);
                                  } else {
                                    console.error('Cannot navigate: No phlebotomist ID');
                                    alert('Error: Phlebotomist ID not found');
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  if (phlebId) {
                                    navigate(`/admin/phlebotomists/${phlebId}/edit`);
                                  } else {
                                    console.error('Cannot navigate: No phlebotomist ID');
                                    alert('Error: Phlebotomist ID not found');
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </button>
                              {phlebotomist.status === 'ACTIVE' && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(phlebId, 'INACTIVE')
                                  }
                                  className="block w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 border-b border-gray-100"
                                >
                                  Deactivate
                                </button>
                              )}
                              {phlebotomist.status === 'INACTIVE' && (
                                <button
                                  onClick={() => handleStatusChange(phlebId, 'ACTIVE')}
                                  className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  Activate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && phlebotomists.length === 0 && (
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No phlebotomists found</h3>
            <p className="text-gray-600 mb-6">
              {search || status
                ? 'Try adjusting your filters'
                : 'Start by adding your first phlebotomist'}
            </p>
            {!search && !status && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Phlebotomist
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePhlebotomistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
