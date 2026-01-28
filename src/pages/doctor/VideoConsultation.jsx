import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CallLayout from '../../components/video/CallLayout';
import {
  useGetDoctorActiveVideoQuery,
  useStartVideoSessionMutation,
  useEndVideoSessionMutation,
} from '../../features/appointment/consultationApi';
import useWebrtcSocket from '../../hooks/useWebrtcSocket';
import useWebrtcPeer from '../../hooks/useWebrtcPeer';
import PrescriptionBuilder from '../../components/prescription/PrescriptionBuilder';

/**
 * Doctor Video Consultation Page (CALLER FLOW)
 *
 * Flow:
 * 1. Start video session API → get roomId/sessionId
 * 2. Connect WebSocket signaling
 * 3. Initialize peer as caller → startAsCaller() → send OFFER
 * 4. Wait for ANSWER from patient
 * 5. Exchange ICE candidates
 * 6. Display remote stream when connected
 * 7. End session → call end-session API + send BYE
 */
const DoctorVideoConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Get session data from navigation state (passed from queue console after creating session)
  const navigationSession = location.state?.sessionId ? {
    sessionId: location.state.sessionId,
    roomId: location.state.roomId,
    patientId: location.state.patientId,
    patientName: location.state.patientName,
    queueEntryId: location.state.queueEntryId,
  } : null;

  // Get queue entry ID from navigation state (if starting from queue console)
  const queueEntryId = location.state?.queueEntryId;

  // Local UI state
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, waiting, connected, ended
  const [duration, setDuration] = useState('00:00');
  const [showStartButton, setShowStartButton] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(!!navigationSession); // Track if we have an initial session
  const [showPrescriptionDrawer, setShowPrescriptionDrawer] = useState(false);

  // Refs to prevent stale closures
  const webrtcHandlersRef = useRef(null);
  const signalingHooksRef = useRef(null);

  // RTK Query hooks
  const {
    data: activeSession,
    isLoading: isLoadingSession,
    refetch: refetchSession,
  } = useGetDoctorActiveVideoQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  const [startVideoSession, { isLoading: isStarting }] = useStartVideoSessionMutation();
  const [endVideoSession] = useEndVideoSessionMutation();

  // WebSocket signaling (connects when roomId available)
  // Use active session from API, fall back to navigation session
  const sessionForSignaling = activeSession || navigationSession;
  console.log('📹 [Doctor] sessionForSignaling:', {
    hasActiveSession: !!activeSession,
    hasNavigationSession: !!navigationSession,
    sessionForSignaling,
    roomId: sessionForSignaling?.roomId,
  });
  const {
    isConnected: isSignalingConnected,
    connectionStatus: signalingStatus,
    error: signalingError,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendLeave,
  } = useWebrtcSocket(sessionForSignaling?.roomId, {
    autoConnect: true,
    onSignal: (signal) => {
      console.log('📨 [Doctor] Received signal:', signal.type);

      // Handle WebRTC signaling messages
      if (webrtcHandlersRef.current) {
        switch (signal.type) {
          case 'ANSWER':
            console.log('📨 [Doctor] Received ANSWER from patient');
            webrtcHandlersRef.current.handleAnswer(signal.sdp);
            break;
          case 'ICE':
            console.log('🧊 [Doctor] Received ICE candidate from patient');
            webrtcHandlersRef.current.handleIceCandidate(signal.candidate);
            break;
          case 'BYE':
            console.log('👋 [Doctor] Patient left the call');
            setConnectionStatus('ended');
            break;
          default:
            console.log('ℹ️ [Doctor] Unhandled signal type:', signal.type);
        }
      }
    },
    onPresence: (event) => {
      console.log('👥 [Doctor] Presence event:', event.eventType);
      if (event.eventType === 'PARTICIPANT_JOINED') {
        console.log('✅ [Doctor] Patient joined the room');
      } else if (event.eventType === 'PARTICIPANT_LEFT') {
        console.log('👋 [Doctor] Patient left the room');
        setConnectionStatus('waiting');
      }
    },
    onConnected: () => {
      console.log('✅ [Doctor] Signaling connected');
      // Start WebRTC as caller when signaling is ready
      if (webrtcHandlersRef.current && activeSession?.roomId) {
        console.log('🎬 [Doctor] Starting as caller...');
        setConnectionStatus('connecting');
        webrtcHandlersRef.current.startAsCaller('DOCTOR');
      }
    },
    onDisconnected: () => {
      console.log('🔌 [Doctor] Signaling disconnected');
    },
    onError: (error) => {
      console.error('❌ [Doctor] Signaling error:', error);
      setError({ message: 'Signaling connection failed' });
    },
  });

  // Store signaling hooks in ref for cleanup
  signalingHooksRef.current = {
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendLeave,
    isSignalingConnected,
  };

  // WebRTC peer connection
  const {
    localStream,
    remoteStream,
    status: webrtcStatus,
    error: webrtcError,
    isMuted: isLocalMuted,
    isVideoOff: isLocalVideoOff,
    startAsCaller,
    toggleMic,
    toggleCam,
    hangUp,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  } = useWebrtcPeer({
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    isSignalingConnected,
  });

  // Store WebRTC handlers in ref for signal callback
  webrtcHandlersRef.current = {
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    startAsCaller,
  };

  // Check if we have an active session
  useEffect(() => {
    if (isLoadingSession) {
      // If we came from queue console with a session, don't show loading
      if (navigationSession) {
        setConnectionStatus('idle');
        setShowStartButton(false);
      } else {
        setConnectionStatus('idle');
        setShowStartButton(false);
      }
      return;
    }

    // Prefer the API response, fall back to navigation state
    const session = activeSession || navigationSession;

    if (session) {
      console.log('📹 [Doctor] Active session found:', {
        sessionId: session.sessionId,
        roomId: session.roomId,
      });
      setShowStartButton(false);
      setSessionInitialized(true);
    } else {
      console.log('ℹ️ [Doctor] No active session');
      setShowStartButton(true);
    }
  }, [activeSession, isLoadingSession, navigationSession]);

  // Update connection status based on WebRTC status
  useEffect(() => {
    if (webrtcStatus === 'connected') {
      console.log('✅ [Doctor] WebRTC connected - Call active!');
      setConnectionStatus('connected');
      setError(null);
    } else if (webrtcStatus === 'connecting') {
      setConnectionStatus('waiting'); // Waiting for patient to answer
    } else if (webrtcStatus === 'failed') {
      console.error('❌ [Doctor] WebRTC connection failed');
      setConnectionStatus('waiting');
      setError(webrtcError);
    }
  }, [webrtcStatus, webrtcError]);

  // Duration counter (when connected)
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Handle start video session (Step 1)
  const handleStartSession = async () => {
    if (!queueEntryId) {
      setError('Queue entry ID is required to start video session');
      return;
    }

    try {
      console.log('🎬 [Doctor] Starting video session for queueEntryId:', queueEntryId);
      setError(null);
      setConnectionStatus('connecting');
      setShowStartButton(false);

      const result = await startVideoSession({
        queueEntryId,
        consultationId: null,
      }).unwrap();

      console.log('✅ [Doctor] Video session started:', {
        sessionId: result.sessionId,
        roomId: result.roomId,
      });

      // Refetch to get the active session
      await refetchSession();

      // WebSocket will auto-connect when roomId is available
      // Then onConnected callback will trigger startAsCaller()
    } catch (err) {
      console.error('❌ [Doctor] Failed to start video session:', err);
      setError(err.data?.message || 'Failed to start video session');
      setConnectionStatus('idle');
      setShowStartButton(true);
    }
  };

  // Handle end call (Step 7)
  const handleEndCall = useCallback(async () => {
    console.log('📞 [Doctor] Ending call...');

    try {
      setConnectionStatus('ended');

      // Send BYE signal to patient
      if (signalingHooksRef.current?.sendLeave) {
        console.log('👋 [Doctor] Sending BYE signal');
        signalingHooksRef.current.sendLeave();
      }

      // Hang up WebRTC (stop streams, close peer connection)
      hangUp();

      // End session on backend - use active session from API, fall back to navigation session
      const sessionForEndCall = activeSession || navigationSession;
      if (sessionForEndCall?.sessionId) {
        console.log('📤 [Doctor] Calling end-session API');
        await endVideoSession({
          sessionId: sessionForEndCall.sessionId,
          reason: 'Doctor ended consultation',
          notes: null,
        }).unwrap();
        console.log('✅ [Doctor] Session ended successfully');
      }

      // Navigate back to queue after delay
      setTimeout(() => {
        navigate('/doctor/queue');
      }, 2000);
    } catch (err) {
      console.error('❌ [Doctor] Failed to end video session:', err);
      // Still navigate even if API fails
      setTimeout(() => {
        navigate('/doctor/queue');
      }, 2000);
    }
  }, [activeSession, navigationSession, endVideoSession, hangUp, navigate]);

  // Toggle microphone
  const handleToggleMute = useCallback(() => {
    const newState = toggleMic();
    console.log(`🎤 [Doctor] Microphone ${newState ? 'off' : 'on'}`);
  }, [toggleMic]);

  // Toggle camera
  const handleToggleVideo = useCallback(() => {
    const newState = toggleCam();
    console.log(`📹 [Doctor] Camera ${newState ? 'off' : 'on'}`);
  }, [toggleCam]);

  // Get participant info
  const localParticipantName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim()
    : 'You';

  const remoteParticipantName = (activeSession || navigationSession)?.patientName || 'Patient';
  const remoteParticipantRole = 'Patient';


  console.log("signal :: " + isSignalingConnected);

  // Signaling status indicator
  const signalingStatusText = isSignalingConnected
    ? '✅ Signaling Connected'
    : signalingStatus === 'connecting'
      ? '🔄 Signaling Connecting...'
      : '🔴 Signaling Disconnected';

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-700 text-lg font-medium">Loading video session...</p>
        </div>
      </div>
    );
  }

  // Show start button if no active session
  if (showStartButton && !activeSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start Video Consultation
          </h2>

          <p className="text-gray-600 mb-6">
            {queueEntryId
              ? 'Click the button below to start the video consultation with your patient.'
              : 'No queue entry selected. Please start from the queue console.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error.message || error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/doctor/queue')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Queue
            </button>

            {queueEntryId && (
              <button
                onClick={handleStartSession}
                disabled={isStarting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Starting...
                  </span>
                ) : (
                  'Start Video'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show video call layout
  return (
    <div className="relative">
      {/* Signaling Status Indicator */}
      {activeSession && (
        <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <p className="text-sm font-medium">{signalingStatusText}</p>
          {signalingError && (
            <p className="text-xs text-red-600 mt-1">Error: {signalingError.message}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">Error: {error.message || error}</p>
          )}
        </div>
      )}

      <CallLayout
        localParticipantName={localParticipantName}
        remoteParticipantName={remoteParticipantName}
        remoteParticipantRole={remoteParticipantRole}
        connectionStatus={connectionStatus}
        duration={duration}
        isMuted={isLocalMuted}
        isVideoOff={isLocalVideoOff}
        isRemoteVideoOff={!remoteStream}
        localStream={localStream}
        remoteStream={remoteStream}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        connectionQuality="good"
      />

      {/* Prescription Button (Doctor Only) */}
      {connectionStatus === 'connected' && (
        <div className="absolute bottom-24 right-6 z-40">
          <button
            onClick={() => setShowPrescriptionDrawer(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 font-medium"
          >
            <svg itemType="pill" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Prescription
          </button>
        </div>
      )}

      {/* Prescription Drawer */}
      {(showPrescriptionDrawer) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowPrescriptionDrawer(false)} />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl transform transition-transform bg-white shadow-xl flex flex-col h-full animate-slide-in-right">
              <div className="flex-1 overflow-y-auto">
                <PrescriptionBuilder
                  initialPatientId={(activeSession || navigationSession)?.patientId}
                  initialAppointmentId={(activeSession || navigationSession)?.consultationId || (activeSession || navigationSession)?.appointmentId || (activeSession || navigationSession)?.queueEntryId}
                  onCancel={() => setShowPrescriptionDrawer(false)}
                  onSuccess={() => {
                    setShowPrescriptionDrawer(false);
                    // Optional: show a success toast here if the builder doesn't (it does)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVideoConsultation;

