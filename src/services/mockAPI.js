// ===== Development Mock API Server =====
// Mock API endpoints for local development

import { getCurrentConfig } from '../config/environment.js';

const config = getCurrentConfig();

// Mock data
const mockDashboardStats = {
  activeSessions: 42,
  totalCalls: 1337,
  avgResponseTime: 250,
  successRate: 98.5,
  channels: {
    voice: { active: 25, total: 500 },
    chat: { active: 12, total: 300 },
    email: { active: 5, total: 150 },
    social: { active: 3, total: 100 }
  },
  agents: {
    online: 15,
    busy: 8,
    away: 3,
    total: 26
  },
  performance: {
    avgWaitTime: 45,
    firstCallResolution: 87.5,
    customerSatisfaction: 4.2
  }
};

const mockLiveCalls = [
  {
    id: 'call-001',
    customer: 'John Smith',
    agent: 'Sarah Johnson',
    channel: 'voice',
    status: 'active',
    duration: 180,
    startTime: new Date(Date.now() - 180000).toISOString(),
    priority: 'high'
  },
  {
    id: 'call-002',
    customer: 'Emily Davis',
    agent: 'Mike Wilson',
    channel: 'chat',
    status: 'waiting',
    duration: 0,
    startTime: new Date().toISOString(),
    priority: 'medium'
  },
  {
    id: 'call-003',
    customer: 'Robert Brown',
    agent: 'Lisa Anderson',
    channel: 'voice',
    status: 'on-hold',
    duration: 320,
    startTime: new Date(Date.now() - 320000).toISOString(),
    priority: 'low'
  }
];

const mockCampaigns = [
  {
    id: 'camp-001',
    name: 'Summer Promotion 2024',
    status: 'active',
    type: 'outbound',
    channels: ['voice', 'sms'],
    performance: {
      sent: 5000,
      delivered: 4850,
      answered: 1200,
      converted: 180,
      revenue: 45000
    },
    schedule: {
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'EST'
    }
  },
  {
    id: 'camp-002',
    name: 'Customer Feedback Survey',
    status: 'paused',
    type: 'automated',
    channels: ['email', 'sms'],
    performance: {
      sent: 2500,
      delivered: 2400,
      answered: 800,
      converted: 120,
      revenue: 0
    }
  }
];

const mockAnalytics = {
  overview: {
    totalInteractions: 15420,
    avgResolutionTime: 285,
    customerSatisfaction: 4.3,
    agentUtilization: 78.5,
    trends: {
      daily: [120, 135, 150, 145, 160, 155, 170],
      weekly: [800, 850, 900, 920, 950, 980, 1000],
      monthly: [3200, 3400, 3600, 3800]
    }
  },
  performance: {
    responseTime: [245, 250, 260, 255, 248, 252, 258],
    resolutionRate: [85, 87, 89, 86, 88, 90, 92],
    satisfaction: [4.1, 4.2, 4.3, 4.2, 4.4, 4.3, 4.5]
  }
};

// Mock API class
export class MockAPIServer {
  static isEnabled() {
    return config.USE_MOCK_DATA === true;
  }

  static async handleRequest(url, options = {}) {
    if (!this.isEnabled()) {
      return null; // Let real API handle it
    }

    // Add delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const pathname = new URL(url).pathname;
    const method = options.method || 'GET';

    console.log(`🔧 Mock API: ${method} ${pathname}`);

    // Route handlers
    switch (pathname) {
      case '/api/dashboard/stats':
      case '/api/gateway/dashboard/stats':
        return this.mockResponse(mockDashboardStats);

      case '/api/calls/live':
      case '/api/gateway/calls/live':
        return this.mockResponse(mockLiveCalls);

      case '/api/campaigns/active':
      case '/api/analytics/campaigns/performance':
        return this.mockResponse(mockCampaigns);

      case '/api/analytics/overview':
        return this.mockResponse(mockAnalytics.overview);

      case '/api/analytics/performance':
        return this.mockResponse(mockAnalytics.performance);

      case '/api/settings/account':
        return this.mockResponse({
          user: {
            id: 'user-001',
            name: 'Demo User',
            email: 'demo@vocelio.com',
            role: 'admin',
            preferences: {
              theme: 'light',
              notifications: true,
              autoRefresh: true
            }
          }
        });

      case '/api/health':
        return this.mockResponse({ status: 'healthy', timestamp: new Date().toISOString() });

      default:
        // Return mock data for unhandled routes
        return this.mockResponse({ 
          message: `Mock endpoint: ${pathname}`,
          data: [],
          success: true 
        });
    }
  }

