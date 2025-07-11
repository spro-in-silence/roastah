import { useState, useEffect } from "react";
import { Bell, Download, Share2, Camera, Mic, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePWA } from "@/hooks/usePWA";

// PWA Feature Settings Component
export function PWAFeatures() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const { requestNotificationPermission, showNotification, capabilities } = usePWA();
  const { toast } = useToast();

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Check if background sync is supported
    if (capabilities.backgroundSync) {
      setBackgroundSync(true);
    }

    // Check if service worker is active
    if (capabilities.serviceWorker) {
      setOfflineMode(true);
    }
  }, [capabilities]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        showNotification('Notifications Enabled', {
          body: 'You\'ll now receive updates about your coffee orders and new roaster products!',
          icon: '/icons/icon-192x192.png',
        });
        toast({
          title: "Notifications Enabled",
          description: "You'll receive updates about orders and new products",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications",
      });
    }
  };

  const testNotification = () => {
    if (notificationsEnabled) {
      showNotification('Test Notification', {
        body: 'This is a test notification from Roastah!',
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'α-roastah - Premium Coffee Marketplace',
          text: 'Discover amazing coffee roasters and premium beans',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied",
        description: "App link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Stay updated with order status and new coffee releases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Push Notifications</Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          {notificationsEnabled && (
            <Button onClick={testNotification} variant="outline" size="sm">
              Test Notification
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Offline Features</span>
          </CardTitle>
          <CardDescription>
            Access your data even without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${offlineMode ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">Offline Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${backgroundSync ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">Background Sync</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• View previously loaded products</p>
            <p>• Access order history</p>
            <p>• Browse cached content</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share App</span>
          </CardTitle>
          <CardDescription>
            Share Roastah with fellow coffee enthusiasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={shareApp} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share App
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Capabilities</CardTitle>
          <CardDescription>
            Available features on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Bell className={`w-4 h-4 ${capabilities.notifications ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className={`w-4 h-4 ${capabilities.serviceWorker ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Offline Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Share2 className={`w-4 h-4 ${capabilities.webShare ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Web Share</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className={`w-4 h-4 ${capabilities.fullscreen ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Fullscreen</span>
            </div>
            <div className="flex items-center space-x-2">
              <Vibrate className={`w-4 h-4 ${capabilities.vibrate ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Vibration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mic className={`w-4 h-4 ${capabilities.orientation ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Orientation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick PWA actions component
export function PWAQuickActions() {
  const { showNotification, capabilities } = usePWA();
  const { toast } = useToast();

  const actions = [
    {
      icon: Bell,
      label: 'Test Notification',
      action: () => {
        if (capabilities.notifications && Notification.permission === 'granted') {
          showNotification('Quick Action Test', {
            body: 'This is a quick test notification!',
          });
        } else {
          toast({
            title: "Notifications Not Available",
            description: "Please enable notifications first",
            variant: "destructive",
          });
        }
      },
      available: capabilities.notifications,
    },
    {
      icon: Share2,
      label: 'Share',
      action: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Check out this coffee!',
              url: window.location.href,
            });
          } catch (error) {
            console.log('Share cancelled');
          }
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link Copied",
            description: "Page link copied to clipboard",
          });
        }
      },
      available: capabilities.webShare || !!navigator.clipboard,
    },
    {
      icon: Vibrate,
      label: 'Vibrate',
      action: () => {
        if (capabilities.vibrate) {
          navigator.vibrate([200, 100, 200]);
        } else {
          toast({
            title: "Vibration Not Available",
            description: "Your device doesn't support vibration",
            variant: "destructive",
          });
        }
      },
      available: capabilities.vibrate,
    },
  ];

  return (
    <div className="flex space-x-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={action.action}
          disabled={!action.available}
          className="flex items-center space-x-1"
        >
          <action.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}