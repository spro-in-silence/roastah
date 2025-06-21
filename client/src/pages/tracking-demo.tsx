import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { OrderTracking } from '@/components/order-tracking';
import { RealtimeNotifications } from '@/components/realtime-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package, Bell, Zap } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function TrackingDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [demoOrderId, setDemoOrderId] = useState(3); // Using the order we created
  const [newEvent, setNewEvent] = useState({
    status: 'confirmed',
    location: 'Roastah Processing Center, Seattle, WA',
    description: 'Your order has been confirmed and assigned to our premium roaster partner!'
  });

  const addTrackingEventMutation = useMutation({
    mutationFn: (eventData: any) => 
      apiRequest('POST', `/api/orders/${demoOrderId}/tracking`, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders', demoOrderId, 'tracking'] });
      toast({
        title: "Live Update Sent!",
        description: "Real-time tracking event broadcasted to all connected users",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Demo Error",
        description: error.message || "Failed to send tracking update",
        variant: "destructive",
      });
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: (notificationData: any) => 
      apiRequest('POST', '/api/notifications', notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Live Notification Sent!",
        description: "Real-time notification broadcasted via WebSocket",
      });
    }
  });

  const handleDemoTrackingUpdate = () => {
    const eventData = {
      ...newEvent,
      actualTime: new Date()
    };
    addTrackingEventMutation.mutate(eventData);
  };

  const handleDemoNotification = () => {
    const notificationData = {
      type: 'order_update',
      title: 'Order Status Update',
      message: `Your order status has been updated to: ${newEvent.status}`,
      orderId: demoOrderId
    };
    createNotificationMutation.mutate(notificationData);
  };

  const demoStatuses = [
    { value: 'confirmed', label: 'Order Confirmed' },
    { value: 'roasting', label: 'Coffee Roasting' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time Tracking System Demo
          </h1>
          <p className="text-gray-600">
            Experience live order tracking and notifications powered by WebSocket technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Demo Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Live Demo Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="demo-order-id">Demo Order ID</Label>
                  <Input
                    id="demo-order-id"
                    type="number"
                    value={demoOrderId}
                    onChange={(e) => setDemoOrderId(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="demo-status">Status Update</Label>
                  <select
                    id="demo-status"
                    value={newEvent.status}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {demoStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="demo-location">Location</Label>
                  <Input
                    id="demo-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Current location..."
                  />
                </div>

                <div>
                  <Label htmlFor="demo-description">Description</Label>
                  <Textarea
                    id="demo-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Update description..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDemoTrackingUpdate}
                    disabled={addTrackingEventMutation.isPending}
                    className="flex-1"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Send Tracking Update
                  </Button>
                  
                  <Button
                    onClick={handleDemoNotification}
                    disabled={createNotificationMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> Click the buttons above to broadcast live updates 
                    to all connected users via WebSocket. Watch the tracking timeline and notification 
                    bell update in real-time!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Notifications Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Live Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealtimeNotifications maxHeight="300px" />
              </CardContent>
            </Card>
          </div>

          {/* Live Order Tracking */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Live Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTracking orderId={demoOrderId} isSellerView={true} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Features Demonstrated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">WebSocket Connections</h3>
                  <p className="text-sm text-gray-600">
                    Persistent connections enable instant bidirectional communication
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Order Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Real-time status updates with visual timeline and progress indicators
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Push Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Instant notifications with dropdown interface and unread counts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}