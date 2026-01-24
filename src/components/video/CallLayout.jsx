import React from 'react';
import PropTypes from 'prop-types';
import CallHeader from './CallHeader';
import CallControls from './CallControls';
import VideoTile from './VideoTile';

/**
 * Call Layout Component
 *
 * Main layout for video consultation
 * Split view with local and remote video tiles
 * Accepts MediaStream objects for video rendering
 */
const CallLayout = ({
  localParticipantName = 'You',
  remoteParticipantName = 'Participant',
  remoteParticipantRole = 'Doctor',
  connectionStatus = 'connecting',
  duration = '00:00',
  isMuted = false,
  isVideoOff = false,
  isRemoteVideoOff = false,
  localStream = null,
  remoteStream = null,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  connectionQuality = 'good',
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <CallHeader
        participantName={remoteParticipantName}
        participantRole={remoteParticipantRole}
        connectionStatus={connectionStatus}
        duration={duration}
        microphoneOn={!isMuted}
        cameraOn={!isVideoOff}
        connectionQuality={connectionQuality}
      />

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Remote Video (Primary) */}
          <div className="relative">
            <VideoTile
              participantName={remoteParticipantName}
              isLocal={false}
              isMuted={false} // Remote mute status from WebRTC
              isVideoOff={isRemoteVideoOff}
              stream={remoteStream}
              className="h-full"
            />

            {/* Connection Status Overlay */}
            {connectionStatus !== 'connected' && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  {connectionStatus === 'connecting' && (
                    <>
                      <svg className="animate-spin w-12 h-12 text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-white text-lg font-medium">Connecting...</p>
                      <p className="text-gray-300 text-sm mt-2">Please wait while we establish the connection</p>
                    </>
                  )}

                  {connectionStatus === 'waiting' && (
                    <>
                      <svg className="w-12 h-12 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white text-lg font-medium">Waiting for {remoteParticipantRole}...</p>
                      <p className="text-gray-300 text-sm mt-2">The consultation will start once they join</p>
                    </>
                  )}

                  {connectionStatus === 'ended' && (
                    <>
                      <svg className="w-12 h-12 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white text-lg font-medium">Consultation Ended</p>
                      <p className="text-gray-300 text-sm mt-2">Thank you for using our service</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Secondary) */}
          <div className="relative">
            <VideoTile
              participantName={localParticipantName}
              isLocal={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              stream={localStream}
              className="h-full"
            />

            {/* Local Preview Label */}
            <div className="absolute top-4 left-4 bg-primary-600 text-white text-sm font-semibold px-3 py-1 rounded-lg">
              Your Video
            </div>
          </div>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
          disabled={connectionStatus === 'ended'}
        />
      </div>
    </div>
  );
};

CallLayout.propTypes = {
  localParticipantName: PropTypes.string,
  remoteParticipantName: PropTypes.string,
  remoteParticipantRole: PropTypes.string,
  connectionStatus: PropTypes.oneOf(['connecting', 'waiting', 'connected', 'ended']),
  duration: PropTypes.string,
  isMuted: PropTypes.bool,
  isVideoOff: PropTypes.bool,
  isRemoteVideoOff: PropTypes.bool,
  localStream: PropTypes.object, // MediaStream
  remoteStream: PropTypes.object, // MediaStream
  onToggleMute: PropTypes.func.isRequired,
  onToggleVideo: PropTypes.func.isRequired,
  onEndCall: PropTypes.func.isRequired,
  connectionQuality: PropTypes.oneOf(['excellent', 'good', 'fair', 'poor']),
};

export default CallLayout;
