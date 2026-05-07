/**
 * Consultation Side Panel Component
 * Displays tabs for prescription, lab tests, and notes during doctor's video consultation
 */

import React, { useState, useEffect } from 'react';
import { X, Pill, Microscope, FileText } from 'lucide-react';
import PrescriptionBuilder from '../prescription/PrescriptionBuilder';
import LabTestOrderBuilder from '../lab/LabTestOrderBuilder';
import { useGetConsultationContextQuery } from '../../features/appointment/consultationApi';

const ConsultationSidePanel = ({
  isOpen,
  onClose,
  consultationId,
  initialAppointmentId,
  initialPatientId,
  remoteParticipantName,
}) => {
  const [activeTab, setActiveTab] = useState('prescription'); // prescription | lab | notes
  const displayContext = {
    appointmentId: initialAppointmentId,
    patientId: initialPatientId,
    patientName: remoteParticipantName,
    consultationStatus: 'ACTIVE',
  };

  if (!isOpen) {
    return null;
  }

  const tabs = [
    {
      id: 'prescription',
      label: 'Prescription',
      icon: Pill,
    },
    {
      id: 'lab',
      label: 'Lab Tests',
      icon: Microscope,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
    },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full">
      {/* Backdrop with sophisticated blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ease-in-out"
        onClick={onClose}
        style={{
          left: '-100vw',
          right: 'auto',
          width: '100vw',
        }}
      />

      {/* Panel - Enlarge to 600px for better visibility of data tables */}
      <div className="relative flex w-[600px] flex-col bg-white/95 backdrop-blur-xl shadow-2xl animate-slide-in-right max-h-screen border-l border-white/20">

        {/* Modern Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Consultation Workspace</h2>
              <div className="flex items-center gap-2 text-blue-100 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Session with {displayContext?.patientName || 'Patient'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
            title="Close workspace"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Premium Tab Navigation */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <div className="flex p-1 bg-gray-200/50 rounded-xl backdrop-blur-sm">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform ${isActive
                    ? 'bg-white text-blue-600 shadow-md scale-[1.02] ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area with refined scrolling and padding */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          <div className="h-full">
            {/* Prescription Tab */}
            {activeTab === 'prescription' && (
              <div className="p-8 animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Patient Prescription</h3>
                  <p className="text-sm text-gray-500">Draft medications and instructions for the current session.</p>
                </div>
                <PrescriptionBuilder
                  initialPatientId={displayContext?.patientId}
                  initialAppointmentId={displayContext?.appointmentId}
                  initialPatientName={displayContext?.patientName}
                  isLiveCall={true}
                  onCancel={onClose}
                  onSuccess={() => {
                    setTimeout(onClose, 2000);
                  }}
                />
              </div>
            )}

            {/* Lab Tests Tab */}
            {activeTab === 'lab' && (
              <div className="p-8 animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Lab Diagnostics</h3>
                  <p className="text-sm text-gray-500">Order laboratory tests and screenings for the patient.</p>
                </div>
                <LabTestOrderBuilder
                  appointmentId={displayContext?.appointmentId}
                  patientId={displayContext?.patientId}
                  patientName={displayContext?.patientName || 'Patient'}
                  onCancel={onClose}
                  onSuccess={() => {
                    setTimeout(onClose, 2000);
                  }}
                />
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="h-full animate-fade-in">
                <ConsultationNotesTab
                  appointmentId={displayContext?.appointmentId}
                  patientName={displayContext?.patientName || 'Patient'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Consultation Notes Tab Component
 * Allows doctor to add notes during consultation
 */
const ConsultationNotesTab = ({ appointmentId, patientName }) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save notes to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes.trim()) {
        try {
          const noteKey = `consultation_notes_${appointmentId}`;
          localStorage.setItem(noteKey, notes);
          setLastSaved(new Date());
          setIsSaving(false);
        } catch (err) {
          console.error('Failed to save notes:', err);
        }
      }
    }, 1000);

    setIsSaving(true);

    return () => clearTimeout(timer);
  }, [notes, appointmentId]);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const noteKey = `consultation_notes_${appointmentId}`;
      const savedNotes = localStorage.getItem(noteKey);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  }, [appointmentId]);

  return (
    <div className="h-full flex flex-col p-6">
      <h3 className="font-semibold text-gray-900 mb-2">Consultation Notes</h3>
      <p className="text-sm text-gray-600 mb-4">For: {patientName}</p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add consultation notes here... (auto-saved)"
        className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
      />

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {isSaving ? '💾 Saving...' : lastSaved ? `✓ Saved at ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
        </span>
        <span className="text-gray-400">{notes.length} characters</span>
      </div>
    </div>
  );
};

export default ConsultationSidePanel;
