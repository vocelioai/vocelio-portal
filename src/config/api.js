// Enhanced API configuration for wallet system and call transfer integration
const API_BASE_URL = 'https://auth-service-313373223340.us-central1.run.app';
const CALL_TRANSFER_API_URL = 'https://call-transfer-service-313373223340.us-central1.run.app';

// Enhanced API call function supporting multiple base URLs
export const apiCall = async (endpoint, options = {}, baseUrl = API_BASE_URL) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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

// Stripe payment API functions
export const stripeAPI = {
  // Create payment intent
  createPaymentIntent: (amount, currency = 'usd') =>
    apiCall('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount: amount * 100, currency }) // Convert to cents
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

export { API_BASE_URL };
