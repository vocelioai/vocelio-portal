// ===== COPILOT PROMPT #8: Monitoring & Analytics Service =====

import { getCurrentConfig } from '../config/environment';

const config = getCurrentConfig();

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  public static startTiming(label: string): string {
    const id = `${label}-${Date.now()}-${Math.random()}`;
    if (typeof performance !== 'undefined') {
      performance.mark(`${id}-start`);
    }
    return id;
  }
  
  public static endTiming(id: string): number {
    if (typeof performance !== 'undefined') {
      const label = id.split('-')[0];
      performance.mark(`${id}-end`);
      performance.measure(id, `${id}-start`, `${id}-end`);
      
      const measure = performance.getEntriesByName(id)[0];
      const duration = measure.duration;
      
      // Store metric
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Send to analytics
      this.sendMetric('performance', {
        label,
        duration,
        timestamp: Date.now(),
      });
      
      return duration;
    }
    return 0;
  }
  
  public static getMetrics(): Record<string, { avg: number; count: number; min: number; max: number }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((values, label) => {
      result[label] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });
    
    return result;
  }
  
  private static sendMetric(type: string, data: any): void {
    // Send to monitoring service
    if (config.NODE_ENV === 'production') {
      fetch(`${config.OMNICHANNEL_API_URL}/analytics/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() }),
      }).catch(console.error);
    }
  }
}

// Error tracking and logging
export class ErrorTracker {
  private static errors: Array<{
    message: string;
    stack: string;
    timestamp: number;
    userAgent: string;
    url: string;
    userId?: string;
  }> = [];
  
  public static init(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { type: 'promise' }
      );
    });
    
    // Console error override
    const originalError = console.error;
    console.error = (...args) => {
      this.trackError(new Error(args.join(' ')), { type: 'console' });
      originalError.apply(console, args);
    };
  }
  
  public static trackError(
    error: Error,
    context: Record<string, any> = {}
  ): void {
    const errorData = {
      message: error.message,
      stack: error.stack || '',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      context,
    };
    
    this.errors.push(errorData);
    
    // Send to error tracking service
    if (config.NODE_ENV === 'production') {
      fetch(`${config.OMNICHANNEL_API_URL}/analytics/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Fallback: store locally if network fails
        localStorage.setItem('pending_errors', JSON.stringify([
          ...(JSON.parse(localStorage.getItem('pending_errors') || '[]')),
          errorData,
        ]));
      });
    }
  }
  
  private static getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('vocelio_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }
  
  public static getErrors(): typeof ErrorTracker.errors {
    return this.errors;
  }
  
  public static clearErrors(): void {
    this.errors = [];
  }
}

// User analytics and behavior tracking
export class AnalyticsTracker {
  private static sessionId = this.generateSessionId();
  private static pageViews: Array<{
    path: string;
    title: string;
    timestamp: number;
    duration?: number;
  }> = [];
  
