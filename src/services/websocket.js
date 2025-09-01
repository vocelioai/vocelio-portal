// ============================================================================
// WEBSOCKET SERVICE - Real-time Communication Hub
// ============================================================================
import { realtimeApi } from './api';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.subscriptions = new Map();
    this.isConnected = false;
    this.messageQueue = [];
  }

  // Initialize WebSocket connection
  connect() {
    try {
      this.ws = realtimeApi.connect();
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  // Setup WebSocket event handlers
  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Process queued messages
      this.processMessageQueue();
      
      // Emit connection event
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.reason);
      this.isConnected = false;
      this.emit('disconnected', event);
      
      if (event.code !== 1000) { // Not a clean close
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    };
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    const { type, payload, channel } = data;
    
    // Route message to appropriate handlers
    if (this.subscriptions.has(type)) {
      const handlers = this.subscriptions.get(type);
      handlers.forEach(handler => handler(payload, data));
    }

    // Handle specific message types
    switch (type) {
      case 'campaign_update':
        this.emit('campaignUpdate', payload);
        break;
      case 'live_call':
        this.emit('liveCall', payload);
        break;
      case 'system_alert':
        this.emit('systemAlert', payload);
        break;
      case 'ai_insight':
        this.emit('aiInsight', payload);
        break;
      default:
        this.emit('message', data);
    }
  }

  // Subscribe to specific message types
  subscribe(type, handler) {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }
    this.subscriptions.get(type).add(handler);

    // Send subscription message to server
    this.send({
      type: 'subscribe',
      channel: type
    });

    // Return unsubscribe function
    return () => this.unsubscribe(type, handler);
  }

  // Unsubscribe from message types
  unsubscribe(type, handler) {
    if (this.subscriptions.has(type)) {
      this.subscriptions.get(type).delete(handler);
      
      if (this.subscriptions.get(type).size === 0) {
        this.subscriptions.delete(type);
        this.send({
          type: 'unsubscribe',
          channel: type
        });
      }
    }
  }

  // Send message through WebSocket
  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue message for later
      this.messageQueue.push(data);
    }
  }

  // Process queued messages
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event emitter functionality
  emit(event, data) {
    window.dispatchEvent(new CustomEvent(`vocilio:ws:${event}`, { detail: data }));
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;
