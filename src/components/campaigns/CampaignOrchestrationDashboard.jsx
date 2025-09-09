import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Play, Pause, Settings, Users, MessageSquare, Mail, Phone,
  BarChart3, Calendar, Target, Zap, Brain, Eye, Edit3,
  Plus, Copy, Archive, Trash2, Filter, Search, Download,
  Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Layers, Workflow, TestTube, Globe, Send, FileText
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import CampaignFlowBuilder from './CampaignFlowBuilder';
import TemplateManager from './TemplateManager';
import CampaignAnalytics from './CampaignAnalytics';
import AutomationRules from './AutomationRules';
import OmnichannelIntegration from './OmnichannelIntegration';

// ===== COPILOT PROMPT #6: Campaign Orchestration Interface =====
// Comprehensive campaign management and orchestration platform

const CampaignOrchestrationDashboard = ({ isActive }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock campaign data
  useEffect(() => {
    const mockCampaigns = [
      {
        id: 'camp_001',
        name: 'Welcome Series 2024',
        type: 'behavioral',
        status: 'active',
        channels: ['email', 'sms', 'push'],
        audience: 15420,
        sent: 8750,
        opened: 3962,
        clicked: 1205,
        converted: 287,
        budget: 5000,
        spent: 2340,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        performance: {
          openRate: 45.3,
          clickRate: 30.4,
          conversionRate: 23.8,
          roi: 340
        }
      },
      {
        id: 'camp_002',
        name: 'Black Friday Promotion',
        type: 'promotional',
        status: 'scheduled',
        channels: ['email', 'sms', 'whatsapp', 'push'],
        audience: 85600,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        budget: 25000,
        spent: 0,
        startDate: new Date('2024-11-24'),
        endDate: new Date('2024-11-30'),
        performance: {
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          roi: 0
        }
      },
      {
        id: 'camp_003',
        name: 'Customer Retention Flow',
        type: 'behavioral',
        status: 'active',
        channels: ['email', 'voice', 'chat'],
        audience: 4250,
        sent: 3890,
        opened: 2140,
        clicked: 980,
        converted: 445,
        budget: 8000,
        spent: 5670,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-12-31'),
        performance: {
          openRate: 55.0,
          clickRate: 45.8,
          conversionRate: 45.4,
          roi: 280
        }
      },
      {
        id: 'camp_004',
        name: 'Product Launch Announcement',
        type: 'transactional',
        status: 'completed',
        channels: ['email', 'sms', 'social'],
        audience: 125000,
        sent: 125000,
        opened: 89250,
        clicked: 28450,
        converted: 5690,
        budget: 15000,
        spent: 14890,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-15'),
        performance: {
          openRate: 71.4,
          clickRate: 31.9,
          conversionRate: 20.0,
          roi: 450
        }
      }
    ];
    setCampaigns(mockCampaigns);
  }, []);

  // Filter campaigns based on search and status
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, filterStatus]);

  // Campaign status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'draft': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Channel icon helper
  const getChannelIcon = (channel) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      voice: Phone,
      push: Bell,
      whatsapp: MessageSquare,
      chat: MessageSquare,
      social: Globe
    };
    return icons[channel] || MessageSquare;
  };

  const handleCampaignAction = (action, campaign) => {
    console.log(`${action} campaign:`, campaign.id);
    // Implement campaign actions (start, pause, stop, etc.)
  };

  if (!isActive) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Workflow className="h-8 w-8 text-blue-600" />
                <span>Campaign Orchestration</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage and orchestrate omnichannel marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Campaign</span>
              </button>
              <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'campaigns', label: 'Campaigns', icon: Layers },
                { id: 'templates', label: 'Templates', icon: Edit3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'automation', label: 'Automation', icon: Zap },
                { id: 'omnichannel', label: 'Omnichannel', icon: Globe },
                { id: 'builder', label: 'Flow Builder', icon: Workflow }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeView === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Active Campaigns"
                value={campaigns.filter(c => c.status === 'active').length}
                change="+12%"
                trend="up"
                icon={Play}
                color="green"
              />
              <KPICard
                title="Total Audience"
                value={campaigns.reduce((sum, c) => sum + c.audience, 0).toLocaleString()}
                change="+8.5%"
                trend="up"
                icon={Users}
                color="blue"
              />
              <KPICard
                title="Avg Conversion Rate"
                value={`${(campaigns.reduce((sum, c) => sum + c.performance.conversionRate, 0) / campaigns.length).toFixed(1)}%`}
                change="+2.3%"
                trend="up"
                icon={Target}
                color="purple"
              />
              <KPICard
                title="Total ROI"
                value={`${Math.round(campaigns.reduce((sum, c) => sum + c.performance.roi, 0) / campaigns.length)}%`}
                change="+15%"
                trend="up"
                icon={TrendingUp}
                color="green"
              />
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channels</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCampaigns.slice(0, 5).map((campaign) => (
                      <CampaignTableRow 
                        key={campaign.id} 
                        campaign={campaign} 
                        onAction={handleCampaignAction}
                        getStatusColor={getStatusColor}
                        getChannelIcon={getChannelIcon}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeView === 'campaigns' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                  <Filter className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign}
                  onAction={handleCampaignAction}
                  getStatusColor={getStatusColor}
                  getChannelIcon={getChannelIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeView === 'templates' && (
          <TemplateManager />
        )}

        {/* Analytics Tab */}
        {activeView === 'analytics' && (
          <CampaignAnalytics campaigns={campaigns} />
        )}

        {/* Automation Tab */}
        {activeView === 'automation' && (
          <AutomationRules />
        )}

        {/* Omnichannel Integration Tab */}
        {activeView === 'omnichannel' && (
          <OmnichannelIntegration 
            campaignId={selectedCampaign?.id} 
            isActive={isActive} 
          />
        )}

        {/* Flow Builder Tab */}
        {activeView === 'builder' && (
          <CampaignFlowBuilder />
        )}
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8" />
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600 text-sm">{title}</div>
    </div>
  );
};

