// PWA Service Worker Registration and Utilities
class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.serviceWorker = null;
    this.init();
  }

  async init() {
    this.setupOnlineOfflineListeners();
    await this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.dispatchEvent('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.dispatchEvent('offline');
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', this.serviceWorker);

        // Handle service worker updates
        this.serviceWorker.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorker.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.dispatchEvent('sw-update-available');
            }
          });
        });

        // Handle service worker state changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.dispatchEvent('sw-controller-change');
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.dispatchEvent('install-prompt-available');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.dispatchEvent('app-installed');
    });
  }

  async showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      
      if (outcome === 'accepted') {
        this.dispatchEvent('install-accepted');
      } else {
        this.dispatchEvent('install-rejected');
      }
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.dispatchEvent('notification-permission', { permission });
      return permission;
    }
    return 'denied';
  }

  async subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      this.dispatchEvent('push-subscription', { subscription });
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(`pwa:${eventName}`, {
      detail: { ...detail, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  // Utility methods
  isOnline() {
    return this.isOnline;
  }

  getServiceWorker() {
    return this.serviceWorker;
  }

  canInstall() {
    return !!this.deferredPrompt;
  }

  // Cache management
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      this.dispatchEvent('cache-cleared');
    }
  }

  async getCacheSize() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    }
    return 0;
  }
}

// Create global instance
const pwaManager = new PWAManager();

// Export for use in components
export default pwaManager;

// Export individual methods for convenience
export const {
  showInstallPrompt,
  requestNotificationPermission,
  subscribeToPushNotifications,
  clearCache,
  getCacheSize,
  isOnline,
  canInstall
} = pwaManager;
