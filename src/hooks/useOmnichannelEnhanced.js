// ===== COPILOT PROMPT #2: Advanced Custom Hooks =====
// Enhanced custom hooks for omnichannel operations
// Includes error handling, caching, and real-time sync

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetChannelIntegrationsQuery,
  useGetActiveSessionsQuery,
  useGetDashboardAnalyticsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useTransferSessionMutation,
  useGetSystemHealthQuery,
  useGetNotificationsQuery,
} from '../store/omnichannelApiSlice';

// ===== ENHANCED CHANNEL MANAGEMENT HOOK =====
export const useOmnichannelChannels = (options = {}) => {
  const { 
    autoRefresh = true, 
    refreshInterval = 30000,
    includeInactive = false 
  } = options;

  const {
    data: channels = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetChannelIntegrationsQuery(undefined, {
    pollingInterval: autoRefresh ? refreshInterval : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Enhanced channel filtering and processing
  const processedChannels = useMemo(() => {
    if (!Array.isArray(channels)) return [];
    
    let filtered = channels;
    if (!includeInactive) {
      filtered = channels.filter(channel => channel.status !== 'inactive');
    }
    
    // Add computed properties
    return filtered.map(channel => ({
      ...channel,
      isHealthy: channel.status === 'active',
      hasWarnings: channel.status === 'warning',
      responseTime: channel.metrics?.responseTime || 0,
      successRate: channel.metrics?.successRate || 0,
    }));
  }, [channels, includeInactive]);

  // Channel statistics
  const channelStats = useMemo(() => ({
    total: processedChannels.length,
    active: processedChannels.filter(c => c.status === 'active').length,
    warning: processedChannels.filter(c => c.status === 'warning').length,
    inactive: processedChannels.filter(c => c.status === 'inactive').length,
    averageResponseTime: processedChannels.reduce((acc, c) => acc + (c.responseTime || 0), 0) / processedChannels.length || 0,
  }), [processedChannels]);

  // Enhanced error handling
  const errorInfo = useMemo(() => {
    if (!error) return null;
    
    return {
      type: error.status >= 500 ? 'server' : 'client',
      message: error.data?.message || error.message || 'Failed to load channels',
      retryable: error.status !== 401 && error.status !== 403,
      details: error.data?.details || null,
    };
  }, [error]);

  return {
    channels: processedChannels,
    stats: channelStats,
    isLoading,
    isFetching,
    error: errorInfo,
    refetch,
    // Utility functions
    getChannelByType: useCallback((type) => 
      processedChannels.find(c => c.type === type), [processedChannels]),
    getActiveChannels: useCallback(() => 
      processedChannels.filter(c => c.status === 'active'), [processedChannels]),
    getChannelsByStatus: useCallback((status) => 
      processedChannels.filter(c => c.status === status), [processedChannels]),
  };
};

// ===== ENHANCED SESSION MANAGEMENT HOOK =====
export const useOmnichannelSessions = (options = {}) => {
  const { 
    autoRefresh = true,
    includeCompleted = false,
    maxSessions = 100 
  } = options;

  const {
    data: sessions = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetActiveSessionsQuery(undefined, {
    pollingInterval: autoRefresh ? 15000 : 0, // 15 second refresh for active sessions
    refetchOnMountOrArgChange: true,
  });

  const [createSession, createSessionResult] = useCreateSessionMutation();
  const [updateSession, updateSessionResult] = useUpdateSessionMutation();
  const [transferSession, transferSessionResult] = useTransferSessionMutation();

  // Enhanced session processing
  const processedSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    
    let filtered = sessions.slice(0, maxSessions);
    if (!includeCompleted) {
      filtered = filtered.filter(session => session.status === 'active');
    }
    
    // Add computed properties and sort by priority
    return filtered
      .map(session => ({
        ...session,
        duration: calculateDuration(session.created_at),
        priority: calculatePriority(session),
        isLongRunning: calculateDuration(session.created_at) > 1800000, // > 30 minutes
        channelIcon: getChannelIcon(session.channel_type),
      }))
      .sort((a, b) => b.priority - a.priority);
  }, [sessions, includeCompleted, maxSessions]);

  // Session statistics
  const sessionStats = useMemo(() => ({
    total: processedSessions.length,
    byChannel: processedSessions.reduce((acc, session) => {
      acc[session.channel_type] = (acc[session.channel_type] || 0) + 1;
      return acc;
    }, {}),
    averageDuration: processedSessions.reduce((acc, s) => acc + s.duration, 0) / processedSessions.length || 0,
    longRunningSessions: processedSessions.filter(s => s.isLongRunning).length,
  }), [processedSessions]);

  // Enhanced session operations
  const sessionOperations = {
    create: useCallback(async (sessionData) => {
      try {
        const result = await createSession(sessionData).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error.data?.message || 'Failed to create session' 
        };
      }
    }, [createSession]),

    update: useCallback(async (sessionId, updates) => {
      try {
        const result = await updateSession({ sessionId, updates }).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error.data?.message || 'Failed to update session' 
        };
      }
    }, [updateSession]),

    transfer: useCallback(async (sessionId, fromChannel, toChannel, transferData = {}) => {
      try {
        const result = await transferSession({ 
          sessionId, 
          fromChannel, 
          toChannel, 
          transferData 
        }).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error.data?.message || 'Failed to transfer session' 
        };
      }
    }, [transferSession]),
  };

  return {
    sessions: processedSessions,
    stats: sessionStats,
    isLoading,
    isFetching,
    error,
    refetch,
    operations: sessionOperations,
    operationStates: {
      creating: createSessionResult.isLoading,
      updating: updateSessionResult.isLoading,
      transferring: transferSessionResult.isLoading,
    },
    // Utility functions
    getSessionById: useCallback((sessionId) => 
      processedSessions.find(s => s.session_id === sessionId), [processedSessions]),
    getSessionsByChannel: useCallback((channelType) => 
      processedSessions.filter(s => s.channel_type === channelType), [processedSessions]),
    getLongRunningSessions: useCallback(() => 
      processedSessions.filter(s => s.isLongRunning), [processedSessions]),
  };
};

