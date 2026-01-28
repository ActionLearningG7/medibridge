/**
 * DoctorLabBooking Page
 * Multi-step booking form for doctors to book lab tests for patients
 * Includes patient selection as first step
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useCreateDoctorOrderMutation, useGetLabTestsQuery } from '../../features/lab/labApi';
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
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Input, Toast } from '../../ui';
import { BookingStepper } from '../../components/lab/BookingStepper';
import { PatientSearch } from '../../components/lab/PatientSearch';
import { AddressForm } from '../../components/lab/AddressForm';

const BOOKING_STEPS = [
  { id: 'patient', label: 'Select Patient', description: 'Choose patient' },
  { id: 'tests', label: 'Confirm Tests', description: 'Review tests' },
  { id: 'address', label: 'Address', description: 'Collection address' },
  { id: 'slot', label: 'Slot & Instructions', description: 'Time & notes' },
  { id: 'review', label: 'Review', description: 'Confirm & book' },
];

const TIME_SLOTS = [
  { id: 'morning', label: '06:00 AM - 10:00 AM', value: 'morning' },
  { id: 'afternoon', label: '10:00 AM - 02:00 PM', value: 'afternoon' },
  { id: 'evening', label: '02:00 PM - 06:00 PM', value: 'evening' },
];

export default function DoctorLabBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [selectedPatient, setSelectedPatient] = useState(null);

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

  // API mutation
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateDoctorOrderMutation();

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Redirect if no cart and past patient selection
  useEffect(() => {
    if (cartItems.length === 0 && currentStep > 0) {
      navigate('/lab/catalog');
    }
  }, [cartItems, currentStep, navigate]);

  // Step 0: Select Patient
  const Step0_SelectPatient = () => (
    <Card>
      <CardHeader>
        <CardTitle>Patient Selection</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedPatient ? (
          <PatientSearch onPatientSelect={(patient) => {
            setSelectedPatient(patient);
          }} />
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Selected Patient</p>
              <p className="text-lg font-semibold text-blue-900 mt-2">{selectedPatient.fullName}</p>
              <p className="text-sm text-blue-700 mt-1">{selectedPatient.email}</p>
              <p className="text-sm text-blue-700">{selectedPatient.phone}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedPatient(null)}
              className="w-full"
            >
              Change Patient
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Step 1: Select & Confirm Tests
  const Step1_Tests = () => {
    const { data: tests = [], isLoading: testsLoading } = useGetLabTestsQuery({ limit: 50 });
    const dispatch = useDispatch();
    const testInCart = (testId) => cartItems.some((item) => item.testId === testId);

    const handleAddToCart = (test) => {
      dispatch(addTestToCart({
        testId: test.id,
        testCode: test.code,
        testName: test.name,
        price: test.price,
        sampleType: test.sampleType,
      }));
    };

    const handleRemoveFromCart = (testId) => {
      dispatch(removeTestFromCart(testId));
    };

    return (
      <div className="space-y-4">
        {cartItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.testId} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.testName}</p>
                    <p className="text-sm text-gray-600">{item.testCode || 'No code'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">₹{item.price}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromCart(item.testId)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-primary-600">₹{cartTotal}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Browse Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {testsLoading ? (
              <p className="text-center text-gray-600 py-8">Loading tests...</p>
            ) : tests.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No tests available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      testInCart(test.id)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !testInCart(test.id) && handleAddToCart(test)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{test.name || test.testName}</p>
                        <p className="text-xs text-gray-500">{test.testCode || test.code}</p>
                        <p className="text-xs text-gray-600 mt-1">₹{test.price}</p>
                      </div>
                      {!testInCart(test.id) && (
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500">
          For patient: <span className="font-medium text-gray-900">{selectedPatient?.fullName}</span>
        </p>
      </div>
    );
  };

  // Step 2: Address
  const Step2_Address = () => (
    <Card>
      <CardHeader>
        <CardTitle>Collection Address</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressForm
          data={address}
          errors={errors}
          onChange={(newAddress) => dispatch(setBookingAddress(newAddress))}
          onBlur={() => {}}
        />
      </CardContent>
    </Card>
  );

  // Step 3: Slot & Instructions
  const Step3_SlotInstructions = () => (
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
                onClick={() => dispatch(setBookingTimeSlot({ time: slot.value }))}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  timeSlot.time === slot.value
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
            value={timeSlot.date}
            onChange={(e) => dispatch(setBookingTimeSlot({ date: e.target.value }))}
            error={errors.date}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasting Instructions
            </label>
            <textarea
              value={instructions.fastingInstructions}
              onChange={(e) =>
                dispatch(setBookingInstructions({ fastingInstructions: e.target.value }))
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
              placeholder="e.g., Patient has specific allergies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Review
  const Step4_Review = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Patient</p>
            <p className="text-sm text-gray-600">{selectedPatient?.fullName}</p>
            <p className="text-sm text-gray-600">{selectedPatient?.email}</p>
            <p className="text-sm text-gray-600">{selectedPatient?.phone}</p>
          </div>
          <div className="border-t pt-3" />

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
          <div className="border-t pt-3" />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Collection Address</p>
            <p className="text-sm text-gray-600">{address.line1}</p>
            {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
            <p className="text-sm text-gray-600">
              {address.city}, {address.state} {address.zipCode}
            </p>
          </div>
          <div className="border-t pt-3" />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Collection Slot</p>
            <p className="text-sm text-gray-600">
              {new Date(timeSlot.date).toLocaleDateString()} - {timeSlot.time}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-1 rounded" required />
          <span className="text-sm text-gray-700">
            I confirm that the details are correct and I have authorization to book lab tests for this patient
          </span>
        </label>
      </div>
    </div>
  );

  // Get step content
  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step0_SelectPatient />;
      case 1:
        return <Step1_Tests />;
      case 2:
        return <Step2_Address />;
      case 3:
        return <Step3_SlotInstructions />;
      case 4:
        return <Step4_Review />;
      default:
        return null;
    }
  };

  // Validate step
  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (!selectedPatient) newErrors.patient = 'Patient selection is required';
        break;
      case 1:
        break;
      case 2:
        if (!address.line1) newErrors.line1 = 'Address line 1 is required';
        if (!address.city) newErrors.city = 'City is required';
        if (!address.state) newErrors.state = 'State is required';
        if (!address.zipCode || address.zipCode.length !== 6) {
          newErrors.zipCode = 'Valid 6-digit pincode is required';
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
      const orderData = {
        patientId: selectedPatient.id,
        // Send testCodes array (API requirement)
        // Use testCode, if not available try code, fallback to testName
        testCodes: cartItems
          .map((item) => item.testCode || item.code || item.testName)
          .filter(code => code !== null && code !== undefined),
        // Collection type: HOME or LAB
        collectionType: 'HOME',
        // Delivery address
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          coordinates: address.coordinates,
        },
        // Collection time slot - convert to ISO datetime format
        // timeSlot.date = "2026-01-26", timeSlot.time = "afternoon"
        // Convert to ISO datetime: preferredSlotStart & preferredSlotEnd
        preferredSlotStart: timeSlot.date ? `${timeSlot.date}T10:00:00` : null,
        preferredSlotEnd: timeSlot.date ? `${timeSlot.date}T14:00:00` : null,
        // Special instructions
        instructions,
        notes: bookingNotes,
        totalPrice: cartTotal,
      };

      const response = await createOrder(orderData).unwrap();
      showToast('success', 'Order placed successfully!');

      dispatch(clearCart());
      dispatch(resetBookingDraft());

      setTimeout(() => {
        navigate(`/doctor/labs/orders/${response.id}`);
      }, 1500);
    } catch (error) {
      console.error('Order creation error:', error);
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
        return selectedPatient !== null;
      case 1:
        return cartItems.length > 0;
      case 2:
        return address.line1 && address.city && address.state && address.zipCode;
      case 3:
        return timeSlot.date && timeSlot.time;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Prescribe Lab Tests"
        subtitle="Create a lab order for your patient in 5 steps"
      />

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
