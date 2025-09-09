import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { subDays, format } from 'date-fns';
import analyticsService from '../services/AnalyticsAPIService';

// ===== COPILOT PROMPT #5: Advanced Analytics Hooks =====
// Custom hooks for analytics data management and real-time updates

export const useAnalyticsData = (initialDateRange = null, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    enableCache = true,
    channels = []
  } = options;

  const [dateRange, setDateRange] = useState(initialDateRange || {
    start: subDays(new Date(), 30),
    end: new Date()
  });

  const [data, setData] = useState({
    kpis: null,
    timeSeries: null,
    channels: null,
    predictions: null
  });

  const [loading, setLoading] = useState({
    kpis: false,
    timeSeries: false,
    channels: false,
    predictions: false
  });

  const [errors, setErrors] = useState({});
  
  const refreshIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch KPI data
  const fetchKPIs = useCallback(async (range = dateRange, selectedChannels = channels) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(prev => ({ ...prev, kpis: true }));
    setErrors(prev => ({ ...prev, kpis: null }));

    try {
      const kpiData = await analyticsService.getKPIMetrics(range, selectedChannels);
      setData(prev => ({ ...prev, kpis: kpiData }));
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrors(prev => ({ ...prev, kpis: error.message }));
      }
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  }, [dateRange, channels]);

  // Fetch time series data
  const fetchTimeSeries = useCallback(async (metric = 'interactions', granularity = 'day', range = dateRange, selectedChannels = channels) => {
    setLoading(prev => ({ ...prev, timeSeries: true }));
    setErrors(prev => ({ ...prev, timeSeries: null }));

    try {
      const timeSeriesData = await analyticsService.getTimeSeriesData(range, metric, granularity, selectedChannels);
      setData(prev => ({ ...prev, timeSeries: timeSeriesData }));
    } catch (error) {
      setErrors(prev => ({ ...prev, timeSeries: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, timeSeries: false }));
    }
  }, [dateRange, channels]);

  // Fetch channel distribution data
  const fetchChannels = useCallback(async (range = dateRange) => {
    setLoading(prev => ({ ...prev, channels: true }));
    setErrors(prev => ({ ...prev, channels: null }));

    try {
      const channelData = await analyticsService.getChannelDistribution(range);
      setData(prev => ({ ...prev, channels: channelData }));
    } catch (error) {
      setErrors(prev => ({ ...prev, channels: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, channels: false }));
    }
  }, [dateRange]);

  // Fetch predictive analytics
  const fetchPredictions = useCallback(async (range = dateRange, selectedChannels = channels) => {
    setLoading(prev => ({ ...prev, predictions: true }));
    setErrors(prev => ({ ...prev, predictions: null }));

    try {
      const predictionsData = await analyticsService.getPredictiveInsights(range, selectedChannels);
      setData(prev => ({ ...prev, predictions: predictionsData }));
    } catch (error) {
      setErrors(prev => ({ ...prev, predictions: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, predictions: false }));
    }
  }, [dateRange, channels]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchKPIs(),
      fetchTimeSeries(),
      fetchChannels(),
      fetchPredictions()
    ]);
  }, [fetchKPIs, fetchTimeSeries, fetchChannels, fetchPredictions]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refreshAll, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshAll]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dateRange]); // Only depend on dateRange to avoid excessive refetches

  // Update date range
  const updateDateRange = useCallback((newRange) => {
    setDateRange(newRange);
  }, []);

  // Memoized computed values
  const computedMetrics = useMemo(() => {
    if (!data.kpis || !data.timeSeries) return null;

    const trends = data.timeSeries.length > 1 ? {
      interactionsTrend: data.timeSeries[data.timeSeries.length - 1].interactions > data.timeSeries[0].interactions ? 'up' : 'down',
      satisfactionTrend: data.timeSeries[data.timeSeries.length - 1].satisfaction > data.timeSeries[0].satisfaction ? 'up' : 'down'
    } : null;

    return {
      trends,
      totalInteractions: data.kpis.totalInteractions,
      averageMetrics: {
        responseTime: data.kpis.avgResponseTime,
        satisfaction: data.kpis.customerSatisfaction,
        resolution: data.kpis.resolutionRate
      }
    };
  }, [data.kpis, data.timeSeries]);

  return {
    data,
    loading,
    errors,
    dateRange,
    updateDateRange,
    refreshAll,
    fetchKPIs,
    fetchTimeSeries,
    fetchChannels,
    fetchPredictions,
    computedMetrics
  };
};

