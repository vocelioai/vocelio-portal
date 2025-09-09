import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, VideoOff, Camera, CameraOff, Mic, MicOff, Volume2, VolumeX,
  Monitor, MonitorSpeaker, Settings, Users, ScreenShare, ScreenShareOff,
  Maximize2, Minimize2, RotateCcw, Phone, PhoneOff, Clock
} from 'lucide-react';

// ===== COPILOT PROMPT #3: Video Channel Panel =====
const VideoChannelPanel = ({ isActive, onClose }) => {
  const [videoState, setVideoState] = useState('idle'); // idle, incoming, active, hold
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [callDuration, setCallDuration] = useState(0);
  const [videoQuality, setVideoQuality] = useState('HD');

  // Mock session data
  const sessions = [];
  const sessionOps = {
    createSession: () => Promise.resolve(),
    updateSession: () => Promise.resolve()
  };

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimer = useRef(null);
  const mediaStream = useRef(null);

  // Timer for active calls
  useEffect(() => {
    if (videoState === 'active') {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimer.current);
      if (videoState === 'idle') setCallDuration(0);
    }

    return () => clearInterval(callTimer.current);
  }, [videoState]);

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      mediaStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      console.log('📹 Video channel: Camera initialized');
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
    }
  }, []);

  // Cleanup camera stream
  const cleanupCamera = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
  }, []);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video control handlers
  const handleStartCall = useCallback(async () => {
    setVideoState('active');
    setCallDuration(0);
    await initializeCamera();
    console.log('📹 Video channel: Call started');
  }, [initializeCamera]);

  const handleEndCall = useCallback(() => {
    setVideoState('idle');
    setCallDuration(0);
    setScreenSharing(false);
    cleanupCamera();
    console.log('📹 Video channel: Call ended');
  }, [cleanupCamera]);

  const toggleLocalVideo = useCallback(() => {
    setLocalVideoEnabled(!localVideoEnabled);
    if (mediaStream.current) {
      const videoTrack = mediaStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !localVideoEnabled;
      }
    }
    console.log(`📹 Local video: ${!localVideoEnabled ? 'enabled' : 'disabled'}`);
  }, [localVideoEnabled]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(!audioEnabled);
    if (mediaStream.current) {
      const audioTrack = mediaStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    console.log(`🎤 Audio: ${!audioEnabled ? 'enabled' : 'disabled'}`);
  }, [audioEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen capture
        if (mediaStream.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = mediaStream.current.getVideoTracks()[0];
          // In a real implementation, you'd replace the track in the peer connection
        }
        
        setScreenSharing(true);
        console.log('🖥️ Screen sharing started');
      } else {
        // Stop screen sharing and restore camera
        await initializeCamera();
        setScreenSharing(false);
        console.log('🖥️ Screen sharing stopped');
      }
    } catch (error) {
      console.error('❌ Screen sharing failed:', error);
    }
  }, [screenSharing, initializeCamera]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
    console.log(`🖥️ Full screen: ${!isFullScreen ? 'enabled' : 'disabled'}`);
  }, [isFullScreen]);

  // Simulate incoming video call
  const simulateIncomingCall = useCallback(() => {
    setVideoState('incoming');
    console.log('📹 Video channel: Incoming call simulation');
  }, []);

  if (!isActive) return null;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${isFullScreen ? 'fixed inset-4 z-50' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Video Channel</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>{videoState}</span>
              {videoState === 'active' && (
                <>
                  <span>•</span>
                  <span>{formatDuration(callDuration)}</span>
                  <span>•</span>
                  <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quality Selector */}
          <select 
            value={videoQuality} 
            onChange={(e) => setVideoQuality(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="SD">SD (480p)</option>
            <option value="HD">HD (720p)</option>
            <option value="FHD">FHD (1080p)</option>
          </select>
          
          <button
            onClick={toggleFullScreen}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Display Area */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ height: isFullScreen ? '70vh' : '300px' }}>
        {videoState === 'idle' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Active Video Call</p>
              <p className="text-sm opacity-75">Start a call to begin video chat</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Remote Video (Main) */}
            <video 
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            >
              {/* Placeholder for remote video */}
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12" />
                  </div>
                  <p className="text-xl font-medium">Sarah Johnson</p>
                  <p className="text-sm opacity-75">Customer</p>
                </div>
              </div>
            </video>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video 
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {!localVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <CameraOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black bg-opacity-50 rounded-full px-6 py-3 flex items-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    audioEnabled 
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleLocalVideo}
                  className={`p-3 rounded-full ${
                    localVideoEnabled 
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {localVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full ${
                    screenSharing 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {screenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Call Info Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{formatDuration(callDuration)}</span>
                {screenSharing && (
                  <>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-xs opacity-75">Screen Sharing</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      {videoState === 'idle' && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={simulateIncomingCall}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span>Start Video Call</span>
          </button>
        </div>
      )}

      {videoState === 'incoming' && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStartCall}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 flex items-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span>Accept</span>
          </button>
          <button
            onClick={handleEndCall}
            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 flex items-center space-x-2"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Decline</span>
          </button>
        </div>
      )}

      {/* Audio Controls (when not in full video mode) */}
      {videoState === 'active' && !isFullScreen && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Audio Settings</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="80"
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <Volume2 className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Video Tools</span>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            🎬 Record Session
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            💬 Chat Panel
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            📁 File Share
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChannelPanel;
