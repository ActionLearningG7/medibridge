import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { TrackingMapShell } from '../../components/lab/tracking/TrackingMapShell';
import { MovingMarker } from '../../components/lab/tracking/MovingMarker';
import { RouteLayer } from '../../components/lab/tracking/RouteLayer';
import { selectAccessToken } from '../../features/auth/authSlice';
import { Phone, Clock, MapPin, Navigation } from 'lucide-react';
import { Button } from '../../ui';

// Marker icons
const HOSPITAL_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/4320/4320371.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
};

const PATIENT_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/3004/3004033.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
};

const PHLEBOTOMIST_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/3004/3004052.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : { width: 40, height: 40 }
};

const LabOrderTracking = () => {
    const { orderId } = useParams();
    const token = useSelector(selectAccessToken);

    // State
    const [trackingContext, setTrackingContext] = useState(null);
    const [phlebLiveLocation, setPhlebLiveLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null, eta: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tracking context on mount
    useEffect(() => {
        fetchTrackingContext();
    }, [orderId]);

    const fetchTrackingContext = async () => {
        try {
            setLoading(true);
            const url = `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/lab-orders/${orderId}/tracking-context`;
            console.log('🔍 Fetching tracking context from:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`Failed to load tracking context: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Tracking context received:', JSON.stringify(data, null, 2));

            // Log each property
            console.log('Hospital location:', data.hospitalLocation);
            console.log('Destination location:', data.destinationLocation);
            if (data.destinationLocation) {
                console.log('  → Address:', data.destinationLocation.address);
                console.log('  → Lat:', data.destinationLocation.lat);
                console.log('  → Lng:', data.destinationLocation.lng);
            }
            console.log('Phlebotomist:', data.phlebotomist);

            setTrackingContext(data);
            setError(null);
        } catch (err) {
            console.error('❌ Error fetching tracking context:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // WebSocket connection for live location updates
    useEffect(() => {
        if (!orderId || !token) return;

        const socket = new SockJS(`${process.env.REACT_APP_LAB_SERVICE_BASE_URL}/ws-lab`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                'X-Authorization': `Bearer ${token}`
            },
            debug: (str) => {
                console.log('[WS]', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('✅ Connected to tracking WebSocket');

            // Subscribe to order tracking updates
            client.subscribe(`/topic/lab/orders/${orderId}/tracking`, (message) => {
                if (message.body) {
                    const update = JSON.parse(message.body);
                    console.log('📍 Live location update:', update);

                    // Update phlebotomist live location
                    if (update.lastLocation) {
                        setPhlebLiveLocation({
                            lat: update.lastLocation.latitude,
                            lng: update.lastLocation.longitude
                        });
                    }

                    // Update hospital/destination if included in broadcast
                    if (update.hospitalLocation || update.patientLocation) {
                        setTrackingContext(prev => ({
                            ...prev,
                            hospitalLocation: update.hospitalLocation ? {
                                lat: update.hospitalLocation.latitude,
                                lng: update.hospitalLocation.longitude
                            } : prev?.hospitalLocation,
                            destinationLocation: update.patientLocation ? {
                                lat: update.patientLocation.latitude,
                                lng: update.patientLocation.longitude
                            } : prev?.destinationLocation
                        }));
                    }
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('❌ WebSocket error:', frame);
        };

        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [orderId, token]);

    const handleRouteUpdate = useCallback((info) => {
        setRouteInfo(info);
    }, []);

    // Load mock data for testing
    const loadMockData = () => {
        console.log('📦 Loading mock tracking data...');
        setTrackingContext({
            hospitalLocation: {
                lat: 48.8566,
                lng: 2.3522,
                address: 'MediBridge Central Hospital, Paris'
            },
            destinationLocation: {
                lat: 48.8606,
                lng: 2.3376,
                address: '123 Patient Street, Paris'
            },
            phlebotomist: {
                id: 'mock-phleb-1',
                name: 'Test Phlebotomist',
                phone: '+33-1-234-5678'
            },
            status: 'EN_ROUTE',
            estimatedArrivalMinutes: 15
        });

        // Mock live location after 2 seconds
        setTimeout(() => {
            setPhlebLiveLocation({
                lat: 48.8586,
                lng: 2.3449
            });
        }, 2000);
    };

    // Calculate map center and origin for routing
    const mapCenter = phlebLiveLocation || trackingContext?.hospitalLocation || trackingContext?.destinationLocation || { lat: 48.8566, lng: 2.3522 };
    const routeOrigin = phlebLiveLocation || trackingContext?.hospitalLocation;
    const routeDestination = trackingContext?.destinationLocation;

    // Check if we're missing critical data
    const missingData = trackingContext && (!trackingContext.hospitalLocation || !trackingContext.destinationLocation);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-sm text-gray-600">Loading tracking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">Failed to load tracking</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button onClick={fetchTrackingContext} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm z-10">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Live Tracking</h1>
                        <p className="text-sm text-gray-500">Order #{orderId?.substring(0, 8)}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                            {trackingContext?.status || 'In Transit'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row relative">
                {/* Missing Data Warning */}
                {missingData && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-md">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Missing Coordinates:</strong> This order doesn't have location data yet.
                                    </p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={loadMockData}
                                            className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-3 py-1 rounded hover:bg-yellow-500"
                                        >
                                            Load Test Data
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Area */}
                <div className="flex-1 relative min-h-[50vh]">
                    <TrackingMapShell center={mapCenter} zoom={14}>
                        {/* Hospital Marker */}
                        {trackingContext?.hospitalLocation && (
                            <MovingMarker
                                position={trackingContext.hospitalLocation}
                                icon={HOSPITAL_ICON}
                                title="Hospital"
                                animation="NONE"
                            />
                        )}

                        {/* Patient/Destination Marker */}
                        {trackingContext?.destinationLocation && (
                            <MovingMarker
                                position={trackingContext.destinationLocation}
                                icon={PATIENT_ICON}
                                title="Destination"
                                animation="NONE"
                            />
                        )}

                        {/* Phlebotomist Live Marker */}
                        {phlebLiveLocation && (
                            <MovingMarker
                                position={phlebLiveLocation}
                                icon={PHLEBOTOMIST_ICON}
                                title="Phlebotomist"
                                animation="SMOOTH"
                            />
                        )}

                        {/* Route Polyline */}
                        {routeOrigin && routeDestination && (
                            <RouteLayer
                                origin={routeOrigin}
                                destination={routeDestination}
                                onRouteUpdate={handleRouteUpdate}
                            />
                        )}
                    </TrackingMapShell>
                </div>

                {/* Info Card (Sidebar) */}
                <div className="bg-white p-6 shadow-lg lg:w-96 border-l border-gray-200 z-20 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Delivery Status</h3>

                    {/* ETA Card */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-700 font-medium flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> ETA
                            </span>
                            <span className="text-2xl font-bold text-blue-900">
                                {routeInfo.eta ? `${routeInfo.eta} min` : '--'}
                            </span>
                        </div>
                        <p className="text-sm text-blue-600">
                            {routeInfo.distance ? `${routeInfo.distance} away` : 'Calculating route...'}
                        </p>
                    </div>

                    {/* Phleb Info */}
                    {trackingContext?.phlebotomist && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Phlebotomist</h4>
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Navigation className="h-5 w-5" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{trackingContext.phlebotomist.name}</p>
                                    <p className="text-xs text-gray-500">Verified Partner</p>
                                </div>
                                {trackingContext.phlebotomist.phone && (
                                    <Button variant="ghost" size="sm">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {trackingContext?.destinationLocation && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Destination</h4>
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-sm text-gray-900">{trackingContext.destinationLocation.address || 'Delivery Address'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabOrderTracking;
