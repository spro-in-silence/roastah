import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, DollarSign, Users, Package, Clock, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface SellerAnalytics {
  id: number;
  roasterId: number;
  date: string;
  totalSales: string;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: string;
  topProduct: string;
  conversionRate: string;
}

interface Commission {
  id: number;
  roasterId: number;
  orderId: number;
  saleAmount: string;
  commissionRate: string;
  commissionAmount: string;
  platformFee: string;
  roasterEarnings: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

interface SellerAnalyticsDashboardProps {
  roasterId: number;
}

export default function SellerAnalyticsDashboard({ roasterId }: SellerAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("30d");
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics', roasterId, dateRange],
    enabled: !!roasterId,
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['/api/commissions', roasterId],
    enabled: !!roasterId,
  });

  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns', roasterId],
    enabled: !!roasterId,
  });

  const { data: bulkUploads } = useQuery({
    queryKey: ['/api/bulk-uploads', roasterId],
    enabled: !!roasterId,
  });

  const totalEarnings = commissions?.reduce((sum: number, commission: Commission) => 
    sum + parseFloat(commission.roasterEarnings), 0) || 0;

  const pendingCommissions = commissions?.filter((c: Commission) => c.status === 'pending') || [];
  const paidCommissions = commissions?.filter((c: Commission) => c.status === 'paid') || [];

  const salesData = analytics?.map((a: SellerAnalytics) => ({
    date: new Date(a.date).toLocaleDateString(),
    sales: parseFloat(a.totalSales),
    orders: a.totalOrders,
    customers: a.totalCustomers,
  })) || [];

  const performanceMetrics = analytics?.length > 0 ? {
    totalSales: analytics.reduce((sum: number, a: SellerAnalytics) => sum + parseFloat(a.totalSales), 0),
    totalOrders: analytics.reduce((sum: number, a: SellerAnalytics) => sum + a.totalOrders, 0),
    avgOrderValue: analytics.reduce((sum: number, a: SellerAnalytics) => sum + parseFloat(a.avgOrderValue), 0) / analytics.length,
    conversionRate: analytics.reduce((sum: number, a: SellerAnalytics) => sum + parseFloat(a.conversionRate), 0) / analytics.length,
  } : null;

  if (analyticsLoading || commissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1" />
                <div className="h-3 bg-muted animate-pulse rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your coffee roasting business performance</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">${performanceMetrics?.totalSales?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Platform commission: ${(totalEarnings * 0.085).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{performanceMetrics?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Active campaigns: {campaigns?.filter((c: any) => c.isActive).length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${performanceMetrics?.avgOrderValue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Conversion: {(performanceMetrics?.conversionRate * 100)?.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${pendingCommissions.reduce((sum: number, c: Commission) => sum + parseFloat(c.roasterEarnings), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{pendingCommissions.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="commissions">Commission Tracking</TabsTrigger>
          <TabsTrigger value="campaigns">Marketing Campaigns</TabsTrigger>
          <TabsTrigger value="tools">Seller Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Volume</CardTitle>
                <CardDescription>Number of orders per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Commission Overview</CardTitle>
                <CardDescription>Your earnings breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <span className="text-sm font-medium">Total Earnings</span>
                  <span className="text-lg font-bold text-green-600">${totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <span className="text-sm font-medium">Pending Payouts</span>
                  <span className="text-lg font-bold text-orange-600">
                    ${pendingCommissions.reduce((sum: number, c: Commission) => sum + parseFloat(c.roasterEarnings), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <span className="text-sm font-medium">Platform Fee (8.5%)</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${commissions?.reduce((sum: number, c: Commission) => sum + parseFloat(c.platformFee), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
                <CardDescription>Latest commission transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions?.slice(0, 5).map((commission: Commission) => (
                    <div key={commission.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Order #{commission.orderId}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${commission.roasterEarnings}</div>
                        <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage your promotional campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.filter((c: any) => c.isActive).map((campaign: any) => (
                  <div key={campaign.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">{campaign.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Used: {campaign.usedCount}/{campaign.usageLimit || '∞'}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">{campaign.type}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {campaign.discountValue}% off
                      </div>
                    </div>
                  </div>
                ))}
                {campaigns?.filter((c: any) => c.isActive).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active campaigns. Create one to boost sales!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload History</CardTitle>
                <CardDescription>Track your product upload sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bulkUploads?.slice(0, 5).map((upload: any) => (
                    <div key={upload.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{upload.fileName}</div>
                        <div className="text-sm text-muted-foreground">
                          {upload.successfulRows}/{upload.totalRows} products
                        </div>
                      </div>
                      <Badge variant={upload.status === 'completed' ? 'default' : 
                                   upload.status === 'failed' ? 'destructive' : 'secondary'}>
                        {upload.status}
                      </Badge>
                    </div>
                  ))}
                  {bulkUploads?.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No bulk uploads yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common seller tools and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Bulk Upload Products
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Customer Insights
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Dispute Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}