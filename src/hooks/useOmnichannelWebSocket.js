import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for managing WebSocket connections to the Omnichannel Hub
 * Provides real-time updates and automatic reconnection
 */
export const useOmnichannelWebSocket = (sessionId = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // WebSocket URL - use dashboard endpoint if no specific session
  const wsUrl = `wss://omnichannel-hub-313373223340.us-central1.run.app/ws/${sessionId || 'dashboard'}`;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('🔌 Omnichannel WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        // Send authentication/identification message
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'auth',
            payload: {
              sessionId,
              timestamp: new Date().toISOString(),
            },
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Omnichannel WebSocket message:', message);
          
          setLastMessage(message);
          setMessageHistory(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 Omnichannel WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Attempting to reconnect omnichannel WebSocket in ${delay}ms...`);
          
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Omnichannel WebSocket error:', error);
        setConnectionStatus('error');
      };
      
    } catch (error) {
      console.error('❌ Failed to create omnichannel WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [wsUrl, sessionId]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User requested disconnect');
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        sessionId,
      };
      
      ws.current.send(JSON.stringify(fullMessage));
      return true;
    } else {
      console.warn('⚠️ Omnichannel WebSocket not connected, cannot send message');
      return false;
    }
  }, [sessionId]);

  // Auto-connect on mount
  useEffect(() => {
    // Small delay to allow other components to initialize
    const timer = setTimeout(() => {
      connect();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping/pong for connection health
  useEffect(() => {
    if (!isConnected) return;
    
    const pingInterval = setInterval(() => {
      sendMessage({
        type: 'ping',
        payload: { timestamp: new Date().toISOString() },
      });
    }, 30000); // Ping every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    sendMessage,
    connect,
    disconnect,
  };
};
