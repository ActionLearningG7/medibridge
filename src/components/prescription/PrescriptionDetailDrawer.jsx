/**
 * Prescription Detail Drawer Component
 * Shows full prescription details including medications
 */

import {
    X, Calendar, User, FileText, Pill,
    AlertCircle, Download, Activity, Clock,
    ShieldCheck, Stethoscope, Hash, User2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const PrescriptionDetailDrawer = ({ prescription, isOpen, onClose }) => {
    if (!isOpen || !prescription) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
                return 'bg-gray-100 text-gray-600 border-gray-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Premium Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] transition-opacity"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modern Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-2xl z-[101] flex flex-col overflow-hidden"
                    >
                        {/* Header with Background Pattern */}
                        <div className="relative p-8 border-b border-gray-100 flex-shrink-0 bg-gray-50/50 overflow-hidden">
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                            Medical Record
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Prescription Review</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                                        {prescription.prescriptionNumber || "PRE-" + prescription.id?.substring(0, 8).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleDownload}
                                        className="p-3 rounded-2xl text-indigo-600 bg-white border border-gray-200 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
                                        title="Print / PDF"
                                    >
                                        <Download className="h-5 w-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="p-3 rounded-2xl text-gray-400 bg-white border border-gray-200 hover:text-gray-600 transition-all shadow-sm"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-1">
                                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                        <User2 className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Patient ID</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900">{prescription.patientId}</p>
                                </div>
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <Stethoscope className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Doctor ID</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900">{prescription.doctorId}</p>
                                </div>
                            </div>

                            {/* Status Indicator Bar */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                                        <span className={cn(
                                            'inline-flex mt-0.5 px-3 py-0.5 text-xs font-black rounded-full border ring-1 tracking-tight',
                                            getStatusStyle(prescription.status)
                                        )}>
                                            {prescription.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Issued Date</p>
                                    <p className="text-xs font-bold text-gray-700">{formatDate(prescription.issuedAt)}</p>
                                </div>
                            </div>

                            {/* Diagnosis Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Clinical Diagnosis</h3>
                                </div>
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-5 text-gray-600 text-sm leading-relaxed font-medium">
                                    {prescription.diagnosisSummary || 'Clinical findings not specified in detail.'}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Medications</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                                        {prescription.medications?.length || 0} Items
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {prescription.medications?.map((med, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                        <Pill className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-gray-900 tracking-tight">
                                                            {med.medicineName}
                                                        </h4>
                                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                                            Route: {med.route}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Dosage</span>
                                                    <p className="text-xs font-black text-gray-700">{med.dosage}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Freq</span>
                                                    <p className="text-xs font-black text-gray-700">{med.frequency}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Days</span>
                                                    <p className="text-xs font-black text-gray-700">{med.durationDays}d</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Qty</span>
                                                    <p className="text-xs font-black text-gray-700">{med.quantity}</p>
                                                </div>
                                            </div>

                                            {med.instructions && (
                                                <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50/30 rounded-2xl text-xs font-medium text-amber-700 border border-amber-100/50">
                                                    <Activity className="h-4 w-4 shrink-0" />
                                                    <p>{med.instructions}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {(prescription.notesToPatient || prescription.notesToPharmacist) && (
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Counseling Notes</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {prescription.notesToPatient && (
                                            <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100">
                                                <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-2">Instructions for Patient</p>
                                                <p className="text-sm font-medium text-blue-900 leading-relaxed">{prescription.notesToPatient}</p>
                                            </div>
                                        )}
                                        {prescription.notesToPharmacist && (
                                            <div className="bg-amber-50/50 p-5 rounded-[1.5rem] border border-amber-100">
                                                <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-2">Notes for Pharmacist</p>
                                                <p className="text-sm font-medium text-amber-900 leading-relaxed">{prescription.notesToPharmacist}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Follow-up Section */}
                            {prescription.followUpDate && (
                                <div className="bg-indigo-600 rounded-[2rem] p-6 text-white overflow-hidden relative shadow-lg shadow-indigo-100">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Follow-up Recommended</p>
                                                <p className="text-lg font-black tracking-tight">{formatDate(prescription.followUpDate)}</p>
                                            </div>
                                        </div>
                                        <ShieldCheck className="h-12 w-12 opacity-20" />
                                    </div>
                                    <div className="absolute top-0 right-0 -u-translate-y-1/2 u-translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PrescriptionDetailDrawer;

