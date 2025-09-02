import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, PhoneCall, PhoneIncoming, PhoneOff, Mic, MicOff, 
  Volume2, VolumeX, Settings, User, Clock, ArrowRight,
  Play, Pause, Download, Copy, RefreshCw, AlertCircle,
  CheckCircle, Loader, MessageSquare, FileText, Users
} from 'lucide-react';
import VoiceSelector from './VoiceSelector';
import TranscriptBox from './TranscriptBox';
import IncomingCallModal from './IncomingCallModal';

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

  // Make outbound call using telephony adapter
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
      
      if (!response.ok) {
        throw new Error(`Call failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Make call error:', error);
      throw error;
    }
  }

  // Get call status
  async getCallStatus(callSid) {
    try {
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
      throw error;
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

  // End call
  async endCall(callSid) {
    try {
      const response = await fetch(`${this.telephonyAdapter}/api/calls/${callSid}/end`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`End call failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ End call error:', error);
      throw error;
    }
  }
}

// Main Call Center Page Component
const CallCenterPage = () => {
  const [telephonyAPI] = useState(() => new TelephonyAPI());
  
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
  
  // Transcript
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // Load voices on tier change
  useEffect(() => {
    loadVoices();
  }, [voiceTier]);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const voices = await telephonyAPI.getVoices(voiceTier);
      setAvailableVoices(voices.voices || []);
      if (voices.voices && voices.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices.voices[0].id);
      }
    } catch (error) {
      setError(`Failed to load voices: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      
      const callData = await telephonyAPI.makeCall(phoneNumber, voiceTier, selectedVoice);
      setCurrentCall(callData);
      setCallStatus('ringing');
      
      // Start ASR connection
      if (callData.call_sid) {
        telephonyAPI.connectASR(
          callData.call_sid,
          handleTranscriptUpdate,
          handleASRError
        );
        setIsRecording(true);
      }
      
      // Poll for call status
      startCallStatusPolling(callData.call_sid);
      
    } catch (error) {
      setError(`Call failed: ${error.message}`);
      setCallStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // End call
  const handleEndCall = async () => {
    if (!currentCall?.call_sid) return;

    try {
      setIsLoading(true);
      await telephonyAPI.endCall(currentCall.call_sid);
      
      // Cleanup
      telephonyAPI.disconnectASR(currentCall.call_sid);
      setCurrentCall(null);
      setCallStatus('idle');
      setIsRecording(false);
      
    } catch (error) {
      setError(`Failed to end call: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  // Call status polling
  const startCallStatusPolling = (callSid) => {
    const poll = async () => {
      try {
        const status = await telephonyAPI.getCallStatus(callSid);
        setCallStatus(status.status || 'unknown');
        
        if (status.status === 'completed' || status.status === 'failed') {
          telephonyAPI.disconnectASR(callSid);
          setCurrentCall(null);
          setCallStatus('idle');
          setIsRecording(false);
          return; // Stop polling
        }
        
        // Continue polling
        setTimeout(poll, 2000);
      } catch (error) {
        console.error('❌ Status polling error:', error);
      }
    };
    
    setTimeout(poll, 1000); // Start polling after 1 second
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Call Center</h1>
          <p className="text-gray-600 mt-2">World-class telephony system with AI-powered voice capabilities</p>
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
            />

            {/* Audio Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Controls</h3>
              
              <div className="space-y-4">
                {/* Mute */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Microphone</span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-lg ${
                      isMuted 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    } transition-colors`}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>

                {/* Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Volume</span>
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
    </div>
  );
};

export default CallCenterPage;
