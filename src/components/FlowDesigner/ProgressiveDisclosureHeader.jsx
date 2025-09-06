import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Save, 
  Upload, 
  MoreHorizontal, 
  ChevronDown,
  Palette, 
  TestTube, 
  BarChart3, 
  Settings,
  Copy,
  Eye,
  Zap,
  Users,
  Brain,
  Layers,
  Home,
  Menu,
  X
} from 'lucide-react';

const ProgressiveDisclosureHeader = ({
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
  executionMonitorVisible,
  setExecutionMonitorVisible,
  setShowAdvancedPanel,
  setAdvancedTab,
  sidebarItems
}) => {
  const [activeMode, setActiveMode] = useState('design');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsCompactMode(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode definitions with progressive disclosure
  const modes = {
    design: {
      label: 'Design',
      icon: <Palette size={16} />,
      color: 'blue',
      description: 'Create and edit your flow',
      primary: [
        { id: 'save', label: 'Save', icon: <Save size={16} />, action: () => {}, shortcut: 'Ctrl+S' }
      ],
      secondary: [
        { id: 'test-mode', label: 'Test', icon: <Play size={16} />, action: () => setActiveMode('test') },
        { id: 'deploy-mode', label: 'Deploy', icon: <Upload size={16} />, action: () => setActiveMode('deploy') }
      ],
      tools: [
        { label: 'Node Library', icon: '📋', action: () => sidebarItems.find(item => item.label === 'Node Library')?.action(), priority: 'high' },
        { label: 'Flow Templates', icon: '🗂️', action: () => setFlowTemplateBrowserOpen(true), priority: 'high' },
        { label: 'Auto Layout', icon: '⚡', action: performAutoLayout, priority: 'medium' },
        { label: 'Advanced Nodes', icon: '⚡', action: () => setAdvancedNodesOpen(true), priority: 'medium' }
      ]
    },
    test: {
      label: 'Test',
      icon: <TestTube size={16} />,
      color: 'emerald',
      description: 'Test your flow behavior',
      primary: [
        { id: 'test-call', label: 'Test Call', icon: <Play size={16} />, action: () => showModal('sendCall'), shortcut: 'Ctrl+T' }
      ],
      secondary: [
        { id: 'design-mode', label: 'Design', icon: <Palette size={16} />, action: () => setActiveMode('design') },
        { id: 'deploy-mode', label: 'Deploy', icon: <Upload size={16} />, action: () => setActiveMode('deploy') }
      ],
      tools: [
        { label: 'Test Pathway', icon: '🧪', action: () => showModal('testPathway'), priority: 'high' },
        { label: 'Web Client', icon: '🌐', action: () => showModal('webClient'), priority: 'high' },
        { label: 'Global Prompt', icon: '🌍', action: () => showModal('globalPrompt'), priority: 'medium' },
        { label: 'Send Call', icon: '📞', action: () => showModal('sendCall'), priority: 'medium' }
      ]
    },
    deploy: {
      label: 'Deploy',
      icon: <Upload size={16} />,
      color: 'purple',
      description: 'Deploy to production',
      primary: [
        { id: 'deploy', label: 'Deploy Now', icon: <Upload size={16} />, action: () => showModal('promoteProduction'), shortcut: 'Ctrl+D' }
      ],
      secondary: [
        { id: 'design-mode', label: 'Design', icon: <Palette size={16} />, action: () => setActiveMode('design') },
        { id: 'test-mode', label: 'Test', icon: <TestTube size={16} />, action: () => setActiveMode('test') }
      ],
      tools: [
        { label: 'Production Manager', icon: '📊', action: () => sidebarItems.find(item => item.label === 'Production Manager')?.action(), priority: 'high' },
        { label: 'Phone Setup', icon: '📞', action: () => sidebarItems.find(item => item.label === 'Phone → Flow Setup')?.action(), priority: 'high' },
        { label: 'Sync Status', icon: '🔄', action: () => sidebarItems.find(item => item.label === 'Sync Status')?.action(), priority: 'medium' }
      ]
    },
    analyze: {
      label: 'Analyze',
      icon: <BarChart3 size={16} />,
      color: 'amber',
      description: 'Monitor and analyze performance',
      primary: [
        { id: 'analytics', label: 'View Analytics', icon: <BarChart3 size={16} />, action: () => setAnalyticsOpen(true) }
      ],
      secondary: [
        { id: 'design-mode', label: 'Design', icon: <Palette size={16} />, action: () => setActiveMode('design') },
        { id: 'test-mode', label: 'Test', icon: <TestTube size={16} />, action: () => setActiveMode('test') }
      ],
      tools: [
        { label: 'Flow Analytics', icon: '📊', action: () => setAnalyticsOpen(true), priority: 'high' },
        { label: 'Context Analytics', icon: '📈', action: () => sidebarItems.find(item => item.label === 'Context Analytics')?.action(), priority: 'high' },
        { label: 'AI Optimizer', icon: '🧠', action: () => setAiOptimizerOpen(true), priority: 'medium' },
        { label: 'Collaborate', icon: '👥', action: () => setCollaborationOpen(true), priority: 'medium' }
      ]
    }
  };

  const currentMode = modes[activeMode];

  // Utility actions (always available)
  const utilityActions = [
    { label: 'Copy ID', icon: <Copy size={16} />, action: copyId },
    { label: 'Export Flow', icon: '💾', action: exportFlow },
    { label: 'Settings', icon: <Settings size={16} />, action: () => setShowAdvancedPanel(true) }
  ];

  const getColorClasses = (color, variant = 'primary') => {
    const colors = {
      blue: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300',
        accent: 'bg-blue-100 text-blue-800 border border-blue-200'
      },
      emerald: {
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300',
        accent: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      },
      purple: {
        primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300',
        accent: 'bg-purple-100 text-purple-800 border border-purple-200'
      },
      amber: {
        primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300',
        accent: 'bg-amber-100 text-amber-800 border border-amber-200'
      }
    };
    
    return colors[color]?.[variant] || colors.blue[variant];
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const ToolsDropdown = ({ tools, isActive }) => (
    <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${isActive ? 'block' : 'hidden'}`}>
      <div className="p-3">
        <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b mb-2 ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
        }`}>
          {currentMode.label} Tools
        </div>
        
        {/* High Priority Tools */}
        <div className="mb-3">
          {tools.filter(tool => tool.priority === 'high').map((tool, idx) => (
            <button
              key={idx}
              onClick={() => {
                tool.action();
                closeDropdowns();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1 ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{tool.icon}</span>
              <span>{tool.label}</span>
              <span className={`ml-auto px-2 py-1 rounded text-xs ${
                getColorClasses(currentMode.color, 'accent')
              }`}>
                Key
              </span>
            </button>
          ))}
        </div>

        {/* Medium Priority Tools */}
        {tools.filter(tool => tool.priority === 'medium').length > 0 && (
          <div className={`pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {tools.filter(tool => tool.priority === 'medium').map((tool, idx) => (
              <button
                key={idx}
                onClick={() => {
                  tool.action();
                  closeDropdowns();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-1 ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-700'
                }`}
              >
                <span className="text-base">{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'} border-b shadow-xl`}>
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left: Branding & Mode */}
        <div className="flex items-center gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              V
            </div>
            {!isCompactMode && (
              <div>
                <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Flow Designer
                </h1>
              </div>
            )}
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getColorClasses(currentMode.color, 'accent')}`}>
              {currentMode.icon}
            </div>
            {!isCompactMode && (
              <div>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentMode.label} Mode
                </span>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentMode.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Status (Desktop) */}
        {!isCompactMode && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50">
              Version 1
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200/50">
              Staging
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50 animate-pulse">
              ✓ Saved
            </span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Primary Actions */}
          {currentMode.primary.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                getColorClasses(currentMode.color, 'primary')
              }`}
            >
              {action.icon}
              {!isCompactMode && <span>{action.label}</span>}
            </button>
          ))}

          {/* Secondary Actions (Desktop) */}
          {!isCompactMode && currentMode.secondary.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                getColorClasses(currentMode.color, 'secondary')
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}

          {/* Mobile Menu Toggle */}
          {isCompactMode && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Secondary Toolbar (Desktop) */}
      {!isCompactMode && (
        <div className={`px-6 py-3 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/80 backdrop-blur-sm border-gray-200'} border-t`}>
          <div className="flex items-center justify-between">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1">
              {Object.entries(modes).map(([key, mode]) => {
                const isActive = activeMode === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => setActiveMode(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? `${getColorClasses(mode.color, 'secondary')} shadow-md`
                        : isDarkMode
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                        : 'hover:bg-white hover:shadow-md text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tools & Utilities */}
            <div className="flex items-center gap-2">
              {/* Mode Tools */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('tools')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeDropdown === 'tools'
                      ? `${getColorClasses(currentMode.color, 'secondary')} shadow-md`
                      : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'hover:bg-white hover:shadow-md text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Zap size={16} />
                  <span>Tools</span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-150 ${
                      activeDropdown === 'tools' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <ToolsDropdown 
                  tools={currentMode.tools} 
                  isActive={activeDropdown === 'tools'}
                />
              </div>

              {/* Utilities */}
              <div className="flex items-center gap-1">
                {utilityActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    title={action.label}
                    className={`p-2 rounded-lg transition-all duration-150 ${
                      isDarkMode
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isCompactMode && showMobileMenu && (
        <div className={`px-4 py-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
          {/* Mode Switcher */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Switch Mode
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(modes).map(([key, mode]) => {
                const isActive = activeMode === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveMode(key);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? `${getColorClasses(mode.color, 'secondary')}`
                        : isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tools */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentMode.label} Tools
            </h3>
            <div className="space-y-1">
              {currentMode.tools.filter(tool => tool.priority === 'high').map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    tool.action();
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                Version 1
              </span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                Staging
              </span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                ✓ Saved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(activeDropdown || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeDropdowns}
        />
      )}
    </div>
  );
};

export default ProgressiveDisclosureHeader;
