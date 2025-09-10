import React, { useState } from 'react';
import { 
  Shield, Phone, Ban, AlertTriangle, CheckCircle, 
  Upload, Download, Search, Filter, Plus, Trash2,
  Eye, Calendar, Clock, FileText, Users, Settings
} from 'lucide-react';

const DNCManagement = () => {
  const [activeTab, setActiveTab] = useState('lists');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock DNC lists data
  const dncLists = [
    {
      id: 'federal_dnc',
      name: 'Federal Do Not Call Registry',
      type: 'federal',
      description: 'Official FTC Do Not Call Registry',
      contactCount: 245000000,
      lastUpdated: new Date('2025-01-10'),
      autoUpdate: true,
      complianceLevel: 'federal',
      status: 'active',
      source: 'FTC Registry'
    },
    {
      id: 'state_dnc_ca',
      name: 'California State DNC',
      type: 'state',
      description: 'California state-specific DNC regulations',
      contactCount: 12450000,
      lastUpdated: new Date('2025-01-08'),
      autoUpdate: true,
      complianceLevel: 'state',
      status: 'active',
      source: 'CA Attorney General'
    },
    {
      id: 'company_dnc',
      name: 'Company Do Not Call',
      type: 'company',
      description: 'Internal company DNC list for customers who opted out',
      contactCount: 48932,
      lastUpdated: new Date('2025-01-11'),
      autoUpdate: false,
      complianceLevel: 'internal',
      status: 'active',
      source: 'Internal'
    },
    {
      id: 'industry_dnc',
      name: 'Industry Association DNC',
      type: 'industry',
      description: 'Real estate industry association DNC list',
      contactCount: 892034,
      lastUpdated: new Date('2025-01-05'),
      autoUpdate: true,
      complianceLevel: 'industry',
      status: 'active',
      source: 'REA Association'
    }
  ];

  // Mock DNC entries
  const dncEntries = [
    {
      id: 'dnc_001',
      phoneNumber: '+1234567890',
      listId: 'federal_dnc',
      dateAdded: new Date('2024-12-15'),
      source: 'FTC Registry',
      reason: 'Consumer registration',
      expiryDate: null,
      status: 'active',
      notes: 'Registered via FTC website'
    },
    {
      id: 'dnc_002',
      phoneNumber: '+0987654321',
      listId: 'company_dnc',
      dateAdded: new Date('2025-01-10'),
      source: 'Customer Request',
      reason: 'Opt-out request',
      expiryDate: null,
      status: 'active',
      notes: 'Customer called to remove from marketing calls'
    },
    {
      id: 'dnc_003',
      phoneNumber: '+1122334455',
      listId: 'state_dnc_ca',
      dateAdded: new Date('2024-11-20'),
      source: 'State Registry',
      reason: 'State registration',
      expiryDate: new Date('2026-11-20'),
      status: 'active',
      notes: 'California state DNC registration'
    },
    {
      id: 'dnc_004',
      phoneNumber: '+5544332211',
      listId: 'company_dnc',
      dateAdded: new Date('2025-01-05'),
      source: 'Email Unsubscribe',
      reason: 'Email opt-out',
      expiryDate: null,
      status: 'active',
      notes: 'Opted out via email unsubscribe link'
    }
  ];

  // Mock scrubbing results
  const scrubbingResults = [
    {
      id: 'scrub_001',
      campaignId: 'camp_001',
      campaignName: 'Q4 Real Estate Follow-up',
      dateScrubed: new Date('2025-01-11'),
      totalContacts: 15420,
      matchedDNC: 342,
      cleanContacts: 15078,
      complianceRate: 97.8,
      listsChecked: ['federal_dnc', 'state_dnc_ca', 'company_dnc'],
      status: 'completed'
    },
    {
      id: 'scrub_002',
      campaignId: 'camp_002',
      campaignName: 'New Lead Outreach',
      dateScrubed: new Date('2025-01-10'),
      totalContacts: 8924,
      matchedDNC: 156,
      cleanContacts: 8768,
      complianceRate: 98.3,
      listsChecked: ['federal_dnc', 'company_dnc'],
      status: 'completed'
    }
  ];

  // Filter and sort DNC entries
  const filteredEntries = dncEntries
    .filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.phoneNumber.includes(searchTerm) ||
        entry.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesList = selectedList === 'all' || entry.listId === selectedList;
      
      return matchesSearch && matchesList;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get compliance status color
  const getComplianceColor = (rate) => {
    if (rate >= 98) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DNC Management</h2>
          <p className="text-gray-600">Manage Do Not Call lists and ensure compliance with regulations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <Shield className="w-4 h-4" />
            <span>Scrub Campaign</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Compliance Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Compliance Notice</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Ensure all campaigns are scrubbed against DNC lists before dialing. 
              Federal regulations require checking the FTC Do Not Call Registry and honoring all opt-out requests.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {dncLists.reduce((sum, list) => sum + list.contactCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-800">Total DNC Numbers</div>
            </div>
            <Ban className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {scrubbingResults[0]?.complianceRate || 0}%
              </div>
              <div className="text-sm text-green-800">Compliance Rate</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {dncLists.length}
              </div>
              <div className="text-sm text-purple-800">Active Lists</div>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {scrubbingResults.reduce((sum, result) => sum + result.matchedDNC, 0)}
              </div>
              <div className="text-sm text-orange-800">Recent Matches</div>
            </div>
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'lists', label: 'DNC Lists', icon: FileText },
              { id: 'entries', label: 'DNC Entries', icon: Ban },
              { id: 'scrubbing', label: 'Scrubbing History', icon: Shield },
              { id: 'compliance', label: 'Compliance Reports', icon: CheckCircle }
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
          {/* DNC Lists Tab */}
          {activeTab === 'lists' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Manage your Do Not Call lists and compliance settings</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add List</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dncLists.map((list) => (
                  <div key={list.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          list.type === 'federal' ? 'bg-red-500' :
                          list.type === 'state' ? 'bg-blue-500' :
                          list.type === 'industry' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                          <p className="text-sm text-gray-600">{list.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contact Count:</span>
                        <span className="font-medium">{list.contactCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm text-gray-800">{list.lastUpdated.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Auto Update:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${list.autoUpdate ? 'text-green-600' : 'text-gray-500'}`}>
                            {list.autoUpdate ? 'Enabled' : 'Disabled'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={list.autoUpdate}
                              onChange={() => {}}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Compliance Level:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          list.complianceLevel === 'federal' ? 'bg-red-100 text-red-800' :
                          list.complianceLevel === 'state' ? 'bg-blue-100 text-blue-800' :
                          list.complianceLevel === 'industry' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {list.complianceLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Source:</span>
                        <span className="text-sm text-gray-800">{list.source}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-2 ${
                          list.status === 'active' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            list.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium capitalize">{list.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                            Update
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DNC Entries Tab */}
          {activeTab === 'entries' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search phone numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <select
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Lists</option>
                  {dncLists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="phoneNumber">Phone Number</option>
                  <option value="source">Source</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Entries Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">List</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date Added</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEntries.map((entry) => {
                        const list = dncLists.find(l => l.id === entry.listId);
                        const isExpired = entry.expiryDate && entry.expiryDate < new Date();
                        
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{entry.phoneNumber}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  list?.type === 'federal' ? 'bg-red-500' :
                                  list?.type === 'state' ? 'bg-blue-500' :
                                  list?.type === 'industry' ? 'bg-purple-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="text-sm">{list?.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {entry.source}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {entry.dateAdded.toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {entry.expiryDate ? (
                                <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
                                  {entry.expiryDate.toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">Permanent</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                entry.status === 'active' && !isExpired
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isExpired ? 'Expired' : entry.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                </button>
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

          {/* Scrubbing History Tab */}
          {activeTab === 'scrubbing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">View campaign scrubbing history and compliance results</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors">
                  <Shield className="w-4 h-4" />
                  <span>New Scrub</span>
                </button>
              </div>

              <div className="space-y-4">
                {scrubbingResults.map((result) => (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{result.campaignName}</h3>
                        <p className="text-sm text-gray-600">Scrubbed on {result.dateScrubed.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${getComplianceColor(result.complianceRate)}`}>
                          {result.complianceRate}%
                        </span>
                        <CheckCircle className={`w-5 h-5 ${getComplianceColor(result.complianceRate)}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{result.totalContacts.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Contacts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{result.matchedDNC}</div>
                        <div className="text-sm text-gray-600">DNC Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{result.cleanContacts.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Clean Contacts</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getComplianceColor(result.complianceRate)}`}>
                          {result.complianceRate}%
                        </div>
                        <div className="text-sm text-gray-600">Compliance</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Lists checked:</span>
                        <div className="flex items-center space-x-2">
                          {result.listsChecked.map((listId) => {
                            const list = dncLists.find(l => l.id === listId);
                            return (
                              <span key={listId} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {list?.name.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          View Details
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm">
                          Download Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Reports Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Compliance Status: GOOD</h3>
                    <p className="text-green-800 mt-1">
                      All recent campaigns have been properly scrubbed and meet regulatory requirements.
                    </p>
                    <div className="mt-3 text-sm text-green-700">
                      <p>• Federal DNC Registry: Up to date (Last sync: {new Date().toLocaleDateString()})</p>
                      <p>• State DNC Lists: Current (2 states configured)</p>
                      <p>• Company Opt-outs: Real-time processing enabled</p>
                      <p>• Average Compliance Rate: 97.8%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Requirements */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regulatory Requirements Checklist</h3>
                <div className="space-y-3">
                  {[
                    { requirement: 'Check Federal DNC Registry before each campaign', status: 'compliant', lastCheck: '2 hours ago' },
                    { requirement: 'Honor company-specific opt-out requests', status: 'compliant', lastCheck: 'Real-time' },
                    { requirement: 'Maintain state-specific DNC compliance', status: 'compliant', lastCheck: '1 day ago' },
                    { requirement: 'Document all scrubbing activities', status: 'compliant', lastCheck: 'Automatic' },
                    { requirement: 'Provide opt-out mechanism during calls', status: 'warning', lastCheck: 'Manual process' },
                    { requirement: 'Maintain records for 5 years', status: 'compliant', lastCheck: 'Automatic' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {item.status === 'compliant' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-gray-900">{item.requirement}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">{item.lastCheck}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left hover:bg-blue-100 transition-colors">
                    <Download className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-blue-900">Download Compliance Report</h4>
                    <p className="text-sm text-blue-700 mt-1">Generate detailed compliance report for audits</p>
                  </button>
                  
                  <button className="bg-green-50 border border-green-200 rounded-lg p-4 text-left hover:bg-green-100 transition-colors">
                    <Shield className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-green-900">Run Full Audit</h4>
                    <p className="text-sm text-green-700 mt-1">Comprehensive compliance check across all lists</p>
                  </button>
                  
                  <button className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left hover:bg-purple-100 transition-colors">
                    <Settings className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-medium text-purple-900">Configure Alerts</h4>
                    <p className="text-sm text-purple-700 mt-1">Set up compliance monitoring and alerts</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNCManagement;