// ===== ENHANCED ANALYTICS HOOK =====
export const useOmnichannelAnalytics = (timeRange = '24h') => {
  const {
    data: analytics,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetDashboardAnalyticsQuery(timeRange, {
    pollingInterval: 60000, // 1 minute refresh
    refetchOnMountOrArgChange: true,
  });

  // Enhanced analytics processing
  const processedAnalytics = useMemo(() => {
    const defaultAnalytics = {
      totalSessions: 0,
      activeChannels: 0,
      responseTime: 0,
      satisfactionScore: 0,
      channelMetrics: {},
      trends: [],
      performance: {
        improvement: 0,
        trend: 'stable'
      }
    };

    if (!analytics) return defaultAnalytics;

    // Calculate performance improvements
    const performance = {
      improvement: analytics.improvement || 0,
      trend: analytics.improvement > 5 ? 'up' : analytics.improvement < -5 ? 'down' : 'stable'
    };

    return {
      ...defaultAnalytics,
      ...analytics,
      performance,
      // Add computed metrics
      efficiency: calculateEfficiency(analytics),
      healthScore: calculateHealthScore(analytics),
    };
  }, [analytics]);

  return {
    analytics: processedAnalytics,
    isLoading,
    isFetching,
    error,
    refetch,
    // Utility functions
    getChannelMetric: useCallback((channel, metric) => 
      processedAnalytics.channelMetrics?.[channel]?.[metric] || 0, [processedAnalytics]),
    getPerformanceTrend: useCallback(() => 
      processedAnalytics.performance.trend, [processedAnalytics]),
  };
};

// ===== ENHANCED SYSTEM HEALTH HOOK =====
export const useSystemHealth = () => {
  const {
    data: healthData,
    error,
    isLoading,
    refetch,
  } = useGetSystemHealthQuery(undefined, {
    pollingInterval: 60000, // 1 minute refresh
    refetchOnMountOrArgChange: true,
  });

  const [healthHistory, setHealthHistory] = useState([]);
  const prevHealthRef = useRef(null);

  // Track health history
  useEffect(() => {
    if (healthData && healthData !== prevHealthRef.current) {
      setHealthHistory(prev => [...prev.slice(-9), {
        ...healthData,
        timestamp: Date.now()
      }]);
      prevHealthRef.current = healthData;
    }
  }, [healthData]);

  // Enhanced health analysis
  const healthAnalysis = useMemo(() => {
    if (!healthData) return null;

    const isHealthy = healthData.status === 'healthy';
    const serviceCount = Object.keys(healthData.services || {}).length;
    const healthyServices = Object.values(healthData.services || {})
      .filter(service => service.status === 'healthy').length;

    return {
      overall: isHealthy,
      serviceHealth: serviceCount > 0 ? (healthyServices / serviceCount) * 100 : 0,
      uptime: healthData.uptime || 0,
      issues: Object.entries(healthData.services || {})
        .filter(([, service]) => service.status !== 'healthy')
        .map(([name, service]) => ({ name, status: service.status })),
      trend: calculateHealthTrend(healthHistory),
    };
  }, [healthData, healthHistory]);

  return {
    health: healthData,
    analysis: healthAnalysis,
    history: healthHistory,
    isLoading,
    error,
    refetch,
  };
};

// ===== ENHANCED NOTIFICATIONS HOOK =====
export const useOmnichannelNotifications = (options = {}) => {
  const { limit = 20, unreadOnly = false } = options;

  const {
    data: notifications = [],
    error,
    isLoading,
    refetch,
  } = useGetNotificationsQuery({ limit, unreadOnly }, {
    pollingInterval: 10000, // 10 second refresh
    refetchOnMountOrArgChange: true,
  });

  const processedNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    
    return notifications.map(notification => ({
      ...notification,
      isRecent: Date.now() - new Date(notification.created_at).getTime() < 300000, // 5 minutes
      priority: notification.priority || 'normal',
      icon: getNotificationIcon(notification.type),
    }));
  }, [notifications]);

  const notificationStats = useMemo(() => ({
    total: processedNotifications.length,
    unread: processedNotifications.filter(n => !n.read).length,
    recent: processedNotifications.filter(n => n.isRecent).length,
    byPriority: processedNotifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {}),
  }), [processedNotifications]);

  return {
    notifications: processedNotifications,
    stats: notificationStats,
    isLoading,
    error,
    refetch,
  };
};

