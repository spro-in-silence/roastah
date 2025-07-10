import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, ShoppingBag, Package, Terminal, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { CoffeeRoasterLoader } from "@/components/ui/coffee-roaster-loader";

export default function DevLogin() {
  // Simplified environment detection - all development environments work the same
  const isReplit = window.location.hostname.includes('replit.dev');
  const isLocal = window.location.hostname === 'localhost';
  const isCloudRunDev = window.location.hostname.includes('run.app');
  const isDevelopment = isReplit || isLocal || isCloudRunDev;
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    console.log('DevLogin: Environment check - isReplit:', isReplit, 'isLocal:', isLocal, 'isCloudRunDev:', isCloudRunDev);
    console.log('DevLogin: isDevelopment:', isDevelopment);
    
    // Only allow access in development environments
    if (!isDevelopment) {
      console.log('DevLogin: Production environment - redirecting to home');
      navigate('/');
      return;
    }
    
    // Require authentication to access dev-login
    if (!authLoading && !user) {
      console.log('DevLogin: Not authenticated - redirecting to auth', { user, authLoading });
      navigate('/auth');
      return;
    }
    
    console.log('DevLogin: User state:', { user: user?.id, authLoading });
  }, [isDevelopment, navigate, isReplit, isLocal, isCloudRunDev, authLoading, user]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CoffeeRoasterLoader className="w-8 h-8" />
      </div>
    );
  }

  // Add logout function for testing
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleValidateImpersonation = async () => {
    try {
      const response = await fetch('/api/dev/validate-impersonation');
      const data = await response.json();
      
      console.log('🔍 Impersonation Validation Results:', data);
      
      toast({
        title: "Validation Results",
        description: `Environment: ${Object.entries(data.environment).filter(([k,v]) => v).map(([k]) => k).join(', ')}. Check console for details.`,
      });
    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: "Validation Failed",
        description: "Could not validate impersonation setup",
        variant: "destructive",
      });
    }
  };

  const handleImpersonate = async (userType: 'buyer' | 'seller') => {
    setIsLoading(true);
    try {
      // Use standard session-based authentication for all environments
      const response = await fetch('/api/dev/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({ userType }),
      });

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in first to access impersonation features",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Impersonation request failed');
      }

      const data = await response.json();
      if (data.success) {
        // Only invalidate user-specific queries, not all data
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        
        // Wait a moment for the context to update after cache invalidation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast({
          title: "Success",
          description: `Now impersonating ${userType}`,
        });
        
        // Navigate to appropriate dashboard
        if (userType === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/home'); // Navigate to buyer home instead of landing page
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to impersonate user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to impersonation service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show impersonation interface in development environments
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              Development Access Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              This page is only available in development environments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Terminal className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Development Console
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose your role to access the Roastah marketplace
            </p>
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 rounded-lg inline-block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Environment: {isReplit ? 'Replit' : isLocal ? 'Local' : 'Cloud Run Dev'}
              </span>
            </div>
          </div>

          {/* Impersonation Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Buyer Card */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Buyer Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Experience the marketplace as a coffee enthusiast
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Browse and purchase coffee</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Manage cart and orders</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Review products and roasters</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleImpersonate('buyer')}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Switching...' : 'Impersonate Buyer'}
                </Button>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-green-900 dark:text-green-100">
                  Seller Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Manage your roastery business and products
                  </p>
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Manage product catalog</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Process orders and payments</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>View analytics and reports</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleImpersonate('seller')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? 'Switching...' : 'Impersonate Seller'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Development environment active. All data is for testing purposes only.
            </p>
          </div>
          
          {/* Debug/Logout Section */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={handleValidateImpersonation}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Validate Impersonation Setup
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                Logout (for testing auth protection)
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current user: {user?.id || 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}