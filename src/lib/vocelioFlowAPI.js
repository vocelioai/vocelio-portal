// Enhanced Flow Designer API Integration
// This replaces the Railway API with your Cloud Run services for optimal performance

import FLOW_DESIGNER_CONFIG from '../config/flowDesignerConfig.js';

class VocelioFlowAPI {
  constructor() {
    // Use the new configuration system
    this.config = FLOW_DESIGNER_CONFIG;
    
    // Core service URLs - direct environment variable access
    this.baseURL = import.meta.env.VITE_FLOW_DESIGNER_URL;
    this.processorURL = import.meta.env.VITE_FLOW_PROCESSOR_URL;
    this.apiGateway = import.meta.env.VITE_API_GATEWAY_URL;
    
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  getAuthToken() {
    // Get auth token from localStorage or context
    return localStorage.getItem('vocelio_auth_token') || '';
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: this.headers,
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
        ...options
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Retry logic for failed requests
      const maxRetries = parseInt(import.meta.env.VITE_MAX_RETRIES) || 3;
      const retryDelay = parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000;
      
      if (options.retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.makeRequest(url, { ...options, retryCount: (options.retryCount || 0) + 1 });
      }
      
      throw error;
    }
  }

  // =============================================================================
  // FLOW MANAGEMENT - Core flow designer functionality
  // =============================================================================

  async saveFlow(flowData) {
    const payload = {
      flow: flowData,
      metadata: {
        savedAt: new Date().toISOString(),
        version: flowData.version || '1.0.0',
        userId: this.getCurrentUserId()
      }
    };

    return await this.makeRequest(`${this.baseURL}/api/flows`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async loadFlow(flowId) {
    return await this.makeRequest(`${this.baseURL}/api/flows/${flowId}`);
  }

  async updateFlow(flowId, flowData) {
    return await this.makeRequest(`${this.baseURL}/api/flows/${flowId}`, {
      method: 'PUT',
      body: JSON.stringify({
        flow: flowData,
        updatedAt: new Date().toISOString()
      })
    });
  }

  async deleteFlow(flowId) {
    return await this.makeRequest(`${this.baseURL}/api/flows/${flowId}`, {
      method: 'DELETE'
    });
  }

  async listFlows(userId = null) {
    const params = userId ? `?userId=${userId}` : '';
    return await this.makeRequest(`${this.baseURL}/api/flows${params}`);
  }

  // =============================================================================
  // FLOW EXECUTION - Live flow processing
  // =============================================================================

  async deployFlow(flowData, deploymentConfig = {}) {
    const payload = {
      flow: flowData,
      config: {
        environment: 'production',
        autoScale: true,
        timeout: 30000,
        ...deploymentConfig
      },
      metadata: {
        deployedAt: new Date().toISOString(),
        deployedBy: this.getCurrentUserId()
      }
    };

    return await this.makeRequest(`${this.processorURL}/api/deploy`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async executeFlow(flowId, input = {}, callContext = {}) {
    const payload = {
      flowId,
      input,
      context: {
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        ...callContext
      }
    };

    return await this.makeRequest(`${this.processorURL}/api/execute`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getFlowStatus(flowId) {
    return await this.makeRequest(`${this.processorURL}/api/flows/${flowId}/status`);
  }

  async stopFlowExecution(executionId) {
    return await this.makeRequest(`${this.processorURL}/api/executions/${executionId}/stop`, {
      method: 'POST'
    });
  }

  // =============================================================================
  // ORCHESTRATION - Advanced flow coordination
  // =============================================================================

  async orchestrateDialog(flowId, dialogState) {
    return await this.makeRequest(`${this.orchestratorURL}/api/dialog/orchestrate`, {
      method: 'POST',
      body: JSON.stringify({
        flowId,
        dialogState,
        timestamp: new Date().toISOString()
      })
    });
  }

  async getDialogState(sessionId) {
    return await this.makeRequest(`${this.orchestratorURL}/api/dialog/state/${sessionId}`);
  }

  async autonomousOptimization(flowId, optimizationRequest) {
    return await this.makeRequest(`${this.autonomousURL}/api/optimize`, {
      method: 'POST',
      body: JSON.stringify({
        flowId,
        optimization: optimizationRequest,
        timestamp: new Date().toISOString()
      })
    });
  }

  // =============================================================================
  // ANALYTICS & MONITORING
  // =============================================================================

  async getFlowAnalytics(flowId, timeRange = '24h') {
    const analyticsURL = import.meta.env.VITE_ANALYTICS_SERVICE_URL;
    return await this.makeRequest(`${analyticsURL}/api/flows/${flowId}/analytics?range=${timeRange}`);
  }

  async getExecutionLogs(executionId, options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 100,
      level: options.level || 'info',
      since: options.since || ''
    });

    const monitoringURL = import.meta.env.VITE_REAL_TIME_MONITORING_URL;
    return await this.makeRequest(`${monitoringURL}/api/executions/${executionId}/logs?${params}`);
  }

  async getSystemHealth() {
    return await this.makeRequest(`${this.apiGateway}/health`);
  }

  // =============================================================================
  // REAL-TIME UPDATES via WebSocket
  // =============================================================================

  connectWebSocket(onMessage, onError) {
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    if (!wsUrl) {
      console.warn('WebSocket URL not configured');
      return null;
    }

    const ws = new WebSocket(`${wsUrl}/flow-designer`);
    
    ws.onopen = () => {
      console.log('Flow Designer WebSocket connected');
      ws.send(JSON.stringify({
        type: 'subscribe',
        topic: 'flow-updates',
        userId: this.getCurrentUserId()
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError && onError(error);
    };

    ws.onclose = () => {
      console.log('Flow Designer WebSocket disconnected');
      // Auto-reconnect after delay
      setTimeout(() => this.connectWebSocket(onMessage, onError), 5000);
    };

    return ws;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  getCurrentUserId() {
    return localStorage.getItem('vocelio_user_id') || 'anonymous';
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // =============================================================================
  // CACHING for Performance
  // =============================================================================

  async getCachedFlow(flowId) {
    if (!import.meta.env.VITE_ENABLE_CACHE) {
      return this.loadFlow(flowId);
    }

    const cacheKey = `flow_${flowId}`;
    const cached = localStorage.getItem(cacheKey);
    const cacheTTL = parseInt(import.meta.env.VITE_CACHE_TTL) || 300000; // 5 minutes

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) {
        return data;
      }
    }

    // Fetch fresh data and cache it
    const flowData = await this.loadFlow(flowId);
    localStorage.setItem(cacheKey, JSON.stringify({
      data: flowData,
      timestamp: Date.now()
    }));

    return flowData;
  }

  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('flow_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// =============================================================================
// FALLBACK for Development Mode
// =============================================================================

const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.VITE_FLOW_DESIGNER_URL;

if (isDevelopment) {
  console.info('🔧 Flow API: Running in development mode with environment URLs');
}

// Create singleton instance
export const vocelioFlowAPI = new VocelioFlowAPI();

// Export for backwards compatibility
export { vocelioFlowAPI as railwayFlowAPI };

// Export class for custom instances
export default VocelioFlowAPI;
