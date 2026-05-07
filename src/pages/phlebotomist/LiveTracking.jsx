/**
 * Phlebotomist Live Tracking Page
 * Real-time location tracking while en-route or in-transit
 * Features: automatic tracking, location pings, real-time map
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetPhlebotomistTasksQuery,
  useUpdatePhlebotomyLocationPingMutation,
} from '../../features/lab/labApi';
import { Button, Badge, Toast, Card } from '../../ui'; // Adjusted imports based on usage
import { MapPin, AlertCircle, Activity, ArrowLeft } from 'lucide-react';

import { TrackingMap } from '../../components/lab/TrackingMap';

export default function PhlebotomistLiveTracking() {
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [lastPingTime, setLastPingTime] = useState(null);
  const [lastPingStatus, setLastPingStatus] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const locationPingIntervalRef = useRef(null);
  const gpsWatchRef = useRef(null);
  const lastPingTimeRef = useRef(0);

  // Fetch tasks and get current active task
  const { data: tasksData = [], isLoading: taskLoading } = useGetPhlebotomistTasksQuery();

  // Get current task (first active task in ACCEPTED, EN_ROUTE or IN_TRANSIT status)
  const currentTask = tasksData?.find(
    (task) => ['ACCEPTED', 'EN_ROUTE', 'IN_TRANSIT'].includes(task.status)
  ) || tasksData?.[0];

  // Mutations
  const [sendLocationPing, { isLoading: isPingLoading }] = useUpdatePhlebotomyLocationPingMutation();

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Check if auto-tracking should be active
  const shouldAutoTrack = () => {
    return currentTask && ['ACCEPTED', 'EN_ROUTE', 'IN_TRANSIT'].includes(currentTask.status);
  };

  const isTracking = shouldAutoTrack();

  // Send location ping to server
  const sendLocationPingToServer = async ({ latitude, longitude }) => {
    if (!currentTask) return;

    try {
      await sendLocationPing({
        taskId: currentTask.taskId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      }).unwrap();

      setLastPingTime(new Date());
      setLastPingStatus('success');
      setCurrentLocation({ lat: latitude, lng: longitude });
    } catch (error) {
      console.error('Location ping error:', error);
      setLastPingStatus('failed');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationPingIntervalRef.current) {
        clearInterval(locationPingIntervalRef.current);
      }
      if (gpsWatchRef.current) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, []);

  // Real-time GPS Tracking
  useEffect(() => {
    if (isTracking && navigator.geolocation) {
      console.log('🛰️ Starting GPS tracking...');

      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      const success = (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Throttle pings to every 5 seconds
        const now = Date.now();
        if (now - lastPingTimeRef.current > 5000) {
          sendLocationPingToServer({ latitude, longitude });
          lastPingTimeRef.current = now;
        }
      };

      const error = (err) => {
        console.warn(`GPS ERROR(${err.code}): ${err.message}`);
      };

      const id = navigator.geolocation.watchPosition(success, error, options);
      gpsWatchRef.current = id;

      return () => {
        if (gpsWatchRef.current) {
          navigator.geolocation.clearWatch(gpsWatchRef.current);
          gpsWatchRef.current = null;
        }
      };
    } else {
      if (gpsWatchRef.current) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
    }
  }, [isTracking, currentTask?.taskId]);

  // Initial location fetch (if tracking starts)
  useEffect(() => {
    if (isTracking && !currentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Initial location error', err)
      );
    }
  }, [isTracking]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

      {/* LEFT SIDEBAR - DETAILS */}
      <div className="w-full lg:w-96 flex flex-col bg-white border-r shadow-lg z-10 overflow-y-auto">

        {/* Header Section */}
        <div className="p-5 border-b sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-gray-500 hover:text-gray-900"
              onClick={() => navigate('/phlebotomist/tasks')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-sm text-gray-500">Real-time delivery updates</p>
        </div>

        <div className="p-5 space-y-6 flex-1">
          {/* Tracking Status Card */}
          <div className={`p-4 rounded-xl border ${isTracking ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Status</span>
              {isTracking ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-md">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-green-700">Live</span>
                </div>
              ) : (
                <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded-md">Inactive</span>
              )}
            </div>
            <p className={`text-sm ${isTracking ? 'text-green-700' : 'text-gray-600'}`}>
              {isTracking ? "GPS location sharing is active." : "Accept a task to start tracking."}
            </p>
          </div>

          {/* Current Task Details */}
          {currentTask ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Current Task</h3>
                <Badge
                  className={
                    currentTask.status === 'EN_ROUTE' ? 'bg-purple-100 text-purple-800' :
                      currentTask.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-blue-100 text-blue-800'
                  }
                >
                  {currentTask.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border space-y-3">
                <div>
                  <p className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider mb-1">PATIENT</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {currentTask.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{currentTask.patientName}</p>
                      <p className="text-sm text-gray-500">#{currentTask.taskId.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>

                {(currentTask.address || currentTask.city) && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider mb-1">DESTINATION</p>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        {currentTask.address && <span className="block">{currentTask.address}</span>}
                        {currentTask.city && <span>{currentTask.city}</span>}
                        {currentTask.zipCode && <span>, {currentTask.zipCode}</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/phlebotomist/tasks/${currentTask.taskId}`)}
              >
                View Full Task Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">No active tasks</p>
              <Button variant="link" onClick={() => navigate('/phlebotomist/tasks')}>Go to Tasks</Button>
            </div>
          )}

          {/* GPS Debug Info (Compact) */}
          {isTracking && (
            <div className="text-xs text-gray-400 flex justify-between items-center pt-4 border-t">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> GPS Signal
              </span>
              <span className={lastPingStatus === 'success' ? 'text-green-500' : 'text-orange-500'}>
                {lastPingStatus === 'success' ? 'Good' : 'Searching...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - MAP */}
      <div className="flex-1 relative h-[50vh] lg:h-auto bg-gray-200">
        {currentTask ? (
          <TrackingMap
            patientLocation={{
              lat: currentTask.patientLatitude || 48.813893,
              lng: currentTask.patientLongitude || 2.365315
            }}
            phlebotomistLocation={currentLocation}
            isTracking={isTracking}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Map inactive</p>
            </div>
          </div>
        )}

        {/* Floating Info Overlay for Map */}
        {isTracking && currentLocation && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-64 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/50 text-xs text-gray-600 z-10">
            <div className="flex justify-between font-mono">
              <span>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
