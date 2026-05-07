/**
 * Modern Appointment Form Component
 * A multi-step, premium booking experience
 */

import { useState, useMemo } from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
  CheckCircle2,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  Star,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../../ui';

const STAGES = [
  { id: 'doctor', title: 'Choose Doctor', icon: Users },
  { id: 'slot', title: 'Schedule Slot', icon: CalendarIcon },
  { id: 'details', title: 'Visit Details', icon: MessageSquare },
  { id: 'confirm', title: 'Confirmation', icon: CheckCircle2 },
];

const AppointmentForm = ({ doctors = [], isLoadingDoctors, onSuccess, onCancel, isSubmitting }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Get unique specializations
  const specializations = useMemo(() => {
    const specs = new Set(doctors.map(d => d.specialization));
    return ['All', ...Array.from(specs)];
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpec = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  const selectedDoctor = useMemo(() => {
    return doctors.find(d => (d.id || d.userId) === formData.doctorId);
  }, [doctors, formData.doctorId]);

  const handleDoctorSelect = (doctorId) => {
    setFormData(prev => ({ ...prev, doctorId }));
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && (!formData.date || !formData.time)) {
      setFormErrors({ slot: 'Please select both date and time' });
      return;
    }
    if (currentStep === 2 && formData.reason.length < 5) {
      setFormErrors({ reason: 'Please provide a reason (min 5 chars)' });
      return;
    }
    setFormErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const combinedDateTime = `${formData.date}T${formData.time}`;
    onSuccess({
      ...formData,
      date: combinedDateTime
    });
  };

  // Generate next 14 days
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDate: d
      });
    }
    return dates;
  }, []);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  return (
    <div className="w-full">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                      ? 'bg-primary-600 border-primary-600 text-white scale-110 shadow-lg'
                      : isCompleted
                        ? 'bg-primary-50 border-primary-600 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium mt-2 ${isActive ? 'text-primary-700' : 'text-gray-500'}`}>
                  {stage.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-h-[450px]">
        {/* Step 1: Doctor Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search doctor by name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {isLoadingDoctors ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredDoctors.map(doctor => (
                  <div
                    key={doctor.id || doctor.userId}
                    onClick={() => handleDoctorSelect(doctor.id || doctor.userId)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md flex items-start gap-4 ${formData.doctorId === (doctor.id || doctor.userId)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-primary-200'
                      }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 flex-shrink-0">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">Dr. {doctor.firstName} {doctor.lastName}</h4>
                      <div className="flex items-center gap-1 text-xs text-primary-600 font-medium mb-1">
                        <Stethoscope className="w-3 h-3" />
                        {doctor.specialization}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {doctor.yearsOfExperience || 5}+ yrs
                        </span>
                        <span className="font-semibold text-gray-700">€{doctor.consultationFee || 50}</span>
                      </div>
                    </div>
                    {formData.doctorId === (doctor.id || doctor.userId) && (
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No doctors found matching your research.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Slot Selection */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-primary-700 font-medium">Selected Doctor</p>
                <p className="font-bold text-gray-900">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
                Select Appointment Date
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {availableDates.map(date => (
                  <button
                    key={date.date}
                    onClick={() => setFormData(p => ({ ...p, date: date.date }))}
                    className={`flex-shrink-0 w-20 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.date === date.date
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg'
                        : 'border-gray-100 bg-white hover:border-primary-200 text-gray-600'
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-80">
                      {date.label.split(',')[0]}
                    </span>
                    <span className="text-lg font-bold">
                      {date.label.split(',')[1].split(' ')[2]}
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {date.label.split(',')[1].split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={formData.date ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-20 pointer-events-none'}>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                Select Preferred Time
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setFormData(p => ({ ...p, time: time }))}
                    className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${formData.time === time
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg'
                        : 'border-gray-100 bg-white hover:border-primary-200 text-gray-600'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {formErrors.slot && <p className="text-xs text-red-500 mt-3 font-medium">{formErrors.slot}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Reason for Consultation</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                To provide the best care, please briefly describe your symptoms or the reason for your visit.
                (Min 5 characters)
              </p>
              <textarea
                className={`w-full h-32 p-4 rounded-xl border-2 transition-all focus:ring-4 focus:ring-primary-100 resize-none text-sm ${formErrors.reason ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                  }`}
                placeholder="e.g., I have been experiencing persistent headaches and dizziness for the past 2 days..."
                value={formData.reason}
                onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))}
              />
              {formErrors.reason && <p className="text-xs text-red-500 font-medium">{formErrors.reason}</p>}

              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <CheckCircle2 className="w-4 h-4" />
                This information will be kept strictly confidential
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Review Booking Details</h3>
              <p className="text-sm text-gray-500 mt-1">Please ensure all details are correct before confirming</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-primary-100 overflow-hidden shadow-sm">
              <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                <span className="font-bold">Appointment Summary</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-none">€{selectedDoctor?.consultationFee || 50}</Badge>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expert Physician</p>
                    <p className="font-bold text-gray-900">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
                    <p className="text-xs text-primary-600 font-medium">{selectedDoctor?.specialization}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Schedule Time</p>
                    <p className="font-bold text-gray-900">{new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-primary-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formData.time}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Reason for Visit</p>
                  <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                    "{formData.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] sm:text-xs">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>A secure payment will be required after confirmation to secure this slot.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevStep}
          className="flex items-center gap-2 h-11 px-6 rounded-xl font-bold"
        >
          {currentStep === 0 ? 'Discard' : <><ChevronLeft className="w-4 h-4" /> Back</>}
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNextStep}
            disabled={currentStep === 0 ? !formData.doctorId : currentStep === 1 ? (!formData.date || !formData.time) : !formData.reason}
            className="flex items-center gap-2 h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary-200"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-8 rounded-xl font-bold shadow-lg shadow-green-200 bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? 'Processing...' : 'Confirm & Pay'} <CheckCircle2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AppointmentForm;
