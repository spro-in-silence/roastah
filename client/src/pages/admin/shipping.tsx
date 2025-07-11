import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Globe
} from 'lucide-react';

const AdminShipping = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const shippingStats = {
    totalShipments: 1247,
    activeShipments: 89,
    deliveredThisMonth: 456,
    avgDeliveryTime: 2.8,
    onTimeDeliveryRate: 94.2,
    totalShippingCost: 15670.45
  };

  const recentShipments = [
    {
      id: 'shp_1234567890',
      trackingNumber: '1Z999AA1234567890',
      status: 'in_transit',
      origin: 'San Francisco, CA',
      destination: 'New York, NY',
      carrier: 'UPS',
      service: 'Ground',
      created: '2025-01-10T14:30:00Z',
      estimatedDelivery: '2025-01-13T17:00:00Z',
      cost: 12.45,
      seller: 'Mountain View Roasters'
    },
    {
      id: 'shp_1234567891',
      trackingNumber: '1Z999AA1234567891',
      status: 'delivered',
      origin: 'Portland, OR',
      destination: 'Seattle, WA',
      carrier: 'USPS',
      service: 'Priority',
      created: '2025-01-09T10:15:00Z',
      estimatedDelivery: '2025-01-11T12:00:00Z',
      cost: 8.95,
      seller: 'Artisan Coffee Co.'
    },
    {
      id: 'shp_1234567892',
      trackingNumber: '1Z999AA1234567892',
      status: 'exception',
      origin: 'Denver, CO',
      destination: 'Austin, TX',
      carrier: 'FedEx',
      service: 'Express',
      created: '2025-01-08T16:45:00Z',
      estimatedDelivery: '2025-01-10T10:30:00Z',
      cost: 24.50,
      seller: 'Highland Beans'
    }
  ];

  const carrierPerformance = [
    {
      carrier: 'UPS',
      shipments: 456,
      onTimeRate: 96.2,
      avgCost: 11.25,
      avgDeliveryTime: 2.5,
      status: 'excellent'
    },
    {
      carrier: 'USPS',
      shipments: 389,
      onTimeRate: 92.1,
      avgCost: 8.75,
      avgDeliveryTime: 3.2,
      status: 'good'
    },
    {
      carrier: 'FedEx',
      shipments: 298,
      onTimeRate: 94.8,
      avgCost: 15.60,
      avgDeliveryTime: 2.1,
      status: 'excellent'
    },
    {
      carrier: 'DHL',
      shipments: 104,
      onTimeRate: 89.4,
      avgCost: 22.30,
      avgDeliveryTime: 3.8,
      status: 'needs_attention'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'exception':
      case 'needs_attention':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600">Manage Shippo integration and shipping operations</p>
        </div>
        <div className="flex space-x-2">
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

      {/* Shipping Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats.totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {shippingStats.activeShipments} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered This Month</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats.deliveredThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {shippingStats.onTimeDeliveryRate}% on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats.avgDeliveryTime} days</div>
            <p className="text-xs text-muted-foreground">
              Average delivery time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipping Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${shippingStats.totalShippingCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Latest shipping activity across the platform</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{shipment.trackingNumber}</span>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {shipment.origin} → {shipment.destination}
                    </div>
                    <div className="text-xs text-gray-500">
                      {shipment.carrier} {shipment.service} • {shipment.seller}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Cost: ${shipment.cost}</div>
                    <div className="text-gray-500">
                      ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carrier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
          <CardDescription>Performance metrics for each shipping carrier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carrierPerformance.map((carrier) => (
              <div key={carrier.carrier} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{carrier.carrier}</span>
                      <Badge className={getStatusColor(carrier.status)}>
                        {carrier.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {carrier.shipments} shipments • {carrier.onTimeRate}% on time
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Avg Cost: ${carrier.avgCost}</div>
                    <div className="text-gray-500">Avg Time: {carrier.avgDeliveryTime} days</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShipping;