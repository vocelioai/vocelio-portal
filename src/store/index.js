// ===== COPILOT PROMPT #2: Redux Store Configuration =====
// Enhanced Redux Store with RTK Query Integration
// Includes middleware, dev tools, and performance optimization

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import omnichannelApiSlice from './omnichannelApiSlice';

// Enhanced store configuration for omnichannel features
export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [omnichannelApiSlice.reducerPath]: omnichannelApiSlice.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Enhanced serializable check for better performance
      serializableCheck: {
        ignoredActions: [
          // Ignore RTK Query action types that contain non-serializable data
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        ignoredPaths: ['socket', 'api.queries'],
      },
      // Enhanced immutability check
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(
      // Add RTK Query middleware
      omnichannelApiSlice.middleware
    ),
  
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Vocelio Omnichannel Store',
    trace: true,
    traceLimit: 25,
  },
  
  // Preloaded state for better UX
  preloadedState: {
    // Can add initial state here if needed
  },
});

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
