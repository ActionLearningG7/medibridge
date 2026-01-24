import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Video Tile Component
 *
 * Displays a video feed (local or remote)
 * Shows participant name, status, and controls
 * Accepts MediaStream and automatically attaches to video element
 */
const VideoTile = ({
  participantName,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  stream = null,
  className = ''
}) => {
  const videoRef = useRef(null);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log(`🎥 [VideoTile] Attaching ${isLocal ? 'local' : 'remote'} stream to video element`);
      videoRef.current.srcObject = stream;
    }

    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, isLocal]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to prevent echo
        className={`w-full h-full object-cover ${isVideoOff || !stream ? 'hidden' : ''}`}
      />

      {/* Video Off Placeholder */}
      {(isVideoOff || !stream) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-3xl font-semibold text-white">
                {participantName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-lg font-medium">{participantName}</p>
            <p className="text-gray-400 text-sm mt-1">
              {!stream ? 'Connecting...' : 'Video is off'}
            </p>
          </div>
        </div>
      )}

      {/* Participant Info Badge */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-lg px-3 py-2 flex items-center space-x-2">
        <span className="text-white text-sm font-medium">
          {participantName} {isLocal && '(You)'}
        </span>

        {/* Mute Indicator */}
        {isMuted && (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Local Badge */}
      {isLocal && (
        <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          YOU
        </div>
      )}
    </div>
  );
};

VideoTile.propTypes = {
  participantName: PropTypes.string.isRequired,
  isLocal: PropTypes.bool,
  isMuted: PropTypes.bool,
  isVideoOff: PropTypes.bool,
  stream: PropTypes.object, // MediaStream object
  className: PropTypes.string,
};

export default VideoTile;
