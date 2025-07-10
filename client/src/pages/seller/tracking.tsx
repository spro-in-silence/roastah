import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Clock, CheckCircle, AlertCircle, Search, Eye, Edit, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TrackingInfo {
  id: number;
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  lastUpdate: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  orderItems: {
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export default function SellerTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: trackingData = [], isLoading } = useQuery<TrackingInfo[]>({
    queryKey: ["/api/seller/tracking"],
  });

  const filteredTracking = trackingData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toString().includes(searchQuery);
    
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shipped": return <Truck className="h-4 w-4" />;
      case "in_transit": return <Package className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "delayed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shipped": return "bg-blue-100 text-blue-800";
      case "in_transit": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "delayed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusCounts = {
    all: trackingData.length,
    shipped: trackingData.filter(item => item.status === "shipped").length,
    in_transit: trackingData.filter(item => item.status === "in_transit").length,
    delivered: trackingData.filter(item => item.status === "delivered").length,
    delayed: trackingData.filter(item => item.status === "delayed").length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600">Monitor shipments and delivery status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by tracking number or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({statusCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="in_transit">
            In Transit ({statusCounts.in_transit})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({statusCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="delayed">
            Delayed ({statusCounts.delayed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTracking.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking information found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Your shipped orders will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTracking.map((item) => (
              <TrackingCard key={item.id} item={item} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
            ))
          )}
        </TabsContent>

        <TabsContent value="shipped" className="space-y-4">
          {filteredTracking.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipped orders found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Shipped orders will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTracking.map((item) => (
              <TrackingCard key={item.id} item={item} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in_transit" className="space-y-4">
          {filteredTracking.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders in transit found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Orders in transit will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTracking.map((item) => (
              <TrackingCard key={item.id} item={item} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
            ))
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {filteredTracking.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No delivered orders found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Delivered orders will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTracking.map((item) => (
              <TrackingCard key={item.id} item={item} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
            ))
          )}
        </TabsContent>

        <TabsContent value="delayed" className="space-y-4">
          {filteredTracking.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No delayed orders found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search terms" : "Delayed orders will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTracking.map((item) => (
              <TrackingCard key={item.id} item={item} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate TrackingCard component to avoid duplication
function TrackingCard({ item, getStatusIcon, getStatusColor }: {
  item: TrackingInfo;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(item.status)}
              <CardTitle className="text-lg">Order #{item.orderId}</CardTitle>
            </div>
            <Badge className={getStatusColor(item.status)}>
              {item.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tracking Details - Order #{item.orderId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                      <p className="text-lg font-mono">{item.trackingNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Carrier</label>
                      <p className="text-lg">{item.carrier}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shipping Address</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{item.shippingAddress.name}</p>
                      <p>{item.shippingAddress.street}</p>
                      <p>{item.shippingAddress.city}, {item.shippingAddress.state} {item.shippingAddress.zip}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Items</label>
                    <div className="mt-2 space-y-2">
                      {item.orderItems.map((orderItem, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{orderItem.productName}</span>
                          <span className="text-sm text-gray-600">
                            Qty: {orderItem.quantity} × ${orderItem.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Tracking Number</span>
            </div>
            <p className="font-mono text-sm">{item.trackingNumber}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Carrier</span>
            </div>
            <p className="text-sm">{item.carrier}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Estimated Delivery</span>
            </div>
            <p className="text-sm">{item.estimatedDelivery}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {item.shippingAddress.city}, {item.shippingAddress.state}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Last updated: {item.lastUpdate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}