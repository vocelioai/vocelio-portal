// ============================================================================
// WEBRTC SERVICE - Enterprise Video Calling Integration
// ============================================================================
// Integrates with deployed WebRTC Bridge: https://webrtc-bridge-313373223340.us-central1.run.app

class WebRTCService {
  constructor() {
    // Your deployed WebRTC backend services
    this.webrtcBridgeURL = import.meta.env.VITE_WEBRTC_BRIDGE_URL || 'https://webrtc-bridge-313373223340.us-central1.run.app';
    this.omnichannelHubURL = import.meta.env.VITE_OMNICHANNEL_HUB_URL || 'https://omnichannel-hub-313373223340.us-central1.run.app';
    this.ttsAdapterURL = import.meta.env.VITE_TTS_ADAPTER_URL || 'https://tts-adapter-313373223340.us-central1.run.app';
    this.asrAdapterURL = import.meta.env.VITE_ASR_ADAPTER_URL || 'https://asr-adapter-313373223340.us-central1.run.app';
    
    // WebRTC connection state
    this.peerConnections = new Map();
    this.localStream = null;
    this.signalingSocket = null;
    this.connectionId = null;
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Call state
    this.currentCall = null;
    this.participants = new Map();
    
    console.log('🎥 WebRTC Service initialized with backend:', this.webrtcBridgeURL);
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Initialize WebRTC connection
   */
  async initializeConnection(roomId, userId) {
    try {
      console.log('🔌 Initializing WebRTC connection:', { roomId, userId });
      
      this.connectionId = `${roomId}-${userId}-${Date.now()}`;
      
      // Connect to signaling WebSocket
      await this.connectSignaling();
      
      // Initialize local media
      await this.initializeLocalMedia();
      
      // Register with omnichannel hub
      await this.registerOmnichannelSession(roomId);
      
      console.log('✅ WebRTC connection initialized');
      return this.connectionId;
      
    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      throw error;
    }
  }

  /**
   * Connect to signaling WebSocket
   */
  async connectSignaling() {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://webrtc-bridge-313373223340.us-central1.run.app/ws/${this.connectionId}`;
      
      this.signalingSocket = new WebSocket(wsUrl);
      
      this.signalingSocket.onopen = () => {
        console.log('📡 WebRTC signaling connected');
        resolve();
      };
      
      this.signalingSocket.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };
      
      this.signalingSocket.onerror = (error) => {
        console.error('❌ Signaling error:', error);
        reject(error);
      };
      
      this.signalingSocket.onclose = () => {
        console.log('📡 Signaling disconnected');
        this.emit('signaling_disconnected');
      };
    });
  }

  /**
   * Initialize local media (camera/microphone)
   */
  async initializeLocalMedia(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎥 Local media initialized');
      
      this.emit('local_stream', this.localStream);
      return this.localStream;
      
    } catch (error) {
      console.error('❌ Local media initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // WEBRTC PEER CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Create peer connection for participant
   */
  async createPeerConnection(participantId) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const peerConnection = new RTCPeerConnection(config);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📺 Remote stream received from:', participantId);
      this.emit('remote_stream', {
        participantId,
        stream: event.streams[0]
      });
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          target: participantId
        });
      }
    };
    
    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Connection state for ${participantId}:`, peerConnection.connectionState);
      this.emit('connection_state', {
        participantId,
        state: peerConnection.connectionState
      });
    };
    
    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  /**
   * Create offer for new participant
   */
  async createOffer(participantId) {
    const peerConnection = await this.createPeerConnection(participantId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    this.sendSignalingMessage({
      type: 'offer',
      offer: offer,
      target: participantId
    });
    
    console.log('📤 Offer sent to:', participantId);
  }

  /**
   * Handle received offer
   */
  async handleOffer(offer, fromParticipant) {
    const peerConnection = await this.createPeerConnection(fromParticipant);
    await peerConnection.setRemoteDescription(offer);
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    this.sendSignalingMessage({
      type: 'answer',
      answer: answer,
      target: fromParticipant
    });
    
    console.log('📤 Answer sent to:', fromParticipant);
  }

  /**
   * Handle received answer
   */
  async handleAnswer(answer, fromParticipant) {
    const peerConnection = this.peerConnections.get(fromParticipant);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
      console.log('📥 Answer processed from:', fromParticipant);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate, fromParticipant) {
    const peerConnection = this.peerConnections.get(fromParticipant);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
      console.log('🧊 ICE candidate added from:', fromParticipant);
    }
  }

  // ============================================================================
  // SIGNALING MESSAGE HANDLING
  // ============================================================================

  /**
   * Handle incoming signaling messages
   */
  handleSignalingMessage(message) {
    console.log('📨 Signaling message received:', message.type);
    
    switch (message.type) {
      case 'participant-joined':
        this.handleParticipantJoined(message.participant);
        break;
      case 'participant-left':
        this.handleParticipantLeft(message.participant);
        break;
      case 'offer':
        this.handleOffer(message.offer, message.from);
        break;
      case 'answer':
        this.handleAnswer(message.answer, message.from);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate, message.from);
        break;
      case 'chat-message':
        this.emit('chat_message', message);
        break;
      case 'phone-participant-added':
        this.handlePhoneParticipantAdded(message);
        break;
      default:
        console.log('❓ Unknown signaling message:', message);
    }
  }

  /**
   * Send signaling message
   */
  sendSignalingMessage(message) {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify({
        ...message,
        from: this.connectionId,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // ============================================================================
  // PARTICIPANT MANAGEMENT
  // ============================================================================

  /**
   * Handle new participant joining
   */
  handleParticipantJoined(participant) {
    console.log('👋 Participant joined:', participant.id);
    this.participants.set(participant.id, participant);
    this.createOffer(participant.id);
    this.emit('participant_joined', participant);
  }

  /**
   * Handle participant leaving
   */
  handleParticipantLeft(participant) {
    console.log('👋 Participant left:', participant.id);
    
    // Close peer connection
    const peerConnection = this.peerConnections.get(participant.id);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participant.id);
    }
    
    this.participants.delete(participant.id);
    this.emit('participant_left', participant);
  }

  // ============================================================================
  // MEDIA CONTROLS
  // ============================================================================

  /**
   * Toggle audio mute/unmute
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio', audioTrack.enabled ? 'enabled' : 'disabled');
        
        this.sendSignalingMessage({
          type: 'audio-toggled',
          enabled: audioTrack.enabled
        });
        
        this.emit('audio_toggled', audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle video on/off
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video', videoTrack.enabled ? 'enabled' : 'disabled');
        
        this.sendSignalingMessage({
          type: 'video-toggled',
          enabled: videoTrack.enabled
        });
        
        this.emit('video_toggled', videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach(async (peerConnection, participantId) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      
      this.sendSignalingMessage({
        type: 'screen-share-started'
      });
      
      this.emit('screen_share_started', screenStream);
      console.log('🖥️ Screen sharing started');
      
      return screenStream;
      
    } catch (error) {
      console.error('❌ Screen sharing failed:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare() {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      const videoTrack = cameraStream.getVideoTracks()[0];
      
      // Replace screen share with camera in all peer connections
      this.peerConnections.forEach(async (peerConnection, participantId) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      this.sendSignalingMessage({
        type: 'screen-share-stopped'
      });
      
      this.emit('screen_share_stopped');
      console.log('🖥️ Screen sharing stopped');
      
    } catch (error) {
      console.error('❌ Stop screen sharing failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // PHONE BRIDGE INTEGRATION
  // ============================================================================

  /**
   * Bridge phone call into video call
   */
  async bridgePhoneCall(phoneNumber) {
    try {
      console.log('📞 Bridging phone call:', phoneNumber);
      
      const response = await fetch(`${this.webrtcBridgeURL}/phone/bridge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          room_id: this.connectionId,
          phone_number: phoneNumber,
          caller_id: import.meta.env.VITE_TWILIO_PHONE_NUMBER
        })
      });
      
      if (!response.ok) {
        throw new Error(`Phone bridge failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Phone call bridged:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Phone bridge error:', error);
      throw error;
    }
  }

  /**
   * Handle phone participant added
   */
  handlePhoneParticipantAdded(message) {
    console.log('📞 Phone participant added:', message.participant);
    this.participants.set(message.participant.id, {
      ...message.participant,
      type: 'phone',
      isAudioOnly: true
    });
    
    this.emit('phone_participant_added', message.participant);
  }

  // ============================================================================
  // OMNICHANNEL INTEGRATION
  // ============================================================================

  /**
   * Register WebRTC session with omnichannel hub
   */
  async registerOmnichannelSession(roomId) {
    try {
      const response = await fetch(`${this.omnichannelHubURL}/video/webrtc-session-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          session_id: this.connectionId,
          room_id: roomId,
          channel: 'video',
          participant_id: localStorage.getItem('user_id') || 'anonymous'
        })
      });
      
      if (response.ok) {
        console.log('✅ Omnichannel session registered');
      }
      
    } catch (error) {
      console.error('❌ Omnichannel registration failed:', error);
      // Non-critical - don't throw
    }
  }

  // ============================================================================
  // CHAT FUNCTIONALITY
  // ============================================================================

  /**
   * Send chat message
   */
  sendChatMessage(message) {
    const chatMessage = {
      type: 'chat-message',
      message: message,
      sender: this.connectionId,
      timestamp: new Date().toISOString()
    };
    
    this.sendSignalingMessage(chatMessage);
    this.emit('chat_message_sent', chatMessage);
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Add event listener
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType).add(handler);
  }

  /**
   * Remove event listener
   */
  off(eventType, handler) {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType).delete(handler);
    }
  }

  /**
   * Emit event
   */
  emit(eventType, data) {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${eventType}:`, error);
        }
      });
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Disconnect and cleanup
   */
  async disconnect() {
    console.log('🔌 Disconnecting WebRTC service');
    
    // Close all peer connections
    this.peerConnections.forEach(peerConnection => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close signaling socket
    if (this.signalingSocket) {
      this.signalingSocket.close();
      this.signalingSocket = null;
    }
    
    // Clear state
    this.participants.clear();
    this.connectionId = null;
    
    console.log('✅ WebRTC service disconnected');
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: !!this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN,
      connectionId: this.connectionId,
      participants: Array.from(this.participants.values()),
      hasLocalStream: !!this.localStream,
      peerConnectionCount: this.peerConnections.size
    };
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
