import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Phone, PhoneOff, Send, Play, Pause, Volume2, Loader } from 'lucide-react';
import VoiceSelector from './VoiceSelector';
import { realtimeConversationService } from '../services/realtimeConversationService';

const WebClientModal = ({ 
  isDarkMode, 
  closeModal, 
  globalVoiceSettings, 
  setGlobalVoiceSettings,
  availableVoices,
  loadVoices,
  loadingVoices,
  enableAudioContext
}) => {
  // State for conversation management
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState('default');
  const [callSid, setCallSid] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for audio management
  const messagesEndRef = useRef(null);

  // Backend URLs from environment (using the service now)
  // URLs are handled by realtimeConversationService

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up real-time conversation service event listeners
  useEffect(() => {
    // Set up event listeners for real-time updates
    realtimeConversationService.on('transcript', (data) => {
      if (data.is_final && data.speaker === 'customer') {
        addUserMessage(data.text);
      }
    });

    realtimeConversationService.on('ai_response', (data) => {
      addAIMessage(data.text);
    });

    realtimeConversationService.on('tts_generated', (data) => {
      // Update the last AI message with audio URL
      setMessages(prev => {
        const updated = [...prev];
        const lastAIMessage = updated.reverse().find(m => m.type === 'ai' && m.text === data.text);
        if (lastAIMessage) {
          lastAIMessage.audioUrl = data.audio_url;
        }
        return updated.reverse();
      });
    });

    realtimeConversationService.on('connection_status', (data) => {
      setConnectionStatus(data.status);
      if (data.status === 'connected') {
        addSystemMessage('✅ Real-time connection established');
      } else if (data.status === 'error') {
        addSystemMessage('❌ Connection error occurred', 'error');
      }
    });

    realtimeConversationService.on('speech_detection', (data) => {
      setIsListening(data.is_speaking);
    });

    realtimeConversationService.on('audio_playback', (data) => {
      setIsSpeaking(data.is_playing);
    });

    realtimeConversationService.on('status_change', (data) => {
      if (data.status === 'completed' || data.status === 'ended') {
        setIsSessionActive(false);
        addSystemMessage('📞 Session ended');
      }
    });

    realtimeConversationService.on('error', (data) => {
      addSystemMessage(`❌ Error: ${data.error}`, 'error');
    });

    realtimeConversationService.on('session_ended', () => {
      setIsSessionActive(false);
      setConnectionStatus('disconnected');
      setCallSid(null);
    });

    return () => {
      realtimeConversationService.destroy();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realtimeConversationService.destroy();
    };
  }, []);

  // Add system message
  const addSystemMessage = (text, type = 'system') => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      text,
      timestamp: new Date(),
      speaker: 'system'
    };
    setMessages(prev => [...prev, message]);
  };

  // Add user message
  const addUserMessage = (text) => {
    const message = {
      id: Date.now() + Math.random(),
      type: 'user',
      text,
      timestamp: new Date(),
      speaker: 'customer'
    };
    setMessages(prev => [...prev, message]);
  };

  // Add AI message
  const addAIMessage = (text, audioUrl = null) => {
    const message = {
      id: Date.now() + Math.random(),
      type: 'ai',
      text,
      timestamp: new Date(),
      speaker: 'ai',
      audioUrl
    };
    setMessages(prev => [...prev, message]);
  };

  // Start conversation session using the service
  const startSession = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      addSystemMessage('🔄 Initializing conversation session with STT → AI → TTS flow...');

      const result = await realtimeConversationService.startSession({
        flowId: selectedFlow,
        voiceProvider: globalVoiceSettings.selectedVoice?.provider || 'azure',
        voiceId: globalVoiceSettings.selectedVoice?.id || 'aria',
        voiceTier: globalVoiceSettings.voiceTier || 'regular',
        language: 'en-US',
        userId: 'webclient_user'
      });

      if (result.success) {
        setCallSid(result.session_id);
        setIsSessionActive(true);
        setConnectionStatus('connected');
        
        addSystemMessage('✅ Session started successfully! Real-time STT → AI → TTS flow is active.');
        addSystemMessage('💬 You can now type messages to simulate customer speech input.');
        
        // Send initial AI greeting
        setTimeout(() => {
          addAIMessage("Hello! I'm your AI assistant. I'm ready to help you today. How can I assist you?");
        }, 1000);

      } else {
        throw new Error(result.error || 'Failed to start session');
      }

    } catch (error) {
      console.error('Failed to start session:', error);
      addSystemMessage(`❌ Failed to start session: ${error.message}`, 'error');
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Setup EventSource for real-time transcript updates
  const setupEventStream = async (sessionId) => {
    if (!sessionId) return;

    try {
      const eventSourceUrl = `${REAL_TIME_MONITORING_URL}/calls/${sessionId}/events`;
      eventSourceRef.current = new EventSource(eventSourceUrl);

      eventSourceRef.current.onopen = () => {
        console.log('✅ Real-time event stream connected');
        setConnectionStatus('connected');
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to setup event stream:', error);
    }
  };

  // Handle real-time events from backend
  const handleRealtimeEvent = (data) => {
    console.log('📡 Real-time event received:', data);

    switch (data.type) {
      case 'transcript':
        if (data.speaker === 'customer' && data.is_final) {
          addUserMessage(data.text);
        } else if (data.speaker === 'ai' && data.is_final) {
          addAIMessage(data.text, data.audio_url);
        }
        break;

      case 'call_status':
        setConnectionStatus(data.status);
        if (data.status === 'completed') {
          setIsSessionActive(false);
          addSystemMessage('📞 Call session ended');
        }
        break;

      case 'audio_playback':
        setIsSpeaking(data.is_playing);
        break;

      case 'speech_detection':
        setIsListening(data.is_speaking);
        break;

      default:
        console.log('Unknown event type:', data.type);
    }
  };

  // Send message using the service (simulates STT → AI → TTS flow)
  const sendMessage = async () => {
    if (!currentMessage.trim() || !isSessionActive) return;

    const userText = currentMessage.trim();
    setCurrentMessage('');

    // Add user message to UI immediately (simulates STT result)
    addUserMessage(userText);
    addSystemMessage(`🎤 STT: Customer speech transcribed → "${userText}"`);

    try {
      // Send to service for AI processing
      const result = await realtimeConversationService.sendMessage(userText);
      
      if (result.success) {
        addSystemMessage('🧠 AI: Processing customer message and generating response...');
        // AI response will come through real-time events
      } else {
        throw new Error(result.error || 'Failed to send message');
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      addSystemMessage(`❌ Failed to send message: ${error.message}`, 'error');
    }
  };

  // End session using the service
  const endSession = async () => {
    try {
      await realtimeConversationService.endSession();
      addSystemMessage('📞 Session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
      addSystemMessage(`❌ Failed to end session properly: ${error.message}`, 'error');
    }
  };

  // Play audio message
  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);
    audio.play().catch(console.error);
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get status indicator color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
      if (e.target === e.currentTarget) closeModal();
    }}>
      <div className={`rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>🌐 Web Client</h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Real-time conversation testing: Customer Speech (STT) → AI Processing → Voice Response (TTS)</p>
          </div>
          <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Configuration */}
          <div className={`w-80 border-r p-4 space-y-4 overflow-y-auto ${
            isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Configuration</h3>
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            </div>
            
            {/* Flow Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Conversation Flow</label>
              <select 
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value)}
                disabled={isSessionActive}
                className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } ${isSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="default">Default Sales Flow</option>
                <option value="support">Customer Support Flow</option>
                <option value="qualifier">Lead Qualifier Flow</option>
                <option value="appointment">Appointment Setter Flow</option>
              </select>
            </div>

            {/* Voice Selection */}
            <div>
              <VoiceSelector
                voiceTier={globalVoiceSettings.voiceTier}
                setVoiceTier={(tier) => setGlobalVoiceSettings(prev => ({ ...prev, voiceTier: tier }))}
                selectedVoice={globalVoiceSettings.selectedVoice}
                setSelectedVoice={(voice) => setGlobalVoiceSettings(prev => ({ ...prev, selectedVoice: voice }))}
                availableVoices={availableVoices}
                onLoadVoices={loadVoices}
                isLoading={loadingVoices}
                onEnableAudio={enableAudioContext}
                showTestCall={false}
                mode="compact"
                className=""
                title="AI Voice"
                description="Voice for AI responses"
              />
            </div>

            {/* Session Controls */}
            <div className="space-y-3">
              {!isSessionActive ? (
                <button 
                  onClick={startSession}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Start Conversation
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={endSession}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Session
                </button>
              )}
            </div>

            {/* Status Panel */}
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
              </div>
              
              {isSessionActive && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-3 h-3 ${isListening ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      STT: {isListening ? 'Listening' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className={`w-3 h-3 ${isSpeaking ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      TTS: {isSpeaking ? 'Speaking' : 'Ready'}
                    </span>
                  </div>
                  {callSid && (
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Session: {callSid.substring(0, 8)}...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="flex-1 flex flex-col">
            
            {/* Messages Area */}
            <div className={`flex-1 p-4 overflow-y-auto ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              
              {messages.length === 0 ? (
                <div className={`text-center py-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Ready for Conversation</h3>
                  <p className="mb-4">Start a session to test the STT → AI → TTS conversation flow</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'ai'
                          ? isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                          : message.type === 'error'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        
                        {/* Message content */}
                        <div className="text-sm">{message.text}</div>
                        
                        {/* Audio playback for AI messages */}
                        {message.type === 'ai' && message.audioUrl && (
                          <button
                            onClick={() => playAudio(message.audioUrl)}
                            className="mt-2 flex items-center gap-1 text-xs opacity-75 hover:opacity-100 transition-opacity"
                          >
                            <Volume2 className="w-3 h-3" />
                            Play Audio
                          </button>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-1 opacity-60 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className={`border-t p-4 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isSessionActive ? "Type message as customer (simulates STT input)..." : "Start a session to enable chat"}
                  disabled={!isSessionActive}
                  className={`flex-1 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  } ${!isSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!isSessionActive || !currentMessage.trim()}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                    isSessionActive && currentMessage.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              
              <div className={`text-xs mt-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {isSessionActive 
                  ? '💬 Text Input → STT Simulation → AI Processing → TTS Generation → Audio Response'
                  : 'Start a session to test the complete STT → AI → TTS conversation flow'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebClientModal;
