import { useEffect, useRef, useState } from 'react';
import { useUpdatePhlebotomyLocationPingMutation } from '../features/lab/labApi';
import { useDispatch } from 'react-redux';
import { updatePhlebotomistLocation } from '../features/tracking/trackingSlice';

const POSITION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
};

export const usePhlebotomistPinger = (taskId, isTrackingEnabled = false) => {
    const [sendPing] = useUpdatePhlebotomyLocationPingMutation();
    const dispatch = useDispatch();
    const watchIdRef = useRef(null);
    const lastPingRef = useRef(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!taskId || !isTrackingEnabled) {
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
            const { latitude, longitude, accuracy } = position.coords;
            const now = Date.now();

            // Local state update (Redux) for immediate UI feedback
            dispatch(updatePhlebotomistLocation({ lat: latitude, lng: longitude }));

            // Send to Backend (Throttled: every 5 seconds max)
            if (now - lastPingRef.current > 5000) {
                sendPing({
                    taskId,
                    latitude,
                    longitude,
                    accuracy,
                    timestamp: new Date().toISOString()
                })
                    .unwrap()
                    .then(() => {
                        console.log('Location ping sent', { latitude, longitude });
                    })
                    .catch(err => console.error('Ping failed', err));

                lastPingRef.current = now;
            }
        };

        const handleError = (err) => {
            console.error('Geolocation error', err);
            setError(err.message);
        };

        console.log('Starting Geolocation Watcher...');
        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            POSITION_OPTIONS
        );

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [taskId, isTrackingEnabled, dispatch, sendPing]);

    return { error };
};
