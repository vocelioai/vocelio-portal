import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wifi, WifiOff, Activity, Users, MessageSquare, 
  AlertTriangle, Bell, BellOff, TrendingUp, Clock,
  CheckCircle, XCircle, Pause, Play, Zap
} from 'lucide-react';
import { useDashboardWebSocket, useAnalyticsWebSocket } from '../../hooks/useWebSocket';
import { useRealTimeDataManager } from '../../hooks/useRealTimeDataHandlers';

// ===== COPILOT PROMPT #4: Real-Time Dashboard Component =====
// Live dashboard with WebSocket integration and real-time updates

const RealTimeDashboard = ({ isActive, onClose }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalSessions: 0,
    activeAgents: 0,
    averageResponseTime: '0:00',
    customerSatisfaction: 0,
    channelDistribution: {}
  });

  const [liveUpdates, setLiveUpdates] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // WebSocket connections
  const dashboardWs = useDashboardWebSocket({
    onConnect: () => console.log('🔌 Dashboard WebSocket connected'),
    onDisconnect: () => console.log('🔌 Dashboard WebSocket disconnected'),
    onError: (error) => console.error('❌ Dashboard WebSocket error:', error)
  });

  const analyticsWs = useAnalyticsWebSocket({
    onConnect: () => console.log('📊 Analytics WebSocket connected'),
    onMessage: (message) => {
      if (message.type === 'analytics_update') {
        updateDashboardStats(message.payload);
      }
    }
  });

  // Real-time data handlers
  const realTimeData = useRealTimeDataManager({
    onSessionUpdate: useCallback((session) => {
      console.log('📋 Session updated:', session);
      // Update session counts
      setDashboardStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + (session.status === 'active' ? 1 : -1)
      }));
    }, []),

    onNewMessage: useCallback((message) => {
      console.log('💬 New message received:', message);
      // Update message statistics
    }, []),

    onPerformanceUpdate: useCallback((performance) => {
      console.log('📈 Performance updated:', performance);
      updateDashboardStats(performance.metrics);
    }, []),

    onSystemAlert: useCallback((alert) => {
      console.log('🚨 System alert:', alert);
      if (notificationsEnabled && 'Notification' in window) {
        new Notification(`System Alert: ${alert.title}`, {
          body: alert.message,
          icon: '/favicon.ico'
        });
      }
    }, [notificationsEnabled]),

    onNotification: useCallback((notification) => {
      console.log('🔔 New notification:', notification);
    }, [])
  });

  // Update dashboard statistics
  const updateDashboardStats = useCallback((newStats) => {
    setDashboardStats(prev => ({
      ...prev,
      ...newStats,
      lastUpdated: Date.now()
    }));
  }, []);

  // Send test message
  const sendTestMessage = useCallback(() => {
    dashboardWs.sendMessage('test_message', {
      message: 'Test message from dashboard',
      timestamp: new Date().toISOString()
    });
  }, [dashboardWs]);

  // Toggle live updates
  const toggleLiveUpdates = useCallback(() => {
    setLiveUpdates(prev => !prev);
    if (!liveUpdates) {
      dashboardWs.connect();
      analyticsWs.connect();
    } else {
      dashboardWs.disconnect();
      analyticsWs.disconnect();
    }
  }, [liveUpdates, dashboardWs, analyticsWs]);

  // Request browser notification permission
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {(dashboardWs.isConnected && analyticsWs.isConnected) ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">Real-Time Dashboard</h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              dashboardWs.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-500">
              {dashboardWs.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleLiveUpdates}
            className={`p-2 rounded-lg transition-colors ${
              liveUpdates
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-red-600 bg-red-50 hover:bg-red-100'
            }`}
          >
            {liveUpdates ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Dashboard Connection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Dashboard Connection</span>
            <div className={`w-2 h-2 rounded-full ${
              dashboardWs.isConnected ? 'bg-green-500' : 
              dashboardWs.isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {dashboardWs.isConnected ? 'Connected' : 
             dashboardWs.isConnecting ? 'Connecting...' : 'Disconnected'}
          </div>
          {dashboardWs.error && (
            <div className="text-xs text-red-600 mt-1">{dashboardWs.error.message}</div>
          )}
        </div>

        {/* Analytics Connection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Analytics Connection</span>
            <div className={`w-2 h-2 rounded-full ${
              analyticsWs.isConnected ? 'bg-green-500' : 
              analyticsWs.isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {analyticsWs.isConnected ? 'Connected' : 
             analyticsWs.isConnecting ? 'Connecting...' : 'Disconnected'}
          </div>
          {analyticsWs.error && (
            <div className="text-xs text-red-600 mt-1">{analyticsWs.error.message}</div>
          )}
        </div>

        {/* Message Queue */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Message Queue</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {realTimeData.recentMessages.length} Messages
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {realTimeData.unreadNotifications} unread notifications
          </div>
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalSessions}</div>
          <div className="text-sm text-gray-500">Active Sessions</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.activeAgents}</div>
          <div className="text-sm text-gray-500">Active Agents</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.averageResponseTime}</div>
          <div className="text-sm text-gray-500">Avg Response</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardStats.customerSatisfaction}%</div>
          <div className="text-sm text-gray-500">Satisfaction</div>
        </div>
      </div>

      {/* Real-Time Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Real-Time Activity</h3>
          <div className="flex items-center space-x-2">
            {realTimeData.unacknowledgedAlerts > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {realTimeData.unacknowledgedAlerts} alerts
              </span>
            )}
            {realTimeData.activeRecommendations > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Zap className="w-3 h-3 mr-1" />
                {realTimeData.activeRecommendations} recommendations
              </span>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">Recent Messages</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {realTimeData.recentMessages.slice(-5).map((message, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-medium text-gray-600">
                  {message.channelType.toUpperCase()}
                </span>
                <span className="text-gray-500 flex-1 truncate">
                  {message.content.text || message.content}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {realTimeData.recentMessages.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-4">
                No recent messages
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        {realTimeData.alerts.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-red-800 mb-3">System Alerts</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {realTimeData.alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">{alert.title}</span>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => realTimeData.acknowledgeAlert(alert.alertId)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {realTimeData.recommendations.filter(r => r.status === 'pending').length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-blue-800 mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {realTimeData.recommendations
                .filter(r => r.status === 'pending')
                .slice(0, 2)
                .map((rec, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-blue-700">
                      Route to {rec.recommendedChannel}
                    </div>
                    <div className="text-blue-600 text-xs">
                      Confidence: {rec.confidence}% - {rec.reasoning}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => realTimeData.acceptRecommendation(rec.recommendationId)}
                      className="text-green-600 hover:text-green-800 text-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => realTimeData.rejectRecommendation(rec.recommendationId)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Controls */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Debug Controls</span>
          <button
            onClick={sendTestMessage}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
          >
            Send Test Message
          </button>
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <strong>Dashboard WS:</strong> {dashboardWs.connectionId?.slice(-8)}
          </div>
          <div>
            <strong>Analytics WS:</strong> {analyticsWs.connectionId?.slice(-8)}
          </div>
          <div>
            <strong>Messages:</strong> {dashboardWs.messageHistory.length}
          </div>
          <div>
            <strong>Last Update:</strong> {dashboardStats.lastUpdated ? new Date(dashboardStats.lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
