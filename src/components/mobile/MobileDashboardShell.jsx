import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu, X, Search, Bell, User, Settings, Home, BarChart3,
  Users, MessageSquare, Phone, Video, Mail, Smartphone,
  ChevronDown, ChevronUp, RefreshCw, Wifi, WifiOff, Download
} from 'lucide-react';

// ===== COPILOT PROMPT #7: Mobile-Responsive PWA Components =====
// Mobile Dashboard Shell with PWA functionality

const MobileDashboardShell = ({ children, currentUser, notifications = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChannel, setActiveChannel] = useState('all');

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker registration and updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Show update available notification
                showUpdateAvailable();
              }
            });
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      isPulling = window.scrollY === 0;
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      pullDistance = Math.max(0, e.touches[0].clientY - startY);
      
      if (pullDistance > 100) {
        e.preventDefault();
        // Visual feedback for pull-to-refresh
        document.body.style.paddingTop = `${Math.min(pullDistance - 100, 50)}px`;
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > 100) {
        handleRefresh();
      }
      
      // Reset visual feedback
      document.body.style.paddingTop = '0px';
      isPulling = false;
      pullDistance = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      setInstallPrompt(null);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger data refresh
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'REFRESH_DATA'
        });
      }
      
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const showUpdateAvailable = () => {
    // Show notification that app update is available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is ready to install.',
        icon: '/icon-192x192.png',
        tag: 'app-update'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Vocelio" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-gray-900">Vocelio</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Online/Offline Indicator */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Install App Button */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="p-2 rounded-md hover:bg-gray-100 text-blue-600"
              >
                <Download className="h-5 w-5" />
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            <button className="p-2 rounded-md hover:bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Channel Switcher */}
        <MobileChannelSwitcher 
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <MobileMenuOverlay 
          onClose={() => setIsMobileMenuOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* Notification Drawer */}
      {isNotificationDrawerOpen && (
        <MobileNotificationDrawer
          notifications={notifications}
          onClose={() => setIsNotificationDrawerOpen(false)}
        />
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-5 w-5" />
            <div>
              <p className="font-medium">You're offline</p>
              <p className="text-sm">Some features may be limited</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Channel Switcher Component
const MobileChannelSwitcher = ({ activeChannel, onChannelChange }) => {
  const channels = [
    { id: 'all', name: 'All', icon: Home, count: 24 },
    { id: 'voice', name: 'Voice', icon: Phone, count: 8 },
    { id: 'video', name: 'Video', icon: Video, count: 3 },
    { id: 'chat', name: 'Chat', icon: MessageSquare, count: 12 },
    { id: 'email', name: 'Email', icon: Mail, count: 156 },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, count: 22 }
  ];

  return (
    <div className="px-4 pb-2">
      <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeChannel === channel.id;
          
          return (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-600 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{channel.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {channel.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mobile Bottom Navigation Component
const MobileBottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'sessions', name: 'Sessions', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Mobile Menu Overlay Component
const MobileMenuOverlay = ({ onClose, currentUser }) => {
  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Sessions', icon: Users, href: '/dashboard/sessions' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Campaigns', icon: MessageSquare, href: '/dashboard/campaigns' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <img className="h-8 w-auto" src="/logo.png" alt="Vocelio" />
            <span className="ml-2 text-xl font-bold">Vocelio</span>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={onClose}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={currentUser?.avatar || '/default-avatar.png'}
                alt="User"
              />
            </div>
            <div className="ml-3">
              <p className="text-base font-medium text-gray-700">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Notification Drawer Component
const MobileNotificationDrawer = ({ notifications, onClose }) => {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardShell;
