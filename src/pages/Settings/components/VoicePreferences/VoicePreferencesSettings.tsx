import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Zap,
  Globe,
  DollarSign,
  BarChart3,
  Sliders,
  Speaker,
  Clock
} from 'lucide-react';
import { useSettings } from '../../../../contexts/SettingsContext';
import { VoicePreferences } from '../../../../types/settings';

interface VoiceTier {
  id: 'regular' | 'premium';
  name: string;
  description: string;
  price_per_minute: number;
  features: string[];
  sample_voices: Voice[];
}

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  language: string;
  tier: 'regular' | 'premium';
  preview_url?: string;
}

interface AIAgent {
  id: string;
  name: string;
  description: string;
  personality: string[];
  use_cases: string[];
}

// Mock data - would come from API
const voiceTiers: VoiceTier[] = [
  {
    id: 'regular',
    name: 'Regular Voices',
    description: 'High-quality synthetic voices perfect for most use cases',
    price_per_minute: 0.02,
    features: [
      'Natural sounding speech',
      'Multiple languages',
      'Fast processing',
      'Reliable quality'
    ],
    sample_voices: [
      { id: 'sarah-us', name: 'Sarah', gender: 'female', accent: 'US English', language: 'en-US', tier: 'regular' },
      { id: 'mike-us', name: 'Mike', gender: 'male', accent: 'US English', language: 'en-US', tier: 'regular' },
      { id: 'emma-uk', name: 'Emma', gender: 'female', accent: 'British English', language: 'en-GB', tier: 'regular' }
    ]
  },
  {
    id: 'premium',
    name: 'Premium Voices',
    description: 'Ultra-realistic AI voices with human-like intonation and emotion',
    price_per_minute: 0.08,
    features: [
      'Human-like emotion',
      'Advanced intonation',
      'Context awareness',
      'Premium quality',
      'Custom voice cloning'
    ],
    sample_voices: [
      { id: 'aria-pro', name: 'Aria Pro', gender: 'female', accent: 'US English', language: 'en-US', tier: 'premium' },
      { id: 'james-pro', name: 'James Pro', gender: 'male', accent: 'US English', language: 'en-US', tier: 'premium' },
      { id: 'sofia-pro', name: 'Sofia Pro', gender: 'female', accent: 'Spanish', language: 'es-ES', tier: 'premium' }
    ]
  }
];

const aiAgents: AIAgent[] = [
  {
    id: 'professional',
    name: 'Professional Assistant',
    description: 'Formal, courteous, and business-focused',
    personality: ['Polite', 'Efficient', 'Clear'],
    use_cases: ['Customer service', 'Appointment booking', 'Information delivery']
  },
  {
    id: 'friendly',
    name: 'Friendly Assistant',
    description: 'Warm, conversational, and approachable',
    personality: ['Warm', 'Empathetic', 'Conversational'],
    use_cases: ['Sales calls', 'Follow-ups', 'Relationship building']
  },
  {
    id: 'concise',
    name: 'Concise Assistant',
    description: 'Direct, brief, and to-the-point',
    personality: ['Direct', 'Efficient', 'Brief'],
    use_cases: ['Surveys', 'Reminders', 'Quick updates']
  }
];

const languages = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' }
];

