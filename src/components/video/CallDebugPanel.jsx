import React, { useState } from 'react';

/**
 * Development-Only Debug Panel for Video Consultations
 * 
 * Shows real-time WebSocket, STOMP, and WebRTC peer connection states
 * Only renders in development mode
 * 
 * Props:
 * - wsState: WebSocket client state object
 * - webrtcState: WebRTC peer state object
 * - onClose: Callback to close panel
 */
const CallDebugPanel = ({ wsState = {}, webrtcState = {}, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    ws: true,
    stomp: true,
    subscriptions: true,
    signals: true,
    peer: true,
  });

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96 max-h-96 bg-gray-900 text-gray-100 text-xs border-t-2 border-l-2 border-yellow-500 shadow-2xl overflow-hidden flex flex-col z-50">
      {/* Header */}
      <div className="bg-yellow-900 px-4 py-2 flex justify-between items-center border-b border-yellow-500">
        <div className="font-bold text-yellow-300">🐛 Debug Panel</div>
        <button
          onClick={onClose}
          className="text-yellow-300 hover:text-white text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* WebSocket Status */}
        <DebugSection
          title="🔌 WebSocket Status"
          section="ws"
          expanded={expandedSections.ws}
          onToggle={toggleSection}
        >
          <DebugRow label="Connected" value={wsState.isConnected ? '✅ Yes' : '❌ No'} />
          <DebugRow label="Room ID" value={wsState.roomId || 'N/A'} />
          <DebugRow label="Token" value={wsState.token ? '✅ Present' : '❌ Missing'} />
          <DebugRow label="Reconnect Attempts" value={wsState.reconnectAttempts || 0} />
          <DebugRow label="Max Reconnect Attempts" value={wsState.maxReconnectAttempts || 10} />
        </DebugSection>

        {/* STOMP Status */}
        <DebugSection
          title="📡 STOMP Status"
          section="stomp"
          expanded={expandedSections.stomp}
          onToggle={toggleSection}
        >
          <DebugRow label="Client Ready" value={wsState.stompClient ? '✅ Yes' : '❌ No'} />
          <DebugRow label="Socket State" value={wsState.socket?.readyState || 'N/A'} />
          <DebugRow label="Heartbeat In" value={wsState.stompClient?.heartbeatIncoming || 'N/A'} />
          <DebugRow label="Heartbeat Out" value={wsState.stompClient?.heartbeatOutgoing || 'N/A'} />
        </DebugSection>

        {/* Subscriptions */}
        <DebugSection
          title="📋 Subscriptions"
          section="subscriptions"
          expanded={expandedSections.subscriptions}
          onToggle={toggleSection}
        >
          <DebugRow
            label="Signal"
            value={wsState.signalSubscription ? '✅ Active' : '❌ Inactive'}
          />
          <DebugRow
            label="Presence"
            value={wsState.presenceSubscription ? '✅ Active' : '❌ Inactive'}
          />
          <DebugRow label="Signal Destination" value={`/user/webrtc/${wsState.roomId || '?'}/signal`} />
          <DebugRow
            label="Presence Destination"
            value={`/topic/consultations/${wsState.roomId || '?'}/presence`}
          />
        </DebugSection>

        {/* Last Signaling Messages */}
        <DebugSection
          title="💬 Last 10 Signals"
          section="signals"
          expanded={expandedSections.signals}
          onToggle={toggleSection}
        >
          <div className="max-h-40 overflow-y-auto">
            {wsState.lastSignals && wsState.lastSignals.length > 0 ? (
              wsState.lastSignals.map((signal, idx) => (
                <div key={idx} className="px-3 py-1 border-b border-gray-700 bg-gray-800">
                  <span className="text-blue-300">[{signal.timestamp}]</span>
                  <span className="text-green-300 ml-2">{signal.type}</span>
                  {signal.from && <span className="text-yellow-300 ml-2">← {signal.from}</span>}
                  {signal.to && <span className="text-cyan-300 ml-2">→ {signal.to}</span>}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No signals yet</div>
            )}
          </div>
        </DebugSection>

        {/* Peer Connection State */}
        <DebugSection
          title="🎥 WebRTC Peer State"
          section="peer"
          expanded={expandedSections.peer}
          onToggle={toggleSection}
        >
          <DebugRow label="Status" value={webrtcState.status || 'idle'} />
          <DebugRow label="Connection State" value={webrtcState.connectionState || 'N/A'} />
          <DebugRow label="ICE Connection" value={webrtcState.iceConnectionState || 'N/A'} />
          <DebugRow label="Signaling State" value={webrtcState.signalingState || 'N/A'} />
          <DebugRow label="Local Stream" value={webrtcState.localStream ? '✅ Active' : '❌ No'} />
          <DebugRow label="Remote Stream" value={webrtcState.remoteStream ? '✅ Active' : '❌ No'} />
          <DebugRow label="Mic" value={webrtcState.isMuted ? '🔇 Muted' : '🎤 Active'} />
          <DebugRow label="Camera" value={webrtcState.isVideoOff ? '📹 Off' : '🎬 On'} />
          <DebugRow label="Negotiation State" value={webrtcState.negotiationState || 'idle'} />
          <DebugRow label="Pending ICE" value={webrtcState.pendingIceCandidates || 0} />
        </DebugSection>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-gray-400 text-xs">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

/**
 * Collapsible section component
 */
const DebugSection = ({ title, section, expanded, onToggle, children }) => (
  <div className="border-b border-gray-700">
    <button
      onClick={() => onToggle(section)}
      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 flex justify-between items-center text-left font-semibold text-yellow-300 transition"
    >
      <span>{title}</span>
      <span>{expanded ? '▼' : '▶'}</span>
    </button>
    {expanded && <div className="bg-gray-900 px-3 py-2">{children}</div>}
  </div>
);

/**
 * Debug row component
 */
const DebugRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-1 border-b border-gray-800">
    <span className="text-gray-400">{label}:</span>
    <span className="text-right text-gray-200 font-mono break-words ml-2 max-w-xs">{value}</span>
  </div>
);

export default CallDebugPanel;