// ===== UTILITY FUNCTIONS =====

const calculateDuration = (startTime) => {
  return Date.now() - new Date(startTime).getTime();
};

const calculatePriority = (session) => {
  let priority = 0;
  if (session.customer_tier === 'premium') priority += 10;
  if (session.urgency === 'high') priority += 5;
  if (session.duration > 1800000) priority += 3; // Long running
  return priority;
};

const getChannelIcon = (channelType) => {
  const icons = {
    voice: '📞',
    video: '🎥',
    chat: '💬',
    email: '📧',
    sms: '📱',
    whatsapp: '📲',
    mobile_app: '📱',
    web_portal: '🌐',
  };
  return icons[channelType] || '💬';
};

const calculateEfficiency = (analytics) => {
  if (!analytics) return 0;
  const { totalSessions, responseTime, satisfactionScore } = analytics;
  return Math.min(100, (totalSessions * satisfactionScore) / (responseTime || 1));
};

const calculateHealthScore = (analytics) => {
  if (!analytics) return 0;
  const weights = {
    responseTime: 0.3,
    satisfactionScore: 0.4,
    activeChannels: 0.2,
    totalSessions: 0.1,
  };
  
  // Normalize and weight metrics
  const normalizedResponseTime = Math.max(0, 100 - (analytics.responseTime || 0) / 10);
  const normalizedSatisfaction = analytics.satisfactionScore || 0;
  const normalizedChannels = Math.min(100, (analytics.activeChannels || 0) * 12.5); // 8 channels = 100%
  const normalizedSessions = Math.min(100, (analytics.totalSessions || 0) / 10);
  
  return (
    normalizedResponseTime * weights.responseTime +
    normalizedSatisfaction * weights.satisfactionScore +
    normalizedChannels * weights.activeChannels +
    normalizedSessions * weights.totalSessions
  );
};

const calculateHealthTrend = (history) => {
  if (history.length < 2) return 'stable';
  
  const recent = history.slice(-3);
  const healthyCount = recent.filter(h => h.status === 'healthy').length;
  const ratio = healthyCount / recent.length;
  
  if (ratio >= 0.8) return 'improving';
  if (ratio <= 0.4) return 'declining';
  return 'stable';
};

const getNotificationIcon = (type) => {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    system: '⚙️',
    channel: '📡',
    session: '👤',
  };
  return icons[type] || 'ℹ️';
};
