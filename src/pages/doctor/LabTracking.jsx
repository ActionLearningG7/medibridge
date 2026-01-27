/**
 * DoctorLabTracking Page
 * Real-time tracking of prescribed lab order collection
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, WifiOff } from 'lucide-react';
import { useGetDoctorOrderDetailQuery } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Toast } from '../../ui';
import { TrackingMap } from '../../components/lab/TrackingMap';
import { TaskStatusStepper } from '../../components/lab/TaskStatusStepper';
import { StatusBanner } from '../../components/lab/StatusBanner';
import { StatusTimeline } from '../../components/lab/StatusTimeline';

export default function DoctorLabTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);
  const wsRef = useRef(null);

  // State
  const [trackingData, setTrackingData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Fetch order details
  const { data: order, isLoading: orderLoading, error: orderError } = useGetDoctorOrderDetailQuery(orderId);

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Fetch tracking data
  const fetchTrackingData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/doctors/lab-orders/${orderId}/tracking`
      );
      if (!response.ok) throw new Error('Failed to fetch tracking data');
      const data = await response.json();
      setTrackingData(data);
      setWsError(false);
    } catch (error) {
      console.error('Fetch tracking error:', error);
      showToast('error', 'Failed to load tracking data');
    }
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.REACT_APP_WS_BASE_URL || `${wsProtocol}//${window.location.host}`;
      const wsUrl = `${wsHost}/ws/doctors/lab-orders/${orderId}/tracking`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        setWsError(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setTrackingData((prev) => ({
            ...prev,
            ...update,
            timestamp: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Failed to parse WS message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError(true);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsError(true);
    }
  };

  // Initialize tracking
  useEffect(() => {
    fetchTrackingData();
    connectWebSocket();

    // Setup polling fallback
    const pollInterval = parseInt(process.env.REACT_APP_TRACKING_POLL_MS || '15000');
    pollIntervalRef.current = setInterval(() => {
      if (!wsConnected) {
        fetchTrackingData();
      }
    }, pollInterval);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId]);

  // Handle reconnect
  const handleReconnect = () => {
    setWsError(false);
    connectWebSocket();
    fetchTrackingData();
    showToast('info', 'Attempting to reconnect...');
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTrackingData();
    showToast('info', 'Refreshing...');
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Track Order" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-96 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Track Order" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load order</p>
            <Button variant="outline" onClick={() => navigate('/doctors/lab-orders')} className="mt-4">
              Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const hasCollectionTask = trackingData?.taskId || order?.phlebotomistAssignment;
  const taskStatus = trackingData?.taskStatus || order?.phlebotomistAssignment?.status;
  const patientLocation = trackingData?.patientLocation || order?.address?.coordinates;
  const phlebotomistLocation = trackingData?.phlebotomistLocation;
  const route = trackingData?.route;
  const eta = trackingData?.eta;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Track Collection" subtitle="Real-time tracking of patient lab sample collection" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/doctors/lab-orders/${orderId}`)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order Details
        </button>

        {/* WebSocket status */}
        {wsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Connection Lost</p>
                <p className="text-sm text-red-700">Using polling fallback</p>
              </div>
            </div>
            <Button size="sm" onClick={handleReconnect}>
              Reconnect
            </Button>
          </div>
        )}

        {/* Refresh button */}
        <div className="mb-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* No collection task */}
        {!hasCollectionTask && (
          <Card className="mb-6 p-6 text-center">
            <p className="text-lg font-semibold text-gray-900">No Collection Task</p>
            <p className="text-gray-600 mt-2">
              No phlebotomist has been assigned to this order yet.
            </p>
          </Card>
        )}

        {hasCollectionTask && trackingData && (
          <div className="space-y-6">
            <StatusBanner status={taskStatus} eta={eta} />

            <Card>
              <CardContent className="p-0">
                <TrackingMap
                  patientLocation={patientLocation}
                  phlebotomistLocation={phlebotomistLocation}
                  polylinePoints={route}
                  eta={eta}
                  isLoading={!trackingData}
                />
              </CardContent>
            </Card>

            <TaskStatusStepper currentStatus={taskStatus} failedStatus={trackingData?.failedStatus} />

            {trackingData?.phlebotomist && (
              <Card>
                <CardHeader>
                  <CardTitle>Phlebotomist Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{trackingData.phlebotomist.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${trackingData.phlebotomist.phone}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {trackingData.phlebotomist.phone}
                    </a>
                  </div>
                  {trackingData.phlebotomist.experience && (
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">{trackingData.phlebotomist.experience} years</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline events={trackingData?.events || order?.trackingEvents || []} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : toastState.type === 'error' ? 'Error' : 'Info'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
