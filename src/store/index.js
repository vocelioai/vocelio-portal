// ===== COPILOT PROMPT #8: Integration & Deployment Setup - Redux Store =====
// Complete Redux Toolkit store with persistence, RTK Query, and deployment configuration

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createSlice } from '@reduxjs/toolkit';
import { getCurrentConfig } from '../config/environment';
import omnichannelApiSlice from './omnichannelApiSlice';

// API Configuration
const config = getCurrentConfig();

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
  [omnichannelApiSlice.reducerPath]: omnichannelApiSlice.reducer,
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
    }).concat(omnichannelApiSlice.middleware),
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

// Export auth actions
export const { setCredentials, logout } = authSlice.actions;
export const { toggleSidebar, setCurrentView, addNotification, removeNotification } = uiSlice.actions;

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
