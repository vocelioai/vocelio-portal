import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Target,
  DollarSign,
  Calendar,
  Clock,
  Eye,
  MousePointer,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react';

const CampaignAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Mock data for demonstration
  const mockAnalyticsData = {
    overview: {
      totalCampaigns: 24,
      totalContacts: 15420,
      totalCalls: 8540,
      conversionRate: 23.4,
      averageCallDuration: 185, // seconds
      totalRevenue: 45680.50,
      trendsFromPrevious: {
        campaigns: 12.5,
        contacts: 8.2,
        calls: -3.1,
        conversionRate: 5.7,
        callDuration: 15.2,
        revenue: 18.9
      }
    },
    campaignPerformance: [
      { name: 'Product Launch', calls: 1250, conversions: 340, revenue: 15420, conversionRate: 27.2 },
      { name: 'Holiday Sale', calls: 980, conversions: 245, revenue: 8950, conversionRate: 25.0 },
      { name: 'Lead Nurturing', calls: 2100, conversions: 420, revenue: 12300, conversionRate: 20.0 },
      { name: 'Customer Retention', calls: 1800, conversions: 378, revenue: 18750, conversionRate: 21.0 },
      { name: 'Cold Outreach', calls: 1410, conversions: 198, revenue: 5680, conversionRate: 14.0 },
    ],
    dailyMetrics: [
      { date: '2024-01-01', calls: 145, conversions: 32, revenue: 1250 },
      { date: '2024-01-02', calls: 178, conversions: 41, revenue: 1680 },
      { date: '2024-01-03', calls: 134, conversions: 28, revenue: 980 },
      { date: '2024-01-04', calls: 198, conversions: 52, revenue: 2100 },
      { date: '2024-01-05', calls: 167, conversions: 38, revenue: 1520 },
      { date: '2024-01-06', calls: 189, conversions: 45, revenue: 1890 },
      { date: '2024-01-07', calls: 156, conversions: 35, revenue: 1420 },
    ],
    channelDistribution: [
      { name: 'Phone Calls', value: 45, count: 3840 },
      { name: 'SMS', value: 30, count: 2560 },
      { name: 'Email', value: 15, count: 1280 },
      { name: 'WhatsApp', value: 10, count: 854 }
    ],
    hourlyActivity: [
      { hour: '9 AM', calls: 45, conversions: 8 },
      { hour: '10 AM', calls: 78, conversions: 15 },
      { hour: '11 AM', calls: 92, conversions: 21 },
      { hour: '12 PM', calls: 67, conversions: 12 },
      { hour: '1 PM', calls: 54, conversions: 9 },
      { hour: '2 PM', calls: 89, conversions: 19 },
      { hour: '3 PM', calls: 95, conversions: 24 },
      { hour: '4 PM', calls: 76, conversions: 16 },
      { hour: '5 PM', calls: 43, conversions: 7 }
    ]
  };

  useEffect(() => {
    // Simulate loading analytics data
    setIsLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange, selectedCampaign]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) => {
    const isPositive = trend > 0;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          <p className="text-gray-600">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Campaigns</option>
            <option value="product-launch">Product Launch</option>
            <option value="holiday-sale">Holiday Sale</option>
            <option value="lead-nurturing">Lead Nurturing</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={analyticsData.overview.totalCampaigns}
          trend={analyticsData.overview.trendsFromPrevious.campaigns}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Contacts Reached"
          value={analyticsData.overview.totalContacts.toLocaleString()}
          trend={analyticsData.overview.trendsFromPrevious.contacts}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Total Calls"
          value={analyticsData.overview.totalCalls.toLocaleString()}
          trend={analyticsData.overview.trendsFromPrevious.calls}
          icon={Phone}
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          trend={analyticsData.overview.trendsFromPrevious.conversionRate}
          icon={TrendingUp}
          color="yellow"
        />
        <MetricCard
          title="Avg Call Duration"
          value={`${Math.floor(analyticsData.overview.averageCallDuration / 60)}:${(analyticsData.overview.averageCallDuration % 60).toString().padStart(2, '0')}`}
          subtitle="minutes"
          trend={analyticsData.overview.trendsFromPrevious.callDuration}
          icon={Clock}
          color="red"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          trend={analyticsData.overview.trendsFromPrevious.revenue}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : value,
                  name === 'calls' ? 'Calls' : name === 'conversions' ? 'Conversions' : 'Revenue'
                ]}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="calls" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area yAxisId="left" type="monotone" dataKey="conversions" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.channelDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.channelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {analyticsData.channelDistribution.map((channel, index) => (
              <div key={channel.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{channel.name}</span>
                </div>
                <span className="font-medium">{channel.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.campaignPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : name === 'conversionRate' ? `${value}%` : value,
                  name === 'calls' ? 'Calls' : name === 'conversions' ? 'Conversions' : name === 'revenue' ? 'Revenue' : 'Conversion Rate'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="calls" fill="#3B82F6" />
              <Bar yAxisId="left" dataKey="conversions" fill="#10B981" />
              <Bar yAxisId="right" dataKey="conversionRate" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Activity Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Campaign Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Campaign Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RPM</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.campaignPerformance.map((campaign, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.calls.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.conversions.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.conversionRate >= 25 ? 'bg-green-100 text-green-800' :
                      campaign.conversionRate >= 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.conversionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${campaign.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(campaign.revenue / campaign.calls).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalyticsDashboard;