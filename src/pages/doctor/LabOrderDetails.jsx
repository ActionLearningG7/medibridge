/**
 * DoctorLabOrderDetails Page
 * Detailed view of a doctor's prescribed lab order
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, User, Phone } from 'lucide-react';
import { useGetDoctorOrderDetailQuery } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Badge, Toast } from '../../ui';
import { StatusTimeline } from '../../components/lab/StatusTimeline';
import { LAB_ORDER_STATUS_LABELS } from '../../features/lab/constants';

export default function DoctorLabOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Fetch order details
  const { data: order, isLoading, error, refetch } = useGetDoctorOrderDetailQuery(orderId, {
    skip: !orderId,
  });

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Handle download report
  const handleDownloadReport = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_GATEWAY_BASE_URL}/doctors/lab-orders/${orderId}/report/download`, '_blank');
    } catch (error) {
      showToast('error', 'Failed to download report');
    }
  };

  // Early return if no orderId is provided
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" subtitle="Invalid order ID" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-yellow-700 font-semibold mb-2">No order ID provided</p>
              <p className="text-gray-600 mb-4">Please select an order from your orders list</p>
              <Button onClick={() => navigate('/doctor/labs/orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Order Details" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Order Details" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load order details</p>
            <p className="text-sm text-red-700 mt-2">{error?.data?.message || 'Please try again'}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/doctors/lab-orders')}>
                Back to Orders
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const statusLabel = LAB_ORDER_STATUS_LABELS[order.status] || order.status;
  const isReportReady = order.status === 'report_ready' || order.reportPublishedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Order Details" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/doctors/lab-orders')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* Header card */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <h1 className="text-3xl font-bold text-gray-900">#{order.id}</h1>
              </div>
              <Badge
                variant={
                  order.status === 'completed' || order.status === 'report_ready'
                    ? 'success'
                    : order.status === 'cancelled' || order.status === 'failed'
                    ? 'danger'
                    : 'warning'
                }
              >
                {statusLabel}
              </Badge>
            </div>

            {/* Actions */}
            <Button
              size="sm"
              onClick={() => navigate(`/doctors/lab-orders/${orderId}/tracking`)}
              className="flex items-center gap-2"
            >
              Track Delivery
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline events={order.trackingEvents || []} />
              </CardContent>
            </Card>

            {/* Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Tests Prescribed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.tests?.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-xs text-gray-600">{test.code}</p>
                      </div>
                      <p className="font-semibold text-primary-600">₹{test.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Section */}
            {isReportReady ? (
              <Card>
                <CardHeader>
                  <CardTitle>Test Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 mb-4">
                      Patient's test report is ready. You can view and download it below.
                    </p>
                    <Button onClick={handleDownloadReport} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Test Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Report not available yet. Tests are still being processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Amount summary */}
            <Card>
              <CardHeader>
                <CardTitle>Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.tax || 0}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    ₹{(order.totalPrice || 0) + (order.tax || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Patient Info */}
            {order.patient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium text-gray-900">{order.patient.fullName}</p>
                  <p className="text-gray-600">{order.patient.email}</p>
                  <a
                    href={`tel:${order.patient.phone}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {order.patient.phone}
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Address */}
            {order.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Collection Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium">{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                </CardContent>
              </Card>
            )}

            {/* Collection slot */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Slot</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {order.preferredSlotStart ? (
                  <>
                    <p className="font-medium">
                      {new Date(order.preferredSlotStart).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-600">
                      {new Date(order.preferredSlotStart).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {order.preferredSlotEnd && (
                        <>
                          {' - '}
                          {new Date(order.preferredSlotEnd).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">Collection slot not specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
