import axios from 'axios';
import { getCurrentConfig } from '../config/environment.js';

// Get current environment configuration
const config = getCurrentConfig();

// Service URLs Configuration
const SERVICE_URLS = {
  // Core Services - Use environment config for development
  API_GATEWAY: config.API_GATEWAY_URL || import.meta.env.VITE_API_GATEWAY_URL || 'https://api-gateway-313373223340.us-central1.run.app',
  ADMIN_DASHBOARD: import.meta.env.VITE_ADMIN_DASHBOARD_URL || process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL,
  
  // AI Intelligence Services
  AI_VOICE_INTELLIGENCE: import.meta.env.VITE_AI_VOICE_INTELLIGENCE_URL || process.env.NEXT_PUBLIC_AI_VOICE_INTELLIGENCE_URL,
  DECISION_ENGINE: import.meta.env.VITE_DECISION_ENGINE_URL || process.env.NEXT_PUBLIC_DECISION_ENGINE_URL,
  SELF_LEARNING_ENGINE: import.meta.env.VITE_SELF_LEARNING_ENGINE_URL || process.env.NEXT_PUBLIC_SELF_LEARNING_ENGINE_URL,
  PREDICTIVE_INTELLIGENCE: import.meta.env.VITE_PREDICTIVE_INTELLIGENCE_URL || process.env.NEXT_PUBLIC_PREDICTIVE_INTELLIGENCE_URL,
  COGNITIVE_RESILIENCE_MANAGER: import.meta.env.VITE_COGNITIVE_RESILIENCE_MANAGER_URL || process.env.NEXT_PUBLIC_COGNITIVE_RESILIENCE_MANAGER_URL,
  
  // Telephony Services
  PHONE_NUMBER_SERVICE: import.meta.env.VITE_PHONE_NUMBER_SERVICE_URL || process.env.NEXT_PUBLIC_PHONE_NUMBER_SERVICE_URL,
  TELEPHONY_ADAPTER: import.meta.env.VITE_TELEPHONY_ADAPTER_URL || process.env.NEXT_PUBLIC_TELEPHONY_ADAPTER_URL,
  CALL_TRANSFER: import.meta.env.VITE_CALL_TRANSFER_URL || process.env.NEXT_PUBLIC_CALL_TRANSFER_URL,
  CALL_RECORDING: import.meta.env.VITE_CALL_RECORDING_URL || process.env.NEXT_PUBLIC_CALL_RECORDING_URL,
  VOICE_ROUTER: import.meta.env.VITE_VOICE_ROUTER_URL || process.env.NEXT_PUBLIC_VOICE_ROUTER_URL,
  WEBRTC_BRIDGE: import.meta.env.VITE_WEBRTC_BRIDGE_URL || process.env.NEXT_PUBLIC_WEBRTC_BRIDGE_URL,
  
  // Voice Processing
  TTS_ADAPTER: import.meta.env.VITE_TTS_ADAPTER_URL || process.env.NEXT_PUBLIC_TTS_ADAPTER_URL,
  STREAMING_TTS_ADAPTER: import.meta.env.VITE_STREAMING_TTS_ADAPTER_URL || process.env.NEXT_PUBLIC_STREAMING_TTS_ADAPTER_URL,
  ASR_ADAPTER: import.meta.env.VITE_ASR_ADAPTER_URL || process.env.NEXT_PUBLIC_ASR_ADAPTER_URL,
  VAD_SERVICE: import.meta.env.VITE_VAD_SERVICE_URL || process.env.NEXT_PUBLIC_VAD_SERVICE_URL,
  ULTRA_LOW_LATENCY: import.meta.env.VITE_ULTRA_LOW_LATENCY_URL || process.env.NEXT_PUBLIC_ULTRA_LOW_LATENCY_URL,
  
  // Workflow Services
  FLOW_DESIGNER: import.meta.env.VITE_FLOW_DESIGNER_URL || process.env.NEXT_PUBLIC_FLOW_DESIGNER_URL,
  FLOW_PROCESSOR: import.meta.env.VITE_FLOW_PROCESSOR_URL || process.env.NEXT_PUBLIC_FLOW_PROCESSOR_URL,
  DIALOG_ORCHESTRATOR: import.meta.env.VITE_DIALOG_ORCHESTRATOR_URL || process.env.NEXT_PUBLIC_DIALOG_ORCHESTRATOR_URL,
  AUTONOMOUS_ORCHESTRATOR: import.meta.env.VITE_AUTONOMOUS_ORCHESTRATOR_URL || process.env.NEXT_PUBLIC_AUTONOMOUS_ORCHESTRATOR_URL,
  
  // Analytics Services - Use environment config
  ADVANCED_ANALYTICS: config.ADVANCED_ANALYTICS_API_URL || import.meta.env.VITE_ADVANCED_ANALYTICS_URL || 'https://advanced-analytics-313373223340.us-central1.run.app',
  ANALYTICS_SERVICE: import.meta.env.VITE_ANALYTICS_SERVICE_URL || process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL,
  REAL_TIME_MONITORING: import.meta.env.VITE_REAL_TIME_MONITORING_URL || process.env.NEXT_PUBLIC_REAL_TIME_MONITORING_URL,
  
  // Integration Services
  TOOL_INTEGRATION: import.meta.env.VITE_TOOL_INTEGRATION_URL || process.env.NEXT_PUBLIC_TOOL_INTEGRATION_URL,
  CRM_INTEGRATION: import.meta.env.VITE_CRM_INTEGRATION_URL || process.env.NEXT_PUBLIC_CRM_INTEGRATION_URL,
  OMNICHANNEL_HUB: import.meta.env.VITE_OMNICHANNEL_HUB_URL || process.env.NEXT_PUBLIC_OMNICHANNEL_HUB_URL,
  INTELLIGENT_AUTOMATION_HUB: import.meta.env.VITE_INTELLIGENT_AUTOMATION_HUB_URL || process.env.NEXT_PUBLIC_INTELLIGENT_AUTOMATION_HUB_URL,
  
  // Media AI Services
  VIDEO_INTELLIGENCE: import.meta.env.VITE_VIDEO_INTELLIGENCE_URL || process.env.NEXT_PUBLIC_VIDEO_INTELLIGENCE_URL,
  VISUAL_AI: import.meta.env.VITE_VISUAL_AI_URL || process.env.NEXT_PUBLIC_VISUAL_AI_URL,
  AR_VR_INTEGRATION: import.meta.env.VITE_AR_VR_INTEGRATION_URL || process.env.NEXT_PUBLIC_AR_VR_INTEGRATION_URL,
  
  // Infrastructure Services
  PUBSUB_EVENT_STREAMING: import.meta.env.VITE_PUBSUB_EVENT_STREAMING_URL || process.env.NEXT_PUBLIC_PUBSUB_EVENT_STREAMING_URL,
  KAFKA_EVENT_STREAMING: import.meta.env.VITE_KAFKA_EVENT_STREAMING_URL || process.env.NEXT_PUBLIC_KAFKA_EVENT_STREAMING_URL,
  BILLING_SERVICE: import.meta.env.VITE_BILLING_SERVICE_URL || process.env.NEXT_PUBLIC_BILLING_SERVICE_URL,
  
  // Customer Services
  CUSTOMER_PREFERENCES: import.meta.env.VITE_CUSTOMER_PREFERENCES_URL || process.env.NEXT_PUBLIC_CUSTOMER_PREFERENCES_URL,
  
  // WebSocket
  WS_URL: import.meta.env.VITE_WS_URL || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
};

