import React from 'react';
import { 
  Settings, Zap, Users, BarChart3, TestTube, Phone, 
  Rocket, Brain, Layers, History, Moon, Sun 
} from 'lucide-react';

const FlowSidebar = ({ 
  isDarkMode, 
  activePanel, 
  setActivePanel, 
  selectedNode,
  onTestFlow,
  onExecuteFlow 
}) => {
  const sidebarItems = [
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'collaboration', label: 'Collaborate', icon: Users },
    { id: 'optimizer', label: 'AI Optimizer', icon: Brain },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const quickActions = [
    { id: 'test', label: 'Test Flow', icon: TestTube, action: onTestFlow },
    { id: 'call', label: 'Send Call', icon: Phone, action: () => onExecuteFlow('+1234567890') },
    { id: 'deploy', label: 'Deploy', icon: Rocket }
  ];

  return (
    <div className={`w-64 border-r flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Logo & Title */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Flow Designer
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-sm font-medium mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 p-4">
        <h3 className={`text-sm font-medium mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Panels
        </h3>
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePanel === item.id
                  ? 'bg-blue-600 text-white'
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Selected Node
          </h3>
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedNode.data.label}
            </p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Type: {selectedNode.type}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowSidebar;
