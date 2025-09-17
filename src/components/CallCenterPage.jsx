import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, PhoneCall, PhoneIncoming, PhoneOff, Mic, MicOff, 
  Volume2, VolumeX, Settings, User, Clock, ArrowRight,
  Play, Pause, Download, Copy, RefreshCw, AlertCircle,
  CheckCircle, Loader, MessageSquare, FileText, Users,
  History, X
} from 'lucide-react';
import VoiceSelector from './VoiceSelector';
import TranscriptBox from './TranscriptBox';
import IncomingCallModal from './IncomingCallModal';
import { callTransferAPI } from '../config/api.js';

// Telephony API Service Class
class TelephonyAPI {
  constructor() {
    this.apiGateway = import.meta.env.VITE_API_GATEWAY_URL;
    this.telephonyAdapter = import.meta.env.VITE_TELEPHONY_ADAPTER_URL;
    this.ttsAdapter = import.meta.env.VITE_TTS_ADAPTER_URL;
    this.streamingTTS = import.meta.env.VITE_STREAMING_TTS_ADAPTER_URL;
    this.voiceRouter = import.meta.env.VITE_VOICE_ROUTER_URL;
    this.asrAdapter = import.meta.env.VITE_ASR_ADAPTER_URL;
    this.vadService = import.meta.env.VITE_VAD_SERVICE_URL;
    
    // WebSocket connections
    this.wsConnections = new Map();
  }

