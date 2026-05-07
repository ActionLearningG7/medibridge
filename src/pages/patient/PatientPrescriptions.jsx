import React, { useState } from 'react';
import { Pill, Search, Calendar, FileText, ChevronRight, Download, Activity, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetMyPrescriptionsQuery } from '../../app/api/prescriptionApi';
import PrescriptionDetailDrawer from '../../components/prescription/PrescriptionDetailDrawer';
import { useToast } from '../../components/feedback/ToastProvider';

const PatientPrescriptions = () => {
    const [page, setPage] = useState(0);
    const { data, isLoading, error } = useGetMyPrescriptionsQuery({
        page,
        size: 10,
        sort: 'issuedAt,desc',
    }, {
        pollingInterval: 30000
    });
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    const handleDownloadReport = (e, prescriptionId) => {
        e.stopPropagation();
        showToast.info('Preparing your prescription record for download...');
        setTimeout(() => {
            console.log(`Downloading report for ${prescriptionId}`);
            showToast.success('Prescription downloaded successfully.');
        }, 1500);
    };

    const formatDate = (dateString, format = 'short') => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (format === 'full') {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ISSUED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-600 border-gray-200 ring-gray-500/10';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
        }
    };

    const filteredContent = data?.content?.filter(p =>
        p.diagnosisSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.doctorId?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ISSUED': return <ShieldCheck className="w-3.5 h-3.5" />;
            case 'PENDING': return <Clock className="w-3.5 h-3.5" />;
            case 'CANCELLED': return <AlertTriangle className="w-3.5 h-3.5" />;
            default: return <Activity className="w-3.5 h-3.5" />;
        }
    };

    if (error) {
        return (
            <div className="max-w-5xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-rose-50 border border-rose-100 rounded-[2rem] p-12 text-center"
                >
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-10 w-10 text-rose-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sync Error</h3>
                    <p className="text-gray-600 max-w-sm mx-auto mb-8">
                        We're having trouble retrieving your medical records. This might be a temporary connection issue.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                    >
                        Try Refreshing
                    </button>
                    {error?.data?.message && (
                        <p className="mt-6 text-xs text-rose-400 font-medium">Ref: {error.data.message}</p>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
            {/* Redesigned Premium Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-end justify-between pt-10">
                <div className="flex-1 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100"
                    >
                        <ShieldCheck size={14} />
                        Verified Clinical Records
                    </motion.div>

                    <div className="space-y-1">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none"
                        >
                            Your Health <br /> <span className="text-indigo-600">Timeline.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 font-medium max-w-sm"
                        >
                            Access your medical prescriptions, track medication plans, and stay on top of your clinical journey.
                        </motion.p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full lg:w-80 group"
                >
                    <div className="relative p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden">
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <FileText size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Records</p>
                                <p className="text-3xl font-black text-gray-900 leading-none">{data?.totalElements || 0}</p>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-gray-500">Active Plans</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                                    {data?.content?.filter(p => p.status === 'ISSUED').length || 0}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(data?.content?.filter(p => p.status === 'ISSUED').length / (data?.totalElements || 1)) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Glass Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -u-translate-y-1/2 u-translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </motion.div>
            </div>

            {/* Search Section */}
            <div className="sticky top-4 z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl border border-gray-100 p-4 rounded-[2rem] shadow-xl shadow-gray-200/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                        <input
                            type="text"
                            placeholder="Find by diagnosis, medications, or doctor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-transparent focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">
                            Last Updated: {data?.content?.[0] ? formatDate(data.content[0].issuedAt) : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop Header for List */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                <div className="col-span-1 text-center">Date</div>
                <div className="col-span-5 pl-4">Prescription Details</div>
                <div className="col-span-2 text-center">Medicines</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-50 shadow-sm" />
                        ))}
                    </motion.div>
                ) : !data?.content || data.content.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center shadow-xl shadow-gray-100"
                    >
                        <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <Pill className="h-12 w-12 text-blue-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Records are Empty</h3>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                            You haven't received any digital prescriptions yet. Once your doctor issues one, it will appear here instantly.
                        </p>
                    </motion.div>
                ) : filteredContent.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center shadow-xl shadow-gray-100"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <Search className="h-12 w-12 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">No Matches Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                            We couldn't find any prescriptions matching "{searchQuery}". Try a different term.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {filteredContent.map((prescription, idx) => (
                            <motion.div
                                key={prescription.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedPrescription(prescription)}
                                className="group relative bg-white border border-gray-100 rounded-[2rem] p-4 md:p-6 lg:grid lg:grid-cols-12 gap-4 items-center hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all cursor-pointer"
                            >
                                {/* Date Icon Card */}
                                <div className="lg:col-span-1 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl group-hover:bg-indigo-600 transition-all duration-300">
                                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-indigo-200 tracking-widest mb-1 leading-none">
                                        {new Date(prescription.issuedAt).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-xl font-black text-gray-700 group-hover:text-white leading-none">
                                        {new Date(prescription.issuedAt).getDate()}
                                    </span>
                                </div>

                                {/* Info Info */}
                                <div className="lg:col-span-5 mt-4 lg:mt-0 lg:pl-4 space-y-1">
                                    <h4 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                        {prescription.diagnosisSummary || 'Digital Prescription'}
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                            Dr. {prescription.doctorId || 'Healthcare Pro'}
                                        </span>
                                    </div>
                                </div>

                                {/* Medications Stat */}
                                <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center">
                                    <div className="flex -space-x-2 mb-2">
                                        {[...Array(Math.min(3, prescription.medications?.length || 0))].map((_, i) => (
                                            <div key={i} className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center">
                                                <Pill className="w-3 w-3 text-indigo-400" />
                                            </div>
                                        ))}
                                        {(prescription.medications?.length || 0) > 3 && (
                                            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                +{prescription.medications.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                        {prescription.medications?.length || 0} Medicines
                                    </span>
                                </div>

                                {/* Status Badge */}
                                <div className="lg:col-span-2 flex items-center justify-center mt-4 lg:mt-0">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-tight border ring-1 transition-all ${getStatusStyle(prescription.status)}`}>
                                        {getStatusIcon(prescription.status)}
                                        {prescription.status}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="lg:col-span-2 flex items-center justify-end gap-3 mt-6 lg:mt-0">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => handleDownloadReport(e, prescription.id)}
                                        className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-500 hover:shadow-md transition-all border border-gray-100"
                                        title="Secure Download"
                                    >
                                        <Download className="h-5 w-5" />
                                    </motion.button>
                                    <div className="p-2 bg-gray-50 text-gray-300 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Gradient Border on Hover */}
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-b-[2rem]" />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {!isLoading && data?.totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 mt-10"
                >
                    <p className="text-sm font-bold text-gray-400">
                        Viewing page <span className="text-indigo-600 font-black">{page + 1}</span> of <span className="text-gray-900">{data.totalPages}</span>
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-6 py-2.5 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-all border border-gray-200"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                            disabled={page >= data.totalPages - 1}
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-lg shadow-indigo-100"
                        >
                            Next
                        </button>
                    </div>                </motion.div>
            )}

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

