import React, { useState, useEffect } from 'react';
import { railwayFlowAPI } from '../lib/railwayFlowAPI.js';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

const FlowAnalytics = ({ flowId, timeRange = '24h' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('executions');

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const metricOptions = [
    { value: 'executions', label: 'Executions', icon: BarChart3 },
    { value: 'successRate', label: 'Success Rate', icon: CheckCircle },
    { value: 'avgDuration', label: 'Avg Duration', icon: Clock },
    { value: 'users', label: 'Unique Users', icon: Users }
  ];

  useEffect(() => {
    if (flowId) {
      loadAnalytics();
    }
  }, [flowId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await railwayFlowAPI.getFlowAnalytics(flowId, timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricValue = (metric, value) => {
    switch (metric) {
      case 'executions':
        return value.toLocaleString();
      case 'successRate':
        return `${(value * 100).toFixed(1)}%`;
      case 'avgDuration':
        return `${value.toFixed(1)}s`;
      case 'users':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const getMetricIcon = (metric) => {
    const option = metricOptions.find(opt => opt.value === metric);
    const IconComponent = option?.icon || BarChart3;
    return <IconComponent className="w-5 h-5" />;
  };

  const renderChart = () => {
    if (!analytics?.trends) return null;

    const maxValue = Math.max(...analytics.trends.map(point => point[selectedMetric] || 0));
    const chartHeight = 200;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">
            {metricOptions.find(opt => opt.value === selectedMetric)?.label} Trend
          </h4>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="relative" style={{ height: chartHeight }}>
            <svg width="100%" height={chartHeight} className="absolute inset-0">
              {analytics.trends.map((point, index) => {
                const x = (index / (analytics.trends.length - 1)) * 100;
                const y = chartHeight - ((point[selectedMetric] || 0) / maxValue) * (chartHeight - 20);
                
                return (
                  <g key={index}>
                    <circle
                      cx={`${x}%`}
                      cy={y}
                      r="4"
                      fill="#3B82F6"
                      className="hover:fill-blue-700"
                    />
                    {index > 0 && (
                      <line
                        x1={`${((index - 1) / (analytics.trends.length - 1)) * 100}%`}
                        y1={chartHeight - ((analytics.trends[index - 1][selectedMetric] || 0) / maxValue) * (chartHeight - 20)}
                        x2={`${x}%`}
                        y2={y}
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {analytics.trends.map((point, index) => (
              <span key={index}>
                {new Date(point.date).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Flow Analytics</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Executions</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.executions.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {(analytics.successRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {analytics.avgDuration.toFixed(1)}s
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Growth</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              +12.5%
            </div>
          </div>
        </div>

        {/* Chart */}
        {renderChart()}

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Executions:</span>
                <span className="font-medium">{analytics.executions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful:</span>
                <span className="font-medium text-green-600">
                  {Math.round(analytics.executions * analytics.successRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">
                  {analytics.executions - Math.round(analytics.executions * analytics.successRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Duration:</span>
                <span className="font-medium">{analytics.avgDuration.toFixed(1)}s</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {analytics.trends?.slice(-3).map((point, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(point.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{point.executions} runs</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      point.successRate > 0.9 ? 'bg-green-100 text-green-700' :
                      point.successRate > 0.8 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {(point.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowAnalytics;
