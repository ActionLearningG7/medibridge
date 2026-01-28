import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { updatePhlebotomistLocation } from '../features/tracking/trackingSlice';
import { selectAccessToken } from '../features/auth/authSlice';

export const useLabTracking = (orderId) => {
    const dispatch = useDispatch();
    const token = useSelector(selectAccessToken);
    const clientRef = useRef(null);

    useEffect(() => {
        if (!orderId || !token) return;

        // Initialize Stomp Client
        const socket = new SockJS('http://localhost:8080/ws-lab'); // Connect to Lab Service WS
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                'X-Authorization': `Bearer ${token}`
            },
            debug: function (str) {
                // console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to Tracking WebSocket');

            // Subscribe to Order Tracking Topic
            // Backend: /topic/lab/orders/{orderId}/tracking
            client.subscribe(`/topic/lab/orders/${orderId}/tracking`, (message) => {
                if (message.body) {
                    const locationData = JSON.parse(message.body);
                    // locationData structure: { lat: number, lng: number, ... }
                    dispatch(updatePhlebotomistLocation({
                        lat: locationData.lat,
                        lng: locationData.lng
                    }));
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;

        // Cleanup
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [orderId, dispatch, token]);
};
