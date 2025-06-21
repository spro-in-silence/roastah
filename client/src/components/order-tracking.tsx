import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useRealtimeTracking } from '@/hooks/useRealtimeTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface OrderTrackingProps {
  orderId: number;
  isSellerView?: boolean;
}

interface TrackingEvent {
  id: number;
  orderId: number;
  status: string;
  location?: string;
  description?: string;
  estimatedTime?: Date;
  actualTime?: Date;
  createdAt: Date;
}

const statusIcons = {
  'order_placed': Package,
  'confirmed': CheckCircle,
  'roasting': Package,
  'packaging': Package,
  'shipped': Truck,
  'out_for_delivery': Truck,
  'delivered': CheckCircle,
  'delayed': AlertCircle,
  'cancelled': AlertCircle
};

const statusColors = {
  'order_placed': 'bg-blue-500',
  'confirmed': 'bg-green-500',
  'roasting': 'bg-orange-500',
  'packaging': 'bg-yellow-500',
  'shipped': 'bg-purple-500',
  'out_for_delivery': 'bg-indigo-500',
  'delivered': 'bg-green-600',
  'delayed': 'bg-red-500',
  'cancelled': 'bg-gray-500'
};

export function OrderTracking({ orderId, isSellerView = false }: OrderTrackingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTrackingEvent, setNewTrackingEvent] = useState({
    status: '',
    location: '',
    description: '',
    estimatedTime: ''
  });

  // Fetch tracking data
  const { data: trackingEvents, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId, 'tracking'],
    queryFn: () => apiRequest('GET', `/api/orders/${orderId}/tracking`),
  });

  // Real-time tracking updates
  const { isConnected, subscribeToOrder } = useRealtimeTracking({
    onOrderUpdate: (data) => {
      // Invalidate and refetch tracking data when updates arrive
      queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId, 'tracking'] });
      
      toast({
        title: "Order Update",
        description: `Your order status has been updated to: ${data.tracking?.status}`,
      });
    },
    onStatusChange: (data) => {
      if (data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId, 'tracking'] });
        
        toast({
          title: "Status Changed",
          description: `Order status changed from ${data.oldStatus} to ${data.newStatus}`,
        });
      }
    }
  });

  // Subscribe to this specific order's updates
  useEffect(() => {
    if (isConnected && orderId) {
      subscribeToOrder(orderId);
    }
  }, [isConnected, orderId, subscribeToOrder]);

  // Add tracking event mutation (seller only)
  const addTrackingMutation = useMutation({
    mutationFn: (eventData: any) => 
      apiRequest('POST', `/api/orders/${orderId}/tracking`, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId, 'tracking'] });
      setNewTrackingEvent({
        status: '',
        location: '',
        description: '',
        estimatedTime: ''
      });
      toast({
        title: "Success",
        description: "Tracking event added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking event",
        variant: "destructive",
      });
    }
  });

  const handleAddTrackingEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTrackingEvent.status || !newTrackingEvent.description) {
      toast({
        title: "Validation Error",
        description: "Status and description are required",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      ...newTrackingEvent,
      estimatedTime: newTrackingEvent.estimatedTime ? new Date(newTrackingEvent.estimatedTime) : undefined
    };

    addTrackingMutation.mutate(eventData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const events: TrackingEvent[] = trackingEvents || [];
  const latestEvent = events[0];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Tracking
              </CardTitle>
              <CardDescription>
                Real-time updates for order #{orderId}
                {isConnected && (
                  <Badge variant="secondary" className="ml-2">
                    Live Updates Active
                  </Badge>
                )}
              </CardDescription>
            </div>
            {latestEvent && (
              <Badge 
                variant="secondary" 
                className={`${statusColors[latestEvent.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}
              >
                {latestEvent.status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {latestEvent ? (
            <div className="space-y-2">
              <p className="font-medium">{latestEvent.description}</p>
              {latestEvent.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {latestEvent.location}
                </p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(latestEvent.actualTime || latestEvent.createdAt), 'PPp')}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No tracking information available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
            <CardDescription>Complete timeline of your order progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = statusIcons[event.status as keyof typeof statusIcons] || Package;
                const isLatest = index === 0;
                
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`
                        p-2 rounded-full 
                        ${isLatest ? statusColors[event.status as keyof typeof statusColors] || 'bg-gray-500' : 'bg-gray-200'}
                        ${isLatest ? 'text-white' : 'text-gray-500'}
                      `}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < events.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {event.status.replace('_', ' ').toUpperCase()}
                        </h4>
                        {isLatest && (
                          <Badge variant="outline" className="text-xs">Latest</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.actualTime || event.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Tracking Event (Seller View) */}
      {isSellerView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Tracking Update
            </CardTitle>
            <CardDescription>
              Add a new tracking event to update customers about order progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTrackingEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={newTrackingEvent.status}
                    onChange={(e) => setNewTrackingEvent(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select status...</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="roasting">Roasting</option>
                    <option value="packaging">Packaging</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newTrackingEvent.location}
                    onChange={(e) => setNewTrackingEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Seattle, WA"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTrackingEvent.description}
                  onChange={(e) => setNewTrackingEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what's happening with this order..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (Optional)</Label>
                <Input
                  id="estimatedTime"
                  type="datetime-local"
                  value={newTrackingEvent.estimatedTime}
                  onChange={(e) => setNewTrackingEvent(prev => ({ ...prev, estimatedTime: e.target.value }))}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={addTrackingMutation.isPending}
              >
                {addTrackingMutation.isPending ? 'Adding...' : 'Add Tracking Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}