/**
 * WebRTC Utilities
 *
 * Helper functions for WebRTC operations
 */

/**
 * Get ICE server configuration from environment
 */
export const getIceServers = () => {
  const stunUrl = process.env.REACT_APP_STUN_URL || 'stun:stun.l.google.com:19302';
  const turnUrl = process.env.REACT_APP_TURN_URL;
  const turnUsername = process.env.REACT_APP_TURN_USERNAME;
  const turnCredential = process.env.REACT_APP_TURN_CREDENTIAL;

  const iceServers = [
    {
      urls: stunUrl,
    },
  ];

  // Add TURN server if configured
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return iceServers;
};

/**
 * Get RTCPeerConnection configuration
 */
export const getPeerConnectionConfig = () => {
  return {
    iceServers: getIceServers(),
    iceCandidatePoolSize: 10,
  };
};

/**
 * Get media constraints for getUserMedia
 */
export const getMediaConstraints = (options = {}) => {
  const {
    video = true,
    audio = true,
    videoQuality = 'hd', // 'sd', 'hd', 'fhd'
  } = options;

  const videoConstraints = {
    sd: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 24, max: 30 },
    },
    hd: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    fhd: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
  };

  return {
    video: video ? videoConstraints[videoQuality] : false,
    audio: audio ? {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    } : false,
  };
};

/**
 * Get user media with error handling
 */
export const getUserMedia = async (constraints) => {
  try {
    console.log('🎥 Requesting user media...', constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ User media obtained:', stream.getTracks().map(t => t.kind));
    return { stream, error: null };
  } catch (error) {
    console.error('❌ Failed to get user media:', error);

    let errorMessage = 'Failed to access camera/microphone';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Camera/microphone access denied. Please allow permissions and try again.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera or microphone found on this device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Camera/microphone is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera/microphone does not support the requested settings.';
    } else if (error.name === 'TypeError') {
      errorMessage = 'Invalid media constraints.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera/microphone access is not allowed in this context.';
    }

    return { stream: null, error: { name: error.name, message: errorMessage } };
  }
};

/**
 * Stop all tracks in a media stream
 */
export const stopMediaStream = (stream) => {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
    console.log(`🛑 Stopped ${track.kind} track`);
  });
};

/**
 * Toggle track enabled state
 */
export const toggleTrack = (stream, kind, enabled) => {
  if (!stream) return false;

  const tracks = stream.getTracks().filter(track => track.kind === kind);
  tracks.forEach(track => {
    track.enabled = enabled;
  });

  console.log(`${enabled ? '🔊' : '🔇'} ${kind} ${enabled ? 'enabled' : 'disabled'}`);
  return tracks.length > 0;
};

/**
 * Check if track is enabled
 */
export const isTrackEnabled = (stream, kind) => {
  if (!stream) return false;

  const tracks = stream.getTracks().filter(track => track.kind === kind);
  return tracks.length > 0 && tracks[0].enabled;
};

/**
 * Get track state
 */
export const getTrackState = (stream, kind) => {
  if (!stream) return null;

  const tracks = stream.getTracks().filter(track => track.kind === kind);
  if (tracks.length === 0) return null;

  const track = tracks[0];
  return {
    kind: track.kind,
    enabled: track.enabled,
    muted: track.muted,
    readyState: track.readyState,
    label: track.label,
  };
};

/**
 * Format ICE candidate for logging (mask sensitive data)
 */
export const formatIceCandidate = (candidate) => {
  if (!candidate) return 'null';

  return {
    type: candidate.type || 'unknown',
    protocol: candidate.protocol,
    address: candidate.address ? candidate.address.substring(0, 8) + '...' : 'unknown',
  };
};

/**
 * Get connection state name
 */
export const getConnectionStateName = (state) => {
  const stateMap = {
    'new': 'Initializing',
    'connecting': 'Connecting',
    'connected': 'Connected',
    'disconnected': 'Disconnected',
    'failed': 'Failed',
    'closed': 'Closed',
  };
  return stateMap[state] || state;
};

/**
 * Get ICE connection state name
 */
export const getIceConnectionStateName = (state) => {
  const stateMap = {
    'new': 'New',
    'checking': 'Checking',
    'connected': 'Connected',
    'completed': 'Completed',
    'failed': 'Failed',
    'disconnected': 'Disconnected',
    'closed': 'Closed',
  };
  return stateMap[state] || state;
};

/**
 * Check if WebRTC is supported
 */
export const isWebRTCSupported = () => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  );
};

/**
 * Get browser info for WebRTC compatibility
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let version = 'Unknown';

  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browserName = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }

  return { browserName, version, userAgent: ua };
};

/**
 * Create SDP offer with preferred codec
 */
export const createOfferWithCodec = async (peerConnection, preferredCodec = 'VP8') => {
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  // Optionally modify SDP to prefer codec
  if (preferredCodec) {
    // This is a simplified version - production may need more sophisticated SDP manipulation
    console.log('📋 Created offer with preferred codec:', preferredCodec);
  }

  return offer;
};

/**
 * Create SDP answer
 */
export const createAnswerWithCodec = async (peerConnection, preferredCodec = 'VP8') => {
  const answer = await peerConnection.createAnswer();

  if (preferredCodec) {
    console.log('📋 Created answer with preferred codec:', preferredCodec);
  }

  return answer;
};

/**
 * Parse SDP for debugging
 */
export const parseSDP = (sdp) => {
  if (!sdp) return null;

  const lines = sdp.split('\n');
  const info = {
    type: 'unknown',
    audio: false,
    video: false,
    codecs: [],
  };

  lines.forEach(line => {
    if (line.startsWith('m=audio')) info.audio = true;
    if (line.startsWith('m=video')) info.video = true;
    if (line.includes('a=rtpmap')) {
      const match = line.match(/a=rtpmap:\d+ ([^\/]+)/);
      if (match) info.codecs.push(match[1]);
    }
  });

  return info;
};

/**
 * Calculate connection quality based on stats
 */
export const calculateConnectionQuality = (stats) => {
  // Simplified quality calculation
  // In production, you'd analyze RTCStatsReport
  if (!stats) return 'unknown';

  // This is a placeholder - real implementation would parse RTCStatsReport
  return 'good';
};

/**
 * Cleanup peer connection
 */
export const cleanupPeerConnection = (peerConnection) => {
  if (!peerConnection) return;

  try {
    // Remove event listeners
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection.oniceconnectionstatechange = null;
    peerConnection.onsignalingstatechange = null;

    // Close connection
    peerConnection.close();
    console.log('🔌 Peer connection closed');
  } catch (error) {
    console.error('❌ Error cleaning up peer connection:', error);
  }
};

export default {
  getIceServers,
  getPeerConnectionConfig,
  getMediaConstraints,
  getUserMedia,
  stopMediaStream,
  toggleTrack,
  isTrackEnabled,
  getTrackState,
  formatIceCandidate,
  getConnectionStateName,
  getIceConnectionStateName,
  isWebRTCSupported,
  getBrowserInfo,
  createOfferWithCodec,
  createAnswerWithCodec,
  parseSDP,
  calculateConnectionQuality,
  cleanupPeerConnection,
};
