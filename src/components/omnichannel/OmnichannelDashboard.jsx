import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, MessageSquare, Phone, Video, Mail, MessageCircle, 
  Smartphone, Globe, Users, TrendingUp, Bell, Settings, 
  WifiOff, Wifi, AlertTriangle, CheckCircle, Clock, 
  ArrowRightLeft, Eye, BarChart3, PieChart, Filter, Search,
  ChevronDown, ChevronRight, RefreshCw, ExternalLink,
  Zap, Brain, Shield, Target, Headphones, Monitor
} from 'lucide-react';

// ===== COPILOT PROMPT #2: Enhanced Hooks Integration =====
import {
  useOmnichannelChannels,
  useOmnichannelSessions,
  useOmnichannelAnalytics,
  useSystemHealth,
  useOmnichannelNotifications,
} from '../../hooks/useOmnichannelEnhanced';
import { useOmnichannelWebSocket } from '../../hooks/useOmnichannelWebSocket';

// ===== COPILOT PROMPT #3: Channel-Specific Components =====
import OmnichannelChannelManager from './channels/OmnichannelChannelManager';
import IntelligentRoutingPanel from './IntelligentRoutingPanel';

// ===== COPILOT PROMPT #4: Real-Time WebSocket Integration =====
import RealTimeDashboard from './RealTimeDashboard';

// ===== COPILOT PROMPT #5: Analytics & Reporting Dashboard =====
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

// ===== COPILOT PROMPT #6: Campaign Orchestration Interface =====
import CampaignOrchestrationDashboard from '../campaigns/CampaignOrchestrationDashboard';

