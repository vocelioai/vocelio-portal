import React, { useState, useEffect } from 'react';
import {
  Settings, Calendar, CreditCard, Mail, CheckCircle, 
  AlertCircle, Plus, Edit3, Trash2, ExternalLink,
  Key, Globe, Shield, Zap
} from 'lucide-react';
import { SERVICE_URLS } from '../../services/api';

// Tool Integration Settings Component
const ToolIntegrationSettings = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendly');
  const [showAddModal, setShowAddModal] = useState(false);

  // Available integration types
  const integrationTypes = [
    {
      id: 'calendly',
      name: 'Calendly',
      icon: Calendar,
      description: 'Schedule appointments and meetings',
      color: 'blue',
      fields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true },
        { name: 'user_uri', label: 'User URI', type: 'text', required: true },
        { name: 'webhook_url', label: 'Webhook URL', type: 'url', required: false }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      description: 'Process payments and billing',
      color: 'purple',
      fields: [
        { name: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
        { name: 'secret_key', label: 'Secret Key', type: 'password', required: true },
        { name: 'webhook_endpoint', label: 'Webhook Endpoint', type: 'url', required: false }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      icon: Mail,
      description: 'Email notifications and campaigns',
      color: 'green',
      fields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true },
        { name: 'sender_email', label: 'Sender Email', type: 'email', required: true },
        { name: 'template_id', label: 'Default Template ID', type: 'text', required: false }
      ]
    }
  ];

  // Load integrations from backend
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`${SERVICE_URLS.TOOL_INTEGRATION}/tools`);
      const data = await response.json();
      setIntegrations(data || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (type, config) => {
    try {
      const response = await fetch(`${SERVICE_URLS.TOOL_INTEGRATION}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      });
      
      if (response.ok) {
        loadIntegrations();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to save integration:', error);
    }
  };

  const testIntegration = async (type) => {
    try {
      const response = await fetch(`${SERVICE_URLS.TOOL_INTEGRATION}/test/${type}`, {
        method: 'POST'
      });
      const result = await response.json();
      alert(result.success ? 'Integration test successful!' : 'Integration test failed: ' + result.error);
    } catch (error) {
      alert('Test failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Tool Integrations</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Integration Tabs */}
      <div className="flex space-x-4 border-b">
        {integrationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === type.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationTypes.map((type) => {
          const Icon = type.icon;
          const isConfigured = integrations.some(i => i.type === type.id);
          
          return (
            <div key={type.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                    <Icon className={`h-6 w-6 text-${type.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isConfigured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isConfigured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    {isConfigured ? 'Edit' : 'Configure'}
                  </button>
                  {isConfigured && (
                    <button 
                      onClick={() => testIntegration(type.id)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showAddModal && (
        <IntegrationConfigModal
          integrationTypes={integrationTypes}
          onSave={saveIntegration}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Active Integrations Status */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrationTypes.map((type) => {
            const integration = integrations.find(i => i.type === type.id);
            const Icon = type.icon;
            
            return (
              <div key={type.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                <Icon className={`h-5 w-5 text-${type.color}-600`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.name}</div>
                  <div className="text-sm text-gray-500">
                    {integration ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  integration ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Configuration Modal Component
const IntegrationConfigModal = ({ integrationTypes, onSave, onClose }) => {
  const [selectedType, setSelectedType] = useState('calendly');
  const [config, setConfig] = useState({});

  const currentType = integrationTypes.find(t => t.id === selectedType);

  const handleSave = () => {
    onSave(selectedType, config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Integration</h3>
        
        {/* Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Integration Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {integrationTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4 mb-6">
          {currentType?.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                value={config[field.name] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                required={field.required}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Integration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolIntegrationSettings;
