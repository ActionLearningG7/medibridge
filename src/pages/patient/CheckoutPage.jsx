import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useInitiateCheckoutMutation, useGetInvoiceByIdQuery } from '../../features/payment/paymentApi';
import { Card, CardHeader, CardTitle, CardContent, Button, Toast } from '../../ui';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';

const CheckoutPage = () => {
    const { invoiceId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const returnTo = searchParams.get('returnTo') || '/patient/dashboard';

    const [initiateCheckout, { isLoading: isInitiating }] = useInitiateCheckoutMutation();
    const { data: invoice, isLoading: isLoadingInvoice } = useGetInvoiceByIdQuery(invoiceId);

    const [checkoutData, setCheckoutData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        const startCheckout = async () => {
            if (hasRedirected) return;

            try {
                const result = await initiateCheckout({
                    invoiceId,
                    successUrl: window.location.origin + returnTo,
                    cancelUrl: window.location.href
                }).unwrap();

                if (result.checkoutUrl) {
                    setHasRedirected(true);
                    showToast.info('Redirecting to secure payment...');
                    window.location.href = result.checkoutUrl;
                } else {
                    setCheckoutData(result);
                }
            } catch (err) {
                console.error('Failed to initiate checkout:', err);
                showToast.error('Failed to initiate checkout. Please try again.');
            }
        };

        if (invoiceId && !isInitiating && !checkoutData && !hasRedirected) {
            startCheckout();
        }
    }, [invoiceId, initiateCheckout, returnTo, showToast, isInitiating, checkoutData, hasRedirected]);

    // Handle simulator only if not redirecting
    const handlePlaceholderPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            showToast.success('Payment successful! Redirecting...');
            setTimeout(() => {
                navigate(returnTo);
            }, 2000);
        }, 2000);
    };

    if (isLoadingInvoice || isInitiating || hasRedirected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">
                    {hasRedirected ? 'Redirecting to secure payment...' : 'Preparing secure checkout...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Please do not refresh the page.</p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto mt-20">
                <Card className="text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">Payment Successful!</CardTitle>
                    <p className="text-gray-600 mb-6">
                        Your payment for invoice #{invoice?.invoiceNumber} has been processed successfully.
                    </p>
                    <p className="text-sm text-gray-500">Redirecting you back...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between mb-4 border-b pb-4">
                                <div>
                                    <p className="font-medium text-gray-900">Invoice #{invoice?.invoiceNumber}</p>
                                    <p className="text-sm text-gray-500">{invoice?.description}</p>
                                </div>
                                <span className="text-gray-900 font-semibold">EUR {invoice?.totalAmount}</span>
                            </div>

                            {invoice?.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm mb-2 text-gray-600">
                                    <span>{item.description} (x{item.quantity})</span>
                                    <span>EUR {item.unitPrice * item.quantity}</span>
                                </div>
                            ))}

                            <div className="mt-6 pt-4 border-t flex justify-between items-center text-lg font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary-600">EUR {invoice?.totalAmount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secure Payment */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Secure Payment</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="h-5 w-5 text-primary-600" />
                                    <span className="font-medium">Credit/Debit Card</span>
                                </div>
                                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                                    {checkoutData?.clientSecret ? (
                                        <p>Stripe Elements would be integrated here using the client secret.</p>
                                    ) : (
                                        <p>Secure payment simulator active.</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePlaceholderPayment}
                                disabled={isProcessing}
                                loading={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Pay EUR ${invoice?.totalAmount}`}
                            </Button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <CheckCircle className="h-3 w-3" />
                                <span>PCI-DSS Compliant Secure Payment</span>
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 rounded-lg flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <p className="text-xs text-blue-800">
                                    Your payment details are encrypted. We never store your credit card information on our servers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
