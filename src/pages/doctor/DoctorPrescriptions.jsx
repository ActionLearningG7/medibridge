import React, { useState } from 'react';
import { PageHeader } from '../../components/layout';
import {
    Pill, Plus, Search, Filter, Edit, Eye,
    FileText, Calendar, User, Clock, ChevronRight,
    ArrowRight, Copy, CheckCircle2, AlertCircle,
    MoreHorizontal, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [searchQuery, setSearchQuery] = useState('');

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
        setViewMode('create');
        showToast.info('Duplicating prescription into new draft...');
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
        setPage(0);
    };

    const filteredContent = data?.content?.filter(p =>
        p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosisSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prescriptionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ISSUED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'DRAFT':
                return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
        }
    };

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <PrescriptionBuilder
                    initialData={selectedPrescription}
                    onCancel={() => {
                        setViewMode('list');
                        setSelectedPrescription(null);
                    }}
                    onSuccess={handleSuccess}
                />
            </motion.div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl shadow-blue-200">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Prescription Central</h1>
                        </div>
                        <p className="text-blue-100 text-sm md:text-base font-medium opacity-90 max-w-md">
                            Manage patient medication plans with ease. Draft, review, and issue digital prescriptions.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        className="inline-flex items-center px-6 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg shadow-black/10 hover:bg-blue-50 transition-all gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Generate New Prescription
                    </motion.button>
                </div>

                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 -u-translate-y-1/2 u-translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 u-translate-y-1/2 -u-translate-x-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                {/* Modern Pill Tabs */}
                <div className="p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 flex gap-1">
                    {['DRAFT', 'ISSUED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all relative ${activeTab === tab
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {tab === 'DRAFT' ? 'Pending Drafts' : 'Issued Records'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabGlow"
                                    className="absolute inset-0 bg-indigo-500/5 rounded-xl border border-indigo-200/50"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Patient ID or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 gap-4"
                >
                    {isLoading ? (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <TableSkeleton rows={5} columns={5} />
                        </div>
                    ) : !data?.content || data.content.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="h-10 w-10 text-indigo-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Workspace Empty</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                {activeTab === 'DRAFT'
                                    ? "No active drafts at the moment. Your clinical drafts will be organized here."
                                    : "You haven't issued any prescriptions yet."}
                            </p>
                            {activeTab === 'DRAFT' && (
                                <button
                                    onClick={handleCreate}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Start Fresh Draft
                                </button>
                            )}
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any prescriptions matching "{searchQuery}".
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredContent.map((prescription, idx) => (
                                <motion.div
                                    key={prescription.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                        {/* Date Indicator */}
                                        <div className="flex flex-col items-center justify-center min-w-[80px] p-3 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-indigo-400 tracking-wider">
                                                {activeTab === 'ISSUED' ? 'Issued' : 'Updated'}
                                            </span>
                                            <span className="text-lg font-black text-gray-700 group-hover:text-indigo-700">
                                                {new Date(prescription.issuedAt || prescription.updatedAt).getDate()}
                                            </span>
                                            <span className="text-xs font-bold text-gray-500 group-hover:text-indigo-500">
                                                {new Date(prescription.issuedAt || prescription.updatedAt).toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {prescription.prescriptionNumber || 'Unnamed Draft'}
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-tight border ring-1 ${getStatusStyle(prescription.status)}`}>
                                                    {prescription.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patient ID</p>
                                                        <p className="text-sm font-bold text-gray-700">{prescription.patientId}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                                        <Pill className="h-5 w-5 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Medications</p>
                                                        <p className="text-sm font-bold text-gray-700">{prescription.medications?.length || 0} Prescribed</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                                        <CheckCircle2 className="h-5 w-5 text-amber-500" />
                                                    </div>
                                                    <div className="max-w-[150px]">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Diagnosis</p>
                                                        <p className="text-sm font-bold text-gray-700 truncate" title={prescription.diagnosisSummary}>
                                                            {prescription.diagnosisSummary || 'None specified'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Area */}
                                        <div className="flex lg:flex-col items-center justify-end gap-2 pr-2">
                                            {prescription.status === 'DRAFT' ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(prescription)}
                                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Edit Draft"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDuplicate(prescription)}
                                                    className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm border border-gray-100"
                                                    title="Duplicate as Draft"
                                                >
                                                    <Copy className="h-5 w-5" />
                                                </motion.button>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleView(prescription)}
                                                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-gray-900 hover:shadow-md transition-all border border-gray-100"
                                                title="View Report"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/10 rounded-3xl pointer-events-none transition-all" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Pagination Component - Modernized */}
            {!isLoading && data?.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Page <span className="text-indigo-600 font-bold">{page + 1}</span> of {data.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-all border border-gray-200"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= data.totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-40 transition-all border border-indigo-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* View Drawer */}
            <PrescriptionDetailDrawer
                prescription={selectedPrescription}
                isOpen={!!selectedPrescription && viewMode === 'list'}
                onClose={() => setSelectedPrescription(null)}
            />
        </div>
    );
};

export default DoctorPrescriptions;

