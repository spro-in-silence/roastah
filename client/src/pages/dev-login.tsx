import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, ShoppingBag, Package, Terminal, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DevLogin() {
  // Initialize based on environment detection
  const isReplit = window.location.hostname.includes('replit.dev');
  const isLocal = window.location.hostname === 'localhost';
  const isDevelopment = isReplit || isLocal;
  const skipADC = isDevelopment;
  
  const [hasADC, setHasADC] = useState(skipADC);
  const [isCheckingADC, setIsCheckingADC] = useState(!skipADC);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('DevLogin: Environment check - isReplit:', isReplit, 'isLocal:', isLocal, 'hostname:', window.location.hostname);
    
    // Check for Google OAuth callback
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = urlParams.get('id_token');
    if (idToken) {
      localStorage.setItem('google_oauth_token', idToken);
      // Clean the URL
      window.history.replaceState({}, document.title, '/dev-login');
      // Restart the ADC check with the new token
      setTimeout(() => checkADCCredentials(), 100);
      return;
    }
    
    if (skipADC) {
      console.log('DevLogin: Development environment - skipping ADC check');
    } else {
      // Small delay for external environments
      const timer = setTimeout(() => {
        console.log('DevLogin: Running ADC check for external environment');
        checkADCCredentials();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [skipADC, isReplit, isLocal]);

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
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <p className="mb-4">
                This development interface is only available in development environments.
              </p>
              <p className="text-sm">
                Please use the main authentication system in production.
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Return to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkADCCredentials = async () => {
    setIsCheckingADC(true);
    try {
      // Direct fetch with timeout for localhost
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // In development, the frontend runs on port 5173 but backend runs on port 5000
      const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
      const apiUrl = isDev ? 'http://localhost:5000/api/dev/check-adc' : '/api/dev/check-adc';
      
      // For Cloud Run, try to get Google OAuth token
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Check if we're on Cloud Run and need authentication
      if (!isLocal && !isReplit) {
        const googleToken = localStorage.getItem('google_oauth_token');
        if (googleToken) {
          headers['Authorization'] = `Bearer ${googleToken}`;
        }
      }
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ADC check response:', data);
        
        // Handle authorization responses
        if (data.requiresAuth) {
          // Need to authenticate with Google
          initiateGoogleAuth();
          return;
        } else if (data.unauthorized) {
          setHasADC(false);
          toast({
            title: "Access Denied",
            description: "Your email is not authorized for development access",
            variant: "destructive",
          });
          return;
        } else if (data.authError) {
          setHasADC(false);
          toast({
            title: "Authentication Error", 
            description: "Please sign in with Google to access development features",
            variant: "destructive",
          });
          return;
        }
        
        setHasADC(data.hasCredentials);
      } else {
        console.log('ADC check failed with status:', response.status);
        setHasADC(false);
      }
    } catch (error: any) {
      console.log('ADC check failed or timed out:', error?.name || error?.message || error);
      setHasADC(false);
    } finally {
      setIsCheckingADC(false);
    }
  };

  const initiateGoogleAuth = () => {
    // Redirect to Google OAuth
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';
    const redirectUri = window.location.origin + '/dev-login';
    const scope = 'openid email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=id_token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `nonce=${Date.now()}`;
    
    window.location.href = authUrl;
  };

  const handleImpersonate = async (userType: 'buyer' | 'seller') => {
    setIsLoading(true);
    try {
      // For Cloud Run, include auth header if available
      const googleToken = localStorage.getItem('google_oauth_token');
      let headers: Record<string, string> = {};
      
      if (!isLocal && !isReplit && googleToken) {
        headers['Authorization'] = `Bearer ${googleToken}`;
      }
      
      const response = await fetch('/api/dev/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ userType }),
      });

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please authenticate with Google to access impersonation",
          variant: "destructive",
        });
        initiateGoogleAuth();
        return;
      }

      if (response.status === 403) {
        toast({
          title: "Access Denied", 
          description: "Your email is not authorized for development access",
          variant: "destructive",
        });
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
        
        toast({
          title: "Success",
          description: `Now impersonating ${userType}`,
        });
        
        // Navigate to appropriate dashboard
        if (userType === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        throw new Error('Impersonation failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  if (isCheckingADC) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-roastah-teal rounded-full flex items-center justify-center mb-4">
              <Coffee className="h-6 w-6 text-white animate-spin" />
            </div>
            <CardTitle className="text-2xl">Checking Credentials</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Verifying Google Cloud credentials...
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!hasADC) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Google Cloud Credentials Required</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Please authenticate with Google Cloud to access development tools
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                Required Commands
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    1. Authenticate your Google Cloud account:
                  </p>
                  <code className="block bg-black text-green-400 p-2 rounded text-sm">
                    gcloud auth login
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    2. Set up application default credentials:
                  </p>
                  <code className="block bg-black text-green-400 p-2 rounded text-sm">
                    gcloud auth application-default login
                  </code>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={checkADCCredentials}
                className="bg-roastah-teal hover:bg-roastah-dark-teal"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Credentials Again
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              This page is only available in development environments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-roastah-teal rounded-full flex items-center justify-center mb-6">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Roastah Development Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a user type to impersonate for testing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Impersonation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Test as Buyer</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Browse products, add to cart, place orders
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Features to test:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Browse coffee products</li>
                    <li>Add items to cart</li>
                    <li>Checkout process</li>
                    <li>Order tracking</li>
                    <li>Favorites & wishlist</li>
                  </ul>
                </div>
              </div>
              <Button 
                onClick={() => handleImpersonate('buyer')}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? 'Setting up...' : 'Impersonate Buyer'}
              </Button>
            </CardContent>
          </Card>

          {/* Seller Impersonation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Test as Seller</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Manage products, view orders, handle business
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Features to test:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Product management</li>
                    <li>Order processing</li>
                    <li>Analytics dashboard</li>
                    <li>Bulk uploads</li>
                    <li>Customer messages</li>
                  </ul>
                </div>
              </div>
              <Button 
                onClick={() => handleImpersonate('seller')}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isLoading ? 'Setting up...' : 'Impersonate Seller'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Development environment only • Not available in production
          </p>
        </div>
      </div>
    </div>
  );
}