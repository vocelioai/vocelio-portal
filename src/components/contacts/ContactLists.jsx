import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, Download, 
  Upload, Eye, MoreVertical, Phone, Mail, Calendar,
  AlertTriangle, CheckCircle, Clock, ArrowRight
} from 'lucide-react';

// Mock data for contact lists
const mockContactLists = [
  {
    id: 'list_001',
    name: 'Real Estate Leads Q4 2025',
    description: 'High-quality real estate prospects from online campaigns',
    contactCount: 1247,
    lastUpdated: '2 hours ago',
    status: 'active',
    source: 'Website Form',
    tags: ['Real Estate', 'High Priority', 'Q4'],
    created: '2025-09-01',
    owner: 'Sarah Johnson',
    completionRate: 68.5,
    dialedCount: 854,
    connectedCount: 312,
    avgCallDuration: '4:23'
  },
  {
    id: 'list_002', 
    name: 'Follow-up Callbacks',
    description: 'Customers requesting callback appointments',
    contactCount: 89,
    lastUpdated: '1 day ago',
    status: 'active',
    source: 'Inbound Calls',
    tags: ['Callbacks', 'Warm Leads'],
    created: '2025-09-08',
    owner: 'Mike Chen',
    completionRate: 91.2,
    dialedCount: 81,
    connectedCount: 74,
    avgCallDuration: '7:12'
  },
  {
    id: 'list_003',
    name: 'Customer Support Queue',
    description: 'Support tickets requiring phone follow-up',
    contactCount: 23,
    lastUpdated: '30 minutes ago',
    status: 'active',
    source: 'Support Tickets',
    tags: ['Support', 'Urgent'],
    created: '2025-09-10',
    owner: 'Lisa Park',
    completionRate: 43.5,
    dialedCount: 10,
    connectedCount: 8,
    avgCallDuration: '12:45'
  },
  {
    id: 'list_004',
    name: 'Insurance Renewals',
    description: 'Policy holders due for renewal outreach',
    contactCount: 567,
    lastUpdated: '5 days ago',
    status: 'paused',
    source: 'CRM Import',
    tags: ['Insurance', 'Renewals'],
    created: '2025-08-25',
    owner: 'David Wilson',
    completionRate: 0,
    dialedCount: 0,
    connectedCount: 0,
    avgCallDuration: '0:00'
  }
];

const ContactLists = () => {
  const [contactLists, setContactLists] = useState(mockContactLists);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLists, setSelectedLists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter contact lists based on search and status
  const filteredLists = contactLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || list.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle list selection
  const toggleListSelection = (listId) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      error: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for lists:`, selectedLists);
    // Implement bulk actions (delete, export, etc.)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Lists</h2>
          <p className="text-gray-600">Manage your contact lists and campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lists</p>
              <p className="text-xl font-bold text-gray-900">{contactLists.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-xl font-bold text-gray-900">
                {contactLists.reduce((sum, list) => sum + list.contactCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Lists</p>
              <p className="text-xl font-bold text-gray-900">
                {contactLists.filter(list => list.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Connect Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {((contactLists.reduce((sum, list) => sum + list.completionRate, 0) / contactLists.length) || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <div className="w-4 h-4 flex flex-col space-y-0.5">
                  <div className="bg-current h-0.5 rounded-full"></div>
                  <div className="bg-current h-0.5 rounded-full"></div>
                  <div className="bg-current h-0.5 rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedLists.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedLists.length} selected</span>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Export
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Lists Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <div key={list.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedLists.includes(list.id)}
                      onChange={() => toggleListSelection(list.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{list.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{list.description}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {getStatusBadge(list.status)}
                  <span className="text-sm text-gray-500">{list.lastUpdated}</span>
                </div>
              </div>

              {/* Card Stats */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contacts</span>
                  <span className="font-medium">{list.contactCount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium text-green-600">{list.completionRate}%</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connected</span>
                  <span className="font-medium">{list.connectedCount}/{list.dialedCount}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Duration</span>
                  <span className="font-medium">{list.avgCallDuration}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(list.completionRate, 100)}%` }}
                  ></div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {list.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {list.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{list.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLists(filteredLists.map(list => list.id));
                        } else {
                          setSelectedLists([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">List Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLists.map((list) => (
                  <tr key={list.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLists.includes(list.id)}
                        onChange={() => toggleListSelection(list.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{list.name}</div>
                        <div className="text-sm text-gray-500">{list.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {list.contactCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(list.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(list.completionRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{list.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{list.owner}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{list.lastUpdated}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLists.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contact lists found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No lists match your search criteria.' : 'Get started by creating your first contact list.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New List
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactLists;
