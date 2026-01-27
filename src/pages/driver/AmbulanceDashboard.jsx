/**
 * Ambulance Dashboard - Driver view
 * Lists open SOS requests, allows accepting and navigation
 * Polls for new requests every 5 seconds
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListOpenRequestsQuery, useAcceptRequestMutation } from '../../features/sos/sosApi';
import { useDispatch } from 'react-redux';
import { setActiveRequestId } from '../../features/sos/sosSlice';
import { Clock, MapPin, Navigation, Loader, AlertCircle, CheckCircle, Phone, Activity } from 'lucide-react';

export default function AmbulanceDashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: requests, isLoading, error } = useListOpenRequestsQuery(undefined, {
        pollingInterval: 5000
    });
    const [acceptRequest, { isLoading: isAccepting }] = useAcceptRequestMutation();
    const [acceptingId, setAcceptingId] = useState(null);
    const [acceptError, setAcceptError] = useState(null);

    const handleAccept = async (requestId) => {
        setAcceptingId(requestId);
        setAcceptError(null);
        try {
            await acceptRequest(requestId).unwrap();
            dispatch(setActiveRequestId(requestId));
            navigate(`/driver/sos/${requestId}`);
        } catch (err) {
            console.error('Failed to accept:', err);
            setAcceptError(err?.data?.message || 'Could not accept request. It may have been taken.');
            setAcceptingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Loading ambulance requests...</p>
                </div>
            </div>
        );
    }

    const openRequests = requests || [];
    const hasError = error && error.status !== 404;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="w-8 h-8 text-blue-600" />
                                Ambulance Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2">Emergency Request Center</p>
                        </div>
                        <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3">
                            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                            <div>
                                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Status</p>
                                <p className="text-lg font-bold text-green-900">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {hasError && (
                    <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-900">Error Loading Requests</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    {error?.data?.message || 'Failed to load SOS requests. Please refresh.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accept Error Display */}
                {acceptError && (
                    <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-orange-900">Request Not Available</h3>
                                <p className="text-orange-700 text-sm mt-1">{acceptError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                {openRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Requests</h3>
                        <p className="text-gray-600 mb-6">Standing by for emergency SOS requests...</p>
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">Listening for incoming requests</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {openRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-red-600 overflow-hidden group"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            🚨 URGENT
                                        </span>
                                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                                            {request.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Emergency SOS</h3>
                                </div>

                                {/* Card Body */}
                                <div className="px-6 py-5 space-y-4">
                                    {/* Location Info */}
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Location</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {request.address || 'Coordinates detected'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono mt-1">
                                                    {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Info */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-700 font-medium">
                                            {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-gray-500 text-xs ml-auto">
                                            {Math.floor((Date.now() - new Date(request.createdAt)) / 1000)}s ago
                                        </span>
                                    </div>

                                    {/* Patient Info (if available) */}
                                    {request.patientPhone && (
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Phone className="w-4 h-4 text-blue-600" />
                                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Patient Contact</p>
                                            </div>
                                            <a
                                                href={`tel:${request.patientPhone}`}
                                                className="text-sm font-mono font-bold text-blue-900 hover:underline"
                                            >
                                                {request.patientPhone}
                                            </a>
                                        </div>
                                    )}

                                    {/* Accept Button */}
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        disabled={acceptingId === request.id || isAccepting}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                                    >
                                        {acceptingId === request.id ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="w-5 h-5" />
                                                Accept & Navigate
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-900">
                        <span className="font-semibold">Total Requests:</span> {openRequests.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
