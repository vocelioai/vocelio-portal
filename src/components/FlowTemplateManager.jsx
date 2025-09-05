import React, { useState, useEffect } from 'react';
import { railwayFlowAPI } from '../lib/railwayFlowAPI.js';
import { Save, Download, Upload, Copy, Trash2 } from 'lucide-react';

const FlowTemplateManager = ({ currentFlow, onTemplateLoad }) => {
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
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Template Manager</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Save Current Flow as Template */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Save Current Flow as Template</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Template description (optional)"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h4 className="font-medium text-gray-900">Your Templates</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No templates saved yet
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="px-4 py-3 border-b hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onTemplateLoad && onTemplateLoad(template.flow)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Load Template"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-800"
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
