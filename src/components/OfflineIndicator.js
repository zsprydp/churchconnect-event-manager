import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Bell, Settings } from 'lucide-react';
import pwaManager from '../pwa.js';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    // Listen for PWA events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = () => setCanInstall(true);
    const handleInstallAccepted = () => setCanInstall(false);
    const handleNotificationPermission = (e) => setNotificationPermission(e.detail.permission);

    window.addEventListener('pwa:online', handleOnline);
    window.addEventListener('pwa:offline', handleOffline);
    window.addEventListener('pwa:install-prompt-available', handleInstallPrompt);
    window.addEventListener('pwa:install-accepted', handleInstallAccepted);
    window.addEventListener('pwa:notification-permission', handleNotificationPermission);

    // Check initial states
    setCanInstall(pwaManager.canInstall());
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Get cache size
    updateCacheSize();

    return () => {
      window.removeEventListener('pwa:online', handleOnline);
      window.removeEventListener('pwa:offline', handleOffline);
      window.removeEventListener('pwa:install-prompt-available', handleInstallPrompt);
      window.removeEventListener('pwa:install-accepted', handleInstallAccepted);
      window.removeEventListener('pwa:notification-permission', handleNotificationPermission);
    };
  }, []);

  const updateCacheSize = async () => {
    try {
      const size = await pwaManager.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  };

  const handleInstall = async () => {
    try {
      await pwaManager.showInstallPrompt();
    } catch (error) {
      console.error('Failed to show install prompt:', error);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await pwaManager.requestNotificationPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await pwaManager.clearCache();
      await updateCacheSize();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isOnline && !canInstall && notificationPermission === 'granted') {
    return null; // Don't show anything when everything is optimal
  }

  return (
    <div className={`offline-indicator ${!isOnline ? 'offline' : ''}`}>
      {/* Offline Status */}
      {!isOnline && (
        <div className="offline-status">
          <WifiOff size={16} />
          <span>You're offline. Some features may be limited.</span>
        </div>
      )}

      {/* Install Prompt */}
      {canInstall && (
        <div className="install-prompt">
          <Download size={16} />
          <span>Install ChurchConnect for a better experience</span>
          <button onClick={handleInstall} className="install-btn">
            Install
          </button>
        </div>
      )}

      {/* Notification Permission */}
      {notificationPermission !== 'granted' && (
        <div className="notification-prompt">
          <Bell size={16} />
          <span>Enable notifications to stay updated</span>
          <button onClick={handleNotificationPermission} className="notification-btn">
            Enable
          </button>
        </div>
      )}

      {/* Cache Info */}
      <div className="cache-info">
        <Settings size={16} />
        <span>Cache: {formatBytes(cacheSize)}</span>
        <button onClick={handleClearCache} className="clear-cache-btn" title="Clear cache">
          Clear
        </button>
      </div>

      {/* Online Status */}
      {isOnline && (
        <div className="online-status">
          <Wifi size={16} />
          <span>Online</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
