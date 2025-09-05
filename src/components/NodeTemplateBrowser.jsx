import React, { useState } from 'react';
import { NodeTypeConfig } from '../lib/flowSchemas.js';
import { Search, Plus, Filter } from 'lucide-react';

const NodeTemplateBrowser = ({ isDarkMode, isOpen, onTemplateSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'input', 'output', 'logic', 'control'];

  const filteredNodes = Object.entries(NodeTypeConfig).filter(([type, config]) => {
    const matchesSearch = type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (nodeType, config) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position: { x: 250, y: 250 },
      data: {
        label: nodeType,
        ...config.defaultProps
      }
    };
    
    onTemplateSelect(newNode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Node Templates</h2>
            <button
              onClick={onClose}
              className={`hover:opacity-75 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              ×
            </button>
          </div>
          
          <div className="mt-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search node types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNodes.map(([nodeType, config]) => (
              <div
                key={nodeType}
                className="border rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                onClick={() => handleSelectTemplate(nodeType, config)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: config.color }}
                  >
                    {nodeType.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{nodeType}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {config.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                    {config.category}
                  </span>
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            ))}
          </div>

          {filteredNodes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className="text-gray-500">No node templates found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredNodes.length} template{filteredNodes.length !== 1 ? 's' : ''} available
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeTemplateBrowser;
