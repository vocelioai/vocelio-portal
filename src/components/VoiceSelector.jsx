import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Loader, RefreshCw, Star, Crown, Phone, DollarSign, AlertTriangle } from 'lucide-react';
import { voiceService } from '../lib/voiceService';

const VoiceSelector = ({ 
  voiceTier, 
  setVoiceTier, 
  selectedVoice, 
  setSelectedVoice, 
  availableVoices, 
  onLoadVoices,
  isLoading,
  onEnableAudio,
  showTestCall = false,
  testPhoneNumber = ""
}) => {
  const [previewLoading, setPreviewLoading] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [customScript, setCustomScript] = useState('');
  const [testingCall, setTestingCall] = useState(false);
  const [voicesFromAPI, setVoicesFromAPI] = useState({ regular: [], premium: [] });
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [showPricingWarning, setShowPricingWarning] = useState(false);
  const [costEstimation, setCostEstimation] = useState(null);

  const defaultScript = "Hello! This is a preview of this voice. How do I sound?";
  const maxScriptLength = 500;

  // =============================================================================
  // 🚀 INITIALIZATION & VOICE LOADING
  // =============================================================================

  useEffect(() => {
    loadVoicesFromAPI();
  }, []);

  const loadVoicesFromAPI = async () => {
    try {
      setLoadingVoices(true);
      console.log('🎤 Loading voices from TTS APIs...');
      
      const voicesData = await voiceService.loadAllVoices();
      setVoicesFromAPI(voicesData);
      
      // Store pricing information
      if (voicesData.pricing) {
        setPricingInfo(voicesData.pricing);
        console.log('💰 Pricing info loaded:', voicesData.pricing);
      }
      
      console.log('✅ Loaded voices:', voicesData);
      
      // Auto-select first voice if none selected
      const tierVoices = voiceTier === 'premium' ? voicesData.premium : voicesData.regular;
      if (!selectedVoice && tierVoices.length > 0) {
        setSelectedVoice(tierVoices[0].id);
      }
      
    } catch (error) {
      console.error('❌ Failed to load voices from API:', error);
    } finally {
      setLoadingVoices(false);
    }
  };

  // Get current voices based on tier (prioritize API voices over passed props)
  const getCurrentVoices = () => {
    const apiVoices = voiceTier === 'premium' ? voicesFromAPI.premium : voicesFromAPI.regular;
    return apiVoices.length > 0 ? apiVoices : availableVoices;
  };

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

      // Use voiceService for preview
      const scriptText = customScript.trim() || defaultScript;
      const result = await voiceService.testVoice(voiceId, scriptText, {
        speed: 1.0,
        pitch: 0,
        volume: 100
      });

      if (result.success) {
        // Create audio element with explicit user interaction handling
        const audio = new Audio();
        
        // Set up event listeners before setting src
        audio.onloadstart = () => console.log('🎵 Audio loading started');
        audio.oncanplay = () => console.log('🎵 Audio can play');
        audio.onloadeddata = () => {
          console.log('🎵 Audio loaded successfully, duration:', audio.duration);
        };
        
        audio.onended = () => {
          console.log('🎵 Audio playback ended');
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(result.audioUrl); // Clean up blob URL
        };
          
        audio.onerror = (error) => {
          console.error('🎵 Audio playback error:', error, audio.error);
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(result.audioUrl); // Clean up blob URL
        };

        // Set the audio source
        audio.src = result.audioUrl;
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
          }
          throw playError;
        }
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Voice preview error:', error);
      setPreviewLoading(null);
      alert('Voice preview failed: ' + error.message);
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

  // =============================================================================
  // 📞 TEST CALL FUNCTIONALITY
  // =============================================================================

  const handleTestCall = async (voiceId) => {
    if (!testPhoneNumber || testingCall) return;
    
    try {
      setTestingCall(true);
      console.log('📞 Sending test call to:', testPhoneNumber, 'with voice:', voiceId);
      
      const testScript = customScript.trim() || "Hello! This is a test call from Vocelio to demonstrate voice quality. Thank you for testing our voice system!";
      
      const result = await voiceService.sendTestCall(testPhoneNumber, voiceId, testScript, {
        speed: 1.0,
        pitch: 0,
        volume: 100,
        estimatedDuration: 30 // 30 second test call
      });
      
      if (result.success) {
        const costInfo = result.cost_estimation 
          ? `\nEstimated cost: ${result.cost_estimation.cost_breakdown.total} (${result.cost_estimation.tier} tier)`
          : '';
        
        const warningInfo = result.pricing_warning?.shouldWarn 
          ? `\n⚠️ ${result.pricing_warning.warning_message}`
          : '';
          
        alert(`Test call initiated successfully!${costInfo}${warningInfo}\n\nCall ID: ${result.call_sid}\nVoice: ${result.voice.name}\nPhone: ${testPhoneNumber}`);
      } else {
        alert('Test call failed: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Test call error:', error);
      alert('Test call error: ' + error.message);
    } finally {
      setTestingCall(false);
    }
  };

  // =============================================================================
  // 🎯 TIER SWITCHING WITH PRICING AWARENESS
  // =============================================================================

  const handleTierChange = (newTier) => {
    // Check for pricing warning when switching to premium
    if (newTier === 'premium' && pricingInfo) {
      const warning = voiceService.validatePricingWarning(newTier, 60); // 1 minute estimate
      if (warning.shouldWarn) {
        setShowPricingWarning(true);
        setCostEstimation(warning.cost_comparison);
      }
    }
    
    setVoiceTier(newTier);
    
    // Auto-select first voice in new tier
    const tierVoices = newTier === 'premium' ? voicesFromAPI.premium : voicesFromAPI.regular;
    if (tierVoices.length > 0) {
      setSelectedVoice(tierVoices[0].id);
    }
  };

  const getVoiceGender = (voice) => {
    return voice.gender || (voice.name.toLowerCase().includes('female') ? 'Female' : 'Male');
  };

  const getVoiceLanguage = (voice) => {
    return voice.language || voice.language_code || 'en-US';
  };

  // Professional voice description mapping (same as VoicesSection)
  const getVoiceDescription = (voice) => {
    // Map accents to user-friendly descriptions
    const accentMap = {
      'US': 'American',
      'UK': 'British', 
      'AU': 'Australian',
      'CA': 'Canadian',
      'IE': 'Irish',
      'ZA': 'South African',
      'en-US': 'American',
      'en-GB': 'British',
      'en-AU': 'Australian',
      'american': 'American',
      'british': 'British',
      'neutral': 'Professional'
    };

    // Map genders to professional descriptions
    const genderMap = {
      'female': 'Female',
      'male': 'Male', 
      'neutral': 'Professional'
    };

    // Voice-specific characteristics for premium experience
    const voiceCharacteristics = {
      // Regular voices
      'alloy': 'Clear Professional Voice',
      'echo': 'Deep Professional Voice', 
      'fable': 'Warm Professional Voice',
      'onyx': 'Confident Professional Voice',
      'nova': 'Friendly Professional Voice',
      'shimmer': 'Bright Professional Voice',
      'guy': 'Male Professional Voice',
      'jane': 'Female Natural Voice',
      'aria': 'Female Elegant Voice',
      'davis': 'Male Authoritative Voice',
      'jason': 'Male Reliable Voice',
      'jenny': 'Female Smooth Voice',
      
      // Premium voices  
      'charlotte': 'Female Sophisticated Voice',
      'daniel': 'Male Distinguished Voice',
      'lily': 'Female Expressive Voice', 
      'giovanni': 'Male Dynamic Voice',
      'rachel': 'Female Captivating Voice',
      'drew': 'Male Compelling Voice',
      'clyde': 'Male Rich Voice',
      'bella': 'Female Melodic Voice'
    };

    // Check if this is a specific voice with known characteristics
    const voiceId = (voice.id || voice.name || '').toLowerCase();
    if (voiceCharacteristics[voiceId]) {
      return voiceCharacteristics[voiceId];
    }
    
    // Get user-friendly accent and gender
    let accent = 'Professional';
    if (voice.accent && accentMap[voice.accent.toLowerCase()]) {
      accent = accentMap[voice.accent.toLowerCase()];
    } else if (voice.language && accentMap[voice.language.toLowerCase()]) {
      accent = accentMap[voice.language.toLowerCase()];
    }
    
    let gender = 'Professional';
    if (voice.gender && genderMap[voice.gender.toLowerCase()]) {
      gender = genderMap[voice.gender.toLowerCase()];
    }
    
    // Combine for a professional description
    if (accent === 'Professional' && gender === 'Professional') {
      return voiceTier === 'premium' ? 'Premium Professional Voice' : 'Professional Voice';
    }
    
    return `${gender} ${accent} Voice`;
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
        <div className="flex items-center space-x-2">
          <button
            onClick={loadVoicesFromAPI}
            disabled={loadingVoices}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh voices from APIs"
          >
            <RefreshCw className={`h-4 w-4 ${loadingVoices ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLoadVoices}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh legacy voices"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice Tier
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTierChange('regular')}
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
            <div className="text-xs text-gray-500">
              Azure TTS ({voicesFromAPI.regular.length} voices)
            </div>
            {pricingInfo?.regular && (
              <div className="text-xs font-medium text-green-600 mt-1">
                ${pricingInfo.regular.price_per_minute.toFixed(3)}/min
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleTierChange('premium')}
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
            <div className="text-xs text-gray-500">
              ElevenLabs ({voicesFromAPI.premium.length} voices)
            </div>
            {pricingInfo?.premium && (
              <div className="text-xs font-medium text-amber-600 mt-1">
                ${pricingInfo.premium.price_per_minute.toFixed(3)}/min
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Warning for Premium Tier */}
      {showPricingWarning && voiceTier === 'premium' && costEstimation && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Premium Voice Cost Notice</p>
              <p className="text-xs text-amber-700 mt-1">
                Premium voices cost ${pricingInfo?.premium?.price_per_minute.toFixed(3)}/min 
                ({((pricingInfo?.premium?.price_per_minute / pricingInfo?.regular?.price_per_minute) * 100).toFixed(0)}% more than regular)
              </p>
              <div className="text-xs text-amber-600 mt-2">
                <strong>Cost comparison (1 min call):</strong> Regular: {costEstimation.regular} → Premium: {costEstimation.premium}
              </div>
              <button
                onClick={() => setShowPricingWarning(false)}
                className="text-xs text-amber-700 underline mt-1 hover:text-amber-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
          Available Voices ({getCurrentVoices().length})
        </label>
        
        {(isLoading || loadingVoices) ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading voices...</span>
          </div>
        ) : getCurrentVoices().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No voices available for {voiceTier} tier
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getCurrentVoices().map((voice) => (
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
                      {voiceTier === 'premium' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {getVoiceDescription(voice)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-3">
                    {selectedVoice === voice.id && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                    
                    {/* Test Call Button */}
                    {showTestCall && testPhoneNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestCall(voice.id);
                        }}
                        disabled={testingCall}
                        className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Send test call"
                      >
                        {testingCall ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Phone className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    
                    {/* Preview Button */}
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
      {selectedVoice && getCurrentVoices().length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Selected:</span>
            <span className="text-blue-700 ml-1">
              {getCurrentVoices().find(v => v.id === selectedVoice)?.name || selectedVoice}
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
            
            {getCurrentVoices().find(v => v.id === selectedVoice)?.provider && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono">
                  {getCurrentVoices().find(v => v.id === selectedVoice)?.provider}
                </span>
              </div>
            )}
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

      {/* Test Call Status */}
      {testingCall && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
          <Phone className="h-4 w-4" />
          <span>Initiating test call...</span>
        </div>
      )}

      {/* Voice Stats */}
      <div className="mt-4 text-xs text-gray-500 text-center border-t pt-2">
        Total: {voicesFromAPI.regular.length + voicesFromAPI.premium.length} voices • 
        Regular: {voicesFromAPI.regular.length} • 
        Premium: {voicesFromAPI.premium.length}
        {voicesFromAPI.regular.length + voicesFromAPI.premium.length > 0 && (
          <span className="ml-2 text-green-600">✓ Loaded from APIs</span>
        )}
      </div>
    </div>
  );
};

export default VoiceSelector;
