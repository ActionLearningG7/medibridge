import React, { useState } from 'react';
import { PageHeader } from '../../components/layout';
import { Pill, Search, Calendar, FileText, ChevronRight, Download } from 'lucide-react';
import { useGetMyPrescriptionsQuery } from '../../app/api/prescriptionApi';
import PrescriptionDetailDrawer from '../../components/prescription/PrescriptionDetailDrawer';
import { useToast } from '../../components/feedback/ToastProvider';

const PatientPrescriptions = () => {
    const [page, setPage] = useState(0);
    const { data, isLoading, error } = useGetMyPrescriptionsQuery({
        page,
        size: 10,
        sort: 'issuedAt,desc',
        // Assuming 'filters' would be defined elsewhere if needed,
        // otherwise, this line might cause a reference error.
        // For now, I'm commenting it out as it's not defined in the original code
        // and the instruction focuses on pollingInterval.
        // ...filters
    }, {
        pollingInterval: 30000 // Poll every 30 seconds for new prescriptions
    });
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const { showToast } = useToast();

    const handleDownloadReport = (e, prescriptionId) => {
        e.stopPropagation();
        // Placeholder for download functionality
        // This would fetch a pre-signed URL or blob
        showToast.info('Downloading prescription report...');
        setTimeout(() => {
            // Simulate completion or failure
            // Since we don't have a backend endpoint, we'll just log
            console.log(`Downloading report for ${prescriptionId}`);
        }, 1000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ISSUED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            EXPIRED: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-blue-100 text-blue-800'}`}>
                {status}
            </span>
        );
    };

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="My Prescriptions"
                    subtitle="View and manage your digital prescriptions"
                    icon={Pill}
                />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-800">
                    <h3 className="text-lg font-semibold mb-2">Error Loading Prescriptions</h3>
                    <p>Unable to fetch your prescriptions. Please try again later.</p>
                    <p className="text-sm mt-2 opacity-75">{error?.data?.message || 'Unknown error occurred'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Prescriptions"
                subtitle="View and manage your digital prescriptions"
                icon={Pill}
            />

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Filters / Search Bar (Visual only for now if API doesn't support complex search) */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search prescriptions..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm transition-shadow"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            <option>All Statuses</option>
                            <option>Issued</option>
                            <option>Pending</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-center p-4 border rounded-lg bg-gray-50">
                                <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && (!data?.content || data.content.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Pill className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
                        <p className="text-gray-500 max-w-sm mb-6">
                            You haven't received any prescriptions yet. Prescriptions issued by your doctor will appear here.
                        </p>
                    </div>
                )}

                {/* List */}
                {!isLoading && data?.content?.length > 0 && (
                    <div className="divide-y divide-gray-200">
                        {data.content.map((prescription) => (
                            <div
                                key={prescription.id}
                                onClick={() => setSelectedPrescription(prescription)}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {prescription.diagnosisSummary || 'General Prescription'}
                                            </h4>
                                            {getStatusBadge(prescription.status)}
                                        </div>
                                        <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(prescription.issuedAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Pill className="h-3 w-3" />
                                                {prescription.medications?.length || 0} Medications
                                            </span>
                                            <span>
                                                Dr. {prescription.doctorId || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={(e) => handleDownloadReport(e, prescription.id)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Download Report"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && data?.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                disabled={page >= data.totalPages - 1}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{data.totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(0)}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                        disabled={page >= data.totalPages - 1}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setPage(data.totalPages - 1)}
                                        disabled={page >= data.totalPages - 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Last
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <PrescriptionDetailDrawer
                prescription={selectedPrescription}
                isOpen={!!selectedPrescription}
                onClose={() => setSelectedPrescription(null)}
            />
        </div>
    );
};

export default PatientPrescriptions;
