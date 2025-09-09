import React, { useState, useCallback, useMemo } from 'react';
import {
  Zap, Plus, Play, Pause, Settings, Edit3, Trash2, Copy,
  Clock, Users, Target, Mail, MessageSquare, Phone, Globe,
  Brain, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Filter, Calendar, BarChart3, Activity, Lightbulb, Cpu,
  Save, Eye, MoreVertical, Search, ArrowRight, ChevronDown,
  ChevronRight, Star, Award, Gauge, Workflow, Repeat
} from 'lucide-react';

// ===== COPILOT PROMPT #6: Automation Rules Engine =====
// AI-powered campaign automation with intelligent optimization

const AutomationRules = () => {
  const [rules, setRules] = useState(mockAutomationRules);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list, grid
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter rules based on search and filters
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
      const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [rules, searchTerm, filterStatus, selectedCategory]);

  const handleCreateRule = useCallback(() => {
    setSelectedRule({
      id: `rule_${Date.now()}`,
      name: 'New Automation Rule',
      description: '',
      category: 'engagement',
      status: 'draft',
      triggers: [],
      conditions: [],
      actions: [],
      performance: { triggered: 0, successful: 0, revenue: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsCreating(true);
  }, []);

  const handleSaveRule = useCallback((ruleData) => {
    setRules(prev => {
      const existing = prev.find(r => r.id === ruleData.id);
      if (existing) {
        return prev.map(r => r.id === ruleData.id ? { ...ruleData, updatedAt: new Date().toISOString() } : r);
      } else {
        return [{ ...ruleData, createdAt: new Date().toISOString() }, ...prev];
      }
    });
    setIsCreating(false);
    setSelectedRule(null);
  }, []);

  const handleDeleteRule = useCallback((ruleId) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null);
      setIsCreating(false);
    }
  }, [selectedRule]);

  const handleToggleRule = useCallback((ruleId) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span>Automation Rules</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              AI-powered campaign automation with intelligent optimization
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateRule}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Rule</span>
            </button>
            <AIOptimizationButton />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="engagement">Engagement</option>
                <option value="conversion">Conversion</option>
                <option value="retention">Retention</option>
                <option value="nurturing">Lead Nurturing</option>
              </select>
              
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <AutomationMetrics rules={rules} />

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Rules List/Grid */}
      {viewMode === 'list' ? (
        <RulesListView
          rules={filteredRules}
          onSelectRule={setSelectedRule}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
        />
      ) : (
        <RulesGridView
          rules={filteredRules}
          onSelectRule={setSelectedRule}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {/* Rule Editor Modal */}
      {(selectedRule || isCreating) && (
        <RuleEditor
          rule={selectedRule}
          isOpen={true}
          onSave={handleSaveRule}
          onCancel={() => {
            setSelectedRule(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
};

// Automation Metrics Component
const AutomationMetrics = ({ rules }) => {
  const metrics = useMemo(() => {
    const activeRules = rules.filter(r => r.status === 'active').length;
    const totalTriggered = rules.reduce((sum, r) => sum + r.performance.triggered, 0);
    const totalSuccessful = rules.reduce((sum, r) => sum + r.performance.successful, 0);
    const totalRevenue = rules.reduce((sum, r) => sum + r.performance.revenue, 0);
    const successRate = totalTriggered > 0 ? (totalSuccessful / totalTriggered * 100).toFixed(1) : 0;
    
    return [
      {
        label: 'Active Rules',
        value: activeRules,
        total: rules.length,
        icon: Zap,
        color: 'blue',
        change: '+2 this week'
      },
      {
        label: 'Rules Triggered',
        value: totalTriggered.toLocaleString(),
        icon: Activity,
        color: 'green',
        change: '+12% vs last month'
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        icon: Target,
        color: 'purple',
        change: '+3.2% improvement'
      },
      {
        label: 'Revenue Generated',
        value: `$${totalRevenue.toLocaleString()}`,
        icon: TrendingUp,
        color: 'emerald',
        change: '+28% vs last month'
      }
    ];
  }, [rules]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`h-5 w-5 text-${metric.color}-600`} />
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {metric.change}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
                {metric.total && (
                  <span className="text-sm text-gray-500 font-normal">/{metric.total}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// AI Recommendations Component
const AIRecommendations = () => {
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  const recommendations = [
    {
      id: 1,
      type: 'optimization',
      title: 'Optimize Email Send Times',
      description: 'AI analysis suggests sending emails 2 hours earlier for 15% better open rates',
      impact: 'High',
      effort: 'Low',
      icon: Clock,
      action: 'Apply Optimization'
    },
    {
      id: 2,
      type: 'new_rule',
      title: 'Cart Abandonment Recovery',
      description: 'Create automated sequence for users who abandon cart after 30 minutes',
      impact: 'Medium',
      effort: 'Medium',
      icon: Target,
      action: 'Create Rule'
    },
    {
      id: 3,
      type: 'improvement',
      title: 'Personalization Enhancement',
      description: 'Add dynamic content based on user behavior patterns for better engagement',
      impact: 'High',
      effort: 'High',
      icon: Brain,
      action: 'View Details'
    }
  ];

  if (!showRecommendations) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            3 New
          </span>
        </div>
        <button
          onClick={() => setShowRecommendations(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div key={rec.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <Icon className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    rec.impact === 'High' ? 'bg-red-100 text-red-800' :
                    rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.impact} Impact
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    rec.effort === 'High' ? 'bg-red-100 text-red-800' :
                    rec.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.effort} Effort
                  </span>
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm">
                {rec.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// AI Optimization Button Component
const AIOptimizationButton = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
  };

  return (
    <button
      onClick={handleOptimize}
      disabled={isOptimizing}
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2 disabled:opacity-50"
    >
      <Brain className={`h-4 w-4 ${isOptimizing ? 'animate-pulse' : ''}`} />
      <span>{isOptimizing ? 'Optimizing...' : 'AI Optimize'}</span>
    </button>
  );
};

// Rules List View Component
const RulesListView = ({ rules, onSelectRule, onToggleRule, onDeleteRule }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <RuleListItem
                key={rule.id}
                rule={rule}
                onSelect={onSelectRule}
                onToggle={onToggleRule}
                onDelete={onDeleteRule}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Rule List Item Component
const RuleListItem = ({ rule, onSelect, onToggle, onDelete }) => {
  const successRate = rule.performance.triggered > 0 
    ? (rule.performance.successful / rule.performance.triggered * 100).toFixed(1)
    : 0;

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(rule)}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100">
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
            <div className="text-sm text-gray-500">{rule.category}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          rule.status === 'active' ? 'bg-green-100 text-green-800' :
          rule.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {rule.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {rule.performance.triggered.toLocaleString()} triggers
        </div>
        <div className="text-sm text-gray-500">
          {successRate}% success rate
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(rule.updatedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(rule.id);
            }}
            className="text-blue-600 hover:text-blue-900"
          >
            {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(rule.id);
            }}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Rules Grid View Component
const RulesGridView = ({ rules, onSelectRule, onToggleRule, onDeleteRule }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rules.map((rule) => (
        <RuleGridCard
          key={rule.id}
          rule={rule}
          onSelect={onSelectRule}
          onToggle={onToggleRule}
          onDelete={onDeleteRule}
        />
      ))}
    </div>
  );
};

// Rule Grid Card Component
const RuleGridCard = ({ rule, onSelect, onToggle, onDelete }) => {
  const successRate = rule.performance.triggered > 0 
    ? (rule.performance.successful / rule.performance.triggered * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{rule.category}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            rule.status === 'active' ? 'bg-green-100 text-green-800' :
            rule.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {rule.status}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{rule.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {rule.performance.triggered.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Triggered</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{successRate}%</div>
          <div className="text-xs text-gray-500">Success Rate</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSelect(rule)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(rule.id)}
            className={`p-1 rounded ${
              rule.status === 'active' 
                ? 'text-yellow-600 hover:bg-yellow-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Rule Editor Component
const RuleEditor = ({ rule, isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState(rule || {});
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {rule?.id ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['general', 'triggers', 'conditions', 'actions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <RuleEditorContent
            activeTab={activeTab}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

// Rule Editor Content Component
const RuleEditorContent = ({ activeTab, formData, setFormData }) => {
  switch (activeTab) {
    case 'general':
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rule name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this rule does"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category || 'engagement'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="engagement">Engagement</option>
                <option value="conversion">Conversion</option>
                <option value="retention">Retention</option>
                <option value="nurturing">Lead Nurturing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Configuration
          </h3>
          <p className="text-gray-500">
            Configure {activeTab} for your automation rule. This feature will be available soon.
          </p>
        </div>
      );
  }
};

// Mock Data
const mockAutomationRules = [
  {
    id: 'rule_1',
    name: 'Welcome Series Automation',
    description: 'Automatically send welcome email series to new subscribers',
    category: 'engagement',
    status: 'active',
    triggers: ['user_signup', 'email_subscription'],
    conditions: ['is_new_user'],
    actions: ['send_email_sequence'],
    performance: { triggered: 1247, successful: 1156, revenue: 23456 },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'rule_2',
    name: 'Cart Abandonment Recovery',
    description: 'Re-engage users who abandon their shopping cart',
    category: 'conversion',
    status: 'active',
    triggers: ['cart_abandoned'],
    conditions: ['cart_value_gt_50'],
    actions: ['send_email', 'send_sms'],
    performance: { triggered: 856, successful: 342, revenue: 18734 },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:45:00Z'
  },
  {
    id: 'rule_3',
    name: 'Dormant User Re-engagement',
    description: 'Win back users who haven\'t engaged in 30 days',
    category: 'retention',
    status: 'paused',
    triggers: ['user_dormant_30d'],
    conditions: ['previous_purchase'],
    actions: ['send_personalized_offer'],
    performance: { triggered: 234, successful: 87, revenue: 5432 },
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-15T13:10:00Z'
  },
  {
    id: 'rule_4',
    name: 'High-Value Customer VIP Treatment',
    description: 'Special treatment for customers with high lifetime value',
    category: 'retention',
    status: 'active',
    triggers: ['purchase_completed'],
    conditions: ['ltv_gt_1000'],
    actions: ['send_vip_email', 'assign_personal_manager'],
    performance: { triggered: 145, successful: 143, revenue: 45678 },
    createdAt: '2024-01-05T12:30:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    id: 'rule_5',
    name: 'Lead Scoring & Qualification',
    description: 'Automatically score and qualify leads based on behavior',
    category: 'nurturing',
    status: 'draft',
    triggers: ['page_visit', 'content_download'],
    conditions: ['engagement_score_gt_50'],
    actions: ['update_lead_score', 'notify_sales_team'],
    performance: { triggered: 0, successful: 0, revenue: 0 },
    createdAt: '2024-01-22T08:15:00Z',
    updatedAt: '2024-01-22T08:15:00Z'
  }
];

export default AutomationRules;
