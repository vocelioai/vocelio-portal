import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  ScatterChart, Scatter, Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Mail, Phone, MessageSquare,
  Target, Zap, Clock, DollarSign, Eye, MousePointer, ShoppingCart,
  Filter, Calendar, Download, RefreshCw, BarChart3, PieChart as PieChartIcon,
  Activity, Award, TestTube, Split, ChevronUp, ChevronDown,
  AlertCircle, CheckCircle, Info, PlayCircle, Pause, Settings, Globe
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

// ===== COPILOT PROMPT #6: Campaign Analytics Dashboard =====
// Advanced campaign performance analytics with funnel analysis and A/B testing

const CampaignAnalytics = ({ campaignId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [campaignId, dateRange, selectedSegment]);

  const metricOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Conversion Funnel', icon: Target },
    { id: 'abtesting', label: 'A/B Testing', icon: TestTube },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'channels', label: 'Channel Performance', icon: Split }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>
            <p className="text-sm text-gray-500">Comprehensive performance insights and optimization</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Segments</option>
              <option value="new_customers">New Customers</option>
              <option value="returning_customers">Returning Customers</option>
              <option value="high_value">High Value</option>
            </select>
            
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Metric Navigation */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {metricOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedMetric(option.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedMetric === option.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      {selectedMetric === 'overview' && <OverviewAnalytics data={analyticsData} />}
      {selectedMetric === 'funnel' && <FunnelAnalytics data={analyticsData} />}
      {selectedMetric === 'abtesting' && <ABTestingAnalytics data={analyticsData} />}
      {selectedMetric === 'engagement' && <EngagementAnalytics data={analyticsData} />}
      {selectedMetric === 'revenue' && <RevenueAnalytics data={analyticsData} />}
      {selectedMetric === 'channels' && <ChannelAnalytics data={analyticsData} />}
    </div>
  );
};

