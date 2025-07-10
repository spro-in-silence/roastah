import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { CoffeeRoasterLoader } from "@/components/ui/coffee-roaster-loader";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  status: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    roaster: {
      id: number;
      businessName: string;
      contactName: string;
    };
  };
  tracking?: {
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
  };
}

interface Order {
  id: number;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const { user } = useUser();

  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <CoffeeRoasterLoader className="w-16 h-16" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
                  <p className="text-gray-600">We couldn't load your orders at this time. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track your orders and view order history</p>
          </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders yet. Start exploring our amazing coffee selection!
                </p>
                <Link to="/products">
                  <Button className="bg-primary hover:bg-primary/90">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </Badge>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.imageUrl || '/api/placeholder/60/60'}
                              alt={item.product.name}
                              className="w-15 h-15 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                              <p className="text-sm text-gray-600">
                                by {item.product.roaster.businessName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${(item.quantity * item.price).toFixed(2)}
                              </p>
                              <Badge className={getStatusColor(item.status)} variant="outline">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Shipping Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                          <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && (
                            <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
                          )}
                          <p className="text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                          <p className="text-gray-600">{order.shippingAddress.country}</p>
                        </div>

                        {/* Tracking Information */}
                        {order.items.some(item => item.tracking) && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium text-gray-900 mb-2">Tracking Information</h5>
                            {order.items.map((item) => (
                              item.tracking && (
                                <div key={item.id} className="mb-2 last:mb-0">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.product.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {item.tracking.carrier}: {item.tracking.trackingNumber}
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(`https://www.google.com/search?q=${item.tracking?.trackingNumber}`, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Track
                                    </Button>
                                  </div>
                                  {item.tracking.estimatedDelivery && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Estimated delivery: {new Date(item.tracking.estimatedDelivery).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}