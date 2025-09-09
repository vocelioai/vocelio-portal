// ===== COPILOT PROMPT #2: Enhanced API Services & Hooks =====
// RTK Query API Slice for Omnichannel Hub Integration
// Includes advanced caching, error handling, and real-time sync

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Enhanced API configuration with intelligent caching
const omnichannelApiSlice = createApi({
  reducerPath: 'omnichannelApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://omnichannel-hub-313373223340.us-central1.run.app',
    prepareHeaders: (headers, { getState }) => {
      // Add authentication if available
      const token = getState()?.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
    // Enhanced error handling
    validateStatus: (response, result) => {
      return response.status >= 200 && response.status < 300;
    },
  }),
  
  // Tag system for cache invalidation
  tagTypes: [
    'Channel',
    'Session', 
    'Analytics',
    'Customer',
    'Campaign',
    'Integration',
    'Notification',
    'SystemHealth'
  ],

  endpoints: (builder) => ({
    
    // ===== CHANNEL MANAGEMENT =====
    
    // Get all channel integrations with enhanced caching
    getChannelIntegrations: builder.query({
      query: () => '/channels/integrations',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Channel', id })),
              { type: 'Channel', id: 'LIST' }
            ]
          : [{ type: 'Channel', id: 'LIST' }],
      keepUnusedDataFor: 300, // 5 minutes cache
      transformResponse: (response) => {
        // Ensure consistent data structure
        if (Array.isArray(response)) return response;
        if (response?.channels) return response.channels;
        if (response?.data) return response.data;
        return [];
      }
    }),

    // Configure channel with optimistic updates
    configureChannel: builder.mutation({
      query: ({ channelType, config }) => ({
        url: `/channels/${channelType}/configure`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: [{ type: 'Channel', id: 'LIST' }],
      // Optimistic update
      async onQueryStarted({ channelType, config }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          omnichannelApiSlice.util.updateQueryData('getChannelIntegrations', undefined, (draft) => {
            const channel = draft.find(c => c.type === channelType);
            if (channel) {
              Object.assign(channel, { ...channel, ...config, status: 'configuring' });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    // Get channel status with real-time updates
    getChannelStatus: builder.query({
      query: (channelType) => `/channels/${channelType}/status`,
      providesTags: (result, error, channelType) => [{ type: 'Channel', id: channelType }],
      pollingInterval: 30000, // Poll every 30 seconds
    }),

    // ===== SESSION MANAGEMENT =====

    // Get active sessions with enhanced error handling
    getActiveSessions: builder.query({
      query: () => '/sessions/active',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ session_id }) => ({ type: 'Session', id: session_id })),
              { type: 'Session', id: 'LIST' }
            ]
          : [{ type: 'Session', id: 'LIST' }],
      transformResponse: (response) => {
        // Normalize session data
        if (Array.isArray(response)) return response;
        if (response?.sessions) return response.sessions;
        if (response?.data) return response.data;
        return [];
      },
      keepUnusedDataFor: 60, // 1 minute cache for real-time data
    }),

    // Create new session
    createSession: builder.mutation({
      query: (sessionData) => ({
        url: '/sessions/create',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    // Update session with optimistic updates
    updateSession: builder.mutation({
      query: ({ sessionId, updates }) => ({
        url: `/sessions/${sessionId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Session', id: sessionId },
        { type: 'Session', id: 'LIST' }
      ],
      // Optimistic update
      async onQueryStarted({ sessionId, updates }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          omnichannelApiSlice.util.updateQueryData('getActiveSessions', undefined, (draft) => {
            const session = draft.find(s => s.session_id === sessionId);
            if (session) {
              Object.assign(session, updates);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    // Transfer session between channels
    transferSession: builder.mutation({
      query: ({ sessionId, fromChannel, toChannel, transferData }) => ({
        url: `/sessions/${sessionId}/transfer`,
        method: 'POST',
        body: { from_channel: fromChannel, to_channel: toChannel, ...transferData },
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }, { type: 'Channel', id: 'LIST' }],
    }),

    // ===== ANALYTICS & REPORTING =====

    // Get dashboard analytics with background refresh
    getDashboardAnalytics: builder.query({
      query: (timeRange = '24h') => `/analytics/dashboard?range=${timeRange}`,
      providesTags: ['Analytics'],
      keepUnusedDataFor: 120, // 2 minutes cache
      transformResponse: (response) => {
        // Provide fallback analytics structure
        const defaultAnalytics = {
          totalSessions: 0,
          activeChannels: 0,
          responseTime: 0,
          satisfactionScore: 0,
          channelMetrics: {},
          trends: []
        };
        return { ...defaultAnalytics, ...response };
      }
    }),

    // Get channel performance metrics
    getChannelPerformance: builder.query({
      query: ({ channelType, timeRange = '7d' }) => 
        `/analytics/channel-performance?channel=${channelType}&range=${timeRange}`,
      providesTags: (result, error, { channelType }) => [
        { type: 'Analytics', id: `performance-${channelType}` }
      ],
    }),

    // Get customer satisfaction metrics
    getCustomerSatisfaction: builder.query({
      query: (filters = {}) => ({
        url: '/analytics/customer-satisfaction',
        params: filters,
      }),
      providesTags: ['Analytics'],
      pollingInterval: 300000, // Poll every 5 minutes
    }),

    // ===== CUSTOMER MANAGEMENT =====

    // Get customer profile with session history
    getCustomerProfile: builder.query({
      query: (customerId) => `/customers/${customerId}/profile`,
      providesTags: (result, error, customerId) => [{ type: 'Customer', id: customerId }],
      keepUnusedDataFor: 600, // 10 minutes cache for customer data
    }),

    // Get customer interaction history
    getCustomerHistory: builder.query({
      query: ({ customerId, limit = 50 }) => 
        `/customers/${customerId}/history?limit=${limit}`,
      providesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: `history-${customerId}` }
      ],
    }),

    // Update customer profile
    updateCustomerProfile: builder.mutation({
      query: ({ customerId, updates }) => ({
        url: `/customers/${customerId}/profile`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customer', id: customerId }
      ],
    }),

    // ===== CAMPAIGN INTEGRATION =====

    // Get campaign omnichannel data
    getCampaignOmnichannelData: builder.query({
      query: (campaignId) => `/campaigns/${campaignId}/omnichannel`,
      providesTags: (result, error, campaignId) => [{ type: 'Campaign', id: campaignId }],
    }),

    // Update campaign channel settings
    updateCampaignChannels: builder.mutation({
      query: ({ campaignId, channelSettings }) => ({
        url: `/campaigns/${campaignId}/channels`,
        method: 'PUT',
        body: channelSettings,
      }),
      invalidatesTags: (result, error, { campaignId }) => [
        { type: 'Campaign', id: campaignId }
      ],
    }),

    // ===== NOTIFICATIONS =====

    // Get notifications with real-time updates
    getNotifications: builder.query({
      query: ({ limit = 20, unreadOnly = false }) => 
        `/notifications?limit=${limit}&unread_only=${unreadOnly}`,
      providesTags: ['Notification'],
      pollingInterval: 10000, // Poll every 10 seconds
    }),

    // Mark notification as read
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // ===== SYSTEM HEALTH =====

    // Get system health status
    getSystemHealth: builder.query({
      query: () => '/health',
      providesTags: ['SystemHealth'],
      pollingInterval: 60000, // Poll every minute
      transformResponse: (response) => ({
        status: 'healthy',
        services: {},
        uptime: 0,
        ...response
      }),
    }),

    // Get system capabilities
    getSystemCapabilities: builder.query({
      query: () => '/capabilities',
      providesTags: ['SystemHealth'],
      keepUnusedDataFor: 3600, // 1 hour cache for rarely changing data
    }),

    // ===== INTEGRATION MANAGEMENT =====

    // Get integration status
    getIntegrationStatus: builder.query({
      query: () => '/integrations/status',
      providesTags: ['Integration'],
      pollingInterval: 120000, // Poll every 2 minutes
    }),

    // Test integration connectivity
    testIntegration: builder.mutation({
      query: ({ integrationType, config }) => ({
        url: `/integrations/${integrationType}/test`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['Integration'],
    }),

  }),
});

// Export hooks for components
export const {
  // Channel hooks
  useGetChannelIntegrationsQuery,
  useConfigureChannelMutation,
  useGetChannelStatusQuery,
  
  // Session hooks
  useGetActiveSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useTransferSessionMutation,
  
  // Analytics hooks
  useGetDashboardAnalyticsQuery,
  useGetChannelPerformanceQuery,
  useGetCustomerSatisfactionQuery,
  
  // Customer hooks
  useGetCustomerProfileQuery,
  useGetCustomerHistoryQuery,
  useUpdateCustomerProfileMutation,
  
  // Campaign hooks
  useGetCampaignOmnichannelDataQuery,
  useUpdateCampaignChannelsMutation,
  
  // Notification hooks
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  
  // System hooks
  useGetSystemHealthQuery,
  useGetSystemCapabilitiesQuery,
  
  // Integration hooks
  useGetIntegrationStatusQuery,
  useTestIntegrationMutation,
  
} = omnichannelApiSlice;

export default omnichannelApiSlice;
