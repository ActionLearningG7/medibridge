/**
 * Results Dashboard - Phlebotomist Admin
 * Upload and manage lab results
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageHeader, Card, Button, Badge } from '../../ui';
import { Upload, FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetEligibleOrdersQuery } from '../../app/api/phlebotomistResultsApi';
import ResultUploadModal from '../../components/phlebotomist/ResultUploadModal';

export default function ResultsDashboard() {
  const user = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, order: null });

  // TEMPORARY: Force admin access for testing until backend includes isAdmin
  // TODO: Remove this and uncomment the check below after backend is fixed
  const isAdmin = true; // Force true for testing

  console.log('🔍 ResultsDashboard - user:', user);
  console.log('🔍 ResultsDashboard - isAdmin:', isAdmin);

  // Fetch eligible orders from API
  const { data: ordersResponse, isLoading, error, refetch } = useGetEligibleOrdersQuery({
    page,
    size: 20,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const eligibleOrders = ordersResponse?.content || [];
  const totalPages = ordersResponse?.totalPages || 1;

  // Calculate stats
  const stats = {
    pendingUpload: eligibleOrders.filter(o => !o.hasResult).length,
    uploadedToday: 0, // TODO: Calculate from API
    totalOrders: eligibleOrders.length,
  };

  const handleUploadClick = (order) => {
    setUploadModal({ isOpen: true, order });
  };

  const handleUploadSuccess = () => {
    refetch(); // Refresh the orders list
  };

  const getStatusColor = (status) => {
    const colors = {
      COLLECTED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      AT_LAB: 'bg-indigo-100 text-indigo-800',
      TESTING: 'bg-yellow-100 text-yellow-800',
      RESULT_UPLOADED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // TEMPORARY: Disabled access check for testing
  // The backend needs to include isAdmin in the login response
  // TODO: Re-enable this check after backend fix
  /*
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Access Denied" subtitle="Phlebotomist Admin privileges required" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <div className="mb-4 text-red-600">
              <Upload className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Admin Access Required
            </h3>
            <p className="text-gray-600">
              This feature is only available to phlebotomists with admin privileges.
              Contact your administrator to request access.
            </p>
          </Card>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Results Dashboard"
        subtitle="Upload and manage lab test results"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Upload</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingUpload}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Upload className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uploaded Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uploadedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="COLLECTED">Collected</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="AT_LAB">At Lab</option>
              <option value="TESTING">Testing</option>
              <option value="RESULT_UPLOADED">Result Uploaded</option>
            </select>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load orders</p>
            <p className="text-sm text-red-700 mt-1">{error?.data?.message || 'Please try again'}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </Card>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Collection Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eligibleOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.patientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.testName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.collectionDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {order.hasResult ? (
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant="success" className="text-xs">
                              {order.resultCount} file(s)
                            </Badge>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handleUploadClick(order)}>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Result
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {eligibleOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No eligible orders found</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      <ResultUploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false, order: null })}
        order={uploadModal.order}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
