import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Plus, Edit, Trash2, Eye, BarChart3,
  Calendar, Phone, Users, Target, Settings, Filter, Search,
  RefreshCw, Download, AlertCircle, CheckCircle, Clock,
  PlayCircle, PauseCircle, StopCircle, Loader
} from 'lucide-react';
import { campaignAPI } from '../config/api.js';
import CampaignCreationModal from './CampaignCreationModal.jsx';

const CampaignManagementPage = () => {
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    campaign_type: 'all',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Campaign status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Campaign type icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'outbound_calls': return <Phone className="w-4 h-4" />;
      case 'sms_blast': return <Users className="w-4 h-4" />;
      case 'email_campaign': return <Target className="w-4 h-4" />;
      case 'mixed_media': return <BarChart3 className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.campaign_type !== 'all' && { campaign_type: filters.campaign_type })
      };

      const data = await campaignAPI.getCampaigns(params);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns. Please check your connection and authentication.');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Load campaigns on mount and filter changes
  useEffect(() => {
    loadCampaigns();
  }, [filters.status, filters.campaign_type]);

  // Handle campaign actions
  const handleCampaignAction = async (action, campaignId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`${action}_${campaignId}`]: true }));
      
      switch (action) {
        case 'start':
          await campaignAPI.startCampaign(campaignId);
          break;
        case 'pause':
          await campaignAPI.pauseCampaign(campaignId);
          break;
        case 'schedule':
          await campaignAPI.scheduleCampaign(campaignId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this campaign?')) {
            await campaignAPI.deleteCampaign(campaignId);
          }
          break;
        default:
          break;
      }
      
      // Reload campaigns to reflect changes
      await loadCampaigns();
    } catch (err) {
      console.error(`Failed to ${action} campaign:`, err);
      setError(`Failed to ${action} campaign: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${action}_${campaignId}`]: false }));
    }
  };

  // Filter campaigns by search
  const filteredCampaigns = campaigns.filter(campaign => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      campaign.name?.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower) ||
      campaign.id?.toLowerCase().includes(searchLower)
    );
  });

  // Handle campaign creation success
  const handleCampaignCreated = (newCampaign) => {
    console.log('New campaign created:', newCampaign);
    // Reload campaigns to show the new one
    loadCampaigns();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
              <p className="text-gray-600 mt-2">Create and manage marketing campaigns with AI optimization</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadCampaigns}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Campaign name, description, or ID..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.campaign_type}
                onChange={(e) => setFilters(prev => ({ ...prev, campaign_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="outbound_calls">Outbound Calls</option>
                <option value="sms_blast">SMS Blast</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="mixed_media">Mixed Media</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading && campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Found</h3>
              <p className="text-gray-600 mb-4">
                {campaigns.length === 0 
                  ? "Create your first campaign to get started with marketing automation"
                  : "No campaigns match your current filters"
                }
              </p>
              {campaigns.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">
                            {campaign.description || 'No description'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {campaign.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(campaign.campaign_type)}
                          <span className="text-sm text-gray-900 capitalize">
                            {campaign.campaign_type?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                          {campaign.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campaign.contacts_completed || 0} / {campaign.total_contacts || 0}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${campaign.total_contacts > 0 
                                ? (campaign.contacts_completed / campaign.total_contacts) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campaign.success_rate ? `${(campaign.success_rate * 100).toFixed(1)}%` : '0%'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Start/Pause/Resume buttons based on status */}
                          {campaign.status === 'draft' || campaign.status === 'scheduled' ? (
                            <button
                              onClick={() => handleCampaignAction('start', campaign.id)}
                              disabled={actionLoading[`start_${campaign.id}`]}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Start Campaign"
                            >
                              {actionLoading[`start_${campaign.id}`] ? 
                                <Loader className="w-4 h-4 animate-spin" /> : 
                                <PlayCircle className="w-4 h-4" />
                              }
                            </button>
                          ) : campaign.status === 'running' ? (
                            <button
                              onClick={() => handleCampaignAction('pause', campaign.id)}
                              disabled={actionLoading[`pause_${campaign.id}`]}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded transition-colors disabled:opacity-50"
                              title="Pause Campaign"
                            >
                              {actionLoading[`pause_${campaign.id}`] ? 
                                <Loader className="w-4 h-4 animate-spin" /> : 
                                <PauseCircle className="w-4 h-4" />
                              }
                            </button>
                          ) : campaign.status === 'paused' ? (
                            <button
                              onClick={() => handleCampaignAction('start', campaign.id)}
                              disabled={actionLoading[`start_${campaign.id}`]}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Resume Campaign"
                            >
                              {actionLoading[`start_${campaign.id}`] ? 
                                <Loader className="w-4 h-4 animate-spin" /> : 
                                <PlayCircle className="w-4 h-4" />
                              }
                            </button>
                          ) : null}

                          {/* View details */}
                          <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Campaign"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleCampaignAction('delete', campaign.id)}
                            disabled={actionLoading[`delete_${campaign.id}`]}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Delete Campaign"
                          >
                            {actionLoading[`delete_${campaign.id}`] ? 
                              <Loader className="w-4 h-4 animate-spin" /> : 
                              <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                  <p className="text-gray-600 text-sm">Campaign Details & Analytics</p>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Campaign Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Type:</span> {selectedCampaign.campaign_type}</div>
                      <div><span className="font-medium">Status:</span> {selectedCampaign.status}</div>
                      <div><span className="font-medium">Created:</span> {new Date(selectedCampaign.created_at).toLocaleDateString()}</div>
                      <div><span className="font-medium">Description:</span> {selectedCampaign.description || 'No description'}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Total Contacts:</span> {selectedCampaign.total_contacts || 0}</div>
                      <div><span className="font-medium">Attempted:</span> {selectedCampaign.contacts_attempted || 0}</div>
                      <div><span className="font-medium">Completed:</span> {selectedCampaign.contacts_completed || 0}</div>
                      <div><span className="font-medium">Success Rate:</span> {selectedCampaign.success_rate ? `${(selectedCampaign.success_rate * 100).toFixed(1)}%` : '0%'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Campaign Creation Modal */}
        <CampaignCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCampaignCreated}
        />
      </div>
    </div>
  );
};

export default CampaignManagementPage;