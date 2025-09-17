// Enhanced API configuration for production microservices architecture
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://api-gateway-313373223340.us-central1.run.app';
const AUTH_SERVICE_URL = import.meta.env.REACT_APP_AUTH_SERVICE_URL || 'https://auth-service-313373223340.us-central1.run.app';
const CALL_TRANSFER_API_URL = import.meta.env.VITE_CALL_TRANSFER_URL || 'https://call-transfer-313373223340.us-central1.run.app';
const CRM_INTEGRATION_URL = import.meta.env.VITE_CRM_INTEGRATION_URL || 'https://crm-integration-313373223340.us-central1.run.app';
const BILLING_SERVICE_URL = import.meta.env.VITE_BILLING_SERVICE_URL || 'https://billing-service-313373223340.us-central1.run.app';
const ANALYTICS_SERVICE_URL = import.meta.env.VITE_ANALYTICS_SERVICE_URL || 'https://analytics-service-313373223340.us-central1.run.app';
const OMNICHANNEL_HUB_URL = import.meta.env.VITE_OMNICHANNEL_HUB_URL || 'https://omnichannel-hub-313373223340.us-central1.run.app';

// API Keys Configuration
export const API_KEYS = {
  STRIPE_PUBLISHABLE: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  OPENAI: import.meta.env.VITE_OPENAI_API_KEY,
  ANTHROPIC: import.meta.env.VITE_ANTHROPIC_API_KEY,
  ELEVENLABS: import.meta.env.VITE_ELEVENLABS_API_KEY,
  DEEPGRAM: import.meta.env.VITE_DEEPGRAM_API_KEY,
  AZURE_SPEECH: import.meta.env.VITE_AZURE_SPEECH_KEY,
  TWILIO_ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
  GCP_PROJECT_ID: import.meta.env.VITE_GCP_PROJECT_ID,
};

// Validate critical API keys
export const validateAPIKeys = () => {
  const missing = [];
  if (!API_KEYS.STRIPE_PUBLISHABLE) missing.push('VITE_STRIPE_PUBLISHABLE_KEY');
  if (!API_KEYS.TWILIO_ACCOUNT_SID) missing.push('VITE_TWILIO_ACCOUNT_SID');
  if (!API_KEYS.ELEVENLABS) missing.push('VITE_ELEVENLABS_API_KEY');
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing critical API keys:', missing);
    return false;
  }
  return true;
};

// Enhanced API call function supporting multiple microservices
export const apiCall = async (endpoint, options = {}, baseUrl = API_BASE_URL) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      // Add tenant isolation header if available
      ...(localStorage.getItem('tenant_id') && { 'X-Tenant-ID': localStorage.getItem('tenant_id') }),
      ...options.headers,
    },
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      // Retry the original request
      const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });
      if (!retryResponse.ok) {
        throw new Error(`API call failed: ${retryResponse.statusText}`);
      }
      return retryResponse.json();
    }
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Wallet API functions
export const walletAPI = {
  // Get current wallet balance
  getBalance: () => apiCall('/wallet/balance'),
  
  // Add funds via Stripe
  addFunds: (amount, currency = 'usd') => 
    apiCall('/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    }),
  
  // Get transaction history
  getTransactions: (limit = 50, offset = 0) => 
    apiCall(`/wallet/transactions?limit=${limit}&offset=${offset}`),
  
  // Get monthly usage stats
  getUsageStats: () => apiCall('/usage/monthly-stats'),
  
  // Get free minutes remaining
  getFreeMinutes: () => apiCall('/usage/free-minutes'),
};

// Stripe payment API functions with production keys
export const stripeAPI = {
  // Get Stripe publishable key
  getPublishableKey: () => API_KEYS.STRIPE_PUBLISHABLE,
  
  // Create payment intent
  createPaymentIntent: (amount, currency = 'usd') =>
    apiCall('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ 
        amount: amount * 100, // Convert to cents
        currency,
        payment_method_types: ['card']
      })
    }),
  
  // Confirm payment completion
  confirmPayment: (paymentIntentId) =>
    apiCall('/stripe/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId })
    }),
  
  // Get saved payment methods
  getPaymentMethods: () => apiCall('/stripe/payment-methods'),
};

