// ===== COPILOT PROMPT #7: Mobile PWA Service Worker =====
// Progressive Web App service worker for offline functionality and caching

const CACHE_NAME = 'vocelio-omnichannel-v1.0.0';
const API_CACHE_NAME = 'vocelio-api-v1.0.0';
const STATIC_CACHE_NAME = 'vocelio-static-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/dashboard',
  '/dashboard/omnichannel',
  '/offline.html',
  // Add critical CSS and JS files
  '/static/css/main.css',
  '/static/js/main.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard/stats',
  '/api/sessions/active',
  '/api/channels/status',
  '/api/analytics/metrics'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients to start controlling them immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Handle static assets with cache-first strategy
  else if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Handle all other requests with stale-while-revalidate strategy
  else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline',
        cached: false
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset:', request.url);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline queue from IndexedDB
    const offlineQueue = await getOfflineQueue();
    
    for (const queueItem of offlineQueue) {
      try {
        await fetch(queueItem.url, {
          method: queueItem.method,
          headers: queueItem.headers,
          body: queueItem.body
        });
        
        // Remove from queue on success
        await removeFromOfflineQueue(queueItem.id);
        
        // Notify clients of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            data: queueItem
          });
        });
        
      } catch (error) {
        console.log('Service Worker: Failed to sync item:', queueItem.id);
      }
    }
  } catch (error) {
    console.log('Service Worker: Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new updates in your omnichannel dashboard',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Dashboard',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const notificationData = event.data.json();
    options.body = notificationData.body || options.body;
    options.data = { ...options.data, ...notificationData };
  }
  
  event.waitUntil(
    self.registration.showNotification('Vocelio Omnichannel', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard/omnichannel')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'QUEUE_REQUEST') {
    event.waitUntil(queueOfflineRequest(event.data.request));
  }
});

// Helper functions for IndexedDB operations
async function getOfflineQueue() {
  // Implement IndexedDB operations for offline queue
  // This would typically use IndexedDB API
  return [];
}

async function removeFromOfflineQueue(id) {
  // Remove item from IndexedDB offline queue
  console.log('Removing from offline queue:', id);
}

async function queueOfflineRequest(requestData) {
  // Add request to IndexedDB offline queue
  console.log('Queueing offline request:', requestData);
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshCriticalData());
  }
});

async function refreshCriticalData() {
  try {
    // Refresh critical dashboard data in background
    const criticalEndpoints = [
      '/api/dashboard/stats',
      '/api/sessions/active',
      '/api/notifications/unread'
    ];
    
    await Promise.all(
      criticalEndpoints.map(endpoint =>
        fetch(endpoint).then(response => {
          if (response.ok) {
            const cache = caches.open(API_CACHE_NAME);
            cache.then(c => c.put(endpoint, response.clone()));
          }
          return response;
        })
      )
    );
    
    console.log('Service Worker: Critical data refreshed');
  } catch (error) {
    console.log('Service Worker: Failed to refresh critical data:', error);
  }
}
