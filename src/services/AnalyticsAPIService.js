import { format, subDays, startOfDay, endOfDay, parseISO, isValid } from 'date-fns';

// ===== COPILOT PROMPT #5: Analytics API Service =====
// Data processing and API integration for analytics dashboard

class AnalyticsAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://api.omnichannel.com';
    this.cache = new Map();
    this.subscribers = new Set();
  }

  // ==================== KPI CALCULATIONS ====================

  async getKPIMetrics(dateRange, channels = []) {
    const cacheKey = `kpis-${dateRange.start}-${dateRange.end}-${channels.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest('/analytics/kpis', {
        method: 'POST',
        body: JSON.stringify({
          startDate: format(dateRange.start, 'yyyy-MM-dd'),
          endDate: format(dateRange.end, 'yyyy-MM-dd'),
          channels
        })
      });

      const kpis = await this.processKPIData(response.data);
      this.cache.set(cacheKey, kpis);
      
      // Cache for 5 minutes
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return kpis;
    } catch (error) {
      console.error('KPI fetch error:', error);
      return this.getMockKPIData();
    }
  }

  async processKPIData(rawData) {
    return {
      totalInteractions: this.calculateTotalInteractions(rawData),
      avgResponseTime: this.calculateAverageResponseTime(rawData),
      customerSatisfaction: this.calculateCSAT(rawData),
      resolutionRate: this.calculateResolutionRate(rawData),
      activeAgents: this.calculateActiveAgents(rawData),
      costPerInteraction: this.calculateCostPerInteraction(rawData),
      firstContactResolution: this.calculateFCR(rawData),
      customerRetention: this.calculateRetentionRate(rawData),
      agentUtilization: this.calculateAgentUtilization(rawData),
      escalationRate: this.calculateEscalationRate(rawData)
    };
  }

  calculateTotalInteractions(data) {
    return data.interactions?.reduce((sum, interaction) => sum + (interaction.count || 0), 0) || 0;
  }

  calculateAverageResponseTime(data) {
    const totalTime = data.responseTimes?.reduce((sum, rt) => sum + rt.seconds, 0) || 0;
    const count = data.responseTimes?.length || 1;
    const avgSeconds = totalTime / count;
    
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = Math.floor(avgSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  calculateCSAT(data) {
    const ratings = data.satisfaction?.ratings || [];
    if (ratings.length === 0) return 0;
    
    const totalRating = ratings.reduce((sum, rating) => sum + rating.score, 0);
    return Math.round((totalRating / (ratings.length * 5)) * 100 * 10) / 10;
  }

  calculateResolutionRate(data) {
    const resolved = data.resolutions?.resolved || 0;
    const total = data.resolutions?.total || 1;
    return Math.round((resolved / total) * 100 * 10) / 10;
  }

  calculateActiveAgents(data) {
    return data.agents?.filter(agent => agent.status === 'active').length || 0;
  }

  calculateCostPerInteraction(data) {
    const totalCost = data.costs?.total || 0;
    const totalInteractions = this.calculateTotalInteractions(data);
    return totalInteractions > 0 ? Math.round((totalCost / totalInteractions) * 100) / 100 : 0;
  }

  calculateFCR(data) {
    const firstContact = data.resolutions?.firstContact || 0;
    const total = data.resolutions?.total || 1;
    return Math.round((firstContact / total) * 100 * 10) / 10;
  }

  calculateRetentionRate(data) {
    const retained = data.customers?.retained || 0;
    const total = data.customers?.total || 1;
    return Math.round((retained / total) * 100 * 10) / 10;
  }

  calculateAgentUtilization(data) {
    const activeTime = data.agents?.reduce((sum, agent) => sum + (agent.activeTime || 0), 0) || 0;
    const totalTime = data.agents?.reduce((sum, agent) => sum + (agent.totalTime || 1), 0) || 1;
    return Math.round((activeTime / totalTime) * 100 * 10) / 10;
  }

  calculateEscalationRate(data) {
    const escalated = data.escalations?.count || 0;
    const total = this.calculateTotalInteractions(data);
    return total > 0 ? Math.round((escalated / total) * 100 * 10) / 10 : 0;
  }

  // ==================== TIME SERIES DATA ====================

  async getTimeSeriesData(dateRange, metric, granularity = 'day', channels = []) {
    const cacheKey = `timeseries-${metric}-${granularity}-${dateRange.start}-${dateRange.end}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest('/analytics/timeseries', {
        method: 'POST',
        body: JSON.stringify({
          startDate: format(dateRange.start, 'yyyy-MM-dd'),
          endDate: format(dateRange.end, 'yyyy-MM-dd'),
          metric,
          granularity,
          channels
        })
      });

      const timeSeriesData = this.processTimeSeriesData(response.data, granularity);
      this.cache.set(cacheKey, timeSeriesData);
      
      setTimeout(() => this.cache.delete(cacheKey), 3 * 60 * 1000);
      
      return timeSeriesData;
    } catch (error) {
      console.error('Time series fetch error:', error);
      return this.getMockTimeSeriesData(dateRange, granularity);
    }
  }

  processTimeSeriesData(rawData, granularity) {
    return rawData.map(point => ({
      date: this.formatDateByGranularity(point.timestamp, granularity),
      timestamp: point.timestamp,
      value: point.value || 0,
      interactions: point.interactions || 0,
      satisfaction: point.satisfaction || 0,
      responseTime: point.responseTime || 0,
      cost: point.cost || 0
    }));
  }

  formatDateByGranularity(timestamp, granularity) {
    const date = new Date(timestamp);
    switch (granularity) {
      case 'hour':
        return format(date, 'HH:mm');
      case 'day':
        return format(date, 'MM/dd');
      case 'week':
        return format(date, 'MMM dd');
      case 'month':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MM/dd');
    }
  }

  // ==================== CHANNEL ANALYTICS ====================

  async getChannelDistribution(dateRange) {
    try {
      const response = await this.makeRequest('/analytics/channels', {
        method: 'POST',
        body: JSON.stringify({
          startDate: format(dateRange.start, 'yyyy-MM-dd'),
          endDate: format(dateRange.end, 'yyyy-MM-dd')
        })
      });

      return this.processChannelData(response.data);
    } catch (error) {
      console.error('Channel distribution fetch error:', error);
      return this.getMockChannelData();
    }
  }

  processChannelData(rawData) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
    
    return rawData.map((channel, index) => ({
      name: channel.name,
      value: channel.interactions || 0,
      percentage: channel.percentage || 0,
      color: colors[index % colors.length],
      avgResponseTime: channel.avgResponseTime || '0:00',
      satisfaction: channel.satisfaction || 0,
      cost: channel.cost || 0
    }));
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  async getPredictiveInsights(dateRange, channels = []) {
    try {
      const response = await this.makeRequest('/analytics/predictions', {
        method: 'POST',
        body: JSON.stringify({
          startDate: format(dateRange.start, 'yyyy-MM-dd'),
          endDate: format(dateRange.end, 'yyyy-MM-dd'),
          channels
        })
      });

      return this.processPredictiveData(response.data);
    } catch (error) {
      console.error('Predictive analytics fetch error:', error);
      return this.getMockPredictiveData();
    }
  }

  processPredictiveData(rawData) {
    return {
      demandForecast: rawData.demandForecast || [],
      optimalStaffing: rawData.optimalStaffing || {},
      channelRecommendations: rawData.channelRecommendations || [],
      costOptimizations: rawData.costOptimizations || [],
      satisfactionPredictions: rawData.satisfactionPredictions || []
    };
  }

  // ==================== REPORT GENERATION ====================

  async generateReport(reportConfig) {
    try {
      const response = await this.makeRequest('/analytics/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          title: reportConfig.title,
          dateRange: {
            start: format(reportConfig.dateRange.start, 'yyyy-MM-dd'),
            end: format(reportConfig.dateRange.end, 'yyyy-MM-dd')
          },
          metrics: reportConfig.metrics,
          channels: reportConfig.channels,
          chartTypes: reportConfig.chartTypes,
          format: reportConfig.format
        })
      });

      return response.data;
    } catch (error) {
      console.error('Report generation error:', error);
      return this.generateMockReport(reportConfig);
    }
  }

  // ==================== REAL-TIME UPDATES ====================

  subscribeToRealTimeUpdates(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcastUpdate(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== MOCK DATA GENERATORS ====================

  getMockKPIData() {
    return {
      totalInteractions: Math.floor(Math.random() * 50000) + 100000,
      avgResponseTime: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      customerSatisfaction: Math.round((Math.random() * 15 + 85) * 10) / 10,
      resolutionRate: Math.round((Math.random() * 20 + 80) * 10) / 10,
      activeAgents: Math.floor(Math.random() * 100) + 50,
      costPerInteraction: Math.round((Math.random() * 5 + 2) * 100) / 100,
      firstContactResolution: Math.round((Math.random() * 15 + 75) * 10) / 10,
      customerRetention: Math.round((Math.random() * 10 + 85) * 10) / 10,
      agentUtilization: Math.round((Math.random() * 20 + 70) * 10) / 10,
      escalationRate: Math.round((Math.random() * 5 + 2) * 10) / 10
    };
  }

  getMockTimeSeriesData(dateRange, granularity) {
    const data = [];
    const diffDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= diffDays; i++) {
      const date = subDays(dateRange.end, diffDays - i);
      data.push({
        date: this.formatDateByGranularity(date, granularity),
        timestamp: date.toISOString(),
        value: Math.floor(Math.random() * 5000) + 8000,
        interactions: Math.floor(Math.random() * 1000) + 500,
        satisfaction: Math.floor(Math.random() * 20) + 80,
        responseTime: Math.floor(Math.random() * 180) + 60,
        cost: Math.floor(Math.random() * 2000) + 1000
      });
    }
    
    return data;
  }

  getMockChannelData() {
    const channels = ['Voice', 'Email', 'Chat', 'SMS', 'WhatsApp', 'Social Media', 'Mobile App', 'Web Portal'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
    
    return channels.map((channel, index) => ({
      name: channel,
      value: Math.floor(Math.random() * 10000) + 5000,
      percentage: Math.round(Math.random() * 30 + 10),
      color: colors[index % colors.length],
      avgResponseTime: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      satisfaction: Math.round((Math.random() * 15 + 85) * 10) / 10,
      cost: Math.round((Math.random() * 3 + 2) * 100) / 100
    }));
  }

  getMockPredictiveData() {
    return {
      demandForecast: Array.from({ length: 7 }, (_, i) => ({
        day: format(subDays(new Date(), -i), 'MM/dd'),
        predicted: Math.floor(Math.random() * 2000) + 8000,
        confidence: Math.round((Math.random() * 20 + 80) * 10) / 10
      })),
      optimalStaffing: {
        morning: Math.floor(Math.random() * 20) + 30,
        afternoon: Math.floor(Math.random() * 25) + 45,
        evening: Math.floor(Math.random() * 15) + 25
      },
      channelRecommendations: [
        { channel: 'Chat', action: 'increase capacity', impact: '+15% efficiency' },
        { channel: 'Email', action: 'add automation', impact: '-12% response time' },
        { channel: 'Voice', action: 'skill-based routing', impact: '+8% satisfaction' }
      ],
      costOptimizations: [
        { area: 'Self-service deflection', potential: '$2,400/month' },
        { area: 'Agent schedule optimization', potential: '$1,800/month' },
        { area: 'Channel routing optimization', potential: '$1,200/month' }
      ]
    };
  }

  generateMockReport(config) {
    return {
      id: `report_${Date.now()}`,
      title: config.title || 'Analytics Report',
      generatedAt: new Date().toISOString(),
      format: config.format,
      downloadUrl: '#',
      preview: 'Report generated successfully with mock data'
    };
  }

  // ==================== DATA EXPORT ====================

  exportData(data, format = 'csv') {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      case 'excel':
        return this.exportToExcel(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    return csvContent;
  }

  exportToJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  exportToExcel(data) {
    // Mock Excel export - in real implementation, use a library like xlsx
    console.log('Excel export would be implemented with xlsx library');
    return data;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsAPIService();

export default analyticsService;
export { AnalyticsAPIService };
