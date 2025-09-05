import React, { useRef } from 'react';
import { Plus, Save, TestTube, Download } from 'lucide-react';

const FlowDesignerCommandPalette = ({
  isDarkMode,
  isVisible,
  onClose,
  commandSearchRef
}) => {
  const commands = [
    { icon: Plus, name: 'Add Node', description: 'Add a new workflow node', shortcut: 'Ctrl+N' },
    { icon: Save, name: 'Save Pathway', description: 'Save current workflow', shortcut: 'Ctrl+S' },
    { icon: TestTube, name: 'Test Pathway', description: 'Test the workflow', shortcut: 'Ctrl+T' },
    { icon: Download, name: 'Export Workflow', description: 'Export as JSON or image', shortcut: 'Ctrl+E' }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <input
            ref={commandSearchRef}
            type="text"
            placeholder="Search commands..."
            className={`w-full text-lg border-none outline-none bg-transparent ${
              isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {commands.map((command, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <command.icon size={16} />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{command.name}</div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{command.description}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {command.shortcut}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowDesignerCommandPalette;