// Overview Analytics Component
const OverviewAnalytics = ({ data }) => {
  const kpis = [
    {
      label: 'Total Sent',
      value: data.overview.totalSent,
      change: '+12.5%',
      trend: 'up',
      icon: Mail,
      color: 'blue'
    },
    {
      label: 'Delivered',
      value: data.overview.delivered,
      change: '+8.3%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Open Rate',
      value: `${data.overview.openRate}%`,
      change: '+2.1%',
      trend: 'up',
      icon: Eye,
      color: 'purple'
    },
    {
      label: 'Click Rate',
      value: `${data.overview.clickRate}%`,
      change: '-1.2%',
      trend: 'down',
      icon: MousePointer,
      color: 'orange'
    },
    {
      label: 'Conversion Rate',
      value: `${data.overview.conversionRate}%`,
      change: '+5.7%',
      trend: 'up',
      icon: Target,
      color: 'red'
    },
    {
      label: 'Revenue',
      value: `$${data.overview.revenue.toLocaleString()}`,
      change: '+18.9%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 text-${kpi.color}-600`} />
                <div className={`flex items-center text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {kpi.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-500">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Performance Over Time */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.performanceOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM dd')} />
            <YAxis />
            <Tooltip labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')} />
            <Legend />
            <Line type="monotone" dataKey="openRate" stroke="#8884d8" name="Open Rate %" />
            <Line type="monotone" dataKey="clickRate" stroke="#82ca9d" name="Click Rate %" />
            <Line type="monotone" dataKey="conversionRate" stroke="#ffc658" name="Conversion Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.channelDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.channelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Segments</h3>
          <div className="space-y-4">
            {data.audienceSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{segment.name}</div>
                  <div className="text-sm text-gray-500">{segment.count} contacts</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Funnel Analytics Component
const FunnelAnalytics = ({ data }) => {
  const funnelData = data.funnel;

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={400}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={funnelData.steps}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {funnelData.steps.map((step, index) => {
          const nextStep = funnelData.steps[index + 1];
          const dropoffRate = nextStep ? ((step.value - nextStep.value) / step.value * 100).toFixed(1) : 0;
          
          return (
            <div key={step.name} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: step.fill }}></div>
                {index < funnelData.steps.length - 1 && (
                  <div className="text-sm text-red-600">
                    -{dropoffRate}% dropoff
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {step.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{step.name}</div>
              <div className="mt-2 text-xs text-gray-400">
                {index > 0 && `${((step.value / funnelData.steps[0].value) * 100).toFixed(1)}% of total`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Performance Over Time */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={funnelData.trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM dd')} />
            <YAxis />
            <Tooltip labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')} />
            <Legend />
            <Area type="monotone" dataKey="sent" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="opened" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="clicked" stackId="1" stroke="#ffc658" fill="#ffc658" />
            <Area type="monotone" dataKey="converted" stackId="1" stroke="#ff7300" fill="#ff7300" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// A/B Testing Analytics Component
const ABTestingAnalytics = ({ data }) => {
  const [selectedTest, setSelectedTest] = useState(data.abTests[0]?.id);
  const currentTest = data.abTests.find(test => test.id === selectedTest);

  return (
    <div className="space-y-6">
      {/* Test Selection */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">A/B Test Results</h3>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {data.abTests.map(test => (
              <option key={test.id} value={test.id}>{test.name}</option>
            ))}
          </select>
        </div>

        {currentTest && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Status</div>
              <div className={`text-lg font-semibold ${
                currentTest.status === 'running' ? 'text-green-600' : 
                currentTest.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {currentTest.status}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Confidence Level</div>
              <div className="text-lg font-semibold text-gray-900">{currentTest.confidence}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Sample Size</div>
              <div className="text-lg font-semibold text-gray-900">{currentTest.sampleSize.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-lg font-semibold text-gray-900">{currentTest.duration} days</div>
            </div>
          </div>
        )}
      </div>

      {/* Variant Comparison */}
      {currentTest && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Variant Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentTest.variants.map((variant, index) => (
              <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{variant.name}</h4>
                  {variant.isWinner && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Winner
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Participants</span>
                    <span className="font-medium">{variant.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-medium">{variant.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue per User</span>
                    <span className="font-medium">${variant.revenuePerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statistical Significance</span>
                    <span className={`font-medium ${
                      variant.significance >= 95 ? 'text-green-600' : 
                      variant.significance >= 90 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {variant.significance}%
                    </span>
                  </div>
                </div>
                
                {/* Performance Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${variant.conversionRate * 2}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test History */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent A/B Tests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Improvement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.abTests.map((test) => {
                const winner = test.variants.find(v => v.isWinner);
                const control = test.variants.find(v => v.name.includes('Control'));
                const improvement = winner && control ? 
                  ((winner.conversionRate - control.conversionRate) / control.conversionRate * 100).toFixed(1) : 0;
                
                return (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {test.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        test.status === 'running' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {winner ? winner.name : 'TBD'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {improvement > 0 ? `+${improvement}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.confidence}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Engagement Analytics Component
const EngagementAnalytics = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.engagement.overview.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 text-${metric.color}-600`} />
                <div className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </div>
          );
        })}
      </div>

      {/* Engagement Heatmap */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={data.engagement.heatmapData}>
            <CartesianGrid />
            <XAxis type="number" dataKey="hour" domain={[0, 23]} />
            <YAxis type="number" dataKey="day" domain={[0, 6]} />
            <Tooltip />
            <Scatter dataKey="engagement" fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Device & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.engagement.deviceTypes}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.engagement.deviceTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {data.engagement.geographic.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{location.country}</span>
                  <span className="text-xs text-gray-500">{location.city}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Revenue Analytics Component
const RevenueAnalytics = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.revenue.overview.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.revenue.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value) => format(parseISO(value), 'MMM dd')} />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')}
              formatter={(value) => [`$${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Channel Analytics Component
const ChannelAnalytics = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Channel Performance Comparison */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.channels.performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="openRate" fill="#8884d8" name="Open Rate %" />
            <Bar dataKey="clickRate" fill="#82ca9d" name="Click Rate %" />
            <Bar dataKey="conversionRate" fill="#ffc658" name="Conversion Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.channels.details.map((channel, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <channel.icon className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Messages Sent</span>
                <span className="font-medium">{channel.messagesSent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="font-medium">{channel.deliveryRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engagement Score</span>
                <span className="font-medium">{channel.engagementScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost per Engagement</span>
                <span className="font-medium">${channel.costPerEngagement}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ROI</span>
                <span className={`font-medium ${channel.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {channel.roi >= 0 ? '+' : ''}{channel.roi}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock Analytics Data
const mockAnalyticsData = {
  overview: {
    totalSent: 45672,
    delivered: 44891,
    openRate: 32.4,
    clickRate: 8.7,
    conversionRate: 3.2,
    revenue: 127589
  },
  performanceOverTime: Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
    openRate: Math.random() * 20 + 25,
    clickRate: Math.random() * 10 + 5,
    conversionRate: Math.random() * 5 + 1
  })),
  channelDistribution: [
    { name: 'Email', value: 45, color: '#8884d8' },
    { name: 'SMS', value: 30, color: '#82ca9d' },
    { name: 'Voice', value: 15, color: '#ffc658' },
    { name: 'Web Push', value: 10, color: '#ff7300' }
  ],
  audienceSegments: [
    { name: 'New Customers', count: 12543, percentage: 35 },
    { name: 'Returning Customers', count: 18765, percentage: 52 },
    { name: 'High Value', count: 4321, percentage: 12 },
    { name: 'At Risk', count: 543, percentage: 1 }
  ],
  funnel: {
    steps: [
      { name: 'Messages Sent', value: 45672, fill: '#8884d8' },
      { name: 'Delivered', value: 44891, fill: '#82ca9d' },
      { name: 'Opened', value: 14545, fill: '#ffc658' },
      { name: 'Clicked', value: 3976, fill: '#ff7300' },
      { name: 'Converted', value: 1461, fill: '#0088fe' }
    ],
    trendsData: Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
      sent: Math.floor(Math.random() * 1000 + 5000),
      opened: Math.floor(Math.random() * 500 + 1500),
      clicked: Math.floor(Math.random() * 200 + 300),
      converted: Math.floor(Math.random() * 100 + 150)
    }))
  },
  abTests: [
    {
      id: 'test_1',
      name: 'Subject Line A/B Test',
      status: 'completed',
      confidence: 95,
      sampleSize: 10000,
      duration: 7,
      variants: [
        {
          id: 'variant_a',
          name: 'Control (Original)',
          participants: 5000,
          conversionRate: 3.2,
          revenuePerUser: 25.40,
          significance: 0,
          isWinner: false
        },
        {
          id: 'variant_b',
          name: 'Variant B (Emoji)',
          participants: 5000,
          conversionRate: 4.1,
          revenuePerUser: 32.15,
          significance: 95,
          isWinner: true
        }
      ]
    },
    {
      id: 'test_2',
      name: 'CTA Button Color Test',
      status: 'running',
      confidence: 78,
      sampleSize: 5000,
      duration: 4,
      variants: [
        {
          id: 'variant_c',
          name: 'Control (Blue)',
          participants: 2500,
          conversionRate: 2.8,
          revenuePerUser: 22.80,
          significance: 0,
          isWinner: false
        },
        {
          id: 'variant_d',
          name: 'Variant D (Orange)',
          participants: 2500,
          conversionRate: 3.4,
          revenuePerUser: 28.50,
          significance: 78,
          isWinner: false
        }
      ]
    }
  ],
  engagement: {
    overview: [
      { label: 'Avg. Time Spent', value: '2m 34s', change: '+12%', trend: 'up', icon: Clock, color: 'blue' },
      { label: 'Bounce Rate', value: '23.4%', change: '-5%', trend: 'up', icon: TrendingDown, color: 'green' },
      { label: 'Pages per Session', value: '3.2', change: '+8%', trend: 'up', icon: Eye, color: 'purple' },
      { label: 'Return Visitors', value: '64%', change: '+15%', trend: 'up', icon: Users, color: 'orange' }
    ],
    heatmapData: Array.from({ length: 168 }, (_, i) => ({
      hour: i % 24,
      day: Math.floor(i / 24),
      engagement: Math.random() * 100
    })),
    deviceTypes: [
      { name: 'Mobile', value: 65, color: '#8884d8' },
      { name: 'Desktop', value: 28, color: '#82ca9d' },
      { name: 'Tablet', value: 7, color: '#ffc658' }
    ],
    geographic: [
      { country: 'United States', city: 'New York', percentage: 35 },
      { country: 'United Kingdom', city: 'London', percentage: 18 },
      { country: 'Canada', city: 'Toronto', percentage: 12 },
      { country: 'Australia', city: 'Sydney', percentage: 8 },
      { country: 'Germany', city: 'Berlin', percentage: 6 }
    ]
  },
  revenue: {
    overview: [
      { label: 'Total Revenue', value: '$127,589', change: '+18.9%', trend: 'up' },
      { label: 'Revenue per Customer', value: '$87.32', change: '+12.4%', trend: 'up' },
      { label: 'Average Order Value', value: '$156.78', change: '+5.2%', trend: 'up' },
      { label: 'Lifetime Value', value: '$342.15', change: '+8.7%', trend: 'up' }
    ],
    trends: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      revenue: Math.random() * 5000 + 3000
    }))
  },
  channels: {
    performance: [
      { channel: 'Email', openRate: 32.4, clickRate: 8.7, conversionRate: 3.2 },
      { channel: 'SMS', openRate: 85.2, clickRate: 12.4, conversionRate: 4.8 },
      { channel: 'Voice', openRate: 95.8, clickRate: 0, conversionRate: 8.2 },
      { channel: 'Web Push', openRate: 45.6, clickRate: 6.3, conversionRate: 2.1 }
    ],
    details: [
      {
        name: 'Email Marketing',
        icon: Mail,
        messagesSent: 25678,
        deliveryRate: 98.2,
        engagementScore: 7.8,
        costPerEngagement: 0.12,
        roi: 280
      },
      {
        name: 'SMS Marketing',
        icon: MessageSquare,
        messagesSent: 15432,
        deliveryRate: 99.1,
        engagementScore: 8.9,
        costPerEngagement: 0.08,
        roi: 420
      },
      {
        name: 'Voice Calls',
        icon: Phone,
        messagesSent: 3245,
        deliveryRate: 87.3,
        engagementScore: 9.2,
        costPerEngagement: 1.25,
        roi: 340
      },
      {
        name: 'Web Push',
        icon: Globe,
        messagesSent: 8765,
        deliveryRate: 92.4,
        engagementScore: 6.5,
        costPerEngagement: 0.03,
        roi: 180
      }
    ]
  }
};

export default CampaignAnalytics;