// Enhanced Axios Configuration with Circuit Breaker Pattern
class ApiService {
  constructor() {
    this.instances = new Map();
    this.retryConfig = {
      retries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      retryCondition: (error) => {
        return error.code === 'NETWORK_ERROR' || 
               (error.response && error.response.status >= 500);
      }
    };
    this.circuitBreakers = new Map();
    this.initializeInstances();
  }

  // Initialize Axios instances for each service
  initializeInstances() {
    Object.entries(SERVICE_URLS).forEach(([key, url]) => {
      if (url) {
        const instance = axios.create({
          baseURL: url,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client-Version': '2.0.0',
            'X-Service': key.toLowerCase()
          },
        });

        // Request interceptor with enhanced auth and monitoring
        instance.interceptors.request.use(
          (config) => {
            // Add auth token
            const token = localStorage.getItem('vocilio_auth_token') || 
                         sessionStorage.getItem('vocilio_session_token');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }

            // Add request ID for tracing
            config.headers['X-Request-ID'] = this.generateRequestId();
            
            // Add timestamp
            config.metadata = { startTime: new Date() };
            
            // Log request in development
            if (import.meta.env.DEV) {
              console.log(`🚀 API Request [${key}]:`, {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data
              });
            }

            return config;
          },
          (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
          }
        );

        // Response interceptor with enhanced error handling and monitoring
        instance.interceptors.response.use(
          (response) => {
            // Calculate response time
            const duration = new Date() - response.config.metadata.startTime;
            
            // Log successful response in development
            if (import.meta.env.DEV) {
              console.log(`✅ API Response [${key}] (${duration}ms):`, {
                status: response.status,
                data: response.data
              });
            }

            // Reset circuit breaker on successful response
            this.resetCircuitBreaker(key);
            
            return response;
          },
          async (error) => {
            const duration = error.config?.metadata ? 
              new Date() - error.config.metadata.startTime : 0;

            // Enhanced error logging
            console.error(`❌ API Error [${key}] (${duration}ms):`, {
              status: error.response?.status,
              message: error.message,
              url: error.config?.url,
              data: error.response?.data
            });

            // Handle different error types
            if (error.response?.status === 401) {
              this.handleAuthError();
            } else if (error.response?.status === 429) {
              // Rate limiting - implement exponential backoff
              return this.handleRateLimitError(error);
            } else if (error.response?.status >= 500) {
              // Server errors - trigger circuit breaker
              this.triggerCircuitBreaker(key, error);
            }

            // Retry logic for retryable errors
            if (this.shouldRetry(error)) {
              return this.retryRequest(error);
            }

            return Promise.reject(this.enhanceError(error));
          }
        );

        this.instances.set(key, instance);
      }
    });
  }

  // Generate unique request ID for tracing
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enhanced auth error handling
  handleAuthError() {
    localStorage.removeItem('vocilio_auth_token');
    sessionStorage.removeItem('vocilio_session_token');
    
    // Emit custom event for auth error
    window.dispatchEvent(new CustomEvent('vocilio:auth:expired'));
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // Rate limit error handling with exponential backoff
  async handleRateLimitError(error) {
    const retryAfter = error.response.headers['retry-after'] || 1;
    await this.delay(retryAfter * 1000);
    return axios.request(error.config);
  }

  // Circuit breaker implementation
  triggerCircuitBreaker(service, error) {
    const breaker = this.circuitBreakers.get(service) || { failures: 0, lastFailure: null };
    breaker.failures++;
    breaker.lastFailure = Date.now();
    this.circuitBreakers.set(service, breaker);
    
    // Circuit breaker threshold
    if (breaker.failures >= 5) {
      console.warn(`🔴 Circuit breaker OPEN for service: ${service}`);
    }
  }

  resetCircuitBreaker(service) {
    this.circuitBreakers.delete(service);
  }

  // Check if service is available (circuit breaker)
  isServiceAvailable(service) {
    const breaker = this.circuitBreakers.get(service);
    if (!breaker) return true;
    
    const timeSinceLastFailure = Date.now() - breaker.lastFailure;
    const cooldownPeriod = 60000; // 1 minute
    
    return breaker.failures < 5 || timeSinceLastFailure > cooldownPeriod;
  }

  // Enhanced error object
  enhanceError(error) {
    return {
      ...error,
      timestamp: new Date().toISOString(),
      userMessage: this.getUserFriendlyMessage(error),
      retryable: this.shouldRetry(error),
      serviceHealth: this.getServiceHealth()
    };
  }

  // User-friendly error messages
  getUserFriendlyMessage(error) {
    if (error.code === 'NETWORK_ERROR') {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status >= 500) {
      return 'Server is temporarily unavailable. Please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // Retry logic
  shouldRetry(error) {
    return this.retryConfig.retryCondition(error) && 
           (error.config.__retryCount || 0) < this.retryConfig.retries;
  }

  async retryRequest(error) {
    const config = error.config;
    config.__retryCount = config.__retryCount || 0;
    config.__retryCount++;

    const delay = this.retryConfig.exponentialBackoff 
      ? this.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1)
      : this.retryConfig.retryDelay;

    await this.delay(delay);
    return axios.request(config);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get service health status
  getServiceHealth() {
    const health = {};
    this.circuitBreakers.forEach((breaker, service) => {
      health[service] = {
        status: breaker.failures < 5 ? 'healthy' : 'degraded',
        failures: breaker.failures,
        lastFailure: breaker.lastFailure
      };
    });
    return health;
  }

  // Get service instance
  getService(serviceName) {
    const instance = this.instances.get(serviceName);
    if (!instance) {
      console.warn(`Service ${serviceName} not configured, using fallback`);
      return this.instances.get('API_GATEWAY') || axios.create({
        baseURL: 'http://localhost:3001/api',
        timeout: 15000
      });
    }
    if (!this.isServiceAvailable(serviceName)) {
      console.warn(`Service ${serviceName} is currently unavailable, using fallback`);
      return this.instances.get('API_GATEWAY') || axios.create({
        baseURL: 'http://localhost:3001/api',
        timeout: 15000
      });
    }
    return instance;
  }
}

// Initialize API service
const apiService = new ApiService();

// Export main API instance for backward compatibility
export const api = apiService.getService('API_GATEWAY');

// ENHANCED DASHBOARD API - World Class Implementation
const dashboardApi = {
  // Real-time dashboard statistics with predictive intelligence
  getStats: async () => {
    try {
      const mainStats = await api.get('/dashboard/stats');
      
      // Try to get AI insights but don't fail if service is unavailable
      let aiInsights = {};
      try {
        const insights = await apiService.getService('AI_VOICE_INTELLIGENCE').get('/insights/summary');
        aiInsights = insights.data || {};
      } catch (error) {
        console.warn('AI insights unavailable:', error.message);
      }

      return {
        data: {
          ...mainStats.data,
          aiInsights
        }
      };
    } catch (error) {
      console.error('Dashboard API error:', error);
      // Return mock data for development when API is not ready
      if (error.response?.status === 404) {
        return {
          data: {
            totalCalls: 0,
            activeCalls: 0,
            successRate: 0,
            avgDuration: 0,
            aiInsights: {}
          }
        };
      }
      throw error;
    }
  },

  // Live calls with real-time monitoring
  getLiveCalls: async () => {
    try {
      const mainCalls = await api.get('/calls/live');
      
      let analysis = {};
      try {
        const analysisData = await apiService.getService('REAL_TIME_MONITORING').get('/calls/analysis');
        analysis = analysisData.data || {};
      } catch (error) {
        console.warn('Real-time analysis unavailable:', error.message);
      }

      return {
        data: {
          calls: mainCalls.data || [],
          analysis
        }
      };
    } catch (error) {
      console.error('Live calls API error:', error);
      // Return mock data for development when API is not ready
      if (error.response?.status === 404) {
        return {
          data: {
            calls: [],
            analysis: {}
          }
        };
      }
      throw error;
    }
  },

  // Active campaigns with performance metrics
  getActiveCampaigns: async () => {
    try {
      const campaigns = await api.get('/campaigns/active');
      
      let performance = {};
      try {
        const perfData = await apiService.getService('ADVANCED_ANALYTICS').get('/campaigns/performance');
        performance = perfData.data || {};
      } catch (error) {
        console.warn('Campaign analytics unavailable:', error.message);
      }

      return {
        data: {
          campaigns: campaigns.data || [],
          performance
        }
      };
    } catch (error) {
      console.error('Campaigns API error:', error);
      // Return mock data for development when API is not ready
      if (error.response?.status === 404) {
        return {
          data: {
            campaigns: [],
            performance: {}
          }
        };
      }
      throw error;
    }
  },

  // Real-time system health monitoring
  getSystemHealth: () => {
    return Promise.resolve({
      data: {
        services: apiService.getServiceHealth(),
        timestamp: new Date().toISOString()
      }
    });
  }
};

// ADVANCED CAMPAIGNS API - AI-Powered Campaign Management
const campaignsApi = {
  // Get all campaigns with AI insights
  getAll: async (params = {}) => {
    try {
      const campaigns = await api.get('/campaigns', { params });
      
      let insights = {};
      try {
        const insightsData = await apiService.getService('AI_VOICE_INTELLIGENCE').get('/campaigns/insights', { params });
        insights = insightsData.data || {};
      } catch (error) {
        console.warn('Campaign insights unavailable:', error.message);
      }

      return {
        data: {
          campaigns: campaigns.data || [],
          insights
        }
      };
    } catch (error) {
      console.error('Campaigns getAll API error:', error);
      throw error;
    }
  },

  // Get campaign by ID
  getById: async (id) => {
    try {
      const campaign = await api.get(`/campaigns/${id}`);
      
      let analytics = {};
      try {
        const analyticsData = await apiService.getService('ADVANCED_ANALYTICS').get(`/campaigns/${id}/analytics`);
        analytics = analyticsData.data || {};
      } catch (error) {
        console.warn('Campaign analytics unavailable:', error.message);
      }

      return {
        data: {
          campaign: campaign.data || {},
          analytics
        }
      };
    } catch (error) {
      console.error('Campaigns getById API error:', error);
      throw error;
    }
  },

  // Create campaign
  create: async (data) => {
    return api.post('/campaigns', data);
  },

  // Update campaign
  update: async (id, data) => {
    return api.put(`/campaigns/${id}`, data);
  },

  // Delete campaign
  delete: async (id) => {
    return api.delete(`/campaigns/${id}`);
  },

  // Toggle campaign status
  toggleStatus: async (id, action) => {
    return api.patch(`/campaigns/${id}/${action}`);
  }
};

// INTELLIGENT CONTACTS API
const contactsApi = {
  // Get contact lists
  getLists: async () => {
    return api.get('/contacts/lists');
  },

  // Upload contacts
  upload: async (formData) => {
    return api.post('/contacts/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get contacts
  getContacts: async (listId, params = {}) => {
    return api.get(`/contacts/lists/${listId}/contacts`, { params });
  },

  // Add contact
  addContact: async (listId, data) => {
    return api.post(`/contacts/lists/${listId}/contacts`, data);
  },

  // Delete contact
  deleteContact: async (contactId) => {
    return api.delete(`/contacts/${contactId}`);
  }
};

// TELEPHONY API
const phoneApi = {
  // Get phone numbers
  getNumbers: async () => {
    return api.get('/phone/numbers');
  },

  // Purchase number
  purchase: async (criteria) => {
    return api.post('/phone/purchase', criteria);
  },

  // Release number
  release: async (numberId) => {
    return api.delete(`/phone/numbers/${numberId}`);
  }
};

// VOICE API
const voiceApi = {
  // Get available voices
  getVoices: async () => {
    return api.get('/voice/voices');
  },

  // Get voice settings
  getSettings: async () => {
    return api.get('/voice/settings');
  },

  // Update voice settings
  updateSettings: async (data) => {
    return api.put('/voice/settings', data);
  },

  // Test voice
  testVoice: async (voiceId, text, options = {}) => {
    return api.post('/voice/test', { voiceId, text, options });
  }
};

// CALL FLOWS API
const callFlowsApi = {
  // Get all flows
  getAll: async () => {
    return api.get('/flows');
  },

  // Get flow by ID
  getById: async (id) => {
    return api.get(`/flows/${id}`);
  },

  // Create flow
  create: async (data) => {
    return api.post('/flows', data);
  },

  // Update flow
  update: async (id, data) => {
    return api.put(`/flows/${id}`, data);
  },

  // Delete flow
  delete: async (id) => {
    return api.delete(`/flows/${id}`);
  }
};

// ANALYTICS API
const analyticsApi = {
  // Get metrics
  getMetrics: async (params = {}) => {
    return api.get('/analytics/metrics', { params });
  },

  // Get conversions
  getConversions: async (params = {}) => {
    return api.get('/analytics/conversions', { params });
  },

  // Get insights
  getInsights: async () => {
    return api.get('/analytics/insights');
  },

  // Export report
  exportReport: async (params = {}) => {
    return api.get('/analytics/export', { params, responseType: 'blob' });
  }
};

// BILLING API
const billingApi = {
  // Get usage
  getUsage: async (params = {}) => {
    return api.get('/billing/usage', { params });
  },

  // Get invoices
  getInvoices: async () => {
    return api.get('/billing/invoices');
  },

  // Get payment methods
  getPaymentMethods: () => {
    return api.get('/billing/payment-methods');
  },

  // Add payment method
  addPaymentMethod: (data) => {
    return api.post('/billing/payment-methods', data);
  },

  // Update settings
  updateSettings: async (data) => {
    return api.put('/billing/settings', data);
  }
};

// SETTINGS API
const settingsApi = {
  // Get account settings
  getAccount: async () => {
    return api.get('/settings/account');
  },

  // Update account
  updateAccount: (data) => {
    return api.put('/settings/account', data);
  },

  // Get team
  getTeam: async () => {
    return api.get('/settings/team');
  },

  // Invite team member
  inviteTeamMember: (data) => {
    return api.post('/settings/team/invite', data);
  },

  // Get compliance
  getCompliance: async () => {
    return api.get('/settings/compliance');
  },

  // Update compliance
  updateCompliance: (data) => {
    return api.put('/settings/compliance', data);
  },

  // Get API keys
  getApiKeys: async () => {
    return api.get('/settings/api-keys');
  },

  // Generate API key
  generateApiKey: (name) => {
    return api.post('/settings/api-keys', { name });
  },

  // Revoke API key
  revokeApiKey: (keyId) => {
    return api.delete(`/settings/api-keys/${keyId}`);
  }
};

// REAL-TIME API
const realtimeApi = {
  // WebSocket connection
  connect: () => {
    const wsUrl = SERVICE_URLS.WS_URL;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('🔗 WebSocket connected');
      const token = localStorage.getItem('vocilio_auth_token');
      if (token) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      }
    };

    return ws;
  }
};

// MEDIA AI API
const mediaAiApi = {
  // Video analysis
  analyzeVideo: (videoData) => {
    return api.post('/media/video/analyze', videoData);
  },

  // Visual processing
  processVisualData: (imageData) => {
    return api.post('/media/visual/process', imageData);
  }
};

// OMNICHANNEL API
const omnichannelApi = {
  // Get customer journey
  getCustomerJourney: (customerId) => {
    return api.get(`/omnichannel/customers/${customerId}/journey`);
  },

  // Get channels
  getChannels: () => {
    return api.get('/omnichannel/channels');
  },

  // Configure channel
  configureChannel: (channelType, config) => {
    return api.post(`/omnichannel/channels/${channelType}`, config);
  }
};

// Export all APIs
export { 
  SERVICE_URLS,
  apiService,
  dashboardApi, 
  campaignsApi, 
  contactsApi, 
  phoneApi, 
  voiceApi, 
  callFlowsApi, 
  analyticsApi, 
  billingApi, 
  settingsApi, 
  realtimeApi,
  mediaAiApi,
  omnichannelApi
};

// Export default
export default api;
