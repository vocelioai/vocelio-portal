// Enhanced authentication utilities for wallet system
import { API_BASE_URL } from '../config/api.js';

// Simplified login function
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Store user info
      if (data.user) {
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Simplified registration - no tier selection needed
export const register = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        organization_name: formData.organization_name,
        subdomain: formData.subdomain
        // Note: No tier fields needed - backend assigns defaults
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Store user info
      if (data.user) {
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Enhanced logout function
export const logout = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Notify backend of logout
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Get current user info
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Verify token validity
export const verifyToken = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Password reset request
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset request failed');
    }
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Two-factor authentication setup
export const setup2FA = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/auth/setup-2fa`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || '2FA setup failed');
    }
  } catch (error) {
    console.error('2FA setup error:', error);
    throw error;
  }
};

// Verify 2FA code
export const verify2FA = async (code) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || '2FA verification failed');
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    throw error;
  }
};
