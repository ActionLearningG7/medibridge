import React, { useEffect, useMemo, useState } from "react";
import { Pill, Calendar, FileText, ArrowRight, Search } from "lucide-react";
import MedicationTable from "./MedicationTable";
import PrescriptionReviewModal from "./PrescriptionReviewModal";
import { useToast } from "../feedback/ToastProvider";

import {
    useCreatePrescriptionMutation,
    useUpdatePrescriptionMutation,
} from "../../app/api/prescriptionApi";


const PrescriptionBuilder = ({ initialData = null, onCancel, onSuccess }) => {
    const isEdit = Boolean(initialData?.id);

    const [step, setStep] = useState(isEdit ? "medications" : "appointment"); // appointment | medications
    const [searchTerm, setSearchTerm] = useState("");
    const [appointmentDetails, setAppointmentDetails] = useState(null);

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        patientId: initialData?.patientId || "",
        appointmentId: initialData?.appointmentId || "",
        diagnosisSummary: initialData?.diagnosisSummary || "",
        followUpDate: initialData?.followUpDate
            ? initialData.followUpDate.split("T")[0]
            : "",
        notesToPatient: initialData?.notesToPatient || "",
        notesToPharmacist: initialData?.notesToPharmacist || "",
        medications: initialData?.medications || [],
    });

    const [errors, setErrors] = useState({});
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const { showToast } = useToast();

    // Mutations - define BEFORE using in isLoading
    const [createPrescription, { isLoading: isCreating }] =
        useCreatePrescriptionMutation();
    const [updatePrescription, { isLoading: isUpdating }] =
        useUpdatePrescriptionMutation();

    const isLoading = isCreating || isUpdating;

    // TODO: Replace with actual API call when useGetDoctorConsultationsQuery is implemented
    // For now, using mock data - appointments will be fetched from backend
    const appointmentsData = {
        content: [
            // Mock appointments - replace with actual API data
            // Example:
            // {
            //     appointmentId: 'APT-001',
            //     patientName: 'John Doe',
            //     patientId: 'PAT-001',
            //     consultationTime: new Date().toISOString(),
            // }
        ]
    };
    const isLoadingAppointments = false;

    // Derived list of appointments
    const appointments = appointmentsData?.content || [];

    // Filtered list
    const filteredAppointments = useMemo(() => {
        if (!appointments.length) return [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return appointments;

        return appointments.filter((apt) => {
            const patientName = (apt.patientName || "").toLowerCase();
            const patientId = (apt.patientId || "").toLowerCase();
            const appointmentId = (apt.appointmentId || "").toLowerCase();
            return (
                patientName.includes(q) || patientId.includes(q) || appointmentId.includes(q)
            );
        });
    }, [appointments, searchTerm]);

    // If editing, try to prefill appointmentDetails from fetched list (optional)
    useEffect(() => {
        if (!isEdit) return;
        if (!appointments.length) return;
        if (!formData.appointmentId) return;

        const found = appointments.find((a) => a.appointmentId === formData.appointmentId);
        if (found) setAppointmentDetails(found);
    }, [appointments, formData.appointmentId, isEdit]);

    const clearFieldError = (field) => {
        if (!errors[field]) return;
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        clearFieldError(field);
    };

    const handleSelectAppointment = (appointment) => {
        setAppointmentDetails(appointment);
        setFormData((prev) => ({
            ...prev,
            appointmentId: appointment.appointmentId,
            patientId: appointment.patientId,
        }));
        setStep("medications");
        showToast.success(`Appointment for ${appointment.patientName} selected`);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.patientId) newErrors.patientId = "Patient is required";
        if (!formData.appointmentId) newErrors.appointmentId = "Appointment is required";

        if (!formData.medications || formData.medications.length === 0) {
            newErrors.medications = "At least one medication is required";
        } else {
            const hasInvalidMed = formData.medications.some(
                (m) =>
                    !m.medicineName ||
                    !m.dosage ||
                    !m.frequency ||
                    !m.durationDays ||
                    !m.quantity
            );
            if (hasInvalidMed) {
                newErrors.medications =
                    "Please fill in all required fields for medications";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = (issueImmediately) => ({
        ...formData,
        issueImmediately,
        // avoid sending medication id if backend expects new rows
        medications: (formData.medications || []).map(({ id, ...rest }) => rest),
    });

    const handleSaveDraft = async () => {
        if (!formData.patientId || !formData.appointmentId) {
            showToast.error("Patient and Appointment are required to save a draft.");
            return;
        }

        try {
            const payload = buildPayload(false);

            if (isEdit) {
                await updatePrescription({ id: initialData.id, ...payload }).unwrap();
                showToast.success("Draft updated successfully");
            } else {
                await createPrescription(payload).unwrap();
                showToast.success("Draft saved successfully");
            }

            onSuccess?.();
        } catch (error) {
            showToast.error(error?.data?.message || "Failed to save draft");
        }
    };

    const handleSubmitForIssue = async () => {
        if (!validate()) {
            showToast.error("Please fix the errors before proceeding");
            return;
        }

        try {
            const payload = buildPayload(true);

            if (isEdit) {
                await updatePrescription({ id: initialData.id, ...payload }).unwrap();
                showToast.success("Prescription issued successfully");
            } else {
                await createPrescription(payload).unwrap();
                showToast.success("Prescription created and issued successfully");
            }

            onSuccess?.();
        } catch (error) {
            showToast.error(error?.data?.message || "Failed to issue prescription");
        }
    };

    const handleReview = () => {
        if (validate()) {
            setIsReviewOpen(true);
        } else {
            showToast.error("Please fix the errors before proceeding");
        }
    };

    // ============================================================
    // STEP 1: SELECT APPOINTMENT (new prescription only)
    // ============================================================
    if (step === "appointment") {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Select Appointment
                    </h2>

                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by patient name, ID, or appointment ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {isLoadingAppointments ? (
                            <div className="text-center py-8 text-gray-500">Loading appointments…</div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>
                                    No appointments found.{" "}
                                    {searchTerm
                                        ? "Try a different search term."
                                        : "You have no upcoming appointments."}
                                </p>
                            </div>
                        ) : (
                            filteredAppointments.map((apt) => (
                                <div
                                    key={apt.appointmentId}
                                    onClick={() => handleSelectAppointment(apt)}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">{apt.patientName}</p>
                                            <p className="text-sm text-gray-600">Patient ID: {apt.patientId}</p>
                                            <p className="text-sm text-gray-600">
                                                Appointment: {apt.appointmentId}
                                            </p>
                                            {apt.consultationTime && (
                                                <p className="text-sm text-gray-600">
                                                    Date: {new Date(apt.consultationTime).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // STEP 2: MEDICATIONS + DETAILS
    // ============================================================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-900">Selected Appointment</p>
                        <p className="text-lg font-semibold text-blue-900 mt-1">
                            {appointmentDetails?.patientName || "Patient"} (ID: {formData.patientId})
                        </p>
                        <p className="text-sm text-blue-900/80">
                            Appointment: {formData.appointmentId || "—"}
                        </p>
                    </div>

                    {!isEdit && (
                        <button
                            onClick={() => {
                                setStep("appointment");
                                setSearchTerm("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Change Appointment
                        </button>
                    )}
                </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Pill className="h-5 w-5 text-indigo-600" />
                        Medications
                    </h3>
                </div>

                {errors.medications && (
                    <p className="text-red-600 text-sm mb-4">{errors.medications}</p>
                )}

                <MedicationTable
                    medications={formData.medications}
                    onChange={(medications) => handleFieldChange("medications", medications)}
                    errors={errors}
                />
            </div>

            {/* Diagnosis & Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Diagnosis & Notes
                </h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis Summary
                    </label>
                    <textarea
                        value={formData.diagnosisSummary}
                        onChange={(e) => handleFieldChange("diagnosisSummary", e.target.value)}
                        placeholder="Brief diagnosis summary..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Follow-up Date
                        </label>
                        <input
                            type="date"
                            value={formData.followUpDate}
                            onChange={(e) => handleFieldChange("followUpDate", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes for Patient
                    </label>
                    <textarea
                        value={formData.notesToPatient}
                        onChange={(e) => handleFieldChange("notesToPatient", e.target.value)}
                        placeholder="Any special instructions for the patient..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes for Pharmacist
                    </label>
                    <textarea
                        value={formData.notesToPharmacist}
                        onChange={(e) => handleFieldChange("notesToPharmacist", e.target.value)}
                        placeholder="Any special instructions for the pharmacist..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                    Save Draft
                </button>

                <button
                    onClick={handleReview}
                    disabled={isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                    <ArrowRight className="h-4 w-4" />
                    Review & Issue
                </button>
            </div>

            {/* Review Modal */}
            {isReviewOpen && (
                <PrescriptionReviewModal
                    prescription={formData}
                    appointmentDetails={appointmentDetails}
                    onClose={() => setIsReviewOpen(false)}
                    onConfirm={handleSubmitForIssue}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default PrescriptionBuilder;