// Call Transfer API functions
export const callTransferAPI = {
  // Department Management (NEW)
  getDepartments: () => callTransferApiCall('/api/departments'),
  createDepartment: (data) => callTransferApiCall('/api/departments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDepartment: (id, data) => callTransferApiCall(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDepartment: (id) => callTransferApiCall(`/api/departments/${id}`, {
    method: 'DELETE'
  }),

  // Call Management (NEW)
  getActiveCalls: () => callTransferApiCall('/api/calls/active'),
  transferCall: (callId, departmentId, options = {}) => callTransferApiCall('/api/calls/transfer', {
    method: 'POST',
    body: JSON.stringify({ 
      call_id: callId, 
      target_department: departmentId,
      transfer_type: options.type || 'warm',
      transfer_reason: options.reason || 'customer_request',
      urgency_level: options.urgency || 'medium',
      context_summary: options.context || 'Dashboard transfer request'
    })
  }),
  getCallLogs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const endpoint = queryString ? `/api/calls/logs?${queryString}` : '/api/calls/logs';
    return await callTransferApiCall(endpoint);
  },
  
  // Transfer History (EXISTING - adapted)
  getTransferHistory: (callId) => callTransferApiCall(`/api/call/${callId}/transfer-history`),
  
  // Real-time Events (NEW)
  getCallEventsUrl: (callId) => `${CALL_TRANSFER_API_URL}/api/calls/${callId}/events`,
  getActiveCallsEventsUrl: () => `${CALL_TRANSFER_API_URL}/api/calls/events`,
};

// Enhanced API call function for call transfer service
const callTransferApiCall = async (endpoint, options = {}, baseUrl = CALL_TRANSFER_API_URL) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log(`Making call transfer API request to: ${baseUrl}${endpoint}`);
  console.log('Options:', { ...defaultOptions, ...options });

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Call Transfer API failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        console.log('Error response body:', errorData);
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (parseError) {
        console.log('Could not parse error response');
      }

      if (response.status === 401) {
        console.log('Attempting token refresh...');
        await refreshToken();
        const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
          ...defaultOptions,
          ...options,
        });
        console.log(`Retry response status: ${retryResponse.status} ${retryResponse.statusText}`);
        
        if (!retryResponse.ok) {
          throw new Error(`Call Transfer API failed after retry: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        return retryResponse.json();
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('API call successful, result:', result);
    return result;
    
  } catch (error) {
    console.error('Call Transfer API call failed:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to ${baseUrl}. Please check if the call transfer service is running.`);
    }
    
    throw error;
  }
};

// Discount and tier API functions
export const discountAPI = {
  // Get available discount tiers
  getTiers: () => apiCall('/discounts/tiers'),
  
  // Get user's current discount
  getCurrentDiscount: () => apiCall('/discounts/current'),
};

// Refresh token function
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    window.location.href = '/login';
  }
};

// Campaign Management API functions
const campaignApiCall = async (endpoint, options = {}, baseUrl = CAMPAIGN_MANAGEMENT_API_URL) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log(`Making campaign API request to: ${baseUrl}${endpoint}`);
  console.log('Options:', { ...defaultOptions, ...options });

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken();
        // Retry the original request
        const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
          ...defaultOptions,
          ...options,
        });
        if (!retryResponse.ok) {
          throw new Error(`Campaign API call failed: ${retryResponse.statusText}`);
        }
        return retryResponse.json();
      }
      throw new Error(`Campaign API call failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Campaign API call error:', error);
    throw error;
  }
};

export const campaignAPI = {
  // Health check
  getHealth: () => campaignApiCall('/health'),
  
  // Campaign Management
  getCampaigns: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const endpoint = queryString ? `/api/campaigns?${queryString}` : '/api/campaigns';
    return await campaignApiCall(endpoint);
  },
  
  createCampaign: (campaignData) => campaignApiCall('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignData)
  }),
  
  getCampaign: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}`),
  
  updateCampaign: (campaignId, campaignData) => campaignApiCall(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(campaignData)
  }),
  
  deleteCampaign: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}`, {
    method: 'DELETE'
  }),
  
  // Campaign Control
  scheduleCampaign: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}/schedule`, {
    method: 'POST'
  }),
  
  startCampaign: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}/start`, {
    method: 'POST'
  }),
  
  pauseCampaign: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}/pause`, {
    method: 'POST'
  }),
  
  // Campaign Analytics
  getCampaignStats: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}/stats`),
  
  getCampaignContacts: async (campaignId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const endpoint = queryString ? `/api/campaigns/${campaignId}/contacts?${queryString}` : `/api/campaigns/${campaignId}/contacts`;
    return await campaignApiCall(endpoint);
  },
  
  // ML Optimization
  getMLOptimization: (campaignId) => campaignApiCall(`/api/campaigns/${campaignId}/ml-optimization`),
  
  optimizeVoice: (campaignId, customerProfile) => campaignApiCall(`/api/campaigns/${campaignId}/voice-optimization`, {
    method: 'POST',
    body: JSON.stringify(customerProfile)
  })
};

export { 
  API_BASE_URL, 
  AUTH_SERVICE_URL, 
  CALL_TRANSFER_API_URL, 
  CRM_INTEGRATION_URL, 
  BILLING_SERVICE_URL, 
  ANALYTICS_SERVICE_URL, 
  OMNICHANNEL_HUB_URL 
};
