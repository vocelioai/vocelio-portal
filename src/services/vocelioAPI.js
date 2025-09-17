/**
 * Enhanced API Service with Multi-Tenant Support
 * All Vocelio API calls now include proper tenant context
 */
import { authManager } from './authManager.js';

class VocelioAPIService {
  constructor() {
    // Use production environment variables for microservices
    this.baseURLs = {
      telephony: import.meta.env.VITE_TELEPHONY_ADAPTER_URL || 'https://telephony-adapter-313373223340.us-central1.run.app',
      tts: import.meta.env.VITE_TTS_ADAPTER_URL || 'https://tts-adapter-313373223340.us-central1.run.app',
      asr: import.meta.env.VITE_ASR_ADAPTER_URL || 'https://asr-adapter-313373223340.us-central1.run.app',
      flows: import.meta.env.VITE_FLOW_PROCESSOR_URL || 'https://flow-processor-313373223340.us-central1.run.app',
      realtime: import.meta.env.VITE_REALTIME_CONVERSATION_URL || 'https://realtime-conversation-313373223340.us-central1.run.app',
      callTransfer: import.meta.env.VITE_CALL_TRANSFER_URL || 'https://call-transfer-313373223340.us-central1.run.app',
      callRecording: import.meta.env.VITE_CALL_RECORDING_URL || 'https://call-recording-313373223340.us-central1.run.app',
      voiceRouter: import.meta.env.VITE_VOICE_ROUTER_URL || 'https://voice-router-313373223340.us-central1.run.app',
      phoneNumber: import.meta.env.VITE_PHONE_NUMBER_SERVICE_URL || 'https://phone-number-service-313373223340.us-central1.run.app',
      webrtc: import.meta.env.VITE_WEBRTC_BRIDGE_URL || 'https://webrtc-bridge-313373223340.us-central1.run.app'
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

  // 🎯 CALL TRANSFER SERVICES
  async transferCall(callId, targetAgent, options = {}) {
    const response = await this.makeAPICall('callTransfer', '/transfer/initiate', {
      method: 'POST',
      body: JSON.stringify({ callId, targetAgent, options })
    });
    return response.json();
  }

  async getActiveCalls() {
    const response = await this.makeAPICall('callTransfer', '/calls/active');
    return response.json();
  }

  async getCallDetails(callId) {
    const response = await this.makeAPICall('callTransfer', `/calls/${callId}`);
    return response.json();
  }

  // 🎯 CALL RECORDING SERVICES
  async startRecording(callId, options = {}) {
    const response = await this.makeAPICall('callRecording', '/recording/start', {
      method: 'POST',
      body: JSON.stringify({ callId, options })
    });
    return response.json();
  }

  async stopRecording(recordingId) {
    const response = await this.makeAPICall('callRecording', `/recording/${recordingId}/stop`, {
      method: 'POST'
    });
    return response.json();
  }

  async getRecordings(options = {}) {
    const queryParams = new URLSearchParams(options);
    const response = await this.makeAPICall('callRecording', `/recordings?${queryParams}`);
    return response.json();
  }

  // 🎯 PHONE NUMBER SERVICES
  async getAvailablePhoneNumbers(areaCode, country = 'US') {
    const response = await this.makeAPICall('phoneNumber', `/numbers/available?areaCode=${areaCode}&country=${country}`);
    return response.json();
  }

  async purchasePhoneNumber(phoneNumber) {
    const response = await this.makeAPICall('phoneNumber', '/numbers/purchase', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    });
    return response.json();
  }

  async releasePhoneNumber(phoneNumber) {
    const response = await this.makeAPICall('phoneNumber', '/numbers/release', {
      method: 'DELETE',
      body: JSON.stringify({ phoneNumber })
    });
    return response.json();
  }

  // 🎯 WEBRTC BRIDGE SERVICES
  async createWebRTCSession(options = {}) {
    const response = await this.makeAPICall('webrtc', '/session/create', {
      method: 'POST',
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async joinWebRTCSession(sessionId, participantInfo) {
    const response = await this.makeAPICall('webrtc', `/session/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(participantInfo)
    });
    return response.json();
  }
}

export const vocelioAPI = new VocelioAPIService();
