/**
 * useSosPinger Hook - Driver location updates
 * Continuously tracks driver GPS and updates backend every 5 seconds
 * Used in AmbulanceRequest component
 */
import { useEffect, useRef, useState } from 'react';
import { useUpdateDriverLocationMutation } from '../features/sos/sosApi';

const POSITION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 20000, // Increased to 20s
    maximumAge: 0
};

const PING_INTERVAL = 5000; // 5 seconds

export const useSosPinger = (incidentId, ambulanceId, organizationId, enabled = true) => {
    const [sendPing] = useUpdateDriverLocationMutation();
    const watchIdRef = useRef(null);
    const lastPingRef = useRef(0);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        if (!incidentId || !ambulanceId || !organizationId || !enabled) {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        const handlePosition = (position) => {
            const { latitude, longitude, accuracy, speed } = position.coords; // speed might be null
            const now = Date.now();

            // Update local state immediately
            setCurrentLocation({ lat: latitude, lng: longitude, accuracy });

            // Send to Backend (Throttled: every 5 seconds)
            if (now - lastPingRef.current > PING_INTERVAL) {
                sendPing({
                    incidentId,
                    ambulanceId,
                    organizationId,
                    latitude,
                    longitude,
                    accuracyMeters: accuracy,
                    speedKmh: speed ? speed * 3.6 : 0 // Convert m/s to km/h if available
                })
                    .unwrap()
                    .then(() => {
                        console.log('[SosPinger] Location ping sent', { latitude, longitude });
                    })
                    .catch(err => console.error('[SosPinger] Ping failed', err));

                lastPingRef.current = now;
            }
        };

        const handleError = (err) => {
            console.error('[SosPinger] Geolocation error', err);
            setError(err.message);
        };

        console.log('[SosPinger] Starting GPS watch...');
        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            POSITION_OPTIONS
        );

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [incidentId, ambulanceId, organizationId, enabled, sendPing]);

    return { currentLocation, error };
};
