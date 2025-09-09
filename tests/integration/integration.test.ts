// ===== COPILOT PROMPT #8: Integration Testing Suite =====

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { store } from '../src/store';
import { AuthService } from '../src/services/authService';
import { PerformanceMonitor, ErrorTracker, AnalyticsTracker } from '../src/services/monitoringService';
import App from '../src/App';

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

  // Campaign endpoints
  rest.get('/api/campaigns', (req, res, ctx) => {
    return res(
      ctx.json({
        campaigns: [
          {
            id: 'campaign-1',
            name: 'Welcome Campaign',
            status: 'active',
            type: 'drip',
            channels: ['email', 'sms'],
            stats: {
              sent: 1000,
              delivered: 980,
              opened: 650,
              clicked: 120,
            },
          },
        ],
        totalCount: 1,
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

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('COPILOT PROMPT #8: Integration Tests', () => {
  beforeAll(() => {
    // Start mock server
    server.listen();
    
    // Initialize monitoring services
    ErrorTracker.init();
    AnalyticsTracker.init();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset monitoring data
    ErrorTracker.clearErrors();
    
    // Reset server handlers
    server.resetHandlers();
  });

  describe('Authentication Integration', () => {
    it('should handle complete authentication flow', async () => {
      const authService = AuthService.getInstance();
      
      // Test login
      const loginSuccess = await authService.login('test@vocelio.com', 'password');
      expect(loginSuccess).toBe(true);
      expect(authService.isAuthenticated()).toBe(true);
      
      // Test token storage
      expect(localStorage.getItem('vocelio_auth_token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('vocelio_refresh_token')).toBe('mock-refresh-token');
      
      // Test user data
      const user = authService.getCurrentUser();
      expect(user.email).toBe('test@vocelio.com');
      expect(user.role).toBe('admin');
      
      // Test logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('vocelio_auth_token')).toBeNull();
    });

    it('should handle token refresh', async () => {
      const authService = AuthService.getInstance();
      
      // Set up expired token scenario
      localStorage.setItem('vocelio_refresh_token', 'mock-refresh-token');
      
      const refreshSuccess = await authService.refreshAuthToken();
      expect(refreshSuccess).toBe(true);
      expect(localStorage.getItem('vocelio_auth_token')).toBe('new-mock-jwt-token');
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

  describe('Dashboard Integration', () => {
    beforeEach(async () => {
      // Set up authenticated state
      const authService = AuthService.getInstance();
      await authService.login('test@vocelio.com', 'password');
    });

    it('should load and display dashboard data', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument(); // Active sessions
        expect(screen.getByText('1337')).toBeInTheDocument(); // Total calls
        expect(screen.getByText('98.5%')).toBeInTheDocument(); // Success rate
      });
    });

    it('should handle dashboard data loading errors', async () => {
      server.use(
        rest.get('/api/dashboard/stats', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Management Integration', () => {
    beforeEach(async () => {
      const authService = AuthService.getInstance();
      await authService.login('test@vocelio.com', 'password');
    });

    it('should load and display session list', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to sessions page
      const sessionsLink = screen.getByText('Sessions');
      fireEvent.click(sessionsLink);

      // Wait for sessions to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Agent Smith')).toBeInTheDocument();
      });
    });

    it('should handle session actions', async () => {
      server.use(
        rest.post('/api/sessions/:id/transfer', (req, res, ctx) => {
          return res(ctx.json({ success: true }));
        })
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to sessions and perform action
      fireEvent.click(screen.getByText('Sessions'));

      await waitFor(() => {
        const transferButton = screen.getByText('Transfer');
        fireEvent.click(transferButton);
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/transfer successful/i)).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(async () => {
      const authService = AuthService.getInstance();
      await authService.login('test@vocelio.com', 'password');
    });

    it('should load analytics data and display charts', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to analytics
      fireEvent.click(screen.getByText('Analytics'));

      await waitFor(() => {
        expect(screen.getByText('1500')).toBeInTheDocument(); // Total interactions
        expect(screen.getByText('4.2')).toBeInTheDocument(); // Customer satisfaction
        expect(screen.getByText('85%')).toBeInTheDocument(); // Agent utilization
      });
    });

    it('should track user interactions', () => {
      const trackEventSpy = vi.spyOn(AnalyticsTracker, 'trackEvent');
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Perform trackable action
      const button = screen.getByText('Dashboard');
      button.setAttribute('data-analytics', 'navigation-dashboard');
      fireEvent.click(button);

      expect(trackEventSpy).toHaveBeenCalledWith('click', expect.objectContaining({
        element: 'navigation-dashboard',
      }));
    });
  });

  describe('Campaign Management Integration', () => {
    beforeEach(async () => {
      const authService = AuthService.getInstance();
      await authService.login('test@vocelio.com', 'password');
    });

    it('should load and display campaigns', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to campaigns
      fireEvent.click(screen.getByText('Campaigns'));

      await waitFor(() => {
        expect(screen.getByText('Welcome Campaign')).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('1000')).toBeInTheDocument(); // Sent count
      });
    });

    it('should handle campaign creation', async () => {
      server.use(
        rest.post('/api/campaigns', (req, res, ctx) => {
          return res(ctx.json({
            id: 'new-campaign',
            name: 'New Campaign',
            status: 'draft',
          }));
        })
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to campaigns and create new one
      fireEvent.click(screen.getByText('Campaigns'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Campaign'));
      });

      // Fill in campaign details
      const nameInput = screen.getByPlaceholderText('Campaign name');
      fireEvent.change(nameInput, { target: { value: 'New Campaign' } });

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/campaign created/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics', () => {
      const timingId = PerformanceMonitor.startTiming('page-load');
      
      // Simulate some work
      setTimeout(() => {
        const duration = PerformanceMonitor.endTiming(timingId);
        expect(duration).toBeGreaterThan(0);
      }, 100);

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics).toHaveProperty('page-load');
    });

    it('should track and report errors', () => {
      const error = new Error('Test error');
      ErrorTracker.trackError(error, { component: 'test' });

      const errors = ErrorTracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
      expect(errors[0].context.component).toBe('test');
    });
  });

  describe('Offline Functionality', () => {
    it('should handle offline state', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show offline indicator
      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
      });
    });

    it('should queue API requests when offline', async () => {
      // Test offline request queueing
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const authService = AuthService.getInstance();
      
      // This should be queued when offline
      const loginPromise = authService.login('test@vocelio.com', 'password');
      
      // Simulate coming back online
      setTimeout(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      }, 100);

      const result = await loginPromise;
      expect(result).toBe(true);
    });
  });

  describe('Mobile PWA Integration', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should render mobile layout on small screens', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show mobile navigation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
      });
    });

    it('should handle touch gestures', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to sessions for mobile swipe test
      fireEvent.click(screen.getByText('Sessions'));

      await waitFor(() => {
        const sessionCard = screen.getByText('John Doe').closest('[data-testid="session-card"]');
        
        // Simulate swipe gesture
        fireEvent.touchStart(sessionCard, {
          touches: [{ clientX: 100, clientY: 0 }],
        });
        
        fireEvent.touchMove(sessionCard, {
          touches: [{ clientX: 50, clientY: 0 }],
        });
        
        fireEvent.touchEnd(sessionCard);
        
        // Should show swipe actions
        expect(screen.getByText('Transfer')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Features Integration', () => {
    it('should establish WebSocket connection', (done) => {
      // Mock WebSocket
      const mockWebSocket = {
        addEventListener: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        readyState: WebSocket.OPEN,
      };

      global.WebSocket = vi.fn(() => mockWebSocket);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should attempt to connect
      setTimeout(() => {
        expect(global.WebSocket).toHaveBeenCalledWith(
          expect.stringContaining('/ws')
        );
        done();
      }, 100);
    });

    it('should handle real-time updates', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate real-time session update
      const event = new CustomEvent('session-update', {
        detail: {
          sessionId: 'session-1',
          status: 'completed',
        },
      });

      window.dispatchEvent(event);

      // Should update session status in UI
      await waitFor(() => {
        expect(screen.getByText('completed')).toBeInTheDocument();
      });
    });
  });

  describe('End-to-End User Journey', () => {
    it('should complete full user workflow', async () => {
      const authService = AuthService.getInstance();
      
      // 1. Login
      await authService.login('test@vocelio.com', 'password');
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // 2. View Dashboard
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
      });

      // 3. Navigate to Sessions
      fireEvent.click(screen.getByText('Sessions'));
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // 4. View Analytics
      fireEvent.click(screen.getByText('Analytics'));
      
      await waitFor(() => {
        expect(screen.getByText('1500')).toBeInTheDocument();
      });

      // 5. Manage Campaigns
      fireEvent.click(screen.getByText('Campaigns'));
      
      await waitFor(() => {
        expect(screen.getByText('Welcome Campaign')).toBeInTheDocument();
      });

      // 6. Logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});

// Performance benchmarks
describe('Performance Benchmarks', () => {
  it('should load dashboard within performance budget', async () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const loadTime = performance.now() - startTime;
    
    // Dashboard should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  it('should handle large datasets efficiently', async () => {
    // Mock large dataset
    server.use(
      rest.get('/api/sessions', (req, res, ctx) => {
        const largeSessions = Array.from({ length: 1000 }, (_, i) => ({
          id: `session-${i}`,
          channel: 'voice',
          customer: `Customer ${i}`,
          agent: `Agent ${i % 10}`,
          status: 'active',
          duration: Math.floor(Math.random() * 300),
          startTime: new Date().toISOString(),
        }));

        return res(ctx.json({
          sessions: largeSessions,
          totalCount: 1000,
          page: 1,
          pageSize: 50,
        }));
      })
    );

    const startTime = performance.now();

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Sessions'));

    await waitFor(() => {
      expect(screen.getByText('Customer 0')).toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;
    
    // Should handle large datasets within 3 seconds
    expect(renderTime).toBeLessThan(3000);
  });
});
