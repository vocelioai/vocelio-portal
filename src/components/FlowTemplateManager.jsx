import React, { useState, useEffect } from 'react';
import { railwayFlowAPI } from '../lib/railwayFlowAPI.js';
import { Save, Download, Upload, Copy, Trash2, X } from 'lucide-react';

const FlowTemplateManager = ({ currentFlow, onTemplateLoad, onClose, isDarkMode }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await railwayFlowAPI.getFlowTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim() || !currentFlow) return;

    const template = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      flow: currentFlow,
      createdAt: new Date().toISOString(),
      category: 'custom'
    };

    // Mock save for now
    setTemplates([...templates, template]);
    setTemplateName('');
    setTemplateDescription('');
  };

  return (
    <div className={`rounded-lg border shadow-sm h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Template Manager</h3>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Save Current Flow as Template */}
        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h4 className={`font-medium mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Save Current Flow as Template</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <textarea
              placeholder="Template description (optional)"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={2}
            />
            <button
              onClick={saveAsTemplate}
              disabled={!templateName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Template
            </button>
          </div>
        </div>

        {/* Template List */}
        <div className={`border rounded-lg ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Your Templates</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {templates.length === 0 ? (
              <div className={`p-4 text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No templates saved yet
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className={`px-4 py-3 border-b transition-colors ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{template.name}</h5>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{template.description}</p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onTemplateLoad && onTemplateLoad(template.flow)}
                        className={`p-1 transition-colors ${
                          isDarkMode 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        title="Load Template"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1 transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1 transition-colors ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowTemplateManager;
