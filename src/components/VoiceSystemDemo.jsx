import React, { useState, useEffect } from 'react';
import VoiceSelector from '../components/VoiceSelector';
import { voiceService } from '../lib/voiceService';

const VoiceSystemDemo = () => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voiceTier, setVoiceTier] = useState('regular');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+1234567890');
  const [voiceStats, setVoiceStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVoiceStats();
  }, []);

  const loadVoiceStats = async () => {
    try {
      setLoading(true);
      await voiceService.loadAllVoices();
      const stats = voiceService.getVoiceStats();
      setVoiceStats(stats);
    } catch (error) {
      console.error('Error loading voice stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceChange = (voiceId, voiceObject) => {
    setSelectedVoice(voiceId);
    console.log('Voice selected:', voiceObject);
  };

  const handleEnableAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      console.log('Audio context enabled');
    } catch (error) {
      console.error('Failed to enable audio:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Enhanced Voice System Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Two-tier voice selection with Azure TTS (Regular) and ElevenLabs TTS (Premium)
          </p>
          
          {/* Voice Stats */}
          {voiceStats && (
            <div className="flex justify-center space-x-6 mb-6">
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-semibold">
                  Total: {voiceStats.total} voices
                </span>
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-green-800 font-semibold">
                  Regular: {voiceStats.regular}
                </span>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <span className="text-purple-800 font-semibold">
                  Premium: {voiceStats.premium}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Selector */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <VoiceSelector
              voiceTier={voiceTier}
              setVoiceTier={setVoiceTier}
              selectedVoice={selectedVoice}
              setSelectedVoice={handleVoiceChange}
              availableVoices={[]} // Will use API voices
              onLoadVoices={() => {}} // Legacy function
              isLoading={loading}
              onEnableAudio={handleEnableAudio}
              showTestCall={true}
              testPhoneNumber={testPhoneNumber}
            />
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Test Phone Number */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📞 Test Call Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Phone Number
                  </label>
                  <input
                    type="tel"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Enter a phone number to test voice calls with selected voices
                </p>
              </div>
            </div>

            {/* Voice Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Current Selection
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Voice Tier:</span>
                  <span className="font-semibold capitalize">{voiceTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Voice:</span>
                  <span className="font-semibold">{selectedVoice || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-semibold">
                    {voiceTier === 'premium' ? 'ElevenLabs' : 'Azure TTS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ Enhanced Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Dynamic voice loading from TTS APIs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Two-tier system (Regular + Premium)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Real-time voice preview
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Test call functionality
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Advanced voice settings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Provider-specific optimization
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Integration Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">In FlowDesigner:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<VoiceSelector
  voiceTier={nodeForm.voiceTier}
  setVoiceTier={(tier) => setNodeForm({...nodeForm, voiceTier: tier})}
  selectedVoice={nodeForm.voice}
  setSelectedVoice={(voice) => setNodeForm({...nodeForm, voice: voice})}
  showTestCall={true}
  testPhoneNumber="+1234567890"
/>`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Direct API Usage:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { voiceService } from './lib/voiceService';

// Load voices
const voices = await voiceService.loadAllVoices();

// Test voice
const result = await voiceService.testVoice(voiceId, text);

// Send test call
const call = await voiceService.sendTestCall(phone, voiceId, script);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSystemDemo;