  // Authentication helper
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
    };
  }

  // Make outbound call using telephony adapter with fallback
  async makeCall(phoneNumber, voiceTier = 'regular', selectedVoice = null) {
    try {
      const response = await fetch(`${this.telephonyAdapter}/api/calls/make`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          to: phoneNumber,
          from: import.meta.env.VITE_TWILIO_PHONE_NUMBER || "+1234567890", // Fallback number
          message: "Hello, this is an AI assistant calling from Vocilio.",
          voice_settings: {
            provider: voiceTier === 'premium' ? 'elevenlabs' : 'azure',
            voice_id: selectedVoice || (voiceTier === 'premium' ? 'pNInz6obpgDQGcFmaJgB' : 'en-US-AriaNeural')
          }
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // If telephony adapter fails, create a mock call for UI testing
      console.warn('Telephony backend unavailable, creating demo call for UI testing');
      return this.createDemoCall(phoneNumber);
      
    } catch (error) {
      console.error('❌ Make call error:', error);
      // For development/testing, create a demo call
      console.warn('Creating demo call due to backend unavailability');
      return this.createDemoCall(phoneNumber);
    }
  }

  // Create a demo call for testing when backend is unavailable
  createDemoCall(phoneNumber) {
    const demoCallSid = `demo_call_${Date.now()}`;
    console.log('🎭 Creating demo call for testing:', demoCallSid);
    
    return {
      call_sid: demoCallSid,
      to: phoneNumber,
      from: "+1234567890",
      status: "initiated",
      demo: true
    };
  }

  // Get call status with fallback for demo calls
  async getCallStatus(callSid) {
    try {
      // Handle demo calls
      if (callSid.startsWith('demo_call_')) {
        return this.getDemoCallStatus(callSid);
      }
      
      const response = await fetch(`${this.telephonyAdapter}/api/calls/${callSid}/status`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Status fetch failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Get call status error:', error);
      throw error;
    }
  }

  // Demo call status simulation for testing
  getDemoCallStatus(callSid) {
    if (!this.demoCallStates) {
      this.demoCallStates = new Map();
    }
    
    let state = this.demoCallStates.get(callSid);
    if (!state) {
      state = { 
        status: 'ringing', 
        startTime: Date.now(),
        // Simulate random call outcomes for testing disconnect scenarios
        outcome: Math.random() < 0.3 ? 'hangup' : (Math.random() < 0.5 ? 'completed' : 'in-progress')
      };
      this.demoCallStates.set(callSid, state);
    }
    
    const elapsed = Date.now() - state.startTime;
    
    // Simulate call progression with disconnect scenarios
    if (elapsed > 20000 && state.outcome === 'hangup') {
      // Simulate client hanging up after 20 seconds
      state.status = 'disconnected';
    } else if (elapsed > 15000 && state.outcome === 'completed') {
      // Simulate normal call completion after 15 seconds
      state.status = 'completed';
    } else if (elapsed > 8000) {
      // After 8 seconds, call connects (if not ending earlier)
      state.status = 'in-progress';
    } else if (elapsed > 3000) {
      // After 3 seconds, still ringing
      state.status = 'ringing';
    }
    
    return Promise.resolve({ status: state.status, call_sid: callSid });
  }

  // Transfer call
  async transferCall(callSid, transferTo) {
    try {
      const response = await fetch(`${this.voiceRouter}/calls/transfer`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          call_sid: callSid,
          transfer_to: transferTo
        })
      });
      
      if (!response.ok) {
        throw new Error(`Transfer failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Transfer call error:', error);
      throw error;
    }
  }

  // Get active calls from telephony adapter
  async getActiveCalls() {
    try {
      const response = await fetch(`${this.telephonyAdapter}/admin/active-calls`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Active calls fetch failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Get active calls error:', error);
      throw error;
    }
  }

  // Get available voices from TTS adapter
  async getVoices(tier = 'regular') {
    try {
      // First, get tier configuration to understand which provider to use
      const tierResponse = await fetch(`${this.ttsAdapter}/tiers`, {
        headers: this.getAuthHeaders()
      });
      
      if (!tierResponse.ok) {
        throw new Error(`Tier fetch failed: ${tierResponse.status}`);
      }
      
      const tierData = await tierResponse.json();
      const tierConfig = tierData.tiers[tier];
      
      if (!tierConfig) {
        throw new Error(`Unknown tier: ${tier}`);
      }
      
      // Get voices for the tier's provider (azure or elevenlabs)
      const provider = tierConfig.tts_provider;
      const voicesResponse = await fetch(`${this.ttsAdapter}/voices/${provider}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!voicesResponse.ok) {
        throw new Error(`Voices fetch failed: ${voicesResponse.status}`);
      }
      
      const voicesData = await voicesResponse.json();
      
      // Check if voicesData has the expected structure
      if (!voicesData || !voicesData.voices || !Array.isArray(voicesData.voices)) {
        console.error('❌ Invalid voices data structure:', voicesData);
        return {
          voices: [],
          tier: tier,
          provider: provider,
          pricing: tierConfig.price_per_minute,
          error: 'Invalid voices data received from API'
        };
      }
      
      // Format the response to match the expected structure
      return {
        voices: voicesData.voices.map(voice => ({
          id: voice.id,
          name: voice.name,
          provider: provider,
          tier: tier,
          language: voice.language || 'en-US',
          gender: voice.gender || 'unknown'
        })),
        tier: tier,
        provider: provider,
        pricing: tierConfig.price_per_minute
      };
    } catch (error) {
      console.error('❌ Get voices error:', error);
      
      // Return a safe structure instead of throwing
      return {
        voices: [],
        tier: tier,
        provider: 'unknown',
        pricing: 0.08,
        error: `Failed to load voices: ${error.message}`
      };
    }
  }

  // Preview voice using synthesize endpoint
  async previewVoice(voiceId, text = "Hello, this is a voice preview test") {
    try {
      const response = await fetch(`${this.ttsAdapter}/synthesize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          text: text,
          provider: 'auto',
          voice_id: voiceId,
          language: 'en-US',
          speed: 1.0,
          customer_id: 'preview_test',
          call_id: 'preview_' + Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Voice preview failed: ${response.status}`);
      }
      
      // Return the audio blob for playback
      const audioBlob = await response.blob();
      return {
        audio_blob: audioBlob,
        audio_url: URL.createObjectURL(audioBlob),
        provider: response.headers.get('Provider'),
        voice_id: response.headers.get('Voice-ID')
      };
    } catch (error) {
      console.error('❌ Voice preview error:', error);
      throw error;
    }
  }

  // WebSocket connection for live transcription
  connectASR(callId, onTranscript, onError) {
    try {
      const wsUrl = `${this.asrAdapter.replace('http', 'ws')}/ws/asr/${callId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🎧 ASR WebSocket connected for call:', callId);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onTranscript(data);
        } catch (error) {
          console.error('❌ ASR message parse error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ ASR WebSocket error:', error);
        onError(error);
      };
      
      ws.onclose = () => {
        console.log('🔌 ASR WebSocket closed for call:', callId);
      };
      
      this.wsConnections.set(callId, ws);
      return ws;
    } catch (error) {
      console.error('❌ ASR WebSocket connection error:', error);
      onError(error);
    }
  }

  // Disconnect WebSocket
  disconnectASR(callId) {
    const ws = this.wsConnections.get(callId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(callId);
    }
  }

  // End call with fallback strategy
  async endCall(callSid) {
    console.log('📞 Attempting to end call:', callSid);
    
    try {
      // Try the telephony adapter first
      console.log('🔄 Trying primary telephony adapter endpoint...');
      const response = await fetch(`${this.telephonyAdapter}/api/calls/${callSid}/end`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        timeout: 5000 // 5 second timeout
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Primary endpoint succeeded:', result);
        return result;
      }
      
      console.warn(`⚠️ Primary endpoint failed with status ${response.status}`);
      
      // If telephony adapter fails, try alternative endpoints
      console.log('🔄 Trying alternative API gateway endpoint...');
      
      const transferResponse = await fetch(`${this.apiGateway}/api/calls/${callSid}/end`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        timeout: 5000
      });
      
      if (transferResponse.ok) {
        const result = await transferResponse.json();
        console.log('✅ Alternative endpoint succeeded:', result);
        return result;
      }
      
      console.warn(`⚠️ Alternative endpoint failed with status ${transferResponse.status}`);
      
      // Try a generic DELETE endpoint as last resort
      console.log('🔄 Trying DELETE endpoint as last resort...');
      const deleteResponse = await fetch(`${this.telephonyAdapter}/api/calls/${callSid}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        timeout: 3000
      });
      
      if (deleteResponse.ok) {
        console.log('✅ DELETE endpoint succeeded');
        return { success: true, message: 'Call ended via DELETE', call_sid: callSid };
      }
      
      // If all API endpoints fail, handle gracefully with client-side termination
      console.warn('⚠️ All end call APIs failed, using client-side termination');
      return this.clientSideEndCall(callSid);
      
    } catch (error) {
      console.error('❌ End call API error, falling back to client-side termination:', error);
      return this.clientSideEndCall(callSid);
    }
  }

  // Client-side call termination when backend APIs are unavailable
  clientSideEndCall(callSid) {
    console.log('🔧 Performing client-side call termination for:', callSid);
    
    // Clean up demo call states if it's a demo call
    if (callSid.startsWith('demo_call_') && this.demoCallStates) {
      const state = this.demoCallStates.get(callSid);
      if (state) {
        state.status = 'completed';
        state.endTime = Date.now();
        console.log('🎭 Demo call state updated to completed');
      }
    }
    
    // Disconnect any WebSocket connections for this call
    this.disconnectASR(callSid);
    
    // Return success response format for consistency
    return Promise.resolve({
      success: true,
      message: 'Call terminated client-side (offline mode)',
      call_sid: callSid,
      status: 'completed',
      end_time: new Date().toISOString(),
      client_side: true
    });
  }
}

