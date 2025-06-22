import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Package, Star, Plus, TrendingUp, BarChart3, Upload, Settings, MessageSquare, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import SellerAnalyticsDashboard from "@/components/seller-analytics-dashboard";
import BulkProductUpload from "@/components/bulk-product-upload";

export default function SellerDashboard() {
  const { isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
      return;
    }

    if (!isLoading && isAuthenticated && !isRoaster) {
      toast({
        title: "Access Denied",
        description: "You need to be a roaster to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [isAuthenticated, isLoading, isRoaster, toast]);

  // Fetch data
  const { data: products = [], error: productsError } = useQuery({
    queryKey: ['/api/roaster/products'],
    enabled: isAuthenticated && isRoaster,
  });

  const { data: orders = [], error: ordersError } = useQuery({
    queryKey: ['/api/roaster/orders'],
    enabled: isAuthenticated && isRoaster,
  });

  // Handle authentication errors
  useEffect(() => {
    if (productsError && isUnauthorizedError(productsError)) {
      window.location.href = "/api/login";
    }
    if (ordersError && isUnauthorizedError(ordersError)) {
      window.location.href = "/api/login";
    }
  }, [productsError, ordersError]);

  // Calculate stats
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) : 0;
  const activeProducts = totalProducts; // Assuming all products are active for now
  const averageRating = 4.5; // This would come from reviews in a real app
  // Get recent orders (last 3)
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 3) : [];

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isRoaster) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Manage your roastery operations and track performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Business Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-roastah-teal" />
              Business Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
              <Badge variant="outline">${totalRevenue.toFixed(2)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Products</span>
              <Badge variant="outline">{totalProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Orders</span>
              <Badge variant="outline">{totalOrders}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Rating</span>
              <Badge variant="default">{averageRating}/5</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link to="/seller/products">
              <Button className="w-full h-20 flex flex-col gap-2 bg-white border-2 border-roastah-teal text-roastah-teal hover:bg-roastah-light-teal">
                <Package className="h-6 w-6" />
                <span className="text-sm font-medium">Manage Products</span>
              </Button>
            </Link>
            <Link to="/seller/orders">
              <Button className="w-full h-20 flex flex-col gap-2 bg-white border-2 border-roastah-teal text-roastah-teal hover:bg-roastah-light-teal">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm font-medium">View Orders</span>
              </Button>
            </Link>
            <Link to="/seller/messages">
              <Button className="w-full h-20 flex flex-col gap-2 bg-white border-2 border-roastah-teal text-roastah-teal hover:bg-roastah-light-teal">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm font-medium">Messages</span>
              </Button>
            </Link>
            <Link to="/seller/profile">
              <Button className="w-full h-20 flex flex-col gap-2 bg-white border-2 border-roastah-teal text-roastah-teal hover:bg-roastah-light-teal">
                <Settings className="h-6 w-6" />
                <span className="text-sm font-medium">Settings</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <SellerAnalyticsDashboard roasterId={1} />
        </TabsContent>

        <TabsContent value="recent-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-roastah-teal" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/seller/orders">
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Orders will appear here once customers start purchasing your products.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-upload">
          <BulkProductUpload roasterId={1} />
        </TabsContent>
      </Tabs>

      {/* Get Started Section - Only show if no products */}
      {totalProducts === 0 && (
        <Card className="bg-gradient-to-r from-roastah-light-teal to-roastah-teal text-white">
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Plus className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Selling Your Coffee</h3>
              <p className="text-roastah-warm-gray mb-6">
                Add your first product to start connecting with coffee enthusiasts
              </p>
              <Link to="/seller/products/new">
                <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}