export function VoicePreferencesSettings() {
  const { settings, updateVoicePreferences, previewVoice } = useSettings();
  const [selectedTier, setSelectedTier] = useState<'regular' | 'premium'>('regular');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('Hello! This is a sample of how I sound. I can help you with your customer calls and provide excellent service.');
  const [showCostCalculator, setShowCostCalculator] = useState(false);

  const form = useForm<VoicePreferences>({
    defaultValues: settings?.voicePreferences
  });

  useEffect(() => {
    if (settings?.voicePreferences) {
      form.reset(settings.voicePreferences);
      setSelectedTier(settings.voicePreferences.voice_tier);
      setSelectedVoice(settings.voicePreferences.preferred_voice);
    }
  }, [settings, form]);

  if (!settings) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleVoicePreview = async (voiceId: string) => {
    try {
      setPlayingVoice(voiceId);
      const audioUrl = await previewVoice(voiceId, previewText);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingVoice(null);
      await audio.play();
    } catch (error) {
      console.error('Failed to preview voice:', error);
      setPlayingVoice(null);
    }
  };

  const onSubmit = async (data: VoicePreferences) => {
    try {
      await updateVoicePreferences(data);
      // Show success message
    } catch (error) {
      console.error('Failed to update voice preferences:', error);
    }
  };

  const calculateMonthlyCost = () => {
    const tier = voiceTiers.find(t => t.id === selectedTier);
    if (!tier) return 0;
    
    // Assume 1000 minutes per month as example
    const estimatedMinutes = 1000;
    return estimatedMinutes * tier.price_per_minute;
  };

  const selectedTierData = voiceTiers.find(t => t.id === selectedTier);
  const availableVoices = selectedTierData?.sample_voices || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voice Preferences</h1>
        <p className="text-gray-600 mt-2">
          Configure AI voice settings, select voice tiers, and customize call behavior
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Voice Tier Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-blue-600" />
            Voice Tier Selection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {voiceTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedTier(tier.id);
                  form.setValue('voice_tier', tier.id);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${tier.price_per_minute.toFixed(3)}
                    </p>
                    <p className="text-sm text-gray-500">per minute</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{tier.description}</p>
                
                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {selectedTier === tier.id && (
                  <div className="absolute top-4 right-4">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cost Calculator */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Estimated Monthly Cost</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCostCalculator(!showCostCalculator)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showCostCalculator ? 'Hide' : 'Show'} Calculator
              </button>
            </div>
            
            {showCostCalculator && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Current Tier:</span>
                    <p className="font-medium">{selectedTierData?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate per minute:</span>
                    <p className="font-medium">${selectedTierData?.price_per_minute.toFixed(3)}</p>
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  ~${calculateMonthlyCost().toFixed(2)}/month
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    (estimated for 1,000 minutes)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Speaker className="h-6 w-6 mr-2 text-blue-600" />
            Voice Selection & Preview
          </h2>

          {/* Preview Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Text
            </label>
            <textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter text to preview how different voices sound..."
            />
          </div>

          {/* Available Voices */}
          <div className="space-y-4">
            {availableVoices.map((voice) => (
              <div
                key={voice.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedVoice === voice.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedVoice(voice.id);
                  form.setValue('preferred_voice', voice.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Mic className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                      <p className="text-sm text-gray-500">
                        {voice.gender} • {voice.accent} • {voice.language}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {voice.tier === 'premium' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Premium
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoicePreview(voice.id);
                      }}
                      disabled={playingVoice === voice.id}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {playingVoice === voice.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Playing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {selectedVoice === voice.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-700">
                      ✓ This voice is selected for your AI calls
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Language & AI Agent Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Language Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Language
                </label>
                <select
                  {...form.register('language')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Choose the language that matches your target audience for better call effectiveness.
                </p>
              </div>
            </div>
          </div>

          {/* AI Agent Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              AI Agent Type
            </h2>

            <div className="space-y-3">
              {aiAgents.map((agent) => (
                <label key={agent.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...form.register('agent_type')}
                    type="radio"
                    value={agent.id}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.personality.map((trait, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Call Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Sliders className="h-6 w-6 mr-2 text-blue-600" />
            Call Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Max Call Duration (minutes)
              </label>
              <input
                {...form.register('call_settings.max_duration', { 
                  valueAsNumber: true,
                  min: 1,
                  max: 60 
                })}
                type="number"
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Attempts
              </label>
              <input
                {...form.register('call_settings.retry_attempts', { 
                  valueAsNumber: true,
                  min: 0,
                  max: 10 
                })}
                type="number"
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Volume2 className="h-4 w-4 inline mr-1" />
                Voice Speed
              </label>
              <input
                {...form.register('call_settings.voice_speed', { valueAsNumber: true })}
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slow (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Fast (2x)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Pitch
              </label>
              <input
                {...form.register('call_settings.voice_pitch', { valueAsNumber: true })}
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Higher (2x)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Optimization */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Analytics & Optimization
          </h2>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...form.register('cost_optimization')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Cost Optimization</p>
                <p className="text-sm text-gray-600">
                  Automatically switch between voice tiers based on call importance and budget
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...form.register('usage_analytics')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Usage Analytics</p>
                <p className="text-sm text-gray-600">
                  Track voice usage patterns and receive optimization recommendations
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Settings className="h-5 w-5" />
            <span>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Voice Preferences'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
