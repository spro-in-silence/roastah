import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isStandalone: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isStandalone: false,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Check if app is already installed
    const isInstalled = localStorage.getItem('pwa-installed') === 'true' || isStandalone;

    setState(prev => ({
      ...prev,
      isStandalone,
      isInstalled,
    }));

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));
    };

    // Handle app installation
    const handleAppInstalled = () => {
      console.log('PWA: App installed');
      localStorage.setItem('pwa-installed', 'true');
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Handle network status changes
    const handleOnline = () => {
      console.log('PWA: Network online');
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      console.log('PWA: Network offline');
      setState(prev => ({ ...prev, isOffline: true }));
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('PWA: Update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: New content available');
                  // Could show update notification here
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed', error);
        });
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!state.installPrompt) return false;

    try {
      await state.installPrompt.prompt();
      const result = await state.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        setState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install prompt failed', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setState(prev => ({
      ...prev,
      isInstallable: false,
      installPrompt: null,
    }));
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('PWA: Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Show local notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  };

  // Check if device supports PWA features
  const getPWACapabilities = () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement,
      orientation: 'orientation' in screen,
      vibrate: 'vibrate' in navigator,
    };
  };

  return {
    ...state,
    installApp,
    dismissInstallPrompt,
    requestNotificationPermission,
    showNotification,
    capabilities: getPWACapabilities(),
  };
}

// Hook for detecting mobile devices
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletDevice = /iPad|Android(?!.*Mobile)/i.test(userAgent) || 
                            (window.innerWidth >= 768 && window.innerWidth <= 1024);
      
      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);
      setIsDesktop(!isMobileDevice && !isTabletDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isMobile || isTablet,
  };
}