import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Target
} from 'lucide-react';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data for demonstration
  const platformStats = {
    totalUsers: 12547,
    activeUsers: 8934,
    totalSellers: 456,
    activeSellers: 298,
    totalProducts: 3456,
    activeProducts: 2987,
    totalOrders: 15670,
    totalRevenue: 1247589.50,
    avgOrderValue: 79.65,
    conversionRate: 3.4
  };

  const revenueData = [
    { month: 'Jan', revenue: 85000, orders: 1100, users: 850 },
    { month: 'Feb', revenue: 92000, orders: 1200, users: 920 },
    { month: 'Mar', revenue: 78000, orders: 980, users: 780 },
    { month: 'Apr', revenue: 115000, orders: 1450, users: 1150 },
    { month: 'May', revenue: 128000, orders: 1600, users: 1280 },
    { month: 'Jun', revenue: 142000, orders: 1780, users: 1420 }
  ];

  const topProducts = [
    {
      name: 'Ethiopian Single Origin',
      seller: 'Mountain View Roasters',
      sales: 342,
      revenue: 12876.50,
      rating: 4.8
    },
    {
      name: 'Colombian Dark Roast',
      seller: 'Artisan Coffee Co.',
      sales: 298,
      revenue: 10456.80,
      rating: 4.6
    },
    {
      name: 'Brazilian Medium Roast',
      seller: 'Highland Beans',
      sales: 276,
      revenue: 9234.60,
      rating: 4.7
    },
    {
      name: 'Costa Rican Light Roast',
      seller: 'Pacific Roasters',
      sales: 245,
      revenue: 8967.25,
      rating: 4.5
    }
  ];

  const topSellers = [
    {
      name: 'Mountain View Roasters',
      products: 45,
      orders: 1234,
      revenue: 89567.50,
      rating: 4.9,
      joinDate: '2024-03-15'
    },
    {
      name: 'Artisan Coffee Co.',
      products: 32,
      orders: 987,
      revenue: 67890.25,
      rating: 4.7,
      joinDate: '2024-01-22'
    },
    {
      name: 'Highland Beans',
      products: 28,
      orders: 756,
      revenue: 45678.75,
      rating: 4.8,
      joinDate: '2024-05-10'
    },
    {
      name: 'Pacific Roasters',
      products: 38,
      orders: 698,
      revenue: 39876.60,
      rating: 4.6,
      joinDate: '2024-02-18'
    }
  ];

  const userGrowth = [
    { period: 'Week 1', newUsers: 145, activeUsers: 2340 },
    { period: 'Week 2', newUsers: 167, activeUsers: 2456 },
    { period: 'Week 3', newUsers: 189, activeUsers: 2587 },
    { period: 'Week 4', newUsers: 201, activeUsers: 2698 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {timeRange}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.activeUsers.toLocaleString()} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.activeSellers}</div>
            <p className="text-xs text-muted-foreground">
              of {platformStats.totalSellers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.activeProducts.toLocaleString()} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${platformStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.totalOrders.toLocaleString()} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              ${platformStats.avgOrderValue} avg order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue, orders, and user growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{data.month} 2024</div>
                    <div className="text-sm text-gray-600">
                      ${data.revenue.toLocaleString()} revenue
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-600">{data.orders} orders</div>
                  <div className="text-gray-500">{data.users} new users</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-600">{product.seller}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">${product.revenue.toLocaleString()}</div>
                    <div className="text-gray-500">{product.sales} sales</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sellers</CardTitle>
            <CardDescription>Best performing sellers by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div key={seller.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{seller.name}</div>
                      <div className="text-xs text-gray-600">{seller.products} products</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">${seller.revenue.toLocaleString()}</div>
                    <div className="text-gray-500">{seller.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Weekly user acquisition and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userGrowth.map((period) => (
              <div key={period.period} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{period.period}</div>
                    <div className="text-sm text-gray-600">
                      {period.newUsers} new users
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-600">{period.activeUsers} active</div>
                  <div className="text-gray-500">total users</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;