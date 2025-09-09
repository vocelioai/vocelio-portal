import React, { useState, useCallback, useEffect } from 'react';
import { 
  Phone, Video, MessageSquare, Mail, MessageCircle, 
  Smartphone, Globe, Users, X, Plus, Maximize2, 
  Minimize2, Settings, Grid, List, Filter, Search
} from 'lucide-react';
import VoiceChannelPanel from './VoiceChannelPanel';
import VideoChannelPanel from './VideoChannelPanel';
import ChatChannelPanel from './ChatChannelPanel';
import EmailChannelPanel from './EmailChannelPanel';
import SMSChannelPanel from './SMSChannelPanel';
import WhatsAppChannelPanel from './WhatsAppChannelPanel';

// ===== COPILOT PROMPT #3: Omnichannel Manager =====
const OmnichannelChannelManager = ({ isExpanded = false, onToggleExpand }) => {
  const [activeChannels, setActiveChannels] = useState(['voice']); // Start with voice active
  const [panelLayout, setPanelLayout] = useState('grid'); // grid, tabs, sidebar
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for development
  const channels = [];
  const channelStats = {
    active: 8,
    total: 8
  };
  const getActiveChannels = () => channels.filter(c => c.active);

  const sessions = [];
  const sessionStats = {
    active: 24,
    pending: 8
  };

  // Available channel types with their configurations
  const channelTypes = [
    {
      id: 'voice',
      name: 'Voice',
      icon: Phone,
      color: 'green',
      component: VoiceChannelPanel,
      description: 'Phone calls and voice interactions'
    },
    {
      id: 'video',
      name: 'Video',
      icon: Video,
      color: 'purple',
      component: VideoChannelPanel,
      description: 'Video calls and conferences'
    },
    {
      id: 'chat',
      name: 'Live Chat',
      icon: MessageSquare,
      color: 'blue',
      component: ChatChannelPanel,
      description: 'Web chat and messaging'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'red',
      component: EmailChannelPanel,
      description: 'Email correspondence'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageCircle,
      color: 'yellow',
      component: SMSChannelPanel,
      description: 'Text messaging'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      component: WhatsAppChannelPanel,
      description: 'WhatsApp Business messaging'
    },
    {
      id: 'mobile_app',
      name: 'Mobile App',
      icon: Smartphone,
      color: 'indigo',
      component: null,
      description: 'Mobile app interactions'
    },
    {
      id: 'web_portal',
      name: 'Web Portal',
      icon: Globe,
      color: 'gray',
      component: null,
      description: 'Web portal support'
    }
  ];

  // Get color classes for channels
  const getChannelColors = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    };
    return colors[color] || colors.gray;
  };

  // Handle channel activation/deactivation
  const toggleChannel = useCallback((channelId) => {
    setActiveChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
    console.log('🔄 Channel toggled:', channelId);
  }, []);

  // Close specific channel
  const closeChannel = useCallback((channelId) => {
    setActiveChannels(prev => prev.filter(id => id !== channelId));
    console.log('❌ Channel closed:', channelId);
  }, []);

  // Get session count for a channel
  const getChannelSessionCount = useCallback((channelId) => {
    const channelSessions = sessions.filter(session => session.channel === channelId);
    return channelSessions.length;
  }, [sessions]);

  // Filter channels based on search and filter
  const filteredChannels = channelTypes.filter(channel => {
    if (filterBy !== 'all' && filterBy !== 'active') return true;
    if (filterBy === 'active' && !activeChannels.includes(channel.id)) return false;
    if (searchTerm) {
      return channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${
      isExpanded ? 'fixed inset-4 z-40' : 'h-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Omnichannel Manager</h2>
              <p className="text-sm text-gray-600">
                {activeChannels.length} active channel{activeChannels.length !== 1 ? 's' : ''} • 
                {sessionStats.active || 0} live session{sessionStats.active !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            {Object.entries(channelStats.byChannel || {}).slice(0, 3).map(([channel, stats]) => (
              <div key={channel} className="text-center">
                <p className="text-lg font-bold text-gray-900">{stats.active || 0}</p>
                <p className="text-xs text-gray-600 capitalize">{channel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Channels</option>
            <option value="active">Active Only</option>
            <option value="available">Available</option>
          </select>

          {/* Layout Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setPanelLayout('grid')}
              className={`p-2 ${panelLayout === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPanelLayout('tabs')}
              className={`p-2 border-l border-gray-300 ${panelLayout === 'tabs' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Expand Toggle */}
          <button
            onClick={onToggleExpand}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Available Channels</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4 inline mr-1" />
            Add Channel
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {filteredChannels.map((channel) => {
            const Icon = channel.icon;
            const isActive = activeChannels.includes(channel.id);
            const sessionCount = getChannelSessionCount(channel.id);
            
            return (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  isActive 
                    ? `${getChannelColors(channel.color)} border-current` 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{channel.name}</span>
                  {sessionCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {sessionCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Channel Panels */}
      <div className="flex-1 overflow-hidden">
        {activeChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Channels</h3>
              <p className="text-sm">Select a channel above to start managing communications</p>
            </div>
          </div>
        ) : (
          <div className={`h-full p-4 ${
            panelLayout === 'grid' 
              ? `grid gap-4 ${
                  activeChannels.length === 1 ? 'grid-cols-1' :
                  activeChannels.length === 2 ? 'grid-cols-2' :
                  activeChannels.length <= 4 ? 'grid-cols-2 grid-rows-2' :
                  'grid-cols-3'
                }`
              : panelLayout === 'tabs' 
                ? 'flex flex-col' 
                : 'flex'
          }`}>
            
            {panelLayout === 'tabs' ? (
              <>
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 mb-4">
                  {activeChannels.map((channelId) => {
                    const channel = channelTypes.find(c => c.id === channelId);
                    if (!channel) return null;
                    
                    const Icon = channel.icon;
                    return (
                      <button
                        key={channelId}
                        className="flex items-center space-x-2 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{channel.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeChannel(channelId);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content */}
                <div className="flex-1">
                  {activeChannels.map((channelId) => {
                    const channel = channelTypes.find(c => c.id === channelId);
                    if (!channel?.component) return null;
                    
                    const Component = channel.component;
                    return (
                      <Component
                        key={channelId}
                        isActive={true}
                        onClose={() => closeChannel(channelId)}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              // Grid Layout
              activeChannels.map((channelId) => {
                const channel = channelTypes.find(c => c.id === channelId);
                if (!channel?.component) {
                  return (
                    <div key={channelId} className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <channel.icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm">Coming Soon</p>
                      </div>
                    </div>
                  );
                }
                
                const Component = channel.component;
                return (
                  <div key={channelId} className="relative">
                    <Component
                      isActive={true}
                      onClose={() => closeChannel(channelId)}
                    />
                    {/* Close button for grid layout */}
                    <button
                      onClick={() => closeChannel(channelId)}
                      className="absolute top-2 right-2 p-1 bg-white bg-opacity-90 text-gray-400 hover:text-red-600 rounded-full shadow-sm z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span>Total Sessions: <span className="font-medium">{sessionStats.total || 0}</span></span>
            <span>Active: <span className="font-medium text-green-600">{sessionStats.active || 0}</span></span>
            <span>Waiting: <span className="font-medium text-yellow-600">{sessionStats.waiting || 0}</span></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmnichannelChannelManager;
