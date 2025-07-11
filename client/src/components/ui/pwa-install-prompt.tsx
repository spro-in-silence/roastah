import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWA, useMobileDetection } from "@/hooks/usePWA";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp, dismissInstallPrompt } = usePWA();
  const { isMobile, isTablet } = useMobileDetection();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show prompt after a delay if installable and not already installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    dismissInstallPrompt();
  };

  // Don't show if not installable, already installed, or previously dismissed
  if (!isInstallable || isInstalled || hasBeenDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="bg-white shadow-2xl border-2 border-roastah-yellow/20 animate-in slide-in-from-bottom-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isMobile || isTablet ? (
                <Smartphone className="w-5 h-5 text-roastah-yellow" />
              ) : (
                <Monitor className="w-5 h-5 text-roastah-yellow" />
              )}
              <CardTitle className="text-lg">Install <span className="text-yellow-400 italic">α</span>-roastah</CardTitle>
              <Badge variant="secondary" className="text-xs">PWA</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            Get the full app experience with offline access and notifications
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Offline browsing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Push notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fast loading</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Home screen icon</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-roastah-yellow hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-4"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for navbar
export function PWAInstallButton() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      size="sm"
      className="bg-roastah-yellow hover:bg-yellow-500 text-gray-900 font-semibold"
    >
      <Download className="w-4 h-4 mr-2" />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  );
}