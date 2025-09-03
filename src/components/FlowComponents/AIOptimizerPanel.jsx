import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, TrendingUp, Settings, Lightbulb, 
  CheckCircle, X, Play, Pause, RotateCcw,
  Target, Clock, DollarSign, Users, Activity,
  ArrowUp, ArrowDown, AlertTriangle, Sparkles,
  Wand2, BarChart3, FileText, Download
} from 'lucide-react';

const AIOptimizerPanel = ({ isDarkMode, flowData }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);

  const mockSuggestions = [
    {
      id: 1,
      type: 'performance',
      title: 'Reduce Call Duration by 23%',
      description: 'Combine 3 consecutive Say nodes into a single optimized message',
      impact: 'High',
      effort: 'Low',
      savings: '$1,240/month',
      confidence: 95,
      details: 'Analysis shows users prefer concise messages. Current flow has redundant greetings.',
      before: 'Hello... Welcome to our service... How can we help you today?',
      after: 'Hello! Welcome to our service. How can we help you today?'
    },
    {
      id: 2,
      type: 'personalization',
      title: 'Add Smart Caller Recognition',
      description: 'Use caller ID and history to personalize interactions',
      impact: 'High',
      effort: 'Medium',
      savings: '$2,100/month',
      confidence: 88,
      details: 'Returning customers respond 40% better to personalized greetings.',
      implementation: 'Add caller lookup node before greeting'
    },
    {
      id: 3,
      type: 'analytics',
      title: 'Optimize Decision Paths',
      description: 'Reorder decision logic based on most common responses',
      impact: 'Medium',
      effort: 'Low',
      savings: '$850/month',
      confidence: 92,
      details: '73% of callers select option 2 first. Move it to the top.'
    },
    {
      id: 4,
      type: 'ai_enhancement',
      title: 'Enable Voice Sentiment Analysis',
      description: 'Detect caller emotion and adjust flow accordingly',
      impact: 'High',
      effort: 'High',
      savings: '$3,200/month',
      confidence: 82,
      details: 'Route frustrated callers directly to human agents to improve satisfaction.'
    }
  ];

  const performanceMetrics = {
    currentEfficiency: 74,
    potentialEfficiency: 91,
    currentCost: '$4,250/month',
    potentialSavings: '$1,890/month',
    avgCallDuration: '4m 23s',
    optimizedDuration: '3m 12s',
    conversionRate: 23.4,
    optimizedConversion: 31.8
  };

  const recentOptimizations = [
    { id: 1, title: 'Streamlined Welcome Flow', applied: '2h ago', impact: '+12% efficiency', status: 'active' },
    { id: 2, title: 'Smart Timeout Handling', applied: '1d ago', impact: '+8% completion', status: 'active' },
    { id: 3, title: 'Voice Speed Optimization', applied: '3d ago', impact: '+15% engagement', status: 'active' }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'personalization': return <Users className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'ai_enhancement': return <Sparkles className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-600';
      case 'personalization': return 'bg-purple-100 text-purple-600';
      case 'analytics': return 'bg-green-100 text-green-600';
      case 'ai_enhancement': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleOptimize = async (suggestionId) => {
    setIsOptimizing(true);
    // Simulate optimization process
    setTimeout(() => {
      setAppliedOptimizations([...appliedOptimizations, suggestionId]);
      setIsOptimizing(false);
    }, 2000);
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Flow Optimizer
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptimizing(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                isOptimizing ? 'bg-purple-100 text-purple-600' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Optimize
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Efficiency</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{performanceMetrics.currentEfficiency}%</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${performanceMetrics.currentEfficiency}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Potential Savings</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-600">{performanceMetrics.potentialSavings}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mt-3 gap-1">
          {[
            { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'history', label: 'Applied', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {mockSuggestions.map((suggestion) => (
              <div key={suggestion.id} className={`border rounded-lg ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} Impact
                      </span>
                      <span className="text-xs font-medium text-green-600">{suggestion.savings}</span>
                    </div>
                  </div>
                  
                  {/* Confidence & Details */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">AI Confidence</span>
                      <span className="font-medium">{suggestion.confidence}%</span>
                    </div>
                    <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5`}>
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full" 
                        style={{ width: `${suggestion.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg text-xs ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-gray-600 dark:text-gray-300">{suggestion.details}</p>
                    {suggestion.before && (
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-medium text-red-600">Before: </span>
                          <span className="text-gray-500">"{suggestion.before}"</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">After: </span>
                          <span className="text-gray-700 dark:text-gray-300">"{suggestion.after}"</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Effort: {suggestion.effort}</span>
                      <span>•</span>
                      <span>ROI: 340%</span>
                    </div>
                    <div className="flex gap-2">
                      <button className={`px-3 py-1 rounded text-xs font-medium border ${
                        isDarkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
                      }`}>
                        Learn More
                      </button>
                      <button
                        onClick={() => handleOptimize(suggestion.id)}
                        disabled={appliedOptimizations.includes(suggestion.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          appliedOptimizations.includes(suggestion.id)
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {appliedOptimizations.includes(suggestion.id) ? (
                          <>
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Applied
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Key Metrics Comparison */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance Comparison
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { 
                    label: 'Flow Efficiency', 
                    current: performanceMetrics.currentEfficiency, 
                    optimized: performanceMetrics.potentialEfficiency,
                    unit: '%',
                    icon: Target
                  },
                  { 
                    label: 'Avg Call Duration', 
                    current: '4m 23s', 
                    optimized: '3m 12s',
                    unit: '',
                    icon: Clock
                  },
                  { 
                    label: 'Conversion Rate', 
                    current: performanceMetrics.conversionRate, 
                    optimized: performanceMetrics.optimizedConversion,
                    unit: '%',
                    icon: TrendingUp
                  }
                ].map((metric, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-sm">{metric.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-500 text-xs">Current: </span>
                        <span className="font-semibold">{metric.current}{metric.unit}</span>
                      </div>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                      <div>
                        <span className="text-gray-500 text-xs">Optimized: </span>
                        <span className="font-semibold text-green-600">{metric.optimized}{metric.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Impact Analysis
              </h4>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Current Monthly Cost</span>
                    <div className="text-lg font-semibold">{performanceMetrics.currentCost}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Potential Monthly Savings</span>
                    <div className="text-lg font-semibold text-green-600">{performanceMetrics.potentialSavings}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-500">Annual Savings Projection</span>
                  <div className="text-xl font-bold text-green-600">$22,680</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Applied Optimizations
            </h4>
            <div className="space-y-3">
              {recentOptimizations.map((opt) => (
                <div key={opt.id} className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{opt.title}</h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      opt.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {opt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Applied {opt.applied}</span>
                    <span className="font-medium text-green-600">{opt.impact}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Export Report */}
            <button className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
              isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <Download className="w-4 h-4" />
              <span className="font-medium">Export Optimization Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
    <div className={`h-full p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        AI Optimizer
      </h3>

      <div className="space-y-6">
        {/* AI Score */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Flow Optimization Score</h4>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-lg font-bold text-blue-600">8.7/10</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Your flow is well-optimized! Consider the suggestions below for further improvement.</p>
        </div>

        {/* AI Suggestions */}
        <div>
          <h4 className="font-medium mb-3">AI Suggestions ({mockSuggestions.length})</h4>
          <div className="space-y-3">
            {mockSuggestions.map((suggestion) => (
              <div key={suggestion.id} className={`p-3 rounded-lg border ${
                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm mb-1">{suggestion.title}</h5>
                    <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} Impact
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.effort} Effort
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className={`flex-1 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}>
                    Apply
                  </button>
                  <button className={`flex-1 py-1 text-xs rounded border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-600' 
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Optimization */}
        <div>
          <h4 className="font-medium mb-3">Auto-Optimization</h4>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Enable AI auto-optimization</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600">
              Automatically apply low-risk optimizations to improve performance
            </p>
          </div>
        </div>

        {/* Performance Insights */}
        <div>
          <h4 className="font-medium mb-3">Performance Insights</h4>
          <div className="space-y-2">
            <div className={`p-2 rounded text-sm ${isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`}>
              ✓ Flow completion rate: 89.3%
            </div>
            <div className={`p-2 rounded text-sm ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              ⓘ Average call duration: 3m 24s
            </div>
            <div className={`p-2 rounded text-sm ${isDarkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
              ⚠ 15% drop-off at decision node
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOptimizerPanel;
