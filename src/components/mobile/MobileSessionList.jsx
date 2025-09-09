import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Phone, Video, MessageSquare, Mail, User, Clock, Star,
  ChevronRight, MoreVertical, Archive, Trash2, PhoneCall,
  MessageCircle, Flag, CheckCircle, Circle, AlertCircle
} from 'lucide-react';

// ===== COPILOT PROMPT #7: Mobile Session List with Swipe Actions =====

const MobileSessionList = ({ sessions = [], onSessionAction, onSessionSelect }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [swipedSession, setSwipedSession] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchCurrentRef = useRef({ x: 0, y: 0 });

  // Pull-to-refresh handler
  const handlePullRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onSessionAction) {
        onSessionAction('refresh');
      }
    } finally {
      setRefreshing(false);
    }
  }, [onSessionAction]);

  // Mock sessions data if none provided
  const mockSessions = (Array.isArray(sessions) && sessions.length > 0) ? sessions : [
    {
      id: 'session_001',
      customer: {
        name: 'John Enterprise',
        email: 'john@enterprise.com',
        avatar: '/avatars/john.jpg',
        priority: 'high'
      },
      channel: 'voice',
      status: 'active',
      duration: '15:32',
      lastMessage: 'I need help with the integration setup',
      timestamp: '2 min ago',
      unreadCount: 3,
      tags: ['enterprise', 'technical'],
      sentiment: 'neutral'
    },
    {
      id: 'session_002',
      customer: {
        name: 'Sarah Tech',
        email: 'sarah@techcorp.com',
        avatar: '/avatars/sarah.jpg',
        priority: 'medium'
      },
      channel: 'video',
      status: 'waiting',
      duration: '8:45',
      lastMessage: 'Can we schedule a demo call?',
      timestamp: '5 min ago',
      unreadCount: 1,
      tags: ['demo', 'sales'],
      sentiment: 'positive'
    },
    {
      id: 'session_003',
      customer: {
        name: 'Mike Support',
        email: 'mike@support.com',
        avatar: '/avatars/mike.jpg',
        priority: 'low'
      },
      channel: 'chat',
      status: 'resolved',
      duration: '22:18',
      lastMessage: 'Thank you for the quick resolution!',
      timestamp: '1 hour ago',
      unreadCount: 0,
      tags: ['support', 'resolved'],
      sentiment: 'positive'
    }
  ];

  return (
    <div className="bg-white">
      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="flex items-center justify-center py-4 bg-blue-50">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-600 text-sm">Refreshing...</span>
        </div>
      )}

      {/* Session list */}
      <div className="divide-y divide-gray-100">
        {mockSessions.map((session) => (
          <MobileSessionCard
            key={session.id}
            session={session}
            onSelect={() => onSessionSelect?.(session)}
            onAction={onSessionAction}
            isSwipped={swipedSession === session.id}
            onSwipeChange={(isSwipped) => setSwipedSession(isSwipped ? session.id : null)}
          />
        ))}
      </div>

      {/* Empty state */}
      {mockSessions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
          <p className="text-gray-500">New customer sessions will appear here</p>
        </div>
      )}
    </div>
  );
};

// Individual session card with swipe functionality
const MobileSessionCard = ({ session, onSelect, onAction, isSwipped, onSwipeChange }) => {
  const cardRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const getChannelIcon = (channel) => {
    const icons = {
      voice: Phone,
      video: Video,
      chat: MessageSquare,
      email: Mail
    };
    return icons[channel] || MessageSquare;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      waiting: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-gray-100 text-gray-800',
      escalated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: <Flag className="h-4 w-4 text-red-500" />,
      medium: <Circle className="h-4 w-4 text-yellow-500" />,
      low: <CheckCircle className="h-4 w-4 text-green-500" />
    };
    return icons[priority] || icons.medium;
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'text-green-600',
      neutral: 'text-yellow-600',
      negative: 'text-red-600'
    };
    return colors[sentiment] || 'text-gray-600';
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
  }, [translateX]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startXRef.current;
    const newTranslateX = currentXRef.current + deltaX;
    
    // Limit swipe distance
    const maxSwipe = 200;
    const clampedX = Math.max(-maxSwipe, Math.min(0, newTranslateX));
    
    setTranslateX(clampedX);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    // Snap to position based on swipe distance
    if (translateX < -100) {
      setTranslateX(-200);
      onSwipeChange(true);
    } else {
      setTranslateX(0);
      onSwipeChange(false);
    }
  }, [translateX, onSwipeChange]);

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = translateX;
    e.preventDefault();
  }, [translateX]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - startXRef.current;
    const newTranslateX = currentXRef.current + deltaX;
    
    const maxSwipe = 200;
    const clampedX = Math.max(-maxSwipe, Math.min(0, newTranslateX));
    
    setTranslateX(clampedX);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    if (translateX < -100) {
      setTranslateX(-200);
      onSwipeChange(true);
    } else {
      setTranslateX(0);
      onSwipeChange(false);
    }
  }, [translateX, onSwipeChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const ChannelIcon = getChannelIcon(session.channel);

  const handleQuickAction = (action) => {
    onAction?.(action, session);
    setTranslateX(0);
    onSwipeChange(false);
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Quick Action Buttons (revealed on swipe) */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        <button
          onClick={() => handleQuickAction('call')}
          className="flex items-center justify-center w-16 bg-green-500 text-white"
        >
          <PhoneCall className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleQuickAction('message')}
          className="flex items-center justify-center w-16 bg-blue-500 text-white"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleQuickAction('archive')}
          className="flex items-center justify-center w-16 bg-gray-500 text-white"
        >
          <Archive className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleQuickAction('delete')}
          className="flex items-center justify-center w-16 bg-red-500 text-white"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Main session card */}
      <div
        ref={cardRef}
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={!isDragging ? onSelect : undefined}
      >
        <div className="p-4 flex items-center space-x-3">
          {/* Customer Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={session.customer.avatar || '/default-avatar.png'}
              alt={session.customer.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            {/* Channel indicator */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              <ChannelIcon className="h-3 w-3 text-gray-600" />
            </div>
          </div>

          {/* Session Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {session.customer.name}
                </h3>
                {getPriorityIcon(session.customer.priority)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{session.timestamp}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{session.duration}</span>
                {session.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {session.unreadCount}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 truncate">{session.lastMessage}</p>

            {/* Tags and Sentiment */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap gap-1">
                {session.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className={`text-xs font-medium ${getSentimentColor(session.sentiment)}`}>
                {session.sentiment}
              </div>
            </div>
          </div>

          {/* More Options */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
            className="flex-shrink-0 p-2 rounded-md hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Progress bar for active sessions */}
        {session.status === 'active' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: '60%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSessionList;
