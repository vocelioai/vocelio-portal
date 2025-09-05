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
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'} border-b shadow-xl shadow-gray-100/50`}>
      {/* Top Section with Basic Info */}
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Status Info */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-2xl text-xs font-semibold border border-emerald-200/50 shadow-sm">
            Version 1
          </span>
          <span className="px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-2xl text-xs font-semibold border border-amber-200/50 shadow-sm">
            Staging
          </span>
          <span className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-2xl text-xs font-semibold border border-emerald-200/50 shadow-sm animate-pulse">
            ✓ Saved
          </span>
        </div>
        
        {/* Right: Utility Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyId}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
                : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200/70 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/30 backdrop-blur-sm'
            }`}
          >
            <Copy size={16} />
            Copy ID
          </button>
        </div>
      </div>

      {/* Bottom Section with Sidebar Items as Horizontal Menu */}
      <div className={`px-8 py-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50/60 backdrop-blur-sm border-gray-200/50'} border-t`}>
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Workflow Section */}
          <div className="flex items-center gap-2 pr-6 border-r border-gray-300/50 dark:border-gray-600">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3 uppercase tracking-wider`}>
              Workflow
            </span>
            {sidebarItems?.slice(0, 3).map((item, idx) => (
              <button
                key={`workflow-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white shadow-lg' 
                    : 'hover:bg-blue-50 text-gray-700 hover:text-blue-800 border border-transparent hover:border-blue-200/50 shadow-sm hover:shadow-md backdrop-blur-sm'
                }`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Testing Section */}
          <div className="flex items-center gap-2 px-6 border-r border-gray-300/50 dark:border-gray-600">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3 uppercase tracking-wider`}>
              Testing
            </span>
            {sidebarItems?.slice(3, 7).map((item, idx) => (
              <button
                key={`testing-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white shadow-lg' 
                    : 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-transparent hover:border-emerald-200/50 shadow-sm hover:shadow-md backdrop-blur-sm'
                }`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Analytics & Tools Section */}
          <div className="flex items-center gap-2 px-6">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3 uppercase tracking-wider`}>
              Tools
            </span>
            {sidebarItems?.slice(7).map((item, idx) => (
              <button
                key={`tools-${idx}`}
                onClick={item.action}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white shadow-lg' 
                    : 'hover:bg-purple-50 text-gray-700 hover:text-purple-800 border border-transparent hover:border-purple-200/50 shadow-sm hover:shadow-md backdrop-blur-sm'
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
