import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Phone, Video, MessageSquare, Mail, UserPlus, Calendar,
  Settings, Search, Filter, BarChart3, Download, Upload,
  Zap, Users, Target, Clock, X, Check, AlertCircle
} from 'lucide-react';

// ===== COPILOT PROMPT #7: Mobile Quick Actions with Floating Action Button =====

const MobileQuickActions = ({ onAction, currentView = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const tooltipTimeoutRef = useRef(null);

  // Hide/show FAB based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Quick actions based on current view
  const getQuickActions = () => {
    const baseActions = [
      {
        id: 'new-session',
        label: 'New Session',
        icon: UserPlus,
        color: 'bg-blue-500 hover:bg-blue-600',
        action: () => handleAction('new-session')
      },
      {
        id: 'call',
        label: 'Voice Call',
        icon: Phone,
        color: 'bg-green-500 hover:bg-green-600',
        action: () => handleAction('start-call')
      },
      {
        id: 'video',
        label: 'Video Call',
        icon: Video,
        color: 'bg-purple-500 hover:bg-purple-600',
        action: () => handleAction('start-video')
      },
      {
        id: 'chat',
        label: 'Live Chat',
        icon: MessageSquare,
        color: 'bg-orange-500 hover:bg-orange-600',
        action: () => handleAction('start-chat')
      }
    ];

    const viewSpecificActions = {
      dashboard: [
        {
          id: 'analytics',
          label: 'Quick Stats',
          icon: BarChart3,
          color: 'bg-indigo-500 hover:bg-indigo-600',
          action: () => handleAction('show-analytics')
        },
        {
          id: 'schedule',
          label: 'Schedule',
          icon: Calendar,
          color: 'bg-cyan-500 hover:bg-cyan-600',
          action: () => handleAction('show-schedule')
        }
      ],
      sessions: [
        {
          id: 'bulk-action',
          label: 'Bulk Actions',
          icon: Target,
          color: 'bg-red-500 hover:bg-red-600',
          action: () => handleAction('bulk-actions')
        },
        {
          id: 'filter',
          label: 'Filter Sessions',
          icon: Filter,
          color: 'bg-gray-500 hover:bg-gray-600',
          action: () => handleAction('show-filters')
        }
      ],
      analytics: [
        {
          id: 'export',
          label: 'Export Data',
          icon: Download,
          color: 'bg-teal-500 hover:bg-teal-600',
          action: () => handleAction('export-data')
        },
        {
          id: 'custom-report',
          label: 'Custom Report',
          icon: BarChart3,
          color: 'bg-pink-500 hover:bg-pink-600',
          action: () => handleAction('create-report')
        }
      ]
    };

    return [...baseActions, ...(viewSpecificActions[currentView] || [])];
  };

  const quickActions = getQuickActions();

  const handleAction = (actionType) => {
    setIsOpen(false);
    onAction?.(actionType);
    
    // Show success feedback
    showActionFeedback(actionType);
  };

  const showActionFeedback = (actionType) => {
    // Create and show a temporary success message
    const message = `${actionType.replace('-', ' ')} initiated`;
    
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
    
    // You could implement a toast notification here
    console.log(`Quick action: ${message}`);
  };

  const handleTooltipShow = (actionId) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    setShowTooltip(actionId);
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(null);
    }, 2000);
  };

  const handleTooltipHide = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(null);
  };

  // Emergency quick actions (always visible)
  const emergencyActions = [
    {
      id: 'emergency',
      label: 'Emergency',
      icon: AlertCircle,
      color: 'bg-red-600 hover:bg-red-700 animate-pulse',
      action: () => handleAction('emergency-mode')
    }
  ];

  return (
    <>
      {/* Main Floating Action Button */}
      <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}>
        {/* Emergency Actions (always visible on long press) */}
        <div className="mb-2 space-y-2">
          {emergencyActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`w-12 h-12 rounded-full shadow-lg text-white flex items-center justify-center ${action.color} transform transition-all duration-200 active:scale-95`}
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          })}
        </div>

        {/* Quick Action Menu */}
        <div className={`mb-4 space-y-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'
        }`}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const delay = index * 50;
            
            return (
              <div key={action.id} className="relative flex items-center justify-end">
                {/* Tooltip */}
                {showTooltip === action.id && (
                  <div className="absolute right-16 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                    {action.label}
                    <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
                      <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={action.action}
                  onMouseEnter={() => handleTooltipShow(action.id)}
                  onMouseLeave={handleTooltipHide}
                  onTouchStart={() => handleTooltipShow(action.id)}
                  className={`w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center ${action.color} transform transition-all duration-200 hover:scale-110 active:scale-95`}
                  style={{
                    transitionDelay: isOpen ? `${delay}ms` : '0ms'
                  }}
                >
                  <Icon className="h-6 w-6" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-xl text-white flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <Plus className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Action Cards (slide up from bottom) */}
      {isOpen && (
        <QuickActionCards
          actions={quickActions}
          onAction={handleAction}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Quick Action Cards Component
const QuickActionCards = ({ actions, onAction, onClose }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300">
      {/* Handle bar */}
      <div className="flex justify-center py-3">
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Actions Grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors active:scale-95"
              >
                <div className={`w-12 h-12 rounded-full ${action.color.split(' ')[0]} flex items-center justify-center mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="px-6 pb-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3 mt-4">Recent Actions</h4>
        <div className="space-y-2">
          {['New session with John Doe', 'Video call completed', 'Analytics exported'].map((action, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">{action}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {index === 0 ? '2 min ago' : index === 1 ? '5 min ago' : '10 min ago'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-8 bg-white"></div>
    </div>
  );
};

export default MobileQuickActions;