  static mockResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      })
    };
  }

  // Mock WebSocket for development
  static createMockWebSocket() {
    if (!this.isEnabled()) {
      return null;
    }

    console.log('🔧 Mock WebSocket: Creating mock connection');

    // Create a mock WebSocket-like object
    const mockWS = {
      readyState: WebSocket.OPEN,
      send: (data) => {
        console.log('🔧 Mock WebSocket: Sent', data);
        
        // Echo back some mock responses
        setTimeout(() => {
          if (mockWS.onmessage) {
            mockWS.onmessage({
              data: JSON.stringify({
                type: 'status',
                payload: {
                  connected: true,
                  timestamp: new Date().toISOString()
                }
              })
            });
          }
        }, 100);
      },
      close: () => {
        mockWS.readyState = WebSocket.CLOSED;
        if (mockWS.onclose) {
          mockWS.onclose({ code: 1000, reason: 'Mock close' });
        }
      },
      addEventListener: (event, handler) => {
        if (event === 'open') mockWS.onopen = handler;
        if (event === 'message') mockWS.onmessage = handler;
        if (event === 'close') mockWS.onclose = handler;
        if (event === 'error') mockWS.onerror = handler;
      },
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };

    // Simulate connection open
    setTimeout(() => {
      if (mockWS.onopen) {
        mockWS.onopen({ type: 'open' });
      }
    }, 50);

    // Send periodic mock updates
    const interval = setInterval(() => {
      if (mockWS.readyState === WebSocket.OPEN && mockWS.onmessage) {
        mockWS.onmessage({
          data: JSON.stringify({
            type: 'update',
            payload: {
              activeSessions: Math.floor(Math.random() * 50) + 30,
              newCall: Math.random() > 0.8 ? {
                id: `call-${Date.now()}`,
                customer: 'New Customer',
                channel: ['voice', 'chat', 'email'][Math.floor(Math.random() * 3)]
              } : null
            }
          })
        });
      }
    }, 5000);

    mockWS.close = () => {
      clearInterval(interval);
      mockWS.readyState = WebSocket.CLOSED;
      if (mockWS.onclose) {
        mockWS.onclose({ code: 1000, reason: 'Mock close' });
      }
    };

    return mockWS;
  }
}

// Intercept fetch requests in development
if (typeof window !== 'undefined' && MockAPIServer.isEnabled()) {
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options) => {
    // Try mock API first
    const mockResponse = await MockAPIServer.handleRequest(url, options);
    if (mockResponse) {
      return mockResponse;
    }
    
    // Fall back to original fetch
    return originalFetch(url, options);
  };
  
  console.log('🔧 Mock API Server: Enabled for development');
}

// Mock WebSocket constructor
if (typeof window !== 'undefined' && MockAPIServer.isEnabled()) {
  const OriginalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    // Use mock for local URLs
    if (url.includes('localhost:3000') || url.includes('localhost:3001')) {
      console.log('🔧 Mock WebSocket: Intercepting', url);
      return MockAPIServer.createMockWebSocket();
    }
    
    // Use original for external URLs
    return new OriginalWebSocket(url, protocols);
  };
  
  // Copy static properties
  Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
  Object.assign(window.WebSocket, OriginalWebSocket);
}

export default MockAPIServer;
