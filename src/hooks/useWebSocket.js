import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '../providers/WebSocketProvider';

// ===== COPILOT PROMPT #4: useWebSocket Custom Hook =====
// WebSocket connection management with auto-reconnect and message handling

export const useWebSocket = (endpoint, options = {}) => {
  const {
    sessionId = null,
    autoConnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 1000,
    heartbeatInterval = 30000,
    onMessage = null,
    onConnect = null,
    onDisconnect = null,
    onError = null,
    messageFilters = []
  } = options;

  const wsContext = useWebSocketContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  
  const connectionId = useRef(null);
  const messageSubscriptions = useRef(new Set());
  const messageBuffer = useRef([]);
  const maxHistorySize = useRef(options.maxHistorySize || 100);

  // Generate unique connection ID
  useEffect(() => {
    if (!connectionId.current) {
      connectionId.current = `${endpoint}_${sessionId || 'default'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [endpoint, sessionId]);

  // Connection state management
  const updateConnectionState = useCallback(() => {
    if (!connectionId.current) return;
    
    const status = wsContext.getConnectionStatus(connectionId.current);
    const connected = status.state === wsContext.CONNECTION_STATES.CONNECTED;
    const connecting = status.state === wsContext.CONNECTION_STATES.CONNECTING || 
                      status.state === wsContext.CONNECTION_STATES.RECONNECTING;
    
    setIsConnected(connected);
    setIsConnecting(connecting);
    
    if (status.state === wsContext.CONNECTION_STATES.ERROR) {
      setError(new Error(`WebSocket connection failed after ${status.reconnectAttempts} attempts`));
    } else {
      setError(null);
    }
  }, [wsContext]);

  // Message handler
  const handleMessage = useCallback((message) => {
    // Apply message filters if specified
    if (messageFilters.length > 0) {
      const shouldProcess = messageFilters.some(filter => {
        if (typeof filter === 'string') {
          return message.type === filter;
        }
        if (typeof filter === 'function') {
          return filter(message);
        }
        return false;
      });
      
      if (!shouldProcess) return;
    }

    // Update last message
    setLastMessage(message);
    
    // Add to message history with size limit
    setMessageHistory(prev => {
      const newHistory = [...prev, { ...message, receivedAt: Date.now() }];
      if (newHistory.length > maxHistorySize.current) {
        return newHistory.slice(-maxHistorySize.current);
      }
      return newHistory;
    });

    // Call custom message handler
    onMessage?.(message);
  }, [messageFilters, onMessage]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!connectionId.current) return;
    
    setIsConnecting(true);
    setError(null);

    const connection = wsContext.createConnection(
      connectionId.current,
      endpoint,
      sessionId,
      {
        maxReconnectAttempts,
        reconnectInterval,
        heartbeatInterval,
        onConnect: (event) => {
          console.log(`🔌 WebSocket connected: ${endpoint}${sessionId ? `/${sessionId}` : ''}`);
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          
          // Send any buffered messages
          if (messageBuffer.current.length > 0) {
            messageBuffer.current.forEach(message => {
              sendMessage(message.type, message.payload);
            });
            messageBuffer.current = [];
          }
          
          onConnect?.(event);
        },
        onDisconnect: (event) => {
          console.log(`🔌 WebSocket disconnected: ${endpoint}${sessionId ? `/${sessionId}` : ''}`);
          setIsConnected(false);
          setIsConnecting(false);
          
          if (event.code !== 1000) { // Not a normal closure
            setError(new Error(`Connection closed unexpectedly: ${event.reason || 'Unknown reason'}`));
          }
          
          onDisconnect?.(event);
        },
        onError: (error) => {
          console.error(`❌ WebSocket error: ${endpoint}${sessionId ? `/${sessionId}` : ''}`, error);
          setIsConnected(false);
          setIsConnecting(false);
          setError(error);
          onError?.(error);
        },
        onMessage: handleMessage
      }
    );

    return connection;
  }, [
    endpoint, 
    sessionId, 
    maxReconnectAttempts, 
    reconnectInterval, 
    heartbeatInterval, 
    onConnect, 
    onDisconnect, 
    onError, 
    handleMessage,
    wsContext
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (connectionId.current) {
      wsContext.closeConnection(connectionId.current);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, [wsContext]);

  // Send message through WebSocket
  const sendMessage = useCallback((type, payload = {}, priority = 'medium') => {
    const message = {
      type,
      payload,
      priority,
      timestamp: new Date().toISOString(),
      sessionId,
      connectionId: connectionId.current
    };

    if (connectionId.current && isConnected) {
      const sent = wsContext.sendMessage(connectionId.current, message);
      if (!sent) {
        // Buffer message if sending failed
        messageBuffer.current.push(message);
      }
      return sent;
    } else {
      // Buffer message if not connected
      messageBuffer.current.push(message);
      console.log(`📤 Message buffered (not connected): ${type}`);
      return false;
    }
  }, [isConnected, sessionId, wsContext]);

  // Subscribe to specific message types
  const subscribe = useCallback((messageType, callback) => {
    const unsubscribe = wsContext.subscribe(messageType, callback);
    messageSubscriptions.current.add(unsubscribe);
    
    // Return cleanup function
    return () => {
      unsubscribe();
      messageSubscriptions.current.delete(unsubscribe);
    };
  }, [wsContext]);

  // Get connection statistics
  const getStats = useCallback(() => {
    if (!connectionId.current) return null;
    
    const status = wsContext.getConnectionStatus(connectionId.current);
    return {
      connectionId: connectionId.current,
      endpoint,
      sessionId,
      isConnected,
      isConnecting,
      state: status.state,
      reconnectAttempts: status.reconnectAttempts,
      lastActivity: status.lastActivity,
      messageHistoryCount: messageHistory.length,
      bufferedMessageCount: messageBuffer.current.length,
      error: error?.message || null
    };
  }, [endpoint, sessionId, isConnected, isConnecting, messageHistory.length, error, wsContext]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      // Unsubscribe from all message subscriptions
      messageSubscriptions.current.forEach(unsubscribe => unsubscribe());
      messageSubscriptions.current.clear();
      
      // Disconnect WebSocket
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Monitor connection state changes
  useEffect(() => {
    const interval = setInterval(updateConnectionState, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionState]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 10000); // Clear error after 10 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Message data
    lastMessage,
    messageHistory,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    subscribe,
    
    // Utilities
    getStats,
    
    // Connection info
    connectionId: connectionId.current,
    endpoint,
    sessionId
  };
};

// Specialized hooks for different connection types

// Dashboard WebSocket connection
export const useDashboardWebSocket = (options = {}) => {
  return useWebSocket('dashboard', {
    autoConnect: true,
    heartbeatInterval: 30000,
    maxReconnectAttempts: 10,
    messageFilters: [
      'session_update',
      'performance_update', 
      'system_alert',
      'notification'
    ],
    ...options
  });
};

// Session-specific WebSocket connection
export const useSessionWebSocket = (sessionId, options = {}) => {
  return useWebSocket('session', {
    sessionId,
    autoConnect: true,
    heartbeatInterval: 15000,
    maxReconnectAttempts: 5,
    messageFilters: [
      'new_message',
      'channel_transfer',
      'customer_activity',
      'routing_recommendation'
    ],
    ...options
  });
};

// Channel-specific WebSocket connection
export const useChannelWebSocket = (channelType, sessionId = null, options = {}) => {
  return useWebSocket(`channel/${channelType}`, {
    sessionId,
    autoConnect: true,
    heartbeatInterval: 10000,
    maxReconnectAttempts: 3,
    messageFilters: [
      'new_message',
      'channel_transfer',
      'customer_activity'
    ],
    ...options
  });
};

// Campaign monitoring WebSocket connection
export const useCampaignWebSocket = (campaignId, options = {}) => {
  return useWebSocket('campaign', {
    sessionId: campaignId,
    autoConnect: true,
    heartbeatInterval: 60000,
    maxReconnectAttempts: 5,
    messageFilters: [
      'campaign_update',
      'performance_update'
    ],
    ...options
  });
};

// Analytics WebSocket connection for real-time metrics
export const useAnalyticsWebSocket = (options = {}) => {
  return useWebSocket('analytics', {
    autoConnect: true,
    heartbeatInterval: 30000,
    maxReconnectAttempts: 5,
    messageFilters: [
      'performance_update',
      'analytics_update'
    ],
    ...options
  });
};

export default useWebSocket;
