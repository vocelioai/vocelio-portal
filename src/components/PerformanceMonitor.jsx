// ===== COPILOT PROMPT #2: Performance Monitoring Component =====
// Real-time performance monitoring for omnichannel operations
// Includes cache metrics, query performance, and system health

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePerformanceMonitoring } from '../providers/ReduxProvider';
import { 
  useSystemHealth, 
  useOmnichannelChannels, 
  useOmnichannelSessions 
} from '../hooks/useOmnichannelEnhanced';

const PerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Get performance data from Redux monitoring
  const { metrics, connectionStatus, getStoreHealth } = usePerformanceMonitoring();
  
  // Get system health from API
  const { health: systemHealth, analysis: healthAnalysis } = useSystemHealth();
  
  // Get hook performance data
  const { stats: channelStats, isFetching: channelsFetching } = useOmnichannelChannels();
  const { stats: sessionStats, isFetching: sessionsFetching } = useOmnichannelSessions();

  // Calculate performance metrics
  const storeHealth = getStoreHealth();
  
  const performanceData = {
    // Store Performance
    storeHealth: storeHealth.status,
    successRate: storeHealth.successRate,
    errorRate: storeHealth.errorRate,
    
    // Query Performance  
    totalQueries: metrics.queriesExecuted,
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
    cacheHitRate: metrics.queriesExecuted > 0 
      ? ((metrics.cacheHits / metrics.queriesExecuted) * 100).toFixed(1) 
      : '0',
    
    // Connection Status
    isConnected: connectionStatus.isConnected,
    reconnectAttempts: connectionStatus.reconnectAttempts,
    lastConnected: connectionStatus.lastConnected,
    
    // System Health
    systemStatus: systemHealth?.status || 'unknown',
    systemUptime: systemHealth?.uptime || 0,
    healthScore: healthAnalysis?.serviceHealth || 0,
    
    // Real-time Status
    isRefreshing: channelsFetching || sessionsFetching,
    activeChannels: channelStats?.active || 0,
    activeSessions: sessionStats?.total || 0,
  };

  // Get status color based on performance
  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warn) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (value) => {
    if (value > 5) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (value < -5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Metrics are automatically updated by the Redux store
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (process.env.NODE_ENV !== 'development' && !isVisible) {
    return null;
  }

  // Floating toggle button
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 group"
        title="Show Performance Monitor"
      >
        <Activity className="w-5 h-5" />
        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Performance Monitor
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm z-50 max-w-sm min-w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
          {performanceData.isRefreshing && (
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
            title={autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Hide Monitor"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Store Health Overview */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">Store Health</span>
            {getStatusIcon(performanceData.storeHealth)}
          </div>
          <div className="text-lg font-bold text-gray-900 mt-1">
            {performanceData.storeHealth}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">Cache Hit Rate</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-lg font-bold mt-1 ${
            getStatusColor(parseFloat(performanceData.cacheHitRate), { good: 80, warn: 60 })
          }`}>
            {performanceData.cacheHitRate}%
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total Queries</span>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-purple-500" />
            <span className="font-medium text-gray-900">{performanceData.totalQueries}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Cache Hits</span>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="font-medium text-green-600">{performanceData.cacheHits}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Cache Misses</span>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="font-medium text-red-600">{performanceData.cacheMisses}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Error Rate</span>
          <div className="flex items-center space-x-1">
            <span className={`font-medium ${
              getStatusColor(100 - performanceData.errorRate, { good: 95, warn: 85 })
            }`}>
              {performanceData.errorRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="border-t border-gray-200 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">System Status</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(performanceData.systemStatus)}
            <span className="font-medium text-gray-900 capitalize">
              {performanceData.systemStatus}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Active Channels</span>
          <span className="font-medium text-blue-600">
            {performanceData.activeChannels}/8
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Active Sessions</span>
          <span className="font-medium text-green-600">
            {performanceData.activeSessions}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Connection</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              performanceData.isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {performanceData.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Health Bar */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Overall Health</span>
          <span className="text-xs font-medium text-gray-900">
            {performanceData.healthScore.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              performanceData.healthScore >= 80 ? 'bg-green-500' :
              performanceData.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(performanceData.healthScore, 5)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
