// Enhanced API configuration for wallet system integration
const API_BASE_URL = 'https://auth-service-313373223340.us-central1.run.app';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      // Retry the original request
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
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
