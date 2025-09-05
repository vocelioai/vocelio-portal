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
    
    // Pricing configuration (fetched from backend)
    this.pricingTiers = {
      regular: { price_per_minute: 0.08, provider: 'azure' },
      premium: { price_per_minute: 0.35, provider: 'elevenlabs' }
    };
    
    // Initialize voice lists
    this.regularVoices = [];
    this.premiumVoices = [];
    this.loadedVoices = false;
    this.pricingLoaded = false;
  }

  // =============================================================================
  // 💰 PRICING & COST CALCULATION
  // =============================================================================

  /**
   * Load pricing information from TTS adapter
   */
  async loadPricingTiers() {
    if (this.pricingLoaded) {
      return this.pricingTiers;
    }

    try {
      console.log('💰 Loading pricing tiers...');
      
      const response = await fetch(`${this.ttsAdapterUrl}/tiers`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Pricing fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.tiers) {
        this.pricingTiers = {
          regular: {
            price_per_minute: data.tiers.regular?.price_per_minute || 0.08,
            provider: data.tiers.regular?.tts_provider || 'azure',
            quality: data.tiers.regular?.quality || 'standard',
            description: data.description?.regular || 'Azure TTS voices'
          },
          premium: {
            price_per_minute: data.tiers.premium?.price_per_minute || 0.35,
            provider: data.tiers.premium?.tts_provider || 'elevenlabs',
            quality: data.tiers.premium?.quality || 'premium',
            description: data.description?.premium || 'ElevenLabs TTS voices'
          }
        };
        this.pricingLoaded = true;
        console.log('✅ Pricing tiers loaded:', this.pricingTiers);
      }

      return this.pricingTiers;
    } catch (error) {
      console.error('❌ Failed to load pricing tiers:', error);
      // Return default pricing on error
      return this.pricingTiers;
    }
  }

  /**
   * Calculate call cost based on duration and voice tier
   * @param {number} durationSeconds - Call duration in seconds
   * @param {string} voiceTier - Voice tier (regular/premium)
   * @returns {number} Cost in dollars
   */
  calculateCallCost(durationSeconds, voiceTier = 'regular') {
    const durationMinutes = durationSeconds / 60;
    const rate = this.pricingTiers[voiceTier]?.price_per_minute || 0.08;
    return parseFloat((durationMinutes * rate).toFixed(4));
  }

  /**
   * Estimate call cost for given duration
   * @param {number} estimatedDurationSeconds - Estimated duration in seconds
   * @param {string} voiceTier - Voice tier (regular/premium)
   * @returns {Object} Cost estimation details
   */
  estimateCallCost(estimatedDurationSeconds, voiceTier = 'regular') {
    const cost = this.calculateCallCost(estimatedDurationSeconds, voiceTier);
    const rate = this.pricingTiers[voiceTier]?.price_per_minute || 0.08;
    
    return {
      estimated_cost: cost,
      duration_minutes: estimatedDurationSeconds / 60,
      rate_per_minute: rate,
      tier: voiceTier,
      provider: this.pricingTiers[voiceTier]?.provider || 'azure',
      cost_breakdown: {
        base_rate: `$${rate.toFixed(3)}/min`,
        duration: `${(estimatedDurationSeconds / 60).toFixed(2)} minutes`,
        total: `$${cost.toFixed(4)}`
      }
    };
  }

  /**
   * Get pricing information for a specific tier
   * @param {string} tier - Voice tier (regular/premium)
   * @returns {Object} Pricing details
   */
  getTierPricing(tier = 'regular') {
    return {
      ...this.pricingTiers[tier],
      tier: tier,
      cost_per_minute_formatted: `$${this.pricingTiers[tier]?.price_per_minute.toFixed(3)}/min`,
      cost_comparison: tier === 'premium' 
        ? `${((this.pricingTiers.premium.price_per_minute / this.pricingTiers.regular.price_per_minute) * 100).toFixed(0)}% more than regular`
        : 'Base pricing tier'
    };
  }

  /**
   * Validate if user should be warned about premium pricing
   * @param {string} voiceTier - Selected voice tier
   * @param {number} estimatedDuration - Estimated call duration in seconds
   * @returns {Object} Warning details
   */
  validatePricingWarning(voiceTier, estimatedDuration = 60) {
    if (voiceTier !== 'premium') {
      return { shouldWarn: false };
    }

    const regularCost = this.calculateCallCost(estimatedDuration, 'regular');
    const premiumCost = this.calculateCallCost(estimatedDuration, 'premium');
    const costDifference = premiumCost - regularCost;
    const percentageIncrease = ((premiumCost / regularCost) - 1) * 100;

    return {
      shouldWarn: true,
      warning_message: `Premium voices cost ${percentageIncrease.toFixed(0)}% more than regular voices`,
      cost_comparison: {
        regular: `$${regularCost.toFixed(4)}`,
        premium: `$${premiumCost.toFixed(4)}`,
        difference: `+$${costDifference.toFixed(4)}`
      },
      recommendation: costDifference > 0.10 
        ? 'Consider using regular voices for longer calls to reduce costs'
        : 'Cost difference is minimal for short calls'
    };
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
        premium: this.premiumVoices,
        pricing: this.pricingTiers
      };
    }

    this.isLoading = true;

    try {
      console.log('🎤 Loading voices from TTS adapters...');
      
      // Load pricing information first
      await this.loadPricingTiers();
      
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
      
      const result = {
        regular: this.regularVoices,
        premium: this.premiumVoices,
        pricing: this.pricingTiers,
        summary: {
          regular_count: this.regularVoices.length,
          premium_count: this.premiumVoices.length,
          regular_pricing: this.getTierPricing('regular'),
          premium_pricing: this.getTierPricing('premium')
        }
      };

      console.log('🎉 Voice loading complete:', result.summary);
      return result;

    } catch (error) {
      console.error('❌ Error loading voices:', error);
      
      // Return fallback voices with pricing
      this.regularVoices = this.getFallbackRegularVoices();
      this.premiumVoices = this.getFallbackPremiumVoices();
      
      return {
        regular: this.regularVoices,
        premium: this.premiumVoices,
        pricing: this.pricingTiers
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

      // Estimate call cost for typical test call (30 seconds)
      const estimatedDuration = options.estimatedDuration || 30;
      const costEstimation = this.estimateCallCost(estimatedDuration, voice.tier);
      const pricingWarning = this.validatePricingWarning(voice.tier, estimatedDuration);

      console.log(`📞 Sending test call to ${phoneNumber} with voice: ${voice.name}`);
      console.log(`💰 Estimated cost: ${costEstimation.cost_breakdown.total} (${voice.tier} tier)`);

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
          voice_id: voiceId,
          tier: voice.tier
        },
        pricing: {
          tier: voice.tier,
          estimated_cost: costEstimation.estimated_cost,
          rate_per_minute: costEstimation.rate_per_minute
        },
        metadata: {
          test_call: true,
          voice_tier: voice.tier,
          initiated_from: 'voice_selector',
          cost_estimation: costEstimation
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
        call_sid: result.call_sid,
        call_status: result.status,
        voice: voice,
        cost_estimation: costEstimation,
        pricing_warning: pricingWarning,
        message: `Test call initiated successfully${pricingWarning.shouldWarn ? ` (${pricingWarning.warning_message})` : ''}`
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
