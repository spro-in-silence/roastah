const CACHE_NAME = 'roastah-v1.0.0';
const STATIC_CACHE_NAME = 'roastah-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'roastah-dynamic-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/home',
  '/auth',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add font files
  '/fonts/KeepCalm-Medium.ttf'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  '/api/products',
  '/api/auth/user',
  '/api/config',
  '/api/notifications'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default to network-first for everything else
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy with cache fallback
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Cache-first strategy with network fallback
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
    console.error('Service Worker: Failed to fetch', request.url, error);
    throw error;
  }
}

// Navigation strategy with offline fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, showing offline page');
    return caches.match('/offline') || new Response('Offline');
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return pathname.includes('.') && (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf')
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
  
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart data when network is available
async function syncCart() {
  try {
    // This would sync any pending cart changes
    console.log('Service Worker: Syncing cart data');
    // Implementation would depend on your cart sync logic
  } catch (error) {
    console.error('Service Worker: Cart sync failed', error);
  }
}

// Sync order data when network is available
async function syncOrders() {
  try {
    // This would sync any pending order changes
    console.log('Service Worker: Syncing order data');
    // Implementation would depend on your order sync logic
  } catch (error) {
    console.error('Service Worker: Order sync failed', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new updates on Roastah!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Roastah';
  }

  event.waitUntil(
    self.registration.showNotification('Roastah', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/home')
    );
  }
});

// Handle app install prompt
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('Service Worker: Before install prompt');
  // This would be handled by the main app
});

// Handle app installation
self.addEventListener('appinstalled', (event) => {
  console.log('Service Worker: App installed');
  // Track installation analytics
});

// Handle network status changes
self.addEventListener('online', (event) => {
  console.log('Service Worker: Network online');
  // Trigger background sync for pending data
});

self.addEventListener('offline', (event) => {
  console.log('Service Worker: Network offline');
  // Prepare for offline mode
});