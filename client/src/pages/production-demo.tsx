import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Upload, TrendingUp, Package, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FunctionalBulkUpload from "@/components/functional-bulk-upload";

export default function ProductionDemo() {
  const [activeDemo, setActiveDemo] = useState<'payment' | 'upload' | 'analytics'>('payment');

  const { data: demoData } = useQuery({
    queryKey: ['/api/demo-data'],
    initialData: {
      commissions: [
        { id: 1, roasterName: "Mountain Peak Coffee", amount: 156.75, status: "paid", date: "2025-06-20" },
        { id: 2, roasterName: "Artisan Roasters", amount: 89.32, status: "pending", date: "2025-06-19" },
        { id: 3, roasterName: "Heritage Coffee Co", amount: 234.56, status: "paid", date: "2025-06-18" }
      ],
      uploads: [
        { id: 1, fileName: "june-inventory.csv", status: "completed", totalRows: 150, successfulRows: 147, errors: 3 },
        { id: 2, fileName: "new-blends.csv", status: "processing", totalRows: 75, processedRows: 45, successfulRows: 43 }
      ],
      analytics: {
        totalRevenue: 12450.89,
        totalCommissions: 1058.75,
        platformFee: 8.5,
        activeRoasters: 23,
        totalProducts: 1247
      }
    }
  });

  const PaymentDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${demoData.analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${demoData.analytics.totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{demoData.analytics.platformFee}% platform fee</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoData.analytics.activeRoasters}</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Commission Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.commissions.map((commission: any) => (
              <div key={commission.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{commission.roasterName}</p>
                  <p className="text-sm text-gray-500">{commission.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${commission.amount}</span>
                  <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                    {commission.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full">Process All Pending Payouts</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UploadDemo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Production-Ready Bulk Upload System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  CSV validation and error reporting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Background processing with progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time status updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Template download with sample data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  File size and format validation
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Recent Uploads</h3>
              <div className="space-y-3">
                {demoData.uploads.map((upload: any) => (
                  <div key={upload.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{upload.fileName}</span>
                      <Badge variant={upload.status === 'completed' ? 'default' : 'secondary'}>
                        {upload.status}
                      </Badge>
                    </div>
                    {upload.status === 'processing' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{upload.processedRows}/{upload.totalRows}</span>
                        </div>
                        <Progress value={(upload.processedRows / upload.totalRows) * 100} className="h-2" />
                      </div>
                    )}
                    {upload.status === 'completed' && (
                      <p className="text-xs text-green-600">
                        ✅ {upload.successfulRows} products processed, {upload.errors} errors
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FunctionalBulkUpload roasterId={1} />
    </div>
  );

  const AnalyticsDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-teal-600">{demoData.analytics.totalProducts}</div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{demoData.analytics.activeRoasters}</div>
            <p className="text-sm text-gray-600">Active Sellers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${demoData.analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{demoData.analytics.platformFee}%</div>
            <p className="text-sm text-gray-600">Platform Fee</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production-Ready Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-teal-700">Payment Processing</h3>
              <ul className="space-y-2 text-sm">
                <li>• Automated commission calculations (8.5% platform fee)</li>
                <li>• Stripe webhook integration for real-time processing</li>
                <li>• Seller payout scheduling and management</li>
                <li>• Transaction tracking and reporting</li>
                <li>• Tax calculation and compliance features</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-yellow-700">File Upload System</h3>
              <ul className="space-y-2 text-sm">
                <li>• CSV parsing with comprehensive validation</li>
                <li>• Background job processing with progress tracking</li>
                <li>• Error reporting and data quality checks</li>
                <li>• Template generation for consistent uploads</li>
                <li>• Image upload and storage integration</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-green-700">Analytics & Reporting</h3>
              <ul className="space-y-2 text-sm">
                <li>• Real-time seller performance dashboards</li>
                <li>• Commission breakdown and earnings tracking</li>
                <li>• Platform-wide revenue analytics</li>
                <li>• Customer behavior and conversion metrics</li>
                <li>• Automated financial reporting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-blue-700">Multi-Vendor Tools</h3>
              <ul className="space-y-2 text-sm">
                <li>• Seller onboarding and verification</li>
                <li>• Product catalog management</li>
                <li>• Order fulfillment tracking</li>
                <li>• Dispute resolution system</li>
                <li>• Marketing campaign management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Production-Ready Marketplace Demo
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Complete payment processing, file upload system, and multi-vendor marketplace functionality
            </p>
          </div>

          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveDemo('payment')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeDemo === 'payment'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Payment Processing
              </button>
              <button
                onClick={() => setActiveDemo('upload')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeDemo === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                File Upload System
              </button>
              <button
                onClick={() => setActiveDemo('analytics')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeDemo === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics & Features
              </button>
            </div>
          </div>

          {activeDemo === 'payment' && <PaymentDemo />}
          {activeDemo === 'upload' && <UploadDemo />}
          {activeDemo === 'analytics' && <AnalyticsDemo />}
        </div>
      </main>
      <Footer />
    </div>
  );
}