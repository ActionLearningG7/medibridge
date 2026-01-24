import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPeerConnectionConfig,
  getMediaConstraints,
  getUserMedia,
  stopMediaStream,
  toggleTrack,
  isTrackEnabled,
  cleanupPeerConnection,
  parseSDP,
} from '../utils/webrtc';
import { parseIceCandidate } from '../utils/ws';

/**
 * useWebrtcPeer Hook
 *
 * Manages WebRTC peer connection for video consultation with edge case handling
 *
 * Features:
 * - Local media stream (camera + microphone)
 * - RTCPeerConnection management
 * - SDP offer/answer handling with state machine guards
 * - ICE candidate exchange
 * - Integration with WebSocket signaling
 * - Connection timeout handling (60s)
 * - Retry logic on connection failure
 * - BYE signal handling
 * - Cleanup on component unmount/navigation
 *
 * Edge Cases Handled:
 * - Prevent double offer/answer with state machine
 * - Connection timeout → show retry
 * - Peer connection failure → retry button
 * - User navigates away → cleanup all resources
 * - Receive BYE → end call UI + cleanup
 */
const useWebrtcPeer = (signalingHooks = {}) => {
  const {
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    isSignalingConnected,
  } = signalingHooks;

  // State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, failed, timeout, ended
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  // Refs (don't trigger re-renders)
  const peerConnectionRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  // State machine guards to prevent double offer/answer
  const negotiationStateRef = useRef('idle'); // idle, offering, answering, stable
  const isOfferSentRef = useRef(false);
  const isAnswerSentRef = useRef(false);

  // Connection timeout
  const connectionTimeoutRef = useRef(null);
  const CONNECTION_TIMEOUT_MS = 60000; // 60 seconds

  // Retry counter
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  /**
   * Initialize local media stream
   */
  const initLocalStream = useCallback(async () => {
    console.log('🎥 [WebRTC] Initializing local stream...');

    const constraints = getMediaConstraints({
      video: true,
      audio: true,
      videoQuality: 'hd',
    });

    const { stream, error: mediaError } = await getUserMedia(constraints);

    if (mediaError) {
      console.error('❌ [WebRTC] Failed to get user media:', mediaError);
      setError(mediaError);
      setStatus('failed');
      return null;
    }

    console.log('✅ [WebRTC] Local stream initialized');
    setLocalStream(stream);
    return stream;
  }, []);

  /**
   * Create RTCPeerConnection
   */
  const createPeerConnection = useCallback((myRole) => {
    if (peerConnectionRef.current) {
      console.warn('⚠️ [WebRTC] Peer connection already exists');
      return peerConnectionRef.current;
    }

    console.log('🔌 [WebRTC] Creating peer connection...');

    const config = getPeerConnectionConfig();
    const pc = new RTCPeerConnection(config);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 [WebRTC] ICE candidate generated:', event.candidate.type);

        if (isSignalingConnected && sendIceCandidate) {
          const targetRole = myRole === 'DOCTOR' ? 'PATIENT' : 'DOCTOR';
          sendIceCandidate(event.candidate, targetRole);
        } else {
          console.warn('⚠️ [WebRTC] Signaling not ready, queueing ICE candidate');
          pendingIceCandidatesRef.current.push(event.candidate);
        }
      } else {
        console.log('🧊 [WebRTC] All ICE candidates generated');
      }
    };

    // Handle remote track
    pc.ontrack = (event) => {
      console.log('📹 [WebRTC] Remote track received:', event.track.kind);

      if (event.streams && event.streams[0]) {
        console.log('✅ [WebRTC] Setting remote stream');
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔄 [WebRTC] Connection state:', pc.connectionState);

      switch (pc.connectionState) {
        case 'connecting':
          setStatus('connecting');
          break;
        case 'connected':
          setStatus('connected');
          setError(null);
          break;
        case 'disconnected':
          setStatus('connecting'); // Try to reconnect
          break;
        case 'failed':
          setStatus('failed');
          setError({ message: 'WebRTC connection failed' });
          break;
        case 'closed':
          setStatus('idle');
          break;
        default:
          break;
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 [WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log('📡 [WebRTC] Signaling state:', pc.signalingState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [isSignalingConnected, sendIceCandidate]);

  /**
   * Add local stream to peer connection
   */
  const addLocalStreamToConnection = useCallback((pc, stream) => {
    if (!pc || !stream) return;

    stream.getTracks().forEach((track) => {
      console.log('➕ [WebRTC] Adding local track:', track.kind);
      pc.addTrack(track, stream);
    });
  }, []);

  /**
   * Start as caller (create offer)
   */
  const startAsCaller = useCallback(async (myRole = 'DOCTOR') => {
    try {
      // State machine guard: prevent double offer
      if (negotiationStateRef.current !== 'idle') {
        console.warn('⚠️ [WebRTC] Already negotiating, ignoring startAsCaller');
        return;
      }

      negotiationStateRef.current = 'offering';
      console.log('📞 [WebRTC] Starting as caller...');
      setStatus('connecting');
      setError(null);
      setCanRetry(false);

      // Start connection timeout
      startConnectionTimeout();

      // Get local stream
      let stream = localStream;
      if (!stream) {
        stream = await initLocalStream();
        if (!stream) {
          throw new Error('Failed to initialize local stream');
        }
      }

      // Create peer connection
      const pc = createPeerConnection(myRole);

      // Add local stream
      addLocalStreamToConnection(pc, stream);

      // Create offer
      console.log('📋 [WebRTC] Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);
      console.log('✅ [WebRTC] Local description set (offer)');

      // Send offer via signaling
      if (sendOffer) {
        const targetRole = myRole === 'DOCTOR' ? 'PATIENT' : 'DOCTOR';
        const sdpInfo = parseSDP(offer.sdp);
        console.log('📤 [WebRTC] Sending offer:', sdpInfo);

        sendOffer(offer.sdp, targetRole);
        isOfferSentRef.current = true;

        // Send any pending ICE candidates
        if (pendingIceCandidatesRef.current.length > 0) {
          console.log('📤 [WebRTC] Sending pending ICE candidates:', pendingIceCandidatesRef.current.length);
          pendingIceCandidatesRef.current.forEach(candidate => {
            sendIceCandidate(candidate, targetRole);
          });
          pendingIceCandidatesRef.current = [];
        }
      } else {
        throw new Error('Signaling not available');
      }

    } catch (err) {
      console.error('❌ [WebRTC] Failed to start as caller:', err);
      setError({ message: err.message });
      setStatus('failed');
    }
  }, [localStream, initLocalStream, createPeerConnection, addLocalStreamToConnection, sendOffer, sendIceCandidate]);

  /**
   * Start as callee (wait for offer, send answer)
   */
  const startAsCallee = useCallback(async (myRole = 'PATIENT') => {
    try {
      console.log('📞 [WebRTC] Starting as callee...');
      setStatus('connecting');
      setError(null);

      // Get local stream
      let stream = localStream;
      if (!stream) {
        stream = await initLocalStream();
        if (!stream) {
          throw new Error('Failed to initialize local stream');
        }
      }

      // Create peer connection
      const pc = createPeerConnection(myRole);

      // Add local stream
      addLocalStreamToConnection(pc, stream);

      console.log('✅ [WebRTC] Ready to receive offer');

    } catch (err) {
      console.error('❌ [WebRTC] Failed to start as callee:', err);
      setError({ message: err.message });
      setStatus('failed');
    }
  }, [localStream, initLocalStream, createPeerConnection, addLocalStreamToConnection]);

  /**
   * Handle incoming OFFER
   */
  const handleOffer = useCallback(async (sdp, myRole = 'PATIENT') => {
    try {
      // State machine guard: prevent double offer handling
      if (negotiationStateRef.current === 'answering' || isAnswerSentRef.current) {
        console.warn('⚠️ [WebRTC] Already processing offer/answer, ignoring');
        return;
      }

      negotiationStateRef.current = 'answering';
      clearConnectionTimeout(); // Clear timeout when offer received

      console.log('📨 [WebRTC] Received OFFER');
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.error('❌ [WebRTC] No peer connection when receiving offer');
        negotiationStateRef.current = 'idle';
        return;
      }

      // Set remote description
      const offerDesc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp,
      });

      await pc.setRemoteDescription(offerDesc);
      console.log('✅ [WebRTC] Remote description set (offer)');

      // Create answer
      console.log('📋 [WebRTC] Creating answer...');
      const answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);
      console.log('✅ [WebRTC] Local description set (answer)');

      // Send answer via signaling
      if (sendAnswer) {
        const targetRole = myRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT';
        const sdpInfo = parseSDP(answer.sdp);
        console.log('📤 [WebRTC] Sending answer:', sdpInfo);

        sendAnswer(answer.sdp, targetRole);

        // Send any pending ICE candidates
        if (pendingIceCandidatesRef.current.length > 0) {
          console.log('📤 [WebRTC] Sending pending ICE candidates:', pendingIceCandidatesRef.current.length);
          pendingIceCandidatesRef.current.forEach(candidate => {
            sendIceCandidate(candidate, targetRole);
          });
          pendingIceCandidatesRef.current = [];
        }
      }

    } catch (err) {
      console.error('❌ [WebRTC] Failed to handle offer:', err);
      setError({ message: err.message });
      setStatus('failed');
    }
  }, [sendAnswer, sendIceCandidate]);

  /**
   * Handle incoming ANSWER
   */
  const handleAnswer = useCallback(async (sdp) => {
    try {
      // State machine guard: prevent double answer handling
      if (negotiationStateRef.current !== 'offering' || !isOfferSentRef.current) {
        console.warn('⚠️ [WebRTC] Not in offering state or no offer sent, ignoring answer');
        return;
      }

      clearConnectionTimeout(); // Clear timeout when answer received

      console.log('📨 [WebRTC] Received ANSWER');
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.error('❌ [WebRTC] No peer connection when receiving answer');
        negotiationStateRef.current = 'idle';
        return;
      }

      // Set remote description
      const answerDesc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp,
      });

      await pc.setRemoteDescription(answerDesc);
      console.log('✅ [WebRTC] Remote description set (answer)');

    } catch (err) {
      console.error('❌ [WebRTC] Failed to handle answer:', err);
      setError({ message: err.message });
      setStatus('failed');
      negotiationStateRef.current = 'idle'; // Reset on error
    }
  }, [clearConnectionTimeout]);

  /**
   * Handle incoming ICE candidate
   */
  const handleIceCandidate = useCallback(async (candidateData) => {
    try {
      const pc = peerConnectionRef.current;

      if (!pc) {
        console.warn('⚠️ [WebRTC] No peer connection, queueing ICE candidate');
        pendingIceCandidatesRef.current.push(candidateData);
        return;
      }

      if (pc.remoteDescription) {
        const candidate = parseIceCandidate(candidateData);

        if (candidate) {
          console.log('🧊 [WebRTC] Adding ICE candidate:', candidate.type || 'unknown');
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } else {
        console.warn('⚠️ [WebRTC] No remote description yet, queueing ICE candidate');
        pendingIceCandidatesRef.current.push(candidateData);
      }

    } catch (err) {
      console.error('❌ [WebRTC] Failed to add ICE candidate:', err);
    }
  }, []);

  /**
   * Toggle microphone
   */
  const toggleMic = useCallback(() => {
    if (!localStream) return false;

    const newMutedState = !isMuted;
    const success = toggleTrack(localStream, 'audio', !newMutedState);

    if (success) {
      setIsMuted(newMutedState);
    }

    return success;
  }, [localStream, isMuted]);

  /**
   * Toggle camera
   */
  const toggleCam = useCallback(() => {
    if (!localStream) return false;

    const newVideoOffState = !isVideoOff;
    const success = toggleTrack(localStream, 'video', !newVideoOffState);

    if (success) {
      setIsVideoOff(newVideoOffState);
    }

    return success;
  }, [localStream, isVideoOff]);

  /**
   * Start connection timeout (60s)
   * If not connected within timeout, show retry option
   */
  const startConnectionTimeout = useCallback(() => {
    // Clear existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    console.log('⏰ [WebRTC] Starting connection timeout (60s)...');

    connectionTimeoutRef.current = setTimeout(() => {
      if (status !== 'connected') {
        console.warn('⏰ [WebRTC] Connection timeout! Not connected within 60s');
        setStatus('timeout');
        setError({
          message: 'Connection timeout. The other participant may not be available.',
          type: 'timeout'
        });
        setCanRetry(true);
        negotiationStateRef.current = 'idle'; // Reset state machine
      }
    }, CONNECTION_TIMEOUT_MS);
  }, [status, CONNECTION_TIMEOUT_MS]);

  /**
   * Clear connection timeout
   */
  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
      console.log('⏰ [WebRTC] Connection timeout cleared');
    }
  }, []);

  /**
   * Retry connection
   */
  const retryConnection = useCallback(async (myRole) => {
    if (retryCountRef.current >= MAX_RETRIES) {
      console.error('❌ [WebRTC] Max retries reached');
      setError({
        message: 'Unable to establish connection after multiple attempts. Please try again later.',
        type: 'max_retries'
      });
      setCanRetry(false);
      return;
    }

    retryCountRef.current += 1;
    console.log(`🔄 [WebRTC] Retry attempt ${retryCountRef.current}/${MAX_RETRIES}`);

    // Cleanup existing connection
    await fullCleanup();

    // Reset state machine
    negotiationStateRef.current = 'idle';
    isOfferSentRef.current = false;
    isAnswerSentRef.current = false;

    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retry based on role
    if (myRole === 'DOCTOR' || myRole === 'caller') {
      await startAsCaller(myRole);
    } else {
      await startAsCallee(myRole);
    }
  }, [MAX_RETRIES]);

  /**
   * Handle BYE signal (other participant left)
   */
  const handleBye = useCallback(() => {
    console.log('👋 [WebRTC] Received BYE signal - other participant left');

    // Set status to ended
    setStatus('ended');
    setError({
      message: 'The other participant has left the call.',
      type: 'bye'
    });

    // Cleanup connection
    fullCleanup();
  }, []);

  /**
   * Full cleanup (stop streams, close peer, clear timeouts)
   */
  const fullCleanup = useCallback(() => {
    console.log('🧹 [WebRTC] Full cleanup...');

    // Clear connection timeout
    clearConnectionTimeout();

    // Stop local stream
    if (localStream) {
      stopMediaStream(localStream);
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      cleanupPeerConnection(peerConnectionRef.current);
      peerConnectionRef.current = null;
    }

    // Clear remote stream
    setRemoteStream(null);

    // Clear pending ICE candidates
    pendingIceCandidatesRef.current = [];

    // Reset state machine
    negotiationStateRef.current = 'idle';
    isOfferSentRef.current = false;
    isAnswerSentRef.current = false;

    console.log('✅ [WebRTC] Cleanup complete');
  }, [localStream, clearConnectionTimeout]);

  /**
   * Hang up (close connection)
   */
  const hangUp = useCallback(() => {
    console.log('📞 [WebRTC] Hanging up...');

    fullCleanup();

    setStatus('idle');
    setError(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCanRetry(false);
    retryCountRef.current = 0;

    console.log('✅ [WebRTC] Hang up complete');
  }, [fullCleanup]);

  /**
   * Cleanup on unmount or navigation
   * Ensures all resources are released when component unmounts
   */
  useEffect(() => {
    return () => {
      console.log('🧹 [WebRTC] Cleaning up on unmount/navigation');

      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      // Stop local stream
      if (localStream) {
        stopMediaStream(localStream);
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        cleanupPeerConnection(peerConnectionRef.current);
      }

      console.log('✅ [WebRTC] Cleanup on unmount complete');
    };
  }, []); // Empty deps - only run on unmount

  /**
   * Clear connection timeout when connected
   */
  useEffect(() => {
    if (status === 'connected') {
      clearConnectionTimeout();
      // Reset retry counter on successful connection
      retryCountRef.current = 0;
      // Set state machine to stable
      negotiationStateRef.current = 'stable';
    }
  }, [status, clearConnectionTimeout]);

  return {
    // State
    localStream,
    remoteStream,
    status,
    error,
    isMuted,
    isVideoOff,
    canRetry,

    // Actions
    startAsCaller,
    startAsCallee,
    toggleMic,
    toggleCam,
    hangUp,
    retryConnection,

    // Signal handlers (to be called from signaling hook)
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleBye,
  };
};

export default useWebrtcPeer;
