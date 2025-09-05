/**
 * Voice Service - Two-Tier Voice System Integration
 * Supports Azure TTS (Regular) and ElevenLabs TTS (Premium)
 */

class VoiceService {
  constructor() {
    this.ttsAdapterUrl = import.meta.env.VITE_TTS_ADAPTER_URL;
    this.streamingTtsUrl = import.meta.env.VITE_STREAMING_TTS_ADAPTER_URL;
    this.voiceCache = new Map();
    this.isLoading = false;
    
    // Voice tier configuration
    this.voiceTiers = {
      regular: 'azure',
      premium: 'elevenlabs'
    };
    
    // Initialize voice lists
    this.regularVoices = [];
    this.premiumVoices = [];
    this.loadedVoices = false;
  }

  // =============================================================================
  // 🎯 VOICE LOADING & MANAGEMENT
  // =============================================================================

  /**
   * Load all available voices from both Azure and ElevenLabs
   */
  async loadAllVoices() {
    if (this.isLoading || this.loadedVoices) {
      return {
        regular: this.regularVoices,
        premium: this.premiumVoices
      };
    }

    this.isLoading = true;

    try {
      console.log('🎤 Loading voices from TTS adapters...');
      
      // Load voices in parallel
      const [regularVoices, premiumVoices] = await Promise.allSettled([
        this.loadAzureVoices(),
        this.loadElevenLabsVoices()
      ]);

      // Process regular voices (Azure)
      if (regularVoices.status === 'fulfilled') {
        this.regularVoices = regularVoices.value;
        console.log(`✅ Loaded ${this.regularVoices.length} Azure regular voices`);
      } else {
        console.warn('⚠️ Failed to load Azure voices:', regularVoices.reason);
        this.regularVoices = this.getFallbackRegularVoices();
      }

      // Process premium voices (ElevenLabs)
      if (premiumVoices.status === 'fulfilled') {
        this.premiumVoices = premiumVoices.value;
        console.log(`✅ Loaded ${this.premiumVoices.length} ElevenLabs premium voices`);
      } else {
        console.warn('⚠️ Failed to load ElevenLabs voices:', premiumVoices.reason);
        this.premiumVoices = this.getFallbackPremiumVoices();
      }

      this.loadedVoices = true;
      
      return {
        regular: this.regularVoices,
        premium: this.premiumVoices
      };

    } catch (error) {
      console.error('❌ Error loading voices:', error);
      
      // Return fallback voices
      this.regularVoices = this.getFallbackRegularVoices();
      this.premiumVoices = this.getFallbackPremiumVoices();
      
      return {
        regular: this.regularVoices,
        premium: this.premiumVoices
      };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load Azure TTS voices through your TTS adapter
   */
  async loadAzureVoices() {
    if (!this.ttsAdapterUrl) {
      throw new Error('TTS Adapter URL not configured');
    }

    // First get tier configuration to understand provider
    const tierResponse = await fetch(`${this.ttsAdapterUrl}/tiers`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      timeout: 10000
    });

    if (!tierResponse.ok) {
      throw new Error(`Tier configuration fetch failed: ${tierResponse.status}`);
    }

    const tierData = await tierResponse.json();
    const regularTier = tierData.tiers?.regular;
    
    if (!regularTier) {
      throw new Error('Regular tier configuration not found');
    }

    const provider = regularTier.tts_provider || 'azure';

    // Get voices for the regular tier provider
    const response = await fetch(`${this.ttsAdapterUrl}/voices/${provider}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Azure voices request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform voice data to standardized format
    return data.voices?.map(voice => ({
      id: voice.id || voice.ShortName || voice.Name,
      name: voice.name || voice.DisplayName || voice.FriendlyName || voice.Name,
      language: voice.language || voice.Locale || voice.Language || 'en-US',
      gender: voice.gender?.toLowerCase() || voice.Gender?.toLowerCase() || 'neutral',
      style: voice.style || voice.StyleList || [],
      tier: 'regular',
      provider: provider,
      neural: voice.neural || voice.VoiceType === 'Neural',
      sampleRate: voice.sampleRate || voice.SampleRateHertz || 24000,
      emotions: voice.emotions || voice.StyleList || [],
      description: voice.description || `${voice.name || voice.DisplayName} - ${provider} Voice`,
      preview: voice.preview || voice.PreviewUrl || null
    })) || [];
  }

  /**
   * Load ElevenLabs voices through your TTS adapter
   */
  async loadElevenLabsVoices() {
    if (!this.ttsAdapterUrl) {
      throw new Error('TTS Adapter URL not configured');
    }

    // First get tier configuration to understand provider
    const tierResponse = await fetch(`${this.ttsAdapterUrl}/tiers`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      timeout: 10000
    });

    if (!tierResponse.ok) {
      throw new Error(`Tier configuration fetch failed: ${tierResponse.status}`);
    }

    const tierData = await tierResponse.json();
    const premiumTier = tierData.tiers?.premium;
    
    if (!premiumTier) {
      throw new Error('Premium tier configuration not found');
    }

    const provider = premiumTier.tts_provider || 'elevenlabs';

    // Get voices for the premium tier provider
    const response = await fetch(`${this.ttsAdapterUrl}/voices/${provider}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs voices request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform voice data to standardized format
    return data.voices?.map(voice => ({
      id: voice.id || voice.voice_id,
      name: voice.name,
      language: voice.language || voice.language_code || 'en-US',
      gender: voice.gender?.toLowerCase() || voice.labels?.gender || 'neutral',
      style: voice.style || voice.labels?.style || [],
      tier: 'premium',
      provider: provider,
      category: voice.category || 'general',
      accent: voice.accent || voice.labels?.accent || '',
      age: voice.age || voice.labels?.age || '',
      emotions: voice.emotions || voice.labels?.emotions || [],
      description: voice.description || `${voice.name} - ${provider} Premium Voice`,
      preview: voice.preview || voice.preview_url || null,
      settings: voice.settings || {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      }
    })) || [];
  }

  // =============================================================================
  // 🎭 FALLBACK VOICES
  // =============================================================================

  getFallbackRegularVoices() {
    return [
      {
        id: 'en-US-AriaNeural',
        name: 'Aria (Natural)',
        language: 'en-US',
        gender: 'female',
        tier: 'regular',
        provider: 'azure',
        neural: true,
        description: 'Aria - Natural female voice'
      },
      {
        id: 'en-US-DavisNeural',
        name: 'Davis (Natural)',
        language: 'en-US',
        gender: 'male',
        tier: 'regular',
        provider: 'azure',
        neural: true,
        description: 'Davis - Natural male voice'
      },
      {
        id: 'en-US-JennyNeural',
        name: 'Jenny (Friendly)',
        language: 'en-US',
        gender: 'female',
        tier: 'regular',
        provider: 'azure',
        neural: true,
        description: 'Jenny - Friendly female voice'
      },
      {
        id: 'en-US-GuyNeural',
        name: 'Guy (Professional)',
        language: 'en-US',
        gender: 'male',
        tier: 'regular',
        provider: 'azure',
        neural: true,
        description: 'Guy - Professional male voice'
      }
    ];
  }

  getFallbackPremiumVoices() {
    return [
      {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella (Premium)',
        language: 'en-US',
        gender: 'female',
        tier: 'premium',
        provider: 'elevenlabs',
        category: 'conversational',
        description: 'Bella - Premium conversational voice'
      },
      {
        id: 'VR6AewLTigWG4xSOukaG',
        name: 'Adam (Premium)',
        language: 'en-US',
        gender: 'male',
        tier: 'premium',
        provider: 'elevenlabs',
        category: 'narrative',
        description: 'Adam - Premium narrative voice'
      },
      {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Antoni (Premium)',
        language: 'en-US',
        gender: 'male',
        tier: 'premium',
        provider: 'elevenlabs',
        category: 'professional',
        description: 'Antoni - Premium professional voice'
      }
    ];
  }

  // =============================================================================
  // 🎯 VOICE TESTING & PREVIEW
  // =============================================================================

  /**
   * Test a voice by generating a sample audio
   */
  async testVoice(voiceId, text = "Hello! This is a voice test for your conversation flow.", options = {}) {
    try {
      const voice = this.findVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Voice not found: ${voiceId}`);
      }

      console.log(`🎤 Testing voice: ${voice.name} (${voice.provider})`);

      const testOptions = {
        text: text,
        voice_id: voiceId,
        provider: voice.provider,
        speed: options.speed || 1.0,
        pitch: options.pitch || 0,
        volume: options.volume || 100,
        customer_id: 'voice_preview',
        call_id: 'preview_' + Date.now(),
        ...(voice.provider === 'azure' ? { language: voice.language || 'en-US' } : {}),
        ...options
      };

      // Use the synthesize endpoint
      const response = await fetch(`${this.ttsAdapterUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(testOptions)
      });

      if (!response.ok) {
        throw new Error(`Voice test failed: ${response.status}`);
      }

      // Return audio blob for playback
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        success: true,
        audioUrl,
        voice,
        duration: options.estimatedDuration || 3000
      };

    } catch (error) {
      console.error('❌ Voice test failed:', error);
      return {
        success: false,
        error: error.message,
        voice: this.findVoiceById(voiceId)
      };
    }
  }

