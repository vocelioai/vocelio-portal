import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Monitor, MonitorOff, Settings, Users, MessageSquare,
  Maximize2, Minimize2, Copy, Share2, Circle, Square,
  Volume2, VolumeX, Camera, CameraOff
} from 'lucide-react';
import webrtcService from '../../services/webrtcService.js';

// WebRTC Video Call Interface - Enterprise Grade
const WebRTCVideoCall = ({ 
  roomId, 
  onCallEnd, 
  initialParticipants = [],
  showControls = true,
  autoStart = false 
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [isRecording, setIsRecording] = useState(false);
  const [showPhoneBridge, setShowPhoneBridge] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const containerRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  // ============================================================================
  // WEBRTC INTEGRATION
  // ============================================================================

  /**
   * Initialize WebRTC connection
   */
  const initializeCall = useCallback(async () => {
    try {
      setIsConnecting(true);
      console.log('🎥 Initializing video call:', roomId);

      // Initialize WebRTC service
      const connectionId = await webrtcService.initializeConnection(
        roomId, 
        localStorage.getItem('user_id') || `user_${Date.now()}`
      );

      console.log('✅ WebRTC connection established:', connectionId);
      setIsConnected(true);

    } catch (error) {
      console.error('❌ Call initialization failed:', error);
      // Show user-friendly error
      alert('Failed to initialize video call. Please check your camera and microphone permissions.');
    } finally {
      setIsConnecting(false);
    }
  }, [roomId]);

  /**
   * Setup WebRTC event listeners
   */
  useEffect(() => {
    // Local stream handler
    const handleLocalStream = (stream) => {
      console.log('📹 Local stream received');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    // Remote stream handler
    const handleRemoteStream = ({ participantId, stream }) => {
      console.log('📺 Remote stream received from:', participantId);
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(participantId, stream);
        return newStreams;
      });
      
      // Set stream to video element
      const videoRef = remoteVideoRefs.current.get(participantId);
      if (videoRef) {
        videoRef.srcObject = stream;
      }
    };

    // Participant management
    const handleParticipantJoined = (participant) => {
      console.log('👋 Participant joined:', participant.id);
      setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
    };

    const handleParticipantLeft = (participant) => {
      console.log('👋 Participant left:', participant.id);
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
      
      // Remove remote stream
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(participant.id);
        return newStreams;
      });
    };

    // Chat message handler
    const handleChatMessage = (message) => {
      setChatMessages(prev => [...prev, message]);
    };

    // Media control handlers
    const handleAudioToggled = (enabled) => {
      setIsAudioEnabled(enabled);
    };

    const handleVideoToggled = (enabled) => {
      setIsVideoEnabled(enabled);
    };

    const handleScreenShareStarted = () => {
      setIsScreenSharing(true);
    };

    const handleScreenShareStopped = () => {
      setIsScreenSharing(false);
    };

    // Phone participant handler
    const handlePhoneParticipantAdded = (participant) => {
      setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
    };

    // Connection state handler
    const handleConnectionState = ({ participantId, state }) => {
      if (state === 'connected') {
        setConnectionQuality('good');
      } else if (state === 'connecting') {
        setConnectionQuality('poor');
      } else if (state === 'disconnected' || state === 'failed') {
        setConnectionQuality('bad');
        // Remove participant if connection failed
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      }
    };

    // Register event listeners
    webrtcService.on('local_stream', handleLocalStream);
    webrtcService.on('remote_stream', handleRemoteStream);
    webrtcService.on('participant_joined', handleParticipantJoined);
    webrtcService.on('participant_left', handleParticipantLeft);
    webrtcService.on('chat_message', handleChatMessage);
    webrtcService.on('audio_toggled', handleAudioToggled);
    webrtcService.on('video_toggled', handleVideoToggled);
    webrtcService.on('screen_share_started', handleScreenShareStarted);
    webrtcService.on('screen_share_stopped', handleScreenShareStopped);
    webrtcService.on('phone_participant_added', handlePhoneParticipantAdded);
    webrtcService.on('connection_state', handleConnectionState);

    // Cleanup on unmount
    return () => {
      webrtcService.off('local_stream', handleLocalStream);
      webrtcService.off('remote_stream', handleRemoteStream);
      webrtcService.off('participant_joined', handleParticipantJoined);
      webrtcService.off('participant_left', handleParticipantLeft);
      webrtcService.off('chat_message', handleChatMessage);
      webrtcService.off('audio_toggled', handleAudioToggled);
      webrtcService.off('video_toggled', handleVideoToggled);
      webrtcService.off('screen_share_started', handleScreenShareStarted);
      webrtcService.off('screen_share_stopped', handleScreenShareStopped);
      webrtcService.off('phone_participant_added', handlePhoneParticipantAdded);
      webrtcService.off('connection_state', handleConnectionState);
    };
  }, []);

  /**
   * Auto-start call if enabled
   */
  useEffect(() => {
    if (autoStart && roomId && !isConnected && !isConnecting) {
      initializeCall();
    }
  }, [autoStart, roomId, isConnected, isConnecting, initializeCall]);

  /**
   * Update remote video refs when participants change
   */
  useEffect(() => {
    participants.forEach(participant => {
      if (!remoteVideoRefs.current.has(participant.id)) {
        remoteVideoRefs.current.set(participant.id, React.createRef());
      }
    });

    // Set streams to new video elements
    remoteStreams.forEach((stream, participantId) => {
      const videoRef = remoteVideoRefs.current.get(participantId);
      if (videoRef && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, [participants, remoteStreams]);

  // ============================================================================
  // CALL CONTROLS
  // ============================================================================

  const toggleAudio = () => {
    webrtcService.toggleAudio();
  };

  const toggleVideo = () => {
    webrtcService.toggleVideo();
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webrtcService.stopScreenShare();
      } else {
        await webrtcService.startScreenShare();
      }
    } catch (error) {
      console.error('Screen share toggle failed:', error);
      alert('Screen sharing failed. Please try again.');
    }
  };

  const endCall = async () => {
    try {
      await webrtcService.disconnect();
      setIsConnected(false);
      setParticipants([]);
      setRemoteStreams(new Map());
      setLocalStream(null);
      
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error) {
      console.error('End call failed:', error);
    }
  };

  const bridgePhoneCall = async (phoneNumber) => {
    try {
      await webrtcService.bridgePhoneCall(phoneNumber);
      setShowPhoneBridge(false);
    } catch (error) {
      console.error('Phone bridge failed:', error);
      alert('Failed to bridge phone call. Please try again.');
    }
  };

  const sendChatMessage = (message) => {
    webrtcService.sendChatMessage(message);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/video-call/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Room link copied to clipboard!');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Get participant grid layout class based on count
   */
  const getGridLayout = () => {
    const totalParticipants = participants.length + (localStream ? 1 : 0);
    
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  /**
   * Get connection quality indicator
   */
  const ConnectionQualityIndicator = () => {
    const getQualityColor = () => {
      switch (connectionQuality) {
        case 'good': return 'text-green-500';
        case 'poor': return 'text-yellow-500';
        case 'bad': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className={`flex items-center space-x-1 ${getQualityColor()}`}>
        <div className="w-2 h-2 rounded-full bg-current"></div>
        <span className="text-sm capitalize">{connectionQuality}</span>
      </div>
    );
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No room ID provided</p>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96 md:h-[500px]'}`}
    >
      {/* Video Grid */}
      <div className={`grid gap-2 p-4 h-full ${getGridLayout()}`}>
        
        {/* Local Video */}
        {localStream && (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden group">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {!isVideoEnabled && '(Camera Off)'}
            </div>
            {!isAudioEnabled && (
              <div className="absolute top-2 right-2 bg-red-500 p-1 rounded">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Remote Videos */}
        {participants.map(participant => {
          if (participant.type === 'phone') {
            // Phone participant - show audio-only UI
            return (
              <div key={participant.id} className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group">
                <div className="text-center text-white">
                  <Phone className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">{participant.name || participant.id}</p>
                  <p className="text-sm opacity-75">Phone Participant</p>
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  📞 {participant.number}
                </div>
              </div>
            );
          }

          return (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden group">
              <video
                ref={ref => {
                  if (ref) {
                    remoteVideoRefs.current.set(participant.id, ref);
                    const stream = remoteStreams.get(participant.id);
                    if (stream) {
                      ref.srcObject = stream;
                    }
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {participant.name || participant.id}
              </div>
              {participant.isAudioMuted && (
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call Controls */}
      {showControls && isConnected && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-75 rounded-full px-4 py-2">
          
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-400 text-white'
            }`}
            title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-400 text-white'
            }`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`p-2 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          {/* Phone Bridge */}
          <button
            onClick={() => setShowPhoneBridge(true)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            title="Add Phone Participant"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-full transition-colors ${
              showChat 
                ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Copy Room Link */}
          <button
            onClick={copyRoomLink}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            title="Copy Room Link"
          >
            <Copy className="w-5 h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-2 rounded-full bg-red-500 hover:bg-red-400 text-white transition-colors"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Room: {roomId}
        </div>
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {participants.length + 1} participants
        </div>
        <ConnectionQualityIndicator />
      </div>

      {/* Join Call Button */}
      {!isConnected && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <button
            onClick={initializeCall}
            className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span>Join Call</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WebRTCVideoCall;
