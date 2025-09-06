import React, { useState } from 'react';
import { 
  Copy, 
  Play, 
  Save, 
  Upload, 
  MoreHorizontal, 
  ChevronDown,
  Zap,
  TestTube,
  Settings,
  Users,
  BarChart3,
  Layers,
  Palette,
  Brain,
  Wrench
} from 'lucide-react';

const FlowDesignerHeaderImproved = ({
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
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Organize actions by priority and category
  const primaryActions = [
    {
      id: 'test',
      label: 'Test Call',
      icon: <Play size={16} />,
      action: () => showModal('sendCall'),
      variant: 'primary',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'save',
      label: 'Save',
      icon: <Save size={16} />,
      action: () => {/* Save logic */},
      variant: 'secondary',
      shortcut: 'Ctrl+S'
    },
    {
      id: 'deploy',
      label: 'Deploy',
      icon: <Upload size={16} />,
      action: () => showModal('promoteProduction'),
      variant: 'accent',
      shortcut: 'Ctrl+D'
    }
  ];

  // Organize ALL 23 functions into logical categories
  const toolCategories = [
    {
      id: 'workflow',
      label: 'Workflow & Design',
      icon: <Palette size={16} />,
      items: [
        { label: 'Node Library', icon: '📋', action: () => sidebarItems.find(item => item.label === 'Node Library')?.action() },
        { label: 'Flow Templates', icon: '🗂️', action: () => setFlowTemplateBrowserOpen(true) },
        { label: 'Manage Templates', icon: '⚙️', action: () => sidebarItems.find(item => item.label === 'Manage Templates')?.action() },
        { label: 'Auto Layout', icon: '⚡', action: performAutoLayout },
        { label: 'Advanced Nodes', icon: '⚡', action: () => setAdvancedNodesOpen(true) },
        { label: 'Global Prompt', icon: '🌍', action: () => showModal('globalPrompt') },
        { label: 'Workflow Contexts', icon: '🎭', action: () => sidebarItems.find(item => item.label === 'Workflow Contexts')?.action() },
        { label: 'Context Library', icon: '📚', action: () => sidebarItems.find(item => item.label === 'Context Library')?.action() }
      ]
    },
    {
      id: 'testing',
      label: 'Testing & Validation',
      icon: <TestTube size={16} />,
      items: [
        { label: 'Test Pathway', icon: '🧪', action: () => showModal('testPathway') },
        { label: 'Send Call', icon: '📞', action: () => showModal('sendCall') },
        { label: 'Web Client', icon: '🌐', action: () => showModal('webClient') },
        { label: 'Feature Flags', icon: '�', action: () => sidebarItems.find(item => item.label === 'Feature Flags')?.action() }
      ]
    },
    {
      id: 'deployment',
      label: 'Deployment & Production',
      icon: <Upload size={16} />,
      items: [
        { label: 'Promote to Production', icon: '�', action: () => showModal('promoteProduction') },
        { label: 'Production Manager', icon: '📊', action: () => sidebarItems.find(item => item.label === 'Production Manager')?.action() },
        { label: 'Phone → Flow Setup', icon: '�', action: () => sidebarItems.find(item => item.label === 'Phone → Flow Setup')?.action() }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Monitoring',
      icon: <BarChart3 size={16} />,
      items: [
        { label: 'Flow Analytics', icon: '📊', action: () => setAnalyticsOpen(true) },
        { label: 'Context Analytics', icon: '�', action: () => sidebarItems.find(item => item.label === 'Context Analytics')?.action() }
      ]
    },
    {
      id: 'collaboration',
      label: 'Team & Collaboration',
      icon: <Users size={16} />,
      items: [
        { label: 'Team Collaboration', icon: '👥', action: () => showModal('teamCollaboration') },
        { label: 'Collaborate', icon: '👥', action: () => setCollaborationOpen(true) },
        { label: 'Sync Status', icon: '🔄', action: () => sidebarItems.find(item => item.label === 'Sync Status')?.action() }
      ]
    },
    {
      id: 'ai',
      label: 'AI & Intelligence',
      icon: <Brain size={16} />,
      items: [
        { label: 'AI Optimizer', icon: '🧠', action: () => setAiOptimizerOpen(true) },
        { label: 'AI Template Gen', icon: '🤖', action: () => sidebarItems.find(item => item.label === 'AI Template Gen')?.action() },
        { label: 'Context Inheritance', icon: '🧬', action: () => sidebarItems.find(item => item.label === 'Context Inheritance')?.action() },
        { label: 'AI Optimize Context', icon: '🎯', action: () => sidebarItems.find(item => item.label === 'AI Optimize Context')?.action() }
      ]
    }
  ];

  const utilityActions = [
    { label: 'Export Flow', icon: '💾', action: exportFlow },
    { label: 'Copy ID', icon: '📋', action: copyId },
    { label: 'Settings', icon: '⚙️', action: () => setShowAdvancedPanel(true) },
    { label: 'Execution Monitor', icon: '�️', action: () => setExecutionMonitorVisible(!executionMonitorVisible) }
  ];

  const toggleDropdown = (dropdownId) => {
    console.log(`Toggling dropdown: ${dropdownId}, current: ${activeDropdown}`);
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const closeDropdowns = () => {
    console.log('Closing all dropdowns');
    setActiveDropdown(null);
  };

  const DropdownMenu = ({ category, isActive }) => (
    <div className={`absolute top-full left-0 mt-2 w-72 rounded-xl shadow-2xl border z-[9999] ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${isActive ? 'block' : 'hidden'}`}
    style={{ zIndex: 9999 }}>
      <div className="p-3">
        <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b mb-3 ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
        }`}>
          {category.label} ({category.items.length} tools)
        </div>
        {category.items.map((item, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Clicking: ${item.label}`);
              if (item.action && typeof item.action === 'function') {
                item.action();
              }
              closeDropdowns();
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 mb-1 hover:transform hover:scale-[1.02] ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white hover:shadow-lg'
                : 'hover:bg-blue-50 text-gray-700 hover:text-blue-900 hover:shadow-md border border-transparent hover:border-blue-200'
            }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            <span className="text-left">{item.label}</span>
            <span className={`ml-auto text-xs px-2 py-1 rounded ${
              isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              Click
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const UtilityDropdown = ({ isActive }) => (
    <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl border z-[9999] ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${isActive ? 'block' : 'hidden'}`}
    style={{ zIndex: 9999 }}>
      <div className="p-3">
        <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b mb-3 ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
        }`}>
          Utilities & Settings
        </div>
        {utilityActions.map((item, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Clicking utility: ${item.label}`);
              if (item.action && typeof item.action === 'function') {
                item.action();
              }
              closeDropdowns();
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 mb-1 hover:transform hover:scale-[1.02] ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white hover:shadow-lg'
                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200'
            }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            <span className="font-medium text-left">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'} border-b shadow-xl shadow-gray-100/50`}>
      {/* Primary Header Row */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Project Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              V
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Voice Flow Designer
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-6">
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50">
              Version 1
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200/50">
              Staging
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/50 animate-pulse">
              ✓ Auto-saved
            </span>
          </div>
        </div>

        {/* Right: Primary Actions */}
        <div className="flex items-center gap-3">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              title={`${action.label} (${action.shortcut})`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                action.variant === 'primary' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : action.variant === 'accent'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  : isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Toolbar */}
      <div className={`px-6 py-3 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/80 backdrop-blur-sm border-gray-200'} border-t`}>
        <div className="flex items-center justify-between">
          {/* Tool Categories */}
          <div className="flex items-center gap-1 relative">
            {toolCategories.map((category) => (
              <div key={category.id} className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDropdown(category.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:transform hover:scale-105 ${
                    activeDropdown === category.id
                      ? isDarkMode 
                        ? 'bg-gray-700 text-white shadow-lg' 
                        : 'bg-white text-gray-900 shadow-lg border border-gray-300'
                      : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'hover:bg-white hover:shadow-md text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.items.length}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-150 ${
                      activeDropdown === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <DropdownMenu 
                  category={category} 
                  isActive={activeDropdown === category.id}
                />
              </div>
            ))}
          </div>

          {/* Utility Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown('utilities');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:transform hover:scale-105 ${
                activeDropdown === 'utilities'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white shadow-lg' 
                    : 'bg-white text-gray-900 shadow-lg border border-gray-300'
                  : isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'hover:bg-white hover:shadow-md text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200'
              }`}
            >
              <MoreHorizontal size={16} />
              <span>More Tools</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}>
                {utilityActions.length}
              </span>
            </button>
            <UtilityDropdown isActive={activeDropdown === 'utilities'} />
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDropdowns();
          }}
          style={{ zIndex: 9998 }}
        />
      )}
    </div>
  );
};

export default FlowDesignerHeaderImproved;
