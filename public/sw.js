const STATIC_CACHE = 'churchconnect-static-v1';
const DYNAMIC_CACHE = 'churchconnect-dynamic-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - cache-first for static, network-first for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from ChurchConnect',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'View', icon: '/logo192.png' },
      { action: 'close', title: 'Close', icon: '/logo192.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ChurchConnect', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
