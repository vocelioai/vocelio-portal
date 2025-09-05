import React, { useState, useEffect, Suspense } from 'react';
import { 
  Sparkles, Rocket, Zap, Brain, Users, BarChart3, 
  Shield, Globe, Smartphone, Code2, Database, Cloud
} from 'lucide-react';

const Phase3FlowBuilderEnhancementsLite = ({ 
  onFeatureToggle, 
  enabledFeatures = [],
  flowData,
  onFlowUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingFeatures, setLoadingFeatures] = useState({});

  const phase3Features = [
    {
      id: 'ai-assistant',
      name: 'AI Flow Assistant',
      description: 'Get intelligent suggestions while building your flow',
      icon: Brain,
      category: 'AI',
      status: 'beta',
      impact: 'high'
    },
    {
      id: 'real-time-collab',
      name: 'Real-time Collaboration',
      description: 'Work together with your team in real-time',
      icon: Users,
      category: 'Collaboration',
      status: 'stable',
      impact: 'high'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Deep insights into flow performance and user behavior',
      icon: BarChart3,
      category: 'Analytics',
      status: 'stable',
      impact: 'medium'
    },
    {
      id: 'mobile-builder',
      name: 'Mobile Flow Builder',
      description: 'Build and edit flows on mobile devices',
      icon: Smartphone,
      category: 'Mobile',
      status: 'alpha',
      impact: 'medium'
    },
    {
      id: 'enterprise-security',
      name: 'Enterprise Security',
      description: 'Advanced security features for enterprise deployments',
      icon: Shield,
      category: 'Security',
      status: 'stable',
      impact: 'high'
    },
    {
      id: 'global-deployment',
      name: 'Global Deployment',
      description: 'Deploy your flows to multiple regions worldwide',
      icon: Globe,
      category: 'Infrastructure',
      status: 'beta',
      impact: 'medium'
    }
  ];

  const handleFeatureToggle = async (featureId) => {
    setLoadingFeatures(prev => ({ ...prev, [featureId]: true }));
    
    // Simulate feature toggle
    setTimeout(() => {
      if (onFeatureToggle) {
        onFeatureToggle(featureId, !enabledFeatures.includes(featureId));
      }
      setLoadingFeatures(prev => ({ ...prev, [featureId]: false }));
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-700';
      case 'beta': return 'bg-blue-100 text-blue-700';
      case 'alpha': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'AI': return 'bg-purple-500';
      case 'Collaboration': return 'bg-blue-500';
      case 'Analytics': return 'bg-green-500';
      case 'Mobile': return 'bg-orange-500';
      case 'Security': return 'bg-red-500';
      case 'Infrastructure': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Phase 3 Enhancements</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Unlock advanced features to supercharge your flow building experience with enterprise-grade capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phase3Features.map((feature) => {
          const IconComponent = feature.icon;
          const isEnabled = enabledFeatures.includes(feature.id);
          const isLoading = loadingFeatures[feature.id];

          return (
            <div
              key={feature.id}
              className={`border rounded-lg p-4 transition-all ${
                isEnabled ? 'border-purple-200 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(feature.category)}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                  {feature.impact === 'high' && (
                    <Zap className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">{feature.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{feature.category}</span>
                <button
                  onClick={() => handleFeatureToggle(feature.id)}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isEnabled 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? '...' : isEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const FeaturesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Feature Management</h3>
        <div className="text-sm text-gray-500">
          {enabledFeatures.length} of {phase3Features.length} features enabled
        </div>
      </div>

      <div className="space-y-4">
        {phase3Features.map((feature) => {
          const IconComponent = feature.icon;
          const isEnabled = enabledFeatures.includes(feature.id);
          const isLoading = loadingFeatures[feature.id];

          return (
            <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(feature.category)}`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {feature.impact === 'high' && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">High Impact</span>
                  </div>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleFeatureToggle(feature.id)}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', component: OverviewTab },
    { id: 'features', label: 'Features', component: FeaturesTab }
  ];

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-purple-600" />
          Phase 3 Flow Builder
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Advanced features and enterprise capabilities for power users
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        }>
          {tabs.find(tab => tab.id === activeTab)?.component()}
        </Suspense>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>Phase 3 Enhancement Suite v3.0.0</div>
          <div>{enabledFeatures.length} features active</div>
        </div>
      </div>
    </div>
  );
};

export default Phase3FlowBuilderEnhancementsLite;
