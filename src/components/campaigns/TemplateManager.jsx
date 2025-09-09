import React, { useState, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Mail, MessageSquare, Phone, Globe, Plus, Search, Filter,
  Save, Copy, Trash2, Eye, Edit3, Star, Clock, Users,
  Tag, Folder, Upload, Download, Settings, MoreVertical,
  CheckCircle, AlertCircle, Image as ImageIcon, Video,
  FileText, Code, PieChart, Calendar, Target
} from 'lucide-react';

// ===== COPILOT PROMPT #6: Template Management System =====
// Comprehensive template editor with rich text, variables, and multi-channel support

const TemplateManager = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showPreview, setShowPreview] = useState(false);

  // Template categories and channels
  const categories = [
    { id: 'all', name: 'All Categories', count: templates.length },
    { id: 'welcome', name: 'Welcome', count: templates.filter(t => t.category === 'welcome').length },
    { id: 'promotional', name: 'Promotional', count: templates.filter(t => t.category === 'promotional').length },
    { id: 'transactional', name: 'Transactional', count: templates.filter(t => t.category === 'transactional').length },
    { id: 'reminder', name: 'Reminder', count: templates.filter(t => t.category === 'reminder').length },
    { id: 'support', name: 'Support', count: templates.filter(t => t.category === 'support').length }
  ];

  const channels = [
    { id: 'all', name: 'All Channels', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'sms', name: 'SMS', icon: MessageSquare },
    { id: 'voice', name: 'Voice', icon: Phone },
    { id: 'web', name: 'Web Push', icon: Globe }
  ];

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesChannel = selectedChannel === 'all' || template.channel === selectedChannel;
      
      return matchesSearch && matchesCategory && matchesChannel;
    });
  }, [templates, searchTerm, selectedCategory, selectedChannel]);

  const handleCreateTemplate = useCallback(() => {
    const newTemplate = {
      id: `template_${Date.now()}`,
      name: 'New Template',
      description: '',
      channel: 'email',
      category: 'welcome',
      content: '',
      variables: [],
      tags: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: 0,
      performance: { openRate: 0, clickRate: 0, conversionRate: 0 }
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  }, []);

  const handleSaveTemplate = useCallback((templateData) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateData.id 
        ? { ...templateData, updatedAt: new Date().toISOString() }
        : t
    ));
    setIsEditing(false);
  }, []);

  const handleDeleteTemplate = useCallback((templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setIsEditing(false);
    }
  }, [selectedTemplate]);

  const handleDuplicateTemplate = useCallback((template) => {
    const duplicatedTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: 0
    };
    
    setTemplates(prev => [duplicatedTemplate, ...prev]);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-4">
            {/* Channel Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredTemplates.map(template => (
              <TemplateListItem
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={setSelectedTemplate}
                onEdit={() => {
                  setSelectedTemplate(template);
                  setIsEditing(true);
                }}
                onDuplicate={() => handleDuplicateTemplate(template)}
                onDelete={() => handleDeleteTemplate(template.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedTemplate ? (
          isEditing ? (
            <TemplateEditor
              template={selectedTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <TemplateViewer
              template={selectedTemplate}
              onEdit={() => setIsEditing(true)}
              onDuplicate={() => handleDuplicateTemplate(selectedTemplate)}
              onDelete={() => handleDeleteTemplate(selectedTemplate.id)}
            />
          )
        ) : (
          <TemplateLibrary
            templates={filteredTemplates}
            onSelectTemplate={setSelectedTemplate}
            onCreateTemplate={handleCreateTemplate}
          />
        )}
      </div>
    </div>
  );
};

// Template List Item Component
const TemplateListItem = ({ template, isSelected, onSelect, onEdit, onDuplicate, onDelete }) => {
  const getChannelIcon = (channel) => {
    const icons = { email: Mail, sms: MessageSquare, voice: Phone, web: Globe };
    return icons[channel] || Globe;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.draft;
  };

  const Icon = getChannelIcon(template.channel);

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <h3 className="text-sm font-medium text-gray-900 truncate">{template.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{template.description}</p>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(template.status)}`}>
              {template.status}
            </span>
            <span className="text-xs text-gray-400">{template.usage} uses</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit3 className="h-3 w-3 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Duplicate"
          >
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Editor Component
const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState(template);
  const [variables, setVariables] = useState(template.variables || []);
  const [tags, setTags] = useState(template.tags || []);
  const [newTag, setNewTag] = useState('');

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const handleAddVariable = () => {
    const newVariable = {
      id: `var_${Date.now()}`,
      name: `variable_${variables.length + 1}`,
      label: 'New Variable',
      type: 'text',
      defaultValue: '',
      required: false
    };
    setVariables([...variables, newVariable]);
  };

  const handleUpdateVariable = (index, field, value) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setVariables(updatedVariables);
  };

  const handleRemoveVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      variables,
      tags,
      status: 'active'
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-xl font-semibold bg-transparent border-none outline-none"
              placeholder="Template Name"
            />
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Editing
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="voice">Voice</option>
                  <option value="web">Web Push</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Welcome</option>
                  <option value="promotional">Promotional</option>
                  <option value="transactional">Transactional</option>
                  <option value="reminder">Reminder</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of this template..."
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
            {formData.channel === 'email' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email subject line..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                  <ReactQuill
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={quillModules}
                    style={{ height: '300px' }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message content..."
                />
              </div>
            )}
          </div>

          {/* Variables */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Variables</h3>
              <button
                onClick={handleAddVariable}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Variable</span>
              </button>
            </div>
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div key={variable.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => handleUpdateVariable(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Variable name"
                  />
                  <input
                    type="text"
                    value={variable.label}
                    onChange={(e) => handleUpdateVariable(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Display label"
                  />
                  <select
                    value={variable.type}
                    onChange={(e) => handleUpdateVariable(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <button
                    onClick={() => handleRemoveVariable(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add a tag..."
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Viewer Component
const TemplateViewer = ({ template, onEdit, onDuplicate, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{template.name}</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${
              template.status === 'active' ? 'bg-green-100 text-green-800' :
              template.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {template.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={onDuplicate}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <TemplateDetails template={template} showPreview={showPreview} />
        </div>
      </div>
    </div>
  );
};

// Template Library Component
const TemplateLibrary = ({ templates, onSelectTemplate, onCreateTemplate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Template Management</h2>
        <p className="text-gray-500 mb-6">
          Create and manage templates for your campaigns. Select a template from the sidebar to view and edit it.
        </p>
        <button
          onClick={onCreateTemplate}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Template</span>
        </button>
      </div>
    </div>
  );
};

// Template Details Component
const TemplateDetails = ({ template, showPreview }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Channel</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{template.channel}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{template.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(template.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usage</label>
            <p className="mt-1 text-sm text-gray-900">{template.usage} times</p>
          </div>
        </div>
        {template.description && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{template.description}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
        {template.subject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <p className="mt-1 text-sm text-gray-900">{template.subject}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          {showPreview && template.channel === 'email' ? (
            <div 
              className="prose max-w-none p-4 border border-gray-200 rounded-md bg-gray-50"
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-900 p-4 border border-gray-200 rounded-md bg-gray-50">
              {template.content}
            </pre>
          )}
        </div>
      </div>

      {/* Variables */}
      {template.variables && template.variables.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Variables</h3>
          <div className="space-y-2">
            {template.variables.map((variable) => (
              <div key={variable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium text-gray-900">{variable.label}</span>
                  <span className="ml-2 text-sm text-gray-500">({variable.name})</span>
                </div>
                <span className="text-sm text-gray-500 capitalize">{variable.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Performance */}
      {template.performance && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{template.performance.openRate}%</div>
              <div className="text-sm text-gray-500">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{template.performance.clickRate}%</div>
              <div className="text-sm text-gray-500">Click Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{template.performance.conversionRate}%</div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Data
const mockTemplates = [
  {
    id: 'template_1',
    name: 'Welcome Email Series - Day 1',
    description: 'First email in the welcome sequence for new customers',
    channel: 'email',
    category: 'welcome',
    subject: 'Welcome to {{company_name}}! 🎉',
    content: '<h2>Welcome to {{company_name}}!</h2><p>Hi {{first_name}},</p><p>We\'re thrilled to have you join our community! Here\'s what you can expect...</p>',
    variables: [
      { id: 'var1', name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'Our Company', required: true },
      { id: 'var2', name: 'first_name', label: 'First Name', type: 'text', defaultValue: 'there', required: false }
    ],
    tags: ['welcome', 'onboarding', 'series'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    usage: 1247,
    performance: { openRate: 85, clickRate: 23, conversionRate: 12 }
  },
  {
    id: 'template_2',
    name: 'Promotional SMS - Flash Sale',
    description: 'SMS template for flash sale announcements',
    channel: 'sms',
    category: 'promotional',
    content: '🔥 FLASH SALE ALERT! {{discount}}% OFF everything for the next {{hours}} hours only! Use code: {{promo_code}} Shop now: {{store_url}}',
    variables: [
      { id: 'var3', name: 'discount', label: 'Discount Percentage', type: 'number', defaultValue: '20', required: true },
      { id: 'var4', name: 'hours', label: 'Sale Duration (hours)', type: 'number', defaultValue: '24', required: true },
      { id: 'var5', name: 'promo_code', label: 'Promo Code', type: 'text', defaultValue: 'FLASH20', required: true },
      { id: 'var6', name: 'store_url', label: 'Store URL', type: 'text', defaultValue: 'shop.example.com', required: true }
    ],
    tags: ['promotional', 'sale', 'urgent'],
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
    usage: 856,
    performance: { openRate: 92, clickRate: 18, conversionRate: 8 }
  },
  {
    id: 'template_3',
    name: 'Order Confirmation Voice',
    description: 'Voice message template for order confirmations',
    channel: 'voice',
    category: 'transactional',
    content: 'Hello {{customer_name}}, this is {{company_name}} calling to confirm your order number {{order_number}} for {{order_total}}. Your order will be delivered on {{delivery_date}}. Thank you for your business!',
    variables: [
      { id: 'var7', name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { id: 'var8', name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'var9', name: 'order_number', label: 'Order Number', type: 'text', required: true },
      { id: 'var10', name: 'order_total', label: 'Order Total', type: 'text', required: true },
      { id: 'var11', name: 'delivery_date', label: 'Delivery Date', type: 'date', required: true }
    ],
    tags: ['transactional', 'order', 'confirmation'],
    status: 'active',
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-15T13:10:00Z',
    usage: 2341,
    performance: { openRate: 100, clickRate: 0, conversionRate: 95 }
  }
];

export default TemplateManager;
