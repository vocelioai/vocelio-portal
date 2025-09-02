import React, { useState } from 'react';
import { Volume2, Play, Pause, Loader, RefreshCw, Star, Crown } from 'lucide-react';

const VoiceSelector = ({ 
  voiceTier, 
  setVoiceTier, 
  selectedVoice, 
  setSelectedVoice, 
  availableVoices, 
  onLoadVoices,
  isLoading 
}) => {
  const [previewLoading, setPreviewLoading] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);

  const handleVoicePreview = async (voiceId) => {
    try {
      setPreviewLoading(voiceId);
      
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Get preview from TTS adapter
      const response = await fetch(`${import.meta.env.VITE_TTS_ADAPTER_URL}/voice/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          voice_id: voiceId,
          text: "Hello! This is a preview of this voice. How do I sound?"
        })
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const data = await response.json();
      
      // Play audio preview
      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setPreviewLoading(null);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setPreviewLoading(null);
          setCurrentAudio(null);
        };
        
        await audio.play();
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