  public static init(): void {
    this.trackPageView();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { sessionId: this.sessionId });
      } else {
        this.trackEvent('page_visible', { sessionId: this.sessionId });
      }
    });
    
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('[data-analytics]')) {
        this.trackEvent('click', {
          element: target.getAttribute('data-analytics'),
          text: target.textContent?.trim(),
          path: window.location.pathname,
        });
      }
    });
  }
  
  public static trackPageView(path?: string, title?: string): void {
    const pageView = {
      path: path || window.location.pathname,
      title: title || document.title,
      timestamp: Date.now(),
    };
    
    // End previous page view
    if (this.pageViews.length > 0) {
      const lastView = this.pageViews[this.pageViews.length - 1];
      lastView.duration = pageView.timestamp - lastView.timestamp;
    }
    
    this.pageViews.push(pageView);
    
    // Send to analytics
    this.sendAnalytics('page_view', pageView);
  }
  
  public static trackEvent(
    name: string,
    properties: Record<string, any> = {}
  ): void {
    const event = {
      name,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      },
    };
    
    this.sendAnalytics('event', event);
  }
  
  public static trackConversion(
    goal: string,
    value?: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('conversion', {
      goal,
      value,
      ...properties,
    });
  }
  
  public static trackPerformance(): void {
    if (typeof performance !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.sendAnalytics('performance', {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          path: window.location.pathname,
          timestamp: Date.now(),
        });
      }
    }
  }
  
  private static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private static sendAnalytics(type: string, data: any): void {
    if (config.NODE_ENV === 'production') {
      fetch(`${config.OMNICHANNEL_API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      }).catch(() => {
        // Fallback: store locally
        const pending = JSON.parse(localStorage.getItem('pending_analytics') || '[]');
        pending.push({ type, data, timestamp: Date.now() });
        localStorage.setItem('pending_analytics', JSON.stringify(pending));
      });
    }
  }
  
  public static getSessionData(): {
    sessionId: string;
    pageViews: typeof AnalyticsTracker.pageViews;
    duration: number;
  } {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      duration: this.pageViews.length > 0 
        ? Date.now() - this.pageViews[0].timestamp 
        : 0,
    };
  }
}

// Real-time monitoring
export class RealTimeMonitor {
  private static websocket: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  
  public static init(): void {
    this.connectWebSocket();
    this.startHealthChecks();
  }
  
  private static connectWebSocket(): void {
    try {
      const wsUrl = config.OMNICHANNEL_WS_URL || config.OMNICHANNEL_API_URL.replace('http', 'ws');
      this.websocket = new WebSocket(`${wsUrl}/ws/monitoring`);
      
      this.websocket.onopen = () => {
        console.log('Monitoring WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send initial status
        this.sendStatus({
          type: 'connection',
          status: 'connected',
          timestamp: Date.now(),
        });
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMonitoringMessage(message);
        } catch (error) {
          console.error('Error parsing monitoring message:', error);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('Monitoring WebSocket disconnected');
        this.handleDisconnection();
      };
      
      this.websocket.onerror = (error) => {
        console.error('Monitoring WebSocket error:', error);
        ErrorTracker.trackError(new Error('WebSocket monitoring error'), {
          type: 'websocket',
          error: error.toString(),
        });
      };
    } catch (error) {
      console.error('Failed to create monitoring WebSocket:', error);
    }
  }
  
  private static handleMonitoringMessage(message: any): void {
    switch (message.type) {
      case 'health_check':
        this.sendStatus({
          type: 'health_response',
          status: 'healthy',
          metrics: PerformanceMonitor.getMetrics(),
          errors: ErrorTracker.getErrors().length,
          timestamp: Date.now(),
        });
        break;
      
      case 'performance_request':
        AnalyticsTracker.trackPerformance();
        break;
    }
  }
  
  private static handleDisconnection(): void {
    this.websocket = null;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    }
  }
  
  private static sendStatus(data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    }
  }
  
  private static startHealthChecks(): void {
    setInterval(() => {
      this.sendStatus({
        type: 'heartbeat',
        timestamp: Date.now(),
        performance: PerformanceMonitor.getMetrics(),
        session: AnalyticsTracker.getSessionData(),
      });
    }, 30000); // Every 30 seconds
  }
}

// Initialize monitoring system
export function initializeMonitoring(): void {
  // Initialize error tracking
  ErrorTracker.init();
  
  // Initialize analytics
  AnalyticsTracker.init();
  
  // Initialize real-time monitoring
  RealTimeMonitor.init();
  
  // Track initial page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      AnalyticsTracker.trackPerformance();
    }, 100);
  });
  
  // Send any pending analytics on page unload
  window.addEventListener('beforeunload', () => {
    const pending = localStorage.getItem('pending_analytics');
    if (pending) {
      navigator.sendBeacon(
        `${config.OMNICHANNEL_API_URL}/analytics/batch`,
        pending
      );
      localStorage.removeItem('pending_analytics');
    }
    
    const pendingErrors = localStorage.getItem('pending_errors');
    if (pendingErrors) {
      navigator.sendBeacon(
        `${config.OMNICHANNEL_API_URL}/analytics/errors/batch`,
        pendingErrors
      );
      localStorage.removeItem('pending_errors');
    }
  });
}

// Export classes individually to avoid redeclaration conflicts
// Classes already exported inline above
