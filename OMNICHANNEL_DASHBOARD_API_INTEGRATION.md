# 🚀 OMNICHANNEL HUB API ENDPOINTS & DASHBOARD INTEGRATION

## 📅 Date: September 9, 2025
## 🎯 Target: https://app.vocelio.com Dashboard Integration

---

## 🔌 **COMPLETE API ENDPOINTS REFERENCE**

### **Base Configuration**
```typescript
const OMNICHANNEL_CONFIG = {
  baseURL: "https://omnichannel-hub-313373223340.us-central1.run.app",
  websocketURL: "wss://omnichannel-hub-313373223340.us-central1.run.app/ws",
  version: "v1",
  timeout: 30000,
};
```

### **1. SESSION MANAGEMENT ENDPOINTS**

```typescript
// 🔑 Session Creation & Management
POST   /session/create                    // Create unified customer session
GET    /session/{session_id}              // Get session details
PUT    /session/{session_id}              // Update session data
DELETE /session/{session_id}              // End session
GET    /sessions/active                   // List all active sessions
POST   /session/{session_id}/transfer     // Transfer session between channels

// 👤 Customer Management
GET    /customer/{customer_id}/sessions   // Get all customer sessions
GET    /customer/{customer_id}/unified-view  // Unified customer profile
POST   /customer/{customer_id}/context    // Update customer context
GET    /customer/{customer_id}/history    // Complete interaction history
```

### **2. MESSAGE PROCESSING ENDPOINTS**

```typescript
// 💬 Message Operations  
POST   /message/process                   // Process incoming message
POST   /message/respond                   // Send response message
GET    /message/{message_id}              // Get message details
PUT    /message/{message_id}              // Update message status
GET    /session/{session_id}/messages     // Get session message history
POST   /message/bulk-process              // Bulk message processing
```

### **3. CHANNEL MANAGEMENT ENDPOINTS**

```typescript
// 🌐 Channel Operations
GET    /channels/integrations             // List all channel integrations
POST   /channels/{channel}/configure      // Configure channel settings
GET    /channels/{channel}/status         // Get channel health status
POST   /channels/{channel}/test           // Test channel connectivity
PUT    /channels/{channel}/enable         // Enable/disable channel
GET    /channels/performance              // Channel performance metrics

// 🔄 Channel Transfer
POST   /transfer/channel                  // Execute channel transfer
GET    /transfer/{transfer_id}/status     // Get transfer status
POST   /transfer/bulk                     // Bulk channel transfers
```

### **4. INTELLIGENT ROUTING ENDPOINTS**

```typescript
// 🧠 AI-Powered Routing
POST   /intelligent-routing               // Get routing recommendations
POST   /routing/decision                  // Execute routing decision
GET    /routing/rules                     // Get routing rules
PUT    /routing/rules                     // Update routing configuration
POST   /routing/analyze-context           // Analyze customer context for routing
GET    /routing/performance               // Routing performance analytics
```

### **5. CAMPAIGN ORCHESTRATION ENDPOINTS**

```typescript
// 📢 Campaign Management
POST   /campaign/omnichannel-launch       // Launch omnichannel campaign
GET    /campaign/{campaign_id}/status     // Get campaign status
PUT    /campaign/{campaign_id}/pause      // Pause campaign
POST   /campaign/{campaign_id}/resume     // Resume campaign
GET    /campaigns/active                  // List active campaigns
POST   /campaign/audience-segment         // Create audience segment
```

### **6. VOICE & TELEPHONY ENDPOINTS**

```typescript
// 📞 Voice Operations
POST   /voice/initiate-call               // Initiate outbound call
POST   /voice/answer-call                 // Answer incoming call
POST   /voice/transfer-call               // Transfer active call
POST   /voice/hold-call                   // Put call on hold
POST   /voice/resume-call                 // Resume held call
POST   /voice/end-call                    // End active call
GET    /voice/call/{call_id}/status       // Get call status
POST   /voice/conference/create           // Create conference call
```

