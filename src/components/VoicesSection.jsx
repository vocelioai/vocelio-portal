import React, { useState, useEffect } from 'react';
import { 
  Mic2, 
  Play, 
  Pause, 
  Volume2, 
  Star, 
  Zap, 
  Clock, 
  DollarSign,
  Globe,
  Copy,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { voiceService } from '../lib/voiceService';

const VoicesSection = () => {
  const [voices, setVoices] = useState({ regular: [], premium: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTier, setSelectedTier] = useState('regular');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [customScript, setCustomScript] = useState('Hello! Welcome to Vocelio AI. This is a sample voice demonstration to help you choose the perfect voice for your flows.');
  const [playingVoice, setPlayingVoice] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Language options for multi-language support
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' }
  ];

  // Sample scripts for different languages
  const sampleScripts = {
    'en-US': 'Hello! Welcome to Vocelio AI. This is a sample voice demonstration to help you choose the perfect voice for your flows.',
    'en-GB': 'Hello! Welcome to Vocelio AI. This is a sample voice demonstration to help you choose the perfect voice for your flows.',
    'es-ES': '¡Hola! Bienvenido a Vocelio AI. Esta es una demostración de voz de muestra para ayudarte a elegir la voz perfecta para tus flujos.',
    'es-MX': '¡Hola! Bienvenido a Vocelio AI. Esta es una demostración de voz de muestra para ayudarte a elegir la voz perfecta para tus flujos.',
    'fr-FR': 'Bonjour ! Bienvenue chez Vocelio AI. Ceci est une démonstration vocale pour vous aider à choisir la voix parfaite pour vos flux.',
    'de-DE': 'Hallo! Willkommen bei Vocelio AI. Dies ist eine Stimmdemonstration, um Ihnen bei der Auswahl der perfekten Stimme für Ihre Flows zu helfen.',
    'it-IT': 'Ciao! Benvenuto in Vocelio AI. Questa è una dimostrazione vocale per aiutarti a scegliere la voce perfetta per i tuoi flussi.',
    'pt-BR': 'Olá! Bem-vindo ao Vocelio AI. Esta é uma demonstração de voz para ajudá-lo a escolher a voz perfeita para seus fluxos.',
    'ja-JP': 'こんにちは！Vocelio AIへようこそ。これは、フローに最適な音声を選択するのに役立つサンプル音声デモンストレーションです。',
    'ko-KR': '안녕하세요! Vocelio AI에 오신 것을 환영합니다. 이것은 플로우에 완벽한 음성을 선택하는 데 도움이 되는 샘플 음성 데모입니다.',
    'zh-CN': '您好！欢迎来到Vocelio AI。这是一个语音演示样本，帮助您为流程选择完美的声音。',
    'hi-IN': 'नमस्ते! Vocelio AI में आपका स्वागत है। यह आपके फ्लो के लिए सही आवाज़ चुनने में मदद करने के लिए एक नमूना आवाज़ प्रदर्शन है।'
  };

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    // Update script when language changes
    if (sampleScripts[selectedLanguage]) {
      setCustomScript(sampleScripts[selectedLanguage]);
    }
  }, [selectedLanguage]);

  const loadVoices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎤 Loading voices for Voices page...');
      console.log('🔧 Voice service available:', !!voiceService);
      
      // Check if voiceService methods exist
      if (!voiceService || typeof voiceService.loadAllVoices !== 'function') {
        console.error('❌ Voice service not properly initialized');
        throw new Error('Voice service not available');
      }
      
      const voicesData = await voiceService.loadAllVoices();
      console.log('✅ Raw voices data received:', voicesData);
      
      // Ensure we have the expected structure
      if (voicesData && typeof voicesData === 'object') {
        setVoices({
          regular: voicesData.regular || [],
          premium: voicesData.premium || []
        });
        console.log('✅ Voices loaded for page:', {
          regular: voicesData.regular?.length || 0,
          premium: voicesData.premium?.length || 0
        });
      } else {
        throw new Error('Invalid voices data structure');
      }
      
    } catch (error) {
      console.error('❌ Failed to load voices:', error);
      console.log('🔄 Using fallback voices...');
      setError(`Failed to load voices: ${error.message}`);
      // Use fallback voices
      setVoices({
        regular: [
          { id: 'alloy', name: 'Alloy', provider: 'azure', gender: 'neutral', accent: 'US' },
          { id: 'echo', name: 'Echo', provider: 'azure', gender: 'male', accent: 'US' },
          { id: 'fable', name: 'Fable', provider: 'azure', gender: 'female', accent: 'UK' },
          { id: 'onyx', name: 'Onyx', provider: 'azure', gender: 'male', accent: 'US' },
          { id: 'nova', name: 'Nova', provider: 'azure', gender: 'female', accent: 'US' },
          { id: 'shimmer', name: 'Shimmer', provider: 'azure', gender: 'female', accent: 'US' }
        ],
        premium: [
          { id: 'charlotte', name: 'Charlotte', provider: 'elevenlabs', gender: 'female', accent: 'US' },
          { id: 'daniel', name: 'Daniel', provider: 'elevenlabs', gender: 'male', accent: 'UK' },
          { id: 'lily', name: 'Lily', provider: 'elevenlabs', gender: 'female', accent: 'UK' },
          { id: 'giovanni', name: 'Giovanni', provider: 'elevenlabs', gender: 'male', accent: 'US' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshVoices = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshSuccess(false);
      console.log('🔄 Refreshing voices (clearing cache)...');
      
      // Use refreshVoices to clear cache and reload
      const voicesData = await voiceService.refreshVoices();
      console.log('✅ Voices refreshed:', voicesData);
      
      if (voicesData && typeof voicesData === 'object') {
        setVoices({
          regular: voicesData.regular || [],
          premium: voicesData.premium || []
        });
        console.log('✅ Voice cache cleared and reloaded:', {
          regular: voicesData.regular?.length || 0,
          premium: voicesData.premium?.length || 0
        });
        
        // Show success message
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
        
      } else {
        throw new Error('Invalid voices data structure after refresh');
      }
      
    } catch (error) {
      console.error('❌ Failed to refresh voices:', error);
      setError(`Failed to refresh voices: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoicePreview = async (voiceId, voiceName) => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setPlayingVoice(null);
      }
      
      setPreviewLoading(voiceId);
      setPlayingVoice(voiceId);
      
      const scriptText = customScript || "Hello! Welcome to Vocelio AI. This is a sample voice demonstration to help you choose the perfect voice for your flows.";
      console.log(`🎵 Playing voice preview: ${voiceName} with script: "${scriptText}"`);
      
      // Use voice service to test the voice and get audio
      const result = await voiceService.testVoice(voiceId, scriptText, {
        language: selectedLanguage
      });
      
      if (result.success && result.audioUrl) {
        // Create audio element and play
        const audio = new Audio(result.audioUrl);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setPlayingVoice(null);
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(result.audioUrl);
        };
        
        audio.onerror = (error) => {
          console.error('❌ Audio playback failed:', error);
          setError('Audio playback failed. Please check your audio settings.');
          setPlayingVoice(null);
          setPreviewLoading(null);
          setCurrentAudio(null);
          URL.revokeObjectURL(result.audioUrl);
        };
        
        audio.onloadstart = () => {
          console.log('🎶 Audio loading started...');
        };
        
        audio.oncanplay = () => {
          console.log('🎶 Audio ready to play');
        };
        
        await audio.play();
        console.log('✅ Audio playback started successfully');
        
        // Clear preview loading immediately after starting playback
        setPreviewLoading(null);
        
      } else {
        throw new Error(result.error || 'Failed to generate voice preview');
      }
      
    } catch (error) {
      console.error('❌ Voice preview failed:', error);
      setError(`Voice preview failed: ${error.message}. Check console for details.`);
      setPlayingVoice(null);
      setPreviewLoading(null);
      setCurrentAudio(null);
    }
  };

  const stopVoicePreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingVoice(null);
    setPreviewLoading(null);
    console.log('🛑 Voice preview stopped');
  };

  const copyScript = () => {
    navigator.clipboard.writeText(customScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const getCurrentVoices = () => {
    return selectedTier === 'premium' ? voices.premium : voices.regular;
  };

  const getTierInfo = (tier) => {
    return tier === 'premium' 
      ? { price: '$0.35', provider: 'ElevenLabs', quality: 'Ultra-High', features: ['Natural inflection', 'Emotional range', 'Custom voices'] }
      : { price: '$0.08', provider: 'Azure TTS', quality: 'High', features: ['Clear speech', 'Multiple accents', 'Reliable'] };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading voices...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voices</h1>
          <p className="text-gray-600 mt-1">Explore and test our two-tier voice system with your own scripts</p>
        </div>
        <button
          onClick={handleRefreshVoices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {loading ? 'Refreshing...' : 'Refresh Voices'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <Mic2 className="w-5 h-5" />
            <span className="font-medium">Voice Loading Error</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          <p className="text-red-600 mt-2 text-sm">Using fallback voices. Check console for details.</p>
        </div>
      )}

      {/* Success Display */}
      {refreshSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <span className="font-medium">Voices Refreshed Successfully</span>
          </div>
          <p className="text-green-700 mt-1 text-sm">Voice catalog updated with latest available voices.</p>
        </div>
      )}

      {/* Tier Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular Tier */}
          <div 
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTier === 'regular' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTier('regular')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Regular Voices</h3>
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">$0.08/min</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">High-quality Azure TTS voices for standard use</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Volume2 className="w-4 h-4" />
              <span>{voices.regular.length} voices available</span>
            </div>
          </div>

          {/* Premium Tier */}
          <div 
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTier === 'premium' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTier('premium')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Premium Voices</h3>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">$0.35/min</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">Ultra-realistic ElevenLabs voices with natural inflection</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span>{voices.premium.length} voices available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Script Testing Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Script Testing</h2>
        
        {/* Language Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Script Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Your Script</label>
            <button
              onClick={copyScript}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedScript ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={customScript}
            onChange={(e) => setCustomScript(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your custom script to test with voices..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Character count: {customScript.length} | Estimated duration: ~{Math.ceil(customScript.length / 150)} seconds
          </p>
        </div>
      </div>

      {/* Voices Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedTier === 'premium' ? 'Premium' : 'Regular'} Voices
          </h2>
          <div className="text-sm text-gray-500">
            {getCurrentVoices().length} voices available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentVoices().map((voice) => (
            <div
              key={voice.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                  <p className="text-sm text-gray-500">
                    {voice.gender} • {voice.accent || voice.provider}
                  </p>
                </div>
                {selectedTier === 'premium' && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      selectedTier === 'premium' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                    style={{ width: '75%' }}
                  />
                </div>
                <span className="text-xs text-gray-500">Quality</span>
              </div>

              <button
                onClick={() => playingVoice === voice.id ? stopVoicePreview() : handleVoicePreview(voice.id, voice.name)}
                disabled={previewLoading === voice.id}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTier === 'premium'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {previewLoading === voice.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : playingVoice === voice.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {previewLoading === voice.id ? 'Loading...' : playingVoice === voice.id ? 'Stop' : 'Preview'}
              </button>
            </div>
          ))}
        </div>

        {getCurrentVoices().length === 0 && (
          <div className="text-center py-12">
            <Mic2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No voices available</h3>
            <p className="text-gray-500">Try refreshing to load voices from our servers.</p>
          </div>
        )}
      </div>

      {/* Integration Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          💡 Ready to use these voices in your flows?
        </h3>
        <p className="text-gray-700 mb-4">
          Once you've found the perfect voice, you can apply it directly in your Call Flows using the FlowDesigner.
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Clock className="w-4 h-4" />
          <span>Changes take effect immediately in your active flows</span>
        </div>
      </div>
    </div>
  );
};

export default VoicesSection;
