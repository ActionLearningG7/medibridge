/**
 * SOS - Patient Emergency Ambulance Request
 * One-click SOS with location capture and confirmation modal
 * Auto-checks for existing active requests
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, MapPin, Phone, Loader, Info } from 'lucide-react';
import {
    useCreateSOSMutation,
    useListMySOSQuery
} from '../../features/sos/sosApi';
import {
    setActiveRequestId,
    setPatientLocation,
    selectActiveRequestId
} from '../../features/sos/sosSlice';
import { selectUser } from '../../features/auth/authSlice';

export default function SOS() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const activeRequestId = useSelector(selectActiveRequestId);

    const [createSOS, { isLoading: isCreating, error: createError }] = useCreateSOSMutation();
    const { data: myOpenRequests, isLoading: isCheckingRequests } = useListMySOSQuery(undefined, {
        pollingInterval: 0,
        refetchOnMountOrArgChange: true
    });

    const [locationError, setLocationError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [coords, setCoords] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Check if we already have an open request
    useEffect(() => {
        if (activeRequestId) {
            navigate('/patient/sos/tracking');
            return;
        }

        if (myOpenRequests && myOpenRequests.length > 0) {
            const active = myOpenRequests.find(r =>
                ['SEARCHING', 'ASSIGNED', 'ARRIVED', 'PICKED_UP'].includes(r.status)
            );
            if (active) {
                dispatch(setActiveRequestId(active.id));
                navigate('/patient/sos/tracking');
            }
        }
    }, [activeRequestId, myOpenRequests, navigate, dispatch]);

    const handleSOSClick = () => {
        setLocationError(null);
        setIsGettingLocation(true);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setIsGettingLocation(false);
                setShowConfirm(true);
            },
            (error) => {
                console.error("Geo error:", error);
                setLocationError(`Unable to retrieve location: ${error.message}`);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const handleConfirm = async () => {
        if (!coords) return;

        try {
            const result = await createSOS({
                    pickupLat: coords.latitude,
                pickupLng: coords.longitude
            }).unwrap();

            // Store in Redux
            dispatch(setActiveRequestId(result.id));
            dispatch(setPatientLocation({
                lat: coords.latitude,
                lng: coords.longitude
            }));

            // Navigate to tracking
            navigate('/patient/sos/tracking');
        } catch (err) {
            console.error("Failed to create SOS:", err);
            setLocationError(err?.data?.message || "Failed to send SOS request. Please try again.");
            setShowConfirm(false);
        }
    };

    const isLoading = isCreating || isCheckingRequests || isGettingLocation;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
            </div>

            <div className="z-10 w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black text-red-700 tracking-tighter">
                        EMERGENCY SOS
                    </h1>
                    <p className="text-red-600 font-semibold text-lg">
                        One-click Emergency Ambulance
                    </p>
                </div>

                {/* Error Display */}
                {(locationError || createError) && (
                    <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 rounded-r-lg animate-in fade-in slide-in-from-top" role="alert">
                        <p className="font-bold text-sm">Error</p>
                        <p className="text-sm mt-1">{locationError || createError?.data?.message || 'An error occurred'}</p>
                    </div>
                )}

                {/* Main SOS Button */}
                <div className="flex justify-center my-12">
                    <button
                        onClick={handleSOSClick}
                        disabled={isLoading}
                        className={`
                            w-72 h-72 rounded-full 
                            bg-gradient-to-br from-red-600 via-red-600 to-red-700 
                            shadow-2xl border-8 border-red-300
                            flex flex-col items-center justify-center gap-4
                            transform transition-all duration-200
                            active:scale-95 hover:scale-105 hover:shadow-2xl hover:border-red-400
                            focus:outline-none focus:ring-8 focus:ring-red-400 focus:ring-opacity-50
                            ${isLoading ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
                            ${isGettingLocation ? 'animate-pulse' : ''}
                        `}
                    >
                        {isGettingLocation ? (
                            <>
                                <Loader size={80} className="text-white animate-spin" />
                                <span className="text-xl font-bold text-white">Finding Location...</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={90} className="text-white drop-shadow-lg" />
                                <span className="text-4xl font-black text-white tracking-wider drop-shadow-lg">
                                    SOS
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Fallback Options */}
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href="tel:102"
                        className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow text-gray-800 font-bold border-2 border-green-500 hover:bg-green-50"
                    >
                        <Phone size={22} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm">Call 102</span>
                    </a>
                    <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-md text-gray-800 font-bold border-2 border-blue-500">
                        <MapPin size={22} className="text-blue-600 flex-shrink-0" />
                        <span className="text-sm">{coords ? "GPS Found" : "No GPS"}</span>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex gap-2 items-start">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 space-y-1">
                            <p className="font-semibold">Your Information:</p>
                            <p>{user?.firstName} {user?.lastName}</p>
                            {user?.phoneNumber && <p>Phone: {user?.phoneNumber}</p>}
                            {user?.bloodType && <p>Blood Type: {user?.bloodType}</p>}
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold block mb-2">⚠️ Use only for genuine emergencies</span>
                        Your exact location will be shared. Emergency services will contact your registered phone number.
                    </p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && coords && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-3">
                                <AlertCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Confirm Emergency</h3>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6 space-y-6">
                            <div className="text-center">
                                <p className="text-gray-700 font-medium mb-3">
                                    Are you sure you need emergency medical assistance?
                                </p>
                                <p className="text-sm text-gray-600">
                                    This will immediately alert the nearest ambulance service to your location.
                                </p>
                            </div>

                            {/* Location Details */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <p className="text-sm font-semibold text-gray-900">Location to be sent:</p>
                                <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border border-gray-200">
                                    <p>{coords.latitude.toFixed(6)}</p>
                                    <p>{coords.longitude.toFixed(6)}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        ±{Math.round(coords.accuracy)} meters accuracy
                                    </p>
                                </div>
                            </div>

                            {/* Confirmation Checklist */}
                            <div className="space-y-2 text-sm">
                                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                    <input type="checkbox" className="w-4 h-4" disabled checked readOnly />
                                    <span className="text-gray-700">This is a genuine emergency</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                    <input type="checkbox" className="w-4 h-4" disabled checked readOnly />
                                    <span className="text-gray-700">I have enabled location sharing</span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        setCoords(null);
                                        setLocationError(null);
                                    }}
                                    className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isCreating}
                                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Confirm SOS'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