### **7. VIDEO COMMUNICATION ENDPOINTS**

```typescript
// 🎥 Video Operations
POST   /video/create-room                 // Create video room
POST   /video/join-room                   // Join video room
POST   /video/leave-room                  // Leave video room
POST   /video/share-screen               // Start screen sharing
POST   /video/stop-sharing               // Stop screen sharing
GET    /video/room/{room_id}/participants // Get room participants
POST   /video/record/start               // Start video recording
POST   /video/record/stop                // Stop video recording
```

### **8. CHAT & MESSAGING ENDPOINTS**

```typescript
// 💬 Chat Operations
POST   /chat/create-room                  // Create chat room
POST   /chat/send-message                 // Send chat message
GET    /chat/room/{room_id}/history       // Get chat history
POST   /chat/typing-indicator             // Send typing status
POST   /chat/file-upload                 // Upload file to chat
GET    /chat/room/{room_id}/participants  // Get chat participants
POST   /chat/moderate/message             // Moderate chat message
```

### **9. EMAIL INTEGRATION ENDPOINTS**

```typescript
// 📧 Email Operations
POST   /email/send                        // Send email
GET    /email/{email_id}                  // Get email details
POST   /email/reply                       // Reply to email
POST   /email/forward                     // Forward email
GET    /email/thread/{thread_id}          // Get email thread
POST   /email/template/apply              // Apply email template
GET    /email/inbox                       // Get inbox messages
POST   /email/mark-read                   // Mark email as read
```

### **10. SMS & WHATSAPP ENDPOINTS**

```typescript
// 📱 SMS Operations
POST   /sms/send                          // Send SMS message
GET    /sms/{message_id}/status           // Get SMS delivery status
POST   /sms/bulk-send                     // Send bulk SMS
GET    /sms/inbox                         // Get SMS inbox

// 💚 WhatsApp Operations  
POST   /whatsapp/send-message             // Send WhatsApp message
POST   /whatsapp/send-media               // Send media via WhatsApp
GET    /whatsapp/message/{message_id}     // Get WhatsApp message status
POST   /whatsapp/business-profile         // Update business profile
```

### **11. ANALYTICS & REPORTING ENDPOINTS**

```typescript
// 📊 Analytics Operations
GET    /analytics/dashboard               // Get dashboard analytics
GET    /analytics/channel-performance     // Channel performance data
GET    /analytics/customer-satisfaction   // Customer satisfaction metrics
GET    /analytics/response-time           // Response time analytics
GET    /analytics/resolution-rate         // Issue resolution rate
POST   /analytics/custom-report           // Generate custom report
GET    /analytics/export/{format}         // Export analytics data
```

### **12. REAL-TIME COMMUNICATION ENDPOINTS**

```typescript
// 🔄 WebSocket Connections
WSS    /ws/{session_id}                   // Session-specific WebSocket
WSS    /ws/dashboard                      // Dashboard real-time updates
WSS    /ws/agent/{agent_id}               // Agent-specific updates
WSS    /ws/customer/{customer_id}         // Customer-specific updates

// 🔔 Push Notifications
POST   /notifications/subscribe           // Subscribe to notifications
POST   /notifications/send                // Send push notification
GET    /notifications/history             // Get notification history
PUT    /notifications/preferences         // Update notification preferences
```

### **13. SYSTEM & HEALTH ENDPOINTS**

```typescript
// ⚡ System Operations
GET    /health                            // System health check
GET    /capabilities                      // System capabilities
GET    /version                           // API version info
GET    /status                            // Service status
POST   /diagnostics                       // Run system diagnostics
GET    /metrics                           // System metrics
```

---

## 🎨 **DASHBOARD COMPONENT SPECIFICATIONS**

### **Main Dashboard Layout Structure**

