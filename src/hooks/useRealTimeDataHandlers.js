import { useEffect, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useWebSocketContext } from '../providers/WebSocketProvider';

// ===== COPILOT PROMPT #4: Real-time Data Handlers =====
// Comprehensive message handling system for WebSocket messages

// Message handler utilities
const createMessageHandler = (type, handler) => {
  return {
    type,
    handler: (message) => {
      try {
        return handler(message);
      } catch (error) {
        console.error(`Error handling ${type} message:`, error);
        return null;
      }
    }
  };
};

// Session Update Handler
export const useSessionUpdateHandler = (onSessionUpdate) => {
  const wsContext = useWebSocketContext();

  useEffect(() => {
    const handler = createMessageHandler('session_update', (message) => {
      const { payload } = message;
      
      console.log('📋 Session Update:', payload);
      
      // Process session update
      const sessionData = {
        sessionId: payload.sessionId,
        customerId: payload.customerId,
        channelType: payload.channelType,
        status: payload.status,
        agentId: payload.agentId,
        startTime: payload.startTime,
        lastActivity: payload.lastActivity,
        metadata: payload.metadata || {},
        updated: Date.now()
      };

      onSessionUpdate?.(sessionData);
      return sessionData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.SESSION_UPDATE, handler.handler);
    return unsubscribe;
  }, [wsContext, onSessionUpdate]);
};

// Channel Transfer Handler
export const useChannelTransferHandler = (onChannelTransfer) => {
  const wsContext = useWebSocketContext();
  const [transferHistory, setTransferHistory] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('channel_transfer', (message) => {
      const { payload } = message;
      
      console.log('🔄 Channel Transfer:', payload);
      
      const transferData = {
        sessionId: payload.sessionId,
        customerId: payload.customerId,
        fromChannel: payload.fromChannel,
        toChannel: payload.toChannel,
        fromAgent: payload.fromAgent,
        toAgent: payload.toAgent,
        reason: payload.reason,
        contextData: payload.contextData || {},
        timestamp: message.timestamp,
        transferId: payload.transferId || `transfer_${Date.now()}`
      };

      // Add to transfer history
      setTransferHistory(prev => [...prev.slice(-49), transferData]); // Keep last 50 transfers

      onChannelTransfer?.(transferData);
      return transferData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.CHANNEL_TRANSFER, handler.handler);
    return unsubscribe;
  }, [wsContext, onChannelTransfer]);

  return { transferHistory };
};

// New Message Handler
export const useNewMessageHandler = (onNewMessage) => {
  const wsContext = useWebSocketContext();
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('new_message', (message) => {
      const { payload } = message;
      
      console.log('💬 New Message:', payload);
      
      const messageData = {
        messageId: payload.messageId,
        sessionId: payload.sessionId,
        customerId: payload.customerId,
        channelType: payload.channelType,
        content: payload.content,
        messageType: payload.messageType, // text, image, file, etc.
        sender: payload.sender, // customer, agent, system
        timestamp: message.timestamp,
        metadata: payload.metadata || {},
        attachments: payload.attachments || [],
        isRead: false,
        priority: message.priority || 'medium'
      };

      // Add to recent messages (last 100 messages)
      setRecentMessages(prev => [...prev.slice(-99), messageData]);

      onNewMessage?.(messageData);
      return messageData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.NEW_MESSAGE, handler.handler);
    return unsubscribe;
  }, [wsContext, onNewMessage]);

  return { recentMessages };
};

// Routing Recommendation Handler
export const useRoutingRecommendationHandler = (onRoutingRecommendation) => {
  const wsContext = useWebSocketContext();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('routing_recommendation', (message) => {
      const { payload } = message;
      
      console.log('🎯 Routing Recommendation:', payload);
      
      const recommendationData = {
        recommendationId: payload.recommendationId,
        sessionId: payload.sessionId,
        customerId: payload.customerId,
        currentChannel: payload.currentChannel,
        recommendedChannel: payload.recommendedChannel,
        recommendedAgent: payload.recommendedAgent,
        confidence: payload.confidence,
        reasoning: payload.reasoning,
        factors: payload.factors || [],
        timestamp: message.timestamp,
        status: 'pending', // pending, accepted, rejected
        aiModel: payload.aiModel || 'default'
      };

      // Add to recommendations (keep last 20)
      setRecommendations(prev => [...prev.slice(-19), recommendationData]);

      onRoutingRecommendation?.(recommendationData);
      return recommendationData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.ROUTING_RECOMMENDATION, handler.handler);
    return unsubscribe;
  }, [wsContext, onRoutingRecommendation]);

  const acceptRecommendation = useCallback((recommendationId) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.recommendationId === recommendationId 
          ? { ...rec, status: 'accepted', acceptedAt: Date.now() }
          : rec
      )
    );
  }, []);

  const rejectRecommendation = useCallback((recommendationId, reason = '') => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.recommendationId === recommendationId 
          ? { ...rec, status: 'rejected', rejectedAt: Date.now(), rejectionReason: reason }
          : rec
      )
    );
  }, []);

  return { recommendations, acceptRecommendation, rejectRecommendation };
};

