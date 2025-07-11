import { useEffect, useState } from "react";
import { Coffee, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoffeeRoasterLoader } from "@/components/ui/coffee-roaster-loader";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically redirect when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Test connectivity
      await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      // If successful, redirect to home
      window.location.href = '/';
    } catch (error) {
      // Still offline, show feedback
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-roastah-brown via-roastah-brown/90 to-roastah-brown/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-roastah-yellow rounded-full flex items-center justify-center">
            {isOnline ? (
              <Wifi className="w-8 h-8 text-gray-900" />
            ) : (
              <WifiOff className="w-8 h-8 text-gray-900" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isOnline 
              ? 'Great! You\'re back online. Redirecting you now...'
              : 'No internet connection available. Some features may be limited.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {isOnline ? (
            <div className="space-y-4">
              <CoffeeRoasterLoader className="w-12 h-12 mx-auto" />
              <p className="text-sm text-gray-600">
                Reconnecting to Roastah...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <Coffee className="w-8 h-8 text-roastah-brown mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">Offline Features Available</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View previously loaded products</li>
                  <li>• Browse cached coffee information</li>
                  <li>• Review your order history</li>
                  <li>• Access your profile settings</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-roastah-yellow hover:bg-yellow-500 text-gray-900 font-semibold"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Continue Offline
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Coffee className="w-3 h-3 mr-1" />
              <span className="text-yellow-400 italic">α</span>-roastah • Coffee Marketplace
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}