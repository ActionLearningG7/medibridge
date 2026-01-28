import React, { useState } from 'react';
import { useDownloadPatientOrderReportQuery } from '../../features/lab/labApi';
import { useFileDownload } from '../../hooks/useFileDownload';
import { Download, AlertCircle, Loader } from 'lucide-react';

/**
 * Report Download Button Component
 * Handles downloading lab reports to local system
 *
 * Usage:
 * <ReportDownloadButton orderId={orderId} userType="patient" />
 */
export function ReportDownloadButton({ orderId, userType = 'patient' }) {
  const [clicked, setClicked] = useState(false);
  const { downloadFile } = useFileDownload();

  // Query is skipped until user clicks the button
  const { data, isLoading, error } = useDownloadPatientOrderReportQuery(
    orderId,
    { skip: !clicked } // Only query when clicked
  );

  const handleDownloadClick = async () => {
    setClicked(true);
  };

  // Process downloaded data
  React.useEffect(() => {
    if (data?.blob && data?.filename) {
      downloadFile(data.blob, data.filename);
      setClicked(false); // Reset for next download
    }
  }, [data, downloadFile]);

  // Error handling
  if (error) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg cursor-not-allowed"
        title={error.message || 'Download failed'}
      >
        <AlertCircle size={18} />
        <span>Download Failed</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownloadClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isLoading
          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      }`}
      title="Download report to your computer"
    >
      {isLoading ? (
        <>
          <Loader size={18} className="animate-spin" />
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <Download size={18} />
          <span>Download Report</span>
        </>
      )}
    </button>
  );
}

/**
 * Complete Report Display Component
 * Shows report details and download button
 */
export function ReportDisplay({ orderId, report, isPublished }) {
  if (!report) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Report not yet available</p>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">Report is being processed. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Lab Report</h3>
        <div className="text-sm text-gray-600">
          <p>
            <strong>Status:</strong>{' '}
            <span className="text-green-600 font-medium">Published</span>
          </p>
          <p>
            <strong>Published:</strong>{' '}
            {report.publishedAt ? new Date(report.publishedAt).toLocaleString() : 'N/A'}
          </p>
          {report.format && (
            <p>
              <strong>Format:</strong> {report.format.toUpperCase()}
            </p>
          )}
          {report.sizeBytes && (
            <p>
              <strong>Size:</strong> {(report.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <ReportDownloadButton orderId={orderId} userType="patient" />

        {/* Optional: View button for immediate preview */}
        <button
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          onClick={() => {
            // Would open a PDF viewer modal or new tab
            // For now, just trigger download and open
            window.open(`/api/v1/reports/${orderId}/download`, '_blank');
          }}
        >
          <span>View</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Example usage in LabOrderDetails page
 */
export function LabOrderDetailsExample() {
  const orderId = '550e8400-e29b-41d4-a716-446655440000';
  const report = {
    reportId: 'rep-1',
    labOrderId: orderId,
    status: 'PUBLISHED',
    format: 'pdf',
    sizeBytes: 524288,
    originalFilename: 'lab-report-CBC-2026-01-27.pdf',
    publishedAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Lab Order Details</h1>

      {/* Order info */}
      <div className="mb-8 p-4 border rounded-lg">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Status:</strong> Completed</p>
      </div>

      {/* Report section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <ReportDisplay
          orderId={orderId}
          report={report}
          isPublished={true}
        />
      </div>
    </div>
  );
}
