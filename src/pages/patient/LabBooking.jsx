import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, MapPin, Clock, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Info } from 'lucide-react';
import { useCreatePatientOrderMutation } from '../../features/lab/labApi';
import {
  selectCartItems,
  selectCartTotalPrice,
  selectBookingStep,
  selectBookingAddress,
  selectBookingTimeSlot,
  selectBookingInstructions,
  selectPaymentMethod,
  selectBookingNotes,
  selectBookingErrors,
  selectIsBookingSubmitting,
  selectIsAddressComplete,
  selectIsTimeSlotComplete,
} from '../../features/lab/selectors';
import {
  setBookingStep,
  nextBookingStep,
  prevBookingStep,
  setBookingAddress,
  setBookingTimeSlot,
  setBookingInstructions,
  setPaymentMethod,
  setBookingNotes,
  setBookingErrors,
  clearBookingErrors,
  setBookingSubmitting,
  resetBookingDraft,
  clearCart,
} from '../../features/lab/labSlice';
import { selectUser } from '../../features/auth/authSlice';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Toast } from '../../ui';
import { BookingStepper } from '../../components/lab/BookingStepper';
import { AddressForm } from '../../components/lab/AddressForm';

const BOOKING_STEPS = [
  { id: 'tests', label: 'Review', description: 'Confirm Selection', icon: ShoppingBag },
  { id: 'patient', label: 'Identity', description: 'Patient Details', icon: UserIcon },
  { id: 'address', label: 'Location', description: 'Collection Point', icon: MapPin },
  { id: 'slot', label: 'Schedule', description: 'Preferred Time', icon: Clock },
  { id: 'review', label: 'Confirm', description: 'Verify & Pay', icon: ShieldCheck },
];

const TIME_SLOTS = [
  { id: 'morning', label: '06:00 AM - 10:00 AM', value: 'morning', icon: '🌅' },
  { id: 'afternoon', label: '10:00 AM - 02:00 PM', value: 'afternoon', icon: '☀️' },
  { id: 'evening', label: '02:00 PM - 06:00 PM', value: 'evening', icon: '🌆' },
];