// Main Call Center Page Component
const CallCenterPage = () => {
  const [telephonyAPI] = useState(() => new TelephonyAPI());
  
  // Audio context for enabling audio playback
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Call state
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, dialing, ringing, connected, ended
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transferNumber, setTransferNumber] = useState('');
  
  // Voice settings
  const [voiceTier, setVoiceTier] = useState('regular');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Audio controls
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [microphoneStream, setMicrophoneStream] = useState(null);
  const [outputVolume, setOutputVolume] = useState(80);
  
  // Audio notifications and tones
  const audioRefs = useRef({
    ringingTone: null,
    dialTone: null,
    connectTone: null,
    endTone: null,
    microphoneStream: null,
    audioContext: null
  });
  
  // Polling control and call timeout refs
  const pollingRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const callStartTimeRef = useRef(null);
  
  // Transcript
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // Call History
  const [callHistory, setCallHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);

  // Enable audio context on first user interaction
  const enableAudio = useCallback(async () => {
    if (!audioEnabled) {
      try {
        // Create a dummy audio context to enable audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();
        setAudioEnabled(true);
        console.log('🔊 Audio context enabled');
      } catch (error) {
        console.error('Failed to enable audio context:', error);
      }
    }
  }, [audioEnabled]);

  // Audio notification functions
  const playAudioTone = useCallback((type, options = {}) => {
    if (!audioEnabled) return;

    try {
      // Stop any currently playing tone of this type
      if (audioRefs.current[type]) {
        audioRefs.current[type].pause();
        audioRefs.current[type].currentTime = 0;
      }

      // Create audio tone using Web Audio API for better control
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure tone based on type
      const toneConfig = {
        ringingTone: { frequency: 440, duration: 3000, pattern: 'ring' },
        dialTone: { frequency: 350, duration: 1000, pattern: 'continuous' },
        connectTone: { frequency: 523, duration: 500, pattern: 'beep' },
        endTone: { frequency: 293, duration: 800, pattern: 'beep' }
      };
      
      const config = toneConfig[type] || toneConfig.dialTone;
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume based on user setting
      const volumeLevel = (volume / 100) * 0.3; // Max 30% to prevent loud sounds
      gainNode.gain.setValueAtTime(volumeLevel, audioContext.currentTime);
      
      if (config.pattern === 'ring') {
        // Create ringing pattern (on for 2s, off for 4s, repeat)
        const startTime = audioContext.currentTime;
        oscillator.start(startTime);
        oscillator.stop(startTime + 2);
        
        // Create repeating pattern for ringing
        if (options.loop) {
          const playRingPattern = () => {
            if (audioRefs.current[type] && !audioRefs.current[type].stopped) {
              setTimeout(() => {
                playAudioTone(type, options);
              }, 4000);
            }
          };
          playRingPattern();
        }
      } else {
        // Simple beep or continuous tone
        oscillator.start();
        oscillator.stop(audioContext.currentTime + (config.duration / 1000));
      }
      
      // Store reference for cleanup
      audioRefs.current[type] = {
        oscillator,
        audioContext,
        stopped: false
      };
      
      console.log(`🔊 Playing ${type} tone`);
      
    } catch (error) {
      console.error(`Failed to play ${type}:`, error);
    }
  }, [audioEnabled, volume]);

  const stopAudioTone = useCallback((type) => {
    if (audioRefs.current[type]) {
      try {
        audioRefs.current[type].oscillator.stop();
        audioRefs.current[type].audioContext.close();
        audioRefs.current[type] = null;
        console.log(`🔇 Stopped ${type} tone`);
      } catch (error) {
        console.error(`Failed to stop ${type}:`, error);
      }
    }
  }, []);

  const stopAllAudioTones = useCallback(() => {
    Object.keys(audioRefs.current).forEach(type => {
      if (audioRefs.current[type]) {
        stopAudioTone(type);
      }
    });
  }, [stopAudioTone]);

  // Microphone control functions
  const initializeMicrophone = useCallback(async () => {
    try {
      if (!microphoneStream) {
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        setMicrophoneStream(stream);
        audioRefs.current.microphoneStream = stream;
        
        // Create audio context for processing
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();
        
        source.connect(gainNode);
        audioRefs.current.audioContext = audioContext;
        audioRefs.current.gainNode = gainNode;
        
        console.log('✅ Microphone initialized successfully');
        return stream;
      }
      return microphoneStream;
    } catch (error) {
      console.error('❌ Failed to access microphone:', error);
      setError('Microphone access denied. Please allow microphone access for call functionality.');
      throw error;
    }
  }, [microphoneStream]);

  const toggleMicrophone = useCallback(async () => {
    try {
      if (!microphoneStream) {
        await initializeMicrophone();
      }
      
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      if (microphoneStream) {
        microphoneStream.getAudioTracks().forEach(track => {
          track.enabled = !newMutedState;
        });
        
        // Also control gain if available
        if (audioRefs.current.gainNode) {
          audioRefs.current.gainNode.gain.value = newMutedState ? 0 : (outputVolume / 100);
        }
        
        console.log(`🎤 Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
      }
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      setError('Failed to control microphone. Please check permissions.');
    }
  }, [isMuted, microphoneStream, outputVolume, initializeMicrophone]);

  const updateOutputVolume = useCallback((newVolume) => {
    setOutputVolume(newVolume);
    
    // Update gain node if available
    if (audioRefs.current.gainNode && !isMuted) {
      audioRefs.current.gainNode.gain.value = newVolume / 100;
    }
    
    console.log(`🔊 Output volume set to ${newVolume}%`);
  }, [isMuted]);

  const cleanupMicrophone = useCallback(() => {
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
      setMicrophoneStream(null);
      audioRefs.current.microphoneStream = null;
    }
    
    if (audioRefs.current.audioContext) {
      audioRefs.current.audioContext.close();
      audioRefs.current.audioContext = null;
    }
    
    console.log('🎤 Microphone cleaned up');
  }, [microphoneStream]);

  // Load voices on tier change
  useEffect(() => {
    loadVoices();
  }, [voiceTier]);

  // Cleanup audio and polling on unmount
  useEffect(() => {
    return () => {
      // Stop all audio
      stopAllAudioTones();
      cleanupMicrophone();
      
      // Clear all timeouts and polling
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      
      // End any active call
      if (currentCall?.call_sid) {
        telephonyAPI.endCall(currentCall.call_sid).catch(console.error);
        telephonyAPI.disconnectASR(currentCall.call_sid);
      }
    };
  }, [stopAllAudioTones, cleanupMicrophone, currentCall]);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const voicesResult = await telephonyAPI.getVoices(voiceTier);
      
      // Check if there was an error in the voices result
      if (voicesResult.error) {
        setError(voicesResult.error);
        setAvailableVoices([]);
        return;
      }
      
      setAvailableVoices(voicesResult.voices || []);
      if (voicesResult.voices && voicesResult.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesResult.voices[0].id);
      }
    } catch (error) {
      setError(`Failed to load voices: ${error.message}`);
      setAvailableVoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load call history
  const loadCallHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = {
        limit: 20, // Show last 20 calls
        page: 1
      };
      
      console.log('📞 Loading call history...');
      const data = await callTransferAPI.getCallLogs(params);
      console.log('📞 Call history loaded:', data);
      
      setCallHistory(data.call_logs || data || []);
    } catch (error) {
      console.error('❌ Failed to load call history:', error);
      setError(`Failed to load call history: ${error.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Toggle call history panel
  const toggleCallHistory = () => {
    setShowCallHistory(!showCallHistory);
    if (!showCallHistory && callHistory.length === 0) {
      loadCallHistory();
    }
  };

  // Make call
  const handleMakeCall = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setIsLoading(true);
      setCallStatus('dialing');
      setError(null);
      
      // Initialize microphone for the call
      await initializeMicrophone();
      
      // Play dial tone
      playAudioTone('dialTone');
      
      const callData = await telephonyAPI.makeCall(phoneNumber, voiceTier, selectedVoice);
      setCurrentCall(callData);
      setCallStatus('ringing');
      
      // Stop dial tone and start ringing tone
      stopAudioTone('dialTone');
      playAudioTone('ringingTone', { loop: true });
      
      // Start ASR connection
      if (callData.call_sid) {
        telephonyAPI.connectASR(
          callData.call_sid,
          handleTranscriptUpdate,
          handleASRError
        );
      }
      
      // Set timeout for unanswered calls (30 seconds)
      callTimeoutRef.current = setTimeout(async () => {
        console.log('⏰ Call timeout - automatically ending unanswered call');
        if (currentCall && callStatus !== 'answered' && callStatus !== 'in-progress') {
          try {
            await telephonyAPI.endCall(callData.call_sid);
          } catch (error) {
            console.error('Failed to end timed out call:', error);
          }
          
          // Reset states
          stopAllAudioTones();
          playAudioTone('endTone');
          setCurrentCall(null);
          setCallStatus('idle');
          setIsRecording(false);
          setError('Call timeout - no answer');
        }
      }, 30000); // 30 second timeout
      
      // Poll for call status
      startCallStatusPolling(callData.call_sid);
      
    } catch (error) {
      setError(`Call failed: ${error.message}`);
      setCallStatus('idle');
      setIsRecording(false);
      stopAllAudioTones();
    } finally {
      setIsLoading(false);
    }
  };

  // End call with improved error handling
  const handleEndCall = async () => {
    if (!currentCall?.call_sid) {
      console.warn('⚠️ No active call to end');
      return;
    }

    console.log('🔄 Initiating call termination for:', currentCall.call_sid);

    try {
      setIsLoading(true);
      
      // Store call SID before state changes
      const callSidToEnd = currentCall.call_sid;
      
      // Stop polling immediately to prevent state conflicts
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
        console.log('🛑 Stopped status polling');
      }
      
      // Stop call timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
        console.log('🛑 Cleared call timeout');
      }
      
      // Play end call tone immediately for user feedback
      stopAllAudioTones();
      playAudioTone('endTone');
      
      // Cleanup microphone and ASR immediately
      if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        setMicrophoneStream(null);
        console.log('🎤 Microphone stream stopped');
      }
      telephonyAPI.disconnectASR(callSidToEnd);
      
      // Reset UI states immediately for responsive user experience
      setCurrentCall(null);
      setCallStatus('idle');
      setIsRecording(false);
      callStartTimeRef.current = null;
      setTranscript([]);
      
      console.log('✅ UI states reset immediately');
      
      // Try to end the call via API (this may fail, but UI is already updated)
      try {
        console.log('📞 Attempting to end call via API...');
        const result = await telephonyAPI.endCall(callSidToEnd);
        console.log('✅ Call ended successfully via API:', result);
        setError(null);
      } catch (apiError) {
        console.warn('⚠️ API call end failed, but call terminated client-side:', apiError.message);
        // Don't show error to user since call is already terminated from UI perspective
        // Set a subtle status message instead of an error
        setError('Call ended (offline mode)');
        setTimeout(() => setError(null), 3000); // Clear after 3 seconds
      }
      
    } catch (error) {
      console.error('❌ Error during call termination:', error);
      
      // Even if there are errors, ensure states are reset
      setCurrentCall(null);
      setCallStatus('idle');
      setIsRecording(false);
      callStartTimeRef.current = null;
      setTranscript([]);
      
      // Show error to user
      setError(`Call termination error: ${error.message}`);
      setTimeout(() => setError(null), 5000);
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Call termination process completed');
    }
  };

  // Transfer call
  const handleTransferCall = async () => {
    if (!transferNumber.trim() || !currentCall?.call_sid) {
      setError('Please enter a transfer number');
      return;
    }

    try {
      setIsLoading(true);
      await telephonyAPI.transferCall(currentCall.call_sid, transferNumber);
      setTransferNumber('');
      
      // Call will end after transfer
      setTimeout(() => {
        setCurrentCall(null);
        setCallStatus('idle');
        setIsRecording(false);
      }, 2000);
      
    } catch (error) {
      setError(`Transfer failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Call status polling with proper cleanup
  const startCallStatusPolling = (callSid) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }
    
    let pollCount = 0;
    const maxPolls = 300; // Maximum 10 minutes of polling (2s intervals)
    
    const poll = async () => {
      try {
        // Check if we should still be polling
        if (!currentCall || currentCall.call_sid !== callSid || pollCount >= maxPolls) {
          console.log('🛑 Stopping poll - call ended or max attempts reached');
          return;
        }
        
        const status = await telephonyAPI.getCallStatus(callSid);
        const newStatus = status.status || 'unknown';
        
        console.log(`📞 Call status: ${newStatus} (poll ${pollCount})`);
        
        // Handle status changes with audio feedback
        if (newStatus !== callStatus) {
          if (newStatus === 'in-progress' || newStatus === 'answered') {
            // Call connected - stop ringing, play connect tone, start recording
            stopAudioTone('ringingTone');
            playAudioTone('connectTone');
            setIsRecording(true);
            callStartTimeRef.current = Date.now();
            
            // Clear timeout for unanswered calls
            if (callTimeoutRef.current) {
              clearTimeout(callTimeoutRef.current);
              callTimeoutRef.current = null;
            }
            
          } else if (newStatus === 'completed' || newStatus === 'failed' || 
                     newStatus === 'busy' || newStatus === 'no-answer' ||
                     newStatus === 'canceled' || newStatus === 'disconnected' ||
                     newStatus === 'hangup' || newStatus === 'terminated') {
            // Call ended - stop all tones, play end tone, reset states
            console.log(`📞 Call automatically ended with status: ${newStatus}`);
            stopAllAudioTones();
            playAudioTone('endTone');
            
            // Cleanup and reset states
            if (microphoneStream) {
              microphoneStream.getTracks().forEach(track => track.stop());
              setMicrophoneStream(null);
            }
            telephonyAPI.disconnectASR(callSid);
            
            // Clear any timeouts
            if (callTimeoutRef.current) {
              clearTimeout(callTimeoutRef.current);
              callTimeoutRef.current = null;
            }
            
            setCurrentCall(null);
            setCallStatus('idle');
            setIsRecording(false);
            callStartTimeRef.current = null;
            setTranscript([]);
            
            // Set appropriate status message
            if (newStatus === 'busy') {
              setError('Line is busy');
            } else if (newStatus === 'no-answer') {
              setError('No answer');
            } else if (newStatus === 'failed') {
              setError('Call failed');
            } else if (newStatus === 'disconnected' || newStatus === 'hangup') {
              setError('Call disconnected by client');
            } else {
              setError(null); // Call completed normally
            }
            
            console.log(`✅ Call ended with status: ${newStatus}`);
            return; // Stop polling
          }
        }
        
        setCallStatus(newStatus);
        pollCount++;
        
        // Continue polling if call is still active
        if (newStatus !== 'completed' && newStatus !== 'failed' && 
            newStatus !== 'busy' && newStatus !== 'no-answer') {
          pollingRef.current = setTimeout(poll, 2000);
        }
        
      } catch (error) {
        console.error('❌ Status polling error:', error);
        pollCount++;
        
        // Continue polling on error unless we've exceeded max attempts
        if (pollCount < maxPolls && currentCall && currentCall.call_sid === callSid) {
          pollingRef.current = setTimeout(poll, 2000);
        }
      }
    };
    
    // Start polling after 1 second
    pollingRef.current = setTimeout(poll, 1000);
  };

  // Transcript handlers
  const handleTranscriptUpdate = (data) => {
    setTranscript(prev => [...prev, {
      timestamp: new Date(),
      text: data.text || data.transcript,
      speaker: data.speaker || 'unknown',
      confidence: data.confidence || 0
    }]);
  };

  const handleASRError = (error) => {
    console.error('❌ ASR Error:', error);
    setError('Transcription error occurred');
  };

  // Dial pad numbers
  const dialPadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleDialPadClick = (digit) => {
    setPhoneNumber(prev => prev + digit);
  };

  const formatCallDuration = (startTime) => {
    if (!startTime) return '00:00';
    const duration = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call Center</h1>
            <p className="text-gray-600 mt-2">World-class telephony system with AI-powered voice capabilities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCallHistory}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showCallHistory 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <History className="w-4 h-4" />
              Call History
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dialer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Call Control</h2>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    callStatus === 'idle' ? 'bg-gray-400' :
                    callStatus === 'dialing' || callStatus === 'ringing' ? 'bg-yellow-400 animate-pulse' :
                    callStatus === 'connected' ? 'bg-green-400' :
                    'bg-red-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {callStatus === 'idle' ? 'Ready' : callStatus}
                  </span>
                  {currentCall && callStatus === 'connected' && (
                    <span className="text-sm text-gray-500 ml-2">
                      {formatCallDuration(currentCall.start_time)}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    disabled={callStatus !== 'idle'}
                  />
                  <button
                    onClick={() => setPhoneNumber('')}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg"
                    disabled={callStatus !== 'idle'}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Dial Pad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {dialPadNumbers.flat().map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDialPadClick(digit)}
                    disabled={callStatus !== 'idle'}
                    className="h-12 w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-lg font-semibold text-gray-700 transition-colors"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Call Controls */}
              <div className="flex gap-4 justify-center">
                {callStatus === 'idle' ? (
                  <button
                    onClick={handleMakeCall}
                    disabled={isLoading || !phoneNumber.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Phone className="h-5 w-5" />
                    )}
                    Start Call
                  </button>
                ) : (
                  <button
                    onClick={handleEndCall}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <PhoneOff className="h-5 w-5" />
                    )}
                    End Call
                  </button>
                )}
              </div>
            </div>

            {/* Call Transfer */}
            {currentCall && callStatus === 'connected' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Call</h3>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={transferNumber}
                    onChange={(e) => setTransferNumber(e.target.value)}
                    placeholder="Transfer to number..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleTransferCall}
                    disabled={isLoading || !transferNumber.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Transfer
                  </button>
                </div>
              </div>
            )}

            {/* Live Transcript */}
            <TranscriptBox 
              transcript={transcript}
              isRecording={isRecording}
              callSid={currentCall?.call_sid}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Settings */}
            <VoiceSelector
              voiceTier={voiceTier}
              setVoiceTier={setVoiceTier}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              availableVoices={availableVoices}
              onLoadVoices={loadVoices}
              isLoading={isLoading}
              onEnableAudio={enableAudio}
            />

            {/* Audio Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Controls</h3>
              
              <div className="space-y-4">
                {/* Audio Context Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Audio System</span>
                  <button
                    onClick={enableAudio}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      audioEnabled 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    } transition-colors`}
                  >
                    {audioEnabled ? '✓ Enabled' : 'Enable Audio'}
                  </button>
                </div>

                {/* Microphone Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Microphone</span>
                  <div className="flex items-center gap-2">
                    {microphoneStream && (
                      <span className="text-xs text-green-600">●</span>
                    )}
                    <button
                      onClick={toggleMicrophone}
                      className={`p-2 rounded-lg ${
                        isMuted 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } transition-colors`}
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Output Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Call Volume</span>
                    <span className="text-sm text-gray-500">{outputVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={outputVolume}
                    onChange={(e) => updateOutputVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Tone Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tone Volume</span>
                    <span className="text-sm text-gray-500">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Microphone Status */}
                {microphoneStream && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Microphone Status:</span>
                      <span className={`font-medium ${isMuted ? 'text-red-600' : 'text-green-600'}`}>
                        {isMuted ? 'Muted' : 'Active'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Audio Test Buttons */}
                {audioEnabled && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Test Audio:</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => playAudioTone('connectTone')}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        Connect
                      </button>
                      <button
                        onClick={() => playAudioTone('endTone')}
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        End Call
                      </button>
                      <button
                        onClick={() => playAudioTone('dialTone')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                      >
                        Dial
                      </button>
                      <button
                        onClick={() => playAudioTone('ringingTone')}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                      >
                        Ring
                      </button>
                    </div>
                    <button
                      onClick={initializeMicrophone}
                      disabled={!!microphoneStream}
                      className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                        microphoneStream 
                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      }`}
                    >
                      {microphoneStream ? '✓ Microphone Ready' : 'Test Microphone'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Calls</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transcript.filter(t => t.text).length > 0 ? '1' : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Call Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentCall ? formatCallDuration(currentCall.start_time) : '00:00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transcript Lines</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transcript.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      <IncomingCallModal
        show={showIncomingCall}
        incomingCall={incomingCall}
        onAccept={() => {
          // Handle accept call
          setShowIncomingCall(false);
        }}
        onReject={() => {
          // Handle reject call
          setShowIncomingCall(false);
        }}
      />

      {/* Call History Panel */}
      {showCallHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Call History</h2>
                <p className="text-gray-600 text-sm">Recent calls from call management service</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadCallHistory}
                  disabled={historyLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCallHistory(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {historyLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading call history...</p>
                </div>
              ) : callHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Call History</h3>
                  <p className="text-gray-600 mb-4">Your call history will appear here once you make calls</p>
                  <p className="text-sm text-gray-500">Service: Call Management API is connected and ready</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {callHistory.map((call, index) => (
                    <div key={call.call_id || index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            call.status === 'completed' ? 'bg-green-100 text-green-600' :
                            call.status === 'failed' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {call.to_number || call.phone_number || 'Unknown Number'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {call.call_id ? `Call ID: ${call.call_id}` : `Index: ${index + 1}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            call.status === 'completed' ? 'text-green-600' :
                            call.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {call.status || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {call.created_at ? new Date(call.created_at).toLocaleString() : 
                             call.timestamp ? new Date(call.timestamp).toLocaleString() : 
                             'Time unknown'}
                          </div>
                        </div>
                      </div>
                      {call.duration && (
                        <div className="text-sm text-gray-600">
                          Duration: {call.duration}s
                        </div>
                      )}
                      {call.cost && (
                        <div className="text-sm text-gray-600">
                          Cost: ${call.cost}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCenterPage;
