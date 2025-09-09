import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, MessageSquare, Clock,
  Award, Target, DollarSign, Activity, AlertTriangle,
  ArrowUp, ArrowDown, MoreHorizontal, RefreshCw
} from 'lucide-react';

// ===== COPILOT PROMPT #5: KPI Cards Component =====
// Reusable KPI cards with trend indicators and interactive features

const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', 
  trend, 
  icon: Icon, 
  color = 'blue',
  onClick,
  loading = false,
  description,
  target,
  unit = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      accent: 'bg-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      accent: 'bg-amber-100'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      accent: 'bg-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'bg-purple-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      accent: 'bg-indigo-100'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const trendIcon = trend === 'up' ? ArrowUp : ArrowDown;
  const TrendIcon = trendIcon;

  const formatChange = (change, type) => {
    if (type === 'percentage') {
      return `${change > 0 ? '+' : ''}${change}%`;
    } else if (type === 'absolute') {
      return `${change > 0 ? '+' : ''}${change.toLocaleString()}`;
    } else if (type === 'currency') {
      return `${change > 0 ? '+' : ''}$${Math.abs(change).toLocaleString()}`;
    }
    return change;
  };

  const isPositiveChange = useMemo(() => {
    if (typeof change === 'number') {
      return change > 0;
    }
    if (typeof change === 'string') {
      return !change.startsWith('-');
    }
    return true;
  }, [change]);

  const changeColor = (trend === 'up' && isPositiveChange) || (trend === 'down' && !isPositiveChange) 
    ? 'text-green-600' 
    : 'text-red-600';

  return (
    <div 
      className={`relative p-6 rounded-xl border-2 ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group`}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colors.accent} shadow-sm group-hover:shadow-md transition-shadow`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${changeColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{formatChange(change, changeType)}</span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}{unit}
        </div>
        {target && (
          <div className="text-sm text-gray-500 mt-1">
            Target: {typeof target === 'number' ? target.toLocaleString() : target}{unit}
          </div>
        )}
      </div>

      {/* Progress Bar (if target is provided) */}
      {target && typeof value === 'number' && typeof target === 'number' && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                value >= target ? 'bg-green-500' : colors.text.replace('text-', 'bg-')
              }`}
              style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((value / target) * 100)}% of target
          </div>
        </div>
      )}

      {/* Additional Actions */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Updated 5 min ago</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Grid component to manage KPI cards layout
export const KPIGrid = ({ 
  kpis = [], 
  columns = 3, 
  onCardClick, 
  loading = false,
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {kpis.map((kpi, index) => (
        <KPICard
          key={kpi.id || index}
          {...kpi}
          onClick={() => onCardClick?.(kpi, index)}
          loading={loading}
        />
      ))}
    </div>
  );
};

// Predefined KPI configurations for different use cases
export const getDefaultKPIs = (type = 'overview') => {
  const kpiSets = {
    overview: [
      {
        id: 'total-interactions',
        title: 'Total Interactions',
        value: 0,
        change: 0,
        trend: 'up',
        icon: MessageSquare,
        color: 'blue',
        description: 'All channels combined',
        target: 150000
      },
      {
        id: 'avg-response-time',
        title: 'Avg Response Time',
        value: '0:00',
        change: 0,
        trend: 'down',
        icon: Clock,
        color: 'green',
        description: 'Across all channels',
        target: '2:00'
      },
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction',
        value: 0,
        change: 0,
        trend: 'up',
        icon: Award,
        color: 'amber',
        unit: '%',
        description: 'CSAT score',
        target: 95
      },
      {
        id: 'resolution-rate',
        title: 'Resolution Rate',
        value: 0,
        change: 0,
        trend: 'up',
        icon: Target,
        color: 'green',
        unit: '%',
        description: 'First contact resolution',
        target: 90
      },
      {
        id: 'active-agents',
        title: 'Active Agents',
        value: 0,
        change: 0,
        trend: 'up',
        icon: Users,
        color: 'purple',
        description: 'Currently online',
        target: 200
      },
      {
        id: 'cost-per-interaction',
        title: 'Cost per Interaction',
        value: 0,
        change: 0,
        changeType: 'currency',
        trend: 'down',
        icon: DollarSign,
        color: 'red',
        unit: '',
        description: 'Average cost',
        target: 3.00
      }
    ],
    
    performance: [
      {
        id: 'fcr-rate',
        title: 'First Contact Resolution',
        value: 0,
        change: 0,
        trend: 'up',
        icon: Target,
        color: 'green',
        unit: '%',
        target: 85
      },
      {
        id: 'escalation-rate',
        title: 'Escalation Rate',
        value: 0,
        change: 0,
        trend: 'down',
        icon: TrendingUp,
        color: 'red',
        unit: '%',
        target: 5
      },
      {
        id: 'agent-utilization',
        title: 'Agent Utilization',
        value: 0,
        change: 0,
        trend: 'up',
        icon: Activity,
        color: 'blue',
        unit: '%',
        target: 80
      },
      {
        id: 'customer-effort-score',
        title: 'Customer Effort Score',
        value: 0,
        change: 0,
        trend: 'down',
        icon: Award,
        color: 'amber',
        unit: '/5',
        target: 2.5
      }
    ],

    financial: [
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: 0,
        change: 0,
        changeType: 'currency',
        trend: 'up',
        icon: DollarSign,
        color: 'green',
        unit: '',
        target: 1000000
      },
      {
        id: 'operating-costs',
        title: 'Operating Costs',
        value: 0,
        change: 0,
        changeType: 'currency',
        trend: 'down',
        icon: TrendingDown,
        color: 'red',
        unit: '',
        target: 250000
      },
      {
        id: 'roi',
        title: 'Return on Investment',
        value: 0,
        change: 0,
        trend: 'up',
        icon: TrendingUp,
        color: 'blue',
        unit: '%',
        target: 300
      },
      {
        id: 'cost-savings',
        title: 'Cost Savings',
        value: 0,
        change: 0,
        changeType: 'currency',
        trend: 'up',
        icon: Award,
        color: 'purple',
        unit: '',
        target: 50000
      }
    ]
  };

  return kpiSets[type] || kpiSets.overview;
};

export default KPICard;
