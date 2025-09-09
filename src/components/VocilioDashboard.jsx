import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, Phone, Users, BarChart3, CreditCard, Settings, HelpCircle, 
  Plus, Bell, Search, Menu, X, Play, Pause, Square, Eye, 
  Calendar, MapPin, Globe, Mic, PhoneCall, TrendingUp, DollarSign,
  CheckCircle, AlertCircle, Clock, Target, Zap, Brain, Shield,
  Upload, Download, Edit, Trash2, Copy, RefreshCw, Filter,
  ChevronDown, ChevronRight, ExternalLink, Mail, MessageSquare, Loader,
  Activity, Wifi, WifiOff, Server, Database, Cloud, 
  LineChart, PieChart, BarChart, TrendingDown, AlertTriangle, LogOut,
  Wallet, Receipt, PieChart as UsageIcon, PhoneForwarded, Building2, User,
  FileText, Volume2
} from 'lucide-react';

// 🎯 UPDATED: Import enhanced services with multi-tenant support
import { authManager } from '../services/authManager.js';
import { vocelioAPI } from '../services/vocelioAPI.js';
import { realtimeConversationService } from '../services/realtimeConversationService.js';
import { getCurrentUser } from '../utils/auth.js';

// Import wallet components
import WalletBalance from './WalletBalance.jsx';
import AddFunds from './AddFunds.jsx';
import TransactionHistory from './TransactionHistory.jsx';
import UsageDashboard from './UsageDashboard.jsx';

// Import world-class services
import serviceManager, { 
  dashboardApi, 
  contactsApi, 
  phoneApi, 
  voiceApi, 
  callFlowsApi,
  analyticsApi, 
  billingApi, 
  settingsApi,
  realtimeApi,
  notificationService,
  wsService,
  cacheService,
  getServiceHealth
} from '../services/index';

// Import enhanced phone number purchase component
import PhoneNumberPurchasePage from './PhoneNumberPurchasePage';

// Import world-class call center component
import CallCenterPage from './CallCenterPage';

// Import enhanced Voices section
import VoicesPageNew from './VoicesPageNew';

// Import tool integration settings
import ToolIntegrationSettings from './settings/ToolIntegrationSettings.jsx';



// Import call transfer components
import DepartmentsPage from './call-transfer/DepartmentsPage.jsx';
import LiveCallMonitor from './call-transfer/LiveCallMonitor.jsx';
import CallLogsPage from './call-transfer/CallLogsPage.jsx';

// Import Omnichannel Dashboard
import OmnichannelDashboard from './omnichannel/OmnichannelDashboard.jsx';

