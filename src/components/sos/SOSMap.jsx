import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%' // Ensure parent container has defined height
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090 // New Delhi Default
};

// SVG Paths
const ICON_PATHS = {
    // Ambulance (Truck/Van style)
    ambulance: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
    // Patient (Person/Pin)
    patient: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
};

export const SOSMap = ({
    patientLocation,
    ambulanceLocation,
    onRouteUpdate // (dist, dur) => {}
}) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-sos',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    const [directions, setDirections] = useState(null);
    const lastRouteParams = useRef({ origin: null, destination: null });
    const mapRef = useRef(null);

    const getIcon = (type) => {
        if (!isLoaded || !window.google) return null;
        const baseIcon = {
            path: ICON_PATHS[type],
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 1.5,
        };

        if (type === 'ambulance') {
            return {
                ...baseIcon,
                fillColor: '#dc2626', // Red-600 for Ambulance
                anchor: new window.google.maps.Point(12, 12)
            };
        }
        if (type === 'patient') {
            return {
                ...baseIcon,
                fillColor: '#2563eb', // Blue-600 for Patient 
                anchor: new window.google.maps.Point(12, 24)
            };
        }
        return null;
    };

    const onLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    // Update Route when positions change
    useEffect(() => {
        if (isLoaded && patientLocation && ambulanceLocation) {
            // Basic check to see if we need to re-route
            const origin = ambulanceLocation;
            const destination = patientLocation;

            // Throttle checking: simple check if moved > 0.0001
            const prev = lastRouteParams.current;
            const isSameOrigin = prev.origin && Math.abs(prev.origin.lat - origin.lat) < 0.0001 && Math.abs(prev.origin.lng - origin.lng) < 0.0001;
            const isSameDest = prev.destination && Math.abs(prev.destination.lat - destination.lat) < 0.0001 && Math.abs(prev.destination.lng - destination.lng) < 0.0001;

            if (isSameOrigin && isSameDest) return;

            lastRouteParams.current = {
                origin: { ...origin },
                destination: { ...destination }
            };

            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route({
                origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    if (onRouteUpdate && result.routes[0]?.legs[0]) {
                        const leg = result.routes[0].legs[0];
                        onRouteUpdate({
                            distance: leg.distance.text,
                            duration: leg.duration.text
                        });
                    }
                } else {
                    console.error("SOS Route calculation failed:", status);
                }
            });
        }
    }, [isLoaded, patientLocation, ambulanceLocation, onRouteUpdate]);

    if (!isLoaded) return <div className="p-4 text-center bg-gray-100 rounded">Loading Maps...</div>;

    const center = ambulanceLocation || patientLocation || defaultCenter;

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true
                }}
            >
                {ambulanceLocation && (
                    <Marker
                        position={ambulanceLocation}
                        icon={getIcon('ambulance')}
                        title="Ambulance"
                        zIndex={20}
                    />
                )}

                {patientLocation && (
                    <Marker
                        position={patientLocation}
                        icon={getIcon('patient')}
                        title="You are here"
                        zIndex={10}
                        animation={window.google.maps.Animation.DROP}
                    />
                )}

                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: '#dc2626', // Red route for emergency
                                strokeOpacity: 0.8,
                                strokeWeight: 5
                            }
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};
