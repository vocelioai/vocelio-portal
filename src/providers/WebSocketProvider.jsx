import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

// ===== COPILOT PROMPT #4: WebSocket Provider =====
// Context provider for WebSocket connections across the app

// WebSocket message types interface
const MESSAGE_TYPES = {
  SESSION_UPDATE: 'session_update',
  CHANNEL_TRANSFER: 'channel_transfer',
  NEW_MESSAGE: 'new_message',
  ROUTING_RECOMMENDATION: 'routing_recommendation',
  CAMPAIGN_UPDATE: 'campaign_update',
  PERFORMANCE_UPDATE: 'performance_update',
  SYSTEM_ALERT: 'system_alert',
  CUSTOMER_ACTIVITY: 'customer_activity',
  AGENT_STATUS: 'agent_status',
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
  ERROR: 'error'
};

// Connection states
const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
};

// Initial state
const initialState = {
  connections: new Map(),
  connectionStates: new Map(),
  messageQueue: [],
  subscribers: new Map(),
  heartbeatIntervals: new Map(),
  reconnectAttempts: new Map(),
  lastActivity: new Map()
};

// WebSocket reducer
const webSocketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionStates: new Map(state.connectionStates.set(action.connectionId, action.connectionState))
      };

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: new Map(state.connections.set(action.connectionId, action.connection)),
        reconnectAttempts: new Map(state.reconnectAttempts.set(action.connectionId, 0))
      };

    case 'REMOVE_CONNECTION':
      const newConnections = new Map(state.connections);
      const newStates = new Map(state.connectionStates);
      const newHeartbeats = new Map(state.heartbeatIntervals);
      const newAttempts = new Map(state.reconnectAttempts);
      const newActivity = new Map(state.lastActivity);
      
      newConnections.delete(action.connectionId);
      newStates.delete(action.connectionId);
      newHeartbeats.delete(action.connectionId);
      newAttempts.delete(action.connectionId);
      newActivity.delete(action.connectionId);

      return {
        ...state,
        connections: newConnections,
        connectionStates: newStates,
        heartbeatIntervals: newHeartbeats,
        reconnectAttempts: newAttempts,
        lastActivity: newActivity
      };

    case 'QUEUE_MESSAGE':
      return {
        ...state,
        messageQueue: [...state.messageQueue, action.message]
      };

    case 'CLEAR_MESSAGE_QUEUE':
      return {
        ...state,
        messageQueue: []
      };

    case 'ADD_SUBSCRIBER':
      const currentSubscribers = state.subscribers.get(action.messageType) || new Set();
      return {
        ...state,
        subscribers: new Map(state.subscribers.set(action.messageType, new Set([...currentSubscribers, action.callback])))
      };

    case 'REMOVE_SUBSCRIBER':
      const existingSubscribers = state.subscribers.get(action.messageType) || new Set();
      existingSubscribers.delete(action.callback);
      return {
        ...state,
        subscribers: new Map(state.subscribers.set(action.messageType, existingSubscribers))
      };

    case 'SET_HEARTBEAT_INTERVAL':
      return {
        ...state,
        heartbeatIntervals: new Map(state.heartbeatIntervals.set(action.connectionId, action.interval))
      };

    case 'INCREMENT_RECONNECT_ATTEMPTS':
      const currentAttempts = state.reconnectAttempts.get(action.connectionId) || 0;
      return {
        ...state,
        reconnectAttempts: new Map(state.reconnectAttempts.set(action.connectionId, currentAttempts + 1))
      };

    case 'RESET_RECONNECT_ATTEMPTS':
      return {
        ...state,
        reconnectAttempts: new Map(state.reconnectAttempts.set(action.connectionId, 0))
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: new Map(state.lastActivity.set(action.connectionId, Date.now()))
      };

    default:
      return state;
  }
};

// WebSocket Context
const WebSocketContext = createContext(null);

