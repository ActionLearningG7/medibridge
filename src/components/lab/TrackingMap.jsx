import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Message, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 48.813893,
  lng: 2.365315
};

// SVG Paths (Material Design)
const ICON_PATHS = {
  // Hospital/Lab Building
  hospital: "M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
  // Patient (Home Pin)
  patient: "M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z",
  // Phlebotomist (Medical Transport/Car)
  phlebotomist: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
};

export const TrackingMap = ({
  hospitalLocation,
  patientLocation,
  phlebotomistLocation,
  isTracking,
  onRouteUpdate // Callback to parent with distance/duration
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [directions, setDirections] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const lastRouteParams = useRef({ origin: null, destination: null });
  const mapRef = useRef(null);

  // Construct Custom Icons
  const getIcon = (type) => {
    if (!isLoaded || !window.google) return null;

    const baseIcon = {
      path: ICON_PATHS[type],
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      anchor: new window.google.maps.Point(12, 12), // Center of 24x24 SVG
    };

    switch (type) {
      case 'hospital':
        return { ...baseIcon, fillColor: '#64748b', scale: 1.5 }; // Slate (Lab/Base)
      case 'patient':
        return { ...baseIcon, fillColor: '#ef4444', scale: 1.5, anchor: new window.google.maps.Point(12, 24) }; // Red Pin (Destination), anchored bottom
      case 'phlebotomist':
        return { ...baseIcon, fillColor: '#2563eb', scale: 1.5 }; // Blue Car (Active)
      default:
        return null;
    }
  };

  const logDebug = (msg, data) => {
    const timestamp = new Date().toLocaleTimeString();
    const payload = data ? JSON.stringify(data, (k, v) => (typeof v === 'number' ? v.toFixed(6) : v)) : '';
    const text = `[${timestamp}] ${msg} ${payload}`;
    console.log(msg, data); // Keep console
    setDebugLogs(prev => [text, ...prev].slice(0, 10)); // Keep last 10
  };


  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  // Routing Logic
  // Origin: Phlebotomist Location (if available) ELSE Hospital
  // Destination: Patient Location
  const origin = phlebotomistLocation || hospitalLocation;
  const destination = patientLocation;
  const mapCenter = origin || destination || defaultCenter;

  // Memoize Map Options
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    // style: [], // Could add custom map styles here for "Premium" look
  };

  useEffect(() => {
    if (isLoaded && origin && destination) {
      // Validate coordinates
      if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        logDebug('⚠️ Invalid Coords', { origin, destination });
        return;
      }

      // Check if coordinates changed meaningfully (e.g. > 0.0001 diff ~ 11 meters)
      const prev = lastRouteParams.current;
      const isSameOrigin = prev.origin && Math.abs(prev.origin.lat - origin.lat) < 0.0001 && Math.abs(prev.origin.lng - origin.lng) < 0.0001;
      const isSameDest = prev.destination && Math.abs(prev.destination.lat - destination.lat) < 0.0001 && Math.abs(prev.destination.lng - destination.lng) < 0.0001;

      if (isSameOrigin && isSameDest) {
        return; // Skip update
      }

      logDebug('📍 Calculating', {
        from: `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`,
        to: `${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`
      });

      lastRouteParams.current = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng }
      };

      const directionsService = new window.google.maps.DirectionsService();

      const originLatLng = new window.google.maps.LatLng(origin.lat, origin.lng);
      const destLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

      directionsService.route({
        origin: originLatLng,
        destination: destLatLng,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          logDebug('✅ Route OK', {
            dist: result.routes[0].legs[0].distance.text,
            dur: result.routes[0].legs[0].duration.text
          });
          setDirections(result);
          // Extract meta
          const leg = result.routes[0].legs[0];
          if (onRouteUpdate) {
            onRouteUpdate({
              distance: leg.distance.text,
              duration: leg.duration.text
            });
          }
        } else {
          logDebug(`❌ Route Failed: ${status}`);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative shadow-inner">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Markers */}
        {hospitalLocation && (
          <Marker
            position={hospitalLocation}
            icon={getIcon('hospital')}
            title="Hospital (Lab)"
          />
        )}

        {patientLocation && (
          <Marker
            position={patientLocation}
            icon={getIcon('patient')}
            title="Patient Location"
            animation={window.google.maps.Animation.DROP}
          />
        )}

        {phlebotomistLocation && (
          <Marker
            position={phlebotomistLocation}
            icon={getIcon('phlebotomist')}
            title="Phlebotomist"
            zIndex={100} // Keep on top
          />
        )}

        {/* Route Polyline */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // We draw our own custom markers
              polylineOptions: {
                strokeColor: "#2563eb", // Tailwind Blue-600 to match Brand
                strokeOpacity: 0.9,
                strokeWeight: 6
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
