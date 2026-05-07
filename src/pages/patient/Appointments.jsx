/**
 * Patient Appointments Page
 * Create appointments, view list, and see details
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyAppointmentsQuery,
  useCreateAppointmentMutation,
  useGetAppointmentByIdQuery,
} from '../../features/appointment/appointmentApi';
import { useGetVerifiedDoctorsQuery } from '../../features/user/doctorApi';
import { useToast } from '../../components/feedback/ToastProvider';
import { SkeletonStats, SkeletonList } from '../../components/feedback/Skeleton';
import AppointmentForm from '../../components/appointment/AppointmentForm';
import AppointmentList from '../../components/appointment/AppointmentList';
import AppointmentDetailModal from '../../components/appointment/AppointmentDetailModal';
import { Modal } from '../../ui';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Info } from 'lucide-react';

const PatientAppointments = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [listPollInterval, setListPollInterval] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Queries
  const { data: rawAppointments, isLoading, error, refetch } = useGetMyAppointmentsQuery(undefined, {
    pollingInterval: listPollInterval
  });
  const { data: doctors, isLoading: isLoadingDoctors } = useGetVerifiedDoctorsQuery();

  // Transform appointments to include doctor details
  const appointments = useMemo(() => {
    if (!rawAppointments || !Array.isArray(rawAppointments)) return [];

    return rawAppointments.map(apt => {
      const doctor = doctors?.find(d => d.userId === apt.doctorId || d.id === apt.doctorId);
      return {
        ...apt,
        date: apt.appointmentDate,
        reason: apt.reasonForVisit,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Expert Physician',
        doctorSpecialization: doctor?.specialization || 'Specialist',
        doctor: doctor || null,
      };
    });
  }, [rawAppointments, doctors]);

  // Handle list polling
  useEffect(() => {
    const hasPending = appointments?.some(a => a.status === 'PAYMENT_PENDING');
    if (hasPending) {
      setListPollInterval(3000);
      const timer = setTimeout(() => setListPollInterval(0), 45000);
      return () => clearTimeout(timer);
    } else {
      setListPollInterval(0);
    }
  }, [appointments]);

  // Selected appointment details
  const [detailPollInterval, setDetailPollInterval] = useState(0);

  const { data: rawSelectedAppointment, isLoading: isLoadingDetails } = useGetAppointmentByIdQuery(
    selectedAppointmentId,
    {
      skip: !selectedAppointmentId,
      pollingInterval: detailPollInterval
    }
  );

  useEffect(() => {
    if (rawSelectedAppointment?.status === 'PAYMENT_PENDING') {
      setDetailPollInterval(3000);
      const t = setTimeout(() => setDetailPollInterval(0), 30000);
      return () => clearTimeout(t);
    } else {
      setDetailPollInterval(0);
    }
  }, [rawSelectedAppointment?.status]);

  const selectedAppointment = useMemo(() => {
    if (!rawSelectedAppointment) return null;

    const doctor = doctors?.find(d =>
      d.userId === rawSelectedAppointment.doctorId ||
      d.id === rawSelectedAppointment.doctorId
    );

    return {
      ...rawSelectedAppointment,
      date: rawSelectedAppointment.appointmentDate,
      reason: rawSelectedAppointment.reasonForVisit,
      doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Expert Physician',
      doctorSpecialization: doctor?.specialization || 'Specialist',
      doctor: doctor || null,
    };
  }, [rawSelectedAppointment, doctors]);

  // Mutations
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();

  const handleCreateClick = () => setShowCreateForm(true);

  const handleCreateSuccess = async (formData) => {
    try {
      const appointmentData = {
        doctorId: formData.doctorId,
        date: formData.date.split('T')[0],
        reason: formData.reason,
        appointmentType: 'VIRTUAL',
      };

      const result = await createAppointment(appointmentData).unwrap();
      setShowCreateForm(false);
      refetch();

      if (result.paymentRequired && result.checkoutUrl) {
        showToast.info('Booking confirmed! Redirecting to secure payment...');
        window.location.href = result.checkoutUrl;
      } else if (result.invoiceId) {
        showToast.info('Booking confirmed! Preparing checkout...');
        setTimeout(() => {
          navigate(`/payments/checkout/${result.invoiceId}?returnTo=/patient/appointments`);
        }, 1200);
      } else {
        showToast.success('Appointment booked successfully!');
      }
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to book appointment. Please try again.');
    }
  };

  const handleCreateCancel = () => setShowCreateForm(false);
  const handleViewDetails = (id) => setSelectedAppointmentId(id);
  const handleCloseDetails = () => setSelectedAppointmentId(null);

  const stats = {
    total: appointments?.length || 0,
    upcoming: appointments?.filter(a => ['REQUESTED', 'QUEUED', 'CALLED', 'SCHEDULED', 'CONFIRMED'].includes(a.status))?.length || 0,
    completed: appointments?.filter(a => a.status === 'COMPLETED')?.length || 0,
    cancelled: appointments?.filter(a => ['CANCELLED', 'NO_SHOW'].includes(a.status))?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              Medical Concierge
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Appointments</h1>
            <p className="mt-2 text-gray-500 font-medium">Manage your consultations and professional medical bookings</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="group flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Book New Session
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-100 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 leading-tight">Syncing Issue</h3>
              <p className="text-sm text-red-700 font-medium">{error?.data?.message || 'Unable to fetch your records at this moment.'}</p>
            </div>
            <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-lg shadow-red-200">
              Retry Sync
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {[
            { label: 'Total Visits', value: stats.total, icon: Calendar, color: 'blue' },
            { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'amber' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'red' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center 
                  ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    stat.color === 'green' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <SkeletonList items={5} />
        ) : appointments.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <AppointmentList
              appointments={appointments}
              onViewDetails={handleViewDetails}
            />
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">
              Your health journey starts here. Book your first consultation with our top-rated specialists.
            </p>
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Start Booking
            </button>
          </div>
        )}

        {/* Creation Overlay */}
        <Modal
          isOpen={showCreateForm}
          onClose={handleCreateCancel}
          title="Medical Consultation Booking"
          size="2xl"
        >
          <div className="py-2">
            <AppointmentForm
              doctors={doctors || []}
              isLoadingDoctors={isLoadingDoctors}
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
              isSubmitting={isCreating}
            />
          </div>
        </Modal>

        {/* Details Overlay */}
        <Modal
          isOpen={!!selectedAppointmentId}
          onClose={handleCloseDetails}
          title="Appointment Intelligence"
          size="2xl"
        >
          <AppointmentDetailModal
            appointment={selectedAppointment}
            isLoading={isLoadingDetails}
            onClose={handleCloseDetails}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PatientAppointments;
