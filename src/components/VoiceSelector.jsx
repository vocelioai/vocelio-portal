import React, { useState } from 'react';
import { Volume2, Play, Pause, Loader, RefreshCw, Star, Crown } from 'lucide-react';

const VoiceSelector = ({ 
  voiceTier, 
  setVoiceTier, 
  selectedVoice, 
  setSelectedVoice, 
  availableVoices, 
  onLoadVoices,
  isLoading,
  onEnableAudio
}) => {
  const [previewLoading, setPreviewLoading] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [customScript, setCustomScript] = useState('');

  const defaultScript = "Hello! This is a preview of this voice. How do I sound?";
  const maxScriptLength = 500;

  const handleVoicePreview = async (voiceId) => {
    try {
      // Enable audio context first
      if (onEnableAudio) {
        await onEnableAudio();
      }
      
      setPreviewLoading(voiceId);
      console.log('🎵 Starting voice preview for:', voiceId);
      
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }

      // Find the voice object to get the correct provider
      const voiceObj = availableVoices.find(v => v.id === voiceId);
      const provider = voiceObj?.provider || (voiceTier === 'premium' ? 'elevenlabs' : 'azure');
      
      // ElevenLabs doesn't use language parameter the same way as Azure
      const scriptText = customScript.trim() || defaultScript;
      const requestBody = {
        text: scriptText,
        provider: provider,
        voice_id: voiceId,
        ...(provider === 'azure' ? { language: 'en-US' } : {}),
        speed: 1.0,
        customer_id: 'voice_preview',
        call_id: 'preview_' + Date.now()
      };
      
      console.log('🎵 Request body:', requestBody);
      console.log('🎵 Using script:', scriptText.substring(0, 50) + (scriptText.length > 50 ? '...' : ''));
      console.log('🎵 Using provider:', provider, 'for voice tier:', voiceTier);
      console.log('🎵 Voice object:', voiceObj);
      console.log('🎵 TTS URL:', `${import.meta.env.VITE_TTS_ADAPTER_URL}/synthesize`);

      // Get preview from TTS adapter using synthesize endpoint
      const response = await fetch(`${import.meta.env.VITE_TTS_ADAPTER_URL}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🎵 Response status:', response.status, response.statusText);
      console.log('🎵 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎵 Response error:', errorText);
        throw new Error(`Preview failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Get audio blob from synthesize response
      const audioBlob = await response.blob();
      console.log('🎵 Audio blob size:', audioBlob.size, 'type:', audioBlob.type);
      
      if (audioBlob.size === 0) {
        throw new Error('Empty audio response from ' + provider);
      }
      
      // Check if it's actually an error response in blob form
      if (audioBlob.type.includes('text') || audioBlob.type.includes('json')) {
        const errorText = await audioBlob.text();
        console.error('🎵 Error response in blob:', errorText);
        throw new Error('API returned error: ' + errorText);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🎵 Audio URL created:', audioUrl);
      
      // Create audio element with explicit user interaction handling
      const audio = new Audio();
      
      // Set up event listeners before setting src
      audio.onloadstart = () => console.log('🎵 Audio loading started');
      audio.oncanplay = () => console.log('🎵 Audio can play');
      audio.onloadeddata = () => {
        console.log('🎵 Audio loaded successfully, duration:', audio.duration, 'provider:', provider);
      };
      
      audio.onended = () => {
          console.log('🎵 Audio playback ended');
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl); // Clean up blob URL
        };
        
      audio.onerror = (error) => {
          console.error('🎵 Audio playback error:', error, audio.error);
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl); // Clean up blob URL
        };

      // Set the audio source
      audio.src = audioUrl;
      setCurrentAudio(audio);
      
      // Load the audio
      audio.load();
      
      console.log('🎵 Starting audio playback...');
      
      // Try to play with proper error handling
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('🎵 Audio play() called successfully');
        }
      } catch (playError) {
        console.error('🎵 Play promise rejected:', playError);
        if (playError.name === 'NotAllowedError') {
          console.log('🎵 Audio blocked by browser - user interaction required');
          // You might want to show a message to the user here
        }
        throw playError;
      }
      
    } catch (error) {
      console.error('❌ Voice preview error:', error);
      setPreviewLoading(null);
    }
  };

  const stopPreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPreviewLoading(null);
    }
  };

  const getVoiceGender = (voice) => {
    return voice.gender || (voice.name.toLowerCase().includes('female') ? 'Female' : 'Male');
  };

  const getVoiceLanguage = (voice) => {
    return voice.language || voice.language_code || 'en-US';
  };

  const getTierIcon = (tier) => {
    return tier === 'premium' ? <Crown className="h-4 w-4 text-yellow-500" /> : <Star className="h-4 w-4 text-gray-400" />;
  };

  const getTierColor = (tier) => {
    return tier === 'premium' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Voice Settings</h3>
        <button
          onClick={onLoadVoices}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tier Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice Tier
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVoiceTier('regular')}
            className={`p-3 border rounded-lg text-center transition-all ${
              voiceTier === 'regular'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-4 w-4" />
              <span className="font-medium">Regular</span>
            </div>
            <div className="text-xs text-gray-500">Standard quality</div>
          </button>
          
          <button
            onClick={() => setVoiceTier('premium')}
            className={`p-3 border rounded-lg text-center transition-all ${
              voiceTier === 'premium'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Premium</span>
            </div>
            <div className="text-xs text-gray-500">High quality</div>
          </button>
        </div>
      </div>

      {/* Custom Script Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Script (Optional)
        </label>
        <div className="relative">
          <textarea
            value={customScript}
            onChange={(e) => {
              if (e.target.value.length <= maxScriptLength) {
                setCustomScript(e.target.value);
              }
            }}
            placeholder="Enter your custom script to test with voices, or leave empty for default preview..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            rows={3}
            maxLength={maxScriptLength}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {customScript.length}/{maxScriptLength}
          </div>
        </div>
        {customScript.trim() && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Volume2 className="h-4 w-4" />
              <span>Voice previews will use your custom script</span>
            </div>
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setCustomScript('')}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear Script
          </button>
          <button
            onClick={() => setCustomScript('Hi there! I hope you\'re having a great day. I\'m calling from Vocilio to discuss how our AI calling platform can help streamline your sales process and increase your conversion rates. Do you have a few minutes to chat?')}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Load Sales Script Example
          </button>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Voices ({availableVoices.length})
        </label>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading voices...</span>
          </div>
        ) : availableVoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No voices available for {voiceTier} tier
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableVoices.map((voice) => (
              <div
                key={voice.id}
                className={`border rounded-lg p-3 transition-all cursor-pointer ${
                  selectedVoice === voice.id
                    ? 'border-blue-500 bg-blue-50'
                    : `hover:bg-gray-50 ${getTierColor(voice.tier || voiceTier)}`
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTierIcon(voice.tier || voiceTier)}
                      <span className="font-medium text-gray-900">
                        {voice.name || voice.display_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{getVoiceGender(voice)}</span>
                      <span>•</span>
                      <span>{getVoiceLanguage(voice)}</span>
                      {voice.accent && (
                        <>
                          <span>•</span>
                          <span>{voice.accent}</span>
                        </>
                      )}
                    </div>
                    
                    {voice.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {voice.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-3">
                    {selectedVoice === voice.id && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previewLoading === voice.id) {
                          stopPreview();
                        } else {
                          handleVoicePreview(voice.id);
                        }
                      }}
                      disabled={previewLoading && previewLoading !== voice.id}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {previewLoading === voice.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Voice Info */}
      {selectedVoice && availableVoices.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Selected:</span>
            <span className="text-blue-700 ml-1">
              {availableVoices.find(v => v.id === selectedVoice)?.name || selectedVoice}
            </span>
          </div>
          
          {/* Voice Quality Indicators */}
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
            <div className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              <span>Neural</span>
            </div>
            
            {voiceTier === 'premium' && (
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span>Premium Quality</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Status */}
      {previewLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Loader className="h-4 w-4 animate-spin" />
          <span>Playing voice preview...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
