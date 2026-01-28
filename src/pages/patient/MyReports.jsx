/**
 * My Reports - Patient
 * View and download lab test results
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge } from '../../ui';
import { FileText, Download, Eye, Search, Calendar, Loader, AlertCircle } from 'lucide-react';
import { useGetPatientReportsQuery, useDownloadPatientOrderReportQuery } from '../../features/lab/labApi';
import { useFileDownload } from '../../hooks/useFileDownload';

export default function MyReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const { downloadFile } = useFileDownload();

  // Fetch reports from API
  const { data: reportsData = [], isLoading, error } = useGetPatientReportsQuery();

  // Filter orders based on search
  const filteredReports = reportsData.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (result) => {
    try {
      setDownloadError(null);
      setDownloadingId(result.labOrderId || result.resultId);

      // Try new endpoint first (blob download)
      if (result.labOrderId) {
        // Get access token from localStorage or sessionStorage
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Trigger the download with proper headers
        const response = await fetch(`/api/v1/reports/${result.labOrderId}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf,image/*,*/*',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Download failed: ${response.status} - ${errorText}`);
        }

        // Check content type to detect errors
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server error');
        }

        // Get blob
        const blob = await response.blob();

        // Validate blob size
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        // Log for debugging
        console.log(`✓ Downloaded blob: size=${blob.size}, type=${blob.type}`);

        // Extract filename
        const contentDisposition = response.headers.get('content-disposition');
        let filename = result.fileName || 'lab-report.pdf';

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        // Trigger download
        downloadFile(blob, filename);
      } else if (result.fileUrl) {
        // Fallback to direct URL
        window.open(result.fileUrl, '_blank');
      } else {
        setDownloadError('File URL not available');
      }
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Failed to download file');

      // Fallback to direct URL if available
      if (result?.fileUrl) {
        console.log('Falling back to direct URL');
        window.open(result.fileUrl, '_blank');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (result) => {
    if (result.fileUrl) {
      window.open(result.fileUrl, '_blank');
    } else if (result.labOrderId) {
      // Try to open via download endpoint in new tab
      window.open(`/api/v1/reports/${result.labOrderId}/download`, '_blank');
    } else {
      alert('File URL not available');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Failed to load reports.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  // Calculate stats based on actual data
  const totalReports = reportsData.reduce((sum, order) => sum + (order.results?.length || 0), 0);
  const latestReportDate = reportsData.length > 0
    ? new Date(Math.max(...reportsData.flatMap(o => o.results).map(r => new Date(r.uploadedAt)))).toLocaleDateString()
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Reports"
        subtitle="View and download your lab test results"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReports}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders with Results</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latest Report</p>
                <p className="text-sm font-medium text-gray-900">
                  {latestReportDate}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.testName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Order: {order.orderNumber} • Ordered: {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <Badge variant="success">
                    {order.results?.length || 0} file(s)
                  </Badge>
                </div>
              </div>

              {/* Results List */}
              <div className="divide-y divide-gray-200">
                {order.results?.map((result) => (
                  <div key={result.resultId} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* File Icon */}
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>

                        {/* File Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                            {result.isLatest && (
                              <Badge variant="primary" className="text-xs">
                                Latest
                              </Badge>
                            )}
                            {!result.isLatest && (
                              <Badge variant="secondary" className="text-xs">
                                Version {result.version}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            <span>{formatFileSize(result.fileSize)}</span>
                            <span className="mx-2">•</span>
                            <span>Uploaded by {result.uploadedByName}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(result.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {downloadError && downloadingId === (result.labOrderId || result.resultId) && (
                          <div className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {downloadError}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {result.fileType === 'application/pdf' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(result)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(result)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDownload(result)}
                            disabled={downloadingId === (result.labOrderId || result.resultId)}
                          >
                            {downloadingId === (result.labOrderId || result.resultId) ? (
                              <>
                                <Loader className="h-4 w-4 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {reportsData.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">
              Your lab test results will appear here once they are uploaded.
            </p>
            <Button onClick={() => navigate('/patient/labs/orders')}>
              View My Orders
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
