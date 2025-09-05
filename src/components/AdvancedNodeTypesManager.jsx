import React, { useState } from 'react';
import { NodeTypeConfig } from '../lib/flowSchemas.js';
import { Plus, Settings, Code, Palette } from 'lucide-react';

const AdvancedNodeTypesManager = ({ onCreateCustomNode }) => {
  const [showCustomNodeDialog, setShowCustomNodeDialog] = useState(false);
  const [customNodeConfig, setCustomNodeConfig] = useState({
    name: '',
    description: '',
    category: 'custom',
    color: '#3B82F6',
    icon: 'Settings'
  });

  const handleCreateCustomNode = () => {
    if (!customNodeConfig.name) return;

    const newNodeType = {
      ...customNodeConfig,
      id: `custom_${Date.now()}`,
      defaultProps: {
        label: customNodeConfig.name
      }
    };

    if (onCreateCustomNode) {
      onCreateCustomNode(newNodeType);
    }

    setCustomNodeConfig({
      name: '',
      description: '',
      category: 'custom',
      color: '#3B82F6',
      icon: 'Settings'
    });
    setShowCustomNodeDialog(false);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Advanced Node Types
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Existing Node Types */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Built-in Node Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(NodeTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2 p-2 border rounded">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Custom Node */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowCustomNodeDialog(true)}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
            Create Custom Node Type
          </button>
        </div>
      </div>

      {/* Custom Node Dialog */}
      {showCustomNodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Node Type</h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={customNodeConfig.name}
                  onChange={(e) => setCustomNodeConfig({
                    ...customNodeConfig,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Custom API Call"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={customNodeConfig.description}
                  onChange={(e) => setCustomNodeConfig({
                    ...customNodeConfig,
                    description: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this node does"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={customNodeConfig.category}
                  onChange={(e) => setCustomNodeConfig({
                    ...customNodeConfig,
                    category: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                  <option value="logic">Logic</option>
                  <option value="control">Control</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customNodeConfig.color}
                    onChange={(e) => setCustomNodeConfig({
                      ...customNodeConfig,
                      color: e.target.value
                    })}
                    className="w-12 h-8 border rounded"
                  />
                  <input
                    type="text"
                    value={customNodeConfig.color}
                    onChange={(e) => setCustomNodeConfig({
                      ...customNodeConfig,
                      color: e.target.value
                    })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowCustomNodeDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomNode}
                disabled={!customNodeConfig.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Node Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedNodeTypesManager;
