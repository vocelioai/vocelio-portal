import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, Download, Filter, RefreshCw, Share2, Settings,
  TrendingUp, TrendingDown, AlertCircle, Users, MessageSquare,
  Clock, DollarSign, Target, Award, Activity, BarChart3,
  PieChart, MapPin, Zap, Eye, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { useAnalyticsWebSocket } from '../../hooks/useWebSocket';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// ===== COPILOT PROMPT #5: Analytics & Reporting Dashboard =====
// Comprehensive analytics dashboard with advanced data visualization and BI features

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

const KPICard = ({ title, value, change, trend, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const trendIcon = trend === 'up' ? ArrowUp : ArrowDown;
  const TrendIcon = trendIcon;

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{change}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
};

const MetricsGrid = ({ data, dateRange }) => {
  const kpis = [
    {
      title: 'Total Interactions',
      value: data.totalInteractions?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Avg Response Time',
      value: data.avgResponseTime || '0:00',
      change: '-8.3%',
      trend: 'down',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Customer Satisfaction',
      value: `${data.customerSatisfaction || 0}%`,
      change: '+5.7%',
      trend: 'up',
      icon: Award,
      color: 'amber'
    },
    {
      title: 'Resolution Rate',
      value: `${data.resolutionRate || 0}%`,
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Active Agents',
      value: data.activeAgents?.toLocaleString() || '0',
      change: '+15.8%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Cost per Interaction',
      value: `$${data.costPerInteraction || '0.00'}`,
      change: '-4.1%',
      trend: 'down',
      icon: DollarSign,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

const PerformanceChart = ({ data, chartType = 'line', title }) => {
  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="interactions" fill="#3B82F6" />
            <Line type="monotone" dataKey="satisfaction" stroke="#10B981" />
          </ComposedChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ChannelDistributionChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Channel Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Tooltip />
            <Legend />
            <RechartsPieChart data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </RechartsPieChart>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomReportBuilder = ({ onGenerateReport }) => {
  const [reportConfig, setReportConfig] = useState({
    title: '',
    dateRange: { start: subDays(new Date(), 30), end: new Date() },
    metrics: [],
    channels: [],
    chartTypes: [],
    format: 'pdf'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const availableMetrics = [
    'Total Interactions', 'Response Time', 'Customer Satisfaction',
    'Resolution Rate', 'Agent Productivity', 'Cost Analysis'
  ];

  const availableChannels = [
    'Voice', 'Email', 'Chat', 'SMS', 'WhatsApp', 'Social Media', 'Mobile App', 'Web Portal'
  ];

  const chartTypes = ['Line', 'Bar', 'Area', 'Pie', 'Scatter'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Custom Report Builder</span>
        </h3>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report title..."
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reportConfig.format}
                onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableMetrics.map(metric => (
                  <label key={metric} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={reportConfig.metrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportConfig(prev => ({ ...prev, metrics: [...prev.metrics, metric] }));
                        } else {
                          setReportConfig(prev => ({ ...prev, metrics: prev.metrics.filter(m => m !== metric) }));
                        }
                      }}
                    />
                    <span className="text-sm">{metric}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableChannels.map(channel => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={reportConfig.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportConfig(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                        } else {
                          setReportConfig(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                        }
                      }}
                    />
                    <span className="text-sm">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Types</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {chartTypes.map(chart => (
                  <label key={chart} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={reportConfig.chartTypes.includes(chart)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportConfig(prev => ({ ...prev, chartTypes: [...prev.chartTypes, chart] }));
                        } else {
                          setReportConfig(prev => ({ ...prev, chartTypes: prev.chartTypes.filter(c => c !== chart) }));
                        }
                      }}
                    />
                    <span className="text-sm">{chart}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <DatePicker
                selected={reportConfig.dateRange.start}
                onChange={(date) => setReportConfig(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: date } 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholderText="Start Date"
              />
              <span>to</span>
              <DatePicker
                selected={reportConfig.dateRange.end}
                onChange={(date) => setReportConfig(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: date } 
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholderText="End Date"
              />
            </div>
            <button
              onClick={() => onGenerateReport(reportConfig)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsDashboard = ({ isActive }) => {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });

  const [dashboardData, setDashboardData] = useState({
    totalInteractions: 125847,
    avgResponseTime: '2:34',
    customerSatisfaction: 94.2,
    resolutionRate: 87.5,
    activeAgents: 156,
    costPerInteraction: 3.42
  });

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  // WebSocket connection for real-time analytics
  const analyticsWs = useAnalyticsWebSocket({
    onConnect: () => console.log('📊 Analytics WebSocket connected'),
    onMessage: (message) => {
      if (message.type === 'analytics_update') {
        updateAnalyticsData(message.payload);
      }
    },
    onError: (error) => console.error('❌ Analytics WebSocket error:', error)
  });

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const days = 30;
      const tsData = [];
      const channelDist = [
        { name: 'Voice', value: 35, color: '#3B82F6' },
        { name: 'Email', value: 25, color: '#10B981' },
        { name: 'Chat', value: 20, color: '#F59E0B' },
        { name: 'SMS', value: 15, color: '#EF4444' },
        { name: 'WhatsApp', value: 5, color: '#8B5CF6' }
      ];

      for (let i = days; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MM/dd');
        tsData.push({
          date,
          value: Math.floor(Math.random() * 5000) + 8000,
          interactions: Math.floor(Math.random() * 1000) + 500,
          satisfaction: Math.floor(Math.random() * 20) + 80,
          responseTime: Math.floor(Math.random() * 180) + 60
        });
      }

      setTimeSeriesData(tsData);
      setChannelData(channelDist);
      setPerformanceData(tsData);
    };

    generateMockData();
  }, [dateRange]);

  const updateAnalyticsData = useCallback((data) => {
    if (data.kpis) {
      setDashboardData(prev => ({ ...prev, ...data.kpis }));
    }
    if (data.timeSeries) {
      setTimeSeriesData(data.timeSeries);
    }
  }, []);

  const handleGenerateReport = useCallback((reportConfig) => {
    console.log('🔄 Generating report with config:', reportConfig);
    
    // In a real app, this would make an API call to generate the report
    const reportData = {
      title: reportConfig.title,
      dateRange: reportConfig.dateRange,
      data: {
        kpis: dashboardData,
        timeSeries: timeSeriesData,
        channels: channelData
      },
      config: reportConfig
    };

    // Simulate report generation
    setTimeout(() => {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }, [dashboardData, timeSeriesData, channelData]);

  const handleRefreshData = () => {
    console.log('🔄 Refreshing analytics data...');
    // Trigger data refresh
    setDashboardData(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + Math.floor(Math.random() * 100),
      customerSatisfaction: Math.max(85, Math.min(98, prev.customerSatisfaction + (Math.random() - 0.5) * 2))
    }));
  };

  if (!isActive) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your omnichannel performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center space-x-2 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center space-x-2 hover:bg-blue-700">
                <Share2 className="h-4 w-4" />
                <span>Share Dashboard</span>
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Date Range:</span>
            <DatePicker
              selected={dateRange.start}
              onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            />
            <span>to</span>
            <DatePicker
              selected={dateRange.end}
              onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
              className="border border-gray-300 rounded-md px-3 py-1"
            />
            <div className="flex items-center space-x-2 ml-4">
              <div className={`w-3 h-3 rounded-full ${analyticsWs.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {analyticsWs.connected ? 'Live Data' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <MetricsGrid data={dashboardData} dateRange={dateRange} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PerformanceChart 
            data={timeSeriesData} 
            title="Interaction Volume Trend" 
            chartType="area"
          />
          <ChannelDistributionChart data={channelData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PerformanceChart 
            data={performanceData} 
            title="Response Time Analysis" 
            chartType="line"
          />
          <PerformanceChart 
            data={performanceData} 
            title="Performance Comparison" 
            chartType="composed"
          />
        </div>

        {/* Report Builder */}
        <CustomReportBuilder onGenerateReport={handleGenerateReport} />

        {/* Insights Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>AI-Powered Insights</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Peak Traffic Optimization</h4>
              <p className="text-blue-700 text-sm">Consider adding 2 more agents during 2-4 PM to reduce wait times by 23%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Channel Performance</h4>
              <p className="text-green-700 text-sm">Email channel showing 15% improvement in resolution time this month</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Cost Efficiency</h4>
              <p className="text-amber-700 text-sm">Routing 18% more chats to self-service could save $2,400/month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
