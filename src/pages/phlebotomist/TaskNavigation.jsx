import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useJsApiLoader } from '@react-google-maps/api';
import { useGetPhlebotomistTaskDetailQuery } from '../../features/lab/labApi';
import { usePhlebotomistPinger } from '../../hooks/usePhlebotomistPinger';
import { TrackingMap } from '../../components/lab/TrackingMap';
import { selectPhlebotomistLocation } from '../../features/tracking/trackingSlice';
import { PageHeader } from '../../components/layout';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '../../ui';

const TaskNavigation = () => {
    const { taskId } = useParams();

    // Fetch Task Data
    const { data: task, isLoading } = useGetPhlebotomistTaskDetailQuery(taskId);

    // Load Maps API for Geocoding (Parent level)
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    // Access State
    const phlebotomistLiveLoc = useSelector(selectPhlebotomistLocation);

    // Enable tracking if task is IN_PROGRESS
    const isTracking = task?.status === 'IN_PROGRESS' || task?.status === 'EN_ROUTE';

    // Start Pinger
    usePhlebotomistPinger(taskId, isTracking);

    const [destination, setDestination] = useState(null);

    // Resolve Destination
    useEffect(() => {
        if (task && isLoaded) {
            // Prioritize coordinates if available
            if (task.latitude && task.longitude) {
                setDestination({ lat: task.latitude, lng: task.longitude });
            } else if (task.patientAddress) {
                // Use Geocoding (Client side)
                // Safe to use window.google because isLoaded is true
                if (window.google?.maps?.Geocoder) {
                    const geocoder = new window.google.maps.Geocoder();
                    const address = `${task.patientAddress.line1}, ${task.patientAddress.city}`;
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const loc = results[0].geometry.location;
                            setDestination({ lat: loc.lat(), lng: loc.lng() });
                        }
                    });
                }
            }
        }
    }, [task, isLoaded]);

    const handleOpenGoogleMaps = () => {
        if (destination) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
            window.open(url, '_blank');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Task Route...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            <div className="bg-white px-4 py-3 shadow-sm z-10 flex justify-between items-center">
                <h1 className="text-lg font-bold">Navigation</h1>
                <Button size="sm" onClick={handleOpenGoogleMaps} disabled={!destination}>
                    <ExternalLink className="w-4 h-4 mr-2" /> Open Maps
                </Button>
            </div>

            <div className="flex-1 relative">
                <TrackingMap
                    hospitalLocation={null} // Don't show hospital for Phleb nav specifically unless needed
                    phlebotomistLocation={phlebotomistLiveLoc}
                    patientLocation={destination}
                    isTracking={true}
                />

                {/* Bottom Sheet Info */}
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto">
                    <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="font-semibold text-gray-900">{task?.patientName}</p>
                            <p className="text-sm text-gray-500 truncate">
                                {task?.patientAddress?.line1}, {task?.patientAddress?.city}
                            </p>
                        </div>
                        <div className="ml-2">
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                                {task?.testNames?.[0]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskNavigation;
