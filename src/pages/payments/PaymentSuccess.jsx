import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { useGetAppointmentByIdQuery } from '../../features/appointment/appointmentApi';
import { useGetPatientOrderDetailQuery } from '../../features/lab/labApi';
import { useVerifyPaymentStatusMutation } from '../../features/payment/paymentApi';
import { Card, CardContent, Button } from '../../ui';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ref = searchParams.get('ref'); // APPOINTMENT or LAB_ORDER
    const id = searchParams.get('id');

    const [verifyStatus] = useVerifyPaymentStatusMutation();
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Initial Verification Call
    useEffect(() => {
        if (ref && id) {
            console.log('🔄 Triggering manual payment verification...', { ref, id });
            verifyStatus({ type: ref, id });
        }
    }, [ref, id, verifyStatus]);

    // Poll Appointment
    const { data: appointment } = useGetAppointmentByIdQuery(id, {
        skip: ref !== 'APPOINTMENT' || !id || isConfirmed,
        pollingInterval: 3000,
    });

    // Poll Lab Order
    const { data: labOrder } = useGetPatientOrderDetailQuery(id, {
        skip: ref !== 'LAB_ORDER' || !id || isConfirmed,
        pollingInterval: 3000,
    });

    useEffect(() => {
        if (ref === 'APPOINTMENT' && appointment) {
            if (appointment.status === 'CONFIRMED' || appointment.status === 'QUEUED' || appointment.status === 'SCHEDULED') {
                setIsConfirmed(true);
            }
        } else if (ref === 'LAB_ORDER' && labOrder) {
            if (labOrder.status === 'CONFIRMED' || labOrder.status === 'SCHEDULED') {
                setIsConfirmed(true);
            }
        }
    }, [appointment, labOrder, ref]);

    useEffect(() => {
        if (isConfirmed) {
            const timeout = setTimeout(() => {
                if (ref === 'APPOINTMENT') {
                    navigate('/patient/appointments');
                } else {
                    navigate(`/patient/labs/orders/${id}`);
                }
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isConfirmed, ref, id, navigate]);

    const handleManualRedirect = () => {
        if (ref === 'APPOINTMENT') {
            navigate('/patient/appointments');
        } else {
            navigate(`/patient/labs/orders/${id}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            {/* Background Blobs for Premium Feel */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Success Header Gradient */}
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />

                <CardContent className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping scale-150 opacity-20" />
                            <div className="relative bg-green-100 p-4 rounded-full">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
                        <p className="text-gray-500">
                            Thank you for your payment. Your booking is being processed.
                        </p>
                    </div>

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl flex items-center justify-center gap-3 transition-colors duration-500 ${isConfirmed ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                        {isConfirmed ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Booking Confirmed</span>
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium animate-pulse">Confirming with payment provider...</span>
                            </>
                        )}
                    </div>

                    {/* Details Preview */}
                    <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                {ref === 'APPOINTMENT' ? <Calendar className="w-5 h-5 text-primary-600" /> : <FileText className="w-5 h-5 text-primary-600" />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Reference</p>
                                <p className="font-medium text-gray-900">{ref === 'APPOINTMENT' ? 'Doctor Consultation' : 'Lab Order'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Booking ID</p>
                                <p className="font-mono text-sm text-gray-700">{id?.substring(0, 8)}...</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Status</p>
                                <p className="text-sm font-semibold capitalize">{isConfirmed ? 'Confirmed' : 'Processing'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <p className="text-xs text-gray-500">
                            {isConfirmed
                                ? "You'll be redirected to your booking details in a few seconds."
                                : "This usually takes less than 30 seconds. Do not close this page."}
                        </p>

                        <Button
                            onClick={handleManualRedirect}
                            className="w-full h-12 rounded-xl group"
                            variant={isConfirmed ? "default" : "outline"}
                        >
                            {isConfirmed ? 'Go to My Booking' : 'Refresh Now'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;