```typescript
// Dashboard Component Hierarchy
OmnichannelDashboard
├── DashboardHeader
│   ├── ConnectionStatus
│   ├── NotificationCenter
│   └── UserProfile
├── NavigationTabs
│   ├── ChannelOverviewTab
│   ├── ActiveSessionsTab  
│   ├── IntelligentRoutingTab
│   ├── CampaignManagementTab
│   └── AnalyticsTab
├── MainContentArea
│   ├── ChannelOverview
│   │   ├── ChannelStatusGrid (8 channels)
│   │   ├── RealTimeActivityFeed
│   │   └── PerformanceMetrics
│   ├── SessionManagement
│   │   ├── ActiveSessionsList
│   │   ├── SessionDetails
│   │   └── ChannelTransferControls
│   ├── IntelligentRouting
│   │   ├── RoutingRules
│   │   ├── AIRecommendations
│   │   └── RoutingAnalytics
│   ├── CampaignOrchestrator
│   │   ├── CampaignBuilder
│   │   ├── ActiveCampaigns
│   │   └── CampaignPerformance
│   └── AnalyticsDashboard
│       ├── KPICards
│       ├── PerformanceCharts
│       └── ReportingTools
└── Sidebar
    ├── CustomerContextPanel
    ├── QuickActions
    └── RecentActivity
```

### **Required Dashboard Features**

```typescript
interface DashboardFeatures {
  // Real-time Updates
  liveUpdates: {
    channelStatus: boolean;
    sessionActivity: boolean; 
    messageFlow: boolean;
    performanceMetrics: boolean;
  };

  // Channel Management
  channelControls: {
    enableDisable: boolean;
    configureSettings: boolean;
    testConnectivity: boolean;
    viewPerformance: boolean;
  };

  // Session Operations  
  sessionManagement: {
    viewActiveSessions: boolean;
    transferChannels: boolean;
    endSessions: boolean;
    viewHistory: boolean;
  };

  // Customer Experience
  customerInterface: {
    unifiedView: boolean;
    interactionTimeline: boolean;
    contextSwitching: boolean;
    preferenceManagement: boolean;
  };

  // Analytics & Reporting
  analytics: {
    realTimeMetrics: boolean;
    historicalReports: boolean;
    customDashboards: boolean;
    exportCapabilities: boolean;
  };

  // Automation
  intelligentFeatures: {
    aiRouting: boolean;
    autoEscalation: boolean;
    predictiveAnalytics: boolean;
    smartNotifications: boolean;
  };
}
```

### **Channel-Specific Dashboard Panels**

```typescript
// Voice Channel Panel
interface VoiceChannelPanel {
  callControls: {
    initiate: boolean;
    answer: boolean;
    hold: boolean;
    transfer: boolean;
    conference: boolean;
    record: boolean;
  };
  
  liveStatus: {
    callQuality: boolean;
    duration: boolean;
    transcription: boolean;
    notes: boolean;
  };
}

// Video Channel Panel  
interface VideoChannelPanel {
  videoControls: {
    startCall: boolean;
    shareScreen: boolean;
    record: boolean;
    participants: boolean;
    chatOverlay: boolean;
  };
  
  qualityMonitoring: {
    bandwidth: boolean;
    latency: boolean;
    resolution: boolean;
    frameRate: boolean;
  };
}

// Chat Channel Panel
interface ChatChannelPanel {
  messaging: {
    sendMessage: boolean;
    fileUpload: boolean;
    emojiReactions: boolean;
    typingIndicators: boolean;
  };
  
  management: {
    moderation: boolean;
    autoResponses: boolean;
    chatbotIntegration: boolean;
    escalationTriggers: boolean;
  };
}

// Email Channel Panel
interface EmailChannelPanel {
  composition: {
    richTextEditor: boolean;
    templates: boolean;
    attachments: boolean;
    scheduling: boolean;
  };
  
  organization: {
    threading: boolean;
    foldering: boolean;
    search: boolean;
    archiving: boolean;
  };
}

// SMS Channel Panel
interface SMSChannelPanel {
  messaging: {
    sendSMS: boolean;
    bulkMessaging: boolean;
    deliveryStatus: boolean;
    shortCodes: boolean;
  };
  
  compliance: {
    optInManagement: boolean;
    stopWordHandling: boolean;
    carrierCompliance: boolean;
    messageFiltering: boolean;
  };
}
```