  /**
   * Send test call with selected voice
   */
  async sendTestCall(phoneNumber, voiceId, testScript, options = {}) {
    try {
      const voice = this.findVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Voice not found: ${voiceId}`);
      }

      console.log(`📞 Sending test call to ${phoneNumber} with voice: ${voice.name}`);

      // Use telephony adapter endpoint
      const telephonyUrl = import.meta.env.VITE_TELEPHONY_ADAPTER_URL;
      if (!telephonyUrl) {
        throw new Error('Telephony adapter URL not configured');
      }

      const callPayload = {
        to: phoneNumber,
        from: import.meta.env.VITE_TWILIO_PHONE_NUMBER || "+1234567890",
        message: testScript || "Hello! This is a test call from Vocelio. How are you doing today?",
        voice_settings: {
          provider: voice.provider,
          voice_id: voiceId
        },
        metadata: {
          test_call: true,
          voice_tier: voice.tier,
          initiated_from: 'voice_selector'
        }
      };

      const response = await fetch(`${telephonyUrl}/api/calls/make`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        throw new Error(`Test call failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        callId: result.call_sid || result.call_id,
        voice,
        phoneNumber,
        message: `Test call initiated successfully with ${voice.name}`
      };

    } catch (error) {
      console.error('❌ Test call failed:', error);
      return {
        success: false,
        error: error.message,
        voice: this.findVoiceById(voiceId)
      };
    }
  }

  // =============================================================================
  // 🔧 UTILITY METHODS
  // =============================================================================

  /**
   * Find voice by ID
   */
  findVoiceById(voiceId) {
    return [...this.regularVoices, ...this.premiumVoices]
      .find(voice => voice.id === voiceId);
  }

  /**
   * Get voices by tier
   */
  getVoicesByTier(tier) {
    return tier === 'premium' ? this.premiumVoices : this.regularVoices;
  }

  /**
   * Get voices by language
   */
  getVoicesByLanguage(language) {
    return [...this.regularVoices, ...this.premiumVoices]
      .filter(voice => voice.language === language);
  }

  /**
   * Get voice statistics
   */
  getVoiceStats() {
    return {
      total: this.regularVoices.length + this.premiumVoices.length,
      regular: this.regularVoices.length,
      premium: this.premiumVoices.length,
      languages: [...new Set([...this.regularVoices, ...this.premiumVoices].map(v => v.language))],
      providers: ['azure', 'elevenlabs'],
      loaded: this.loadedVoices
    };
  }

  /**
   * Refresh voice cache
   */
  async refreshVoices() {
    this.loadedVoices = false;
    this.regularVoices = [];
    this.premiumVoices = [];
    return await this.loadAllVoices();
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
