import axios from 'axios';

/**
 * Omnichannel API Service for managing communication across multiple channels
 * Integrates with https://omnichannel-hub-313373223340.us-central1.run.app
 */
export class OmnichannelAPIService {
  constructor(apiKey = null) {
    this.baseURL = 'https://omnichannel-hub-313373223340.us-central1.run.app';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 Omnichannel API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Omnichannel API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ Omnichannel API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        
        // Handle specific error cases with fallback data
        if (error.response?.status === 404 || error.code === 'NETWORK_ERROR' || !error.response) {
          console.warn('⚠️ Omnichannel Hub not available - using fallback data');
          return { data: this.getFallbackData(error.config?.url) };
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Fallback data when API is not available
  getFallbackData(url) {
    if (url?.includes('/channels/integrations')) {
      return [
        { name: 'Voice Calls', type: 'voice', status: 'active', activeCount: 12 },
        { name: 'Video Calls', type: 'video', status: 'active', activeCount: 3 },
        { name: 'Live Chat', type: 'chat', status: 'active', activeCount: 8 },
        { name: 'Email Support', type: 'email', status: 'active', activeCount: 15 },
        { name: 'SMS Messages', type: 'sms', status: 'warning', activeCount: 2 },
        { name: 'Mobile App', type: 'mobile_app', status: 'active', activeCount: 7 },
        { name: 'Web Portal', type: 'web_portal', status: 'active', activeCount: 23 },
        { name: 'WhatsApp', type: 'whatsapp', status: 'inactive', activeCount: 0 }
      ];
    }
    
    if (url?.includes('/sessions/active')) {
      return [
        {
          session_id: 'demo_session_001',
          customer_id: 'customer_001',
          customer_name: 'John Smith',
          channel_type: 'voice',
          status: 'active',
          created_at: new Date().toISOString(),
          duration: '05:32'
        },
        {
          session_id: 'demo_session_002',
          customer_id: 'customer_002',
          customer_name: 'Sarah Johnson',
          channel_type: 'chat',
          status: 'active',
          created_at: new Date(Date.now() - 300000).toISOString(),
          duration: '12:18'
        }
      ];
    }
    
    if (url?.includes('/analytics/dashboard')) {
      return {
        totalSessions: '247',
        avgResponseTime: '1.8s',
        satisfaction: '4.9/5',
        resolutionRate: '96%'
      };
    }
    
    return {};
  }

  // Session Management Methods
  async createSession(sessionData) {
    try {
      const response = await this.api.post('/session/create', sessionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      const response = await this.api.get(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get session:', error);
      throw error;
    }
  }

  async getActiveSessions() {
    try {
      const response = await this.api.get('/sessions/active');
      console.log('📊 Active sessions response:', response.data);
      
      // Ensure we return an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.sessions)) {
        return data.sessions;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('Unexpected data format for sessions, using fallback');
        return this.getFallbackData('/sessions/active');
      }
    } catch (error) {
      console.warn('Failed to get active sessions, using fallback data');
      return this.getFallbackData('/sessions/active');
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const response = await this.api.put(`/session/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  // Channel Management Methods
  async getChannelIntegrations() {
    try {
      const response = await this.api.get('/channels/integrations');
      console.log('📊 Channel integrations response:', response.data);
      
      // Ensure we return an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.channels)) {
        return data.channels;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('Unexpected data format for channels, using fallback');
        return this.getFallbackData('/channels/integrations');
      }
    } catch (error) {
      console.warn('Failed to get channel integrations, using fallback data');
      return this.getFallbackData('/channels/integrations');
    }
  }

  async configureChannel(channelType, config) {
    try {
      const response = await this.api.post(`/channels/${channelType}/configure`, config);
      return response.data;
    } catch (error) {
      console.error('Failed to configure channel:', error);
      throw error;
    }
  }

  async getChannelStatus(channelType) {
    try {
      const response = await this.api.get(`/channels/${channelType}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get channel status:', error);
      throw error;
    }
  }

  // Analytics Methods
  async getDashboardAnalytics() {
    try {
      const response = await this.api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.warn('Failed to get analytics, using fallback data');
      return this.getFallbackData('/analytics/dashboard');
    }
  }

  async getChannelPerformance() {
    try {
      const response = await this.api.get('/analytics/channel-performance');
      return response.data;
    } catch (error) {
      console.error('Failed to get channel performance:', error);
      throw error;
    }
  }

  // System Operations
  async getSystemHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Failed to get system health:', error);
      return { status: 'unknown', message: 'Unable to connect to omnichannel hub' };
    }
  }

  // Channel Transfer
  async transferChannel(transferData) {
    try {
      const response = await this.api.post('/transfer/channel', transferData);
      return response.data;
    } catch (error) {
      console.error('Failed to transfer channel:', error);
      throw error;
    }
  }

  // Intelligent Routing
  async getRoutingRecommendation(context) {
    try {
      const response = await this.api.post('/intelligent-routing', context);
      return response.data;
    } catch (error) {
      console.error('Failed to get routing recommendation:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const omnichannelAPI = new OmnichannelAPIService(
  process.env.REACT_APP_OMNICHANNEL_API_KEY
);