// WebSocket Provider Component
export const WebSocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(webSocketReducer, initialState);
  const reconnectTimeouts = useRef(new Map());

  // Base WebSocket URL
  const getWebSocketURL = useCallback((endpoint, sessionId) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://omnichannel-hub-313373223340.us-central1.run.app'
      : 'ws://localhost:3001';
    
    if (sessionId) {
      return `${baseUrl}/ws/${endpoint}/${sessionId}`;
    }
    return `${baseUrl}/ws/${endpoint}`;
  }, []);

  // Create WebSocket connection
  const createConnection = useCallback((connectionId, endpoint, sessionId, options = {}) => {
    const {
      maxReconnectAttempts = 5,
      reconnectInterval = 1000,
      heartbeatInterval = 30000,
      onMessage,
      onConnect,
      onDisconnect,
      onError
    } = options;

    const url = getWebSocketURL(endpoint, sessionId);
    
    console.log(`🔌 Creating WebSocket connection: ${connectionId} -> ${url}`);
    
    try {
      const ws = new WebSocket(url);
      
      dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.CONNECTING });

      ws.onopen = (event) => {
        console.log(`✅ WebSocket connected: ${connectionId}`);
        dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.CONNECTED });
        dispatch({ type: 'RESET_RECONNECT_ATTEMPTS', connectionId });
        dispatch({ type: 'UPDATE_LAST_ACTIVITY', connectionId });
        
        // Clear any existing reconnect timeout
        if (reconnectTimeouts.current.has(connectionId)) {
          clearTimeout(reconnectTimeouts.current.get(connectionId));
          reconnectTimeouts.current.delete(connectionId);
        }

        // Set up heartbeat
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: MESSAGE_TYPES.HEARTBEAT, timestamp: new Date().toISOString() }));
            dispatch({ type: 'UPDATE_LAST_ACTIVITY', connectionId });
          }
        }, heartbeatInterval);
        
        dispatch({ type: 'SET_HEARTBEAT_INTERVAL', connectionId, interval: heartbeat });

        // Send queued messages
        if (state.messageQueue.length > 0) {
          state.messageQueue.forEach(message => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(message));
            }
          });
          dispatch({ type: 'CLEAR_MESSAGE_QUEUE' });
        }

        onConnect?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          dispatch({ type: 'UPDATE_LAST_ACTIVITY', connectionId });

          // Handle heartbeat responses
          if (data.type === MESSAGE_TYPES.HEARTBEAT) {
            return;
          }

          // Notify subscribers
          const subscribers = state.subscribers.get(data.type) || new Set();
          subscribers.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error('Error in WebSocket message subscriber:', error);
            }
          });

          // Global message handler
          onMessage?.(data);

        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected: ${connectionId}`, event.code, event.reason);
        
        // Clear heartbeat interval
        const heartbeatInterval = state.heartbeatIntervals.get(connectionId);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }

        dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.DISCONNECTED });
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && event.code !== 1001) {
          const attempts = state.reconnectAttempts.get(connectionId) || 0;
          if (attempts < maxReconnectAttempts) {
            dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.RECONNECTING });
            dispatch({ type: 'INCREMENT_RECONNECT_ATTEMPTS', connectionId });
            
            const timeout = setTimeout(() => {
              createConnection(connectionId, endpoint, sessionId, options);
            }, reconnectInterval * Math.pow(2, attempts)); // Exponential backoff
            
            reconnectTimeouts.current.set(connectionId, timeout);
          } else {
            console.error(`❌ Max reconnection attempts reached for: ${connectionId}`);
            dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.ERROR });
          }
        }

        onDisconnect?.(event);
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error: ${connectionId}`, error);
        dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.ERROR });
        onError?.(error);
      };

      dispatch({ type: 'ADD_CONNECTION', connectionId, connection: ws });

      return ws;
    } catch (error) {
      console.error(`❌ Failed to create WebSocket connection: ${connectionId}`, error);
      dispatch({ type: 'SET_CONNECTION_STATE', connectionId, connectionState: CONNECTION_STATES.ERROR });
      return null;
    }
  }, [getWebSocketURL, state.messageQueue, state.heartbeatIntervals, state.reconnectAttempts, state.subscribers]);

  // Send message through WebSocket
  const sendMessage = useCallback((connectionId, message) => {
    const connection = state.connections.get(connectionId);
    const connectionState = state.connectionStates.get(connectionId);
    
    if (connection && connectionState === CONNECTION_STATES.CONNECTED) {
      try {
        connection.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
          connectionId
        }));
        dispatch({ type: 'UPDATE_LAST_ACTIVITY', connectionId });
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      // Queue message for later delivery
      dispatch({ type: 'QUEUE_MESSAGE', message: { ...message, connectionId } });
      console.log(`📤 Message queued for ${connectionId}:`, message.type);
      return false;
    }
  }, [state.connections, state.connectionStates]);

  // Subscribe to message types
  const subscribe = useCallback((messageType, callback) => {
    dispatch({ type: 'ADD_SUBSCRIBER', messageType, callback });
    
    // Return unsubscribe function
    return () => {
      dispatch({ type: 'REMOVE_SUBSCRIBER', messageType, callback });
    };
  }, []);

  // Close connection
  const closeConnection = useCallback((connectionId) => {
    const connection = state.connections.get(connectionId);
    const heartbeatInterval = state.heartbeatIntervals.get(connectionId);
    
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    
    if (reconnectTimeouts.current.has(connectionId)) {
      clearTimeout(reconnectTimeouts.current.get(connectionId));
      reconnectTimeouts.current.delete(connectionId);
    }
    
    if (connection) {
      connection.close(1000, 'Manual disconnect');
    }
    
    dispatch({ type: 'REMOVE_CONNECTION', connectionId });
  }, [state.connections, state.heartbeatIntervals]);

  // Get connection status
  const getConnectionStatus = useCallback((connectionId) => {
    return {
      state: state.connectionStates.get(connectionId) || CONNECTION_STATES.DISCONNECTED,
      reconnectAttempts: state.reconnectAttempts.get(connectionId) || 0,
      lastActivity: state.lastActivity.get(connectionId) || null
    };
  }, [state.connectionStates, state.reconnectAttempts, state.lastActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close all connections
      state.connections.forEach((connection, connectionId) => {
        closeConnection(connectionId);
      });
      
      // Clear all timeouts
      reconnectTimeouts.current.forEach(timeout => clearTimeout(timeout));
      reconnectTimeouts.current.clear();
    };
  }, [closeConnection, state.connections]);

  const contextValue = {
    // State
    connections: state.connections,
    connectionStates: state.connectionStates,
    messageQueue: state.messageQueue,
    
    // Actions
    createConnection,
    sendMessage,
    subscribe,
    closeConnection,
    getConnectionStatus,
    
    // Constants
    MESSAGE_TYPES,
    CONNECTION_STATES
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
