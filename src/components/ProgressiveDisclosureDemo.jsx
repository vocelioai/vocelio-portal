import React, { useState } from 'react';
import ProgressiveDisclosureHeader from './FlowDesigner/ProgressiveDisclosureHeader';
import FlowDesignerHeaderImproved from './FlowDesigner/FlowDesignerHeaderImproved';
import ContextAwareHeader from './FlowDesigner/ContextAwareHeader';
import { UIStateProvider } from '../hooks/useUIState';

const ProgressiveDisclosureDemo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDemo, setActiveDemo] = useState('progressive');

  // Mock functions for demo
  const mockActions = {
    copyId: () => console.log('Copy ID clicked'),
    showModal: (modal) => console.log(`Show modal: ${modal}`),
    performAutoLayout: () => console.log('Auto layout performed'),
    exportFlow: () => console.log('Flow exported'),
    setFlowTemplateBrowserOpen: (open) => console.log(`Template browser: ${open}`),
    setAnalyticsOpen: (open) => console.log(`Analytics: ${open}`),
    setCollaborationOpen: (open) => console.log(`Collaboration: ${open}`),
    setAiOptimizerOpen: (open) => console.log(`AI Optimizer: ${open}`),
    setAdvancedNodesOpen: (open) => console.log(`Advanced Nodes: ${open}`),
    setExecutionMonitorVisible: (visible) => console.log(`Execution Monitor: ${visible}`),
    setShowAdvancedPanel: (show) => console.log(`Advanced Panel: ${show}`),
    setAdvancedTab: (tab) => console.log(`Advanced Tab: ${tab}`)
  };

  const mockSidebarItems = [
    { icon: '📋', label: 'Node Library', action: () => console.log('Node Library') },
    { icon: '🗂️', label: 'Flow Templates', action: () => console.log('Flow Templates') },
    { icon: '⚙️', label: 'Manage Templates', action: () => console.log('Manage Templates') },
    { icon: '🌍', label: 'Global Prompt', action: () => console.log('Global Prompt') },
    { icon: '🎭', label: 'Workflow Contexts', action: () => console.log('Workflow Contexts') },
    { icon: '📚', label: 'Context Library', action: () => console.log('Context Library') },
    { icon: '👥', label: 'Team Collaboration', action: () => console.log('Team Collaboration') },
    { icon: '🔄', label: 'Sync Status', action: () => console.log('Sync Status') },
    { icon: '🎯', label: 'Feature Flags', action: () => console.log('Feature Flags') },
    { icon: '🧪', label: 'Test Pathway', action: () => console.log('Test Pathway') },
    { icon: '📞', label: 'Send Call', action: () => console.log('Send Call') },
    { icon: '🌐', label: 'Web Client', action: () => console.log('Web Client') },
    { icon: '🚀', label: 'Promote to Production', action: () => console.log('Promote to Production') },
    { icon: '📊', label: 'Production Manager', action: () => console.log('Production Manager') },
    { icon: '📞', label: 'Phone → Flow Setup', action: () => console.log('Phone → Flow Setup') },
    { icon: '📊', label: 'Flow Analytics', action: () => console.log('Flow Analytics') },
    { icon: '👥', label: 'Collaborate', action: () => console.log('Collaborate') },
    { icon: '🧠', label: 'AI Optimizer', action: () => console.log('AI Optimizer') },
    { icon: '⚡', label: 'Advanced Nodes', action: () => console.log('Advanced Nodes') },
    { icon: '📈', label: 'Context Analytics', action: () => console.log('Context Analytics') },
    { icon: '🤖', label: 'AI Template Gen', action: () => console.log('AI Template Gen') },
    { icon: '🧬', label: 'Context Inheritance', action: () => console.log('Context Inheritance') },
    { icon: '🎯', label: 'AI Optimize Context', action: () => console.log('AI Optimize Context') }
  ];

  const demos = {
    progressive: {
      title: 'Progressive Disclosure Header',
      description: 'Smart header that adapts to different modes with organized tool access',
      component: ProgressiveDisclosureHeader
    },
    improved: {
      title: 'Improved Header',
      description: 'Enhanced version with better organization and dropdown menus',
      component: FlowDesignerHeaderImproved
    },
    contextAware: {
      title: 'Context-Aware Header',
      description: 'Header that changes based on selection and current workflow state',
      component: ContextAwareHeader
    }
  };

  const DemoComponent = demos[activeDemo].component;

  return (
    <UIStateProvider>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Demo Controls */}
        <div className={`p-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Progressive Disclosure Demo
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Compare different header implementations for the Flow Designer
                </p>
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            {/* Demo Selector */}
            <div className="flex gap-2">
              {Object.entries(demos).map(([key, demo]) => (
                <button
                  key={key}
                  onClick={() => setActiveDemo(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeDemo === key
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>

            {/* Current Demo Description */}
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {demos[activeDemo].title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {demos[activeDemo].description}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="relative">
          <DemoComponent
            isDarkMode={isDarkMode}
            sidebarItems={mockSidebarItems}
            {...mockActions}
          />
          
          {/* Canvas Placeholder */}
          <div className={`h-96 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Flow Designer Canvas</h3>
              <p>This is where your flow design interface would be displayed</p>
              <div className="mt-4 text-sm">
                <p>Try switching modes and exploring the different tool organizations</p>
                <p>Notice how the interface adapts to different workflows</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className={`p-6 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Progressive Disclosure Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">🎯</div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Reduced Complexity
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Only shows relevant tools for the current mode, reducing cognitive load
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">🔄</div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Context-Aware
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Interface adapts based on current workflow stage and user selection
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">📱</div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Responsive Design
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Works seamlessly across desktop, tablet, and mobile devices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UIStateProvider>
  );
};

export default ProgressiveDisclosureDemo;
