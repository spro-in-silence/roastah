import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DevLogin() {
  const [devKey, setDevKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDevAuth = async () => {
    if (devKey !== "roastah-dev-2025") {
      toast({
        title: "Invalid key",
        description: "Please enter the correct development key",
        variant: "destructive",
      });
      return;
    }
    setIsAuthenticated(true);
  };

  const handleImpersonate = async (userType: 'buyer' | 'seller') => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/dev/impersonate", { userType });

      if (response.success) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-roastah-teal rounded-full flex items-center justify-center mb-4">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Roastah Development</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the development key to access impersonation tools
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Development key"
                value={devKey}
                onChange={(e) => setDevKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDevAuth()}
              />
            </div>
            <Button 
              onClick={handleDevAuth}
              className="w-full bg-roastah-teal hover:bg-roastah-dark-teal"
            >
              Access Development Tools
            </Button>
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