---

## 🔧 **INTEGRATION CODE TEMPLATES**

### **1. API Service Implementation**

```typescript
// services/OmnichannelAPIService.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class OmnichannelAPIService {
  private api: AxiosInstance;
  private baseURL = 'https://omnichannel-hub-313373223340.us-central1.run.app';
  
  constructor(apiKey?: string) {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor  
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Session Management
  async createSession(sessionData: CreateSessionRequest): Promise<UnifiedSession> {
    const response = await this.api.post('/session/create', sessionData);
    return response.data;
  }

  async getSession(sessionId: string): Promise<UnifiedSession> {
    const response = await this.api.get(`/session/${sessionId}`);
    return response.data;
  }

  async getActiveSessions(): Promise<UnifiedSession[]> {
    const response = await this.api.get('/sessions/active');
    return response.data;
  }

  // Message Processing
  async processMessage(message: ChannelMessage): Promise<ChannelResponse> {
    const response = await this.api.post('/message/process', message);
    return response.data;
  }

  async getMessageHistory(sessionId: string): Promise<MessageHistory> {
    const response = await this.api.get(`/session/${sessionId}/messages`);
    return response.data;
  }

  // Channel Operations
  async getChannelIntegrations(): Promise<ChannelIntegration[]> {
    const response = await this.api.get('/channels/integrations');
    return response.data;
  }

  async transferChannel(transfer: ChannelTransfer): Promise<TransferResult> {
    const response = await this.api.post('/transfer/channel', transfer);
    return response.data;
  }

  // Campaign Management  
  async launchCampaign(campaign: OmnichannelCampaign): Promise<CampaignResult> {
    const response = await this.api.post('/campaign/omnichannel-launch', campaign);
    return response.data;
  }

  // Analytics
  async getChannelPerformance(): Promise<ChannelPerformanceData> {
    const response = await this.api.get('/analytics/channel-performance');
    return response.data;
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await this.api.get('/analytics/dashboard');
    return response.data;
  }

  // Voice Operations
  async initiateCall(callData: VoiceCallRequest): Promise<VoiceCallResponse> {
    const response = await this.api.post('/voice/initiate-call', callData);
    return response.data;
  }

  // Video Operations  
  async createVideoRoom(roomData: VideoRoomRequest): Promise<VideoRoomResponse> {
    const response = await this.api.post('/video/create-room', roomData);
    return response.data;
  }

  // Chat Operations
  async sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
    const response = await this.api.post('/chat/send-message', message);
    return response.data;
  }

  // Email Operations
  async sendEmail(email: EmailRequest): Promise<EmailResponse> {
    const response = await this.api.post('/email/send', email);
    return response.data;
  }

  // SMS Operations
  async sendSMS(sms: SMSRequest): Promise<SMSResponse> {
    const response = await this.api.post('/sms/send', sms);
    return response.data;
  }

  // WhatsApp Operations
  async sendWhatsAppMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    const response = await this.api.post('/whatsapp/send-message', message);
    return response.data;
  }

  // System Operations
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getCapabilities(): Promise<SystemCapabilities> {
    const response = await this.api.get('/capabilities');
    return response.data;
  }
}

// Create singleton instance
export const omnichannelAPI = new OmnichannelAPIService(
  process.env.NEXT_PUBLIC_OMNICHANNEL_API_KEY
);
```

### **2. WebSocket Real-time Integration**

