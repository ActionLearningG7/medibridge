import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CallLayout from '../../components/video/CallLayout';
import {
  useGetPatientActiveVideoQuery,
  useEndVideoSessionMutation,
} from '../../features/appointment/consultationApi';
import useWebrtcSocket from '../../hooks/useWebrtcSocket';
import useWebrtcPeer from '../../hooks/useWebrtcPeer';

/**
 * Patient Video Consultation Page (CALLEE FLOW)
 *
 * Flow:
 * 1. Get active session API → get roomId/sessionId
 * 2. Connect WebSocket signaling
 * 3. Initialize peer as callee (wait for OFFER)
 * 4. On OFFER → create and send ANSWER
 * 5. Exchange ICE candidates
 * 6. Display remote stream when connected
 * 7. End session → call end-session API + send BYE
 */
const PatientVideoConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Local UI state
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, waiting, connected, ended
  const [duration, setDuration] = useState('00:00');
  const [error, setError] = useState(null);

  // Refs to prevent stale closures
  const webrtcHandlersRef = useRef(null);
  const signalingHooksRef = useRef(null);

  // RTK Query hooks
  const {
    data: activeSession,
    isLoading: isLoadingSession,
  } = useGetPatientActiveVideoQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  const [endVideoSession] = useEndVideoSessionMutation();

  // WebSocket signaling (connects when roomId available)
  const {
    isConnected: isSignalingConnected,
    connectionStatus: signalingStatus,
    error: signalingError,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendLeave,
  } = useWebrtcSocket(activeSession?.roomId, {
    autoConnect: true,
    onSignal: (signal) => {
      console.log('📨 [Patient] Received signal:', signal.type);

      // Handle WebRTC signaling messages
      if (webrtcHandlersRef.current) {
        switch (signal.type) {
          case 'OFFER':
            console.log('📨 [Patient] Received OFFER from doctor - Creating answer...');
            webrtcHandlersRef.current.handleOffer(signal.sdp, 'PATIENT');
            break;
          case 'ICE':
            console.log('🧊 [Patient] Received ICE candidate from doctor');
            webrtcHandlersRef.current.handleIceCandidate(signal.candidate);
            break;
          case 'BYE':
            console.log('👋 [Patient] Doctor left the call');
            setConnectionStatus('ended');
            break;
          default:
            console.log('ℹ️ [Patient] Unhandled signal type:', signal.type);
        }
      }
    },
    onPresence: (event) => {
      console.log('👥 [Patient] Presence event:', event.eventType);
      if (event.eventType === 'PARTICIPANT_JOINED') {
        console.log('✅ [Patient] Doctor joined the room');
      } else if (event.eventType === 'PARTICIPANT_LEFT') {
        console.log('👋 [Patient] Doctor left the room');
        setConnectionStatus('waiting');
      }
    },
    onConnected: () => {
      console.log('✅ [Patient] Signaling connected');
      // Start WebRTC as callee when signaling is ready
      if (webrtcHandlersRef.current && activeSession?.roomId) {
        console.log('📞 [Patient] Starting as callee - Waiting for OFFER...');
        setConnectionStatus('waiting');
        webrtcHandlersRef.current.startAsCallee('PATIENT');
      }
    },
    onDisconnected: () => {
      console.log('🔌 [Patient] Signaling disconnected');
    },
    onError: (error) => {
      console.error('❌ [Patient] Signaling error:', error);
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
    startAsCallee,
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
    startAsCallee,
  };

  // Check if we have an active session
  useEffect(() => {
    if (isLoadingSession) {
      setConnectionStatus('idle');
      return;
    }

    if (activeSession) {
      console.log('📹 [Patient] Active session found:', {
        sessionId: activeSession.sessionId,
        roomId: activeSession.roomId,
      });
      // WebSocket will auto-connect when roomId is available
      // Then onConnected callback will trigger startAsCallee()
    } else {
      console.log('ℹ️ [Patient] No active session');
      setConnectionStatus('idle');
    }
  }, [activeSession, isLoadingSession]);

  // Update connection status based on WebRTC status
  useEffect(() => {
    if (webrtcStatus === 'connected') {
      console.log('✅ [Patient] WebRTC connected - Call active!');
      setConnectionStatus('connected');
      setError(null);
    } else if (webrtcStatus === 'connecting') {
      setConnectionStatus('connecting'); // Processing offer/answer
    } else if (webrtcStatus === 'failed') {
      console.error('❌ [Patient] WebRTC connection failed');
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

  // Handle end call
  const handleEndCall = useCallback(async () => {
    console.log('📞 [Patient] Ending call...');

    try {
      setConnectionStatus('ended');

      // Send BYE signal to doctor
      if (signalingHooksRef.current?.sendLeave) {
        console.log('👋 [Patient] Sending BYE signal');
        signalingHooksRef.current.sendLeave();
      }

      // Hang up WebRTC (stop streams, close peer connection)
      hangUp();

      // End session on backend (or request end)
      if (activeSession?.sessionId) {
        console.log('📤 [Patient] Calling end-session API');
        await endVideoSession({
          sessionId: activeSession.sessionId,
          reason: 'Patient left consultation',
          notes: null,
        }).unwrap();
        console.log('✅ [Patient] Session ended successfully');
      }

      // Navigate back to appointments after delay
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    } catch (err) {
      console.error('❌ [Patient] Failed to end video session:', err);
      // Still navigate even if API fails
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    }
  }, [activeSession, endVideoSession, hangUp, navigate]);

  // Toggle microphone
  const handleToggleMute = useCallback(() => {
    const newState = toggleMic();
    console.log(`🎤 [Patient] Microphone ${newState ? 'off' : 'on'}`);
  }, [toggleMic]);

  // Toggle camera
  const handleToggleVideo = useCallback(() => {
    const newState = toggleCam();
    console.log(`📹 [Patient] Camera ${newState ? 'off' : 'on'}`);
  }, [toggleCam]);

  // Get participant info
  const localParticipantName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'You';

  const remoteParticipantName = activeSession?.doctorName || 'Dr. Smith';
  const remoteParticipantRole = 'Doctor';

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

  // Show "no active session" if none exists
  if (!activeSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Active Video Consultation
          </h2>

          <p className="text-gray-600 mb-6">
            You don't have an active video consultation at the moment. Your doctor will start the video call when ready.
          </p>

          <button
            onClick={() => navigate('/patient/appointments')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Appointments
          </button>
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
    </div>
  );
};

export default PatientVideoConsultation;
