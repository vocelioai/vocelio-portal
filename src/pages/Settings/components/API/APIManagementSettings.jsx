import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  Shield,
  Settings,
  Copy,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Code,
  Book,
  Webhook,
  RefreshCw,
  Download,
  Upload,
  Zap,
  Lock,
  Unlock,
  Database,
  Server,
  Bell
} from 'lucide-react';

const APIManagementSettings = () => {
  const [activeTab, setActiveTab] = useState('keys');
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [apiUsage, setApiUsage] = useState(null);
  const [rateLimits, setRateLimits] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());

  // Mock API data
  const mockApiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'voc_live_1234567890abcdef',
      description: 'Main production API key for call management',
      permissions: ['calls:read', 'calls:write', 'analytics:read'],
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active',
      usage: {
        requests: 1250,
        limit: 10000
      }
    },
    {
      id: 2,
      name: 'Development Key',
      key: 'voc_test_abcdef1234567890',
      description: 'Development and testing key',
      permissions: ['calls:read', 'analytics:read'],
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      status: 'active',
      usage: {
        requests: 350,
        limit: 1000
      }
    },
    {
      id: 3,
      name: 'Analytics Key',
      key: 'voc_analytics_fedcba0987654321',
      description: 'Read-only key for analytics dashboard',
      permissions: ['analytics:read'],
      created: '2024-01-05',
      lastUsed: '2024-01-18',
      status: 'inactive',
      usage: {
        requests: 75,
        limit: 5000
      }
    }
  ];

  const mockWebhooks = [
    {
      id: 1,
      name: 'Call Completed',
      url: 'https://api.example.com/webhooks/call-completed',
      events: ['call.completed', 'call.recording.ready'],
      secret: 'whsec_1234567890abcdef',
      status: 'active',
      created: '2024-01-15',
      lastDelivery: '2024-01-20',
      deliverySuccess: 98.5,
      totalDeliveries: 1420
    },
    {
      id: 2,
      name: 'Campaign Events',
      url: 'https://webhook.site/campaign-events',
      events: ['campaign.started', 'campaign.completed'],
      secret: 'whsec_abcdef1234567890',
      status: 'active',
      created: '2024-01-10',
      lastDelivery: '2024-01-19',
      deliverySuccess: 95.2,
      totalDeliveries: 342
    }
  ];

  const mockApiUsage = {
    currentPeriod: {
      start: '2024-01-01',
      end: '2024-01-31',
      totalRequests: 8750,
      successfulRequests: 8650,
      errorRequests: 100,
      averageResponseTime: 145
    },
    endpoints: [
      { endpoint: '/v1/calls', requests: 3200, avgResponseTime: 120 },
      { endpoint: '/v1/campaigns', requests: 2100, avgResponseTime: 180 },
      { endpoint: '/v1/analytics', requests: 1850, avgResponseTime: 95 },
      { endpoint: '/v1/contacts', requests: 1600, avgResponseTime: 110 }
    ],
    dailyUsage: [
      { date: '2024-01-15', requests: 450 },
      { date: '2024-01-16', requests: 520 },
      { date: '2024-01-17', requests: 380 },
      { date: '2024-01-18', requests: 620 },
      { date: '2024-01-19', requests: 490 },
      { date: '2024-01-20', requests: 580 }
    ]
  };

  const mockRateLimits = {
    default: {
      requestsPerMinute: 60,
      requestsPerHour: 3600,
      requestsPerDay: 86400
    },
    premium: {
      requestsPerMinute: 120,
      requestsPerHour: 7200,
      requestsPerDay: 172800
    },
    enterprise: {
      requestsPerMinute: 300,
      requestsPerHour: 18000,
      requestsPerDay: 432000
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setApiKeys(mockApiKeys);
      setWebhooks(mockWebhooks);
      setApiUsage(mockApiUsage);
      setRateLimits(mockRateLimits);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'usage', label: 'Usage Analytics', icon: BarChart3 },
    { id: 'limits', label: 'Rate Limits', icon: Shield },
    { id: 'docs', label: 'Documentation', icon: Book }
  ];

  const toggleKeyVisibility = (keyId) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In real implementation, show a toast notification
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const CreateAPIKeyForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      permissions: [],
      rateLimit: 'default'
    });

    const availablePermissions = [
      { id: 'calls:read', label: 'Read Calls', description: 'View call records and details' },
      { id: 'calls:write', label: 'Write Calls', description: 'Create and modify calls' },
      { id: 'campaigns:read', label: 'Read Campaigns', description: 'View campaign data' },
      { id: 'campaigns:write', label: 'Write Campaigns', description: 'Create and modify campaigns' },
      { id: 'analytics:read', label: 'Read Analytics', description: 'Access analytics data' },
      { id: 'contacts:read', label: 'Read Contacts', description: 'View contact information' },
      { id: 'contacts:write', label: 'Write Contacts', description: 'Create and modify contacts' }
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      const newKey = {
        id: apiKeys.length + 1,
        name: formData.name,
        key: `voc_${formData.rateLimit}_${Math.random().toString(36).substr(2, 16)}`,
        description: formData.description,
        permissions: formData.permissions,
        created: new Date().toISOString().split('T')[0],
        lastUsed: null,
        status: 'active',
        usage: {
          requests: 0,
          limit: rateLimits[formData.rateLimit]?.requestsPerDay || 1000
        }
      };
      
      setApiKeys([...apiKeys, newKey]);
      setShowCreateKey(false);
      setFormData({ name: '', description: '', permissions: [], rateLimit: 'default' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create API Key</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production API Key"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this API key"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            permissions: [...formData.permissions, permission.id] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            permissions: formData.permissions.filter(p => p !== permission.id) 
                          });
                        }
                      }}
                      className="mt-1 mr-2"
                    />
                    <div>
                      <div className="font-medium text-sm">{permission.label}</div>
                      <div className="text-xs text-gray-600">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit Tier</label>
              <select
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="default">Default (60 req/min)</option>
                <option value="premium">Premium (120 req/min)</option>
                <option value="enterprise">Enterprise (300 req/min)</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Create API Key
              </button>
              <button
                type="button"
                onClick={() => setShowCreateKey(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateWebhookForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      url: '',
      events: [],
      secret: `whsec_${Math.random().toString(36).substr(2, 16)}`
    });

    const availableEvents = [
      'call.started',
      'call.completed',
      'call.failed',
      'call.recording.ready',
      'campaign.started',
      'campaign.completed',
      'campaign.paused',
      'contact.created',
      'contact.updated'
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      const newWebhook = {
        id: webhooks.length + 1,
        name: formData.name,
        url: formData.url,
        events: formData.events,
        secret: formData.secret,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
        lastDelivery: null,
        deliverySuccess: 100,
        totalDeliveries: 0
      };
      
      setWebhooks([...webhooks, newWebhook]);
      setShowCreateWebhook(false);
      setFormData({ name: '', url: '', events: [], secret: `whsec_${Math.random().toString(36).substr(2, 16)}` });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Webhook</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Call Events Webhook"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://api.example.com/webhooks"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availableEvents.map((event) => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            events: [...formData.events, event] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            events: formData.events.filter(ev => ev !== event) 
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-mono">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 font-mono text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    secret: `whsec_${Math.random().toString(36).substr(2, 16)}` 
                  })}
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded-r-lg border border-l-0 border-gray-300 hover:bg-gray-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Create Webhook
              </button>
              <button
                type="button"
                onClick={() => setShowCreateWebhook(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const APIKeysTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
        <button
          onClick={() => setShowCreateKey(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                  <div className="ml-3">{getStatusBadge(apiKey.status)}</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{apiKey.description}</p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                    {visibleKeys.has(apiKey.id) 
                      ? apiKey.key 
                      : `${apiKey.key.substring(0, 12)}${'*'.repeat(16)}`
                    }
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono"
                    >
                      {permission}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">{new Date(apiKey.created).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last used:</span>
                    <span className="ml-2 font-medium">
                      {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Usage this month</span>
                <span className="font-medium">
                  {apiKey.usage.requests.toLocaleString()} / {apiKey.usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(apiKey.usage.requests / apiKey.usage.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
        <button
          onClick={() => setShowCreateWebhook(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                  <div className="ml-3">{getStatusBadge(webhook.status)}</div>
                </div>
                
                <div className="mb-3">
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                    {webhook.url}
                  </code>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-mono"
                    >
                      {event}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="ml-2 font-medium">{webhook.deliverySuccess}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Deliveries:</span>
                    <span className="ml-2 font-medium">{webhook.totalDeliveries.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Delivery:</span>
                    <span className="ml-2 font-medium">
                      {webhook.lastDelivery ? new Date(webhook.lastDelivery).toLocaleDateString() : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 p-2">
                  <Activity className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Delivery Health</span>
                <div className="flex items-center">
                  {webhook.deliverySuccess >= 95 ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {webhook.deliverySuccess >= 95 ? 'Healthy' : 'Warning'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const UsageAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {apiUsage?.currentPeriod.totalRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((apiUsage?.currentPeriod.successfulRequests / apiUsage?.currentPeriod.totalRequests) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {apiUsage?.currentPeriod.averageResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Error Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {apiUsage?.currentPeriod.errorRequests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h3>
        <div className="space-y-4">
          {apiUsage?.endpoints.map((endpoint, index) => (
            <div key={endpoint.endpoint} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <code className="font-mono text-sm font-medium">{endpoint.endpoint}</code>
                  <p className="text-xs text-gray-600">{endpoint.requests.toLocaleString()} requests</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{endpoint.avgResponseTime}ms</p>
                <p className="text-xs text-gray-600">avg response</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Usage Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Trend</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Usage chart would be displayed here</p>
            <p className="text-sm text-gray-500">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );

  const RateLimitsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limit Tiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(rateLimits || {}).map(([tier, limits]) => (
            <div key={tier} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-3">{tier} Tier</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Minute:</span>
                  <span className="font-medium">{limits.requestsPerMinute.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Hour:</span>
                  <span className="font-medium">{limits.requestsPerHour.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Day:</span>
                  <span className="font-medium">{limits.requestsPerDay.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Rate Limiting Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Rate limits are enforced per API key</li>
          <li>• Limits reset at the beginning of each time window</li>
          <li>• HTTP 429 status code is returned when limits are exceeded</li>
          <li>• Contact support to request higher limits for your use case</li>
        </ul>
      </div>
    </div>
  );

  const DocumentationTab = () => (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Book className="w-4 h-4 mr-2" />
              Getting Started Guide
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Zap className="w-4 h-4 mr-2" />
              Authentication
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Shield className="w-4 h-4 mr-2" />
              Rate Limiting
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Examples</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Code className="w-4 h-4 mr-2" />
              JavaScript SDK
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Code className="w-4 h-4 mr-2" />
              Python Examples
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Code className="w-4 h-4 mr-2" />
              cURL Commands
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Webhook className="w-4 h-4 mr-2" />
              Webhook Examples
            </a>
          </div>
        </div>
      </div>

      {/* API Schema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">OpenAPI Schema</h3>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download OpenAPI Spec
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center hover:bg-gray-300">
            <Globe className="w-4 h-4 mr-2" />
            View Interactive Docs
          </button>
        </div>
      </div>

      {/* SDK Downloads */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Official SDKs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-medium mb-2">Node.js</h4>
            <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-200">
              npm install
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🐍</div>
            <h4 className="font-medium mb-2">Python</h4>
            <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-200">
              pip install
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">☕</div>
            <h4 className="font-medium mb-2">Java</h4>
            <button className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-200">
              maven install
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading API management data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'keys':
        return <APIKeysTab />;
      case 'webhooks':
        return <WebhooksTab />;
      case 'usage':
        return <UsageAnalyticsTab />;
      case 'limits':
        return <RateLimitsTab />;
      case 'docs':
        return <DocumentationTab />;
      default:
        return <APIKeysTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
        <p className="text-gray-600 mt-2">Manage API keys, webhooks, and monitor usage</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {showCreateKey && <CreateAPIKeyForm />}
      {showCreateWebhook && <CreateWebhookForm />}
    </div>
  );
};

export default APIManagementSettings;