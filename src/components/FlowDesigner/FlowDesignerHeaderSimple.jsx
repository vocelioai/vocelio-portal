import React, { useState } from 'react';
import { 
  Copy, 
  MoreHorizontal, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const FlowDesignerHeaderSimple = ({
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
  const [showAllFunctions, setShowAllFunctions] = useState(false);

  // TOP 7 PRIORITY FUNCTIONS + ALL OTHER FUNCTIONS - Complete list with dropdown access
  const allFunctions = [
    // TOP 7 PRIORITY FUNCTIONS
    { label: 'Send Call', icon: '📞', action: () => showModal('sendCall') },
    { label: 'Promote to Production', icon: '🚀', action: () => showModal('promoteProduction') },
    { label: 'Test Pathways', icon: '🧪', action: () => showModal('testPathway') },
    { label: 'Webclient', icon: '🌐', action: () => showModal('webClient') },
    { label: 'AI Optimizer', icon: '🧠', action: () => setAiOptimizerOpen(true) },
    { label: 'Node Library', icon: '📋', action: () => sidebarItems?.find(item => item.label === 'Node Library')?.action() },
    { label: 'Global Prompt', icon: '🌍', action: () => showModal('globalPrompt') },
    
    // TEMPLATE & COLLABORATION FUNCTIONS (available in dropdown)
    { label: 'Flow Templates', icon: '🗂️', action: () => setFlowTemplateBrowserOpen(true) },
    { label: 'Manage Templates', icon: '⚙️', action: () => sidebarItems?.find(item => item.label === 'Manage Templates')?.action() },
    { label: 'Team Collaboration', icon: '👥', action: () => showModal('teamCollaboration') },
    { label: 'Workflow Contexts', icon: '🎭', action: () => sidebarItems?.find(item => item.label === 'Workflow Contexts')?.action() },
    { label: 'Context Library', icon: '📚', action: () => sidebarItems?.find(item => item.label === 'Context Library')?.action() },
    
    // ESSENTIAL FUNCTIONS
    { label: 'Production Manager', icon: '📊', action: () => sidebarItems?.find(item => item.label === 'Production Manager')?.action() },
    { label: 'Phone → Flow Setup', icon: '📞', action: () => sidebarItems?.find(item => item.label === 'Phone → Flow Setup')?.action() },
    { label: 'Flow Analytics', icon: '📊', action: () => setAnalyticsOpen(true) },
    { label: 'Advanced Nodes', icon: '⚡', action: () => setAdvancedNodesOpen(true) },
    { label: 'Context Analytics', icon: '📈', action: () => sidebarItems?.find(item => item.label === 'Context Analytics')?.action() },
    { label: 'AI Template Gen', icon: '🤖', action: () => sidebarItems?.find(item => item.label === 'AI Template Gen')?.action() },
    { label: 'Context Inheritance', icon: '🧬', action: () => sidebarItems?.find(item => item.label === 'Context Inheritance')?.action() },
    { label: 'Sync Status', icon: '🔄', action: () => sidebarItems?.find(item => item.label === 'Sync Status')?.action() },
    { label: 'Feature Flags', icon: '🎯', action: () => sidebarItems?.find(item => item.label === 'Feature Flags')?.action() },
    
    // UTILITY FUNCTIONS
    { label: 'Auto Layout', icon: '⚡', action: performAutoLayout },
    { label: 'Export Flow', icon: '💾', action: exportFlow },
    { label: 'Copy ID', icon: '📋', action: copyId },
    { label: 'Execution Monitor', icon: '👁️', action: () => setExecutionMonitorVisible(!executionMonitorVisible) },
    { label: 'Advanced Panel', icon: '⚙️', action: () => setShowAdvancedPanel(true) }
  ];

  const handleFunctionClick = (func) => {
    console.log(`Clicking function: ${func.label}`);
    try {
      if (func.action && typeof func.action === 'function') {
        func.action();
        console.log(`Successfully executed: ${func.label}`);
      } else {
        console.warn(`No action defined for: ${func.label}`);
      }
    } catch (error) {
      console.error(`Error executing ${func.label}:`, error);
    }
    setShowAllFunctions(false);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-lg`}>
      {/* Top Row - Project Info */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              V
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Flow Designer
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              Version 1
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              Staging
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium animate-pulse">
              ✓ Saved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {allFunctions.length} Functions Available
          </span>
          <button
            onClick={copyId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Copy size={16} />
            Copy ID
          </button>
        </div>
      </div>

      {/* Function Menu Row */}
      <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Top 7 Priority Functions:
            </span>
            
            {/* Show the TOP 7 PRIORITY functions */}
            {allFunctions.slice(0, 7).map((func, idx) => (
              <button
                key={idx}
                onClick={() => handleFunctionClick(func)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600'
                    : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-900 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                }`}
                title={func.label}
              >
                <span>{func.icon}</span>
                <span className="hidden lg:block">{func.label}</span>
              </button>
            ))}
          </div>

          {/* Show All Functions Button */}
          <div className="relative">
            <button
              onClick={() => setShowAllFunctions(!showAllFunctions)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showAllFunctions
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
              }`}
            >
              {showAllFunctions ? <X size={16} /> : <Menu size={16} />}
              <span>{showAllFunctions ? 'Close' : 'All Functions'}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
              }`}>
                {allFunctions.length}
              </span>
            </button>

            {/* All Functions Panel */}
            {showAllFunctions && (
              <div 
                className={`absolute top-full right-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-50 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
                style={{ zIndex: 999999 }}
              >
                <div className="p-4">
                  <div className={`text-sm font-semibold mb-3 pb-2 border-b ${
                    isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                  }`}>
                    All Functions ({allFunctions.length})
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {allFunctions.map((func, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFunctionClick(func)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                            : 'hover:bg-blue-50 text-gray-700 hover:text-blue-900'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{func.icon}</span>
                        <span className="flex-1">{func.label}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {showAllFunctions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAllFunctions(false)}
          style={{ zIndex: 999998 }}
        />
      )}
    </div>
  );
};

export default FlowDesignerHeaderSimple;
