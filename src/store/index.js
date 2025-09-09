// ===== COPILOT PROMPT #8: Integration & Deployment Setup - Redux Store =====
// Complete Redux Toolkit store with persistence, RTK Query, and deployment configuration

import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createSlice } from '@reduxjs/toolkit';
import { getCurrentConfig } from '../config/environment';

// API Configuration
const config = getCurrentConfig();

// Base Query with Authentication
const baseQuery = fetchBaseQuery({
  baseUrl: config.OMNICHANNEL_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Add authentication token
    const token = getState()?.auth?.token || localStorage.getItem('vocelio_auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Add API key
    headers.set('x-api-key', process.env.REACT_APP_OMNICHANNEL_API_KEY || 'dev_api_key');
    headers.set('content-type', 'application/json');
    headers.set('x-app-version', '1.0.0');
    return headers;
  },
});

// Base Query with Retry Logic and Token Refresh
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle token refresh on 401
  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { 
          refreshToken: localStorage.getItem('vocelio_refresh_token') 
        }
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      localStorage.setItem('vocelio_auth_token', refreshResult.data.token);
      api.dispatch(authSlice.actions.setCredentials(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(authSlice.actions.logout());
      window.location.href = '/auth/login';
    }
  }
  
  return result;
};

// Enhanced RTK Query API
export const omnichannelApi = createApi({
  reducerPath: 'omnichannelApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'Sessions', 'Analytics', 'Channels', 'Customers', 
    'Campaigns', 'Automation', 'Templates', 'Reports'
  ],
  endpoints: (builder) => ({
    // Session Management
    getSessions: builder.query({
      query: (params = {}) => ({
        url: '/sessions',
        params: { page: 1, limit: 50, status: 'active', ...params }
      }),
      providesTags: ['Sessions'],
      pollingInterval: 5000,
    }),
    
    // Analytics
    getDashboardStats: builder.query({
      query: (timeframe = '24h') => `/analytics/dashboard?timeframe=${timeframe}`,
      providesTags: ['Analytics'],
      pollingInterval: 30000,
    }),
    
    // Campaign Management  
    launchOmnichannelCampaign: builder.mutation({
      query: (campaignConfig) => ({
        url: '/campaigns/omnichannel-launch',
        method: 'POST',
        body: campaignConfig,
      }),
      invalidatesTags: ['Campaigns'],
    }),
  }),
});

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, permissions } = action.payload;
      state.user = user;
      state.token = token;
      state.permissions = permissions || [];
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.isAuthenticated = false;
      localStorage.removeItem('vocelio_auth_token');
      localStorage.removeItem('vocelio_refresh_token');
    },
  },
});

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    currentView: 'dashboard',
    theme: 'light',
    notifications: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({ id: Date.now(), ...action.payload });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

// Persistence Configuration
const persistConfig = {
  key: 'vocelio-omnichannel',
  storage,
  whitelist: ['auth', 'ui'],
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  ui: uiSlice.reducer,
  [omnichannelApi.reducerPath]: omnichannelApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(omnichannelApi.middleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Vocelio Omnichannel Store',
    trace: true,
    traceLimit: 25,
  },
});

export const persistor = persistStore(store);

// Enable refetch on focus/reconnect behaviors  
setupListeners(store.dispatch);

// Enhanced store types for TypeScript (if using TypeScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// Store subscription utilities
export const subscribeToStore = (callback) => store.subscribe(callback);
export const getStoreState = () => store.getState();

// Performance monitoring utilities
export const monitorStorePerformance = () => {
  if (process.env.NODE_ENV === 'development') {
    let actionCount = 0;
    let startTime = Date.now();
    
    return store.subscribe(() => {
      actionCount++;
      const currentTime = Date.now();
      
      // Log performance metrics every 100 actions
      if (actionCount % 100 === 0) {
        const duration = currentTime - startTime;
        console.log(`🚀 Store Performance: ${actionCount} actions in ${duration}ms`);
        startTime = currentTime;
        actionCount = 0;
      }
    });
  }
  return () => {}; // No-op in production
};

// Cache management utilities
export const invalidateAllQueries = () => {
  store.dispatch(omnichannelApiSlice.util.invalidateTags(['Channel', 'Session', 'Analytics']));
};

export const resetApiState = () => {
  store.dispatch(omnichannelApiSlice.util.resetApiState());
};

// Memory management for long-running sessions
export const cleanupUnusedQueries = () => {
  const queries = store.getState()[omnichannelApiSlice.reducerPath].queries;
  const unusedQueries = Object.keys(queries).filter(key => {
    const query = queries[key];
    return query && query.lastUsed && (Date.now() - query.lastUsed) > 300000; // 5 minutes
  });
  
  if (unusedQueries.length > 0) {
    console.log(`🧹 Cleaning up ${unusedQueries.length} unused queries`);
    unusedQueries.forEach(queryKey => {
      store.dispatch(omnichannelApiSlice.util.removeQueryResult({ 
        queryCacheKey: queryKey 
      }));
    });
  }
};

// Auto cleanup interval (runs every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(cleanupUnusedQueries, 300000);
}

export default store;
