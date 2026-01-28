/**
 * LabTracking Page - Patient
 * Real-time tracking of lab order collection with Google Maps
 * Data: GET /lab-orders/{orderId}/tracking + WebSocket updates
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, WifiOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../../features/auth/authSlice';
import { useGetPatientOrderDetailQuery } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Toast } from '../../ui';
import { TrackingMap } from '../../components/lab/TrackingMap';
import { TaskStatusStepper } from '../../components/lab/TaskStatusStepper';
import { StatusBanner } from '../../components/lab/StatusBanner';
import { StatusTimeline } from '../../components/lab/StatusTimeline';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function LabTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = useSelector(selectAccessToken);
  const pollIntervalRef = useRef(null);
  const stompClientRef = useRef(null);

  // State
  const [trackingData, setTrackingData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Fetch order details
  const { data: order, isLoading: orderLoading, error: orderError } = useGetPatientOrderDetailQuery(orderId);

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Fetch initial tracking data
  const fetchTrackingData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/lab-orders/${orderId}/tracking`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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

  // Connect to WebSocket using @stomp/stompjs
  const connectWebSocket = () => {
    try {
      // Deactivate existing client if any
      if (stompClientRef.current && stompClientRef.current.active) {
        stompClientRef.current.deactivate();
      }

      const socketUrl = process.env.REACT_APP_API_GATEWAY_BASE_URL
        ? `${process.env.REACT_APP_API_GATEWAY_BASE_URL.replace('/api/v1', '')}/ws-lab`
        : 'http://localhost:8080/ws-lab';

      // Create new client
      const client = new Client({
        // Use SockJS fallback factory
        webSocketFactory: () => new SockJS(socketUrl),

        // Debug
        // debug: function (str) {
        //   console.log(str);
        // },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          console.log('Connected to Tracking WebSocket');
          setWsConnected(true);
          setWsError(false);

          client.subscribe(`/topic/lab/orders/${orderId}/tracking`, (message) => {
            try {
              const update = JSON.parse(message.body);
              setTrackingData((prev) => ({
                ...prev,
                ...update,
                phlebotomistLocation: update.lastLocation,
                eta: update.estimatedArrivalMinutes ? `${update.estimatedArrivalMinutes} mins` : prev?.eta,
                timestamp: new Date().toISOString(),
              }));
            } catch (error) {
              console.error('Failed to parse tracking update:', error);
            }
          });
        },

        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          setWsError(true);
        },

        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setWsError(true);
          setWsConnected(false);
        },

        onDisconnect: () => {
          console.log('Disconnected');
          setWsConnected(false);
        }
      });

      client.activate();
      stompClientRef.current = client;

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
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
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

  // Check if tracking task exists
  const hasCollectionTask = trackingData?.taskId || order?.phlebotomistAssignment;
  const taskStatus = trackingData?.taskStatus || order?.phlebotomistAssignment?.status;

  // Helper to normalize coordinates
  const getCoordinates = React.useCallback((data) => {
    if (!data) return null;
    // Direct matches
    if (typeof data.lat === 'number' && typeof data.lng === 'number') return { lat: data.lat, lng: data.lng };
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') return { lat: data.latitude, lng: data.longitude };

    // Nested matches
    if (data.coordinates) return getCoordinates(data.coordinates);
    if (data.location) return getCoordinates(data.location);

    return null;
  }, []);

  const patientLocation = React.useMemo(() =>
    getCoordinates(trackingData?.patientLocation) ||
    getCoordinates(order?.address?.coordinates) ||
    getCoordinates(order?.address),
    [getCoordinates, trackingData?.patientLocation, order?.address]
  );

  const phlebotomistLocation = React.useMemo(() =>
    getCoordinates(trackingData?.phlebotomistLocation) ||
    getCoordinates(trackingData),
    [getCoordinates, trackingData]
  );

  const route = trackingData?.route;
  const eta = trackingData?.eta;

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
            <Button variant="outline" onClick={() => navigate('/lab/orders')} className="mt-4">
              Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Track Your Collection" subtitle="Real-time tracking of your lab sample collection" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/lab/orders/${orderId}`)}
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
            <p className="text-lg font-semibold text-gray-900">No Home Collection Task</p>
            <p className="text-gray-600 mt-2">
              This order doesn't have a home collection assignment yet.
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
