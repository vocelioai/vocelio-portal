// ===== COPILOT PROMPT #2: Redux Provider Component =====
// Enhanced Redux Provider with error boundaries and performance monitoring
// Includes store persistence and development tools

import React, { useEffect, useState, createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';
import { store, monitorStorePerformance } from '../store';

// Error boundary component for Redux-related errors
const ReduxErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Store Connection Error</h3>
          <p className="text-sm text-gray-600">Unable to connect to the data store</p>
        </div>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
        <p className="text-sm text-red-700 font-mono">
          {error.message}
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={resetErrorBoundary}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// Performance monitoring context
const PerformanceContext = createContext({});

export const usePerformanceMonitoring = () => useContext(PerformanceContext);

// Enhanced Redux Provider with monitoring and error handling
export const EnhancedReduxProvider = ({ children }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    queriesExecuted: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageQueryTime: 0,
    errorCount: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: true,
    lastConnected: Date.now(),
    reconnectAttempts: 0,
  });

  useEffect(() => {
    // Initialize performance monitoring
    const unsubscribePerformance = monitorStorePerformance();
    
    // Monitor store state changes for performance metrics
    const unsubscribeStore = store.subscribe(() => {
      const state = store.getState();
      const apiState = state.omnichannelApi;
      
      if (apiState) {
        const queries = Object.values(apiState.queries || {});
        const mutations = Object.values(apiState.mutations || {});
        
        // Calculate performance metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          queriesExecuted: queries.length,
          cacheHits: queries.filter(q => q.status === 'fulfilled' && q.data).length,
          cacheMisses: queries.filter(q => q.status === 'rejected').length,
          errorCount: [...queries, ...mutations].filter(q => q.error).length,
        }));
      }
    });

    // Monitor connection status
    const checkConnection = () => {
      try {
        const state = store.getState();
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastConnected: Date.now(),
          reconnectAttempts: 0,
        }));
      } catch (error) {
        console.error('Store connection error:', error);
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
      }
    };

    const connectionInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Cleanup
    return () => {
      unsubscribePerformance();
      unsubscribeStore();
      clearInterval(connectionInterval);
    };
  }, []);

  // Enhanced error recovery
  const handleError = (error, errorInfo) => {
    console.error('Redux Provider Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Log to monitoring service if available
    if (window.analytics) {
      window.analytics.track('Redux Error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
    
    setPerformanceMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
    }));
  };

  const performanceContextValue = {
    metrics: performanceMetrics,
    connectionStatus,
    // Utility functions
    resetMetrics: () => setPerformanceMetrics({
      queriesExecuted: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      errorCount: 0,
    }),
    getStoreHealth: () => {
      const { cacheHits, cacheMisses, errorCount } = performanceMetrics;
      const totalQueries = cacheHits + cacheMisses;
      const successRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 100;
      
      return {
        status: errorCount < 5 && successRate > 80 ? 'healthy' : 'degraded',
        successRate,
        errorRate: totalQueries > 0 ? (errorCount / totalQueries) * 100 : 0,
      };
    },
  };

  return (
    <ErrorBoundary
      FallbackComponent={ReduxErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset any error state
        setPerformanceMetrics({
          queriesExecuted: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageQueryTime: 0,
          errorCount: 0,
        });
      }}
    >
      <Provider store={store}>
        <PerformanceContext.Provider value={performanceContextValue}>
          {children}
        </PerformanceContext.Provider>
      </Provider>
    </ErrorBoundary>
  );
};

// Development tools component (only shown in development)
export const ReduxDevTools = () => {
  const { metrics, connectionStatus, getStoreHealth } = usePerformanceMonitoring();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const health = getStoreHealth();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-blue-700 z-50"
      >
        Redux
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs font-mono z-50 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Redux Monitor</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-semibold ${
            health.status === 'healthy' ? 'text-green-600' : 'text-red-600'
          }`}>
            {health.status}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Queries:</span>
          <span className="text-blue-600">{metrics.queriesExecuted}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Hits:</span>
          <span className="text-green-600">{metrics.cacheHits}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Errors:</span>
          <span className="text-red-600">{metrics.errorCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Success Rate:</span>
          <span className={`font-semibold ${
            health.successRate > 90 ? 'text-green-600' : 
            health.successRate > 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {health.successRate.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Connection:</span>
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus.isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReduxProvider;
