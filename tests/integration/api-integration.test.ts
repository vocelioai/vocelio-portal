// ===== COPILOT PROMPT #8: Integration Testing Suite =====

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { AuthService } from '../../src/services/authService';
import { PerformanceMonitor, ErrorTracker, AnalyticsTracker } from '../../src/services/monitoringService';

// Mock server for API responses
const server = setupServer(
  // Authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'test-user-1',
          name: 'Test User',
          email: 'test@vocelio.com',
          role: 'admin',
        },
      })
    );
  }),

  rest.post('/api/auth/refresh', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
      })
    );
  }),

  // Dashboard endpoints
  rest.get('/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.json({
        activeSessions: 42,
        totalCalls: 1337,
        avgResponseTime: 250,
        successRate: 98.5,
        channels: {
          voice: { active: 25, total: 500 },
          chat: { active: 12, total: 300 },
          email: { active: 5, total: 150 },
        },
      })
    );
  }),

  // Sessions endpoints
  rest.get('/api/sessions', (req, res, ctx) => {
    return res(
      ctx.json({
        sessions: [
          {
            id: 'session-1',
            channel: 'voice',
            customer: 'John Doe',
            agent: 'Agent Smith',
            status: 'active',
            duration: 180,
            startTime: '2024-01-15T10:00:00Z',
          },
          {
            id: 'session-2',
            channel: 'chat',
            customer: 'Jane Smith',
            agent: 'Agent Johnson',
            status: 'waiting',
            duration: 45,
            startTime: '2024-01-15T10:05:00Z',
          },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
      })
    );
  }),

  // Analytics endpoints
  rest.get('/api/analytics/overview', (req, res, ctx) => {
    return res(
      ctx.json({
        metrics: {
          totalInteractions: 1500,
          avgResolutionTime: 300,
          customerSatisfaction: 4.2,
          agentUtilization: 85,
        },
        trends: {
          daily: [120, 135, 150, 145, 160, 155, 170],
          weekly: [800, 850, 900, 920, 950, 980, 1000],
        },
      })
    );
  }),

  // Monitoring endpoints
  rest.post('/api/analytics/metrics', (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.post('/api/analytics/errors', (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.post('/api/analytics/track', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
);

describe('COPILOT PROMPT #8: Integration Tests', () => {
  beforeAll(() => {
    // Start mock server
    server.listen();
    
    // Mock DOM APIs
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Test Browser)',
      writable: true,
    });

    Object.defineProperty(window, 'performance', {
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => [{ duration: 100 }]),
        getEntriesByType: vi.fn(() => []),
      },
      writable: true,
    });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    vi.clearAllMocks();
    
    // Reset monitoring data
    ErrorTracker.clearErrors();
    
    // Reset server handlers
    server.resetHandlers();
  });

  describe('Authentication Service Integration', () => {
    it('should handle complete authentication flow', async () => {
      const authService = AuthService.getInstance();
      
      // Test login
      const loginSuccess = await authService.login('test@vocelio.com', 'password');
      expect(loginSuccess).toBe(true);
      expect(authService.isAuthenticated()).toBe(true);
      
      // Test user data
      const user = authService.getCurrentUser();
      expect(user.email).toBe('test@vocelio.com');
      expect(user.role).toBe('admin');
      
      // Test logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should handle token refresh', async () => {
      const authService = AuthService.getInstance();
      
      // Mock stored refresh token
      window.localStorage.getItem = vi.fn((key) => {
        if (key === 'vocelio_refresh_token') return 'mock-refresh-token';
        return null;
      });
      
      const refreshSuccess = await authService.refreshAuthToken();
      expect(refreshSuccess).toBe(true);
    });

    it('should handle authentication failure', async () => {
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
        })
      );

      const authService = AuthService.getInstance();
      const loginSuccess = await authService.login('invalid@email.com', 'wrongpassword');
      
      expect(loginSuccess).toBe(false);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      // Mock authenticated state
      window.localStorage.getItem = vi.fn((key) => {
        switch (key) {
          case 'vocelio_auth_token':
            return 'mock-jwt-token';
          case 'vocelio_user':
            return JSON.stringify({ id: 'test-user', email: 'test@vocelio.com' });
          default:
            return null;
        }
      });
    });

    it('should fetch dashboard statistics', async () => {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.activeSessions).toBe(42);
      expect(data.totalCalls).toBe(1337);
      expect(data.successRate).toBe(98.5);
    });

    it('should fetch session data', async () => {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.sessions).toHaveLength(2);
      expect(data.sessions[0].customer).toBe('John Doe');
      expect(data.sessions[1].customer).toBe('Jane Smith');
    });

    it('should fetch analytics data', async () => {
      const response = await fetch('/api/analytics/overview');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.metrics.totalInteractions).toBe(1500);
      expect(data.metrics.customerSatisfaction).toBe(4.2);
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        rest.get('/api/dashboard/stats', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const response = await fetch('/api/dashboard/stats');
      expect(response.status).toBe(500);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Internal server error');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics', () => {
      const timingId = PerformanceMonitor.startTiming('test-operation');
      
      // Simulate work
      const duration = PerformanceMonitor.endTiming(timingId);
      
      expect(duration).toBeGreaterThanOrEqual(0);
      
      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics['test-operation']).toBeDefined();
      expect(metrics['test-operation'].count).toBe(1);
    });

    it('should calculate metric statistics correctly', () => {
      // Add multiple measurements
      PerformanceMonitor.endTiming(PerformanceMonitor.startTiming('multi-test'));
      PerformanceMonitor.endTiming(PerformanceMonitor.startTiming('multi-test'));
      PerformanceMonitor.endTiming(PerformanceMonitor.startTiming('multi-test'));

      const metrics = PerformanceMonitor.getMetrics();
      const multiTest = metrics['multi-test'];
      
      expect(multiTest.count).toBe(3);
      expect(multiTest.avg).toBeGreaterThanOrEqual(0);
      expect(multiTest.min).toBeGreaterThanOrEqual(0);
      expect(multiTest.max).toBeGreaterThanOrEqual(multiTest.min);
    });
  });

  describe('Error Tracking Integration', () => {
    it('should track and store errors', () => {
      const testError = new Error('Test error message');
      const context = { component: 'TestComponent', action: 'testAction' };
      
      ErrorTracker.trackError(testError, context);
      
      const errors = ErrorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error message');
      expect(errors[0].context.component).toBe('TestComponent');
    });

    it('should send errors to monitoring endpoint', async () => {
      let capturedError: any = null;
      
      server.use(
        rest.post('/api/analytics/errors', async (req, res, ctx) => {
          capturedError = await req.json();
          return res(ctx.status(200));
        })
      );

      // Mock production environment
      vi.stubEnv('NODE_ENV', 'production');
      
      const testError = new Error('Production error');
      ErrorTracker.trackError(testError);
      
      // Wait for async request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(capturedError).toBeDefined();
      expect(capturedError.message).toBe('Production error');
    });
  });

  describe('Analytics Tracking Integration', () => {
    beforeEach(() => {
      // Mock DOM methods
      Object.defineProperty(document, 'title', {
        value: 'Test Page',
        writable: true,
      });

      Object.defineProperty(window.location, 'pathname', {
        value: '/test-path',
        writable: true,
      });
    });

    it('should track page views', () => {
      let capturedAnalytics: any = null;
      
      server.use(
        rest.post('/api/analytics/track', async (req, res, ctx) => {
          capturedAnalytics = await req.json();
          return res(ctx.status(200));
        })
      );

      AnalyticsTracker.trackPageView('/dashboard', 'Dashboard');
      
      expect(capturedAnalytics).toBeDefined();
      expect(capturedAnalytics.type).toBe('page_view');
      expect(capturedAnalytics.data.path).toBe('/dashboard');
      expect(capturedAnalytics.data.title).toBe('Dashboard');
    });

    it('should track custom events', () => {
      let capturedAnalytics: any = null;
      
      server.use(
        rest.post('/api/analytics/track', async (req, res, ctx) => {
          capturedAnalytics = await req.json();
          return res(ctx.status(200));
        })
      );

      AnalyticsTracker.trackEvent('button_click', {
        button: 'submit',
        form: 'contact',
      });
      
      expect(capturedAnalytics).toBeDefined();
      expect(capturedAnalytics.type).toBe('event');
      expect(capturedAnalytics.data.name).toBe('button_click');
      expect(capturedAnalytics.data.properties.button).toBe('submit');
    });

    it('should track conversions', () => {
      let capturedAnalytics: any = null;
      
      server.use(
        rest.post('/api/analytics/track', async (req, res, ctx) => {
          capturedAnalytics = await req.json();
          return res(ctx.status(200));
        })
      );

      AnalyticsTracker.trackConversion('signup', 100, { campaign: 'summer2024' });
      
      expect(capturedAnalytics).toBeDefined();
      expect(capturedAnalytics.data.name).toBe('conversion');
      expect(capturedAnalytics.data.properties.goal).toBe('signup');
      expect(capturedAnalytics.data.properties.value).toBe(100);
    });

    it('should generate session data', () => {
      AnalyticsTracker.trackPageView('/page1');
      AnalyticsTracker.trackPageView('/page2');
      
      const sessionData = AnalyticsTracker.getSessionData();
      
      expect(sessionData.sessionId).toBeDefined();
      expect(sessionData.pageViews).toHaveLength(2);
      expect(sessionData.duration).toBeGreaterThan(0);
    });
  });

  describe('Security Integration', () => {
    it('should validate JWT tokens correctly', () => {
      const authService = AuthService.getInstance();
      
      // Test with valid token structure (mock)
      const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.invalid';
      
      // Mock localStorage to return valid token
      window.localStorage.getItem = vi.fn(() => validToken);
      
      // Should be authenticated if token is valid
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should handle rate limiting', () => {
      const { RateLimitService } = require('../../src/services/authService');
      
      // Test rate limiting
      expect(RateLimitService.isAllowed('test-key', 2, 1000)).toBe(true);
      expect(RateLimitService.isAllowed('test-key', 2, 1000)).toBe(true);
      expect(RateLimitService.isAllowed('test-key', 2, 1000)).toBe(false); // Should be rate limited
    });
  });

  describe('Offline Functionality Integration', () => {
    it('should handle offline API requests', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Mock localStorage for pending requests
      const pendingRequests: any[] = [];
      window.localStorage.getItem = vi.fn(() => JSON.stringify(pendingRequests));
      window.localStorage.setItem = vi.fn((key, value) => {
        if (key === 'pending_analytics') {
          pendingRequests.push(...JSON.parse(value));
        }
      });

      // Try to track an event while offline
      AnalyticsTracker.trackEvent('offline_event', { test: true });

      // Should store in localStorage
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('should sync pending requests when coming online', () => {
      // Mock sendBeacon for batch sending
      Object.defineProperty(navigator, 'sendBeacon', {
        value: vi.fn(() => true),
        writable: true,
      });

      // Mock pending data in localStorage
      window.localStorage.getItem = vi.fn(() => 
        JSON.stringify([{ type: 'event', data: { name: 'pending_event' } }])
      );

      // Simulate beforeunload event
      window.dispatchEvent(new Event('beforeunload'));

      // Should send beacon with pending data
      expect(navigator.sendBeacon).toHaveBeenCalled();
    });
  });

  describe('Real-time Integration', () => {
    it('should handle WebSocket connection', () => {
      // Mock WebSocket
      const mockWebSocket = {
        addEventListener: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        readyState: WebSocket.OPEN,
      };

      global.WebSocket = vi.fn(() => mockWebSocket) as any;

      const { RealTimeMonitor } = require('../../src/services/monitoringService');
      RealTimeMonitor.init();

      // Should create WebSocket connection
      expect(global.WebSocket).toHaveBeenCalled();
    });

    it('should handle WebSocket reconnection', (done) => {
      let connectionAttempts = 0;
      global.WebSocket = vi.fn(() => {
        connectionAttempts++;
        return {
          addEventListener: vi.fn((event, handler) => {
            if (event === 'close') {
              // Simulate connection failure
              setTimeout(handler, 10);
            }
          }),
          send: vi.fn(),
          close: vi.fn(),
          readyState: WebSocket.CONNECTING,
        };
      }) as any;

      const { RealTimeMonitor } = require('../../src/services/monitoringService');
      RealTimeMonitor.init();

      // Should attempt reconnection
      setTimeout(() => {
        expect(connectionAttempts).toBeGreaterThan(1);
        done();
      }, 100);
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should complete authentication and data loading flow', async () => {
      const authService = AuthService.getInstance();
      
      // 1. Authenticate
      const loginSuccess = await authService.login('test@vocelio.com', 'password');
      expect(loginSuccess).toBe(true);

      // 2. Fetch dashboard data
      const dashboardResponse = await fetch('/api/dashboard/stats');
      const dashboardData = await dashboardResponse.json();
      expect(dashboardData.activeSessions).toBe(42);

      // 3. Fetch sessions
      const sessionsResponse = await fetch('/api/sessions');
      const sessionsData = await sessionsResponse.json();
      expect(sessionsData.sessions).toHaveLength(2);

      // 4. Track analytics
      AnalyticsTracker.trackEvent('workflow_complete', { success: true });

      // 5. Logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should handle error scenarios gracefully', async () => {
      // Simulate server errors
      server.use(
        rest.get('/api/dashboard/stats', (req, res, ctx) => {
          return res(ctx.status(500));
        }),
        rest.get('/api/sessions', (req, res, ctx) => {
          return res(ctx.status(503));
        })
      );

      // Should handle errors without crashing
      const dashboardResponse = await fetch('/api/dashboard/stats');
      expect(dashboardResponse.status).toBe(500);

      const sessionsResponse = await fetch('/api/sessions');
      expect(sessionsResponse.status).toBe(503);

      // Error tracking should still work
      ErrorTracker.trackError(new Error('API unavailable'), { service: 'dashboard' });
      const errors = ErrorTracker.getErrors();
      expect(errors).toHaveLength(1);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete operations within performance budgets', async () => {
      const startTime = performance.now();

      // Simulate typical user workflow
      const authService = AuthService.getInstance();
      await authService.login('test@vocelio.com', 'password');
      
      const dashboardPromise = fetch('/api/dashboard/stats');
      const sessionsPromise = fetch('/api/sessions');
      const analyticsPromise = fetch('/api/analytics/overview');

      await Promise.all([dashboardPromise, sessionsPromise, analyticsPromise]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within 1 second
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, () => 
        fetch('/api/dashboard/stats')
      );

      const startTime = performance.now();
      await Promise.all(requests);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      
      // 10 concurrent requests should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
  });
});
