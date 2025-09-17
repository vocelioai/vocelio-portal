// AI Services API Configuration
// Integrates with production Voice AI microservices and external AI APIs

import { API_KEYS } from '../config/api.js';

// Voice AI Intelligence Service (Production)
export const voiceAIService = {
  baseURL: import.meta.env.VITE_AI_VOICE_INTELLIGENCE_URL || 'https://ai-voice-intelligence-313373223340.us-central1.run.app',
  
  // Analyze voice conversation quality
  analyzeVoiceQuality: async (callId, audioData) => {
    try {
      const response = await fetch(`${voiceAIService.baseURL}/api/analyze/quality`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        },
        body: JSON.stringify({
          callId,
          audioData,
          analysisType: 'quality'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Voice AI API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Voice AI Service Error:', error);
      throw error;
    }
  },

  // Generate voice intelligence insights
  generateVoiceInsights: async (conversationData) => {
    try {
      const response = await fetch(`${voiceAIService.baseURL}/api/insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        },
        body: JSON.stringify(conversationData)
      });
      
      if (!response.ok) {
        throw new Error(`Voice AI Insights error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Voice AI Insights Error:', error);
      throw error;
    }
  }
};

// TTS (Text-to-Speech) Adapter Service
export const ttsService = {
  baseURL: import.meta.env.VITE_TTS_ADAPTER_URL || 'https://tts-adapter-313373223340.us-central1.run.app',
  
  // Generate speech from text
  generateSpeech: async (text, voiceId, options = {}) => {
    try {
      const response = await fetch(`${ttsService.baseURL}/api/synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        },
        body: JSON.stringify({
          text,
          voiceId,
          options: {
            speed: options.speed || 1.0,
            pitch: options.pitch || 1.0,
            volume: options.volume || 1.0,
            format: options.format || 'mp3'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ TTS Service Error:', error);
      throw error;
    }
  },

  // Get available voices
  getAvailableVoices: async () => {
    try {
      const response = await fetch(`${ttsService.baseURL}/api/voices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`TTS Voices error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ TTS Voices Error:', error);
      throw error;
    }
  }
};

// ASR (Automatic Speech Recognition) Service
export const asrService = {
  baseURL: import.meta.env.VITE_ASR_ADAPTER_URL || 'https://asr-adapter-313373223340.us-central1.run.app',
  
  // Transcribe audio to text
  transcribeAudio: async (audioData, options = {}) => {
    try {
      const response = await fetch(`${asrService.baseURL}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        },
        body: JSON.stringify({
          audioData,
          language: options.language || 'en-US',
          model: options.model || 'latest',
          enableDiarization: options.enableDiarization || false
        })
      });
      
      if (!response.ok) {
        throw new Error(`ASR Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ ASR Service Error:', error);
      throw error;
    }
  }
};

// OpenAI API Service (for additional AI features)
export const openaiAPI = {
  baseURL: 'https://api.openai.com/v1',
  
  // Generate AI insights for analytics
  generateInsights: async (data) => {
    try {
      const response = await fetch(`${openaiAPI.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENAI}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a Vocilio AI analytics expert. Analyze the provided data and generate actionable insights.'
            },
            {
              role: 'user',
              content: `Analyze this campaign data and provide insights: ${JSON.stringify(data)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      throw error;
    }
  },

  // Generate campaign suggestions
  generateCampaignSuggestions: async (contactData, campaignType) => {
    try {
      const response = await fetch(`${openaiAPI.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENAI}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a Vocilio AI campaign optimization expert. Generate personalized campaign suggestions.'
            },
            {
              role: 'user',
              content: `Create campaign suggestions for ${campaignType} targeting: ${JSON.stringify(contactData)}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      
      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error('❌ Campaign Suggestions Error:', error);
      return 'Unable to generate suggestions at this time.';
    }
  }
};

// Anthropic Claude API Service
export const anthropicAPI = {
  baseURL: 'https://api.anthropic.com/v1',
  
  // Advanced conversation analysis
  analyzeConversation: async (conversationData) => {
    try {
      const response = await fetch(`${anthropicAPI.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEYS.ANTHROPIC,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 400,
          messages: [
            {
              role: 'user',
              content: `Analyze this conversation for sentiment, intent, and next best action: ${JSON.stringify(conversationData)}`
            }
          ]
        })
      });
      
      const result = await response.json();
      return result.content[0].text;
    } catch (error) {
      console.error('❌ Anthropic API Error:', error);
      throw error;
    }
  }
};

// ElevenLabs Voice API Service
export const elevenlabsAPI = {
  baseURL: 'https://api.elevenlabs.io/v1',
  
  // Get available voices
  getVoices: async () => {
    try {
      const response = await fetch(`${elevenlabsAPI.baseURL}/voices`, {
        headers: {
          'xi-api-key': API_KEYS.ELEVENLABS,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        preview_url: voice.preview_url,
        labels: voice.labels
      }));
    } catch (error) {
      console.error('❌ ElevenLabs Get Voices Error:', error);
      // Return fallback data
      return [
        {
          id: 'pNInz6obpgDQGcFmaJgB',
          name: 'Adam',
          category: 'premade',
          description: 'Deep, confident male voice',
          labels: { accent: 'american', description: 'middle aged', gender: 'male' }
        }
      ];
    }
  },

  // Generate speech
  generateSpeech: async (text, voiceId = 'pNInz6obpgDQGcFmaJgB') => {
    try {
      const response = await fetch(`${elevenlabsAPI.baseURL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEYS.ELEVENLABS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs TTS error: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('❌ ElevenLabs TTS Error:', error);
      throw error;
    }
  }
};

// Deepgram Speech Recognition API
export const deepgramAPI = {
  baseURL: 'https://api.deepgram.com/v1',
  
  // Transcribe audio
  transcribeAudio: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch(`${deepgramAPI.baseURL}/listen`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_KEYS.DEEPGRAM}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.results.channels[0].alternatives[0].transcript;
    } catch (error) {
      console.error('❌ Deepgram Transcription Error:', error);
      throw error;
    }
  }
};

// Azure Speech Services
export const azureSpeechAPI = {
  baseURL: `https://${API_KEYS.AZURE_SPEECH_REGION || 'eastus'}.tts.speech.microsoft.com`,
  
  // Generate speech using Azure
  generateSpeech: async (text, voice = 'en-US-JennyNeural') => {
    try {
      const tokenResponse = await fetch(`https://${API_KEYS.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEYS.AZURE_SPEECH,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const token = await tokenResponse.text();
      
      const ssml = `
        <speak version='1.0' xml:lang='en-US'>
          <voice xml:lang='en-US' xml:gender='Female' name='${voice}'>
            ${text}
          </voice>
        </speak>
      `;
      
      const response = await fetch(`${azureSpeechAPI.baseURL}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });
      
      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('❌ Azure Speech Error:', error);
      throw error;
    }
  }
};

// Initialize AI services
export const initializeAIServices = () => {
  console.log('🤖 Initializing AI Services...');
  
  const services = {
    openai: !!API_KEYS.OPENAI,
    anthropic: !!API_KEYS.ANTHROPIC,
    elevenlabs: !!API_KEYS.ELEVENLABS,
    deepgram: !!API_KEYS.DEEPGRAM,
    azure: !!API_KEYS.AZURE_SPEECH
  };
  
  console.log('✅ AI Services Status:', services);
  return services;
};

// Export all AI services
export default {
  openai: openaiAPI,
  anthropic: anthropicAPI,
  elevenlabs: elevenlabsAPI,
  deepgram: deepgramAPI,
  azure: azureSpeechAPI,
  initialize: initializeAIServices
};