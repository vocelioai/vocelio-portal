import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Users, User, Phone, Mail, MapPin, 
  CheckSquare, Square, Grid, List, ChevronDown, 
  AlertCircle, RefreshCw, Download, Upload, Plus,
  Tag, Clock, Target, Loader
} from 'lucide-react';
import { contactManagementAPI } from '../services/campaignIntegrationAPI.js';

const EnhancedContactSelector = ({ 
  isOpen, 
  onClose, 
  onSelectionComplete,
  initialSelection = { type: 'lists', lists: [], contacts: [] },
  title = "Select Contacts for Campaign"
}) => {
  // Selection modes: 'lists' or 'individual'
  const [selectionMode, setSelectionMode] = useState(initialSelection.type || 'lists');
  const [contactLists, setContactLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState(initialSelection.lists || []);
  const [selectedContacts, setSelectedContacts] = useState(initialSelection.contacts || []);
  
  // Individual contact selection state
  const [currentList, setCurrentList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsPagination, setContactsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phoneFilter, setPhoneFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load contact lists
  const loadContactLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const lists = await contactManagementAPI.getContactLists();
      setContactLists(lists);
    } catch (err) {
      console.error('Failed to load contact lists:', err);
      setError('Failed to load contact lists');
    } finally {
      setLoading(false);
    }
  };

  // Load contacts from selected list
  const loadContactsFromList = async (listId, page = 1) => {
    if (!listId) return;
    
    try {
      setContactsLoading(true);
      const result = await contactManagementAPI.getContactsFromList(listId, {
        page,
        limit: 50,
        search: searchQuery,
        status: statusFilter,
        phoneFilter
      });
      
      if (page === 1) {
        setContacts(result.contacts);
      } else {
        setContacts(prev => [...prev, ...result.contacts]);
      }
      
      setContactsPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      });
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts from list');
    } finally {
      setContactsLoading(false);
    }
  };

  // Handle list selection
  const toggleListSelection = (listId) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  // Handle individual contact selection
  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select all contacts in current view
  const selectAllVisibleContacts = () => {
    const visibleContactIds = contacts.map(contact => contact.id);
    setSelectedContacts(prev => {
      const newSelection = [...prev];
      visibleContactIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Deselect all contacts in current view
  const deselectAllVisibleContacts = () => {
    const visibleContactIds = contacts.map(contact => contact.id);
    setSelectedContacts(prev => 
      prev.filter(id => !visibleContactIds.includes(id))
    );
  };

  // Calculate selection summary
  const getSelectionSummary = () => {
    if (selectionMode === 'lists') {
      const selectedListObjects = contactLists.filter(list => selectedLists.includes(list.id));
      const totalContacts = selectedListObjects.reduce((sum, list) => sum + list.contactCount, 0);
      return {
        type: 'lists',
        count: selectedLists.length,
        totalContacts,
        items: selectedListObjects
      };
    } else {
      return {
        type: 'contacts',
        count: selectedContacts.length,
        totalContacts: selectedContacts.length,
        items: contacts.filter(contact => selectedContacts.includes(contact.id))
      };
    }
  };

  // Handle selection completion
  const handleComplete = () => {
    const summary = getSelectionSummary();
    onSelectionComplete({
      mode: selectionMode,
      lists: selectionMode === 'lists' ? selectedLists : [],
      contacts: selectionMode === 'individual' ? selectedContacts : [],
      summary
    });
    onClose();
  };

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadContactLists();
    }
  }, [isOpen]);

  // Load contacts when list or filters change
  useEffect(() => {
    if (selectionMode === 'individual' && currentList) {
      loadContactsFromList(currentList, 1);
    }
  }, [currentList, searchQuery, statusFilter, phoneFilter, selectionMode]);

  // Reset when switching modes
  useEffect(() => {
    if (selectionMode === 'lists') {
      setCurrentList(null);
      setContacts([]);
      setSelectedContacts([]);
    } else {
      setSelectedLists([]);
    }
  }, [selectionMode]);

  if (!isOpen) return null;

  const summary = getSelectionSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm">Choose how you want to select contacts for your campaign</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Selection Mode Toggle */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Selection Mode:</span>
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setSelectionMode('lists')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectionMode === 'lists'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Entire Lists
              </button>
              <button
                onClick={() => setSelectionMode('individual')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectionMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 inline-block mr-2" />
                Individual Contacts
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Selection Area */}
          <div className="flex-1 overflow-y-auto">
            {/* List Selection Mode */}
            {selectionMode === 'lists' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Select Contact Lists</h3>
                  <button
                    onClick={loadContactLists}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading contact lists...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactLists.map((list) => (
                      <div
                        key={list.id}
                        onClick={() => toggleListSelection(list.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedLists.includes(list.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedLists.includes(list.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedLists.includes(list.id) && (
                              <CheckSquare className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{list.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {list.contactCount.toLocaleString()} contacts
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {list.lastUpdated}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {list.tags?.map((tag, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Individual Contact Selection Mode */}
            {selectionMode === 'individual' && (
              <div className="p-6">
                {/* List Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a contact list to browse:
                  </label>
                  <select
                    value={currentList || ''}
                    onChange={(e) => setCurrentList(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a contact list...</option>
                    {contactLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.contactCount.toLocaleString()} contacts)
                      </option>
                    ))}
                  </select>
                </div>

                {currentList && (
                  <>
                    {/* Filters and Search */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search contacts..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="do_not_call">Do Not Call</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={phoneFilter}
                          onChange={(e) => setPhoneFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Phone Types</option>
                          <option value="mobile">Mobile Only</option>
                          <option value="landline">Landline Only</option>
                        </select>
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={selectAllVisibleContacts}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Select All ({contacts.length})
                        </button>
                        <button
                          onClick={deselectAllVisibleContacts}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Deselect All
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contacts Display */}
                    {contactsLoading && contacts.length === 0 ? (
                      <div className="text-center py-12">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading contacts...</p>
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contacts Found</h3>
                        <p className="text-gray-600">No contacts match your current filters</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-2'
                      }>
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => toggleContactSelection(contact.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedContacts.includes(contact.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                          >
                            <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                                selectedContacts.includes(contact.id)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedContacts.includes(contact.id) && (
                                  <CheckSquare className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    {contact.phone}
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      contact.phoneType === 'mobile' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {contact.phoneType}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    {contact.email}
                                  </div>
                                  {contact.customFields?.company && (
                                    <div className="text-xs text-gray-500">
                                      {contact.customFields.company}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    contact.status === 'active' 
                                      ? 'bg-green-100 text-green-700'
                                      : contact.status === 'do_not_call'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {contact.status.replace('_', ' ')}
                                  </span>
                                  {contact.customFields?.leadScore && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      Score: {contact.customFields.leadScore}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Load More */}
                    {contactsPagination.hasMore && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => loadContactsFromList(currentList, contactsPagination.currentPage + 1)}
                          disabled={contactsLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          {contactsLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin inline-block mr-2" />
                              Loading...
                            </>
                          ) : (
                            `Load More (${contactsPagination.totalCount - contacts.length} remaining)`
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selection Summary Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Summary</h3>
            
            {summary.count === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No contacts selected</p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectionMode === 'lists' 
                    ? 'Select contact lists to add to your campaign'
                    : 'Choose a list and select individual contacts'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{summary.totalContacts.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">
                    Total contacts {selectionMode === 'lists' ? 'in selected lists' : 'selected'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-lg font-semibold text-gray-900">{summary.count}</div>
                  <div className="text-sm text-gray-600">
                    {selectionMode === 'lists' ? 'Contact lists selected' : 'Individual contacts selected'}
                  </div>
                </div>

                {/* Selected Items Preview */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {summary.items.slice(0, 10).map((item, index) => (
                    <div key={item.id || index} className="bg-white rounded p-3 border border-gray-200">
                      <div className="font-medium text-sm text-gray-900">
                        {selectionMode === 'lists' ? item.name : `${item.firstName} ${item.lastName}`}
                      </div>
                      {selectionMode === 'lists' && (
                        <div className="text-xs text-gray-600">
                          {item.contactCount?.toLocaleString()} contacts
                        </div>
                      )}
                      {selectionMode === 'individual' && (
                        <div className="text-xs text-gray-600">{item.phone}</div>
                      )}
                    </div>
                  ))}
                  {summary.items.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      ... and {summary.items.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {summary.totalContacts > 0 && (
                <span>{summary.totalContacts.toLocaleString()} contacts selected</span>
              )}
            </div>
            <button
              onClick={handleComplete}
              disabled={summary.count === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContactSelector;