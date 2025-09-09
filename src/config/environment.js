// ===== COPILOT PROMPT #8: Integration & Deployment Setup =====
// Environment configuration for omnichannel dashboard integration

// Environment Variables Configuration
export const ENV_CONFIG = {
  // Production Environment
  PRODUCTION: {
    OMNICHANNEL_API_URL: 'https://omnichannel-hub-313373223340.us-central1.run.app',
    OMNICHANNEL_WS_URL: 'wss://omnichannel-hub-313373223340.us-central1.run.app/ws',
    APP_ENV: 'production',
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_REPORTING: true,
    ENABLE_PWA: true,
    DEBUG_MODE: false
  },
  
  // Staging Environment
  STAGING: {
    OMNICHANNEL_API_URL: 'https://omnichannel-hub-staging-313373223340.us-central1.run.app',
    OMNICHANNEL_WS_URL: 'wss://omnichannel-hub-staging-313373223340.us-central1.run.app/ws',
    APP_ENV: 'staging',
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_REPORTING: true,
    ENABLE_PWA: true,
    DEBUG_MODE: true
  },
  
  // Development Environment
  DEVELOPMENT: {
    OMNICHANNEL_API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://omnichannel-hub-313373223340.us-central1.run.app',
    OMNICHANNEL_WS_URL: process.env.NODE_ENV === 'development' ? 'ws://localhost:8080/ws' : 'wss://omnichannel-hub-313373223340.us-central1.run.app/ws',
    APP_ENV: 'development',
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_REPORTING: false,
    ENABLE_PWA: true,
    DEBUG_MODE: true
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return ENV_CONFIG.PRODUCTION;
    case 'staging':
      return ENV_CONFIG.STAGING;
    default:
      return ENV_CONFIG.DEVELOPMENT;
  }
};

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Client-Type': 'web'
  }
};

// WebSocket Configuration
export const WS_CONFIG = {
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000, // 30 seconds
  messageQueueSize: 100
};

// PWA Configuration
export const PWA_CONFIG = {
  cacheName: 'vocelio-omnichannel-v1.0.0',
  enableBackgroundSync: true,
  enablePushNotifications: true,
  offlinePages: [
    '/',
    '/dashboard',
    '/dashboard/omnichannel',
    '/offline.html'
  ],
  staticAssets: [
    '/manifest.json',
    '/sw.js',
    '/offline.html'
  ]
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableVoiceChannel: true,
  enableVideoChannel: true,
  enableChatChannel: true,
  enableEmailChannel: true,
  enableSMSChannel: true,
  enableWhatsAppChannel: true,
  enableMobileApp: true,
  enableAnalytics: true,
  enableCampaigns: true,
  enableAutomation: true,
  enableAI: true,
  enableRealtimeUpdates: true,
  enableOfflineMode: true,
  enablePWA: true
};

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenStorageKey: 'vocelio_auth_token',
  refreshTokenKey: 'vocelio_refresh_token',
  tokenExpirationBuffer: 300000, // 5 minutes
  loginUrl: '/auth/login',
  logoutUrl: '/auth/logout',
  refreshUrl: '/auth/refresh'
};

// Performance Monitoring Configuration
export const PERFORMANCE_CONFIG = {
  enableWebVitals: true,
  enableUserTiming: true,
  enableResourceTiming: true,
  enableNavigationTiming: true,
  sampleRate: 0.1, // 10% sampling
  vitalsThresholds: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1   // Cumulative Layout Shift
  }
};

// Error Reporting Configuration
export const ERROR_CONFIG = {
  enableErrorBoundary: true,
  enableConsoleCapture: true,
  enableUnhandledRejection: true,
  enableWindowError: true,
  maxBreadcrumbs: 50,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Script error',
    'Non-Error promise rejection captured'
  ]
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  trackingId: process.env.REACT_APP_GA_TRACKING_ID || 'GA_TRACKING_ID_PLACEHOLDER',
  enablePageViews: true,
  enableEvents: true,
  enableExceptions: true,
  enableUserTiming: true,
  customDimensions: {
    userRole: 'dimension1',
    subscriptionType: 'dimension2',
    featureUsage: 'dimension3'
  }
};

// Integration URLs and Endpoints
export const INTEGRATION_ENDPOINTS = {
  // Omnichannel Hub Services
  hub: {
    base: getCurrentConfig().OMNICHANNEL_API_URL,
    health: '/health',
    channels: '/channels',
    sessions: '/sessions',
    analytics: '/analytics',
    campaigns: '/campaigns',
    automation: '/automation'
  },
  
  // API Gateway
  gateway: {
    base: 'https://api-gateway-313373223340.us-central1.run.app',
    auth: '/auth',
    users: '/users',
    organizations: '/organizations',
    billing: '/billing'
  },
  
  // Voice Services
  voice: {
    base: 'https://voice-router-313373223340.us-central1.run.app',
    calls: '/calls',
    recordings: '/recordings',
    transcripts: '/transcripts'
  },
  
  // Video Services
  video: {
    base: 'https://video-intelligence-313373223340.us-central1.run.app',
    sessions: '/sessions',
    rooms: '/rooms',
    recordings: '/recordings'
  },
  
  // AI Services
  ai: {
    base: 'https://ai-voice-intelligence-313373223340.us-central1.run.app',
    analyze: '/analyze',
    sentiment: '/sentiment',
    intent: '/intent',
    transcribe: '/transcribe'
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  enableCSRF: true,
  enableCORS: true,
  allowedOrigins: [
    'https://app.vocelio.com',
    'https://vocelio.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  apiKeyHeader: 'X-API-Key',
  authHeader: 'Authorization',
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
  }
};

// Deployment Configuration
export const DEPLOYMENT_CONFIG = {
  buildOptimization: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableCompression: true,
    enableSourceMaps: process.env.NODE_ENV !== 'production'
  },
  
  cdn: {
    enabled: true,
    domain: 'https://cdn.vocelio.com',
    staticAssets: ['images', 'icons', 'fonts'],
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString()
    }
  },
  
  monitoring: {
    healthCheck: '/health',
    metricsEndpoint: '/metrics',
    readinessProbe: '/ready',
    livenessProbe: '/live'
  }
};

// Database Configuration (for caching and offline storage)
export const DATABASE_CONFIG = {
  indexedDB: {
    name: 'VocelioOmnichannelDB',
    version: 1,
    stores: {
      sessions: 'id, customerId, channelId, timestamp',
      analytics: 'id, type, timestamp, data',
      cache: 'key, value, timestamp, expiry',
      offline: 'id, type, data, timestamp, synced'
    }
  },
  
  localStorage: {
    prefix: 'vocelio_',
    maxSize: 10 * 1024 * 1024, // 10MB
    enableCompression: true
  }
};

export default {
  ENV_CONFIG,
  API_CONFIG,
  WS_CONFIG,
  PWA_CONFIG,
  FEATURE_FLAGS,
  AUTH_CONFIG,
  PERFORMANCE_CONFIG,
  ERROR_CONFIG,
  ANALYTICS_CONFIG,
  INTEGRATION_ENDPOINTS,
  SECURITY_CONFIG,
  DEPLOYMENT_CONFIG,
  DATABASE_CONFIG,
  getCurrentConfig
};
