import { useState, useEffect, useCallback, useRef } from 'react';
import webrtcService from '../services/webrtcService.js';

/**
 * Custom hook for WebRTC functionality
 * Provides easy integration with existing React components
 */
export const useWebRTC = (roomId, options = {}) => {
  const {
    autoStart = false,
    enableAudio = true,
    enableVideo = true,
    onConnectionChange,
    onParticipantChange,
    onError
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(enableAudio);
  const [isVideoEnabled, setIsVideoEnabled] = useState(enableVideo);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [error, setError] = useState(null);

  // Refs for cleanup
  const handlersRef = useRef({});

  // ============================================================================
  // WEBRTC EVENT HANDLERS
  // ============================================================================
  
  useEffect(() => {
    if (!roomId) return;

    // Define event handlers
    const handlers = {
      local_stream: (stream) => {
        console.log('🎥 Local stream received via hook');
        setLocalStream(stream);
      },

      remote_stream: ({ participantId, stream }) => {
        console.log('📺 Remote stream received via hook:', participantId);
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.set(participantId, stream);
          return newStreams;
        });
      },

      participant_joined: (participant) => {
        console.log('👋 Participant joined via hook:', participant.id);
        setParticipants(prev => {
          const updated = [...prev.filter(p => p.id !== participant.id), participant];
          if (onParticipantChange) {
            onParticipantChange(updated);
          }
          return updated;
        });
      },

      participant_left: (participant) => {
        console.log('👋 Participant left via hook:', participant.id);
        setParticipants(prev => {
          const updated = prev.filter(p => p.id !== participant.id);
          if (onParticipantChange) {
            onParticipantChange(updated);
          }
          return updated;
        });
        
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(participant.id);
          return newStreams;
        });
      },

      audio_toggled: (enabled) => {
        setIsAudioEnabled(enabled);
      },

      video_toggled: (enabled) => {
        setIsVideoEnabled(enabled);
      },

      screen_share_started: () => {
        setIsScreenSharing(true);
      },

      screen_share_stopped: () => {
        setIsScreenSharing(false);
      },

      connection_state: ({ participantId, state }) => {
        if (state === 'connected') {
          setConnectionQuality('good');
        } else if (state === 'connecting') {
          setConnectionQuality('poor');
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionQuality('bad');
        }

        if (onConnectionChange) {
          onConnectionChange({ participantId, state });
        }
      },

      signaling_disconnected: () => {
        setIsConnected(false);
        if (onConnectionChange) {
          onConnectionChange({ state: 'disconnected' });
        }
      }
    };

    // Store handlers for cleanup
    handlersRef.current = handlers;

    // Register event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      webrtcService.on(event, handler);
    });

    // Auto-start if enabled
    if (autoStart) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        webrtcService.off(event, handler);
      });
    };
  }, [roomId, autoStart, onConnectionChange, onParticipantChange]);

  // ============================================================================
  // WEBRTC ACTIONS
  // ============================================================================

  /**
   * Connect to WebRTC room
   */
  const connect = useCallback(async () => {
    if (!roomId || isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);

      const userId = localStorage.getItem('user_id') || `user_${Date.now()}`;
      const connectionId = await webrtcService.initializeConnection(roomId, userId);

      console.log('✅ WebRTC connected via hook:', connectionId);
      setIsConnected(true);

      return connectionId;

    } catch (error) {
      console.error('❌ WebRTC connection failed:', error);
      setError(error.message || 'Connection failed');
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, isConnecting, isConnected, onError]);

  /**
   * Disconnect from WebRTC room
   */
  const disconnect = useCallback(async () => {
    try {
      await webrtcService.disconnect();
      
      // Reset state
      setIsConnected(false);
      setParticipants([]);
      setRemoteStreams(new Map());
      setLocalStream(null);
      setIsScreenSharing(false);
      setError(null);

      console.log('🔌 WebRTC disconnected via hook');

    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [onError]);

  /**
   * Toggle audio mute/unmute
   */
  const toggleAudio = useCallback(() => {
    const enabled = webrtcService.toggleAudio();
    return enabled;
  }, []);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    const enabled = webrtcService.toggleVideo();
    return enabled;
  }, []);

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await webrtcService.startScreenShare();
      return stream;
    } catch (error) {
      console.error('Screen share failed:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(async () => {
    try {
      await webrtcService.stopScreenShare();
    } catch (error) {
      console.error('Stop screen share failed:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Bridge phone call
   */
  const bridgePhoneCall = useCallback(async (phoneNumber) => {
    try {
      const result = await webrtcService.bridgePhoneCall(phoneNumber);
      return result;
    } catch (error) {
      console.error('Phone bridge failed:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  /**
   * Send chat message
   */
  const sendChatMessage = useCallback((message) => {
    webrtcService.sendChatMessage(message);
  }, []);

  /**
   * Get connection status
   */
  const getConnectionStatus = useCallback(() => {
    return webrtcService.getConnectionStatus();
  }, []);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    isConnected,
    isConnecting,
    participants,
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionQuality,
    error,

    // Actions
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    bridgePhoneCall,
    sendChatMessage,
    getConnectionStatus,

    // Utilities
    participantCount: participants.length,
    hasLocalVideo: !!localStream && isVideoEnabled,
    hasRemoteStreams: remoteStreams.size > 0
  };
};

/**
 * Hook for managing media devices (camera/microphone)
 */
export const useMediaDevices = () => {
  const [devices, setDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: []
  });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: null,
    microphone: null,
    speaker: null
  });
  const [permissions, setPermissions] = useState({
    camera: null,
    microphone: null
  });

  // Get available media devices
  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = deviceList.filter(device => device.kind === 'videoinput');
      const microphones = deviceList.filter(device => device.kind === 'audioinput');
      const speakers = deviceList.filter(device => device.kind === 'audiooutput');

      setDevices({ cameras, microphones, speakers });

      // Set default devices if none selected
      if (!selectedDevices.camera && cameras.length > 0) {
        setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      }
      if (!selectedDevices.microphone && microphones.length > 0) {
        setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      }
      if (!selectedDevices.speaker && speakers.length > 0) {
        setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));
      }

    } catch (error) {
      console.error('Failed to get media devices:', error);
    }
  }, [selectedDevices.camera, selectedDevices.microphone, selectedDevices.speaker]);

  // Check media permissions
  const checkPermissions = useCallback(async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' });

      setPermissions({
        camera: cameraPermission.state,
        microphone: microphonePermission.state
      });

    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  }, []);

  // Request media permissions
  const requestPermissions = useCallback(async (audio = true, video = true) => {
    try {
      const constraints = { audio, video };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately - we just needed permissions
      stream.getTracks().forEach(track => track.stop());

      await checkPermissions();
      return true;

    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, [checkPermissions]);

  // Test camera
  const testCamera = useCallback(async (deviceId) => {
    try {
      const constraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;

    } catch (error) {
      console.error('Camera test failed:', error);
      throw error;
    }
  }, []);

  // Test microphone
  const testMicrophone = useCallback(async (deviceId) => {
    try {
      const constraints = {
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;

    } catch (error) {
      console.error('Microphone test failed:', error);
      throw error;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkPermissions();
    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [getDevices, checkPermissions]);

  return {
    devices,
    selectedDevices,
    permissions,
    setSelectedDevices,
    getDevices,
    checkPermissions,
    requestPermissions,
    testCamera,
    testMicrophone
  };
};
