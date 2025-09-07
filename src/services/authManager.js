/**
 * Enhanced AuthManager with Multi-Tenant Support
 * Integrates with Vocelio Auth Service for enterprise-scale authentication
 */
class AuthManager {
  constructor() {
    this.baseURL = 'https://auth-service-313373223340.us-central1.run.app';
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.userInfo = this.getUserInfo();
  }

  /**
   * Make authenticated request with tenant context
   */
  async makeAuthenticatedRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication token
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // 🎯 CRITICAL: Add tenant ID for multi-tenant isolation
    const tenantId = this.getTenantId();
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    let response = await fetch(url, {
      ...options,
      headers
    });

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        response = await fetch(url, {
          ...options,
          headers
        });
      }
    }

    return response;
  }

  /**
   * 🎯 NEW: Get tenant ID for multi-tenant operations
   */
  getTenantId() {
    const userInfo = this.getUserInfo();
    return userInfo?.tenant_id || userInfo?.subdomain || userInfo?.organization_id;
  }

  /**
   * 🎯 NEW: Make Vocelio API calls with proper tenant context
   */
  async makeVocelioAPICall(endpoint, options = {}) {
    const tenantId = this.getTenantId();
    
    // Track performance for ultra-low latency monitoring
    const startTime = Date.now();
    
    try {
      const response = await this.makeAuthenticatedRequest(endpoint, {
        ...options,
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Request-Source': 'vocelio-dashboard',
          ...options.headers
        }
      });

      const duration = Date.now() - startTime;
      
      // Log slow requests for optimization
      if (duration > 500) {
        console.warn(`Slow API call to ${endpoint}: ${duration}ms`);
      }

      return response;
    } catch (error) {
      console.error(`API call failed to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced user registration with organization setup
   */
  async registerUser(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        organization_name: userData.organizationName,
        subdomain: userData.subdomain,
        subscription_tier: userData.tier || 'starter',
        voice_tier: userData.voiceTier || 'basic'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      this.storeUserSession(data);
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Enhanced login with 2FA support
   */
  async loginWith2FA(email, password, twoFactorCode = null) {
    const response = await fetch(`${this.baseURL}/auth/login-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        two_factor_code: twoFactorCode
      })
    });
    
    if (response.status === 202) {
      return { requires2FA: true, message: 'Two-factor code sent to your phone' };
    } else if (response.ok) {
      const data = await response.json();
      this.storeUserSession(data);
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Store user session with tenant context
   */
  storeUserSession(data) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user_info));
    
    // Update instance variables
    this.token = data.access_token;
    this.refreshToken = data.refresh_token;
    this.userInfo = data.user_info;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access_token;
        localStorage.setItem('access_token', data.access_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.logout();
    return false;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.token = null;
    this.refreshToken = null;
    this.userInfo = null;
    window.location.href = '/login';
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * 🎯 NEW: Get organization context for UI
   */
  getOrganizationContext() {
    const userInfo = this.getUserInfo();
    return {
      tenantId: this.getTenantId(),
      organizationName: userInfo?.organization_name,
      subscriptionTier: userInfo?.subscription_tier,
      voiceTier: userInfo?.voice_tier,
      subdomain: userInfo?.subdomain
    };
  }
}

// Export singleton instance
export const authManager = new AuthManager();
