import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRightLeft, Brain, Users, Target, Clock, Zap, 
  TrendingUp, Settings, Play, Pause, RotateCcw, AlertTriangle,
  CheckCircle, Activity, BarChart3, Filter, Eye
} from 'lucide-react';

// ===== COPILOT PROMPT #3: Intelligent Routing Engine =====
const IntelligentRoutingPanel = ({ isActive }) => {
  const [routingRules, setRoutingRules] = useState([
    {
      id: 1,
      name: 'VIP Customer Priority',
      condition: 'customer.tier === "VIP"',
      action: 'route_to_senior_agent',
      priority: 1,
      active: true,
      matches: 12,
      successRate: 94
    },
    {
      id: 2,
      name: 'Technical Support Routing',
      condition: 'query_type === "technical"',
      action: 'route_to_technical_team',
      priority: 2,
      active: true,
      matches: 45,
      successRate: 87
    },
    {
      id: 3,
      name: 'Language-Based Routing',
      condition: 'customer.language !== "en"',
      action: 'route_to_multilingual_agent',
      priority: 3,
      active: true,
      matches: 23,
      successRate: 91
    }
  ]);

  const [routingMetrics, setRoutingMetrics] = useState({
    totalRouted: 156,
    averageWaitTime: '1:23',
    successRate: 92,
    activeAgents: 8,
    queueLength: 3
  });

  const [aiInsights, setAiInsights] = useState([
    {
      type: 'optimization',
      message: 'Consider adding a rule for billing inquiries during peak hours',
      confidence: 87,
      impact: 'high'
    },
    {
      type: 'pattern',
      message: '73% of video calls are initiated after failed chat sessions',
      confidence: 94,
      impact: 'medium'
    },
    {
      type: 'alert',
      message: 'Agent Sarah J. has 15% higher satisfaction scores for technical issues',
      confidence: 98,
      impact: 'high'
    }
  ]);

  // Mock data for development
  const sessionStats = {
    active: 24,
    pending: 8,
    completed: 156
  };

  const analytics = {
    routingMetrics: {
      totalRouted: 156,
      avgWaitTime: '1:23',
      successRate: 92
    }
  };

  // Toggle routing rule
  const toggleRule = useCallback((ruleId) => {
    setRoutingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, active: !rule.active }
          : rule
      )
    );
    console.log('🧠 Routing: Rule toggled -', ruleId);
  }, []);

  // Get status color
  const getStatusColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get insight icon
  const getInsightIcon = (type) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'pattern': return <BarChart3 className="w-4 h-4 text-purple-600" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Intelligent Routing Engine</h2>
            <p className="text-sm text-gray-600">AI-powered customer routing and optimization</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Play className="w-4 h-4" />
            <span>Active</span>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Routed</p>
              <p className="text-2xl font-bold text-gray-900">{routingMetrics.totalRouted}</p>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">{routingMetrics.averageWaitTime}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{routingMetrics.successRate}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">{routingMetrics.activeAgents}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Queue Length</p>
              <p className="text-2xl font-bold text-orange-600">{routingMetrics.queueLength}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Routing Rules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Routing Rules</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>

        <div className="space-y-3">
          {routingRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    rule.active ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    rule.active ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>

                <div>
                  <p className="font-medium text-gray-900">{rule.name}</p>
                  <p className="text-sm text-gray-600">Priority {rule.priority} • {rule.matches} matches today</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rule.successRate)}`}>
                  {rule.successRate}% success
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Powered by Machine Learning</span>
          </div>
        </div>

        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-900">{insight.message}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-600">
                    Confidence: {insight.confidence}%
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {insight.impact.toUpperCase()} IMPACT
                  </span>
                </div>
              </div>

              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Routing Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-900">VIP customer routed to Sarah J.</span>
              </div>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-900">Technical query resolved successfully</span>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-900">Spanish speaker waiting for agent</span>
              </div>
              <span className="text-xs text-gray-500">3 min ago</span>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Routing Performance</h3>
          <div className="h-48 bg-gradient-to-t from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Performance chart visualization</p>
              <p className="text-xs">Real-time routing analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentRoutingPanel;
