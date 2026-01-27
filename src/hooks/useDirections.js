/**
 * Google Maps Directions API Hook
 * Fetches route, ETA, and distance between two points
 * Implements throttling to reduce API calls
 */
import { useState, useEffect, useRef } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const ROUTE_RECALC_THROTTLE_TIME = 20000; // 20 seconds
const MOVEMENT_THRESHOLD = 50; // 50 meters

export function useDirections(
    origin,
    destination,
    travelMode = 'DRIVING',
    googleMapsApiKey
) {
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const lastUpdateRef = useRef(null);
    const lastLocationRef = useRef(null);
    const directionsServiceRef = useRef(null);

    useEffect(() => {
        if (!origin || !destination || !window.google) {
            return;
        }

        const fetchDirections = async () => {
            try {
                // Initialize DirectionsService if not already done
                if (!directionsServiceRef.current) {
                    directionsServiceRef.current = new window.google.maps.DirectionsService();
                }

                setIsLoading(true);
                setError(null);

                const request = {
                    origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                    destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                    travelMode: travelMode,
                    avoidHighways: false,
                    avoidTolls: false,
                };

                const result = await directionsServiceRef.current.route(request);

                if (result.routes && result.routes.length > 0) {
                    const route = result.routes[0];
                    const leg = route.legs[0];

                    setDirections(result);
                    setDistance(leg.distance);
                    setDuration(leg.duration);
                    lastUpdateRef.current = Date.now();
                    lastLocationRef.current = origin;
                } else {
                    setError('No route found');
                }
            } catch (err) {
                setError(err.message);
                console.error('Directions error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        // Check if we should update (throttling + movement threshold)
        const shouldUpdate = () => {
            const now = Date.now();
            const timeSinceLastUpdate = now - (lastUpdateRef.current || 0);

            if (timeSinceLastUpdate < ROUTE_RECALC_THROTTLE_TIME) {
                // Check if movement exceeds threshold
                if (lastLocationRef.current) {
                    const distanceMoved = haversineDistance(
                        lastLocationRef.current.lat,
                        lastLocationRef.current.lng,
                        origin.lat,
                        origin.lng
                    );

                    if (distanceMoved < MOVEMENT_THRESHOLD) {
                        return false;
                    }
                }
            }

            return true;
        };

        if (shouldUpdate()) {
            fetchDirections();
        }

    }, [origin, destination, travelMode]);

    return {
        directions,
        distance: distance ? {
            text: distance.text,
            value: distance.value,
            km: (distance.value / 1000).toFixed(2),
        } : null,
        duration: duration ? {
            text: duration.text,
            value: duration.value,
            minutes: Math.ceil(duration.value / 60),
        } : null,
        error,
        isLoading,
    };
}

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Component for rendering directions on map
 */
export function DirectionsDisplay({ directions, suppressPolylines = false, suppressMarkers = false }) {
    if (!directions) {
        return null;
    }

    return (
        <DirectionsRenderer
            directions={directions}
            options={{
                suppressPolylines,
                suppressMarkers,
                polylineOptions: {
                    strokeColor: '#3B82F6',
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                },
            }}
        />
    );
}
