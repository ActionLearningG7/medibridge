import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Card, CardContent, Button } from '../../ui';

const PaymentCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ref = searchParams.get('ref');
    const id = searchParams.get('id');

    const handleRetry = () => {
        if (ref === 'APPOINTMENT') {
            navigate('/patient/appointments');
        } else if (ref === 'LAB_ORDER') {
            navigate('/patient/labs/booking');
        } else {
            navigate('/patient/dashboard');
        }
    };

    const handleContactSupport = () => {
        // In a real app, this would open support chat or page
        window.alert("Please contact support at support@medibridge.com");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            {/* Background Blobs for Premium Feel */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-100/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px] pointer-events-none" />

            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Cancel Header Gradient */}
                <div className="h-2 bg-gradient-to-r from-red-400 to-orange-500" />

                <CardContent className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-red-50 p-4 rounded-full">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
                        <p className="text-gray-500">
                            The payment process was cancelled or timed out. Don't worry, no funds were deducted.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">What happened?</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <span>You clicked 'Cancel' on the payment screen.</span>
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <span>The payment session expired.</span>
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <span>There was a connectivity issue with the provider.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button
                            onClick={handleRetry}
                            className="w-full h-12 rounded-xl group flex items-center justify-center gap-2"
                            variant="default"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Try Again
                        </Button>

                        <Button
                            onClick={handleContactSupport}
                            className="w-full h-12 rounded-xl border-gray-200"
                            variant="outline"
                        >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Contact Support
                        </Button>
                    </div>

                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCancel;
