/**
 * Real-time Conversation Service
 * Handles STT → AI → TTS conversation flow with WebSocket/EventSource connectivity
 */

class RealtimeConversationService {
  constructor() {
    this.eventSource = null;
    this.currentSession = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    
    // Backend URLs from environment
    this.DIALOG_ORCHESTRATOR_URL = import.meta.env.VITE_DIALOG_ORCHESTRATOR_URL;
    this.REAL_TIME_MONITORING_URL = import.meta.env.VITE_REAL_TIME_MONITORING_URL;
    this.ASR_ADAPTER_URL = import.meta.env.VITE_ASR_ADAPTER_URL;
    this.TTS_ADAPTER_URL = import.meta.env.VITE_TTS_ADAPTER_URL;
    this.TELEPHONY_ADAPTER_URL = import.meta.env.VITE_TELEPHONY_ADAPTER_URL;
  }

  /**
   * Start a new conversation session
   */
  async startSession(config = {}) {
    try {
      console.log('🚀 Starting conversation session with config:', config);

      const sessionRequest = {
        flow_id: config.flowId || 'default',
        voice_settings: {
          provider: config.voiceProvider || 'azure',
          voice_id: config.voiceId || 'aria',
          tier: config.voiceTier || 'regular',
          speed: config.speed || 1.0,
          pitch: config.pitch || 0
        },
        session_config: {
          enable_stt: true,
          enable_tts: true,
          enable_real_time: true,
          language: config.language || 'en-US'
        },
        metadata: {
          session_type: 'webclient_test',
          initiated_from: 'flow_designer',
          user_id: config.userId || 'anonymous',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${this.DIALOG_ORCHESTRATOR_URL}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(sessionRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Session start failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const sessionData = await response.json();
      this.currentSession = sessionData;

      console.log('✅ Session started successfully:', sessionData);

      // Set up real-time event stream
      await this.connectEventStream(sessionData.session_id);

      return {
        success: true,
        session_id: sessionData.session_id,
        call_sid: sessionData.call_sid,
        status: sessionData.status,
        metadata: sessionData.metadata
      };

    } catch (error) {
      console.error('❌ Failed to start session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Connect to real-time event stream for live transcript updates
   */
  async connectEventStream(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required for event stream');
    }

    try {
      const eventStreamUrl = `${this.REAL_TIME_MONITORING_URL}/calls/${sessionId}/events`;
      console.log('📡 Connecting to event stream:', eventStreamUrl);

      this.eventSource = new EventSource(eventStreamUrl, {
        withCredentials: false
      });

      this.eventSource.onopen = () => {
        console.log('✅ Real-time event stream connected');
        this.isConnected = true;
        this.emit('connection_status', { status: 'connected', timestamp: new Date() });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealtimeEvent(data);
        } catch (error) {
          console.error('Error parsing event data:', error, event.data);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
        this.isConnected = false;
        this.emit('connection_status', { status: 'error', error: error.message, timestamp: new Date() });
        
        // Attempt reconnection after delay
        setTimeout(() => {
          if (this.currentSession && !this.isConnected) {
            console.log('🔄 Attempting to reconnect event stream...');
            this.connectEventStream(sessionId);
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect event stream:', error);
      throw error;
    }
  }

  /**
   * Handle incoming real-time events from backend
   */
  handleRealtimeEvent(data) {
    console.log('📡 Real-time event received:', data);

    const eventType = data.type || data.event_type;
    
    switch (eventType) {
      case 'transcript':
      case 'speech_to_text':
        this.handleTranscriptEvent(data);
        break;
        
      case 'ai_response':
      case 'llm_response':
        this.handleAIResponseEvent(data);
        break;
        
      case 'tts_generated':
      case 'audio_generated':
        this.handleTTSEvent(data);
        break;
        
      case 'call_status':
      case 'session_status':
        this.handleStatusEvent(data);
        break;
        
      case 'audio_playback':
        this.handleAudioPlaybackEvent(data);
        break;
        
      case 'speech_detection':
      case 'vad_event':
        this.handleSpeechDetectionEvent(data);
        break;
        
      case 'error':
        this.handleErrorEvent(data);
        break;
        
      default:
        console.log('Unknown event type:', eventType, data);
        this.emit('unknown_event', data);
    }
  }

  /**
   * Handle transcript events (STT output)
   */
  handleTranscriptEvent(data) {
    const transcriptData = {
      session_id: data.session_id || data.call_sid,
      speaker: data.speaker || 'customer',
      text: data.text || data.transcript,
      timestamp: data.timestamp || new Date().toISOString(),
      confidence: data.confidence || 0,
      is_final: data.is_final || false,
      language: data.language || 'en-US'
    };

    this.emit('transcript', transcriptData);
  }

  /**
   * Handle AI response events (LLM output)
   */
  handleAIResponseEvent(data) {
    const responseData = {
      session_id: data.session_id || data.call_sid,
      speaker: 'ai',
      text: data.text || data.response || data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      intent: data.intent,
      confidence: data.confidence || 1.0,
      metadata: data.metadata || {}
    };

    this.emit('ai_response', responseData);
  }

  /**
   * Handle TTS events (audio generation)
   */
  handleTTSEvent(data) {
    const ttsData = {
      session_id: data.session_id || data.call_sid,
      audio_url: data.audio_url || data.audioUrl,
      text: data.text,
      voice_id: data.voice_id,
      provider: data.provider,
      duration: data.duration,
      timestamp: data.timestamp || new Date().toISOString()
    };

    this.emit('tts_generated', ttsData);
  }

  /**
   * Handle status events
   */
  handleStatusEvent(data) {
    const statusData = {
      session_id: data.session_id || data.call_sid,
      status: data.status,
      previous_status: data.previous_status,
      timestamp: data.timestamp || new Date().toISOString(),
      metadata: data.metadata || {}
    };

    this.emit('status_change', statusData);

    // Handle session end
    if (data.status === 'completed' || data.status === 'ended') {
      this.handleSessionEnd();
    }
  }

  /**
   * Handle audio playback events
   */
  handleAudioPlaybackEvent(data) {
    this.emit('audio_playback', {
      session_id: data.session_id || data.call_sid,
      is_playing: data.is_playing || data.playing,
      audio_id: data.audio_id,
      timestamp: data.timestamp || new Date().toISOString()
    });
  }

  /**
   * Handle speech detection events (VAD)
   */
  handleSpeechDetectionEvent(data) {
    this.emit('speech_detection', {
      session_id: data.session_id || data.call_sid,
      is_speaking: data.is_speaking || data.speaking,
      speaker: data.speaker || 'customer',
      audio_level: data.audio_level || 0,
      timestamp: data.timestamp || new Date().toISOString()
    });
  }

  /**
   * Handle error events
   */
  handleErrorEvent(data) {
    this.emit('error', {
      session_id: data.session_id || data.call_sid,
      error: data.error || data.message,
      error_code: data.error_code,
      component: data.component,
      timestamp: data.timestamp || new Date().toISOString()
    });
  }

  /**
   * Send text message to AI (simulates customer speech → STT)
   */
  async sendMessage(text, options = {}) {
    if (!this.currentSession) {
      throw new Error('No active session. Start a session first.');
    }

    try {
      const messageRequest = {
        text: text.trim(),
        speaker: 'customer',
        timestamp: new Date().toISOString(),
        metadata: {
          simulated_stt: true,
          confidence: 1.0,
          language: options.language || 'en-US',
          ...options.metadata
        }
      };

      const response = await fetch(`${this.DIALOG_ORCHESTRATOR_URL}/api/sessions/${this.currentSession.session_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(messageRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Message send failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Message sent successfully:', result);

      return {
        success: true,
        message_id: result.message_id,
        session_id: this.currentSession.session_id
      };

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * End the current conversation session
   */
  async endSession() {
    if (!this.currentSession) {
      console.log('No active session to end');
      return { success: true };
    }

    try {
      const response = await fetch(`${this.DIALOG_ORCHESTRATOR_URL}/api/sessions/${this.currentSession.session_id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        console.warn('Failed to end session gracefully:', response.status);
      }

      this.handleSessionEnd();

      return { success: true };

    } catch (error) {
      console.error('Error ending session:', error);
      this.handleSessionEnd(); // Still clean up locally
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle session cleanup
   */
  handleSessionEnd() {
    console.log('🏁 Cleaning up session');

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
    this.currentSession = null;

    this.emit('session_ended', { timestamp: new Date().toISOString() });
  }

  /**
   * Event emitter functionality
   */
  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    if (this.messageHandlers.has(eventType)) {
      const handlers = this.messageHandlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    if (this.messageHandlers.has(eventType)) {
      this.messageHandlers.get(eventType).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get authentication header
   */
  getAuthHeader() {
    const token = localStorage.getItem('vocilio_auth_token') || 
                 localStorage.getItem('auth_token') || 
                 sessionStorage.getItem('vocilio_session_token');
    return token ? `Bearer ${token}` : '';
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      isActive: !!this.currentSession,
      isConnected: this.isConnected,
      sessionId: this.currentSession?.session_id,
      callSid: this.currentSession?.call_sid,
      startTime: this.currentSession?.created_at
    };
  }

  /**
   * Cleanup on component unmount
   */
  destroy() {
    this.handleSessionEnd();
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const realtimeConversationService = new RealtimeConversationService();

// Also export the class for custom instances
export { RealtimeConversationService };
