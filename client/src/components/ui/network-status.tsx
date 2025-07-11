import { useEffect, useState } from "react";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export function NetworkStatus() {
  const { isOffline } = usePWA();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setHasBeenOffline(true);
      setShowOfflineAlert(true);
    } else if (hasBeenOffline) {
      // Show brief "back online" message
      setShowOfflineAlert(true);
      const timer = setTimeout(() => {
        setShowOfflineAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, hasBeenOffline]);

  const handleDismiss = () => {
    setShowOfflineAlert(false);
  };

  if (!showOfflineAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Alert className={`${
        isOffline 
          ? 'bg-red-50 border-red-200 text-red-800' 
          : 'bg-green-50 border-green-200 text-green-800'
      } shadow-lg`}>
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
          <AlertDescription className="flex-1">
            {isOffline ? (
              <span>
                You're offline. Some features may be limited.
              </span>
            ) : (
              <span>
                Connection restored! You're back online.
              </span>
            )}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </Alert>
    </div>
  );
}

// Inline network status indicator
export function NetworkStatusIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
      <WifiOff className="w-3 h-3" />
      <span>Offline</span>
    </div>
  );
}