// Channel Status Component
const ChannelStatusCard = ({ channel, status, activeCount, metrics }) => {
  const getChannelIcon = (channelType) => {
    const icons = {
      voice: Phone,
      video: Video,
      chat: MessageSquare,
      email: Mail,
      sms: MessageCircle,
      mobile_app: Smartphone,
      web_portal: Globe,
      whatsapp: MessageSquare
    };
    return icons[channelType] || Activity;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 
           status === 'warning' ? 'text-yellow-600 bg-yellow-100' : 
           'text-red-600 bg-red-100';
  };

  const Icon = getChannelIcon(channel.type);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${getStatusColor(status)} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{status}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-400' : status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Active Sessions</span>
          <span className="font-medium">{activeCount || 0}</span>
        </div>
        {metrics && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-medium">{metrics.avgResponseTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">{metrics.successRate || '0%'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Performance Metrics Card
const MetricCard = ({ title, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Real-time Activity Feed
const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
        <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Session Management Panel
const SessionManagement = ({ sessions = [] }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {sessions.length} active
        </span>
      </div>
      
      <div className="space-y-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.session_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div>
                  <p className="font-medium text-gray-900">{session.customer_name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-600">{session.channel_type} • {session.duration || '0:00'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-700">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Connection Status Indicator
const ConnectionStatus = ({ isConnected, connectionStatus }) => {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600 font-medium">
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </>
      )}
    </div>
  );
};

// Main Omnichannel Dashboard Component
const OmnichannelDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // ===== COPILOT PROMPT #3: Channel Manager State =====
  const [channelManagerExpanded, setChannelManagerExpanded] = useState(false);

  // ===== COPILOT PROMPT #2: Enhanced Hooks Usage =====
  
  // Enhanced channel management with RTK Query
  const {
    channels,
    stats: channelStats,
    isLoading: channelsLoading,
    error: channelsError,
    refetch: refetchChannels,
    getActiveChannels,
  } = useOmnichannelChannels({
    autoRefresh: true,
    refreshInterval: 30000,
    includeInactive: false,
  });

  // Enhanced session management with optimistic updates
  const {
    sessions,
    stats: sessionStats,
    isLoading: sessionsLoading,
    operations: sessionOperations,
    operationStates,
    refetch: refetchSessions,
  } = useOmnichannelSessions({
    autoRefresh: true,
    includeCompleted: false,
    maxSessions: 50,
  });

  // Enhanced analytics with performance metrics
  const {
    analytics: metrics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    getChannelMetric,
  } = useOmnichannelAnalytics('24h');

  // System health monitoring
  const {
    health: systemHealth,
    analysis: healthAnalysis,
    isLoading: healthLoading,
  } = useSystemHealth();

  // Real-time notifications
  const {
    notifications: activities,
    stats: notificationStats,
    isLoading: notificationsLoading,
  } = useOmnichannelNotifications({
    limit: 20,
    unreadOnly: false,
  });

  // WebSocket connection for real-time updates
  const { 
    isConnected, 
    connectionStatus, 
    lastMessage, 
    messageHistory 
  } = useOmnichannelWebSocket();

  // Combined loading state
  const loading = channelsLoading || sessionsLoading || analyticsLoading;
  const error = channelsError;

  // ===== COPILOT PROMPT #2: Manual Refresh Function =====
  const loadDashboardData = useCallback(async () => {
    try {
      // Trigger refetch for all data sources
      await Promise.all([
        refetchChannels(),
        refetchSessions(),
        refetchAnalytics()
      ]);
      
      console.log('🔄 Dashboard data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing dashboard data:', error);
    }
  }, [refetchChannels, refetchSessions, refetchAnalytics]);

  // ===== COPILOT PROMPT #2: Enhanced Real-time Updates =====
  // Handle real-time updates with RTK Query cache invalidation
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'session_update':
          // RTK Query will automatically update through polling
          refetchSessions();
          break;
          
        case 'channel_status_change':
          // Refresh channel data when status changes
          refetchChannels();
          break;
          
        case 'new_message':
        case 'customer_activity':
          // Activities are now handled by notifications hook
          // The enhanced hook automatically polls for new notifications
          break;
          
        case 'performance_update':
          // Refresh analytics data
          refetchAnalytics();
          break;
      }
    }
  }, [lastMessage, refetchSessions, refetchChannels, refetchAnalytics]);

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Channel Overview', icon: Activity },
    { id: 'channels', label: 'Live Channels', icon: Headphones }, // ===== COPILOT PROMPT #3 =====
    { id: 'realtime', label: 'Real-Time Hub', icon: Wifi }, // ===== COPILOT PROMPT #4 =====
    { id: 'sessions', label: 'Active Sessions', icon: Users },
    { id: 'routing', label: 'Intelligent Routing', icon: Brain },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (loading && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading omnichannel dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button 
          onClick={loadDashboardData}
          className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Omnichannel Hub</h1>
            <p className="text-gray-600 mt-1">Unified customer communication across all channels</p>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus isConnected={isConnected} connectionStatus={connectionStatus} />
            <button 
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Channel Status Grid */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.isArray(channels) ? channels.map((channel, index) => (
                    <ChannelStatusCard
                      key={index}
                      channel={channel}
                      status={channel.status}
                      activeCount={channel.activeCount}
                      metrics={channel.metrics}
                    />
                  )) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <p>No channels available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard 
                    title="Total Sessions Today"
                    value={metrics.totalSessions || sessionStats.total || "0"}
                    trend={metrics.performance?.improvement || 5.2}
                    color="blue"
                  />
                  <MetricCard 
                    title="Avg Response Time"
                    value={`${metrics.responseTime || channelStats.averageResponseTime || 2.3}s`}
                    trend={metrics.performance?.improvement || -12.5}
                    color="green"
                  />
                  <MetricCard 
                    title="Customer Satisfaction"
                    value={`${metrics.satisfactionScore || 4.8}/5`}
                    trend={metrics.performance?.improvement || 3.1}
                    color="purple"
                  />
                  <MetricCard 
                    title="Active Channels"
                    value={`${metrics.activeChannels || channelStats.active || 0}/8`}
                    trend={metrics.performance?.improvement || 1.8}
                    color="orange"
                  />
                </div>
              </div>

              {/* Activity Feed and Sessions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityFeed activities={activities} />
                <SessionManagement sessions={sessions} />
              </div>
            </div>
          )}

          {/* ===== COPILOT PROMPT #3: Live Channels Tab ===== */}
          {activeTab === 'channels' && (
            <div className="h-full">
              <OmnichannelChannelManager 
                isExpanded={channelManagerExpanded}
                onToggleExpand={() => setChannelManagerExpanded(!channelManagerExpanded)}
              />
            </div>
          )}

          {/* ===== COPILOT PROMPT #4: Real-Time Hub Tab ===== */}
          {activeTab === 'realtime' && (
            <div className="h-full">
              <RealTimeDashboard 
                isActive={true}
                onClose={() => setActiveTab('overview')}
              />
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h2>
              <SessionManagement sessions={sessions} />
            </div>
          )}

          {activeTab === 'routing' && (
            <IntelligentRoutingPanel isActive={true} />
          )}

          {activeTab === 'campaigns' && (
            <CampaignOrchestrationDashboard isActive={activeTab === 'campaigns'} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard isActive={activeTab === 'analytics'} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OmnichannelDashboard;
