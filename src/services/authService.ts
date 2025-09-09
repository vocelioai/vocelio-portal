// ===== COPILOT PROMPT #8: Authentication Service =====
// Vite-compatible authentication and route protection service

import React from 'react';
import { getCurrentConfig } from '../config/environment';

const config = getCurrentConfig();

// Authentication Service Class
export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  
  private constructor() {
    this.loadTokensFromStorage();
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('vocelio_auth_token');
      this.refreshToken = localStorage.getItem('vocelio_refresh_token');
      const userStr = localStorage.getItem('vocelio_user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }
  
  // Save tokens to localStorage
  private saveTokensToStorage(): void {
    if (typeof window !== 'undefined') {
      if (this.token) {
        localStorage.setItem('vocelio_auth_token', this.token);
      }
      if (this.refreshToken) {
        localStorage.setItem('vocelio_refresh_token', this.refreshToken);
      }
      if (this.user) {
        localStorage.setItem('vocelio_user', JSON.stringify(this.user));
      }
    }
  }
  
  // Clear tokens from storage
  private clearTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vocelio_auth_token');
      localStorage.removeItem('vocelio_refresh_token');
      localStorage.removeItem('vocelio_user');
    }
  }
  
  // Login with credentials
  public async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.OMNICHANNEL_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        this.saveTokensToStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }
  
  // Logout
  public logout(): void {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.clearTokensFromStorage();
  }
  
  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.token && this.isTokenValid(this.token);
  }
  
  // Get current user
  public getCurrentUser(): any {
    return this.user;
  }
  
  // Get auth token
  public getToken(): string | null {
    return this.token;
  }
  
  // Refresh auth token
  public async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${config.OMNICHANNEL_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        if (data.refreshToken) {
          this.refreshToken = data.refreshToken;
        }
        this.saveTokensToStorage();
        return true;
      }
      
      // Refresh failed, logout user
      this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }
  
  // Validate token
  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }
  
  // Get auth headers for API requests
  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }
}

// Route Protection Service
export class RouteProtectionService {
  private static protectedRoutes = [
    '/dashboard',
    '/dashboard/omnichannel',
    '/dashboard/sessions',
    '/dashboard/analytics',
    '/dashboard/campaigns',
  ];
  
  private static publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/about',
    '/contact',
  ];
  
  public static isProtectedRoute(pathname: string): boolean {
    return this.protectedRoutes.some(route => pathname.startsWith(route));
  }
  
  public static isPublicRoute(pathname: string): boolean {
    return this.publicRoutes.includes(pathname);
  }
  
  public static redirectToLogin(currentPath?: string): void {
    const loginUrl = '/auth/login';
    const redirectUrl = currentPath ? `${loginUrl}?redirect=${encodeURIComponent(currentPath)}` : loginUrl;
    
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  }
  
  public static redirectToDashboard(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  }
}

// API Interceptor Service
export class APIInterceptorService {
  private static authService = AuthService.getInstance();
  
  public static async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Add authentication headers
    const authHeaders = this.authService.getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };
    
    let response = await fetch(url, requestOptions);
    
    // Handle token refresh on 401
    if (response.status === 401 && this.authService.isAuthenticated()) {
      const refreshed = await this.authService.refreshAuthToken();
      
      if (refreshed) {
        // Retry request with new token
        const newAuthHeaders = this.authService.getAuthHeaders();
        response = await fetch(url, {
          ...requestOptions,
          headers: {
            ...newAuthHeaders,
            ...options.headers,
          },
        });
      } else {
        // Refresh failed, redirect to login
        RouteProtectionService.redirectToLogin(window.location.pathname);
      }
    }
    
    return response;
  }
}

// React Hook for Authentication
export function useAuth() {
  const authService = AuthService.getInstance();
  
  return {
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    login: (email: string, password: string) => authService.login(email, password),
    logout: () => authService.logout(),
    refreshToken: () => authService.refreshAuthToken(),
  };
}

// React Hook for Route Protection
export function useRouteProtection() {
  const authService = AuthService.getInstance();
  
  React.useEffect(() => {
    const checkAuth = () => {
      const currentPath = window.location.pathname;
      
      if (RouteProtectionService.isProtectedRoute(currentPath)) {
        if (!authService.isAuthenticated()) {
          RouteProtectionService.redirectToLogin(currentPath);
        }
      } else if (currentPath.startsWith('/auth/') && authService.isAuthenticated()) {
        RouteProtectionService.redirectToDashboard();
      }
    };
    
    checkAuth();
    
    // Check auth status on storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vocelio_auth_token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
}

// Security Headers Service
export class SecurityHeadersService {
  public static setupCSP(): void {
    if (typeof window !== 'undefined') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://omnichannel-hub-313373223340.us-central1.run.app wss://omnichannel-hub-313373223340.us-central1.run.app",
        "frame-src 'none'",
        "object-src 'none'"
      ].join('; ');
      
      document.head.appendChild(meta);
    }
  }
  
  public static preventClickjacking(): void {
    if (typeof window !== 'undefined') {
      // Prevent iframe embedding
      if (window.top !== window.self) {
        window.top!.location.href = window.self.location.href;
      }
    }
  }
}

// Rate Limiting Service
export class RateLimitService {
  private static requests = new Map<string, number[]>();
  
  public static isAllowed(
    key: string,
    limit: number = 100,
    windowMs: number = 15 * 60 * 1000
  ): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

// Initialize security measures
export function initializeSecurity(): void {
  SecurityHeadersService.setupCSP();
  SecurityHeadersService.preventClickjacking();
}

export default {
  AuthService,
  RouteProtectionService,
  APIInterceptorService,
  SecurityHeadersService,
  RateLimitService,
  useAuth,
  useRouteProtection,
  initializeSecurity,
};
