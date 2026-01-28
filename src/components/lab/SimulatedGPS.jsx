/**
 * SimulatedGPS Component
 * Manual GPS input for web testing without real device GPS
 */

import React, { useState } from 'react';
import { MapPin, Send } from 'lucide-react';
import { Button, Input, Card } from '../../ui';

export const SimulatedGPS = ({
  isTracking,
  onSendPing,
  isLoading,
  lastPingTime,
  lastPingStatus,
}) => {
  const [latitude, setLatitude] = useState('48.813893');
  const [longitude, setLongitude] = useState('2.365315');
  const [autoRoute, setAutoRoute] = useState(false);
  const [routeIndex, setRouteIndex] = useState(0);

  // Example route simulation (Le Kremlin-Bicêtre -> Patient)
  const demoRoute = [
    { latitude: 48.813893, longitude: 2.365315 },
    { latitude: 48.814500, longitude: 2.366000 },
    { latitude: 48.815200, longitude: 2.366800 },
    { latitude: 48.816000, longitude: 2.367500 },
    { latitude: 48.817000, longitude: 2.368500 },
  ];

  const handleSendPing = async () => {
    await onSendPing({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
  };

  const handleFollowRoute = async () => {
    if (autoRoute && routeIndex < demoRoute.length) {
      const nextPoint = demoRoute[routeIndex];
      setLatitude(nextPoint.latitude.toString());
      setLongitude(nextPoint.longitude.toString());
      await onSendPing(nextPoint);
      setRouteIndex((routeIndex + 1) % demoRoute.length);
    }
  };

  React.useEffect(() => {
    let interval;
    if (autoRoute && isTracking) {
      interval = setInterval(handleFollowRoute, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRoute, isTracking]); // Removed routeIndex to prevent effect re-running

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Simulated GPS (Web Only)</h3>
      </div>

      <div className="space-y-4">
        {/* Latitude Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <Input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            disabled={!isTracking || isLoading}
            placeholder="48.813893"
          />
        </div>

        {/* Longitude Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <Input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            disabled={!isTracking || isLoading}
            placeholder="2.365315"
          />
        </div>

        {/* Send Ping Button */}
        <Button
          onClick={handleSendPing}
          disabled={!isTracking || isLoading}
          loading={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send Ping
        </Button>

        {/* Follow Route Toggle */}
        <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRoute}
            onChange={(e) => setAutoRoute(e.target.checked)}
            disabled={!isTracking || isLoading}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Follow demo route (every 5 seconds)</span>
        </label>

        {/* Last Ping Info */}
        {lastPingTime && (
          <div className="p-3 bg-white rounded-lg border border-blue-200 text-sm">
            <p className="text-gray-600">
              Last ping: <span className="font-medium">{new Date(lastPingTime).toLocaleTimeString()}</span>
            </p>
            <p className={`text-sm ${lastPingStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              Status: {lastPingStatus === 'success' ? '✓ Acknowledged' : '✗ Failed'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
