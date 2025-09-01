// Additional Dashboard Components

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
          isActive ? 'bg-vocilio-blue-100 text-vocilio-blue-700' : 'text-gray-700'
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
                activeSection === subitem.id ? 'text-vocilio-blue-600 font-medium' : 'text-gray-600'
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
    <div className="space-y-6 animate-fade-in">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            <button className="text-vocilio-blue-600 hover:text-vocilio-blue-700 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-vocilio-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Call Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{stats.activeCalls} active calls</span>
            </div>
          </div>
          <div className="space-y-3">
            {liveCallsData.slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-slide-up">
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

// Placeholder components for other sections (will be enhanced)
const CampaignsSection = ({ activeCampaigns, onRefresh }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Campaign Management</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Campaigns section - Enhanced with real-time data</p>
      <button onClick={onRefresh} className="mt-4 bg-vocilio-blue-600 text-white px-4 py-2 rounded">
        Refresh Data
      </button>
    </div>
  </div>
);

const LiveMonitorSection = ({ liveCallsData, stats }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Live Monitor</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Live monitoring with {stats.activeCalls} active calls</p>
    </div>
  </div>
);

const PhoneNumbersSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Phone Numbers</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Phone number management</p>
    </div>
  </div>
);

const VoiceSettingsSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Voice Settings</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Voice configuration and testing</p>
    </div>
  </div>
);

const CallFlowsSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Call Flows</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Call flow builder and management</p>
    </div>
  </div>
);

const ContactsSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Contacts</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Contact list management</p>
    </div>
  </div>
);

const AnalyticsSection = ({ stats }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Analytics</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Analytics and reporting with ROI: {stats.roi}%</p>
    </div>
  </div>
);

const BillingSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Billing</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Usage and billing information</p>
    </div>
  </div>
);

const SettingsSection = () => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">Settings</h2>
    <div className="bg-white p-6 rounded-lg">
      <p>Account and system settings</p>
    </div>
  </div>
);

// Utility Components
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-vocilio-blue-100 text-vocilio-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all">
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
    blue: 'bg-vocilio-blue-100 text-vocilio-blue-600 hover:bg-vocilio-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
  };

  return (
    <button className={`p-4 rounded-lg transition-all ${colorClasses[color]} w-full hover:scale-105`}>
      <Icon className="w-8 h-8 mx-auto mb-2" />
      <div className="text-sm font-medium">{title}</div>
    </button>
  );
};

export default VocilioDashboard;
