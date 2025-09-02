import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, Phone, PhoneOff, User, Clock, MapPin, 
  AlertCircle, Volume2, VolumeX 
} from 'lucide-react';

const IncomingCallModal = ({ show, incomingCall, onAccept, onReject }) => {
  const [ringTone, setRingTone] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Play ringtone when call comes in
  useEffect(() => {
    if (show && incomingCall) {
      // Create a simple beep sound or use a ringtone file
      playRingtone();
      
      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
        stopRingtone();
      };
    }
  }, [show, incomingCall]);

  const playRingtone = () => {
    // You can replace this with an actual ringtone file
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Ring every 2 seconds
      const ringInterval = setInterval(() => {
        if (show) {
          const newOscillator = audioContext.createOscillator();
          const newGainNode = audioContext.createGain();
          
          newOscillator.connect(newGainNode);
          newGainNode.connect(audioContext.destination);
          
          newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          newGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          
          newOscillator.start();
          newOscillator.stop(audioContext.currentTime + 0.5);
        } else {
          clearInterval(ringInterval);
        }
      }, 2000);
      
      setRingTone({ audioContext, interval: ringInterval });
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  };

  const stopRingtone = () => {
    if (ringTone) {
      if (ringTone.interval) {
        clearInterval(ringTone.interval);
      }
      if (ringTone.audioContext) {
        ringTone.audioContext.close();
      }
      setRingTone(null);
    }
  };

  const formatCallTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    stopRingtone();
    setCallDuration(0);
    onAccept();
  };

  const handleReject = () => {
    stopRingtone();
    setCallDuration(0);
    onReject();
  };

  if (!show || !incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
        {/* Header with pulse animation */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-2">
              <PhoneIncoming className="h-8 w-8 text-white animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Incoming Call</h2>
            <div className="text-blue-100 text-sm">{formatCallTimer(callDuration)}</div>
          </div>
        </div>

        {/* Call Info */}
        <div className="p-6">
          {/* Caller Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {incomingCall.caller_avatar ? (
                <img 
                  src={incomingCall.caller_avatar} 
                  alt="Caller" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-500" />
              )}
            </div>
          </div>

          {/* Caller Details */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {incomingCall.caller_name || incomingCall.from || 'Unknown Caller'}
            </h3>
            
            <p className="text-gray-600 mb-2">
              {incomingCall.from || incomingCall.caller_number}
            </p>
            
            {incomingCall.caller_location && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{incomingCall.caller_location}</span>
              </div>
            )}
          </div>

          {/* Call Type & Quality Indicators */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <div className="text-sm font-medium text-gray-900">
                {incomingCall.call_type || 'Voice'}
              </div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Quality</div>
              <div className="flex items-center justify-center gap-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-2 w-1 rounded-full ${
                        i <= (incomingCall.signal_quality || 3)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Network</div>
              <div className="text-sm font-medium text-gray-900">
                {incomingCall.network || 'Cellular'}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {incomingCall.caller_info && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  {incomingCall.caller_info}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95"
            >
              <PhoneOff className="h-5 w-5" />
              <span>Decline</span>
            </button>
            
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <Phone className="h-5 w-5" />
              <span>Accept</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Mute ringtone"
              onClick={stopRingtone}
            >
              <VolumeX className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Send to voicemail"
            >
              <Volume2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Powered by Vocilio AI • Secure Connection
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default IncomingCallModal;
