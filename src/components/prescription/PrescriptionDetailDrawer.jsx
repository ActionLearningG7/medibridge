/**
 * Prescription Detail Drawer Component
 * Shows full prescription details including medications
 */

import { X, Calendar, User, FileText, Pill, AlertCircle, Download } from 'lucide-react';
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

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            ISSUED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
            EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const handleDownload = () => {
        // In a real app, this would fetch a PDF blob
        // For now, we'll trigger a print action
        window.print();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={cn(
                    'fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            #{prescription.prescriptionNumber || prescription.id?.substring(0, 8)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Print / Save as PDF"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {/* Status Badge */}
                    <div className="mb-6">
                        <span
                            className={cn(
                                'inline-flex px-3 py-1 text-sm font-medium rounded-full border',
                                getStatusColor(prescription.status)
                            )}
                        >
                            {prescription.status}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Meta Info */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>Doctor ID:</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {prescription.doctorId}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Issued Date:</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(prescription.issuedAt)}
                                </span>
                            </div>
                            {prescription.followUpDate && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Follow-up:</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatDate(prescription.followUpDate)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Diagnosis */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary-500" />
                                Diagnosis
                            </h3>
                            <p className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-3">
                                {prescription.diagnosisSummary || 'No diagnosis recorded.'}
                            </p>
                        </div>

                        {/* Notes */}
                        {(prescription.notesToPatient || prescription.notesToPharmacist) && (
                            <div className="space-y-3">
                                {prescription.notesToPatient && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions for Patient</h3>
                                        <div className="flex items-start gap-3 bg-blue-50 text-blue-900 p-3 rounded-lg text-sm">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>{prescription.notesToPatient}</p>
                                        </div>
                                    </div>
                                )}
                                {prescription.notesToPharmacist && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Notes for Pharmacist</h3>
                                        <div className="flex items-start gap-3 bg-yellow-50 text-yellow-900 p-3 rounded-lg text-sm">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>{prescription.notesToPharmacist}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Medications List */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Pill className="h-4 w-4 text-primary-500" />
                                Medications ({prescription.medications?.length || 0})
                            </h3>

                            <div className="space-y-3">
                                {prescription.medications?.map((med, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-base font-medium text-gray-900">
                                                {med.medicineName}
                                            </h4>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                {med.route}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-3">
                                            <div>
                                                <span className="text-gray-400 text-xs block">Dosage</span>
                                                {med.dosage}
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Frequency</span>
                                                {med.frequency}
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Duration</span>
                                                {med.durationDays} days
                                            </div>
                                            <div>
                                                <span className="text-gray-400 text-xs block">Quantity</span>
                                                {med.quantity}
                                            </div>
                                        </div>

                                        {med.instructions && (
                                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                                <span className="font-medium">Instruction:</span> {med.instructions}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {(!prescription.medications || prescription.medications.length === 0) && (
                                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        No medications listed
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrescriptionDetailDrawer;
