import React, { useEffect, useState } from 'react';
import { Marker } from '@react-google-maps/api';

/**
 * MovingMarker - Animated marker that smoothly transitions between positions
 */
export const MovingMarker = ({ position, icon, title, animation = 'SMOOTH' }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!position) return;

    if (animation === 'SMOOTH' && currentPosition && window.google) {
      // Smooth animation between positions
      const steps = 50;
      const latStep = (position.lat - currentPosition.lat) / steps;
      const lngStep = (position.lng - currentPosition.lng) / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        setCurrentPosition({
          lat: currentPosition.lat + latStep * step,
          lng: currentPosition.lng + lngStep * step
        });

        if (step >= steps) {
          clearInterval(interval);
          setCurrentPosition(position);
        }
      }, 20); // 50 steps * 20ms = 1 second animation

      return () => clearInterval(interval);
    } else {
      // Jump to position immediately
      setCurrentPosition(position);
    }
  }, [position?.lat, position?.lng, animation]);

  if (!currentPosition) return null;

  return (
    <Marker
      position={currentPosition}
      icon={icon}
      title={title}
      onLoad={setMarker}
    />
  );
};

export default MovingMarker;
