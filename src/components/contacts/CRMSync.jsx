import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Settings, CheckCircle, XCircle, AlertTriangle,
  Clock, Database, Users, Zap, Filter, Search, Plus,
  Trash2, Eye, ExternalLink, RotateCcw, Download
} from 'lucide-react';

const CRMSync = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCRM, setSelectedCRM] = useState('all');

  // Mock CRM integrations data
  const crmIntegrations = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: '☁️',
      status: 'connected',
      lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      totalContacts: 15847,
      syncedContacts: 15203,
      failedContacts: 644,
      autoSync: true,
      syncFrequency: '15 minutes',
      apiKey: 'sf_***************4a2b',
      endpoint: 'https://yourorg.salesforce.com',
      features: ['Contacts', 'Leads', 'Accounts', 'Opportunities']
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      logo: '🧲',
      status: 'connected',
      lastSync: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      totalContacts: 8924,
      syncedContacts: 8924,
      failedContacts: 0,
      autoSync: true,
      syncFrequency: '30 minutes',
      apiKey: 'hub_***************7c9d',
      endpoint: 'https://api.hubapi.com',
      features: ['Contacts', 'Companies', 'Deals', 'Tasks']
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      logo: '🚀',
      status: 'error',
      lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      totalContacts: 3241,
      syncedContacts: 2897,
      failedContacts: 344,
      autoSync: false,
      syncFrequency: '1 hour',
      apiKey: 'pd_***************1e8f',
      endpoint: 'https://yourcompany.pipedrive.com',
      features: ['Persons', 'Organizations', 'Deals', 'Activities'],
      error: 'API rate limit exceeded. Retry in 2 hours.'
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      logo: '⚡',
      status: 'disconnected',
      lastSync: null,
      totalContacts: 0,
      syncedContacts: 0,
      failedContacts: 0,
      autoSync: false,
      syncFrequency: 'Manual',
      apiKey: null,
      endpoint: 'https://www.zohoapis.com',
      features: ['Contacts', 'Accounts', 'Potentials', 'Campaigns']
    }
  ];

  // Mock sync logs
  const syncLogs = [
    {
      id: 'log_001',
      crm: 'salesforce',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'auto_sync',
      status: 'success',
      duration: '2m 34s',
      contactsProcessed: 1247,
      contactsAdded: 23,
      contactsUpdated: 89,
      contactsSkipped: 5,
      errors: 0
    },
    {
      id: 'log_002',
      crm: 'hubspot',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'auto_sync',
      status: 'success',
      duration: '1m 12s',
      contactsProcessed: 892,
      contactsAdded: 0,
      contactsUpdated: 12,
      contactsSkipped: 0,
      errors: 0
    },
    {
      id: 'log_003',
      crm: 'pipedrive',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'manual_sync',
      status: 'error',
      duration: '45s',
      contactsProcessed: 0,
      contactsAdded: 0,
      contactsUpdated: 0,
      contactsSkipped: 0,
      errors: 1,
      errorMessage: 'API rate limit exceeded'
    },
    {
      id: 'log_004',
      crm: 'salesforce',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'auto_sync',
      status: 'warning',
      duration: '3m 45s',
      contactsProcessed: 1543,
      contactsAdded: 45,
      contactsUpdated: 234,
      contactsSkipped: 12,
      errors: 3,
      errorMessage: '3 contacts had validation errors'
    }
  ];

  // Mock field mappings
  const fieldMappings = [
    { vocelioField: 'first_name', salesforceField: 'FirstName', hubspotField: 'firstname', pipedriveField: 'first_name', zohoField: 'First_Name' },
    { vocelioField: 'last_name', salesforceField: 'LastName', hubspotField: 'lastname', pipedriveField: 'last_name', zohoField: 'Last_Name' },
    { vocelioField: 'email', salesforceField: 'Email', hubspotField: 'email', pipedriveField: 'email', zohoField: 'Email' },
    { vocelioField: 'phone', salesforceField: 'Phone', hubspotField: 'phone', pipedriveField: 'phone', zohoField: 'Phone' },
    { vocelioField: 'company', salesforceField: 'Account.Name', hubspotField: 'company', pipedriveField: 'org_name', zohoField: 'Account_Name' },
    { vocelioField: 'title', salesforceField: 'Title', hubspotField: 'jobtitle', pipedriveField: 'title', zohoField: 'Title' },
    { vocelioField: 'address', salesforceField: 'MailingAddress', hubspotField: 'address', pipedriveField: 'address', zohoField: 'Mailing_Street' }
  ];

  // Simulate sync process
  const handleSync = async (crmId) => {
    setSyncStatus('syncing');
    setSyncProgress(0);

    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncStatus('success');
      setLastSyncTime(new Date());
    }, 4000);
  };

  // Filter sync logs
  const filteredLogs = syncLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCRM = selectedCRM === 'all' || log.crm === selectedCRM;
    
    return matchesSearch && matchesCRM;
  });

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Sync</h2>
          <p className="text-gray-600">Manage integrations and sync contacts from external CRM systems</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            Last sync: {lastSyncTime.toLocaleTimeString()}
          </div>
          <button
            onClick={() => handleSync('all')}
            disabled={syncStatus === 'syncing'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2 transition-colors"
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Progress */}
      {syncStatus === 'syncing' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Syncing CRM data...</span>
            <span className="text-sm text-gray-600">{Math.round(syncProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Database },
              { id: 'integrations', label: 'Integrations', icon: Zap },
              { id: 'logs', label: 'Sync Logs', icon: Clock },
              { id: 'mappings', label: 'Field Mapping', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {crmIntegrations.filter(crm => crm.status === 'connected').length}
                      </div>
                      <div className="text-sm text-blue-800">Connected CRMs</div>
                    </div>
                    <Database className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {crmIntegrations.reduce((sum, crm) => sum + crm.syncedContacts, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800">Synced Contacts</div>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {syncLogs.filter(log => log.status === 'success').length}
                      </div>
                      <div className="text-sm text-yellow-800">Successful Syncs</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {crmIntegrations.reduce((sum, crm) => sum + crm.failedContacts, 0)}
                      </div>
                      <div className="text-sm text-red-800">Failed Contacts</div>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sync Activity</h3>
                <div className="space-y-4">
                  {syncLogs.slice(0, 5).map((log) => {
                    const crm = crmIntegrations.find(c => c.id === log.crm);
                    return (
                      <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{crm?.logo}</div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {crm?.name} - {log.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {log.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {log.contactsProcessed} contacts processed
                            </div>
                            <div className="text-sm text-gray-600">
                              Duration: {log.duration}
                            </div>
                          </div>
                          {getStatusIcon(log.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Manage your CRM integrations and connection settings</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Integration</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {crmIntegrations.map((crm) => (
                  <div key={crm.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{crm.logo}</div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{crm.name}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(crm.status)}
                            <span className={`text-sm capitalize ${
                              crm.status === 'connected' ? 'text-green-600' :
                              crm.status === 'error' ? 'text-red-600' :
                              crm.status === 'warning' ? 'text-yellow-600' :
                              'text-gray-500'
                            }`}>
                              {crm.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {crm.status === 'error' && crm.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-800">{crm.error}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Contacts:</span>
                        <span className="font-medium">{crm.totalContacts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Synced:</span>
                        <span className="font-medium text-green-600">{crm.syncedContacts.toLocaleString()}</span>
                      </div>
                      {crm.failedContacts > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Failed:</span>
                          <span className="font-medium text-red-600">{crm.failedContacts}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Auto Sync:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${crm.autoSync ? 'text-green-600' : 'text-gray-500'}`}>
                            {crm.autoSync ? 'Enabled' : 'Disabled'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={crm.autoSync}
                              onChange={() => {}}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <span className="text-sm text-gray-800">{crm.syncFrequency}</span>
                      </div>
                      {crm.lastSync && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Sync:</span>
                          <span className="text-sm text-gray-800">{crm.lastSync.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Features: {crm.features.slice(0, 2).join(', ')}
                          {crm.features.length > 2 && ` +${crm.features.length - 2} more`}
                        </div>
                        <div className="flex items-center space-x-2">
                          {crm.status === 'connected' && (
                            <button
                              onClick={() => handleSync(crm.id)}
                              disabled={syncStatus === 'syncing'}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                            >
                              Sync Now
                            </button>
                          )}
                          {crm.status === 'disconnected' && (
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                              Connect
                            </button>
                          )}
                          {crm.status === 'error' && (
                            <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
                              Reconnect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <select
                  value={selectedCRM}
                  onChange={(e) => setSelectedCRM(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All CRMs</option>
                  {crmIntegrations.map((crm) => (
                    <option key={crm.id} value={crm.id}>{crm.name}</option>
                  ))}
                </select>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Logs Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">CRM</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Contacts</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLogs.map((log) => {
                        const crm = crmIntegrations.find(c => c.id === log.crm);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{crm?.logo}</span>
                                <span className="font-medium">{crm?.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {log.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(log.status)}
                                <span className={`text-sm capitalize ${
                                  log.status === 'success' ? 'text-green-600' :
                                  log.status === 'error' ? 'text-red-600' :
                                  log.status === 'warning' ? 'text-yellow-600' :
                                  'text-gray-500'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {log.timestamp.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {log.duration}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium">{log.contactsProcessed} processed</div>
                                {log.contactsAdded > 0 && (
                                  <div className="text-green-600">+{log.contactsAdded} added</div>
                                )}
                                {log.contactsUpdated > 0 && (
                                  <div className="text-blue-600">{log.contactsUpdated} updated</div>
                                )}
                                {log.errors > 0 && (
                                  <div className="text-red-600">{log.errors} errors</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                {log.status === 'error' && (
                                  <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Field Mapping Tab */}
          {activeTab === 'mappings' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Field Mapping Configuration</h3>
                <p className="text-sm text-blue-800">
                  Map fields from your CRM systems to Vocelio contact fields to ensure proper data synchronization.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Vocelio Field</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Salesforce</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">HubSpot</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Pipedrive</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Zoho CRM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fieldMappings.map((mapping, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{mapping.vocelioField}</div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={mapping.salesforceField}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={mapping.hubspotField}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={mapping.pipedriveField}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={mapping.zohoField}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  Reset to Default
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Mappings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMSync;
