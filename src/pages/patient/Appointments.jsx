/**
 * Patient Appointments Page
 * Create appointments, view list, and see details
 */

import { useState, useMemo } from 'react';
import {
  useGetMyAppointmentsQuery,
  useCreateAppointmentMutation,
  useGetAppointmentByIdQuery,
} from '../../features/appointment/appointmentApi';
import { useGetVerifiedDoctorsQuery, useGetDoctorByIdQuery } from '../../features/user/doctorApi';
import { useToast } from '../../components/feedback/ToastProvider';
import { SkeletonStats, SkeletonList } from '../../components/feedback/Skeleton';
import AppointmentForm from '../../components/appointment/AppointmentForm';
import AppointmentList from '../../components/appointment/AppointmentList';
import AppointmentDetailModal from '../../components/appointment/AppointmentDetailModal';

const PatientAppointments = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const { showToast } = useToast();

  // Queries
  const { data: rawAppointments, isLoading, error, refetch } = useGetMyAppointmentsQuery();
  const { data: doctors, isLoading: isLoadingDoctors } = useGetVerifiedDoctorsQuery();

  // Debug logging
  console.log('📋 Raw appointments from API:', rawAppointments);

  // Transform appointments to include doctor details
  const appointments = useMemo(() => {
    if (!rawAppointments || !Array.isArray(rawAppointments)) {
      console.log('⚠️ No appointments or invalid format');
      return [];
    }

    console.log('🔄 Transforming appointments...');

    // Transform each appointment to match frontend expectations
    return rawAppointments.map(apt => {
      // Find doctor from the verified doctors list
      const doctor = doctors?.find(d => d.userId === apt.doctorId || d.id === apt.doctorId);

      console.log('📝 Appointment:', {
        id: apt.id,
        doctorId: apt.doctorId,
        foundDoctor: !!doctor,
        doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'
      });

      return {
        // Keep original fields
        ...apt,
        // Add frontend-expected fields (map backend fields to frontend)
        date: apt.appointmentDate, // Backend: appointmentDate -> Frontend: date
        reason: apt.reasonForVisit, // Backend: reasonForVisit -> Frontend: reason
        // Add doctor details
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Doctor',
        doctorSpecialization: doctor?.specialization || 'General',
        doctor: doctor || null,
      };
    });
  }, [rawAppointments, doctors]);

  console.log('📋 Transformed appointments:', appointments);

  // Selected appointment details
  const { data: rawSelectedAppointment, isLoading: isLoadingDetails } = useGetAppointmentByIdQuery(
    selectedAppointmentId,
    { skip: !selectedAppointmentId }
  );

  // Transform selected appointment to include doctor details
  const selectedAppointment = useMemo(() => {
    if (!rawSelectedAppointment) return null;

    // Find doctor from the verified doctors list
    const doctor = doctors?.find(d =>
      d.userId === rawSelectedAppointment.doctorId ||
      d.id === rawSelectedAppointment.doctorId
    );

    console.log('🔍 Selected appointment transformation:', {
      appointmentId: rawSelectedAppointment.id,
      doctorId: rawSelectedAppointment.doctorId,
      foundDoctor: !!doctor,
      doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'
    });

    return {
      ...rawSelectedAppointment,
      date: rawSelectedAppointment.appointmentDate,
      reason: rawSelectedAppointment.reasonForVisit,
      doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Doctor',
      doctorSpecialization: doctor?.specialization || 'General',
      doctor: doctor || null,
    };
  }, [rawSelectedAppointment, doctors]);

  // Mutations
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = async (formData) => {
    try {
      console.log('Creating appointment with form data:', formData);

      // Transform form data to match backend expectations
      const appointmentData = {
        doctorId: formData.doctorId, // UUID string
        date: formData.date.split('T')[0], // Convert "2026-01-25T14:30" to "2026-01-25"
        reason: formData.reason,
        appointmentType: 'VIRTUAL', // Default to VIRTUAL
      };

      console.log('Transformed appointment data:', appointmentData);

      // Call the createAppointment mutation
      const result = await createAppointment(appointmentData).unwrap();

      console.log('Appointment created successfully:', result);

      // Close form and refresh list
      setShowCreateForm(false);
      refetch();

      // Show success message
      showToast.success('Appointment booked successfully!');
    } catch (error) {
      console.error('Failed to create appointment:', error);

      // Show specific error messages
      if (error?.status === 401) {
        showToast.error('Authentication failed. Please login again.');
      } else if (error?.status === 400) {
        showToast.error(error?.data?.message || 'Invalid appointment data. Please check your inputs.');
      } else if (error?.status === 404) {
        showToast.error('Doctor not found. Please select another doctor.');
      } else if (error?.status === 409) {
        showToast.error('This time slot is not available. Please choose another time.');
      } else {
        showToast.error(error?.data?.message || error?.message || 'Failed to book appointment. Please try again.');
      }
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  const handleViewDetails = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleCloseDetails = () => {
    setSelectedAppointmentId(null);
  };


  // Calculate statistics based on backend status values
  const stats = {
    total: appointments?.length || 0,
    // Backend statuses: REQUESTED, QUEUED, IN_PROGRESS, CALLED, COMPLETED, CANCELLED, NO_SHOW
    upcoming: appointments?.filter(a =>
      a.status === 'REQUESTED' ||
      a.status === 'QUEUED' ||
      a.status === 'CALLED' ||
      a.status === 'SCHEDULED' ||
      a.status === 'CONFIRMED'
    )?.length || 0,
    completed: appointments?.filter(a => a.status === 'COMPLETED')?.length || 0,
    cancelled: appointments?.filter(a =>
      a.status === 'CANCELLED' ||
      a.status === 'NO_SHOW'
    )?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="mt-2 text-sm text-gray-600">
                Book appointments and manage your consultations
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Appointment
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Failed to load appointments</h3>
                <p className="text-sm text-red-700 mt-1">
                  {error?.status === 401
                    ? 'Please login again to view your appointments.'
                    : error?.data?.message || error?.message || 'Unable to fetch appointments. Please try again.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="ml-auto px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {isLoading ? (
          <SkeletonStats count={4} className="mb-8" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Appointments List */}
        {isLoading ? (
          <SkeletonList items={5} />
        ) : appointments && appointments.length > 0 ? (
          <AppointmentList
            appointments={appointments}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by booking your first appointment
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Book Appointment
              </button>
            </div>
          </div>
        )}

        {/* Create Appointment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Book New Appointment</h3>
                <button
                  onClick={handleCreateCancel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AppointmentForm
                doctors={doctors || []}
                isLoadingDoctors={isLoadingDoctors}
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
                isSubmitting={isCreating}
              />
            </div>
          </div>
        )}

        {/* Appointment Detail Modal */}
        {selectedAppointmentId && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            isLoading={isLoadingDetails}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
