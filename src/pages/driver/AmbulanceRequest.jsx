/**
 * Ambulance Request - Driver Navigation & Workflow
 * Real-time GPS tracking, status buttons, live route map
 * Workflow: ASSIGNED -> ARRIVED -> PICKED_UP -> COMPLETED
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetSOSByIdQuery,
    useMarkArrivedMutation,
    usePickupPatientMutation,
    useCompleteTripMutation
} from '../../features/sos/sosApi';
import { useSosPinger } from '../../hooks/useSosPinger';
import { SOSMap } from '../../components/sos/SOSMap';
import { Phone, Navigation, CheckCircle, UserCheck, MapPin, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

const STATUS_WORKFLOW = {
    SEARCHING: { next: 'ASSIGNED', button: 'Waiting...' },
    ASSIGNED: { next: 'ARRIVED', button: 'Mark Arrived' },
    ARRIVED: { next: 'PICKED_UP', button: 'Confirm Pickup' },
    PICKED_UP: { next: 'COMPLETED', button: 'Trip Complete' },
    COMPLETED: { next: null, button: 'Return to Dashboard' }
};

const STATUS_COLORS = {
    SEARCHING: { bg: 'bg-yellow-600', text: 'text-yellow-50', icon: '🔍' },
    ASSIGNED: { bg: 'bg-blue-600', text: 'text-blue-50', icon: '🚑' },
    ARRIVED: { bg: 'bg-orange-600', text: 'text-orange-50', icon: '⏸️' },
    PICKED_UP: { bg: 'bg-purple-600', text: 'text-purple-50', icon: '🏥' },
    COMPLETED: { bg: 'bg-green-600', text: 'text-green-50', icon: '✅' }
};

export default function AmbulanceRequest() {
    const { id } = useParams();
    const navigate = useNavigate();

    // API Hooks
    const { data: request, isLoading, error } = useGetSOSByIdQuery(id, {
        pollingInterval: 3000,
        skip: !id
    });

    const [markArrived, { isLoading: isArriving }] = useMarkArrivedMutation();
    const [pickupPatient, { isLoading: isPickingUp }] = usePickupPatientMutation();
    const [completeTrip, { isLoading: isCompleting }] = useCompleteTripMutation();

    // GPS Pinger Hook - Automatically tracks and sends location
    const { currentLocation: myLocation } = useSosPinger(
        id,
        request?.assignedAmbulance?.id,
        request?.organizationId,
        !!request && request.status !== 'COMPLETED'
    );

    // State
    const [eta, setEta] = useState({ distance: '--', duration: '--' });
    const [statusError, setStatusError] = useState(null);

    // Handle status transition
    const handleStatusTransition = async () => {
        if (!request) return;

        setStatusError(null);
        try {
            switch (request.status) {
                case 'ASSIGNED':
                    await markArrived(id).unwrap();
                    break;
                case 'ARRIVED':
                    await pickupPatient(id).unwrap();
                    break;
                case 'PICKED_UP':
                    await completeTrip(id).unwrap();
                    // Navigate after completing
                    setTimeout(() => navigate('/driver/dashboard'), 1000);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Status transition failed:', err);
            setStatusError(err?.data?.message || 'Failed to update status. Please try again.');
        }
    };

    // Handle early exit
    const handleExit = () => {
        navigate('/driver/dashboard');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Loading trip details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !request) {
        return (
            <div className="h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        {error?.data?.message || 'This request is no longer available'}
                    </p>
                    <button
                        onClick={handleExit}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const status = request.status;
    const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.SEARCHING;
    const isActive = status !== 'COMPLETED';
    const canTransition = status !== 'SEARCHING' && status !== 'COMPLETED';
    const isTransitioning = isArriving || isPickingUp || isCompleting;

    // Locations for map
    const patientLocation = { lat: request.latitude, lng: request.longitude };

    return (
        <div className="h-screen flex flex-col bg-gray-900 relative overflow-hidden">
            {/* Header */}
            <div className={`${statusConfig.bg} ${statusConfig.text} shadow-lg z-20 px-4 md:px-6 py-4`}>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{statusConfig.icon}</span>
                            <div>
                                <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Trip Status</p>
                                <h1 className="text-2xl font-bold">{status}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs opacity-90 font-semibold uppercase tracking-wider">Distance • Duration</p>
                        <p className="text-lg font-bold">{eta.distance}</p>
                        <p className="text-sm">{eta.duration}</p>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <SOSMap
                    patientLocation={patientLocation}
                    ambulanceLocation={myLocation}
                    onRouteUpdate={setEta}
                />

                {/* Back Button */}
                <button
                    onClick={handleExit}
                    className="absolute top-4 left-4 bg-white text-gray-900 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50 z-10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Live GPS Status Badge */}
                <div className="absolute top-4 right-4 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 z-10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-700">GPS Active</span>
                </div>
            </div>

            {/* Bottom Action Panel */}
            <div className="bg-white border-t border-gray-200 shadow-2xl z-20">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
                    {/* Status Error Display */}
                    {statusError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-900">Status Update Failed</p>
                                <p className="text-sm text-red-700 mt-1">{statusError}</p>
                            </div>
                        </div>
                    )}

                    {/* Patient Information Card */}
                    {request.patientName || request.patientPhone ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">👤</span>
                                Patient Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Name</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{request.patientName || 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Phone</p>
                                    <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{request.patientPhone || 'Not available'}</p>
                                </div>
                                {request.patientPhone && (
                                    <a
                                        href={`tel:${request.patientPhone}`}
                                        className="md:col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call Patient
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                        {/* Main Action Button */}
                        {canTransition ? (
                            <button
                                onClick={handleStatusTransition}
                                disabled={isTransitioning}
                                className={`
                                    md:col-span-2 px-6 py-4 font-bold text-white rounded-lg
                                    transition-all duration-200 flex items-center justify-center gap-2
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${statusConfig.bg} hover:shadow-lg hover:scale-105
                                `}
                            >
                                {isTransitioning ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Updating Status...
                                    </>
                                ) : status === 'ASSIGNED' ? (
                                    <>
                                        <MapPin className="w-5 h-5" />
                                        {STATUS_WORKFLOW[status].button}
                                    </>
                                ) : status === 'ARRIVED' ? (
                                    <>
                                        <UserCheck className="w-5 h-5" />
                                        {STATUS_WORKFLOW[status].button}
                                    </>
                                ) : status === 'PICKED_UP' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        {STATUS_WORKFLOW[status].button}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        {STATUS_WORKFLOW[status].button}
                                    </>
                                )}
                            </button>
                        ) : status === 'COMPLETED' ? (
                            <button
                                onClick={handleExit}
                                className="md:col-span-2 px-6 py-4 font-bold text-white rounded-lg bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Return to Dashboard
                            </button>
                        ) : null}

                        {/* Secondary - Driver Status */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Driver Status</p>
                                <div className="flex items-center gap-2 justify-center text-blue-900 font-bold">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journey Checklist */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Journey Progress</p>
                        <div className="space-y-2">
                            <div className={`flex items-center gap-3 text-sm ${status === 'SEARCHING' || ['ASSIGNED', 'ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${['ASSIGNED', 'ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                    {['ASSIGNED', 'ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? '✓' : '1'}
                                </div>
                                <span>Request Assigned</span>
                            </div>
                            <div className={`flex items-center gap-3 text-sm ${['ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${['ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                    {['ARRIVED', 'PICKED_UP', 'COMPLETED'].includes(status) ? '✓' : '2'}
                                </div>
                                <span>Arrived at Location</span>
                            </div>
                            <div className={`flex items-center gap-3 text-sm ${['PICKED_UP', 'COMPLETED'].includes(status) ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${['PICKED_UP', 'COMPLETED'].includes(status) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                    {['PICKED_UP', 'COMPLETED'].includes(status) ? '✓' : '3'}
                                </div>
                                <span>Patient Picked Up</span>
                            </div>
                            <div className={`flex items-center gap-3 text-sm ${status === 'COMPLETED' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                    {status === 'COMPLETED' ? '✓' : '4'}
                                </div>
                                <span>Trip Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
