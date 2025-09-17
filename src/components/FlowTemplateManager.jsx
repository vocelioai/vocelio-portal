import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, X } from 'lucide-react';

const FlowTemplateManager = ({ currentFlow, onTemplateLoad, onClose, isDarkMode }) => {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Mock templates for demonstration
    const mockTemplates = [
      {
        id: 'template-1',
        name: 'Customer Support Flow',
        description: 'Basic customer support workflow',
        createdAt: new Date().toISOString(),
        category: 'support'
      },
      {
        id: 'template-2',
        name: 'Sales Qualification',
        description: 'Lead qualification workflow',
        createdAt: new Date().toISOString(),
        category: 'sales'
      }
    ];
    setTemplates(mockTemplates);
  };

  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      flow: currentFlow,
      createdAt: new Date().toISOString(),
      category: 'custom'
    };

    setTemplates(prev => [...prev, template]);
    setTemplateName('');
    setTemplateDescription('');
    alert('Template saved successfully!');
  };

  const loadTemplate = (template) => {
    if (template.flow) {
      onTemplateLoad(template.flow);
      onClose();
    }
  };

  const deleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Flow Template Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Save Current Flow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter template description"
                />
              </div>
              <button
                onClick={saveAsTemplate}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Save size={16} className="mr-2" />
                Save as Template
              </button>
            </div>
          </div>

          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available Templates</h3>
            <div className="space-y-3 max-h-full overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md"
                        title="Load Template"
                      >
                        <Upload size={16} />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-md"
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowTemplateManager;
