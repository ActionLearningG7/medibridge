import React, { useEffect, useState, useRef } from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';

/**
 * RouteLayer - Calculates and displays route polyline with ETA
 * Uses DirectionsService to draw route between origin and destination
 */
export const RouteLayer = ({ origin, destination, onRouteUpdate }) => {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);
  const lastRouteParams = useRef({ origin: null, destination: null });
  const updateThrottle = useRef(null);

  useEffect(() => {
    // Validate inputs
    if (!origin || !destination || !window.google) {
      return;
    }

    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      console.warn('RouteLayer: Invalid coordinates', { origin, destination });
      return;
    }

    // Throttle route calculations: only update if moved > 50m or 20s elapsed
    const prev = lastRouteParams.current;
    const isSameOrigin = prev.origin &&
      Math.abs(prev.origin.lat - origin.lat) < 0.0005 &&
      Math.abs(prev.origin.lng - origin.lng) < 0.0005; // ~50m
    const isSameDest = prev.destination &&
      Math.abs(prev.destination.lat - destination.lat) < 0.0001 &&
      Math.abs(prev.destination.lng - destination.lng) < 0.0001;

    if (isSameOrigin && isSameDest) {
      // Skip update - route hasn't changed significantly
      return;
    }

    // Clear previous throttle
    if (updateThrottle.current) {
      clearTimeout(updateThrottle.current);
    }

    // Throttle updates: wait 2 seconds before recalculating
    updateThrottle.current = setTimeout(() => {
      calculateRoute();
    }, 2000);

    return () => {
      if (updateThrottle.current) {
        clearTimeout(updateThrottle.current);
      }
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  const calculateRoute = () => {
    const directionsService = new window.google.maps.DirectionsService();

    const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);
    const destLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

    lastRouteParams.current = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng }
    };

    directionsService.route(
      {
        origin: originLatLng,
        destination: destLatLng,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setError(null);

          // Extract route metadata
          const leg = result.routes[0].legs[0];
          if (onRouteUpdate) {
            onRouteUpdate({
              distance: leg.distance.text,
              distanceValue: leg.distance.value, // in meters
              duration: leg.duration.text,
              durationValue: leg.duration.value, // in seconds
              eta: Math.ceil(leg.duration.value / 60) // in minutes
            });
          }

          console.log('✅ Route calculated:', {
            distance: leg.distance.text,
            duration: leg.duration.text
          });
        } else {
          console.error('❌ Route calculation failed:', status);
          setError(status);
          setDirections(null);
        }
      }
    );
  };

  if (error === 'ZERO_RESULTS') {
    return null; // Silently fail - no route available
  }

  if (!directions) {
    return null; // Loading or no route yet
  }

  return (
    <DirectionsRenderer
      directions={directions}
      options={{
        suppressMarkers: true, // We'll use custom markers
        polylineOptions: {
          strokeColor: '#3B82F6', // Blue route line
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      }}
    />
  );
};

export default RouteLayer;
