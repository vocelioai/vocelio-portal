import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, Users, Zap, Award, AlertTriangle, CheckCircle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const ContextAnalyticsDashboard = ({ 
  contexts, 
  usageData, 
  onOptimizeContext, 
  onGenerateTemplate,
  isVisible,
  onClose 
}) => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible && contexts) {
      generateAnalytics();
    }
  }, [isVisible, contexts, usageData, timeRange]);

  const generateAnalytics = async () => {
    setLoading(true);
    
    // Simulate analytics processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAnalytics = {
      overview: {
        total_contexts: Object.keys(contexts).length,
        total_usage: 1247,
        average_conversion_rate: 0.73,
        active_contexts: Math.floor(Object.keys(contexts).length * 0.8),
        last_updated: new Date().toISOString()
      },
      topPerformers: [
        { context_id: 'healthcare-1', context_name: 'Healthcare Support', conversion_rate: 0.89, usage_count: 234, success_factors: ['Specific instructions', 'Includes examples'] },
        { context_id: 'sales-1', context_name: 'B2B Sales', conversion_rate: 0.85, usage_count: 198, success_factors: ['Strong directive language', 'Optimal length'] },
        { context_id: 'support-1', context_name: 'Customer Support', conversion_rate: 0.82, usage_count: 312, success_factors: ['Includes examples', 'Professional tone'] },
        { context_id: 'finance-1', context_name: 'Financial Advisor', conversion_rate: 0.78, usage_count: 156, success_factors: ['Specific instructions', 'Compliance focused'] },
        { context_id: 'retail-1', context_name: 'Retail Assistant', conversion_rate: 0.75, usage_count: 287, success_factors: ['Optimal length', 'Customer-focused'] }
      ],
      improvements: [
        { context_id: 'general-1', context_name: 'General Assistant', suggestions: ['Add more detailed guidance and examples', 'Include specific examples or scenarios'] },
        { context_id: 'marketing-1', context_name: 'Marketing Helper', suggestions: ['Add clearer directives and expectations', 'Consider adding dynamic variables'] }
      ],
      trends: {
        usage_trend: [
          { date: '2024-01-01', usage: 145, conversion: 0.65 },
          { date: '2024-01-02', usage: 167, conversion: 0.68 },
          { date: '2024-01-03', usage: 189, conversion: 0.71 },
          { date: '2024-01-04', usage: 203, conversion: 0.73 },
          { date: '2024-01-05', usage: 225, conversion: 0.76 },
          { date: '2024-01-06', usage: 198, conversion: 0.74 },
          { date: '2024-01-07', usage: 234, conversion: 0.78 }
        ],
        category_performance: [
          { category: 'Healthcare', usage: 356, conversion: 0.89, growth: 15.2 },
          { category: 'Sales', usage: 298, conversion: 0.85, growth: 12.8 },
          { category: 'Support', usage: 423, conversion: 0.82, growth: 8.4 },
          { category: 'Finance', usage: 234, conversion: 0.78, growth: 6.2 },
          { category: 'Marketing', usage: 189, conversion: 0.71, growth: -2.1 }
        ]
      },
      insights: [
        {
          type: 'success',
          title: 'High-Converting Templates Identified',
          description: '5 templates show >75% conversion rates. Healthcare and Sales contexts are particularly effective.',
          action: 'Use these patterns for new context creation'
        },
        {
          type: 'warning',
          title: 'Marketing Context Needs Optimization',
          description: 'Marketing contexts show declining performance (-2.1% growth).',
          action: 'Consider AI optimization or template refresh'
        },
        {
          type: 'optimization',
          title: 'Peak Usage During Business Hours',
          description: 'Usage spikes between 9-11 AM and 2-4 PM.',
          action: 'Schedule maintenance outside peak hours'
        }
      ]
    };
    
    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-400`} />
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => {
    const iconMap = {
      success: CheckCircle,
      warning: AlertTriangle,
      optimization: Zap
    };
    const colorMap = {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      optimization: 'text-blue-400'
    };
    
    const Icon = iconMap[insight.type];
    
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 mt-0.5 ${colorMap[insight.type]}`} />
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
            <p className="text-gray-300 text-xs mt-1">{insight.description}</p>
            <p className="text-blue-400 text-xs mt-2 font-medium">{insight.action}</p>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl w-full max-w-7xl h-[90vh] border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Context Analytics Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Analyzing context performance...</p>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total Contexts"
                value={analytics.overview.total_contexts}
                change={8.2}
                icon={Target}
                color="blue"
              />
              <MetricCard
                title="Total Usage"
                value={analytics.overview.total_usage.toLocaleString()}
                change={15.3}
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="Avg Conversion"
                value={`${(analytics.overview.average_conversion_rate * 100).toFixed(1)}%`}
                change={5.7}
                icon={TrendingUp}
                color="purple"
              />
              <MetricCard
                title="Active Contexts"
                value={analytics.overview.active_contexts}
                change={3.1}
                icon={Users}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Usage Trend Chart */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Usage & Conversion Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.trends.usage_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="#3B82F6" 
                      fill="url(#blueGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2 text-purple-400" />
                  Category Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.trends.category_performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="category" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Bar dataKey="conversion" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Performers & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Contexts */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Top Performing Contexts
                </h3>
                <div className="space-y-3">
                  {analytics.topPerformers.map((context, index) => (
                    <div key={context.context_id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="bg-yellow-400/20 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-white">{context.context_name}</h4>
                        </div>
                        <span className="text-green-400 font-semibold">
                          {(context.conversion_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 ml-9">
                        {context.usage_count} uses • {context.success_factors.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-400" />
                  Actionable Insights
                </h3>
                <div className="space-y-3">
                  {analytics.insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                  ))}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onGenerateTemplate && onGenerateTemplate()}
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg px-3 py-2 text-blue-400 text-xs transition-colors"
                    >
                      Generate New Template
                    </button>
                    <button
                      onClick={() => onOptimizeContext && onOptimizeContext()}
                      className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg px-3 py-2 text-purple-400 text-xs transition-colors"
                    >
                      Optimize Contexts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextAnalyticsDashboard;