// Performance Update Handler
export const usePerformanceUpdateHandler = (onPerformanceUpdate) => {
  const wsContext = useWebSocketContext();
  const [performanceData, setPerformanceData] = useState({
    metrics: {},
    trends: {},
    lastUpdated: null
  });

  useEffect(() => {
    const handler = createMessageHandler('performance_update', (message) => {
      const { payload } = message;
      
      console.log('📈 Performance Update:', payload);
      
      const perfData = {
        timestamp: message.timestamp,
        metrics: {
          responseTime: payload.responseTime || 0,
          resolutionRate: payload.resolutionRate || 0,
          customerSatisfaction: payload.customerSatisfaction || 0,
          activeSessions: payload.activeeSessions || 0,
          queueLength: payload.queueLength || 0,
          agentUtilization: payload.agentUtilization || 0,
          ...payload.metrics
        },
        channelMetrics: payload.channelMetrics || {},
        trends: payload.trends || {},
        period: payload.period || '1h'
      };

      setPerformanceData({
        metrics: perfData.metrics,
        channelMetrics: perfData.channelMetrics,
        trends: perfData.trends,
        lastUpdated: perfData.timestamp
      });

      onPerformanceUpdate?.(perfData);
      return perfData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.PERFORMANCE_UPDATE, handler.handler);
    return unsubscribe;
  }, [wsContext, onPerformanceUpdate]);

  return { performanceData };
};

// System Alert Handler
export const useSystemAlertHandler = (onSystemAlert) => {
  const wsContext = useWebSocketContext();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('system_alert', (message) => {
      const { payload } = message;
      
      console.log('🚨 System Alert:', payload);
      
      const alertData = {
        alertId: payload.alertId || `alert_${Date.now()}`,
        type: payload.type, // info, warning, error, critical
        category: payload.category, // system, security, performance, maintenance
        title: payload.title,
        message: payload.message,
        severity: payload.severity || 'medium',
        timestamp: message.timestamp,
        source: payload.source,
        metadata: payload.metadata || {},
        acknowledged: false,
        resolved: false
      };

      setAlerts(prev => [alertData, ...prev.slice(0, 99)]); // Keep last 100 alerts

      onSystemAlert?.(alertData);
      return alertData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.SYSTEM_ALERT, handler.handler);
    return unsubscribe;
  }, [wsContext, onSystemAlert]);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.alertId === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: Date.now() }
          : alert
      )
    );
  }, []);

  const resolveAlert = useCallback((alertId, resolution = '') => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.alertId === alertId 
          ? { ...alert, resolved: true, resolvedAt: Date.now(), resolution }
          : alert
      )
    );
  }, []);

  return { alerts, acknowledgeAlert, resolveAlert };
};

// Customer Activity Handler
export const useCustomerActivityHandler = (onCustomerActivity) => {
  const wsContext = useWebSocketContext();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('customer_activity', (message) => {
      const { payload } = message;
      
      console.log('👤 Customer Activity:', payload);
      
      const activityData = {
        activityId: payload.activityId || `activity_${Date.now()}`,
        customerId: payload.customerId,
        sessionId: payload.sessionId,
        channelType: payload.channelType,
        activityType: payload.activityType, // page_view, click, message, call, etc.
        description: payload.description,
        metadata: payload.metadata || {},
        timestamp: message.timestamp,
        duration: payload.duration,
        location: payload.location
      };

      setActivities(prev => [...prev.slice(-199), activityData]); // Keep last 200 activities

      onCustomerActivity?.(activityData);
      return activityData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.CUSTOMER_ACTIVITY, handler.handler);
    return unsubscribe;
  }, [wsContext, onCustomerActivity]);

  return { activities };
};