export const useReportGeneration = () => {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateReport = useCallback(async (reportConfig) => {
    setGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const reportData = await analyticsService.generateReport(reportConfig);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      const newReport = {
        id: `report_${Date.now()}`,
        title: reportConfig.title,
        config: reportConfig,
        data: reportData,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      setReports(prev => [newReport, ...prev]);
      
      setTimeout(() => {
        setGenerationProgress(0);
        setGenerating(false);
      }, 1000);

      return newReport;
    } catch (error) {
      setGenerating(false);
      setGenerationProgress(0);
      throw error;
    }
  }, []);

  const downloadReport = useCallback(async (reportId, format = 'pdf') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // In a real application, this would trigger a download from the server
    const blob = new Blob([JSON.stringify(report.data, null, 2)], { 
      type: format === 'json' ? 'application/json' : 'application/octet-stream' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reports]);

  const deleteReport = useCallback((reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const scheduleReport = useCallback(async (reportConfig, schedule) => {
    // Mock scheduling - in real app, this would set up server-side scheduling
    const scheduledReport = {
      id: `scheduled_${Date.now()}`,
      config: reportConfig,
      schedule,
      status: 'scheduled',
      nextRun: schedule.nextRunDate
    };

    console.log('Scheduled report:', scheduledReport);
    return scheduledReport;
  }, []);

  return {
    reports,
    generating,
    generationProgress,
    generateReport,
    downloadReport,
    deleteReport,
    scheduleReport
  };
};

export const useRealTimeAnalytics = () => {
  const [realTimeData, setRealTimeData] = useState({});
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Subscribe to real-time analytics updates
    const unsubscribe = analyticsService.subscribeToRealTimeUpdates((data) => {
      setRealTimeData(prev => ({
        ...prev,
        ...data
      }));
      setLastUpdate(new Date());
    });

    setConnected(true);

    return () => {
      unsubscribe();
      setConnected(false);
    };
  }, []);

  const broadcastUpdate = useCallback((data) => {
    analyticsService.broadcastUpdate(data);
  }, []);

  return {
    realTimeData,
    connected,
    lastUpdate,
    broadcastUpdate
  };
};

export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportData = useCallback(async (data, format = 'csv', filename = 'analytics_export') => {
    setExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 15, 90));
      }, 100);

      const exportedData = analyticsService.exportData(data, format);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      // Create download
      const mimeType = {
        'csv': 'text/csv',
        'json': 'application/json',
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }[format] || 'application/octet-stream';

      const blob = new Blob([exportedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setExportProgress(0);
        setExporting(false);
      }, 500);

    } catch (error) {
      setExporting(false);
      setExportProgress(0);
      throw error;
    }
  }, []);

  return {
    exportData,
    exporting,
    exportProgress
  };
};

export const useAdvancedFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    channels: [],
    agents: [],
    customerSegments: [],
    interactionTypes: [],
    satisfactionRange: [0, 100],
    responseTimeRange: [0, 3600], // in seconds
    ...initialFilters
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    const resetFilters = {
      channels: [],
      agents: [],
      customerSegments: [],
      interactionTypes: [],
      satisfactionRange: [0, 100],
      responseTimeRange: [0, 3600]
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.channels.length > 0 ||
      appliedFilters.agents.length > 0 ||
      appliedFilters.customerSegments.length > 0 ||
      appliedFilters.interactionTypes.length > 0 ||
      appliedFilters.satisfactionRange[0] > 0 ||
      appliedFilters.satisfactionRange[1] < 100 ||
      appliedFilters.responseTimeRange[0] > 0 ||
      appliedFilters.responseTimeRange[1] < 3600
    );
  }, [appliedFilters]);

  return {
    filters,
    appliedFilters,
    updateFilter,
    applyFilters,
    resetFilters,
    hasActiveFilters
  };
};

export const useDashboardPersonalization = (userId) => {
  const [layout, setLayout] = useState([]);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    defaultDateRange: 30,
    autoRefresh: true,
    refreshInterval: 300000,
    favoriteMetrics: [],
    dashboardName: 'My Analytics Dashboard'
  });

  const [saving, setSaving] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem(`dashboard_preferences_${userId}`);
    const savedLayout = localStorage.getItem(`dashboard_layout_${userId}`);

    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }

    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Failed to parse saved layout:', error);
      }
    }
  }, [userId]);

  const savePreferences = useCallback(async (newPreferences) => {
    setSaving(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);
      localStorage.setItem(`dashboard_preferences_${userId}`, JSON.stringify(updatedPreferences));
    } finally {
      setSaving(false);
    }
  }, [preferences, userId]);

  const saveLayout = useCallback(async (newLayout) => {
    setSaving(true);
    try {
      setLayout(newLayout);
      localStorage.setItem(`dashboard_layout_${userId}`, JSON.stringify(newLayout));
    } finally {
      setSaving(false);
    }
  }, [userId]);

  const resetToDefaults = useCallback(() => {
    const defaultPreferences = {
      theme: 'light',
      defaultDateRange: 30,
      autoRefresh: true,
      refreshInterval: 300000,
      favoriteMetrics: [],
      dashboardName: 'My Analytics Dashboard'
    };
    
    setPreferences(defaultPreferences);
    setLayout([]);
    
    localStorage.removeItem(`dashboard_preferences_${userId}`);
    localStorage.removeItem(`dashboard_layout_${userId}`);
  }, [userId]);

  return {
    layout,
    preferences,
    saving,
    savePreferences,
    saveLayout,
    resetToDefaults
  };
};
