/**
 * Custom hook for GPS location pinging
 * Captures driver location every 5 seconds and sends to backend
 */
import { useEffect, useRef } from 'react';
import { useSendLocationPingMutation } from '../../features/sos/sosApi';

const GPS_PING_INTERVAL = process.env.REACT_APP_GPS_PING_INTERVAL_MS || 5000;

export function useGpsPinger(ambulanceId, incidentId, organizationId, isActive = true) {
    const [sendPing, { isLoading }] = useSendLocationPingMutation();
    const intervalRef = useRef(null);
    const locationRef = useRef(null);

    useEffect(() => {
        if (!isActive || !ambulanceId || !organizationId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        const startLocationTracking = () => {
            if (!navigator.geolocation) {
                console.error('Geolocation not supported');
                return;
            }

            // Watch position for continuous updates
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    locationRef.current = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed,
                        heading: position.coords.heading,
                        altitude: position.coords.altitude,
                        timestamp: position.timestamp,
                    };
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );

            // Ping location periodically
            intervalRef.current = setInterval(async () => {
                if (locationRef.current) {
                    try {
                        await sendPing({
                            ambulanceId,
                            incidentId,
                            latitude: locationRef.current.latitude,
                            longitude: locationRef.current.longitude,
                            accuracyMeters: Math.round(locationRef.current.accuracy),
                            speedKmh: locationRef.current.speed ? locationRef.current.speed * 3.6 : null,
                            provider: 'GPS',
                            organizationId,
                        }).unwrap();
                    } catch (err) {
                        console.error('Error sending location ping:', err);
                    }
                }
            }, GPS_PING_INTERVAL);

            // Cleanup
            return () => {
                navigator.geolocation.clearWatch(watchId);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        };

        const cleanup = startLocationTracking();

        return () => {
            if (cleanup) cleanup();
        };
    }, [ambulanceId, incidentId, organizationId, isActive, sendPing]);

    return {
        location: locationRef.current,
        isLoading,
    };
}
