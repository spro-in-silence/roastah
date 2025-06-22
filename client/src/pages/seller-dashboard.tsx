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
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect if not a roaster
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRoaster) {
      toast({
        title: "Access Denied",
        description: "You need to be a roaster to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/become-roastah";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, isRoaster, toast]);

  const { data: products = [] } = useQuery({
    queryKey: ["/api/roaster/products"],
    enabled: isAuthenticated && isRoaster,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/roaster/orders"],
    enabled: isAuthenticated && isRoaster,
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.price || 0), 0);
  const averageRating = 4.8; // This would come from actual reviews

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

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
            <CardContent className="space-y-3">
              <Link to="/seller/products/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link to="/seller/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Manage Orders
                </Button>
              </Link>
              <Link to="/seller/messages" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Link to="/seller/orders">
                  <Button variant="ghost" className="text-roastah-teal hover:text-roastah-dark-teal text-sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-roastah-warm-gray">No orders yet</p>
                  <p className="text-sm text-roastah-warm-gray mt-1">
                    Orders will appear here once customers start buying your products
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Order #{order.id}</p>
                        <p className="text-xs text-roastah-warm-gray">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${parseFloat(order.price || 0).toFixed(2)}</p>
                        <Badge
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-roastah-warm-gray">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Analytics Coming Soon</p>
                  <p className="text-sm">Detailed sales analytics and insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-roastah-teal/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-roastah-teal" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Product</h3>
              <p className="text-sm text-roastah-warm-gray mb-4">Create a new coffee product</p>
              <Link to="/seller/products/new">
                <Button variant="outline" size="sm" className="w-full">
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Send Message</h3>
              <p className="text-sm text-roastah-warm-gray mb-4">Message your customers</p>
              <Link to="/seller/messages">
                <Button variant="outline" size="sm" className="w-full">
                  Compose Message
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
              <p className="text-sm text-roastah-warm-gray mb-4">Track your performance</p>
              <Button variant="outline" size="sm" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {totalProducts === 0 && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
