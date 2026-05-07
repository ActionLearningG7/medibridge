/**
 * DoctorLabBooking Page
 * Modern, premium multi-step booking form for doctors to prescribe lab tests.
 * Integrates directly with today's queue and appointments for contextual booking.
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Minus, Search, Users, Calendar,
  MapPin, Clock, ChevronRight, CheckCircle2,
  Trash2, AlertCircle, ShoppingBag, ArrowRight,
  ArrowLeft, FileText, Info, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateDoctorOrderMutation, useGetLabTestsQuery } from '../../features/lab/labApi';
import {
  useGetTodayQueueQuery,
  useGetQueueEntriesQuery,
  useGetDoctorAppointmentsQuery
} from '../../features/appointment/appointmentApi';
import {
  setBookingStep,
  nextBookingStep,
  prevBookingStep,
  setBookingAddress,
  setBookingTimeSlot,
  setBookingInstructions,
  setBookingNotes,
  setBookingErrors,
  clearBookingErrors,
  setBookingSubmitting,
  resetBookingDraft,
  clearCart,
  addTestToCart,
  removeTestFromCart,
} from '../../features/lab/labSlice';
import {
  selectBookingStep,
  selectCartItems,
  selectCartTotalPrice,
  selectBookingAddress,
  selectBookingTimeSlot,
  selectBookingInstructions,
  selectBookingNotes,
  selectBookingErrors,
  selectIsBookingSubmitting,
} from '../../features/lab/selectors';
import { Button, Input, Toast } from '../../ui';
import { AddressForm } from '../../components/lab/AddressForm';
import { PatientSearch } from '../../components/lab/PatientSearch';
import { cn } from '../../utils/cn';

const BOOKING_STEPS = [
  { id: 'patient', label: 'Patient', description: 'Context' },
  { id: 'tests', label: 'Tests', description: 'Lab catalog' },
  { id: 'address', label: 'Address', description: 'Location' },
  { id: 'slot', label: 'Schedule', description: 'Time slot' },
  { id: 'review', label: 'Review', description: 'Confirm' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', sub: '06:00 - 10:00 AM', value: 'morning', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', sub: '10:00 - 02:00 PM', value: 'afternoon', icon: '☀️' },
  { id: 'evening', label: 'Evening', sub: '02:00 - 06:00 PM', value: 'evening', icon: '🌙' },
];

export default function DoctorLabBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'search' or 'appointments'

  // Redux state
  const currentStep = useSelector(selectBookingStep);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalPrice);
  const address = useSelector(selectBookingAddress);
  const timeSlot = useSelector(selectBookingTimeSlot);
  const instructions = useSelector(selectBookingInstructions);
  const bookingNotes = useSelector(selectBookingNotes);
  const errors = useSelector(selectBookingErrors);
  const isSubmitting = useSelector(selectIsBookingSubmitting);

  // Queries
  const { data: todayQueue } = useGetTodayQueueQuery();
  const { data: queueEntries = [], isLoading: entriesLoading } = useGetQueueEntriesQuery(todayQueue?.id, {
    skip: !todayQueue?.id
  });
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetDoctorAppointmentsQuery({
    date: new Date().toISOString().split('T')[0]
  });

  // API mutation
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateDoctorOrderMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prev => ({ ...prev, isOpen: false })), 5000);
  };

  useEffect(() => {
    if (cartItems.length === 0 && currentStep > 1) {
      dispatch(setBookingStep(1));
    }
  }, [cartItems.length, currentStep, dispatch]);

  // Content rendering based on steps
  const renderStepHeader = () => {
    const step = BOOKING_STEPS[currentStep];
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs font-black">
            {currentStep + 1}
          </span>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600/60">
            Step {currentStep + 1}
          </span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          {step.label}
        </h1>
        <p className="text-gray-500 font-medium">{step.description}</p>
      </div>
    );
  };

  // Modern Patient Selection (Step 0)
  const Step0_SelectPatient = () => {
    const handleSelect = (patient) => {
      // Adapt queue entry or appointment to patient object
      const p = {
        id: patient.patientId || patient.id,
        fullName: patient.patientName || patient.fullName || 'Patient',
        email: patient.patientEmail || patient.email || 'N/A',
        phone: patient.patientPhone || patient.phone || 'N/A'
      };
      setSelectedPatient(p);
    };

    if (selectedPatient) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-indigo-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                <Users size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedPatient.fullName}</h3>
                <p className="text-gray-500 font-medium">Selected for Lab Prescription</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm flex items-center gap-2"
            >
              <Trash2 size={18} />
              Change
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Identity</p>
              <p className="text-gray-700 font-bold">{selectedPatient.email}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Contact Number</p>
              <p className="text-gray-700 font-bold">{selectedPatient.phone}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex p-1.5 bg-gray-100 rounded-3xl w-fit mb-4">
          {[
            { id: 'queue', label: 'Today\'s Queue', icon: Users },
            { id: 'appointments', label: 'All Appoints', icon: Calendar },
            { id: 'search', label: 'Global Search', icon: Search }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {entriesLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-[2rem]" />)
              ) : queueEntries.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <Users size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold">No patients currently in queue</p>
                </div>
              ) : (
                queueEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelect(entry)}
                    className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                        {entry.tokenNumber}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 tracking-tight">{entry.patientName}</h4>
                        <p className="text-xs text-gray-500 font-medium">Token No. {entry.tokenNumber}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-gray-300" size={20} />
                  </button>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {appointmentsLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-[2rem]" />)
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold">No appointments found for today</p>
                </div>
              ) : (
                appointments.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleSelect(app)}
                    className="w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 tracking-tight">{app.patientName}</h4>
                        <p className="text-xs text-blue-500 font-bold">{app.reasonForVisit || 'General Consultation'}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-gray-300" size={20} />
                  </button>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PatientSearch onPatientSelect={handleSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Modern Test Palette (Step 1)
  const Step1_Tests = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: tests = [], isLoading: testsLoading } = useGetLabTestsQuery({ limit: 100 });

    // Robust test identification
    const getTestId = (t) => t.id || t.testCode || t.code || t.testName;
    const testInCart = (test) => {
      const id = getTestId(test);
      return cartItems.some((item) => item.testId === id);
    };

    const handleAddToCart = (test) => {
      const id = getTestId(test);
      const code = test.testCode || test.code || test.id;
      const name = test.testName || test.name;

      dispatch(addTestToCart({
        testId: id,
        testCode: code,
        testName: name,
        price: test.price,
        sampleType: test.sampleType,
      }));
    };

    const handleRemoveFromCart = (test) => {
      dispatch(removeTestFromCart(getTestId(test)));
    };

    const filteredTests = tests.filter(t => {
      const name = (t.testName || t.name || '').toLowerCase();
      const code = (t.testCode || t.code || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || code.includes(query);
    });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Lab Tests (e.g. Blood Sugar, MRI...)"
              className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testsLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-[2rem]" />)
            ) : filteredTests.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <Search size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">No tests found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredTests.map(test => {
                const inCart = testInCart(test);
                return (
                  <motion.div
                    key={getTestId(test)}
                    layout
                    onClick={() => !inCart && handleAddToCart(test)}
                    className={cn(
                      "p-6 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden",
                      inCart
                        ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200"
                        : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-gray-100"
                    )}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex-1">
                        <p className={cn("text-xs font-black uppercase tracking-widest mb-1", inCart ? "text-indigo-200" : "text-gray-400")}>
                          {test.testCode || test.code || 'LAB-TEST'}
                        </p>
                        <h4 className={cn("text-lg font-black tracking-tight mb-2", inCart ? "text-white" : "text-gray-900 group-hover:text-indigo-600")}>
                          {test.testName || test.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase", inCart ? "bg-indigo-500/50 text-white" : "bg-gray-100 text-gray-500")}>
                            {test.sampleType || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className={cn("text-right font-black", inCart ? "text-white text-xl" : "text-indigo-600 text-lg")}>
                        €{test.price}
                      </div>
                    </div>

                    {inCart && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(test); }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-rose-500 text-white transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    )}

                    {!inCart && (
                      <div className="mt-4 flex justify-end">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Plus size={20} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-2xl shadow-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Prescription Cart</h3>
            </div>

            <div className="space-y-4 mb-8 h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-sm font-bold">No tests selected yet</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.testId} className="flex items-center justify-between group py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <h5 className="text-sm font-bold text-gray-900 truncate tracking-tight">{item.testName}</h5>
                      <p className="text-[10px] font-black text-indigo-500 uppercase">{item.testCode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-gray-900">€{item.price}</span>
                      <button
                        onClick={() => dispatch(removeTestFromCart(item.testId))}
                        className="p-1 px-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-6 mb-8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-bold text-sm uppercase tracking-widest leading-none">Subtotal</span>
                <span className="text-2xl font-black text-gray-900">€{cartTotal}</span>
              </div>
            </div>

            <Button
              onClick={() => handleNext()}
              disabled={cartItems.length === 0}
              className="w-full py-4 rounded-[1.5rem] font-black tracking-tight"
            >
              Proceed to Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Modern Scheduling (Step 3)
  const Step3_SlotInstructions = () => (
    <div className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-500" />
            Collection Date
          </label>
          <div className="relative group">
            <Input
              type="date"
              value={timeSlot.date}
              className="h-16 rounded-[1.5rem] border-gray-100 bg-white shadow-xl shadow-gray-100/50 px-6 font-bold focus:ring-indigo-500/10 focus:border-indigo-500"
              onChange={(e) => dispatch(setBookingTimeSlot({ date: e.target.value }))}
              error={errors.date}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Clock size={14} className="text-amber-500" />
            Preferred Slot
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                onClick={() => dispatch(setBookingTimeSlot({ time: slot.value }))}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all",
                  timeSlot.time === slot.value
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white border-gray-100 text-gray-600 hover:border-indigo-100"
                )}
              >
                <span className="text-xl mb-1">{slot.icon}</span>
                <p className="text-[10px] font-black uppercase tracking-tight leading-none">{slot.label}</p>
              </button>
            ))}
          </div>
          {errors.timeSlot && <p className="text-xs text-rose-500 font-bold">{errors.timeSlot}</p>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Info size={14} className="text-indigo-500" />
            Special Instructions
          </label>
          <textarea
            value={instructions.fastingInstructions}
            onChange={(e) => dispatch(setBookingInstructions({ fastingInstructions: e.target.value }))}
            placeholder="e.g., Fasting required for 8 hours..."
            className="w-full px-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-700 font-bold transition-all min-h-[120px]"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            Internal Notes (Optional)
          </label>
          <textarea
            value={bookingNotes}
            onChange={(e) => dispatch(setBookingNotes(e.target.value))}
            placeholder="Internal medical notes for the phlebotomist..."
            className="w-full px-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm shadow-gray-100/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-all min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );

  // Modern Review (Step 4)
  const Step4_Review = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-12">
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4 mb-10">
          <AlertCircle className="text-amber-600 mt-1" size={24} />
          <div>
            <h4 className="text-amber-900 font-black tracking-tight">Final Authorization</h4>
            <p className="text-amber-700 text-sm font-medium">Please verify all clinical and collection details before issuing this lab prescription. This order will be instantly synchronized with the laboratory network.</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-100/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Patient Identity</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
              <p className="text-lg font-black text-gray-800">{selectedPatient?.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
              <p className="font-bold text-gray-700">{selectedPatient?.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Collection Mode</p>
              <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black ring-1 ring-emerald-100">
                HOME COLLECTION
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-100/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <MapPin size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Collection Logistics</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Primary Address</p>
              <p className="text-gray-700 font-bold leading-relaxed">{address.line1}, {address.line2 ? `${address.line2}, ` : ''}{address.city}, {address.state} {address.zipCode}</p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date</p>
                <p className="font-black text-gray-800">{new Date(timeSlot.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Slot</p>
                <p className="font-black text-gray-800 uppercase">{timeSlot.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 relative">
        <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-300 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <Stethoscope size={28} />
            <h3 className="text-2xl font-black tracking-tight">Billable Summary</h3>
          </div>

          <div className="space-y-4 mb-10 relative z-10">
            {cartItems.map(item => (
              <div key={item.testId} className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-xs font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">{item.testCode}</p>
                  <p className="font-bold tracking-tight text-sm truncate max-w-[150px]">{item.testName}</p>
                </div>
                <span className="text-lg font-black text-white">€{item.price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20 pt-6 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-1">Total Amount</p>
                <p className="text-5xl font-black tracking-tighter">€{cartTotal}</p>
              </div>
              <CheckCircle2 size={48} className="text-emerald-400 mb-1 opacity-50" />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isCreatingOrder}
          loading={isSubmitting || isCreatingOrder}
          className="w-full mt-6 py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 border-none"
        >
          {isSubmitting ? 'Processing Order...' : 'Prescribe & Confirm Lab Order'}
          <ArrowRight size={24} />
        </Button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 0: return <Step0_SelectPatient />;
      case 1: return <Step1_Tests />;
      case 2: return (
        <div className="max-w-2xl bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-gray-100/50">
          <AddressForm
            data={address}
            errors={errors}
            onChange={(newAddress) => dispatch(setBookingAddress(newAddress))}
            onBlur={() => { }}
          />
        </div>
      );
      case 3: return <Step3_SlotInstructions />;
      case 4: return <Step4_Review />;
      default: return null;
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0 && !selectedPatient) newErrors.patient = 'Required';
    if (currentStep === 1 && cartItems.length === 0) newErrors.cart = 'Required';
    if (currentStep === 2) {
      if (!address.line1) newErrors.line1 = 'Required';
      if (!address.city) newErrors.city = 'Required';
      if (!address.state) newErrors.state = 'Required';
      if (!address.zipCode || address.zipCode.length < 5) newErrors.zipCode = 'Invalid Zip';
    }
    if (currentStep === 3) {
      if (!timeSlot.date) newErrors.date = 'Required';
      if (!timeSlot.time) newErrors.timeSlot = 'Required';
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch(setBookingErrors(newErrors));
      showToast('error', 'Please complete the required fields');
      return false;
    }
    dispatch(clearBookingErrors());
    return true;
  };

  const handleNext = () => {
    if (validateStep()) dispatch(nextBookingStep());
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    dispatch(setBookingSubmitting(true));

    try {
      const orderData = {
        patientId: selectedPatient.id,
        testCodes: cartItems.map(i => i.testCode || i.code || i.testName).filter(Boolean),
        collectionType: 'HOME',
        address: address,
        preferredSlotStart: timeSlot.date ? `${timeSlot.date}T10:00:00` : null,
        preferredSlotEnd: timeSlot.date ? `${timeSlot.date}T14:00:00` : null,
        instructions,
        notes: bookingNotes,
        totalPrice: cartTotal,
      };

      const response = await createOrder(orderData).unwrap();
      showToast('success', 'Lab Prescribed Successfully!');
      dispatch(clearCart());
      dispatch(resetBookingDraft());
      setTimeout(() => navigate(`/doctor/labs/orders/${response.id}`), 1500);
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to process order');
    } finally {
      dispatch(setBookingSubmitting(false));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen py-10 px-4 md:px-10 pb-32">
      {/* Progress Navigation Sidebar (Desktop) */}
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 lg:shrink-0">
          <div className="sticky top-10 space-y-6">
            <div className="mb-8">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl mb-4">
                <Users className="text-indigo-600 mb-2" size={24} />
                <h4 className="text-sm font-black text-indigo-900 tracking-tight leading-none">Lab Prescriber</h4>
                <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1">Doctor Portal</p>
              </div>
            </div>

            <nav className="space-y-2">
              {BOOKING_STEPS.map((step, idx) => {
                const isPast = idx < currentStep;
                const isActive = idx === currentStep;

                return (
                  <div key={step.id} className="relative group">
                    <button
                      disabled={!isPast && !isActive}
                      onClick={() => idx < currentStep && dispatch(setBookingStep(idx))}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left relative z-10",
                        isActive
                          ? "bg-white shadow-xl shadow-gray-100/50 ring-1 ring-gray-100 text-indigo-600"
                          : isPast
                            ? "text-gray-900 hover:bg-white/50"
                            : "text-gray-400 opacity-60"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : isPast ? "bg-emerald-50 text-emerald-600" : "bg-gray-100"
                      )}>
                        {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black tracking-tight leading-none mb-1">{step.label}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap opacity-60">{step.description}</p>
                      </div>
                    </button>
                    {idx < BOOKING_STEPS.length - 1 && (
                      <div className={cn(
                        "absolute left-8 top-12 w-0.5 h-6 -ml-[1px] z-0",
                        isPast ? "bg-emerald-100" : "bg-gray-100"
                      )} />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl">
            {renderStepHeader()}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {getStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Fixed Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <button
                  onClick={() => dispatch(prevBookingStep())}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-0"
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                {currentStep < BOOKING_STEPS.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {currentStep === 0 && !selectedPatient ? 'Select Patient' : 'Continue'}
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Attention'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