```typescript
// hooks/useOmnichannelWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  addRealtimeUpdate, 
  updateSessionStatus, 
  updateChannelPerformance,
  addNotification 
} from '../store/omnichannelSlice';

export interface WebSocketMessage {
  type: 'session_update' | 'channel_transfer' | 'new_message' | 'routing_recommendation' | 
        'campaign_update' | 'performance_update' | 'system_alert' | 'customer_activity';
  payload: any;
  timestamp: string;
  sessionId?: string;
  customerId?: string;
}

export const useOmnichannelWebSocket = (sessionId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const wsUrl = `wss://omnichannel-hub-313373223340.us-central1.run.app/ws/${sessionId || 'dashboard'}`;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        // Send authentication/identification message
        ws.current?.send(JSON.stringify({
          type: 'auth',
          payload: {
            sessionId,
            timestamp: new Date().toISOString(),
          },
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message);
          
          setLastMessage(message);
          setMessageHistory(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          
          // Dispatch to Redux store based on message type
          switch (message.type) {
            case 'session_update':
              dispatch(updateSessionStatus(message.payload));
              break;
              
            case 'channel_transfer':
              dispatch(addNotification({
                type: 'info',
                title: 'Channel Transfer',
                message: `Customer transferred from ${message.payload.fromChannel} to ${message.payload.toChannel}`,
                timestamp: message.timestamp,
              }));
              break;
              
            case 'new_message':
              dispatch(addRealtimeUpdate(message));
              break;
              
            case 'routing_recommendation':
              dispatch(addNotification({
                type: 'info',
                title: 'AI Routing Recommendation',
                message: message.payload.recommendation,
                timestamp: message.timestamp,
              }));
              break;
              
            case 'performance_update':
              dispatch(updateChannelPerformance(message.payload));
              break;
              
            case 'system_alert':
              dispatch(addNotification({
                type: message.payload.severity || 'warning',
                title: 'System Alert',
                message: message.payload.message,
                timestamp: message.timestamp,
              }));
              break;
              
            case 'customer_activity':
              dispatch(addRealtimeUpdate(message));
              break;
              
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Attempting to reconnect in ${delay}ms...`);
          
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        
        dispatch(addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Lost connection to omnichannel hub',
          timestamp: new Date().toISOString(),
        }));
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [wsUrl, sessionId, dispatch]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User requested disconnect');
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        sessionId,
      } as WebSocketMessage;
      
      ws.current.send(JSON.stringify(fullMessage));
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }
  }, [sessionId]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping/pong for connection health
  useEffect(() => {
    if (!isConnected) return;
    
    const pingInterval = setInterval(() => {
      sendMessage({
        type: 'ping' as any,
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
```

### **3. Redux Store Configuration**

```typescript
// store/omnichannelSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OmnichannelState {
  // Connection Status
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Sessions
  activeSessions: UnifiedSession[];
  selectedSessionId: string | null;
  
  // Channels
  channelIntegrations: ChannelIntegration[];
  channelPerformance: ChannelPerformanceData | null;
  
  // Real-time Updates
  realtimeUpdates: WebSocketMessage[];
  notifications: Notification[];
  
  // UI State
  activeTab: 'overview' | 'sessions' | 'routing' | 'campaigns' | 'analytics';
  selectedCustomerId: string | null;
  
  // Loading States
  isLoading: {
    sessions: boolean;
    channels: boolean;
    analytics: boolean;
    campaigns: boolean;
  };
  
  // Error States
  errors: {
    sessions: string | null;
    channels: string | null;
    analytics: string | null;
    campaigns: string | null;
  };
}

const initialState: OmnichannelState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  activeSessions: [],
  selectedSessionId: null,
  channelIntegrations: [],
  channelPerformance: null,
  realtimeUpdates: [],
  notifications: [],
  activeTab: 'overview',
  selectedCustomerId: null,
  isLoading: {
    sessions: false,
    channels: false,
    analytics: false,
    campaigns: false,
  },
  errors: {
    sessions: null,
    channels: null,
    analytics: null,
    campaigns: null,
  },
};

export const omnichannelSlice = createSlice({
  name: 'omnichannel',
  initialState,
  reducers: {
    // Connection Management
    setConnectionStatus: (state, action: PayloadAction<OmnichannelState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    
    // Session Management
    setActiveSessions: (state, action: PayloadAction<UnifiedSession[]>) => {
      state.activeSessions = action.payload;
    },
    
    addActiveSession: (state, action: PayloadAction<UnifiedSession>) => {
      const existingIndex = state.activeSessions.findIndex(s => s.session_id === action.payload.session_id);
      if (existingIndex >= 0) {
        state.activeSessions[existingIndex] = action.payload;
      } else {
        state.activeSessions.push(action.payload);
      }
    },
    
    removeActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessions = state.activeSessions.filter(s => s.session_id !== action.payload);
    },
    
    updateSessionStatus: (state, action: PayloadAction<any>) => {
      const sessionIndex = state.activeSessions.findIndex(s => s.session_id === action.payload.sessionId);
      if (sessionIndex >= 0) {
        state.activeSessions[sessionIndex] = {
          ...state.activeSessions[sessionIndex],
          ...action.payload,
        };
      }
    },
    
    setSelectedSessionId: (state, action: PayloadAction<string | null>) => {
      state.selectedSessionId = action.payload;
    },
    
    // Channel Management
    setChannelIntegrations: (state, action: PayloadAction<ChannelIntegration[]>) => {
      state.channelIntegrations = action.payload;
    },
    
    updateChannelIntegration: (state, action: PayloadAction<ChannelIntegration>) => {
      const index = state.channelIntegrations.findIndex(c => c.channel_type === action.payload.channel_type);
      if (index >= 0) {
        state.channelIntegrations[index] = action.payload;
      } else {
        state.channelIntegrations.push(action.payload);
      }
    },
    
    setChannelPerformance: (state, action: PayloadAction<ChannelPerformanceData>) => {
      state.channelPerformance = action.payload;
    },
    
    updateChannelPerformance: (state, action: PayloadAction<Partial<ChannelPerformanceData>>) => {
      if (state.channelPerformance) {
        state.channelPerformance = {
          ...state.channelPerformance,
          ...action.payload,
        };
      }
    },
    
    // Real-time Updates
    addRealtimeUpdate: (state, action: PayloadAction<WebSocketMessage>) => {
      state.realtimeUpdates.unshift(action.payload);
      // Keep only last 100 updates
      if (state.realtimeUpdates.length > 100) {
        state.realtimeUpdates = state.realtimeUpdates.slice(0, 100);
      }
    },
    
    clearRealtimeUpdates: (state) => {
      state.realtimeUpdates = [];
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // UI State
    setActiveTab: (state, action: PayloadAction<OmnichannelState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    
    setSelectedCustomerId: (state, action: PayloadAction<string | null>) => {
      state.selectedCustomerId = action.payload;
    },
    
    // Loading States
    setLoading: (state, action: PayloadAction<{ key: keyof OmnichannelState['isLoading']; value: boolean }>) => {
      state.isLoading[action.payload.key] = action.payload.value;
    },
    
    // Error States  
    setError: (state, action: PayloadAction<{ key: keyof OmnichannelState['errors']; error: string | null }>) => {
      state.errors[action.payload.key] = action.payload.error;
    },
    
    clearErrors: (state) => {
      state.errors = {
        sessions: null,
        channels: null,
        analytics: null,
        campaigns: null,
      };
    },
  },
});

export const {
  setConnectionStatus,
  setActiveSessions,
  addActiveSession,
  removeActiveSession,
  updateSessionStatus,
  setSelectedSessionId,
  setChannelIntegrations,
  updateChannelIntegration,
  setChannelPerformance,
  updateChannelPerformance,
  addRealtimeUpdate,
  clearRealtimeUpdates,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setActiveTab,
  setSelectedCustomerId,
  setLoading,
  setError,
  clearErrors,
} = omnichannelSlice.actions;

export default omnichannelSlice.reducer;
```

This comprehensive guide provides all the API endpoints, dashboard components, and integration code you need for your omnichannel hub dashboard integration! 🚀
