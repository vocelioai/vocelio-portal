import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  User, 
  Mic, 
  Building,
  HelpCircle,
  CreditCard,
  Calendar,
  Cpu,
  Bell,
  Search,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
  badge?: string;
  status?: 'active' | 'warning' | 'error';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'profile',
    label: 'User Profile',
    icon: User,
    path: '/settings/profile',
    description: 'Personal information and security settings'
  },
  {
    id: 'voice',
    label: 'Voice Preferences',
    icon: Mic,
    path: '/settings/voice',
    description: 'AI voice settings and call configurations'
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Building,
    path: '/settings/organization',
    description: 'Team management and subscription settings'
  },
  {
    id: 'support',
    label: 'Support & Help',
    icon: HelpCircle,
    path: '/settings/support',
    description: 'Help center and support tickets'
  },
  {
    id: 'billing',
    label: 'Billing & Payments',
    icon: CreditCard,
    path: '/settings/billing',
    description: 'Subscription, usage, and payment management'
  },
  {
    id: 'calendar',
    label: 'Calendar Integration',
    icon: Calendar,
    path: '/settings/calendar',
    description: 'Connect Google Calendar, Outlook, and scheduling'
  },
  {
    id: 'api',
    label: 'API Management',
    icon: Cpu,
    path: '/settings/api',
    description: 'API keys, webhooks, and developer tools'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/settings/notifications',
    description: 'Email, SMS, and in-app notification preferences'
  }
];

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, loading, error } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(navigationItems);

  // Get current active item
  const activeItem = navigationItems.find(item => 
    location.pathname.startsWith(item.path)
  );

  // Filter navigation items based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(navigationItems);
      return;
    }

    const filtered = navigationItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery]);

  // Auto-navigate to first item if on settings root
  useEffect(() => {
    if (location.pathname === '/settings' || location.pathname === '/settings/') {
      navigate('/settings/profile', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Add badges and status based on settings data
  const getNavigationItemProps = (item: NavigationItem) => {
    if (!settings) return item;

    switch (item.id) {
      case 'profile':
        return {
          ...item,
          badge: !settings.userProfile.two_factor_enabled ? '!' : undefined,
          status: !settings.userProfile.two_factor_enabled ? 'warning' as const : 'active' as const
        };
      case 'billing':
        return {
          ...item,
          badge: settings.billing.subscription.status !== 'active' ? '!' : undefined,
          status: settings.billing.subscription.status !== 'active' ? 'error' as const : 'active' as const
        };
      case 'organization':
        return {
          ...item,
          badge: settings.organization.team_size >= settings.organization.max_team_size ? 'Full' : undefined
        };
      case 'support':
        const openTickets = settings.supportTickets.filter(t => t.status === 'open').length;
        return {
          ...item,
          badge: openTickets > 0 ? openTickets.toString() : undefined
        };
      case 'api':
        const expiredKeys = settings.apiKeys.filter(k => k.status === 'expired').length;
        return {
          ...item,
          badge: expiredKeys > 0 ? expiredKeys.toString() : undefined,
          status: expiredKeys > 0 ? 'warning' as const : 'active' as const
        };
      default:
        return item;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Settings Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your Vocelio account and preferences</p>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1">
            {filteredItems.map((item) => {
              const itemProps = getNavigationItemProps(item);
              const isActive = activeItem?.id === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="relative">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        {itemProps.status === 'error' && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                        )}
                        {itemProps.status === 'warning' && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {item.label}
                          </p>
                          {itemProps.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              itemProps.status === 'error' 
                                ? 'bg-red-100 text-red-800'
                                : itemProps.status === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {itemProps.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Info Footer */}
          {settings && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {settings.userProfile.first_name[0]}{settings.userProfile.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {settings.userProfile.first_name} {settings.userProfile.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {settings.userProfile.organization_name} • {settings.userProfile.subscription_tier}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto p-6">
            {/* Breadcrumb */}
            {activeItem && (
              <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <button
                      onClick={() => navigate('/settings')}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Settings
                    </button>
                  </li>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <li>
                    <span className="text-gray-900 text-sm font-medium">
                      {activeItem.label}
                    </span>
                  </li>
                </ol>
              </nav>
            )}

            {/* Page Content */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
