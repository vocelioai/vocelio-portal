import React, { useState, useEffect } from 'react';
import { 
  Home, Phone, Users, BarChart3, CreditCard, Settings, HelpCircle, 
  Plus, Bell, Search, Menu, X, Play, Pause, Square, Eye, 
  Calendar, MapPin, Globe, Mic, PhoneCall, TrendingUp, DollarSign,
  CheckCircle, AlertCircle, Clock, Target, Zap, Brain, Shield,
  Upload, Download, Edit, Trash2, Copy, RefreshCw, Filter,
  ChevronDown, ChevronRight, ExternalLink, Mail, MessageSquare
} from 'lucide-react';

const VocilioDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCampaigns] = useState([
    { id: 1, name: 'Real Estate Q4 Push', status: 'active', progress: 65, calls: 1247, connected: 874, appointments: 89 },
    { id: 2, name: 'Follow-up Campaign', status: 'active', progress: 23, calls: 456, connected: 321, appointments: 34 }
  ]);

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: BarChart3,
      subitems: [
        { id: 'active-campaigns', label: 'Active Campaigns' },
        { id: 'campaign-builder', label: 'Campaign Builder' },
        { id: 'live-monitor', label: 'Live Monitor' },
        { id: 'performance-reports', label: 'Performance Reports' }
      ]
    },
    { 
      id: 'calling', 
      label: 'Calling', 
      icon: Phone,
      subitems: [
        { id: 'phone-numbers', label: 'Phone Numbers' },
        { id: 'voice-settings', label: 'Voice Settings' },
        { id: 'call-flows', label: 'Call Flows' },
        { id: 'test-calls', label: 'Test Calls' }
      ]
    },
    { 
      id: 'contacts', 
      label: 'Contacts', 
      icon: Users,
      subitems: [
        { id: 'contact-lists', label: 'Contact Lists' },
        { id: 'upload-import', label: 'Upload/Import' },
        { id: 'crm-sync', label: 'CRM Sync' },
        { id: 'dnc-management', label: 'DNC Management' }
      ]
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      subitems: [
        { id: 'performance-reports', label: 'Performance Reports' },
        { id: 'roi-analysis', label: 'ROI Analysis' },
        { id: 'ai-insights', label: 'AI Insights' },
        { id: 'custom-reports', label: 'Custom Reports' }
      ]
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: CreditCard,
      subitems: [
        { id: 'usage-costs', label: 'Usage & Costs' },
        { id: 'payment-methods', label: 'Payment Methods' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'budget-alerts', label: 'Budget Alerts' }
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      subitems: [
        { id: 'account-settings', label: 'Account Settings' },
        { id: 'team-management', label: 'Team Management' },
        { id: 'integrations', label: 'Integrations' },
        { id: 'compliance', label: 'Compliance' },
        { id: 'api-keys', label: 'API Keys' }
      ]
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: HelpCircle,
      subitems: [
        { id: 'help-center', label: 'Help Center' },
        { id: 'live-chat', label: 'Live Chat' },
        { id: 'documentation', label: 'Documentation' },
        { id: 'system-status', label: 'System Status' }
      ]
    }
  ];

  // Mock data
  const stats = {
    totalCalls: 15678,
    appointments: 1456,
    revenue: 2840000,
    roi: 91540,
    activeCalls: 23,
    conversionRate: 8.2
  };

  const liveCallsData = [
    { id: 1, contact: 'John Smith', phone: '+1 (555) 123-4567', status: 'in-progress', duration: '2:34', state: 'presenting_offer' },
    { id: 2, contact: 'Mary Johnson', phone: '+1 (555) 234-5678', status: 'ringing', duration: '0:12', state: 'connecting' },
    { id: 3, contact: 'Bob Wilson', phone: '+1 (555) 345-6789', status: 'completed', duration: '4:22', state: 'appointment_booked' }
  ];

  // Render different sections
  const renderContent = () => {
    switch(activeSection) {
      case 'home':
        return <HomeSection stats={stats} activeCampaigns={activeCampaigns} liveCallsData={liveCallsData} />;
      case 'campaigns':
      case 'active-campaigns':
        return <CampaignsSection activeCampaigns={activeCampaigns} />;
      case 'live-monitor':
        return <LiveMonitorSection liveCallsData={liveCallsData} stats={stats} />;
      case 'calling':
      case 'phone-numbers':
        return <PhoneNumbersSection />;
      case 'voice-settings':
        return <VoiceSettingsSection />;
      case 'call-flows':
        return <CallFlowsSection />;
      case 'contacts':
      case 'contact-lists':
        return <ContactsSection />;
      case 'analytics':
      case 'performance-reports':
        return <AnalyticsSection stats={stats} />;
      case 'billing':
      case 'usage-costs':
        return <BillingSection />;
      case 'settings':
      case 'account-settings':
        return <SettingsSection />;
      default:
        return <HomeSection stats={stats} activeCampaigns={activeCampaigns} liveCallsData={liveCallsData} />;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Vocilio AI</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-gray-200"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="mt-4 px-2">
          {navItems.map((item) => (
            <NavigationItem 
              key={item.id} 
              item={item} 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection.replace('-', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns, contacts, calls..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
              
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium">John Doe</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavigationItem = ({ item, activeSection, setActiveSection, collapsed }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  const isActive = activeSection === item.id || (item.subitems && item.subitems.some(sub => sub.id === activeSection));

  return (
    <div className="mb-1">
      <button
        onClick={() => {
          if (item.subitems && !collapsed) {
            setExpanded(!expanded);
          } else {
            setActiveSection(item.id);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-200 transition-colors ${
          isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
        </div>
        {item.subitems && !collapsed && (
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        )}
      </button>
      
      {item.subitems && expanded && !collapsed && (
        <div className="ml-8 mt-1 space-y-1">
          {item.subitems.map((subitem) => (
            <button
              key={subitem.id}
              onClick={() => setActiveSection(subitem.id)}
              className={`w-full text-left px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
                activeSection === subitem.id ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {subitem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Home Section Component
const HomeSection = ({ stats, activeCampaigns, liveCallsData }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Calls" value={stats.totalCalls.toLocaleString()} icon={PhoneCall} color="blue" />
        <StatCard title="Appointments" value={stats.appointments.toLocaleString()} icon={Calendar} color="green" />
        <StatCard title="Revenue Generated" value={`$${(stats.revenue / 1000000).toFixed(1)}M`} icon={DollarSign} color="purple" />
        <StatCard title="ROI" value={`${stats.roi.toLocaleString()}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* Active Campaigns & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{campaign.calls} calls</span>
                  <span>{campaign.appointments} appointments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Call Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Call Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{stats.activeCalls} active calls</span>
            </div>
          </div>
          <div className="space-y-3">
            {liveCallsData.slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{call.contact}</div>
                  <div className="text-sm text-gray-500">{call.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{call.duration}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    call.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    call.status === 'ringing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {call.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionCard title="Start New Campaign" icon={Plus} color="blue" />
          <QuickActionCard title="Upload Contacts" icon={Upload} color="green" />
          <QuickActionCard title="Test Voice Quality" icon={Mic} color="purple" />
          <QuickActionCard title="View Analytics" icon={BarChart3} color="orange" />
        </div>
      </div>
    </div>
  );
};

// Campaigns Section
const CampaignsSection = ({ activeCampaigns }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
              <div className="flex space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-gray-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{campaign.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.calls}</div>
                  <div className="text-xs text-gray-500">Total Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.connected}</div>
                  <div className="text-xs text-gray-500">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.appointments}</div>
                  <div className="text-xs text-gray-500">Appointments</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center justify-center space-x-1">
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </button>
              <button className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 flex items-center justify-center space-x-1">
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Live Monitor Section
const LiveMonitorSection = ({ liveCallsData, stats }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Campaign Monitor</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">Live Updates</span>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Calls</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeCalls}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Queue Depth</p>
              <p className="text-2xl font-bold text-orange-600">47</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cost/Hour</p>
              <p className="text-2xl font-bold text-purple-600">$45.20</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Calls Feed */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Calls Feed</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {liveCallsData.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    call.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                    call.status === 'ringing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{call.contact}</div>
                    <div className="text-sm text-gray-500">{call.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{call.duration}</div>
                    <div className="text-xs text-gray-500 capitalize">{call.state.replace('_', ' ')}</div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Phone Numbers Section
const PhoneNumbersSection = () => {
  const phoneNumbers = [
    { id: 1, number: '+1 (415) 555-0123', location: 'San Francisco, CA', type: 'Local', cost: '$1.15', status: 'Active' },
    { id: 2, number: '+1 (800) 555-0124', location: 'Toll-free', type: 'Toll-free', cost: '$2.00', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Phone Numbers</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Buy New Number</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {phoneNumbers.map((number) => (
              <div key={number.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Phone className="w-8 h-8 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{number.number}</div>
                    <div className="text-sm text-gray-500">{number.location} • {number.type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{number.cost}/month</div>
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      number.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {number.status}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Voice Settings Section
const VoiceSettingsSection = () => {
  const voices = [
    { id: 1, name: 'Sarah', tier: 'Regular', gender: 'Female', accent: 'American', cost: '$0.08/min' },
    { id: 2, name: 'Michael', tier: 'Regular', gender: 'Male', accent: 'American', cost: '$0.08/min' },
    { id: 3, name: 'Aria', tier: 'Premium', gender: 'Female', accent: 'American', cost: '$0.35/min' },
    { id: 4, name: 'David', tier: 'Premium', gender: 'Male', accent: 'British', cost: '$0.35/min' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Voice Settings</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Test All Voices
        </button>
      </div>

      {/* Voice Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regular Tier Voices</h3>
          <p className="text-sm text-gray-600 mb-6">Professional quality voices powered by Azure & Cartesia</p>
          <div className="space-y-4">
            {voices.filter(v => v.tier === 'Regular').map((voice) => (
              <div key={voice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Mic className="w-8 h-8 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{voice.name}</div>
                    <div className="text-sm text-gray-500">{voice.gender} • {voice.accent}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{voice.cost}</span>
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 flex items-center space-x-1">
                    <Play className="w-3 h-3" />
                    <span>Play</span>
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Tier Voices</h3>
          <p className="text-sm text-gray-600 mb-6">Ultra-realistic voices powered by ElevenLabs</p>
          <div className="space-y-4">
            {voices.filter(v => v.tier === 'Premium').map((voice) => (
              <div key={voice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{voice.name}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Premium</span>
                    </div>
                    <div className="text-sm text-gray-500">{voice.gender} • {voice.accent}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{voice.cost}</span>
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm hover:bg-purple-200 flex items-center space-x-1">
                    <Play className="w-3 h-3" />
                    <span>Play</span>
                  </button>
                  <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Customization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Speaking Rate</label>
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pitch</label>
            <input type="range" min="-20" max="20" step="1" defaultValue="0" className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Call Flows Section
const CallFlowsSection = () => {
  const flows = [
    { id: 1, name: 'Real Estate Cold Outreach', status: 'Active', lastModified: '2 hours ago', conversions: '8.5%' },
    { id: 2, name: 'Follow-up Sequence', status: 'Draft', lastModified: '1 day ago', conversions: '12.3%' },
    { id: 3, name: 'Customer Support Flow', status: 'Active', lastModified: '3 days ago', conversions: '15.7%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Call Flows</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Flow</span>
        </button>
      </div>

      {/* Flow Builder Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Flow Designer</h3>
        <div className="bg-gray-50 p-8 rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-16 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PhoneCall className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-medium text-blue-600">Call Starts</div>
              </div>
            </div>
            <div className="w-1 h-8 bg-gray-300"></div>
            <div className="w-32 h-16 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Mic className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium text-green-600">Opening Script</div>
              </div>
            </div>
            <div className="w-1 h-8 bg-gray-300"></div>
            <div className="w-32 h-16 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <div className="text-xs font-medium text-yellow-600">Listen Response</div>
              </div>
            </div>
            <div className="flex space-x-8">
              <div className="w-24 h-12 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center">
                <div className="text-xs font-medium text-purple-600">Book Meeting</div>
              </div>
              <div className="w-24 h-12 bg-orange-100 border-2 border-orange-300 rounded-lg flex items-center justify-center">
                <div className="text-xs font-medium text-orange-600">Handle Objection</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Open Flow Designer
          </button>
        </div>
      </div>

      {/* Flow List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Call Flows</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {flows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{flow.name}</div>
                    <div className="text-sm text-gray-500">Last modified: {flow.lastModified}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{flow.conversions}</div>
                    <div className="text-xs text-gray-500">Conversion Rate</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    flow.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {flow.status}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Contacts Section
const ContactsSection = () => {
  const contactLists = [
    { id: 1, name: 'Real Estate Leads', contacts: 1247, lastUpdated: '2 hours ago', status: 'Active' },
    { id: 2, name: 'Follow-up Calls', contacts: 89, lastUpdated: '1 day ago', status: 'Active' },
    { id: 3, name: 'Customer Support Queue', contacts: 23, lastUpdated: '30 minutes ago', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contact Management</h2>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Contacts</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New List</span>
          </button>
        </div>
      </div>

      {/* Upload Interface */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900">CSV Upload</div>
            <div className="text-sm text-gray-500">Drop your CSV file here</div>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 cursor-pointer">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900">CRM Integration</div>
            <div className="text-sm text-gray-500">Sync with Salesforce, HubSpot</div>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 cursor-pointer">
            <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Manual Entry</div>
            <div className="text-sm text-gray-500">Add contacts one by one</div>
          </div>
        </div>
      </div>

      {/* Contact Lists */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Contact Lists</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {contactLists.map((list) => (
              <div key={list.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{list.name}</div>
                    <div className="text-sm text-gray-500">{list.contacts.toLocaleString()} contacts • Updated {list.lastUpdated}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    list.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {list.status}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Section
const AnalyticsSection = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${(stats.revenue / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.2% from last week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cost per Lead</p>
              <p className="text-2xl font-bold text-purple-600">$3.24</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                -$0.45 from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ROI</p>
              <p className="text-2xl font-bold text-orange-600">{stats.roi.toLocaleString()}%</p>
              <p className="text-xs text-orange-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Exceptional performance
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Interactive chart would go here</p>
              <p className="text-sm">Showing conversion rates over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Outcomes</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2" />
              <p>Pie chart would go here</p>
              <p className="text-sm">Breakdown of call results</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          AI Insights & Recommendations
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Peak Performance Time Identified</h4>
                <p className="text-sm text-gray-600 mt-1">Calls made between 2-3 PM show 15% higher conversion rates. Consider scheduling more campaigns during this window.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Script Optimization Suggestion</h4>
                <p className="text-sm text-gray-600 mt-1">Adding urgency keywords like "limited time" increased appointment booking by 12% in similar campaigns.</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Voice Tier Recommendation</h4>
                <p className="text-sm text-gray-600 mt-1">For high-value prospects ($5,000+ deals), premium tier voices show 8% better conversion rates despite higher cost.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Billing Section
const BillingSection = () => {
  const currentUsage = {
    calls: 15678,
    minutes: 45234,
    regularCost: 3618.72,
    premiumCost: 890.45,
    numberFees: 23.00,
    total: 4532.17,
    budget: 6000
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Usage</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          View All Invoices
        </button>
      </div>

      {/* Current Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Month Usage</h3>
          <div className="text-sm text-gray-600">
            Budget: ${currentUsage.budget.toLocaleString()}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Used: ${currentUsage.total.toLocaleString()}</span>
            <span>{((currentUsage.total / currentUsage.budget) * 100).toFixed(1)}% of budget</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full" 
              style={{ width: `${(currentUsage.total / currentUsage.budget) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900">{currentUsage.calls.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Calls</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{currentUsage.minutes.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">${currentUsage.regularCost.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Regular Tier</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">${currentUsage.premiumCost.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Premium Tier</div>
          </div>
        </div>
      </div>

      {/* Billing Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Regular Tier Calls</div>
                    <div className="text-sm text-gray-500">38,456 minutes @ $0.08/min</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">${currentUsage.regularCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Premium Tier Calls</div>
                    <div className="text-sm text-gray-500">2,544 minutes @ $0.35/min</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">${currentUsage.premiumCost.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Number Fees</div>
                    <div className="text-sm text-gray-500">2 numbers × $1.15/month + 1 toll-free × $2.00</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">${currentUsage.numberFees.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">•••• 4242</div>
                    <div className="text-sm text-gray-500">Expires 12/25</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Primary</span>
              </div>
              <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-blue-400 hover:text-blue-600">
                + Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Section
const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input type="text" defaultValue="Acme Real Estate" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" defaultValue="john@acmerealty.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Pacific Time (PST)</option>
              <option>Eastern Time (EST)</option>
              <option>Central Time (CST)</option>
              <option>Mountain Time (MST)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>

      {/* Team Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">John Doe</div>
                <div className="text-sm text-gray-500">john@acmerealty.com</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-600" />
          Compliance Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Respect Do Not Call Lists</div>
              <div className="text-sm text-gray-500">Automatically skip numbers on DNC lists</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Call Recording Consent</div>
              <div className="text-sm text-gray-500">Ask for consent before recording calls</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Calling Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input type="time" defaultValue="09:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input type="time" defaultValue="17:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Production API Key</div>
              <div className="text-sm text-gray-500 font-mono">voc_live_••••••••••••••••••••••••••••••••</div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-blue-400 hover:text-blue-600">
            + Generate New API Key
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
  };

  return (
    <button className={`p-4 rounded-lg transition-colors ${colorClasses[color]} w-full`}>
      <Icon className="w-8 h-8 mx-auto mb-2" />
      <div className="text-sm font-medium">{title}</div>
    </button>
  );
};

export default VocilioDashboard;