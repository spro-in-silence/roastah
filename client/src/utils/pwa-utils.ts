// PWA Utility Functions

// Check if device is iOS
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Check if device is Android
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

// Check if app is running in standalone mode
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
}

// Check if app is installable
export function isInstallable(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const userAgent = navigator.userAgent;
  
  if (/Mobi|Android/i.test(userAgent)) {
    return 'mobile';
  } else if (/iPad|Tablet/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Get network information
export function getNetworkInfo(): {
  online: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    type: connection?.type,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

// Add to home screen prompt
export function addToHomeScreen(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isIOS()) {
      // iOS specific instructions
      const instructions = [
        'To add this app to your home screen:',
        '1. Tap the Share button at the bottom of the screen',
        '2. Scroll down and tap "Add to Home Screen"',
        '3. Tap "Add" to confirm',
      ];
      
      alert(instructions.join('\n'));
      resolve(true);
    } else {
      // Android and other platforms
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (e as any).prompt();
        (e as any).userChoice.then((choiceResult: any) => {
          resolve(choiceResult.outcome === 'accepted');
        });
      });
    }
  });
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('Service Worker unregistered');
        return true;
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
  return false;
}

// Check for app updates
export async function checkForUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return registration.waiting !== null;
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }
  return false;
}

// Apply app update
export async function applyUpdate(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

// Clear app cache
export async function clearCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('App cache cleared');
  }
}

// Get app version
export function getAppVersion(): string {
  return process.env.REACT_APP_VERSION || '1.0.0';
}

// Get app build info
export function getBuildInfo(): {
  version: string;
  buildDate: string;
  environment: string;
} {
  return {
    version: getAppVersion(),
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
}

// Check if feature is supported
export function isFeatureSupported(feature: string): boolean {
  const features: { [key: string]: boolean } = {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    notifications: 'Notification' in window,
    webShare: 'share' in navigator,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    vibration: 'vibrate' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    orientation: 'orientation' in screen,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    paymentRequest: 'PaymentRequest' in window,
    webBluetooth: 'bluetooth' in navigator,
    webNFC: 'nfc' in navigator,
    webUSB: 'usb' in navigator,
    webVR: 'getVRDisplays' in navigator,
    webXR: 'xr' in navigator,
  };
  
  return features[feature] || false;
}

// PWA installation analytics
export function trackPWAInstallation(): void {
  // Track installation event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_install', {
      event_category: 'PWA',
      event_label: 'App Installed',
      value: 1
    });
  }
  
  // Store installation timestamp
  localStorage.setItem('pwa_installed_at', new Date().toISOString());
}

// PWA usage analytics
export function trackPWAUsage(): void {
  const isStandaloneMode = isStandalone();
  const deviceType = getDeviceType();
  const networkInfo = getNetworkInfo();
  
  // Track usage metrics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_usage', {
      event_category: 'PWA',
      event_label: `${deviceType}_${isStandaloneMode ? 'standalone' : 'browser'}`,
      custom_parameters: {
        device_type: deviceType,
        standalone_mode: isStandaloneMode,
        network_type: networkInfo.effectiveType,
        online: networkInfo.online,
      }
    });
  }
}

// Share content using Web Share API
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  } else {
    // Fallback to clipboard
    if (data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
  }
  return false;
}

// Request permissions
export async function requestPermissions(): Promise<{
  notifications: boolean;
  geolocation: boolean;
  camera: boolean;
  microphone: boolean;
}> {
  const permissions = {
    notifications: false,
    geolocation: false,
    camera: false,
    microphone: false,
  };
  
  // Request notification permission
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    permissions.notifications = permission === 'granted';
  }
  
  // Request geolocation permission
  if ('geolocation' in navigator) {
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      permissions.geolocation = true;
    } catch (error) {
      permissions.geolocation = false;
    }
  }
  
  // Request camera/microphone permissions
  if ('mediaDevices' in navigator) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      permissions.camera = true;
      permissions.microphone = true;
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      permissions.camera = false;
      permissions.microphone = false;
    }
  }
  
  return permissions;
}