import React from 'react';
import { Copy } from 'lucide-react';

const FlowDesignerHeader = ({
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
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      {/* Top Section with Basic Info */}
      <div className="flex items-center justify-between px-8 py-3">
        {/* Left: Status Info */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Version 1
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Staging
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ✓ Saved
          </span>
        </div>
        
        {/* Right: Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyId}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
            }`}
          >
            <Copy size={16} />
            Copy ID
          </button>
        </div>
      </div>

      {/* Bottom Section with Sidebar Items as Horizontal Menu */}
      <div className={`px-8 py-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* Workflow Section */}
          <div className="flex items-center gap-1 pr-4 border-r border-gray-300 dark:border-gray-600">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
              Workflow:
            </span>
            {sidebarItems?.slice(0, 4).map((item, idx) => (
              <button
                key={`workflow-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-blue-100 text-gray-700 hover:text-blue-900'
                }`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Testing Section */}
          <div className="flex items-center gap-1 px-4 border-r border-gray-300 dark:border-gray-600">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
              Testing:
            </span>
            {sidebarItems?.slice(4, 8).map((item, idx) => (
              <button
                key={`testing-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-green-100 text-gray-700 hover:text-green-900'
                }`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Analytics & Tools Section */}
          <div className="flex items-center gap-1 px-4">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
              Tools:
            </span>
            {sidebarItems?.slice(8).map((item, idx) => (
              <button
                key={`tools-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-purple-100 text-gray-700 hover:text-purple-900'
                }`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowDesignerHeader;
