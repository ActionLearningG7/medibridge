import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, WifiOff, Activity, Navigation, Phone, User, ShieldCheck, Clock, MapPin, Loader2, ChevronRight, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../../features/auth/authSlice';
import { useGetPatientOrderDetailQuery } from '../../features/lab/labApi';
import { Card, Button, Toast } from '../../ui';
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

  const [trackingData, setTrackingData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(false);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  const { data: order, isLoading: orderLoading, error: orderError } = useGetPatientOrderDetailQuery(orderId);

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prev => ({ ...prev, isOpen: false })), 5000);
  };

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/lab-orders/${orderId}/tracking`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Data sync failed');
      const data = await response.json();
      setTrackingData(data);
      setWsError(false);
    } catch (error) {
      showToast('error', 'Sync interruption detected');
    }
  };

  const connectWebSocket = () => {
    try {
      if (stompClientRef.current?.active) stompClientRef.current.deactivate();

      const socketUrl = process.env.REACT_APP_API_GATEWAY_BASE_URL
        ? `${process.env.REACT_APP_API_GATEWAY_BASE_URL.replace('/api/v1', '')}/ws-lab`
        : 'http://localhost:8080/ws-lab';

      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
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
              console.error('Parse error:', error);
            }
          });
        },
        onStompError: () => setWsError(true),
        onWebSocketError: () => { setWsError(true); setWsConnected(false); },
        onDisconnect: () => setWsConnected(false)
      });

      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      setWsError(true);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    connectWebSocket();
    const pollInterval = parseInt(process.env.REACT_APP_TRACKING_POLL_MS || '15000');
    pollIntervalRef.current = setInterval(() => { if (!wsConnected) fetchTrackingData(); }, pollInterval);
    return () => {
      stompClientRef.current?.deactivate();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId]);

  const handleReconnect = () => {
    setWsError(false);
    connectWebSocket();
    fetchTrackingData();
    showToast('info', 'Re-establishing live link...');
  };

  const getCoordinates = React.useCallback((data) => {
    if (!data) return null;
    if (typeof data.lat === 'number' && typeof data.lng === 'number') return { lat: data.lat, lng: data.lng };
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') return { lat: data.latitude, lng: data.longitude };
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

  const hasCollectionTask = trackingData?.taskId || order?.phlebotomistAssignment;
  const taskStatus = trackingData?.taskStatus || order?.phlebotomistAssignment?.status;

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Initializing Tracking Node...</p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="max-w-md w-full p-12 rounded-[3.5rem] border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Info className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Sync Restricted</h2>
          <Button onClick={() => navigate('/patient/labs/orders')} className="w-full h-14 rounded-2xl bg-primary-600 font-black">Return to Registry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <button
                onClick={() => navigate(`/patient/labs/orders/${orderId}`)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-colors group"
              >
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                Back to Manifest
              </button>
              <div>
                <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Satellite Collection Stream
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Live Tracking</h1>
              </div>
            </div>

            <div className="flex gap-3">
              <div className={`px-6 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${wsConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {wsConnected ? 'Live Link Active' : 'Offline Mode'}
              </div>
              <Button
                variant="outline"
                onClick={() => fetchTrackingData()}
                className="h-12 w-12 rounded-2xl border-2 border-gray-100 p-0 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!hasCollectionTask ? (
          <div className="bg-white rounded-[3.5rem] p-24 text-center border-2 border-gray-50 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Navigation className="w-12 h-12 text-gray-200" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Deployment Pending</h3>
            <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
              Diagnostic collection team hasn't been deployed yet. Monitoring will begin automatically once a specialist is assigned.
            </p>
            <Button onClick={() => navigate(`/patient/labs/orders/${orderId}`)} className="h-16 px-12 rounded-2xl bg-primary-600 font-black shadow-xl shadow-primary-100">View Status</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Map Area */}
            <div className="lg:col-span-2 space-y-10">
              <StatusBanner status={taskStatus} eta={trackingData?.eta} className="rounded-[3rem] shadow-xl" />

              <Card className="rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-lg border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-primary-50 rounded-2xl">
                      <Clock className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{trackingData?.eta || '-- mins'}</p>
                    </div>
                  </div>
                </div>

                <div className="h-[600px] bg-gray-100">
                  <TrackingMap
                    patientLocation={patientLocation}
                    phlebotomistLocation={phlebotomistLocation}
                    polylinePoints={trackingData?.route}
                    eta={trackingData?.eta}
                    isLoading={!trackingData}
                  />
                </div>
              </Card>

              <div className="bg-white rounded-[3rem] p-10 border-2 border-gray-50 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Deployment Phase</h3>
                </div>
                <TaskStatusStepper currentStatus={taskStatus} failedStatus={trackingData?.failedStatus} />
              </div>
            </div>

            {/* Sidebar Context */}
            <div className="space-y-10">
              {/* Specialist Info */}
              {trackingData?.phlebotomist && (
                <Card className="rounded-[3rem] p-10 border-2 border-gray-50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
                  <div className="relative space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-[1.75rem] border-4 border-white bg-gray-50 shadow-lg flex items-center justify-center text-3xl font-black text-gray-300">
                        {trackingData.phlebotomist.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-gray-900 leading-tight tracking-tight mb-1">{trackingData.phlebotomist.name}</h4>
                        <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] py-1 border-primary-100 text-primary-500">Clinical Specialist</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Status</p>
                        <p className="text-xs font-bold text-gray-900">Active Field Duty</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Exp.</p>
                        <p className="text-xs font-bold text-gray-900">{trackingData.phlebotomist.experience} Years Field</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = `tel:${trackingData.phlebotomist.phone}`}
                      className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-transform active:translate-y-0"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      Secure Audio Link
                    </Button>
                  </div>
                </Card>
              )}

              {/* Status Log */}
              <Card className="rounded-[3rem] p-10 border-2 border-gray-50 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Event Registry</h3>
                </div>
                <StatusTimeline events={trackingData?.events || order?.trackingEvents || []} />
              </Card>

              {/* Help & Support */}
              <div className="p-10 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100/50 space-y-4">
                <div className="flex items-center gap-2 text-blue-900 text-xs font-black uppercase tracking-widest mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  Safety Monitoring
                </div>
                <p className="text-[11px] font-bold text-blue-800 leading-relaxed opacity-70">
                  Collectors follow strict clinical hygiene protocols. All biometric samples are transported in climate-controlled diagnostic kits.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 pt-2">
                  Clinical Protocol
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Live Link' : 'System Alert'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
