import React from 'react';
import ExecutionMonitor from '../ExecutionMonitor';

const FlowDesignerSidebar = ({
  isDarkMode,
  sidebarItems,
  nodes,
  handleExecutionStart,
  handleExecutionEnd
}) => {
  return (
    <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-800'} text-white p-5 overflow-y-auto`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 pb-5 border-b border-slate-700">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
          V
        </div>
        <div>
          <h2 className="text-xl font-semibold">Vocelio AI</h2>
          <p className="text-xs text-slate-400">Conversational Platform</p>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Workflow</h3>
        {sidebarItems.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-blue-600 rounded-lg mb-2 cursor-pointer transition-all duration-200 transform hover:translate-x-1"
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Testing Section */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Testing</h3>
        {sidebarItems.slice(3, 6).map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-blue-600 rounded-lg mb-2 cursor-pointer transition-all duration-200 transform hover:translate-x-1"
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Deployment Section */}
      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Deployment</h3>
        {sidebarItems.slice(6).map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-blue-600 rounded-lg mb-2 cursor-pointer transition-all duration-200 transform hover:translate-x-1"
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Railway Execution Monitor */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Railway Execution</h3>
        <ExecutionMonitor 
          flowDefinition={nodes}
          onExecutionStart={handleExecutionStart}
          onExecutionEnd={handleExecutionEnd}
        />
      </div>
    </div>
  );
};

export default FlowDesignerSidebar;
