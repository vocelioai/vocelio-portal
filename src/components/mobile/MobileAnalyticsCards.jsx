import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Phone, MessageSquare,
  Clock, Target, Zap, Award, ArrowUp, ArrowDown, Calendar,
  RefreshCw, Filter, MoreHorizontal, ChevronLeft, ChevronRight
} from 'lucide-react';

// ===== COPILOT PROMPT #7: Mobile Analytics Cards with Swipe Navigation =====

const MobileAnalyticsCards = ({ timeframe = '24h', onTimeframeChange }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // Analytics data (mock data for demo)
  const analyticsCards = [
    {
      id: 'overview',
      title: 'Performance Overview',
      metrics: [
        { label: 'Active Sessions', value: 24, change: +12, trend: 'up', icon: Users },
        { label: 'Avg Response Time', value: '2.3s', change: -0.5, trend: 'down', icon: Clock },
        { label: 'Customer Satisfaction', value: '4.8/5', change: +0.2, trend: 'up', icon: Award },
        { label: 'Resolution Rate', value: '94%', change: +3, trend: 'up', icon: Target }
      ]
    },
    {
      id: 'channels',
      title: 'Channel Performance',
      metrics: [
        { label: 'Voice Calls', value: 156, change: +22, trend: 'up', icon: Phone, color: 'blue' },
        { label: 'Video Sessions', value: 43, change: +8, trend: 'up', icon: MessageSquare, color: 'green' },
        { label: 'Chat Messages', value: 892, change: +156, trend: 'up', icon: MessageSquare, color: 'purple' },
        { label: 'Email Responses', value: 234, change: -12, trend: 'down', icon: BarChart3, color: 'orange' }
      ]
    },
    {
      id: 'engagement',
      title: 'Customer Engagement',
      metrics: [
        { label: 'New Customers', value: 48, change: +15, trend: 'up', icon: Users },
        { label: 'Repeat Customers', value: 312, change: +42, trend: 'up', icon: TrendingUp },
        { label: 'Avg Session Duration', value: '8.5m', change: +1.2, trend: 'up', icon: Clock },
        { label: 'Conversion Rate', value: '12.3%', change: +2.1, trend: 'up', icon: Target }
      ]
    },
    {
      id: 'productivity',
      title: 'Team Productivity',
      metrics: [
        { label: 'Active Agents', value: 18, change: +3, trend: 'up', icon: Users },
        { label: 'Avg Handle Time', value: '4.2m', change: -0.8, trend: 'down', icon: Clock },
        { label: 'First Call Resolution', value: '87%', change: +5, trend: 'up', icon: Zap },
        { label: 'Queue Wait Time', value: '1.3m', change: -0.4, trend: 'down', icon: Clock }
      ]
    }
  ];

  // Touch handlers for swipe navigation
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
    
    setTranslateX(newTranslateX);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    const cardWidth = containerRef.current?.offsetWidth || 320;
    const threshold = cardWidth * 0.3;
    
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      } else if (translateX < 0 && currentCardIndex < analyticsCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
    }
    
    setTranslateX(0);
  }, [translateX, currentCardIndex, analyticsCards.length]);

  // Navigation functions
  const goToPrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentCardIndex < analyticsCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const goToCard = (index) => {
    setCurrentCardIndex(index);
  };

  const currentCard = analyticsCards[currentCardIndex];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">Real-time performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange?.(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1 bg-white"
          >
            <option value="1h">1 Hour</option>
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
          
          <button className="p-2 rounded-md hover:bg-gray-100">
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
          
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <button
          onClick={goToPrevious}
          disabled={currentCardIndex === 0}
          className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-2">
          {analyticsCards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCardIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={goToNext}
          disabled={currentCardIndex === analyticsCards.length - 1}
          className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Swipeable Cards Container */}
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentCardIndex * 100}% + ${translateX}px))`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {analyticsCards.map((card, cardIndex) => (
            <div key={card.id} className="w-full flex-shrink-0">
              <AnalyticsCard card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">94%</p>
            <p className="text-xs text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">2.3s</p>
            <p className="text-xs text-gray-600">Avg Response</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Analytics Card Component
const AnalyticsCard = ({ card }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{card.title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {card.metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
};

// Individual Metric Card Component
const MetricCard = ({ metric }) => {
  const Icon = metric.icon;
  const isPositiveTrend = metric.trend === 'up';
  const TrendIcon = isPositiveTrend ? ArrowUp : ArrowDown;
  
  const getColorClasses = (color, trend) => {
    const colorMap = {
      blue: {
        up: 'bg-blue-50 border-blue-200',
        down: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
      },
      green: {
        up: 'bg-green-50 border-green-200',
        down: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
      },
      purple: {
        up: 'bg-purple-50 border-purple-200',
        down: 'bg-purple-50 border-purple-200',
        icon: 'text-purple-600',
        trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
      },
      orange: {
        up: 'bg-orange-50 border-orange-200',
        down: 'bg-orange-50 border-orange-200',
        icon: 'text-orange-600',
        trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
      },
      default: {
        up: 'bg-gray-50 border-gray-200',
        down: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-600',
        trend: trend === 'up' ? 'text-green-600' : 'text-red-600'
      }
    };
    
    return colorMap[metric.color] || colorMap.default;
  };
  
  const colors = getColorClasses(metric.color, metric.trend);

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[metric.trend]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <Icon className={`h-5 w-5 ${colors.icon}`} />
        <div className={`flex items-center space-x-1 ${colors.trend}`}>
          <TrendIcon className="h-3 w-3" />
          <span className="text-xs font-medium">
            {isPositiveTrend ? '+' : ''}{metric.change}
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
        <p className="text-xs text-gray-600 leading-tight">{metric.label}</p>
      </div>
      
      {/* Mini sparkline placeholder */}
      <div className="mt-3 h-8 bg-gray-100 rounded flex items-end justify-between px-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-gradient-to-t ${colors.icon.includes('blue') ? 'from-blue-200 to-blue-400' : 
              colors.icon.includes('green') ? 'from-green-200 to-green-400' :
              colors.icon.includes('purple') ? 'from-purple-200 to-purple-400' :
              colors.icon.includes('orange') ? 'from-orange-200 to-orange-400' :
              'from-gray-200 to-gray-400'} rounded-sm`}
            style={{ 
              height: `${Math.random() * 20 + 5}px`,
              opacity: isPositiveTrend ? 1 : 0.6
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileAnalyticsCards;
