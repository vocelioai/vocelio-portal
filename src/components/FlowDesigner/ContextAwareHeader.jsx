import React from 'react';
import { 
  Play, 
  Save, 
  Upload, 
  Palette, 
  TestTube, 
  BarChart3, 
  Settings,
  Eye,
  Zap,
  Users,
  Brain
} from 'lucide-react';
import { useUIState, MODES } from '../../hooks/useUIState';

const ContextAwareHeader = ({
  isDarkMode,
  copyId,
  showModal,
  performAutoLayout,
  exportFlow,
  setFlowTemplateBrowserOpen,
  setAnalyticsOpen,
  setCollaborationOpen,
  setAiOptimizerOpen,
  setAdvancedNodesOpen,
  sidebarItems
}) => {
  const { state, actions } = useUIState();
  const { activeMode, selectedNodes, contextualTools } = state;

  // Mode configuration
  const modeConfig = {
    [MODES.DESIGN]: {
      label: 'Design Mode',
      icon: <Palette size={16} />,
      color: 'blue',
      description: 'Create and edit your flow',
      actions: [
        { label: 'Save', icon: <Save size={16} />, action: () => {}, variant: 'secondary' },
        { label: 'Test', icon: <Play size={16} />, action: () => actions.setMode(MODES.TEST), variant: 'primary' }
      ]
    },
    [MODES.TEST]: {
      label: 'Test Mode',
      icon: <TestTube size={16} />,
      color: 'emerald',
      description: 'Test your flow behavior',
      actions: [
        { label: 'Test Call', icon: <Play size={16} />, action: () => showModal('sendCall'), variant: 'primary' },
        { label: 'Back to Design', icon: <Palette size={16} />, action: () => actions.setMode(MODES.DESIGN), variant: 'secondary' }
      ]
    },
    [MODES.DEPLOY]: {
      label: 'Deploy Mode',
      icon: <Upload size={16} />,
      color: 'purple',
      description: 'Deploy to production',
      actions: [
        { label: 'Deploy', icon: <Upload size={16} />, action: () => showModal('promoteProduction'), variant: 'primary' },
        { label: 'Back to Design', icon: <Palette size={16} />, action: () => actions.setMode(MODES.DESIGN), variant: 'secondary' }
      ]
    },
    [MODES.DEBUG]: {
      label: 'Debug Mode',
      icon: <BarChart3 size={16} />,
      color: 'amber',
      description: 'Monitor and analyze',
      actions: [
        { label: 'Analytics', icon: <BarChart3 size={16} />, action: () => setAnalyticsOpen(true), variant: 'primary' },
        { label: 'Back to Design', icon: <Palette size={16} />, action: () => actions.setMode(MODES.DESIGN), variant: 'secondary' }
      ]
    }
  };

  const currentMode = modeConfig[activeMode];

  // Quick access tools based on mode
  const getQuickTools = () => {
    switch (activeMode) {
      case MODES.DESIGN:
        return [
          { label: 'Node Library', icon: '📋', action: () => sidebarItems.find(item => item.label === 'Node Library')?.action() },
          { label: 'Templates', icon: '🗂️', action: () => setFlowTemplateBrowserOpen(true) },
          { label: 'Auto Layout', icon: '⚡', action: performAutoLayout }
        ];
      case MODES.TEST:
        return [
          { label: 'Test Pathway', icon: '🧪', action: () => showModal('testPathway') },
          { label: 'Web Client', icon: '🌐', action: () => showModal('webClient') },
          { label: 'Global Prompt', icon: '🌍', action: () => showModal('globalPrompt') }
        ];
      case MODES.DEPLOY:
        return [
          { label: 'Production Manager', icon: '📊', action: () => sidebarItems.find(item => item.label === 'Production Manager')?.action() },
          { label: 'Phone Setup', icon: '📞', action: () => sidebarItems.find(item => item.label === 'Phone → Flow Setup')?.action() }
        ];
      case MODES.DEBUG:
        return [
          { label: 'Flow Analytics', icon: '📊', action: () => setAnalyticsOpen(true) },
          { label: 'Context Analytics', icon: '📈', action: () => sidebarItems.find(item => item.label === 'Context Analytics')?.action() },
          { label: 'AI Optimizer', icon: '🧠', action: () => setAiOptimizerOpen(true) }
        ];
      default:
        return [];
    }
  };

  const getColorClasses = (color, variant = 'primary') => {
    const colors = {
      blue: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
        accent: 'bg-blue-100 text-blue-800'
      },
      emerald: {
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        secondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
        accent: 'bg-emerald-100 text-emerald-800'
      },
      purple: {
        primary: 'bg-purple-600 hover:bg-purple-700 text-white',
        secondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
        accent: 'bg-purple-100 text-purple-800'
      },
      amber: {
        primary: 'bg-amber-600 hover:bg-amber-700 text-white',
        secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
        accent: 'bg-amber-100 text-amber-800'
      }
    };
    
    return colors[color]?.[variant] || colors.blue[variant];
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'} border-b shadow-xl shadow-gray-100/50`}>
      {/* Mode Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Mode Indicator & Project Info */}
        <div className="flex items-center gap-6">
          {/* Mode Indicator */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getColorClasses(currentMode.color, 'accent')}`}>
              {currentMode.icon}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentMode.label}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentMode.description}
              </p>
            </div>
          </div>

          {/* Project Status */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50">
              Version 1
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200/50">
              Staging
            </span>
            {selectedNodes.length > 0 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200/50">
                {selectedNodes.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Right: Mode Actions */}
        <div className="flex items-center gap-3">
          {currentMode.actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                getColorClasses(currentMode.color, action.variant)
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher & Quick Tools */}
      <div className={`px-6 py-3 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/80 backdrop-blur-sm border-gray-200'} border-t`}>
        <div className="flex items-center justify-between">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            {Object.entries(MODES).map(([key, mode]) => {
              const config = modeConfig[mode];
              const isActive = activeMode === mode;
              
              return (
                <button
                  key={mode}
                  onClick={() => actions.setMode(mode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? `${getColorClasses(config.color, 'secondary')} shadow-md`
                      : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-white hover:shadow-md text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {config.icon}
                  <span className="hidden sm:block">{config.label.replace(' Mode', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Tools for Current Mode */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider mr-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Quick Tools
            </span>
            {getQuickTools().map((tool, idx) => (
              <button
                key={idx}
                onClick={tool.action}
                title={tool.label}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tool.icon}</span>
                <span className="hidden md:block">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contextual Selection Tools */}
      {selectedNodes.length > 0 && (
        <div className={`px-6 py-2 ${isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50/80 border-blue-200/50'} border-t`}>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected:
            </span>
            <div className="flex items-center gap-2">
              {contextualTools.filter(tool => tool.priority === 'high').map((tool, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isDarkMode
                      ? 'bg-blue-700 hover:bg-blue-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextAwareHeader;
