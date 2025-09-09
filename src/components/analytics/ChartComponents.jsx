import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
  RadialBarChart, RadialBar, ComposedChart, Treemap, Funnel, FunnelChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, MoreHorizontal, Download,
  Maximize2, Filter, RefreshCw, Settings, Eye, EyeOff
} from 'lucide-react';
import { format } from 'date-fns';

// ===== COPILOT PROMPT #5: Advanced Chart Components =====
// Comprehensive chart library with interactive features and customization

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
];

const GRADIENTS = {
  blue: { start: '#3B82F6', end: '#60A5FA' },
  green: { start: '#10B981', end: '#34D399' },
  amber: { start: '#F59E0B', end: '#FBBF24' },
  red: { start: '#EF4444', end: '#F87171' },
  purple: { start: '#8B5CF6', end: '#A78BFA' }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 capitalize">
              {entry.dataKey}: 
            </span>
            <span className="text-sm font-medium text-gray-900">
              {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Base Chart Container with common functionality
const ChartContainer = ({ 
  title, 
  children, 
  height = 400, 
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onSettings,
  className = '',
  showControls = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <TrendingDown className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Error</h3>
          <p className="text-gray-600">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-lg shadow-lg ${className} ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}
    >
      {/* Chart Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showControls && (
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Export Chart"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Chart Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6 pt-4">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
        ) : (
          <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Line Chart Component
export const EnhancedLineChart = ({ 
  data = [], 
  title = "Line Chart",
  dataKeys = [],
  xAxisKey = 'date',
  colors = CHART_COLORS,
  showGrid = true,
  showLegend = true,
  showDots = true,
  smooth = true,
  ...props 
}) => {
  const [hiddenLines, setHiddenLines] = useState(new Set());

  const toggleLine = (dataKey) => {
    setHiddenLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const visibleDataKeys = dataKeys.filter(key => !hiddenLines.has(key));

  return (
    <ChartContainer title={title} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              onClick={(e) => toggleLine(e.dataKey)}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type={smooth ? "monotone" : "linear"}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={showDots ? { fill: colors[index % colors.length], strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6, fill: colors[index % colors.length] }}
              hide={hiddenLines.has(key)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Enhanced Area Chart Component
export const EnhancedAreaChart = ({ 
  data = [], 
  title = "Area Chart",
  dataKeys = [],
  xAxisKey = 'date',
  colors = CHART_COLORS,
  stacked = false,
  gradient = true,
  ...props 
}) => {
  return (
    <ChartContainer title={title} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {gradient && dataKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.2}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "1" : key}
              stroke={colors[index % colors.length]}
              fill={gradient ? `url(#gradient-${key})` : colors[index % colors.length]}
              fillOpacity={gradient ? 1 : 0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Enhanced Bar Chart Component
export const EnhancedBarChart = ({ 
  data = [], 
  title = "Bar Chart",
  dataKeys = [],
  xAxisKey = 'name',
  colors = CHART_COLORS,
  horizontal = false,
  stacked = false,
  ...props 
}) => {
  const Chart = horizontal ? BarChart : BarChart;
  const XAxisComp = horizontal ? YAxis : XAxis;
  const YAxisComp = horizontal ? XAxis : YAxis;

  return (
    <ChartContainer title={title} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart 
          data={data} 
          layout={horizontal ? 'horizontal' : 'vertical'}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxisComp 
            dataKey={horizontal ? undefined : xAxisKey}
            type={horizontal ? 'number' : 'category'}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxisComp 
            dataKey={horizontal ? xAxisKey : undefined}
            type={horizontal ? 'category' : 'number'}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              stackId={stacked ? "stack" : key}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Enhanced Pie Chart Component
export const EnhancedPieChart = ({ 
  data = [], 
  title = "Pie Chart",
  dataKey = 'value',
  nameKey = 'name',
  colors = CHART_COLORS,
  showLabels = true,
  innerRadius = 0,
  ...props 
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <ChartContainer title={title} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <RechartsPieChart
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={120}
            paddingAngle={2}
            dataKey={dataKey}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                stroke={activeIndex === index ? '#374151' : 'transparent'}
                strokeWidth={activeIndex === index ? 2 : 0}
              />
            ))}
          </RechartsPieChart>
          <Tooltip content={<CustomTooltip />} />
          {showLabels && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Multi-Metric Dashboard Chart
export const MultiMetricChart = ({ 
  data = [], 
  title = "Multi-Metric Analysis",
  primaryMetric,
  secondaryMetrics = [],
  ...props 
}) => {
  return (
    <ChartContainer title={title} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Primary metric as bars */}
          {primaryMetric && (
            <Bar 
              yAxisId="left"
              dataKey={primaryMetric.key} 
              fill={primaryMetric.color || CHART_COLORS[0]}
              name={primaryMetric.name}
              radius={[2, 2, 0, 0]}
            />
          )}
          
          {/* Secondary metrics as lines */}
          {secondaryMetrics.map((metric, index) => (
            <Line
              key={metric.key}
              yAxisId="right"
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color || CHART_COLORS[index + 1]}
              strokeWidth={2}
              name={metric.name}
              dot={{ r: 4 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Heatmap Chart Component
export const HeatmapChart = ({ 
  data = [], 
  title = "Heatmap",
  xAxisKey = 'hour',
  yAxisKey = 'day',
  valueKey = 'value',
  colorRange = ['#fee2e2', '#dc2626'],
  ...props 
}) => {
  const maxValue = useMemo(() => 
    Math.max(...data.map(d => d[valueKey] || 0)), [data, valueKey]
  );

  const getColor = (value) => {
    const intensity = value / maxValue;
    // Simple interpolation between two colors
    const r1 = parseInt(colorRange[0].slice(1, 3), 16);
    const g1 = parseInt(colorRange[0].slice(3, 5), 16);
    const b1 = parseInt(colorRange[0].slice(5, 7), 16);
    const r2 = parseInt(colorRange[1].slice(1, 3), 16);
    const g2 = parseInt(colorRange[1].slice(3, 5), 16);
    const b2 = parseInt(colorRange[1].slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * intensity);
    const g = Math.round(g1 + (g2 - g1) * intensity);
    const b = Math.round(b1 + (b2 - b1) * intensity);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const hours = [...new Set(data.map(d => d[xAxisKey]))].sort();
  const days = [...new Set(data.map(d => d[yAxisKey]))].sort();

  return (
    <ChartContainer title={title} {...props}>
      <div className="w-full h-full overflow-auto">
        <div className="min-w-max">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${hours.length + 1}, minmax(40px, 1fr))` }}>
            {/* Header row */}
            <div></div>
            {hours.map(hour => (
              <div key={hour} className="text-xs text-center py-1 font-medium">
                {hour}
              </div>
            ))}
            
            {/* Data rows */}
            {days.map(day => (
              <React.Fragment key={day}>
                <div className="text-xs py-2 pr-2 font-medium text-right">{day}</div>
                {hours.map(hour => {
                  const cellData = data.find(d => d[xAxisKey] === hour && d[yAxisKey] === day);
                  const value = cellData?.[valueKey] || 0;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square flex items-center justify-center text-xs font-medium rounded cursor-pointer hover:ring-2 hover:ring-blue-400"
                      style={{ 
                        backgroundColor: getColor(value),
                        color: value > maxValue * 0.5 ? 'white' : 'black'
                      }}
                      title={`${day} ${hour}: ${value}`}
                    >
                      {value}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};

export {
  ChartContainer,
  CustomTooltip,
  CHART_COLORS,
  GRADIENTS
};
