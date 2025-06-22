import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DollarSign, ShoppingCart, Package, Star, Plus, TrendingUp, BarChart3, Upload, Settings, MessageSquare, ShoppingBag, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import SellerAnalyticsDashboard from "@/components/seller-analytics-dashboard";
import BulkProductUpload from "@/components/bulk-product-upload";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function SellerDashboard() {
  const { isAuthenticated, isLoading, isRoaster } = useUser();
  const { toast } = useToast();
  
  // Dashboard customization state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  
  // Default layout configuration
  const defaultLayouts = useMemo(() => ({
    lg: [
      { i: 'overview', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'actions', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'analytics', x: 0, y: 4, w: 12, h: 6, minW: 8, minH: 4 },
      { i: 'recent-products', x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
      { i: 'recent-orders', x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
      { i: 'bulk-upload', x: 0, y: 15, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'add-product', x: 6, y: 15, w: 6, h: 4, minW: 4, minH: 3 }
    ],
    md: [
      { i: 'overview', x: 0, y: 0, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'actions', x: 5, y: 0, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'analytics', x: 0, y: 4, w: 10, h: 6, minW: 6, minH: 4 },
      { i: 'recent-products', x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
      { i: 'recent-orders', x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
      { i: 'bulk-upload', x: 0, y: 15, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'add-product', x: 5, y: 15, w: 5, h: 4, minW: 3, minH: 3 }
    ],
    sm: [
      { i: 'overview', x: 0, y: 0, w: 6, h: 4, minW: 6, minH: 3 },
      { i: 'actions', x: 0, y: 4, w: 6, h: 4, minW: 6, minH: 3 },
      { i: 'analytics', x: 0, y: 8, w: 6, h: 6, minW: 6, minH: 4 },
      { i: 'recent-products', x: 0, y: 14, w: 6, h: 5, minW: 6, minH: 4 },
      { i: 'recent-orders', x: 0, y: 19, w: 6, h: 5, minW: 6, minH: 4 },
      { i: 'bulk-upload', x: 0, y: 24, w: 6, h: 4, minW: 6, minH: 3 },
      { i: 'add-product', x: 0, y: 28, w: 6, h: 4, minW: 6, minH: 3 }
    ]
  }), []);
  
  // Initialize layouts from localStorage or use defaults
  useEffect(() => {
    const savedLayouts = localStorage.getItem('seller-dashboard-layouts');
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch {
        setLayouts(defaultLayouts);
      }
    } else {
      setLayouts(defaultLayouts);
    }
  }, [defaultLayouts]);
  
  // Save layouts to localStorage
  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
    localStorage.setItem('seller-dashboard-layouts', JSON.stringify(layouts));
  };
  
  // Reset to default layout
  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.setItem('seller-dashboard-layouts', JSON.stringify(defaultLayouts));
    toast({
      title: "Layout Reset",
      description: "Dashboard layout has been reset to default.",
    });
  };

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
    queryKey: ['/api/roaster/products'],
    retry: false,
    enabled: isAuthenticated && isRoaster,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/roaster/orders'],
    retry: false,
    enabled: isAuthenticated && isRoaster,
  });

  // Calculate stats
  const productList = Array.isArray(products) ? products : [];
  const orderList = Array.isArray(orders) ? orders : [];
  const totalProducts = productList.length;
  const totalOrders = orderList.length;
  const totalRevenue = orderList.reduce((sum: number, order: any) => sum + parseFloat(order.price || 0), 0);
  const averageRating = 4.8; // This would come from actual reviews

  // Get recent orders (last 3)
  const recentOrders = orderList.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    );
  }

  if (!isRoaster) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your roastery operations and track performance.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isCustomizing ? "default" : "outline"}
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex items-center gap-2"
            >
              <Move className="h-4 w-4" />
              {isCustomizing ? "Save Layout" : "Customize"}
            </Button>
            {isCustomizing && (
              <Button
                variant="outline"
                onClick={resetLayout}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={60}
          isDraggable={isCustomizing}
          isResizable={isCustomizing}
          compactType="vertical"
          preventCollision={false}
          autoSize={true}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {/* Business Overview */}
          <Card key="overview" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
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
          <Card key="actions" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/seller/products">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/seller/orders">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
              </Link>
              <Link href="/seller/messages">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <div key="analytics" className={`${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <SellerAnalyticsDashboard roasterId={1} />
          </div>

          {/* Recent Products */}
          <Card key="recent-products" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Recent Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No products yet. Create your first product!</p>
              ) : (
                <div className="space-y-3">
                  {productList.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                      <Badge variant="outline">{product.origin}</Badge>
                    </div>
                  ))}
                  <Link href="/seller/products">
                    <Button variant="outline" className="w-full mt-3">
                      View All Products
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card key="recent-orders" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet. Your first sale is coming!</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Order #{order.id}</h4>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.price}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                  <Link href="/seller/orders">
                    <Button variant="outline" className="w-full mt-3">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Product Upload */}
          <Card key="bulk-upload" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Bulk Product Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BulkProductUpload roasterId={1} />
            </CardContent>
          </Card>

          {/* Add New Product */}
          <Card key="add-product" className={`h-full ${isCustomizing ? 'ring-2 ring-blue-200 cursor-move' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">Quickly add a new coffee product to your inventory.</p>
              <Link href="/seller/products/new">
                <Button className="bg-roastah-teal text-white hover:bg-roastah-dark-teal">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        </ResponsiveGridLayout>
      </div>

      <Footer />
    </div>
  );
}