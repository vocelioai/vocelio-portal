import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Phone, Clock, 
  Target, DollarSign, Activity, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Download,
  Filter, Search, Eye, Play, Pause
} from 'lucide-react';

const AnalyticsPanel = ({ isDarkMode, flowData }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('calls');

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalCalls: 12847,
      callsChange: 12.5,
      successRate: 87.3,
      successChange: 5.2,
      avgDuration: '2m 34s',
      durationChange: -8.7,
      totalRevenue: 45690,
      revenueChange: 18.9
    },
    callVolume: [
      { date: '2024-01-01', calls: 1200, success: 1045 },
      { date: '2024-01-02', calls: 1350, success: 1180 },
      { date: '2024-01-03', calls: 1100, success: 960 },
      { date: '2024-01-04', calls: 1450, success: 1260 },
      { date: '2024-01-05', calls: 1600, success: 1400 },
      { date: '2024-01-06', calls: 1380, success: 1205 },
      { date: '2024-01-07', calls: 1520, success: 1325 }
    ],
    nodePerformance: [
      { name: 'Greeting', calls: 12847, avgDuration: '8s', successRate: 98.2 },
      { name: 'Menu Options', calls: 12620, avgDuration: '12s', successRate: 89.5 },
      { name: 'Account Lookup', calls: 8940, avgDuration: '15s', successRate: 92.1 },
      { name: 'Transfer', calls: 3420, avgDuration: '5s', successRate: 95.8 },
      { name: 'Callback', calls: 2150, avgDuration: '3s', successRate: 97.3 }
    ]
  };

  const [recentCalls] = useState([
    { id: 1, time: '2 minutes ago', number: '+1 (555) 123-4567', duration: '3m 24s', status: 'completed', outcome: 'resolved' },
    { id: 2, time: '5 minutes ago', number: '+1 (555) 987-6543', duration: '1m 45s', status: 'completed', outcome: 'transferred' },
    { id: 3, time: '12 minutes ago', number: '+1 (555) 456-7890', duration: '4m 12s', status: 'completed', outcome: 'callback' },
    { id: 4, time: '18 minutes ago', number: '+1 (555) 321-0987', duration: '2m 08s', status: 'completed', outcome: 'resolved' },
    { id: 5, time: '25 minutes ago', number: '+1 (555) 654-3210', duration: '5m 33s', status: 'active', outcome: 'ongoing' }
  ]);

  const [insights] = useState([
    {
      type: 'success',
      title: 'Peak Performance Hour',
      description: 'Call success rate increases by 23% between 2-3 PM',
      action: 'Schedule more campaigns during this time',
      priority: 'high'
    },
    {
      type: 'warning',
      title: 'Menu Timeout Issues',
      description: '15% of callers timeout at the main menu',
      action: 'Consider reducing menu options or adding voice prompts',
      priority: 'medium'
    },
    {
      type: 'info',
      title: 'Popular Exit Point',
      description: 'Most successful calls end after account verification',
      action: 'Optimize post-verification flow',
      priority: 'low'
    }
  ]);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className={`p-6 rounded-xl border ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    } transition-all cursor-pointer group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          trend === 'up' 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : trend === 'down'
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center text-sm ${
          trend === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span className="ml-1">{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {title}
        </p>
      </div>
    </div>
  );

  const NodePerformanceRow = ({ node }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-800/30 hover:bg-gray-800/50' : 'bg-gray-50 hover:bg-gray-100'
    } transition-colors`}>
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${
          node.successRate > 95 ? 'bg-green-500' :
          node.successRate > 85 ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <div>
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {node.name}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {node.calls.toLocaleString()} calls
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {node.successRate}%
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {node.avgDuration} avg
        </p>
      </div>
    </div>
  );

  const CallActivityRow = ({ call }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          call.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
        <div>
          <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {call.number}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {call.time}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {call.duration}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          call.outcome === 'resolved' 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : call.outcome === 'transferred'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : call.outcome === 'callback'
            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {call.outcome}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <BarChart3 size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Analytics Dashboard</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time flow performance insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={isLoading}
            className={`p-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } transition-colors ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard 
              title="Total Calls"
              value={mockAnalytics.overview.totalCalls.toLocaleString()}
              change={mockAnalytics.overview.callsChange}
              icon={Phone}
              trend="up"
            />
            <MetricCard 
              title="Success Rate"
              value={`${mockAnalytics.overview.successRate}%`}
              change={mockAnalytics.overview.successChange}
              icon={Target}
              trend="up"
            />
            <MetricCard 
              title="Avg Duration"
              value={mockAnalytics.overview.avgDuration}
              change={mockAnalytics.overview.durationChange}
              icon={Clock}
              trend="down"
            />
            <MetricCard 
              title="Revenue"
              value={`$${mockAnalytics.overview.totalRevenue.toLocaleString()}`}
              change={mockAnalytics.overview.revenueChange}
              icon={DollarSign}
              trend="up"
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Node Performance */}
            <div className={`p-6 rounded-xl border ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Node Performance</h3>
                <button className={`text-sm px-3 py-1 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}>
                  <Download size={16} className="inline mr-2" />
                  Export
                </button>
              </div>
              <div className="space-y-3">
                {mockAnalytics.nodePerformance.map((node, index) => (
                  <NodePerformanceRow key={index} node={node} />
                ))}
              </div>
            </div>

            {/* Recent Call Activity */}
            <div className={`p-6 rounded-xl border ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Call Activity</h3>
                <button className={`text-sm px-3 py-1 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}>
                  <Eye size={16} className="inline mr-2" />
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <CallActivityRow key={call.id} call={call} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="mr-2 text-blue-500" size={20} />
                AI-Generated Insights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : insight.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    insight.type === 'success' ? 'text-green-700 dark:text-green-300' :
                    insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-blue-700 dark:text-blue-300'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {insight.description}
                  </p>
                  <p className={`text-xs font-medium ${
                    insight.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    Action: {insight.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
