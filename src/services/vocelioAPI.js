/**
 * Enhanced API Service with Multi-Tenant Support
 * All Vocelio API calls now include proper tenant context
 */
import { authManager } from './authManager.js';

class VocelioAPIService {
  constructor() {
    // Use environment-specific base URLs
    this.baseURLs = {
      telephony: process.env.REACT_APP_TELEPHONY_ADAPTER_URL || 'https://telephony-adapter-313373223340.us-central1.run.app',
      tts: process.env.REACT_APP_TTS_ADAPTER_URL || 'https://tts-adapter-313373223340.us-central1.run.app',
      asr: process.env.REACT_APP_ASR_ADAPTER_URL || 'https://asr-adapter-313373223340.us-central1.run.app',
      flows: process.env.REACT_APP_FLOW_PROCESSOR_URL || 'https://flow-processor-313373223340.us-central1.run.app',
      realtime: process.env.REACT_APP_REALTIME_CONVERSATION_URL || 'https://realtime-conversation-313373223340.us-central1.run.app'
    };
  }

  /**
   * 🎯 UPDATED: Make authenticated API call with tenant context
   */
  async makeAPICall(service, endpoint, options = {}) {
    const baseURL = this.baseURLs[service];
    if (!baseURL) {
      throw new Error(`Unknown service: ${service}`);
    }

    const fullURL = `${baseURL}${endpoint}`;
    
    // Use enhanced auth manager with tenant context
    return await authManager.makeVocelioAPICall(fullURL, options);
  }

  // 🎯 VOICE SERVICES WITH TENANT CONTEXT
  async getVoices() {
    const response = await this.makeAPICall('tts', '/voices');
    return response.json();
  }

  async synthesizeAudio(text, voiceConfig) {
    const response = await this.makeAPICall('tts', '/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, voice_config: voiceConfig })
    });
    return response.json();
  }

  // 🎯 TELEPHONY SERVICES WITH TENANT CONTEXT
  async makeCall(phoneNumber, flowId) {
    const response = await this.makeAPICall('telephony', '/call/initiate', {
      method: 'POST',
      body: JSON.stringify({ 
        phone_number: phoneNumber, 
        flow_id: flowId,
        tenant_id: authManager.getTenantId() // Explicit tenant context
      })
    });
    return response.json();
  }

  async getCallHistory(limit = 50) {
    const response = await this.makeAPICall('telephony', `/calls?limit=${limit}`);
    return response.json();
  }

  async getCallDetails(callId) {
    const response = await this.makeAPICall('telephony', `/calls/${callId}`);
    return response.json();
  }

  // 🎯 FLOW SERVICES WITH TENANT CONTEXT
  async getFlows() {
    const response = await this.makeAPICall('flows', '/flows');
    return response.json();
  }

  async createFlow(flowData) {
    const response = await this.makeAPICall('flows', '/flows', {
      method: 'POST',
      body: JSON.stringify({
        ...flowData,
        tenant_id: authManager.getTenantId()
      })
    });
    return response.json();
  }

  async updateFlow(flowId, flowData) {
    const response = await this.makeAPICall('flows', `/flows/${flowId}`, {
      method: 'PUT',
      body: JSON.stringify(flowData)
    });
    return response.json();
  }

  async deleteFlow(flowId) {
    const response = await this.makeAPICall('flows', `/flows/${flowId}`, {
      method: 'DELETE'
    });
    return response.ok;
  }

  // 🎯 REAL-TIME CONVERSATION SERVICES
  async startRealtimeConversation(callId) {
    const response = await this.makeAPICall('realtime', '/conversation/start', {
      method: 'POST',
      body: JSON.stringify({ 
        call_id: callId,
        tenant_id: authManager.getTenantId()
      })
    });
    return response.json();
  }

  async sendMessage(conversationId, message) {
    const response = await this.makeAPICall('realtime', `/conversation/${conversationId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return response.json();
  }

  // 🎯 ANALYTICS WITH TENANT CONTEXT
  async getAnalytics(dateRange) {
    const params = new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end,
      tenant_id: authManager.getTenantId()
    });
    
    const response = await this.makeAPICall('telephony', `/analytics?${params}`);
    return response.json();
  }

  // 🎯 TENANT-SPECIFIC CONFIGURATION
  async getTenantConfiguration() {
    const response = await this.makeAPICall('telephony', '/tenant/configuration');
    return response.json();
  }

  async updateTenantConfiguration(config) {
    const response = await this.makeAPICall('telephony', '/tenant/configuration', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    return response.json();
  }
}

export const vocelioAPI = new VocelioAPIService();
