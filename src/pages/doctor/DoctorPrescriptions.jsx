import React, { useState } from 'react';
import { PageHeader } from '../../components/layout';
import { Pill, Plus, Search, Filter, Edit, Eye, FileText, Calendar } from 'lucide-react';
import TableSkeleton from '../../components/common/TableSkeleton';
import PrescriptionBuilder from '../../components/prescription/PrescriptionBuilder';
import { useGetDoctorPrescriptionsQuery } from '../../app/api/prescriptionApi';
import { useToast } from '../../components/feedback/ToastProvider';
import PrescriptionDetailDrawer from '../../components/prescription/PrescriptionDetailDrawer';

const DoctorPrescriptions = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'edit'
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [activeTab, setActiveTab] = useState('DRAFT'); // 'DRAFT' | 'ISSUED'
    const [page, setPage] = useState(0);

    // Fetch with status filter
    const { data, isLoading, refetch } = useGetDoctorPrescriptionsQuery({
        page,
        status: activeTab,
        sort: 'updatedAt,desc'
    });
    const { showToast } = useToast();

    const handleCreate = () => {
        setSelectedPrescription(null);
        setViewMode('create');
    };

    const handleEdit = (prescription) => {
        setSelectedPrescription(prescription);
        setViewMode('edit');
    };

    const handleDuplicate = (prescription) => {
        // Create a copy without ID and status, effectively a new draft based on old one
        const copy = {
            ...prescription,
            id: null,
            status: 'DRAFT',
            prescriptionNumber: null,
            issuedAt: null,
            createdAt: null,
            updatedAt: null,
            medications: prescription.medications.map(m => ({ ...m, id: null }))
        };
        setSelectedPrescription(copy);
        setViewMode('create'); // Use create mode with initial data
        showToast.info('Duplicating prescription...');
    };

    const handleView = (prescription) => {
        setSelectedPrescription(prescription);
    };

    const handleSuccess = () => {
        setViewMode('list');
        setSelectedPrescription(null);
        refetch();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(0); // Reset page when switching tabs
    };

    const getStatusColor = (status) => {
        const colors = {
            DRAFT: 'bg-gray-100 text-gray-800',
            ISSUED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-blue-100 text-blue-800';
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <div className="space-y-6">
                <PrescriptionBuilder
                    initialData={selectedPrescription}
                    onCancel={() => {
                        setViewMode('list');
                        setSelectedPrescription(null);
                    }}
                    onSuccess={handleSuccess}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Prescription Management"
                    subtitle="Manage drafts and issued prescriptions"
                    icon={Pill}
                />
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Prescription
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['DRAFT', 'ISSUED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`${activeTab === tab
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab === 'DRAFT' ? 'Drafts' : 'Issued History'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters (Visual - Patient Search) */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search by Patient ID..." className="pl-9 w-full rounded-md border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading && (
                    <div className="p-6">
                        <TableSkeleton rows={5} columns={5} />
                    </div>
                )}

                {!isLoading && (!data?.content || data.content.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab.toLowerCase()} prescriptions found</h3>
                        <p className="text-gray-500 max-w-sm mb-6">
                            {activeTab === 'DRAFT'
                                ? "You don't have any pending drafts."
                                : "No issued prescriptions match your filters."}
                        </p>
                        {activeTab === 'DRAFT' && (
                            <button
                                onClick={handleCreate}
                                className="text-primary-600 font-medium hover:text-primary-700 underline"
                            >
                                Create new draft
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && data?.content?.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {activeTab === 'ISSUED' ? 'Issued Date' : 'Last Updated'}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.content.map((prescription) => (
                                    <tr key={prescription.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {prescription.prescriptionNumber || 'Draft'}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(prescription.issuedAt || prescription.updatedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Patient: {prescription.patientId}</div>
                                            <div className="text-xs text-gray-500">Appt: {prescription.appointmentId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={prescription.diagnosisSummary}>
                                                {prescription.diagnosisSummary || '—'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {prescription.medications?.length || 0} medications
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                                                {prescription.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {prescription.status === 'DRAFT' ? (
                                                    <button
                                                        onClick={() => handleEdit(prescription)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                        title="Edit Draft"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDuplicate(prescription)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Duplicate / Re-issue"
                                                    >
                                                        <div className="flex items-center gap-1 text-xs border border-gray-200 px-2 py-1 rounded">
                                                            <span className="sr-only">Duplicate</span>
                                                            <Plus className="h-3 w-3" /> Duplicate
                                                        </div>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleView(prescription)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Drawer (Reuse existing component) */}
            <PrescriptionDetailDrawer
                prescription={selectedPrescription}
                isOpen={!!selectedPrescription && viewMode === 'list'}
                onClose={() => setSelectedPrescription(null)}
            />
        </div>
    );
};

export default DoctorPrescriptions;
