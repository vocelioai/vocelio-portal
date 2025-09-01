// ============================================================================
// SERVICE REGISTRY - Centralized Service Management & Health Monitoring
// ============================================================================
import { apiService } from './api';
import wsService from './websocket';
import cacheService from './cache';
import notificationService from './notifications';

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthStatus = new Map();
    this.dependencies = new Map();
    this.startupOrder = [];
    this.isInitialized = false;
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimer = null;

    this.registerCoreServices();
  }

  // Register all core services
  registerCoreServices() {
    this.register('api', apiService, {
      dependencies: [],
      healthCheck: () => this.checkApiHealth(),
      critical: true
    });

    this.register('websocket', wsService, {
      dependencies: ['api'],
      healthCheck: () => this.checkWebSocketHealth(),
      critical: false
    });

    this.register('cache', cacheService, {
      dependencies: [],
      healthCheck: () => this.checkCacheHealth(),
      critical: false
    });

    this.register('notifications', notificationService, {
      dependencies: [],
      healthCheck: () => this.checkNotificationHealth(),
      critical: false
    });

    // Define startup order based on dependencies
    this.startupOrder = ['cache', 'api', 'notifications', 'websocket'];
  }

  // Register a service
  register(name, service, options = {}) {
    this.services.set(name, {
      instance: service,
      dependencies: options.dependencies || [],
      healthCheck: options.healthCheck || (() => ({ status: 'healthy' })),
      critical: options.critical || false,
      status: 'registered'
    });

    this.healthStatus.set(name, {
      status: 'unknown',
      lastCheck: null,
      consecutiveFailures: 0
    });

    console.log(`✅ Service registered: ${name}`);
  }

  // Get service instance
  get(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service.instance;
  }

  // Initialize all services
  async initialize() {
    if (this.isInitialized) {
      console.log('🔄 Services already initialized');
      return;
    }

    console.log('🚀 Initializing Vocilio services...');
    
    try {
      // Initialize services in dependency order
      for (const serviceName of this.startupOrder) {
        await this.initializeService(serviceName);
      }

      // Start health monitoring
      this.startHealthMonitoring();
      
      // Connect WebSocket
      this.get('websocket').connect();

      this.isInitialized = true;
      console.log('✅ All services initialized successfully');
      
      // Emit initialization event
      window.dispatchEvent(new CustomEvent('vocilio:services:initialized'));

    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      this.get('notifications').showError(
        'Failed to initialize some services. Some features may not work properly.',
        error
      );
    }
  }

  // Initialize individual service
  async initializeService(name) {
    const service = this.services.get(name);
    if (!service) return;

    try {
      console.log(`🔧 Initializing service: ${name}`);
      
      // Check dependencies first
      for (const dependency of service.dependencies) {
        const depService = this.services.get(dependency);
        if (!depService || depService.status !== 'initialized') {
          throw new Error(`Dependency '${dependency}' not ready for service '${name}'`);
        }
      }

      // Initialize service if it has an init method
      if (service.instance.initialize) {
        await service.instance.initialize();
      }

      service.status = 'initialized';
      console.log(`✅ Service initialized: ${name}`);

    } catch (error) {
      console.error(`❌ Failed to initialize service '${name}':`, error);
      service.status = 'failed';
      
      if (service.critical) {
        throw error;
      }
    }
  }

  // Start health monitoring
  startHealthMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);

    // Perform initial health check
    setTimeout(() => this.performHealthChecks(), 1000);
  }

  // Perform health checks on all services
  async performHealthChecks() {
    console.log('🔍 Performing service health checks...');
    
    for (const [name, service] of this.services) {
      if (service.status === 'initialized') {
        await this.checkServiceHealth(name);
      }
    }

    // Update overall system health
    this.updateSystemHealth();
  }

  // Check individual service health
  async checkServiceHealth(name) {
    const service = this.services.get(name);
    const currentHealth = this.healthStatus.get(name);
    
    try {
      const healthResult = await service.healthCheck();
      
      this.healthStatus.set(name, {
        status: healthResult.status || 'healthy',
        lastCheck: new Date().toISOString(),
        consecutiveFailures: 0,
        details: healthResult.details || {}
      });

      // If service was unhealthy and now healthy, notify
      if (currentHealth.status === 'unhealthy') {
        this.get('notifications').showSuccess(
          `Service '${name}' is now healthy`,
          { duration: 3000 }
        );
      }

    } catch (error) {
      const failures = currentHealth.consecutiveFailures + 1;
      
      this.healthStatus.set(name, {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        consecutiveFailures: failures,
        error: error.message
      });

      // Alert on consecutive failures
      if (failures >= 3 && service.critical) {
        this.get('notifications').showAlert(
          `Critical service '${name}' is unhealthy`,
          'error',
          {
            data: { service: name, error: error.message },
            actions: [
              {
                label: 'Restart Service',
                action: () => this.restartService(name)
              }
            ]
          }
        );
      }

      console.error(`❌ Health check failed for service '${name}':`, error);
    }
  }

  // Update overall system health
  updateSystemHealth() {
    const services = Array.from(this.healthStatus.entries());
    const unhealthyServices = services.filter(([_, health]) => health.status === 'unhealthy');
    const criticalUnhealthy = services.filter(([name, health]) => {
      const service = this.services.get(name);
      return health.status === 'unhealthy' && service.critical;
    });

    const systemStatus = {
      status: criticalUnhealthy.length > 0 ? 'critical' : 
              unhealthyServices.length > 0 ? 'degraded' : 'healthy',
      services: Object.fromEntries(this.healthStatus),
      timestamp: new Date().toISOString()
    };

    // Store system health
    this.systemHealth = systemStatus;
    
    // Emit health update event
    window.dispatchEvent(new CustomEvent('vocilio:health:updated', {
      detail: systemStatus
    }));
  }

  // Restart a service
  async restartService(name) {
    console.log(`🔄 Restarting service: ${name}`);
    
    try {
      const service = this.services.get(name);
      
      // Stop service if it has a stop method
      if (service.instance.disconnect || service.instance.stop) {
        await (service.instance.disconnect || service.instance.stop).call(service.instance);
      }

      // Reinitialize
      await this.initializeService(name);
      
      this.get('notifications').showSuccess(
        `Service '${name}' restarted successfully`
      );

    } catch (error) {
      console.error(`❌ Failed to restart service '${name}':`, error);
      this.get('notifications').showError(
        `Failed to restart service '${name}'`,
        error
      );
    }
  }

  // Health check implementations
  async checkApiHealth() {
    try {
      const health = this.get('api').getServiceHealth();
      const unhealthyServices = Object.values(health).filter(s => s.status !== 'healthy');
      
      return {
        status: unhealthyServices.length === 0 ? 'healthy' : 'degraded',
        details: {
          services: Object.keys(health).length,
          unhealthy: unhealthyServices.length,
          health
        }
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  checkWebSocketHealth() {
    const wsStatus = this.get('websocket').getStatus();
    return {
      status: wsStatus.connected ? 'healthy' : 'unhealthy',
      details: wsStatus
    };
  }

  checkCacheHealth() {
    const stats = this.get('cache').getStats();
    return {
      status: 'healthy',
      details: stats
    };
  }

  checkNotificationHealth() {
    const unreadCount = this.get('notifications').getUnreadCount();
    return {
      status: 'healthy',
      details: { unreadNotifications: unreadCount }
    };
  }

  // Get system health status
  getSystemHealth() {
    return this.systemHealth || {
      status: 'initializing',
      services: {},
      timestamp: new Date().toISOString()
    };
  }

  // Get service status
  getServiceStatus(name) {
    const service = this.services.get(name);
    const health = this.healthStatus.get(name);
    
    if (!service) return null;
    
    return {
      name,
      status: service.status,
      health: health.status,
      dependencies: service.dependencies,
      critical: service.critical,
      lastHealthCheck: health.lastCheck,
      consecutiveFailures: health.consecutiveFailures
    };
  }

  // Get all services status
  getAllServicesStatus() {
    return Array.from(this.services.keys()).map(name => 
      this.getServiceStatus(name)
    );
  }

  // Shutdown all services
  async shutdown() {
    console.log('🛑 Shutting down services...');
    
    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Shutdown services in reverse order
    for (const serviceName of [...this.startupOrder].reverse()) {
      try {
        const service = this.services.get(serviceName);
        if (service?.instance.disconnect || service?.instance.shutdown) {
          await (service.instance.disconnect || service.instance.shutdown).call(service.instance);
        }
        console.log(`✅ Service shutdown: ${serviceName}`);
      } catch (error) {
        console.error(`❌ Error shutting down service '${serviceName}':`, error);
      }
    }

    this.isInitialized = false;
    console.log('✅ All services shutdown');
  }
}

// Create singleton instance
const serviceRegistry = new ServiceRegistry();

export default serviceRegistry;
