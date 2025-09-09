import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  Clock, User, MapPin, RotateCcw, ArrowRightLeft, Settings,
  Pause, Play, SkipForward, SkipBack, Circle, Square
} from 'lucide-react';

// ===== COPILOT PROMPT #3: Voice Channel Panel =====
const VoiceChannelPanel = ({ isActive, onClose }) => {
  const [callState, setCallState] = useState('idle'); // idle, incoming, active, hold, transferring
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [selectedLine, setSelectedLine] = useState(1);
  
  // Mock session data for development
  const sessions = [];
  const sessionOps = {
    createSession: () => Promise.resolve(),
    updateSession: () => Promise.resolve(),
    transferSession: () => Promise.resolve()
  };
  const operationStates = {};

  const callTimer = useRef(null);
  const audioContext = useRef(null);

  // Timer for active calls
  useEffect(() => {
    if (callState === 'active') {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimer.current);
      if (callState === 'idle') setCallDuration(0);
    }

    return () => clearInterval(callTimer.current);
  }, [callState]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice control handlers
  const handleAnswer = useCallback(async () => {
    setCallState('active');
    setCallDuration(0);
    
    // Initialize audio context for call
    try {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🎵 Voice channel: Call answered, audio context initialized');
    } catch (error) {
      console.error('❌ Audio context initialization failed:', error);
    }
  }, []);

  const handleHangup = useCallback(async () => {
    setCallState('idle');
    setCallDuration(0);
    setIsRecording(false);
    
    // Clean up audio context
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    
    console.log('📞 Voice channel: Call ended');
  }, []);

  const handleHold = useCallback(async () => {
    const newState = callState === 'hold' ? 'active' : 'hold';
    setCallState(newState);
    console.log(`⏸️ Voice channel: Call ${newState === 'hold' ? 'held' : 'resumed'}`);
  }, [callState]);

  const handleTransfer = useCallback(async () => {
    setCallState('transferring');
    console.log('🔄 Voice channel: Initiating call transfer');
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    console.log(`🎤 Voice channel: Microphone ${!isMuted ? 'muted' : 'unmuted'}`);
  }, [isMuted]);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    console.log(`⏺️ Voice channel: Recording ${!isRecording ? 'started' : 'stopped'}`);
  }, [isRecording]);

  // Simulate incoming call for demo
  const simulateIncomingCall = useCallback(() => {
    setCallState('incoming');
    console.log('📞 Voice channel: Incoming call simulation');
  }, []);

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Voice Channel</h3>
            <p className="text-sm text-gray-600">Line {selectedLine} • {callState}</p>
          </div>
        </div>
        
        {/* Line Selector */}
        <select 
          value={selectedLine} 
          onChange={(e) => setSelectedLine(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
        >
          {[1, 2, 3, 4, 5].map(line => (
            <option key={line} value={line}>Line {line}</option>
          ))}
        </select>
      </div>

      {/* Call Status Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              callState === 'active' ? 'bg-green-500 animate-pulse' :
              callState === 'incoming' ? 'bg-blue-500 animate-pulse' :
              callState === 'hold' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
            <div>
              <p className="font-medium text-gray-900">
                {callState === 'incoming' ? 'Incoming Call' :
                 callState === 'active' ? 'Active Call' :
                 callState === 'hold' ? 'Call on Hold' :
                 callState === 'transferring' ? 'Transferring...' : 'No Active Call'}
              </p>
              {callState !== 'idle' && (
                <p className="text-sm text-gray-600">
                  Duration: {formatDuration(callDuration)}
                </p>
              )}
            </div>
          </div>
          
          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <Circle className="w-4 h-4 animate-pulse fill-red-600" />
              <span className="text-sm font-medium">REC</span>
            </div>
          )}
        </div>
      </div>

      {/* Caller Information (when in call) */}
      {callState !== 'idle' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="inline-flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  New York, NY
                </span>
                <span className="inline-flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Returning Customer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="space-y-4">
        {/* Primary Controls */}
        <div className="flex justify-center space-x-4">
          {callState === 'idle' && (
            <button
              onClick={simulateIncomingCall}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Simulate Call</span>
            </button>
          )}

          {callState === 'incoming' && (
            <div className="flex space-x-3">
              <button
                onClick={handleAnswer}
                className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Answer</span>
              </button>
              <button
                onClick={handleHangup}
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </div>
          )}

          {(callState === 'active' || callState === 'hold') && (
            <div className="flex space-x-3">
              <button
                onClick={handleHold}
                className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
                  callState === 'hold' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {callState === 'hold' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{callState === 'hold' ? 'Resume' : 'Hold'}</span>
              </button>
              
              <button
                onClick={handleTransfer}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer</span>
              </button>
              
              <button
                onClick={handleHangup}
                className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          )}
        </div>

        {/* Secondary Controls */}
        {(callState === 'active' || callState === 'hold') && (
          <div className="flex justify-center space-x-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-lg flex items-center space-x-2 ${
                isMuted 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-lg flex items-center space-x-2 ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Volume Control */}
        {callState !== 'idle' && (
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 min-w-[3rem]">{volume}%</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Quick Actions</span>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            📞 Speed Dial
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            📋 Call Notes
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            🔄 Call History
          </button>
          <button className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelPanel;
