// ============================================================================
// VOCILIO SERVICES - World-Class Service Architecture
// ============================================================================

// Import all services
import serviceRegistry from './registry';
import wsService from './websocket';
import cacheService from './cache';
import notificationService from './notifications';

// Import all API services
import {
  apiService,
  dashboardApi,
  campaignsApi,
  contactsApi,
  phoneApi,
  voiceApi,
  callFlowsApi,
  analyticsApi,
  billingApi,
  settingsApi,
  realtimeApi,
  mediaAiApi,
  omnichannelApi
} from './api';

// ============================================================================
// SERVICE EXPORTS - Organized by Category
// ============================================================================

// Core Infrastructure Services
export const coreServices = {
  registry: serviceRegistry,
  websocket: wsService,
  cache: cacheService,
  notifications: notificationService,
  api: apiService
};

// Business Logic APIs
export const businessApis = {
  dashboard: dashboardApi,
  campaigns: campaignsApi,
  contacts: contactsApi,
  analytics: analyticsApi,
  billing: billingApi,
  settings: settingsApi
};

// Communication & Media APIs  
export const communicationApis = {
  phone: phoneApi,
  voice: voiceApi,
  callFlows: callFlowsApi,
  realtime: realtimeApi,
  mediaAi: mediaAiApi,
  omnichannel: omnichannelApi
};

// ============================================================================
// SERVICE MANAGER - High-Level Service Orchestration
// ============================================================================
class ServiceManager {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Initialize all services
  async initialize() {
    if (this.isInitialized) {
      return this.initializationPromise;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  async performInitialization() {
    try {
      console.log('🚀 Starting Vocilio Service Manager...');
      
      // Initialize service registry (which handles all other services)
      await serviceRegistry.initialize();
      
      // Setup global error handling
      this.setupGlobalErrorHandling();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      // Load critical data into cache
      await this.preloadCriticalData();
      
      this.isInitialized = true;
      console.log('✅ Vocilio Service Manager initialized successfully');
      
      // Show welcome notification
      notificationService.showSuccess('Welcome to Vocilio AI Dashboard! All systems are ready.');
      
      return true;
    } catch (error) {
      console.error('❌ Service Manager initialization failed:', error);
      notificationService.showError('Failed to initialize services', error);
      throw error;
    }
  }

  // Setup global error handling
  setupGlobalErrorHandling() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      
      notificationService.showError(
        'An unexpected error occurred',
        event.reason,
        { duration: 8000 }
      );
      
      // Send to monitoring service if available
      this.reportError('unhandled_rejection', event.reason);
    });

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', event.error);
      
      notificationService.showError(
        'A system error occurred',
        event.error,
        { duration: 8000 }
      );
      
      this.reportError('javascript_error', event.error);
    });
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      // Log slow requests
      if (duration > 3000) {
        console.warn(`⚠️ Slow API request (${duration.toFixed(2)}ms):`, args[0]);
      }
      
      return response;
    };

    // Monitor WebSocket performance
    wsService.subscribe('message', (data) => {
      const latency = Date.now() - new Date(data.timestamp).getTime();
      if (latency > 1000) {
        console.warn(`⚠️ High WebSocket latency: ${latency}ms`);
      }
    });
  }

  // Preload critical data
  async preloadCriticalData() {
    try {
      const criticalEndpoints = [
        { url: '/dashboard/stats', ttl: 30000 },
        { url: '/campaigns/active', ttl: 60000 },
        { url: '/settings/account', ttl: 300000 }
      ];

      await cacheService.preload(criticalEndpoints);
      console.log('✅ Critical data preloaded');
    } catch (error) {
      console.warn('⚠️ Failed to preload some critical data:', error);
    }
  }

  // Report errors to monitoring service
  reportError(type, error) {
    // This would typically send to your error tracking service
    const errorReport = {
      type,
      message: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to monitoring service (non-blocking)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorReport.message,
        fatal: type === 'javascript_error'
      });
    }
  }

  // Get service health status
  getHealthStatus() {
    return serviceRegistry.getSystemHealth();
  }

  // Get service statistics
  getStatistics() {
    return {
      cache: cacheService.getStats(),
      notifications: {
        total: notificationService.getNotifications().length,
        unread: notificationService.getUnreadCount()
      },
      websocket: wsService.getStatus(),
      services: serviceRegistry.getAllServicesStatus()
    };
  }

  // Restart all services
  async restart() {
    console.log('🔄 Restarting Service Manager...');
    
    await serviceRegistry.shutdown();
    this.isInitialized = false;
    this.initializationPromise = null;
    
    return this.initialize();
  }

  // Shutdown all services
  async shutdown() {
    console.log('🛑 Shutting down Service Manager...');
    
    await serviceRegistry.shutdown();
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Create singleton service manager
const serviceManager = new ServiceManager();

// ============================================================================
// CONVENIENCE EXPORTS - Easy Access to Common Services
// ============================================================================

// Individual service exports
export { 
  serviceRegistry,
  wsService,
  cacheService,
  notificationService,
  apiService
};

// API exports
export {
  dashboardApi,
  campaignsApi,
  contactsApi,
  phoneApi,
  voiceApi,
  callFlowsApi,
  analyticsApi,
  billingApi,
  settingsApi,
  realtimeApi,
  mediaAiApi,
  omnichannelApi
};

// Main service manager export
export default serviceManager;

// ============================================================================
// AUTO-INITIALIZATION - Start services when imported
// ============================================================================

// Auto-initialize services in development
if (process.env.NODE_ENV === 'development') {
  serviceManager.initialize().catch(console.error);
}

// Export initialization function for manual control
export const initializeServices = () => serviceManager.initialize();
export const getServiceHealth = () => serviceManager.getHealthStatus();
export const getServiceStats = () => serviceManager.getStatistics();

// Global service access (for debugging)
if (typeof window !== 'undefined') {
  window.VocilioServices = {
    manager: serviceManager,
    registry: serviceRegistry,
    apis: {
      ...businessApis,
      ...communicationApis
    },
    core: coreServices
  };
}

console.log('📦 Vocilio Services loaded successfully');
