// ===== COPILOT PROMPT #2: Enhanced Error Recovery Hook =====
// Advanced error handling with retry logic, offline support, and fallback data
// Includes automatic recovery strategies and user-friendly error reporting

import { useState, useEffect, useCallback, useRef } from 'react';

export const useEnhancedErrorRecovery = () => {
  const [errorState, setErrorState] = useState({
    hasError: false,
    error: null,
    errorHistory: [],
    recoveryAttempts: 0,
    isRecovering: false,
    lastRecoveryTime: null,
  });

  const [networkState, setNetworkState] = useState({
    isOnline: navigator.onlineStatus || true,
    connectionQuality: 'good',
    lastOnlineTime: Date.now(),
  });

  const retryTimeouts = useRef(new Map());
  const errorCounts = useRef(new Map());

  // Error classification
  const classifyError = useCallback((error) => {
    // Network errors
    if (!navigator.onLine || error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        type: 'network',
        severity: 'high',
        retryable: true,
        strategy: 'exponentialBackoff',
        message: 'Network connection lost. Retrying...',
      };
    }

    // API errors
    if (error.status) {
      if (error.status >= 500) {
        return {
          type: 'server',
          severity: 'high',
          retryable: true,
          strategy: 'linearBackoff',
          message: 'Server temporarily unavailable. Retrying...',
        };
      }
      
      if (error.status === 404) {
        return {
          type: 'notFound',
          severity: 'medium',
          retryable: false,
          strategy: 'fallback',
          message: 'Resource not available. Using cached data.',
        };
      }
      
      if (error.status === 401 || error.status === 403) {
        return {
          type: 'auth',
          severity: 'high',
          retryable: false,
          strategy: 'redirect',
          message: 'Authentication required. Please log in again.',
        };
      }
      
      if (error.status === 429) {
        return {
          type: 'rateLimit',
          severity: 'medium',
          retryable: true,
          strategy: 'exponentialBackoff',
          message: 'Too many requests. Please wait...',
        };
      }
    }

    // Parse errors
    if (error.message?.includes('JSON') || error.name === 'SyntaxError') {
      return {
        type: 'parse',
        severity: 'medium',
        retryable: true,
        strategy: 'immediate',
        message: 'Data format error. Retrying...',
      };
    }

    // Generic errors
    return {
      type: 'generic',
      severity: 'medium',
      retryable: true,
      strategy: 'linearBackoff',
      message: 'Something went wrong. Retrying...',
    };
  }, []);

  // Recovery strategies
  const recoveryStrategies = {
    exponentialBackoff: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000),
    linearBackoff: (attempt) => Math.min(1000 + (attempt * 2000), 15000),
    immediate: () => 100,
    fallback: () => 0, // No retry, use fallback
  };

  // Enhanced error handler
  const handleError = useCallback((error, context = {}) => {
    console.error('🚨 Enhanced Error Recovery:', error);
    
    const classification = classifyError(error);
    const errorKey = `${classification.type}-${context.operation || 'unknown'}`;
    
    // Update error counts
    const currentCount = errorCounts.current.get(errorKey) || 0;
    errorCounts.current.set(errorKey, currentCount + 1);
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      classification,
      context,
      timestamp: Date.now(),
      count: currentCount + 1,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error: enhancedError,
      errorHistory: [...prev.errorHistory.slice(-9), enhancedError], // Keep last 10 errors
    }));

    // Automatic recovery for retryable errors
    if (classification.retryable && currentCount < 3) {
      const delay = recoveryStrategies[classification.strategy](currentCount);
      
      if (delay > 0) {
        setErrorState(prev => ({ ...prev, isRecovering: true }));
        
        const timeoutId = setTimeout(() => {
          if (context.retryFunction) {
            console.log(`🔄 Attempting recovery for ${errorKey} (attempt ${currentCount + 1})`);
            context.retryFunction();
          }
          
          setErrorState(prev => ({ 
            ...prev, 
            isRecovering: false,
            recoveryAttempts: prev.recoveryAttempts + 1,
            lastRecoveryTime: Date.now(),
          }));
        }, delay);
        
        retryTimeouts.current.set(errorKey, timeoutId);
      }
    }

    return enhancedError;
  }, [classifyError]);

  // Clear error state
  const clearError = useCallback((errorId) => {
    if (errorId) {
      setErrorState(prev => ({
        ...prev,
        errorHistory: prev.errorHistory.filter(e => e.id !== errorId),
        hasError: prev.error?.id === errorId ? false : prev.hasError,
        error: prev.error?.id === errorId ? null : prev.error,
      }));
    } else {
      setErrorState({
        hasError: false,
        error: null,
        errorHistory: [],
        recoveryAttempts: 0,
        isRecovering: false,
        lastRecoveryTime: null,
      });
      
      // Clear all timeouts
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
      errorCounts.current.clear();
    }
  }, []);

  // Manual retry
  const retryOperation = useCallback((operation, context = {}) => {
    if (typeof operation === 'function') {
      setErrorState(prev => ({ ...prev, isRecovering: true }));
      
      try {
        const result = operation();
        
        // Handle promise results
        if (result && typeof result.then === 'function') {
          return result
            .then((data) => {
              setErrorState(prev => ({ 
                ...prev, 
                hasError: false, 
                error: null,
                isRecovering: false,
                recoveryAttempts: prev.recoveryAttempts + 1,
                lastRecoveryTime: Date.now(),
              }));
              return data;
            })
            .catch((error) => {
              handleError(error, { ...context, operation: operation.name });
              throw error;
            });
        }
        
        // Handle synchronous results
        setErrorState(prev => ({ 
          ...prev, 
          hasError: false, 
          error: null,
          isRecovering: false,
        }));
        return result;
      } catch (error) {
        handleError(error, { ...context, operation: operation.name });
        throw error;
      }
    }
  }, [handleError]);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineTime: Date.now(),
      }));
      
      // Clear network-related errors
      setErrorState(prev => ({
        ...prev,
        errorHistory: prev.errorHistory.filter(e => e.classification.type !== 'network'),
        hasError: prev.error?.classification.type === 'network' ? false : prev.hasError,
        error: prev.error?.classification.type === 'network' ? null : prev.error,
      }));
    };

    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Connection quality monitoring (experimental)
  useEffect(() => {
    if ('connection' in navigator) {
      const updateConnectionInfo = () => {
        const connection = navigator.connection;
        let quality = 'good';
        
        if (connection.effectiveType === '2g' || connection.downlink < 1) {
          quality = 'poor';
        } else if (connection.effectiveType === '3g' || connection.downlink < 5) {
          quality = 'fair';
        }
        
        setNetworkState(prev => ({
          ...prev,
          connectionQuality: quality,
        }));
      };
      
      navigator.connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
      
      return () => {
        navigator.connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Get user-friendly error message
  const getErrorMessage = useCallback((error) => {
    if (!error) return null;
    
    if (error.classification) {
      return error.classification.message;
    }
    
    return error.message || 'An unexpected error occurred';
  }, []);

  // Get recovery suggestions
  const getRecoverySuggestions = useCallback((error) => {
    if (!error?.classification) return [];
    
    const suggestions = [];
    
    switch (error.classification.type) {
      case 'network':
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
        break;
      case 'server':
        suggestions.push('The server is temporarily unavailable');
        suggestions.push('Please try again in a few moments');
        break;
      case 'auth':
        suggestions.push('Please log in again');
        suggestions.push('Your session may have expired');
        break;
      case 'rateLimit':
        suggestions.push('You are making requests too quickly');
        suggestions.push('Please wait a moment before trying again');
        break;
      default:
        suggestions.push('Please try again');
        if (error.count > 2) {
          suggestions.push('If the problem persists, please contact support');
        }
    }
    
    return suggestions;
  }, []);

  return {
    // Error state
    errorState,
    hasError: errorState.hasError,
    currentError: errorState.error,
    errorHistory: errorState.errorHistory,
    isRecovering: errorState.isRecovering,
    
    // Network state
    networkState,
    isOnline: networkState.isOnline,
    connectionQuality: networkState.connectionQuality,
    
    // Methods
    handleError,
    clearError,
    retryOperation,
    getErrorMessage,
    getRecoverySuggestions,
    
    // Utilities
    canRetry: errorState.error?.classification?.retryable || false,
    shouldShowError: errorState.hasError && !errorState.isRecovering,
    
    // Statistics
    totalErrors: errorState.errorHistory.length,
    recoveryAttempts: errorState.recoveryAttempts,
    lastRecoveryTime: errorState.lastRecoveryTime,
  };
};

export default useEnhancedErrorRecovery;