// Agent Status Handler
export const useAgentStatusHandler = (onAgentStatus) => {
  const wsContext = useWebSocketContext();
  const [agentStatuses, setAgentStatuses] = useState(new Map());

  useEffect(() => {
    const handler = createMessageHandler('agent_status', (message) => {
      const { payload } = message;
      
      console.log('👨‍💼 Agent Status:', payload);
      
      const statusData = {
        agentId: payload.agentId,
        status: payload.status, // online, offline, busy, away, break
        availability: payload.availability,
        activesSessions: payload.activeSessions || 0,
        skills: payload.skills || [],
        channels: payload.channels || [],
        lastActivity: payload.lastActivity || message.timestamp,
        metadata: payload.metadata || {}
      };

      setAgentStatuses(prev => new Map(prev.set(payload.agentId, statusData)));

      onAgentStatus?.(statusData);
      return statusData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.AGENT_STATUS, handler.handler);
    return unsubscribe;
  }, [wsContext, onAgentStatus]);

  return { agentStatuses };
};

// Campaign Update Handler
export const useCampaignUpdateHandler = (onCampaignUpdate) => {
  const wsContext = useWebSocketContext();
  const [campaignStatuses, setCampaignStatuses] = useState(new Map());

  useEffect(() => {
    const handler = createMessageHandler('campaign_update', (message) => {
      const { payload } = message;
      
      console.log('📢 Campaign Update:', payload);
      
      const campaignData = {
        campaignId: payload.campaignId,
        name: payload.name,
        status: payload.status, // draft, scheduled, running, paused, completed, cancelled
        progress: payload.progress || {},
        metrics: payload.metrics || {},
        performance: payload.performance || {},
        timestamp: message.timestamp,
        nextAction: payload.nextAction,
        issues: payload.issues || []
      };

      setCampaignStatuses(prev => new Map(prev.set(payload.campaignId, campaignData)));

      onCampaignUpdate?.(campaignData);
      return campaignData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.CAMPAIGN_UPDATE, handler.handler);
    return unsubscribe;
  }, [wsContext, onCampaignUpdate]);

  return { campaignStatuses };
};

// Notification Handler
export const useNotificationHandler = (onNotification) => {
  const wsContext = useWebSocketContext();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handler = createMessageHandler('notification', (message) => {
      const { payload } = message;
      
      console.log('🔔 Notification:', payload);
      
      const notificationData = {
        notificationId: payload.notificationId || `notification_${Date.now()}`,
        type: payload.type, // success, info, warning, error
        title: payload.title,
        message: payload.message,
        priority: message.priority || 'medium',
        timestamp: message.timestamp,
        actions: payload.actions || [],
        autoExpire: payload.autoExpire !== false,
        expireTime: payload.expireTime || 5000,
        read: false,
        category: payload.category
      };

      setNotifications(prev => [notificationData, ...prev.slice(0, 49)]); // Keep last 50 notifications

      onNotification?.(notificationData);
      return notificationData;
    });

    const unsubscribe = wsContext.subscribe(wsContext.MESSAGE_TYPES.NOTIFICATION, handler.handler);
    return unsubscribe;
  }, [wsContext, onNotification]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.notificationId === notificationId 
          ? { ...notif, read: true, readAt: Date.now() }
          : notif
      )
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.notificationId !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { 
    notifications, 
    markAsRead, 
    clearNotification, 
    clearAllNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

// Comprehensive Real-Time Data Manager Hook
export const useRealTimeDataManager = (handlers = {}) => {
  const sessionUpdates = useSessionUpdateHandler(handlers.onSessionUpdate);
  const { transferHistory } = useChannelTransferHandler(handlers.onChannelTransfer);
  const { recentMessages } = useNewMessageHandler(handlers.onNewMessage);
  const { recommendations, acceptRecommendation, rejectRecommendation } = useRoutingRecommendationHandler(handlers.onRoutingRecommendation);
  const { performanceData } = usePerformanceUpdateHandler(handlers.onPerformanceUpdate);
  const { alerts, acknowledgeAlert, resolveAlert } = useSystemAlertHandler(handlers.onSystemAlert);
  const { activities } = useCustomerActivityHandler(handlers.onCustomerActivity);
  const { agentStatuses } = useAgentStatusHandler(handlers.onAgentStatus);
  const { campaignStatuses } = useCampaignUpdateHandler(handlers.onCampaignUpdate);
  const { notifications, markAsRead, clearNotification, clearAllNotifications, unreadCount } = useNotificationHandler(handlers.onNotification);

  return {
    // Data
    transferHistory,
    recentMessages,
    recommendations,
    performanceData,
    alerts,
    activities,
    agentStatuses,
    campaignStatuses,
    notifications,
    
    // Actions
    acceptRecommendation,
    rejectRecommendation,
    acknowledgeAlert,
    resolveAlert,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    
    // Computed
    unreadNotifications: unreadCount,
    unacknowledgedAlerts: alerts.filter(alert => !alert.acknowledged).length,
    activeRecommendations: recommendations.filter(rec => rec.status === 'pending').length
  };
};

export default useRealTimeDataManager;