export default function LabBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [patientInfo, setPatientInfo] = useState({ name: '', phone: '', email: '' });

  // Get data from Redux
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalPrice);
  const currentStep = useSelector(selectBookingStep);
  const address = useSelector(selectBookingAddress);
  const timeSlot = useSelector(selectBookingTimeSlot);
  const instructions = useSelector(selectBookingInstructions);
  const bookingNotes = useSelector(selectBookingNotes);
  const errors = useSelector(selectBookingErrors);
  const isSubmitting = useSelector(selectIsBookingSubmitting);
  const isAddressComplete = useSelector(selectIsAddressComplete);
  const isTimeSlotComplete = useSelector(selectIsTimeSlotComplete);
  const user = useSelector(selectUser);

  // API mutation
  const [createOrder, { isLoading: isCreatingOrder }] = useCreatePatientOrderMutation();

  // Prefill patient info from auth
  useEffect(() => {
    if (user) {
      setPatientInfo(prev => ({
        ...prev,
        name: prev.name || user.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Handle empty cart state
  if (cartItems.length === 0 && currentStep === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-12 rounded-[3rem] border-none shadow-2xl">
          <div className="mx-auto w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center mb-8">
            <ShoppingBag className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Cart is Empty</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Begin your health journey by selecting diagnostics from our comprehensive laboratory catalog.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/patient/labs/catalog')}
            className="w-full h-16 rounded-2xl bg-primary-600 hover:bg-primary-700 font-bold shadow-xl shadow-primary-200 transition-all hover:scale-105 active:scale-95"
          >
            Explore Catalog
          </Button>
        </Card>
      </div>
    );
  }

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ isOpen: false, type: 'success', message: '' }), 5000);
  };

  // Step 1: Confirm Tests
  const renderStep1_Tests = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <ShoppingBag className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Confirm Selection</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Review your diagnostics</p>
        </div>
      </div>

      <div className="grid gap-3">
        {cartItems.map((item) => (
          <div key={item.testId} className="bg-white p-5 rounded-3xl border-2 border-gray-50 hover:border-primary-100 transition-all flex justify-between items-center group">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none block">{item.testCode}</span>
              <p className="font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">{item.testName}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-bold text-gray-900 leading-none">€</span>
                <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">{item.price}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Single Unit</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800 rounded-full -translate-y-12 translate-x-12 opacity-50 blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Payable</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold opacity-80">€</span>
              <span className="text-5xl font-black tracking-tighter">{cartTotal}</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Patient Info
  const renderStep2_PatientInfo = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <UserIcon className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Patient Identity</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Verification details</p>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-2 border-gray-50 p-8 space-y-6 shadow-sm">
        <Input
          label="Legal Full Name"
          value={patientInfo.name}
          onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
          error={errors.name}
          className="h-14 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-100"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Booking Notification Email"
            type="email"
            value={patientInfo.email}
            onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
            error={errors.email}
            className="h-14 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-100"
            required
          />
          <Input
            label="Primary Contact (Mobile)"
            placeholder="No country code"
            value={patientInfo.phone}
            onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
            error={errors.phone}
            className="h-14 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-100"
            required
          />
        </div>
        <div className="p-4 bg-primary-50 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 mt-0.5" />
          <p className="text-xs font-bold text-primary-800 leading-relaxed">
            Report status and sample collection alerts will be sent to the above contact details.
          </p>
        </div>
      </Card>
    </div>
  );

  // Step 3: Address
  const renderStep3_Address = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <MapPin className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Collection Site</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Where should we visit?</p>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-2 border-gray-50 p-8 shadow-sm">
        <AddressForm
          data={address}
          errors={errors}
          onChange={(newAddress) => dispatch(setBookingAddress(newAddress))}
          onBlur={() => { }}
        />
      </Card>
    </div>
  );

  // Step 4: Slot & Instructions
  const renderStep4_SlotInstructions = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <Clock className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Schedule Visit</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Preferred timing</p>
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Time Window</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                onClick={() => dispatch(setBookingTimeSlot({ ...timeSlot, time: slot.value }))}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all group ${timeSlot.time === slot.value
                    ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-200/50'
                    : 'border-gray-50 bg-white hover:border-gray-200'
                  }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{slot.icon}</span>
                <div className="text-left">
                  <p className={`font-black tracking-tight leading-none mb-1 ${timeSlot.time === slot.value ? 'text-primary-700' : 'text-gray-900'}`}>{slot.label.split(' - ')[0]}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{slot.label.split(' - ')[1]}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.timeSlot && <p className="text-xs font-bold text-red-600 mt-2 ml-2">{errors.timeSlot}</p>}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Preferred Date</label>
            <Input
              type="date"
              value={timeSlot.date || ''}
              onChange={(e) => dispatch(setBookingTimeSlot({ ...timeSlot, date: e.target.value }))}
              error={errors.date}
              min={new Date().toISOString().split('T')[0]}
              className="h-14 bg-white border-2 border-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100/50 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-amber-900 text-sm tracking-tight leading-none mb-1">Morning Slots</h4>
                <p className="text-[10px] font-bold text-amber-800 leading-normal opacity-70">
                  Highest accuracy for fasting-required samples like Blood Glucose or Lipid Profiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Special Instructions</label>
          <textarea
            value={bookingNotes}
            onChange={(e) => dispatch(setBookingNotes(e.target.value))}
            placeholder="e.g., Gate code is 1234, please call before ringing the bell..."
            className="w-full p-6 bg-white border-2 border-gray-50 rounded-[2.5rem] focus:ring-4 focus:ring-primary-50 focus:border-primary-200 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300 min-h-[150px]"
          />
        </section>
      </div>
    </div>
  );

  // Step 5: Review
  const renderStep5_Review = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Diagnostic Review</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Final confirmation</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-[3rem] border-2 border-gray-50 overflow-hidden shadow-sm">
          <div className="p-8 pb-0 flex justify-between items-center">
            <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Order Manifest</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">Secure Booking</span>
          </div>

          <CardContent className="p-8 space-y-8">
            {/* Manifest List */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.testId} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <span className="font-bold text-gray-700">{item.testName}</span>
                  </div>
                  <div className="font-black text-gray-900 tracking-tight">€{item.price}</div>
                </div>
              ))}
              <div className="flex justify-between items-center p-6 bg-primary-600 rounded-3xl mt-4 text-white shadow-xl shadow-primary-100">
                <span className="font-black uppercase tracking-widest text-[10px] opacity-80">Final Gross Total</span>
                <span className="text-3xl font-black tracking-tighter leading-none">€{cartTotal}</span>
              </div>
            </div>

            {/* Grid Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-gray-50 pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Patient Identity</h4>
                </div>
                <div className="pl-7">
                  <p className="font-black text-gray-900 leading-tight mb-1">{patientInfo.name}</p>
                  <p className="text-xs font-bold text-gray-500 italic opacity-70">{patientInfo.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Schedule Window</h4>
                </div>
                <div className="pl-7">
                  <p className="font-black text-gray-900 leading-tight mb-1">{timeSlot.date ? new Date(timeSlot.date).toLocaleDateString() : ''}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-70">{timeSlot.time} Interval</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4 border-t-2 border-gray-50 pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Collection Site</h4>
                </div>
                <div className="pl-7">
                  <p className="font-black text-gray-900 leading-tight">{address.line1}, {address.city}</p>
                  <p className="text-xs font-bold text-gray-500 opacity-70">{address.state} {address.zipCode}, {address.country || 'Ireland'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-3 flex-grow">
            <h4 className="font-black text-emerald-900 tracking-tight leading-none pt-1">Medical Compliance Disclaimer</h4>
            <p className="text-xs font-bold text-emerald-800/70 leading-relaxed">
              By proceeding, you verify that the information provided is medically accurate and you consent to the sample collection protocols defined by MediBridge Diagnostics.
            </p>
            <label className="flex items-center gap-3 cursor-pointer select-none py-2 group">
              <div className="relative">
                <input type="checkbox" className="peer hidden" required />
                <div className="w-6 h-6 rounded-lg border-2 border-emerald-200 peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs font-black text-emerald-900 uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                I verify my appointment details
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 0: return renderStep1_Tests();
      case 1: return renderStep2_PatientInfo();
      case 2: return renderStep3_Address();
      case 3: return renderStep4_SlotInstructions();
      case 4: return renderStep5_Review();
      default: return null;
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!patientInfo.name) newErrors.name = 'Patient name required';
      if (!patientInfo.email) newErrors.email = 'Valid email required';
      if (!patientInfo.phone) newErrors.phone = 'Contact number required';
    } else if (currentStep === 2) {
      if (!address.line1) newErrors.line1 = 'Primary address required';
      if (!address.city) newErrors.city = 'City required';
      if (!address.state) newErrors.state = 'State required';
      if (!address.zipCode) newErrors.zipCode = 'Postal code required';
    } else if (currentStep === 3) {
      if (!timeSlot.date) newErrors.date = 'Date required';
      if (!timeSlot.time) newErrors.timeSlot = 'Time-window required';
    }
    if (Object.keys(newErrors).length > 0) {
      dispatch(setBookingErrors(newErrors));
      showToast('error', 'Required fields missing');
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
      let finalCoords = address.coordinates;
      if (!finalCoords || !finalCoords.lat) {
        const addressStr = `${address.line1}, ${address.city}, ${address.state}, ${address.zipCode}`;
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}`);
          const geoData = await geoRes.json();
          if (geoData?.length > 0) finalCoords = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
        } catch (err) { console.warn('Geocoding fail', err); }
      }

      const orderData = {
        testCodes: cartItems.map((item) => item.testCode || item.code || item.testName).filter(code => !!code),
        collectionType: 'HOME',
        patientId: user?.id,
        addressLine1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: address.country || "Ireland",
        contactPhone: patientInfo.phone,
        latitude: finalCoords?.lat,
        longitude: finalCoords?.lng,
        preferredSlotStart: timeSlot.date ? `${timeSlot.date}T10:00:00` : null,
        preferredSlotEnd: timeSlot.date ? `${timeSlot.date}T14:00:00` : null,
        specialInstructions: bookingNotes,
      };

      const response = await createOrder(orderData).unwrap();
      showToast('success', 'Safe booking confirmed');
      dispatch(clearCart());
      dispatch(resetBookingDraft());

      if (response.paymentRequired && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        navigate(`/patient/labs/orders/${response.id}`);
      }
    } catch (error) {
      const message = error?.data?.message || 'Transaction failed. Access laboratory support.';
      dispatch(setBookingErrors({ submit: message }));
      showToast('error', message);
    } finally {
      dispatch(setBookingSubmitting(false));
    }
  };

  const isStepCompleted = (idx) => {
    if (idx === 0) return cartItems.length > 0;
    if (idx === 1) return !!(patientInfo.name && patientInfo.phone);
    if (idx === 2) return isAddressComplete;
    if (idx === 3) return isTimeSlotComplete;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Priority Health System
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Diagnostic Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[3rem] shadow-sm border-2 border-gray-50 p-6 sm:p-10">
          <BookingStepper
            steps={BOOKING_STEPS}
            currentStep={currentStep}
            onStepClick={(step) => (isStepCompleted(step) || step <= currentStep) && dispatch(setBookingStep(step))}
            isStepCompleted={isStepCompleted}
          />

          <div className="max-w-2xl mx-auto mt-16">
            {getStepContent()}

            <div className="mt-16 flex justify-between items-center bg-gray-50/50 p-4 rounded-[2.5rem] border-2 border-gray-50">
              <Button
                variant="ghost"
                onClick={() => dispatch(prevBookingStep())}
                disabled={currentStep === 0}
                className={`h-14 px-8 rounded-2xl font-black text-gray-500 hover:bg-white hover:text-gray-900 ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`}
              >
                <ChevronLeft className="w-5 h-5 mr-2 stroke-[2.5]" />
                Back
              </Button>

              {currentStep === BOOKING_STEPS.length - 1 ? (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isCreatingOrder}
                  loading={isSubmitting || isCreatingOrder}
                  className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl shadow-emerald-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                  Confirm & Finalize
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="h-16 px-12 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black shadow-xl shadow-primary-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Synchronized' : 'System Alert'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
