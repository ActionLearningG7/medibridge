/**
 * SOS Tracking - Patient Real-time Ambulance Tracking
 * Shows status timeline, ambulance details, live map with route, and cancel option
 * Polls request status every 5 seconds
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {
    useGetSOSByIdQuery,
    useCancelSOSMutation
} from '../../features/sos/sosApi';
import {
    selectActiveRequestId,
    selectPatientLocation,
    setDriverLocation,
    clearSOSState
} from '../../features/sos/sosSlice';
import { selectAccessToken } from '../../features/auth/authSlice';
import { SOSMap } from '../../components/sos/SOSMap';
import { Phone, Clock, Navigation, XCircle, CheckCircle, AlertCircle, Loader, MapPin } from 'lucide-react';

const STATUS_CONFIG = {
    SEARCHING: {
        step: 0,
        label: 'Finding Ambulance...',
        icon: '🔍',
        color: 'yellow'
    },
    ASSIGNED: {
        step: 1,
        label: 'Ambulance En Route',
        icon: '🚑',
        color: 'blue'
    },
    ARRIVED: {
        step: 2,
        label: 'Ambulance Arrived',
        icon: '✋',
        color: 'green'
    },
    PICKED_UP: {
        step: 3,
        label: 'Heading to Hospital',
        icon: '🏥',
        color: 'green'
    },
    COMPLETED: {
        step: 4,
        label: 'Trip Completed',
        icon: '✅',
        color: 'green'
    },
    CANCELLED: {
        step: -1,
        label: 'Request Cancelled',
        icon: '❌',
        color: 'red'
    }
};

export default function SOSTracking() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const requestId = useSelector(selectActiveRequestId);
    const patientLocation = useSelector(selectPatientLocation);
    const token = useSelector(selectAccessToken);
    const stompClientRef = useRef(null);

    const { data: sosRequest, error, isLoading, refetch } = useGetSOSByIdQuery(requestId, {
        skip: !requestId,
        pollingInterval: 5000,
    });

    const [cancelSOS, { isLoading: isCancelling }] = useCancelSOSMutation();
    const [eta, setEta] = useState({ distance: '', duration: '' });
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Local state to override API data with real-time updates
    const [liveStatus, setLiveStatus] = useState(null);

    // Initial driver location from API
    useEffect(() => {
        if (sosRequest && sosRequest.assignedAmbulance?.lastLat && sosRequest.assignedAmbulance?.lastLng) {
            dispatch(setDriverLocation({
                lat: sosRequest.assignedAmbulance.lastLat,
                lng: sosRequest.assignedAmbulance.lastLng
            }));
        }
    }, [sosRequest, dispatch]);

    // WebSocket Connection
    useEffect(() => {
        if (!requestId || !token) return;

        console.log('Connecting to WebSocket for SOS Tracking:', requestId);

        const socket = new SockJS('http://localhost:8080/ws-sos');
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                // console.log(str)
            },
            onConnect: () => {
                console.log('Connected to SOS Tracking WebSocket');

                client.subscribe(`/topic/sos/incidents/${requestId}/tracking`, (message) => {
                    if (message.body) {
                        const update = JSON.parse(message.body);
                        console.log('Live Update Received:', update);

                        if (update.status) {
                            setLiveStatus(update.status);
                        }

                        if (update.ambulanceLocation) {
                            dispatch(setDriverLocation({
                                lat: update.ambulanceLocation.latitude,
                                lng: update.ambulanceLocation.longitude
                            }));
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [requestId, token, dispatch]);

    // Handle errors and redirects
    useEffect(() => {
        if (!requestId) {
            navigate('/patient/sos');
            return;
        }

        if (error) {
            if (error.status === 404) {
                dispatch(clearSOSState());
                navigate('/patient/sos');
            }
        }
    }, [requestId, error, dispatch, navigate]);

    const handleCancel = async () => {
        try {
            await cancelSOS(requestId).unwrap();
            dispatch(clearSOSState());
            navigate('/patient/sos');
        } catch (err) {
            console.error('Failed to cancel SOS:', err);
            alert('Could not cancel request. Please try again.');
        }
    };

    const handleReturn = () => {
        dispatch(clearSOSState());
        navigate('/patient/dashboard');
    };

    if (!sosRequest) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading tracking information...</p>
                </div>
            </div>
        );
    }

    const currentStatus = liveStatus || sosRequest.status;
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.SEARCHING;
    const isCancelled = currentStatus === 'CANCELLED';
    const isCompleted = currentStatus === 'COMPLETED';
    const isActive = !isCancelled && !isCompleted;

    // Locations
    const startLocation = patientLocation || (sosRequest.pickupLat && sosRequest.pickupLng ? { lat: sosRequest.pickupLat, lng: sosRequest.pickupLng } : null);

    // Safety check for driver location from assigned ambulance
    const ambulance = sosRequest.assignedAmbulance;
    const driverLocation = ambulance && ambulance.lastLat && ambulance.lastLng
        ? { lat: ambulance.lastLat, lng: ambulance.lastLng }
        : null;

    // Timeline steps
    const steps = [
        { status: 'SEARCHING', label: 'Request Sent', completed: config.step >= 0 },
        { status: 'ASSIGNED', label: 'Driver Assigned', completed: config.step >= 1 },
        { status: 'ARRIVED', label: 'Arrived', completed: config.step >= 2 },
        { status: 'PICKED_UP', label: 'En Route', completed: config.step >= 3 },
        { status: 'COMPLETED', label: 'Completed', completed: config.step >= 4 }
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm z-30 flex-shrink-0">
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Emergency Response Tracking</h1>
                        <p className="text-sm text-gray-600">Request ID: <span className="font-mono">{sosRequest.id.split('-')[0]}...</span></p>
                    </div>
                    <div className="flex gap-2">
                        {isActive && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                disabled={isCancelling}
                                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 text-sm"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                        {(isCompleted || isCancelled) && (
                            <button
                                onClick={handleReturn}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Map Section - Takes available space */}
                <div className="flex-1 relative h-full bg-gray-200">
                    <SOSMap
                        patientLocation={startLocation}
                        ambulanceLocation={driverLocation}
                        onRouteUpdate={setEta}
                    />

                    {/* OVERLAY: Collapsible Ambulance Details */}
                    {ambulance && sosRequest.status !== 'SEARCHING' && (
                        <div className="absolute top-4 left-4 z-10 w-80">
                            <details className="group bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xl overflow-hidden transition-all open:ring-2 open:ring-blue-100" open>
                                <summary className="px-5 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 flex items-center justify-between cursor-pointer list-none select-none hover:bg-blue-50/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🚑</span>
                                        <h3 className="font-bold text-gray-900">Ambulance Details</h3>
                                    </div>
                                    <div className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                                        ▼
                                    </div>
                                </summary>

                                <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                                    {/* Driver Row */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0 shadow-sm border border-blue-200">
                                            {ambulance.driverUserId ? ambulance.driverUserId.charAt(0).toUpperCase() : 'D'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Driver Name</p>
                                            <p className="text-base font-bold text-gray-900 truncate" title={ambulance.driverUserId}>
                                                {ambulance.driverUserId || 'Assigned Driver'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Vehicle Row */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl flex-shrink-0 shadow-sm border border-gray-200">
                                            🚐
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle Number</p>
                                            <div className="font-mono text-xl font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded px-3 py-1 inline-block">
                                                {ambulance.registrationNumber || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {ambulance.contactPhone && (
                                        <div className="pt-1">
                                            <a
                                                href={`tel:${ambulance.contactPhone}`}
                                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 active:bg-green-800 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                                            >
                                                <Phone className="w-5 h-5" />
                                                Call Driver
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Panel */}
                <div className="w-80 md:w-96 bg-white border-l border-gray-200 shadow-2xl z-20 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 h-full">
                    {/* Status Card */}
                    <div className={`
                        rounded-xl p-5 border-l-4 shadow-sm
                        ${isCancelled ? 'bg-red-50 border-red-500' : isCompleted ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}
                    `}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Current Status</p>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {config.icon} {config.label}
                                </h2>
                            </div>
                        </div>

                        {/* ETA Display */}
                        {eta.duration && isActive && driverLocation && (
                            <div className="bg-white/60 rounded-lg p-3 flex items-center gap-3 border border-gray-200/50 backdrop-blur-sm">
                                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-600 font-medium uppercase">Estimated Arrival</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-blue-900">{eta.duration}</span>
                                        <span className="text-xs text-gray-500">({eta.distance})</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Tracking Timeline
                        </h3>
                        <div className="space-y-0 relative">
                            {/* Vertical Line Background */}
                            <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-gray-100 z-0"></div>

                            {steps.map((step, idx) => (
                                <div key={step.status} className="relative z-10 flex gap-4 pb-6 last:pb-0">
                                    {/* Timeline Circle */}
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border-2
                                        transition-colors duration-300
                                        ${step.completed
                                            ? 'bg-green-500 border-green-500 text-white shadow-md'
                                            : idx === config.step
                                                ? 'bg-blue-100 border-blue-500 text-blue-700 animate-pulse' // Current step
                                                : 'bg-white border-gray-200 text-gray-300'
                                        }
                                    `}>
                                        {step.completed ? '✓' : idx + 1}
                                    </div>

                                    {/* Label */}
                                    <div className="pt-1">
                                        <p className={`
                                            text-sm font-semibold transition-colors
                                            ${step.completed ? 'text-green-700' : idx === config.step ? 'text-blue-700' : 'text-gray-400'}
                                        `}>
                                            {step.label}
                                        </p>
                                        {idx === config.step && isActive && (
                                            <p className="text-xs text-blue-500 mt-1">
                                                In Progress...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-red-50 px-6 py-6 text-center border-b border-red-200">
                            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-gray-900">Cancel SOS Request?</h3>
                        </div>

                        <div className="px-6 py-6 space-y-6">
                            <p className="text-gray-700">
                                Are you sure you want to cancel this emergency request? The ambulance may already be on the way.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Keep Request Active
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCancelConfirm(false);
                                        handleCancel();
                                    }}
                                    disabled={isCancelling}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        'Cancel SOS'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
