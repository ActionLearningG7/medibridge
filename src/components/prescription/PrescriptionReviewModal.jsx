import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Check, Save } from 'lucide-react';
import { useCreatePrescriptionMutation, useUpdatePrescriptionMutation } from '../../app/api/prescriptionApi';
import { useToast } from '../feedback/ToastProvider';

const PrescriptionReviewModal = ({ isOpen, onClose, data, onSuccess }) => {
    const [createPrescription, { isLoading: isCreating }] = useCreatePrescriptionMutation();
    const [updatePrescription, { isLoading: isUpdating }] = useUpdatePrescriptionMutation();
    const { showToast } = useToast();
    const isLoading = isCreating || isUpdating;

    const handleConfirm = async (issueImmediately) => {
        try {
            // Clean up data before sending (remove temporary IDs)
            const payload = {
                ...data,
                issueImmediately,
                medications: data.medications.map(({ id, ...rest }) => rest),
            };

            if (data.id) {
                await updatePrescription({ id: data.id, ...payload }).unwrap();
            } else {
                await createPrescription(payload).unwrap();
            }

            showToast.success(issueImmediately ? 'Prescription issued successfully!' : 'Draft saved successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create prescription', error);
            showToast.error(error?.data?.message || 'Failed to process prescription');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Review Prescription
                                        </Dialog.Title>

                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600 grid grid-cols-2 gap-4">
                                                <div><span className="font-semibold">Patient ID:</span> {data.patientId}</div>
                                                <div><span className="font-semibold">Appointment ID:</span> {data.appointmentId}</div>
                                                <div className="col-span-2"><span className="font-semibold">Diagnosis:</span> {data.diagnosisSummary}</div>
                                                {data.followUpDate && (
                                                    <div className="col-span-2"><span className="font-semibold">Follow-up:</span> {formatDate(data.followUpDate)}</div>
                                                )}
                                            </div>

                                            {/* Meds Preview */}
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900 mb-2">Medications ({data.medications.length})</h4>
                                                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md text-sm">
                                                    {data.medications.map((med, i) => (
                                                        <li key={i} className="p-3">
                                                            <div className="font-medium text-gray-900">{med.medicineName}</div>
                                                            <div className="text-gray-500">
                                                                {med.dosage} • {med.frequency} • {med.route} • {med.durationDays} days • Qty: {med.quantity}
                                                            </div>
                                                            {med.instructions && <div className="text-xs text-gray-400 mt-1 italic">{med.instructions}</div>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Notes Preview */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {data.notesToPatient && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block mb-1">Notes to Patient</span>
                                                        <p className="bg-blue-50 text-blue-800 p-2 rounded">{data.notesToPatient}</p>
                                                    </div>
                                                )}
                                                {data.notesToPharmacist && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block mb-1">Notes to Pharmacist</span>
                                                        <p className="bg-yellow-50 text-yellow-800 p-2 rounded">{data.notesToPharmacist}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => handleConfirm(true)}
                                    disabled={isLoading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" /> Issue Prescription
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleConfirm(false)}
                                    disabled={isLoading}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4 mr-2" /> Save Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default PrescriptionReviewModal;
