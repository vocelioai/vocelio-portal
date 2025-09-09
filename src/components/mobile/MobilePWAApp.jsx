import React, { useState, useEffect } from 'react';
import MobileDashboardShell from './MobileDashboardShell';
import MobileSessionList from './MobileSessionList';
import MobileAnalyticsCards from './MobileAnalyticsCards';
import MobileQuickActions from './MobileQuickActions';

// ===== COPILOT PROMPT #7: Mobile PWA Integration Component =====
// Main mobile app wrapper with PWA functionality

const MobilePWAApp = ({ user, initialView = 'dashboard' }) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('24h');

  // Initialize PWA features
  useEffect(() => {
    initializePWAFeatures();
    requestNotificationPermission();
    loadInitialData();
  }, []);

  const initializePWAFeatures = () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Set up viewport meta for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no');
    }

    // Add iOS PWA meta tags if needed
    if (isIOSDevice()) {
      addIOSMetaTags();
    }

    // Prevent zoom on double tap
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  };

  let lastTouchEnd = 0;

  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const addIOSMetaTags = () => {
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Vocelio' }
    ];

    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
          
          // Register for push notifications if service worker is available
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            // Subscribe to push notifications (implement your push service)
          }
        }
      } catch (error) {
        console.log('Notification permission error:', error);
      }
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading initial data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load mock notifications
      setNotifications([
        {
          id: 1,
          title: 'New Customer Session',
          message: 'John Doe started a new chat session',
          timestamp: '2 minutes ago',
          type: 'session'
        },
        {
          id: 2,
          title: 'System Update',
          message: 'Your dashboard has been updated with new features',
          timestamp: '1 hour ago',
          type: 'system'
        }
      ]);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionType) => {
    console.log('Quick action triggered:', actionType);
    
    // Handle different quick actions
    switch (actionType) {
      case 'new-session':
        setCurrentView('sessions');
        // Navigate to new session creation
        break;
      case 'start-call':
        // Initiate voice call
        if ('navigator' in window && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        break;
      case 'start-video':
        // Initiate video call
        break;
      case 'start-chat':
        // Start chat session
        break;
      case 'show-analytics':
        setCurrentView('analytics');
        break;
      case 'export-data':
        // Export analytics data
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  const handleSessionAction = (action, session) => {
    console.log('Session action:', action, session);
    
    switch (action) {
      case 'call':
        // Initiate call with customer
        break;
      case 'message':
        // Send message to customer
        break;
      case 'archive':
        // Archive session
        break;
      case 'delete':
        // Delete session
        break;
      case 'refresh':
        loadInitialData();
        break;
      default:
        console.log('Unknown session action:', action);
    }
  };

  const renderCurrentView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'sessions':
        return (
          <MobileSessionList
            onSessionAction={handleSessionAction}
            onSessionSelect={(session) => {
              console.log('Session selected:', session);
              // Navigate to session detail
            }}
          />
        );
      
      case 'analytics':
        return (
          <MobileAnalyticsCards
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        );
      
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="bg-white rounded-lg p-6 mx-4 mt-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-sm text-blue-800">Active Sessions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">4.8</p>
                  <p className="text-sm text-green-800">Avg Rating</p>
                </div>
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-white mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
              </div>
              <MobileSessionList
                onSessionAction={handleSessionAction}
                onSessionSelect={(session) => {
                  console.log('Session selected:', session);
                }}
              />
            </div>
            
            {/* Quick Analytics */}
            <div className="bg-white mx-4 mb-4 rounded-lg shadow-sm">
              <MobileAnalyticsCards
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <MobileDashboardShell
      currentUser={user}
      notifications={notifications}
    >
      <div className="h-full overflow-y-auto">
        {renderCurrentView()}
      </div>
      
      <MobileQuickActions
        onAction={handleQuickAction}
        currentView={currentView}
      />
      
      {/* Install prompt banner */}
      <InstallPromptBanner />
      
      {/* Offline indicator */}
      <OfflineIndicator />
    </MobileDashboardShell>
  );
};

// Install Prompt Banner Component
const InstallPromptBanner = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Install Vocelio App</p>
          <p className="text-sm text-blue-100">Add to home screen for quick access</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-100 px-4 py-2 rounded-md text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// Offline Indicator Component
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-3 z-50">
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-3"></div>
        <span className="text-sm font-medium">You're currently offline</span>
      </div>
    </div>
  );
};

export default MobilePWAApp;
