import { useState } from "react";
import { Smartphone, Monitor, Wifi, Bell, Download, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { usePWA, useMobileDetection } from "@/hooks/usePWA";
import { PWAFeatures } from "@/components/ui/pwa-features";
import { useToast } from "@/hooks/use-toast";

export default function PWASettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isInstallable, 
    isInstalled, 
    isOffline, 
    isStandalone, 
    installApp, 
    capabilities,
    requestNotificationPermission,
    showNotification
  } = usePWA();
  const { isMobile, isTablet, isDesktop } = useMobileDetection();

  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed",
        description: "Roastah has been installed to your device",
      });
    }
  };

  const handleUpdateApp = () => {
    // Force reload to get latest version
    window.location.reload();
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      toast({
        title: "Cache Cleared",
        description: "App cache has been cleared",
      });
    }
  };

  const getDeviceInfo = () => {
    return {
      type: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
      userAgent: navigator.userAgent,
      online: !isOffline,
      standalone: isStandalone,
      installed: isInstalled,
      installable: isInstallable,
    };
  };

  const deviceInfo = getDeviceInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PWA Settings</h1>
              <p className="text-gray-600">Manage your progressive web app experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* App Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>App Status</span>
                </CardTitle>
                <CardDescription>
                  Current status of your PWA installation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm">Installed</span>
                    {isInstalled && <Badge variant="secondary">✓</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isStandalone ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm">Standalone Mode</span>
                    {isStandalone && <Badge variant="secondary">✓</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${!isOffline ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">Online</span>
                    {isOffline && <Badge variant="destructive">Offline</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${capabilities.serviceWorker ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm">Service Worker</span>
                    {capabilities.serviceWorker && <Badge variant="secondary">Active</Badge>}
                  </div>
                </div>

                <Separator />

                {/* Installation */}
                {isInstallable && !isInstalled && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Install App</p>
                      <p className="text-sm text-gray-600">Add to home screen for quick access</p>
                    </div>
                    <Button onClick={handleInstallApp}>
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </div>
                )}

                {/* Update Available */}
                {updateAvailable && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Update Available</p>
                      <p className="text-sm text-gray-600">A new version is ready to install</p>
                    </div>
                    <Button onClick={handleUpdateApp}>
                      <Download className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>
                )}

                {/* Clear Cache */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-gray-600">Remove stored data and force refresh</p>
                  </div>
                  <Button variant="outline" onClick={clearCache}>
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PWA Features */}
            <Card>
              <CardHeader>
                <CardTitle>App Features</CardTitle>
                <CardDescription>
                  Configure your progressive web app experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PWAFeatures />
              </CardContent>
            </Card>
          </div>

          {/* Device Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  <span>Device Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge variant="outline">{deviceInfo.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={deviceInfo.online ? "default" : "destructive"}>
                    {deviceInfo.online ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Installed</span>
                  <Badge variant={deviceInfo.installed ? "default" : "secondary"}>
                    {deviceInfo.installed ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Installable</span>
                  <Badge variant={deviceInfo.installable ? "default" : "secondary"}>
                    {deviceInfo.installable ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Capabilities</CardTitle>
                <CardDescription>
                  Supported features on your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(capabilities).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant={value ? "default" : "secondary"}>
                        {value ? "✓" : "✗"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/offline')}
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Test Offline Mode
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (capabilities.notifications) {
                      showNotification('Test Notification', {
                        body: 'PWA notifications are working!',
                      });
                    }
                  }}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notifications
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  App Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}