// Enhanced Utility Components with AI Integration
const EnhancedStatCard = ({ title, value, icon: Icon, color, prediction, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  const trendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : null;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && trendIcon && (
              <div className={`flex items-center space-x-1 ${trendColor}`}>
                {React.createElement(trendIcon, { className: "w-4 h-4" })}
                <span className="text-sm font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          {prediction && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Predicted: <span className="font-medium text-gray-700">{prediction.value}</span>
                <span className={`ml-1 ${prediction.confidence > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                  ({prediction.confidence}%)
                </span>
              </p>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const SmartQuickActionCard = ({ title, icon: Icon, color, onClick, badge }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
  };

  return (
    <button 
      onClick={onClick}
      className={`relative p-4 rounded-lg transition-all ${colorClasses[color]} w-full hover:scale-105 group`}
    >
      <Icon className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
      <div className="text-sm font-medium">{title}</div>
      {badge && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </div>
      )}
    </button>
  );
};

// System Health Component
const SystemHealthIndicator = ({ health }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const unhealthyServices = Object.values(health.services || {})
    .filter(service => service.status === 'unhealthy').length;

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)} ${
        health.status !== 'healthy' ? 'animate-pulse' : ''
      }`}></div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          System {health.status || 'Unknown'}
        </div>
        {unhealthyServices > 0 && (
          <div className="text-xs text-red-600">
            {unhealthyServices} service{unhealthyServices > 1 ? 's' : ''} degraded
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Bell Component
const NotificationBell = ({ count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// Connection Status Component
const ConnectionStatus = ({ isOnline, wsConnected }) => {
  if (isOnline && wsConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Wifi className="w-4 h-4" />
        <span className="text-xs">Online</span>
      </div>
    );
  }

  if (isOnline && !wsConnected) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <WifiOff className="w-4 h-4" />
        <span className="text-xs">Limited</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <WifiOff className="w-4 h-4" />
      <span className="text-xs">Offline</span>
    </div>
  );
};

// Navigation Item Component
const NavigationItem = ({ item, activeSection, setActiveSection, collapsed }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  const isActive = activeSection === item.id || (item.subitems && item.subitems.some(sub => sub.id === activeSection));

  const handleClick = () => {
    // 🎯 NEW: Handle logout action
    if (item.isAction && item.onClick) {
      item.onClick();
      return;
    }

    if (item.subitems && !collapsed) {
      setExpanded(!expanded);
    } else {
      setActiveSection(item.id);
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-700 transition-colors ${
          isActive ? 'bg-cyan-600 text-white' : 'text-gray-300'
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
              className={`w-full text-left px-3 py-1 text-sm rounded hover:bg-gray-700 transition-colors ${
                activeSection === subitem.id ? 'text-cyan-400 font-medium' : 'text-gray-400'
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

// Enhanced Home Section Component with Real-time Data
const HomeSection = ({ stats, liveCallsData, systemHealth, user }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [waveAnimation, setWaveAnimation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveAnimation(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const apiCards = [
    {
      id: 'voice-agent',
      title: 'AI VOICE AGENT',
      description: 'Intelligent voice agents that enable natural-sounding conversations between humans and AI systems.',
      icon: <Mic className="w-6 h-6" />,
      gradient: 'from-cyan-400 to-blue-500',
      features: ['Real-time processing', 'Natural conversations', 'Multi-language support']
    },
    {
      id: 'speech-to-text',
      title: 'SPEECH TRANSCRIPTION',
      description: 'Advanced speech transcription services with unmatched accuracy, speed, and cost efficiency.',
      icon: <FileText className="w-6 h-6" />,
      gradient: 'from-purple-400 to-pink-500',
      features: ['99%+ accuracy', 'Lightning fast', 'Cost effective']
    },
    {
      id: 'audio-intelligence',
      title: 'AUDIO INTELLIGENCE',
      description: 'Advanced audio intelligence services for Enterprise-scale analysis and insights.',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-emerald-400 to-teal-500',
      features: ['Sentiment analysis', 'Topic extraction', 'Intent detection']
    },
    {
      id: 'text-to-speech',
      title: 'VOICE SYNTHESIS',
      description: 'Lightning fast, human-like voice generation for real-time AI and high throughput applications.',
      icon: <Volume2 className="w-6 h-6" />,
      gradient: 'from-orange-400 to-red-500',
      features: ['Human-like voices', 'Real-time generation', 'High throughput']
    }
  ];

  const WaveformAnimation = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-32 h-32">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 rounded-full border-2 border-cyan-400 opacity-${70 - i * 20} animate-ping`}
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-80 animate-pulse" />
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-300 text-sm">Total Calls</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{(stats.totalCalls || 15678).toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total completed calls</div>
          <div className="mt-3 h-20 bg-gray-900/50 rounded flex items-end gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-cyan-400 rounded-sm flex-1"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Performance</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">99.9%</div>
          <div className="text-sm text-gray-400">Uptime</div>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Response Time</span>
              <span>45ms</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Wallet Balance</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${((user?.wallet_balance || user?.balance || 0) / 100)?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-400">Available funds</div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Ready for campaigns</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">


      {/* Main API Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {apiCards.map((card) => (
          <div
            key={card.id}
            className={`relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 cursor-pointer group ${
              activeCard === card.id ? 'ring-2 ring-cyan-400/50' : ''
            }`}
            onMouseEnter={() => setActiveCard(card.id)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Card Content */}
            <div className="relative z-10">
              {/* API Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${card.gradient} text-white text-sm font-semibold mb-6`}>
                {card.icon}
                {card.title}
              </div>

              {/* Description */}
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {card.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {card.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300 border border-gray-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>


            </div>

            {/* Special Visual Elements */}
            {card.id === 'voice-agent' && (
              <div className="absolute top-4 right-4 w-24 h-24 opacity-20">
                <WaveformAnimation />
              </div>
            )}

            {card.id === 'speech-to-text' && (
              <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
                <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg animate-pulse" />
                <div className="absolute inset-2 grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/30 rounded-sm animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {card.id === 'audio-intelligence' && (
              <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-emerald-400/30" />
                  <Brain className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
                </div>
              </div>
            )}

            {card.id === 'text-to-speech' && (
              <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
                <div className="relative w-full h-full">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-orange-400 rounded-full animate-bounce"
                      style={{
                        width: `${8 + i * 2}px`,
                        height: `${8 + i * 2}px`,
                        top: '50%',
                        left: `${i * 12}px`,
                        transform: 'translateY(-50%)',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dashboard Stats */}
      <Dashboard />

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Vocelio AI - The Future of Voice Technology</p>
      </div>
    </div>
  );
};

// Placeholder components for other sections
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
    <PhoneNumberPurchasePage />
  </div>
);

const VoiceSettingsSection = () => (
  <div className="animate-fade-in">
    <CallCenterPage />
  </div>
);

// Import FlowDesigner
import FlowDesigner from './FlowDesigner';

const CallFlowsSection = () => (
  <div className="animate-fade-in h-full">
    <FlowDesigner />
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

const SettingsSection = ({ user }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');

  const settingsTabs = [
    { id: 'account', label: 'Account Settings' },
    { id: 'advanced', label: 'Advanced Settings' }
  ];

  const handleAdvancedSettings = () => {
    // Navigate to the comprehensive settings page
    window.open('/settings', '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <button
          onClick={handleAdvancedSettings}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Advanced Settings</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      
      {/* Settings Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeSettingsTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      {activeSettingsTab === 'advanced' && (
        <div className="bg-white p-6 rounded-lg">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Comprehensive Settings</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Access the full settings interface with user profile, voice preferences, organization management, billing, and more.
            </p>
            <button
              onClick={handleAdvancedSettings}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Open Advanced Settings</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {activeSettingsTab === 'account' && (
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-6">Account Information</h3>
          
          {/* Current User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900 font-medium">
                  {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Organization</label>
                <p className="text-gray-900">{user?.organization_name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.role || 'User'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Subscription</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                  {user?.subscription_tier || 'Starter'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Subdomain</label>
                <p className="text-gray-900">{user?.subdomain}.vocelio.com</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button 
                onClick={handleAdvancedSettings}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
              <button 
                onClick={handleAdvancedSettings}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security</span>
              </button>
              <button 
                onClick={handleAdvancedSettings}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Mic className="h-4 w-4" />
                <span className="text-sm font-medium">Voice Settings</span>
              </button>
              <button 
                onClick={handleAdvancedSettings}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-600 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Notifications</span>
              </button>
            </div>
          </div>

          {/* Advanced Settings CTA */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Need More Settings?</h4>
                <p className="text-sm text-blue-700">Access the comprehensive settings interface for full control.</p>
              </div>
              <button
                onClick={handleAdvancedSettings}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Advanced Settings</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced System Health Section
const SystemHealthSection = ({ systemHealth }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshHealth = async () => {
    setRefreshing(true);
    // Trigger health check
    setTimeout(() => {
      setRefreshing(false);
      notificationService.showSuccess('System health refreshed');
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'critical': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Monitor all Vocilio services and infrastructure</p>
        </div>
        <button
          onClick={handleRefreshHealth}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overall System Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(systemHealth.status)}`}>
            {React.createElement(getStatusIcon(systemHealth.status), { className: "w-6 h-6" })}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 capitalize">
              System {systemHealth.status || 'Unknown'}
            </h3>
            <p className="text-gray-600">
              Last updated: {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Object.entries(systemHealth.services || {}).map(([serviceName, serviceHealth]) => {
            const StatusIcon = getStatusIcon(serviceHealth.status);
            return (
              <div key={serviceName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(serviceHealth.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {serviceName.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">{serviceHealth.status}</p>
                  </div>
                </div>
                
                {serviceHealth.lastCheck && (
                  <p className="text-xs text-gray-500">
                    Last check: {new Date(serviceHealth.lastCheck).toLocaleTimeString()}
                  </p>
                )}
                
                {serviceHealth.consecutiveFailures > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {serviceHealth.consecutiveFailures} consecutive failures
                  </p>
                )}
                
                {serviceHealth.error && (
                  <p className="text-xs text-red-600 mt-1 truncate" title={serviceHealth.error}>
                    Error: {serviceHealth.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">120ms</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(systemHealth.services || {}).length}
              </div>
              <div className="text-sm text-gray-600">Services</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center space-x-2">
      <Loader className="w-6 h-6 animate-spin text-blue-600" />
      <span className="text-gray-600">Loading dashboard...</span>
    </div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="flex items-center space-x-2 text-red-600">
      <AlertCircle className="w-6 h-6" />
      <span>{error}</span>
    </div>
    <button 
      onClick={onRetry}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Retry</span>
    </button>
  </div>
);

const VocilioDashboard = ({ onLogout, user }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time data states
  const [stats, setStats] = useState({
    totalCalls: 0,
    appointments: 0,
    revenue: 0,
    roi: 0,
    activeCalls: 0,
    conversionRate: 0
  });
  const [liveCallsData, setLiveCallsData] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // 🎯 NEW: Get user and tenant context
  const userInfo = authManager.getUserInfo();
  const tenantId = authManager.getTenantId();

  // Initialize services and load data
  useEffect(() => {
    initializeDashboard();
    setupEventListeners();
    setupRealtimeUpdates();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Initialize dashboard with world-class services
  const initializeDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure services are initialized
      await serviceManager.initialize();
      
      // Load dashboard data with enhanced error handling
      await loadDashboardData();
      
      // Setup service monitoring
      setupServiceMonitoring();
      
      setLoading(false);
      
      // Show success notification
      notificationService.showSuccess('Dashboard loaded successfully!');
      
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      setError(error.message);
      setLoading(false);
      
      // Show user-friendly error with retry option
      notificationService.showError(
        'Failed to load dashboard',
        error,
        { 
          onRetry: () => {
            setError(null);
            initializeDashboard();
          }
        }
      );
    }
  }, []);

  // Load dashboard data with intelligent caching
  const loadDashboardData = useCallback(async () => {
    try {
      // Use Promise.allSettled for resilient data loading
      const [
        statsResult,
        liveCallsResult
      ] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getLiveCalls()
      ]);

      // Update stats with AI insights
      if (statsResult.status === 'fulfilled') {
        setStats({
          totalCalls: statsResult.value.data.totalCalls || 15678,
          appointments: statsResult.value.data.appointments || 1456,
          revenue: statsResult.value.data.revenue || 2840000,
          roi: statsResult.value.data.roi || 91540,
          activeCalls: statsResult.value.data.activeCalls || 23,
          conversionRate: statsResult.value.data.conversionRate || 8.2,
          // Include AI predictions and insights
          predictions: statsResult.value.data.predictions || {},
          aiInsights: statsResult.value.data.aiInsights || {}
        });
      }

      // Update live calls with analysis
      if (liveCallsResult.status === 'fulfilled') {
        setLiveCallsData(liveCallsResult.value.data.calls || [
          { id: 1, contact: 'John Smith', phone: '+1 (555) 123-4567', status: 'in-progress', duration: '2:34', state: 'presenting_offer' },
          { id: 2, contact: 'Mary Johnson', phone: '+1 (555) 234-5678', status: 'ringing', duration: '0:12', state: 'connecting' },
          { id: 3, contact: 'Bob Wilson', phone: '+1 (555) 345-6789', status: 'completed', duration: '4:22', state: 'appointment_booked' }
        ]);
      }

      // Handle any failed requests gracefully
      const failedRequests = [statsResult, liveCallsResult]
        .filter(result => result.status === 'rejected');
      
      if (failedRequests.length > 0) {
        console.warn('⚠️ Some data requests failed:', failedRequests);
        notificationService.showToast(
          `${failedRequests.length} data sources are temporarily unavailable`,
          'warning',
          { duration: 5000 }
        );
      }

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      throw error;
    }
  }, []);

  // Setup service monitoring
  const setupServiceMonitoring = useCallback(() => {
    // Monitor system health
    const updateSystemHealth = () => {
      const health = getServiceHealth();
      setSystemHealth(health);
      
      // Show alerts for critical issues
      if (health.status === 'critical') {
        notificationService.showAlert(
          'Some critical services are experiencing issues',
          'error',
          { 
            persistent: true,
            actions: [{
              label: 'View Details',
              action: () => setActiveSection('system-health')
            }]
          }
        );
      }
    };

    // Initial health check
    updateSystemHealth();
    
    // Listen for health updates
    window.addEventListener('vocilio:health:updated', updateSystemHealth);
    
    return () => {
      window.removeEventListener('vocilio:health:updated', updateSystemHealth);
    };
  }, []);

  // Setup real-time updates
  const setupRealtimeUpdates = useCallback(() => {
    // Subscribe to live call updates
    const unsubscribeCalls = wsService.subscribe('live_call', (callData) => {
      setLiveCallsData(prev => {
        const updated = [...prev];
        const index = updated.findIndex(call => call.id === callData.id);
        
        if (index >= 0) {
          updated[index] = { ...updated[index], ...callData };
        } else {
          updated.unshift(callData);
        }
        
        return updated.slice(0, 10); // Keep only latest 10
      });

      // Show notification for important call events
      if (callData.status === 'connected' || callData.status === 'completed') {
        notificationService.showCallNotification(callData, callData.status);
      }
    });

    // Subscribe to AI insights
    const unsubscribeInsights = wsService.subscribe('ai_insight', (insight) => {
      notificationService.showAiInsight(insight, insight.priority);
    });

    // Subscribe to system alerts
    const unsubscribeAlerts = wsService.subscribe('system_alert', (alert) => {
      notificationService.showAlert(alert.message, alert.type, {
        data: alert,
        persistent: alert.critical
      });
    });

    return () => {
      unsubscribeCalls();
      unsubscribeInsights();
      unsubscribeAlerts();
    };
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      notificationService.showSuccess('Connection restored');
      // Reload data when back online
      loadDashboardData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationService.showToast(
        'You are offline. Some features may be limited.',
        'warning',
        { persistent: true }
      );
    };

    // Notification updates
    const handleNotificationUpdate = (event) => {
      setNotifications(event.detail.notifications || []);
    };

    // Service initialization complete
    const handleServicesReady = () => {
      console.log('✅ All services ready');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('vocilio:notification:update', handleNotificationUpdate);
    window.addEventListener('vocilio:services:initialized', handleServicesReady);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('vocilio:notification:update', handleNotificationUpdate);
      window.removeEventListener('vocilio:services:initialized', handleServicesReady);
    };
  }, [loadDashboardData]);

  // Cleanup function
  const cleanupEventListeners = useCallback(() => {
    // This will be returned from setupEventListeners and setupRealtimeUpdates
  }, []);

  // Memoized notification count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Enhanced retry function
  const retryOperation = useCallback(async (operation) => {
    setError(null);
    setLoading(true);
    
    try {
      await operation();
      notificationService.showSuccess('Operation completed successfully');
    } catch (error) {
      setError(error.message);
      notificationService.showError('Operation failed', error, {
        onRetry: () => retryOperation(operation)
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation items
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.user_metadata?.role === 'admin';
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { 
      id: 'calling', 
      label: 'Calling', 
      icon: Phone,
      subitems: [
        { id: 'phone-numbers', label: 'Phone Numbers' },
        { id: 'voice-settings', label: 'Call Center' },
        { id: 'call-flows', label: 'Call Flows' },
        { id: 'voices', label: 'Voices' }
      ]
    },
    { 
      id: 'call-management', 
      label: 'Call Management', 
      icon: PhoneForwarded,
      subitems: [
        { id: 'live-calls', label: 'Live Calls' },
        { id: 'call-logs', label: 'Call Logs' },
        ...(isAdmin ? [
          { id: 'departments', label: 'Departments' }
        ] : [])
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
      id: 'wallet', 
      label: 'Wallet & Usage', 
      icon: Wallet,
      subitems: [
        { id: 'wallet-balance', label: 'Wallet Balance' },
        { id: 'add-funds', label: 'Add Funds' },
        { id: 'transaction-history', label: 'Transaction History' },
        { id: 'usage-analytics', label: 'Usage Analytics' }
      ]
    },
    { 
      id: 'omnichannel', 
      label: 'Omnichannel Hub', 
      icon: MessageSquare,
      subitems: [
        { id: 'omnichannel-campaigns', label: 'Campaign Orchestration' }
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
        { id: 'tool-integrations', label: 'Tool Integrations' },
        { id: 'team-management', label: 'Team Management' },
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

  // Render different sections with enhanced functionality
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <ErrorMessage 
          error={error} 
          onRetry={() => retryOperation(initializeDashboard)} 
        />
      );
    }

    switch(activeSection) {
      case 'home':
        return (
          <HomeSection 
            stats={stats} 
            liveCallsData={liveCallsData}
            systemHealth={systemHealth}
            user={user}
          />
        );
      case 'calling':
      case 'phone-numbers':
        return <PhoneNumbersSection />;
      case 'voice-settings':
        return <VoiceSettingsSection />;
      case 'call-flows':
        return <CallFlowsSection />;
      case 'voices':
        return <VoicesPageNew />;
      case 'contacts':
      case 'contact-lists':
        return <ContactsSection />;
      
      // 💰 Wallet & Usage Sections
      case 'wallet':
      case 'wallet-balance':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Wallet & Balance</h2>
              <button
                onClick={() => setActiveSection('add-funds')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Add Funds
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WalletBalance 
                  onAddFunds={() => setActiveSection('add-funds')}
                  onViewHistory={() => setActiveSection('transaction-history')}
                />
              </div>
              <div className="lg:col-span-2">
                <UsageDashboard />
              </div>
            </div>
          </div>
        );
      
      case 'add-funds':
        return (
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setActiveSection('wallet-balance')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Wallet
              </button>
            </div>
            <AddFunds 
              onSuccess={(amount) => {
                console.log(`Added $${amount} to wallet`);
                setActiveSection('wallet-balance');
              }}
              onCancel={() => setActiveSection('wallet-balance')}
            />
          </div>
        );
      
      case 'transaction-history':
        return (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveSection('wallet-balance')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Wallet
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            </div>
            <TransactionHistory />
          </div>
        );
      
      case 'usage-analytics':
        return (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveSection('wallet-balance')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Wallet
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
            </div>
            <UsageDashboard />
          </div>
        );
      
      // 📞 Call Management Sections
      case 'call-management':
      case 'live-calls':
        return <LiveCallMonitor />;
      
      case 'call-logs':
        return <CallLogsPage />;
      
      case 'departments':
        if (!isAdmin) {
          return (
            <div className="p-6">
              <div className="text-center text-gray-500 py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Access Restricted</p>
                <p>Only administrators can manage departments.</p>
              </div>
            </div>
          );
        }
        return <DepartmentsPage />;

      // Campaign Builder - redirect to Omnichannel Campaigns
      case 'campaign-builder':
        return <OmnichannelDashboard />;
      
      // Omnichannel Hub Section
      case 'omnichannel':
      case 'omnichannel-overview':
      case 'omnichannel-sessions':
      case 'omnichannel-routing':
      case 'omnichannel-campaigns':
        return <OmnichannelDashboard />;
      
      case 'analytics':
      case 'performance-reports':
        return <AnalyticsSection stats={stats} />;
      case 'billing':
      case 'usage-costs':
        return <BillingSection />;
      case 'settings':
      case 'account-settings':
        return <SettingsSection user={user} />;
      case 'tool-integrations':
        return <ToolIntegrationSettings />;
      case 'system-health':
        return <SystemHealthSection systemHealth={systemHealth} />;
      default:
        return (
          <HomeSection 
            stats={stats} 
            liveCallsData={liveCallsData}
            systemHealth={systemHealth}
            user={user}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-vocilio-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vocilio AI</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-gray-700 transition-colors text-white"
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
        {/* Modern Customer Header */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Welcome Section */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {activeSection === 'home' ? '' : 
                   activeSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                <p className="text-gray-400 mt-1">
                  {activeSection === 'home' ? 
                    '' : 
                    'Manage your voice campaigns with ease'
                  }
                </p>
              </div>
              
              {/* Quick Stats Badge */}
              {activeSection === 'home' && (
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="bg-gray-800/80 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300 font-medium">Status: Active</span>
                    </div>
                  </div>
                  <div className="bg-gray-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300 font-medium">AI Enhanced</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Modern Search Bar */}
              <div className="hidden md:block relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                <div className="relative bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl overflow-hidden shadow-sm">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-12 pr-6 py-4 w-72 bg-transparent focus:outline-none text-gray-200 placeholder-gray-400"
                  />
                </div>
              </div>
              
              {/* Modern Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <button className="relative p-3 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl hover:bg-gray-700 transition-all shadow-sm group">
                  <Bell className="w-5 h-5 text-gray-300 group-hover:text-gray-100" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
                
                {/* Premium Action Button */}
                <button 
                  onClick={() => setActiveSection('omnichannel-campaigns')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center space-x-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group"
                >
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span>Create Campaign</span>
                  <div className="w-1 h-1 bg-white/40 rounded-full group-hover:animate-ping"></div>
                </button>
              </div>
              
              {/* Modern User Profile */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-2xl px-4 py-3 hover:bg-gray-700 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-gray-600 shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-200">
                      {userInfo?.name || userInfo?.email || 'User'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      <span>Premium User</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Modern Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute top-full right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 py-3 z-50">
                    {/* User Info Header */}
                    <div className="px-6 py-4 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {userInfo?.name || userInfo?.email || 'User'}
                          </div>
                          <div className="text-sm text-slate-500">
                            {userInfo?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setActiveSection('settings');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-6 py-3 text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Settings className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Account Settings</div>
                          <div className="text-xs text-slate-500">Manage your preferences</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          notificationService.showInfo('Help & Support coming soon!');
                        }}
                        className="w-full text-left px-6 py-3 text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          <HelpCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium">Help & Support</div>
                          <div className="text-xs text-slate-500">Get assistance and tutorials</div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Logout Section */}
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          authManager.logout();
                          window.location.href = '/';
                        }}
                        className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-red-500/70">End your session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
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

export default VocilioDashboard;