// Campaign Table Row Component
const CampaignTableRow = ({ campaign, onAction, getStatusColor, getChannelIcon }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
          <div className="text-sm text-gray-500">{campaign.type}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-1">
          {campaign.channels.slice(0, 3).map((channel, index) => {
            const Icon = getChannelIcon(channel);
            return <Icon key={index} className="h-4 w-4 text-gray-500" />;
          })}
          {campaign.channels.length > 3 && (
            <span className="text-xs text-gray-500">+{campaign.channels.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="text-gray-900">{campaign.performance.conversionRate}% conversion</div>
        <div className="text-gray-500">{campaign.performance.roi}% ROI</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button onClick={() => onAction('view', campaign)} className="text-blue-600 hover:text-blue-900">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => onAction('edit', campaign)} className="text-gray-600 hover:text-gray-900">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={() => onAction('copy', campaign)} className="text-gray-600 hover:text-gray-900">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign, onAction, getStatusColor, getChannelIcon }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{campaign.type}</p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Audience</span>
          <span className="font-medium">{campaign.audience.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Conversion Rate</span>
          <span className="font-medium">{campaign.performance.conversionRate}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">ROI</span>
          <span className="font-medium text-green-600">{campaign.performance.roi}%</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-gray-500">Channels:</span>
          <div className="flex space-x-1">
            {campaign.channels.map((channel, index) => {
              const Icon = getChannelIcon(channel);
              return <Icon key={index} className="h-4 w-4 text-gray-500" />;
            })}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => onAction('view', campaign)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </button>
        <button 
          onClick={() => onAction('edit', campaign)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onAction('copy', campaign)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// All campaign orchestration components implemented in separate files and imported above

export default CampaignOrchestrationDashboard;
