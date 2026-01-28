/**
 * LabBooking Page - Patient
 * Multi-step booking form with validation
 * Steps: Confirm tests → Patient info → Address → Slot & instructions → Review
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Input, Toast } from '../../ui';
import { BookingStepper } from '../../components/lab/BookingStepper';
import { AddressForm } from '../../components/lab/AddressForm';

const BOOKING_STEPS = [
  { id: 'tests', label: 'Confirm Tests', description: 'Review selected tests' },
  { id: 'patient', label: 'Patient Info', description: 'Your details' },
  { id: 'address', label: 'Address', description: 'Collection address' },
  { id: 'slot', label: 'Slot & Instructions', description: 'Time & notes' },
  { id: 'review', label: 'Review', description: 'Confirm & book' },
];

const TIME_SLOTS = [
  { id: 'morning', label: '06:00 AM - 10:00 AM', value: 'morning' },
  { id: 'afternoon', label: '10:00 AM - 02:00 PM', value: 'afternoon' },
  { id: 'evening', label: '02:00 PM - 06:00 PM', value: 'evening' },
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
        // Only update name/phone/email if distinct and not already edited?
        // Actually, logic was minimal before. Let's make it robust.
        name: prev.name || user.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Handle empty cart state
  if (cartItems.length === 0 && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Please browse our lab catalog and add tests to your cart before booking.
          </p>
          <Button
            onClick={() => navigate('/patient/labs/catalog')}
            className="w-full"
          >
            Browse Lab Tests
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
    <Card>
      <CardHeader>
        <CardTitle>Confirm Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.testId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.testName}</p>
                <p className="text-sm text-gray-600">{item.testCode}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-600">₹{item.price}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-primary-600">₹{cartTotal}</span>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Patient Info
  const renderStep2_PatientInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Full Name"
          value={patientInfo.name}
          onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
          error={errors.name}
          helperText="Verify your full name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={patientInfo.email}
          onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
          error={errors.email}
          required
        />
        <Input
          label="Phone"
          placeholder="Contact number"
          value={patientInfo.phone}
          onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
          error={errors.phone}
          required
        />
      </CardContent>
    </Card>
  );

  // Step 3: Address
  const renderStep3_Address = () => (
    <Card>
      <CardHeader>
        <CardTitle>Collection Address</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressForm
          data={address}
          errors={errors}
          onChange={(newAddress) => dispatch(setBookingAddress(newAddress))}
          onBlur={() => { }}
        />
      </CardContent>
    </Card>
  );

  // Step 4: Slot & Instructions
  const renderStep4_SlotInstructions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Preferred Collection Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                onClick={() => dispatch(setBookingTimeSlot({ ...timeSlot, time: slot.value }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${timeSlot.time === slot.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <p className="font-medium text-gray-900">{slot.label}</p>
              </button>
            ))}
          </div>
          {errors.timeSlot && <p className="text-sm text-red-600 mt-2">{errors.timeSlot}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={timeSlot.date || ''}
            onChange={(e) => dispatch(setBookingTimeSlot({ ...timeSlot, date: e.target.value }))}
            error={errors.date}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasting Instructions
            </label>
            <textarea
              value={instructions.fastingInstructions}
              onChange={(e) =>
                dispatch(
                  setBookingInstructions({
                    ...instructions,
                    fastingInstructions: e.target.value,
                  })
                )
              }
              placeholder="e.g., Fasting required for 8 hours..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Notes
            </label>
            <textarea
              value={bookingNotes}
              onChange={(e) => dispatch(setBookingNotes(e.target.value))}
              placeholder="e.g., Please call 5 minutes before arrival..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 5: Review
  const renderStep5_Review = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tests</p>
            <div className="space-y-1">
              {cartItems.map((item) => (
                <div key={item.testId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.testName}</span>
                  <span className="font-medium">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary-600">₹{cartTotal}</span>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Patient Details</p>
            <p className="text-sm text-gray-600">{patientInfo.name}</p>
            <p className="text-sm text-gray-600">{patientInfo.email}</p>
            <p className="text-sm text-gray-600">+91 {patientInfo.phone}</p>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Collection Address</p>
            <p className="text-sm text-gray-600">{address.line1}</p>
            {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
            <p className="text-sm text-gray-600">
              {address.city}, {address.state} {address.zipCode}
            </p>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Collection Slot</p>
            <p className="text-sm text-gray-600">
              {timeSlot.date ? new Date(timeSlot.date).toLocaleDateString() : ''} - {timeSlot.time}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-1 rounded" required />
          <span className="text-sm text-gray-700">
            I confirm the details are correct and have read the terms & conditions
          </span>
        </label>
      </div>
    </div>
  );

  // Get current step content (defined before use in return)
  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1_Tests();
      case 1:
        return renderStep2_PatientInfo();
      case 2:
        return renderStep3_Address();
      case 3:
        return renderStep4_SlotInstructions();
      case 4:
        return renderStep5_Review();
      default:
        return null;
    }
  };

  // Validate step
  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        break;
      case 1:
        if (!patientInfo.name) newErrors.name = 'Full name is required';
        if (!patientInfo.email) newErrors.email = 'Email is required';
        if (!patientInfo.phone) {
          newErrors.phone = 'Phone number is required';
        }
        break;
      case 2:
        if (!address.line1) newErrors.line1 = 'Address line 1 is required';
        if (!address.city) newErrors.city = 'City is required';
        if (!address.state) newErrors.state = 'State is required';
        if (!address.zipCode) {
          newErrors.zipCode = 'Pincode is required';
        }
        break;
      case 3:
        if (!timeSlot.date) newErrors.date = 'Date is required';
        if (!timeSlot.time) newErrors.timeSlot = 'Time slot is required';
        break;
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch(setBookingErrors(newErrors));
      showToast('error', 'Please fix errors before continuing');
      return false;
    }

    dispatch(clearBookingErrors());
    return true;
  };

  // Handle next
  const handleNext = () => {
    if (validateStep()) {
      dispatch(nextBookingStep());
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep()) return;

    dispatch(setBookingSubmitting(true));

    try {
      // 1. Resolve Coordinates
      let finalCoords = address.coordinates;

      if (!finalCoords || !finalCoords.lat) {
        // Try to geocode if missing
        const addressStr = `${address.line1}, ${address.city}, ${address.state}, ${address.zipCode}`;
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            finalCoords = {
              lat: parseFloat(geoData[0].lat),
              lng: parseFloat(geoData[0].lon)
            };
          }
        } catch (err) {
          console.warn('Geocoding failed', err);
        }
      }

      const orderData = {
        testCodes: cartItems
          .map((item) => item.testCode || item.code || item.testName)
          .filter(code => code !== null && code !== undefined),
        collectionType: 'HOME',
        patientId: user?.id, // Ensure patientId is sent if needed, though backend often uses Principal
        patientInfo: {
          // Backend doesn't seem to use this nested object in LabOrderRequest (it uses separate fields), 
          // but we'll include flatten fields below.
          // Wait, LabOrderRequest.java DOES NOT have patientInfo object, it has contactPhone.
        },
        // Flattened Address & Contact Info
        addressLine1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        country: "India", // Default
        contactPhone: patientInfo.phone,

        // Flattened Coordinates
        latitude: finalCoords?.lat,
        longitude: finalCoords?.lng,

        // Time Slot
        preferredSlotStart: timeSlot.date ? `${timeSlot.date}T10:00:00` : null,
        preferredSlotEnd: timeSlot.date ? `${timeSlot.date}T14:00:00` : null,

        specialInstructions: instructions.fastingInstructions, // Mapping to specialInstructions

        // Note: 'notes' and 'instructions' object might not strictly match backend if not mapped. 
        // Backend has 'specialInstructions'.
      };

      const response = await createOrder(orderData).unwrap();
      showToast('success', 'Order placed successfully!');

      dispatch(clearCart());
      dispatch(resetBookingDraft());

      setTimeout(() => {
        navigate(`/patient/labs/orders/${response.id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      const message = error?.data?.message || 'Failed to place order. Please try again.';
      dispatch(setBookingErrors({ submit: message }));
      showToast('error', message);
    } finally {
      dispatch(setBookingSubmitting(false));
    }
  };

  // Check if step completed
  const isStepCompleted = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return cartItems.length > 0;
      case 1:
        return patientInfo.name && patientInfo.email && patientInfo.phone;
      case 2:
        return isAddressComplete;
      case 3:
        return isTimeSlotComplete;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Book Lab Tests" subtitle="Complete your booking in 5 simple steps" />

      <BookingStepper
        steps={BOOKING_STEPS}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (isStepCompleted(step) || step === currentStep) {
            dispatch(setBookingStep(step));
          }
        }}
        isStepCompleted={isStepCompleted}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getStepContent()}

        <div className="mt-8 flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => dispatch(prevBookingStep())}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === BOOKING_STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isCreatingOrder}
              loading={isSubmitting || isCreatingOrder}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
