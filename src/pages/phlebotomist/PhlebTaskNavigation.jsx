import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TrackingMapShell } from '../../components/lab/tracking/TrackingMapShell';
import { MovingMarker } from '../../components/lab/tracking/MovingMarker';
import { RouteLayer } from '../../components/lab/tracking/RouteLayer';
import { selectAccessToken } from '../../features/auth/authSlice';
import { MapPin, Navigation, Phone, ExternalLink, Clock } from 'lucide-react';
import { Button } from '../../ui';

// Marker icons
const HOSPITAL_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/4320/4320371.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
};

const DESTINATION_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/3004/3004033.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
};

const MY_LOCATION_ICON = {
  url: "https://cdn-icons-png.flaticon.com/32/3004/3004052.png",
  scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : { width: 40, height: 40 }
};

const PhlebTaskNavigation = () => {
    const { taskId } = useParams();
    const token = useSelector(selectAccessToken);

    // State
    const [navigationContext, setNavigationContext] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null, eta: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);

    const watchIdRef = useRef(null);
    const pingThrottleRef = useRef(null);

    // Fetch navigation context on mount
    useEffect(() => {
        fetchNavigationContext();
    }, [taskId]);

    const fetchNavigationContext = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/phlebotomy/tasks/${taskId}/navigation-context`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load navigation context');
            }

            const data = await response.json();
            setNavigationContext(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching navigation context:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Start geolocation tracking
    useEffect(() => {
        if (!navigationContext || !taskId || !token) return;

        startLocationTracking();

        return () => {
            stopLocationTracking();
        };
    }, [navigationContext, taskId, token]);

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        setIsTrackingLocation(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    bearing: position.coords.heading
                };

                setMyLocation(newLocation);

                // Send location ping to backend (throttled)
                sendLocationPing(newLocation);
            },
            (err) => {
                console.error('Geolocation error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTrackingLocation(false);
    };

    const sendLocationPing = (location) => {
        // Throttle pings: max 1 per 5 seconds
        if (pingThrottleRef.current) {
            return; // Skip this ping
        }

        pingThrottleRef.current = setTimeout(() => {
            pingThrottleRef.current = null;
        }, 5000);

        // Send to backend
        fetch(
            `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/phlebotomy/tasks/${taskId}/location`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    accuracy: location.accuracy,
                    speed: location.speed,
                    bearing: location.bearing,
                    timestamp: new Date().toISOString()
                })
            }
        ).catch(err => {
            console.error('Failed to send location ping:', err);
        });
    };

    const handleRouteUpdate = useCallback((info) => {
        setRouteInfo(info);
    }, []);

    const openInGoogleMaps = () => {
        if (!navigationContext?.destination) return;

        const dest = navigationContext.destination;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    // Calculate map center
    const mapCenter = myLocation || navigationContext?.destination || { lat: 48.8566, lng: 2.3522 };
    const routeOrigin = myLocation || navigationContext?.hospital;
    const routeDestination = navigationContext?.destination;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-sm text-gray-600">Loading navigation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">Failed to load navigation</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button onClick={fetchNavigationContext} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Navigation</h1>
                        <p className="text-sm text-gray-500">Order #{navigationContext?.orderNumber?.substring(0, 8)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isTrackingLocation && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                Live Tracking
                            </span>
                        )}
                        <Button onClick={openInGoogleMaps} size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Google Maps
                        </Button>
                    </div>
                </div>
            </div>

            {/* ETA Bar */}
            {routeInfo.eta && (
                <div className="bg-blue-600 text-white px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="font-bold text-lg">{routeInfo.eta} min</span>
                        </div>
                        <span className="text-blue-200">•</span>
                        <span>{routeInfo.distance}</span>
                    </div>
                </div>
            )}

            <div className="flex-1 relative">
                {/* Map */}
                <TrackingMapShell center={mapCenter} zoom={15}>
                    {/* Hospital Marker */}
                    {navigationContext?.hospital && (
                        <MovingMarker
                            position={navigationContext.hospital}
                            icon={HOSPITAL_ICON}
                            title="Hospital"
                            animation="NONE"
                        />
                    )}

                    {/* Destination Marker */}
                    {navigationContext?.destination && (
                        <MovingMarker
                            position={navigationContext.destination}
                            icon={DESTINATION_ICON}
                            title="Patient Location"
                            animation="NONE"
                        />
                    )}

                    {/* My Location Marker */}
                    {myLocation && (
                        <MovingMarker
                            position={myLocation}
                            icon={MY_LOCATION_ICON}
                            title="My Location"
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


                {/* Bottom Info Card */}
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-64 overflow-y-auto">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">Patient Location</h3>
                            <div className="flex items-start text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                                <span>{navigationContext?.destination?.address || 'Destination address'}</span>
                            </div>
                        </div>
                        {navigationContext?.patientPhone && (
                            <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {navigationContext?.specialInstructions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs font-medium text-yellow-800 mb-1">Special Instructions</p>
                            <p className="text-sm text-yellow-900">{navigationContext.specialInstructions}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhlebTaskNavigation;
