/**
 * Production Analytics Service
 * Connects to real-time monitoring and analytics microservices
 */

export class AnalyticsService {
  constructor() {
    this.analyticsURL = import.meta.env.VITE_ANALYTICS_SERVICE_URL || 'https://analytics-service-313373223340.us-central1.run.app';
    this.advancedAnalyticsURL = import.meta.env.VITE_ADVANCED_ANALYTICS_URL || 'https://advanced-analytics-313373223340.us-central1.run.app';
    this.realtimeMonitoringURL = import.meta.env.VITE_REAL_TIME_MONITORING_URL || 'https://real-time-monitoring-313373223340.us-central1.run.app';
  }

  // Helper method for authenticated API calls
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // 📊 REAL-TIME DASHBOARD ANALYTICS
  async getDashboardStats() {
    try {
      return await this.makeRequest(`${this.realtimeMonitoringURL}/api/dashboard/stats`);
    } catch (error) {
      console.error('❌ Dashboard Stats Error:', error);
      throw error;
    }
  }

  async getLiveCallsData() {
    try {
      return await this.makeRequest(`${this.realtimeMonitoringURL}/api/calls/live`);
    } catch (error) {
      console.error('❌ Live Calls Data Error:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      return await this.makeRequest(`${this.realtimeMonitoringURL}/api/system/health`);
    } catch (error) {
      console.error('❌ System Health Error:', error);
      throw error;
    }
  }

  // 📈 CAMPAIGN ANALYTICS
  async getCampaignAnalytics(campaignId, timeRange = '7d') {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/campaigns/${campaignId}/analytics?timeRange=${timeRange}`);
    } catch (error) {
      console.error('❌ Campaign Analytics Error:', error);
      throw error;
    }
  }

  async getCampaignPerformance(options = {}) {
    try {
      const queryParams = new URLSearchParams(options);
      return await this.makeRequest(`${this.analyticsURL}/api/campaigns/performance?${queryParams}`);
    } catch (error) {
      console.error('❌ Campaign Performance Error:', error);
      throw error;
    }
  }

  // 🎯 ADVANCED ANALYTICS
  async getConversionFunnels(campaignId) {
    try {
      return await this.makeRequest(`${this.advancedAnalyticsURL}/api/funnels/${campaignId}`);
    } catch (error) {
      console.error('❌ Conversion Funnels Error:', error);
      throw error;
    }
  }

  async getCustomerJourney(customerId) {
    try {
      return await this.makeRequest(`${this.advancedAnalyticsURL}/api/journey/${customerId}`);
    } catch (error) {
      console.error('❌ Customer Journey Error:', error);
      throw error;
    }
  }

  async getPredictiveInsights(dataType, timeRange) {
    try {
      return await this.makeRequest(`${this.advancedAnalyticsURL}/api/insights/predictive`, {
        method: 'POST',
        body: JSON.stringify({ dataType, timeRange })
      });
    } catch (error) {
      console.error('❌ Predictive Insights Error:', error);
      throw error;
    }
  }

  // 📞 CALL ANALYTICS
  async getCallAnalytics(options = {}) {
    try {
      const queryParams = new URLSearchParams(options);
      return await this.makeRequest(`${this.analyticsURL}/api/calls/analytics?${queryParams}`);
    } catch (error) {
      console.error('❌ Call Analytics Error:', error);
      throw error;
    }
  }

  async getVoiceQualityMetrics(callId) {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/calls/${callId}/quality`);
    } catch (error) {
      console.error('❌ Voice Quality Metrics Error:', error);
      throw error;
    }
  }

  // 💰 REVENUE ANALYTICS
  async getRevenueAnalytics(timeRange = '30d') {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/revenue?timeRange=${timeRange}`);
    } catch (error) {
      console.error('❌ Revenue Analytics Error:', error);
      throw error;
    }
  }

  async getROIAnalysis(campaignId) {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/campaigns/${campaignId}/roi`);
    } catch (error) {
      console.error('❌ ROI Analysis Error:', error);
      throw error;
    }
  }

  // 📊 USAGE ANALYTICS
  async getUsageMetrics(timeRange = '30d') {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/usage?timeRange=${timeRange}`);
    } catch (error) {
      console.error('❌ Usage Metrics Error:', error);
      throw error;
    }
  }

  async getAPIUsage(timeRange = '7d') {
    try {
      return await this.makeRequest(`${this.analyticsURL}/api/usage/api?timeRange=${timeRange}`);
    } catch (error) {
      console.error('❌ API Usage Error:', error);
      throw error;
    }
  }

  // 🔄 REAL-TIME UPDATES
  async subscribeToRealtimeUpdates(eventTypes, callback) {
    try {
      const wsUrl = this.realtimeMonitoringURL.replace('https://', 'wss://');
      const ws = new WebSocket(`${wsUrl}/ws/analytics`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          events: eventTypes,
          token: localStorage.getItem('access_token'),
          tenantId: localStorage.getItem('tenant_id')
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
      };
      
      return ws;
    } catch (error) {
      console.error('❌ WebSocket Subscription Error:', error);
      throw error;
    }
  }

  // 📝 CUSTOM REPORTS
  async generateCustomReport(reportConfig) {
    try {
      return await this.makeRequest(`${this.advancedAnalyticsURL}/api/reports/custom`, {
        method: 'POST',
        body: JSON.stringify(reportConfig)
      });
    } catch (error) {
      console.error('❌ Custom Report Error:', error);
      throw error;
    }
  }

  async getReportStatus(reportId) {
    try {
      return await this.makeRequest(`${this.advancedAnalyticsURL}/api/reports/${reportId}/status`);
    } catch (error) {
      console.error('❌ Report Status Error:', error);
      throw error;
    }
  }

  async downloadReport(reportId, format = 'pdf') {
    try {
      const response = await fetch(`${this.advancedAnalyticsURL}/api/reports/${reportId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Tenant-ID': localStorage.getItem('tenant_id') || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Report download error: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('❌ Report Download Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;