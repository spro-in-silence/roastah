import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useRealtimeTracking } from '@/hooks/useRealtimeTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellRing, 
  Package, 
  ShoppingCart, 
  Star, 
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  orderId?: number;
  orderItemId?: number;
  isRead: boolean;
  createdAt: Date;
}

const notificationIcons = {
  'order_placed': ShoppingCart,
  'order_update': Package,
  'order_shipped': Package,
  'order_delivered': Package,
  'review_received': Star,
  'payment_received': Check,
  'system_alert': AlertCircle,
  'roaster_approved': Check,
  'roaster_rejected': X
};

const notificationColors = {
  'order_placed': 'bg-blue-500',
  'order_update': 'bg-orange-500',
  'order_shipped': 'bg-purple-500',
  'order_delivered': 'bg-green-500',
  'review_received': 'bg-yellow-500',
  'payment_received': 'bg-green-600',
  'system_alert': 'bg-red-500',
  'roaster_approved': 'bg-green-500',
  'roaster_rejected': 'bg-red-500'
};

interface RealtimeNotificationsProps {
  showAsDropdown?: boolean;
  maxHeight?: string;
}

export function RealtimeNotifications({ showAsDropdown = false, maxHeight = "400px" }: RealtimeNotificationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => apiRequest('GET', '/api/notifications'),
  });

  // Real-time notification updates
  const { isConnected, subscribeToNotifications } = useRealtimeTracking({
    onNotification: (data) => {
      // Add new notification to the cache
      queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] | undefined) => {
        const newNotification = data as Notification;
        return [newNotification, ...(oldData || [])];
      });

      // Show toast notification
      toast({
        title: data.title || "New Notification",
        description: data.message,
      });

      // Update unread count
      setUnreadCount(prev => prev + 1);
    }
  });

  // Subscribe to notifications when connected
  useEffect(() => {
    if (isConnected) {
      subscribeToNotifications();
    }
  }, [isConnected, subscribeToNotifications]);

  // Update unread count when notifications change
  useEffect(() => {
    if (notifications) {
      const unread = (notifications as Notification[]).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('PUT', `/api/notifications/${notificationId}/read`),
    onSuccess: (_, notificationId) => {
      // Update the cache
      queryClient.setQueryData(['/api/notifications'], (oldData: Notification[] | undefined) => {
        return (oldData || []).map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        );
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    
    const unreadNotifications = (notifications as Notification[]).filter(n => !n.isRead);
    unreadNotifications.forEach(notification => {
      markAsReadMutation.mutate(notification.id);
    });
  };

  const notificationList = notifications as Notification[] || [];

  if (showAsDropdown) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {isOpen && (
          <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-6"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <NotificationList 
                  notifications={notificationList}
                  onMarkAsRead={handleMarkAsRead}
                  isLoading={isLoading}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="secondary">
                Live Updates Active
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Stay updated with order status changes and important messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <NotificationList 
            notifications={notificationList}
            onMarkAsRead={handleMarkAsRead}
            isLoading={isLoading}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  isLoading: boolean;
}

function NotificationList({ notifications, onMarkAsRead, isLoading }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
        <p className="text-sm">We'll notify you when something important happens</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
        const bgColor = notificationColors[notification.type as keyof typeof notificationColors] || 'bg-gray-500';
        
        return (
          <div
            key={notification.id}
            className={`
              p-3 border-l-4 transition-colors cursor-pointer hover:bg-gray-50
              ${notification.isRead ? 'border-gray-200 opacity-60' : `${bgColor.replace('bg-', 'border-')}`}
              ${!notification.isRead ? 'bg-blue-50' : ''}
            `}
            onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
          >
            <div className="flex gap-3">
              <div className={`
                p-1 rounded-full 
                ${!notification.isRead ? bgColor : 'bg-gray-200'}
                ${!notification.isRead ? 'text-white' : 'text-gray-500'}
              `}>
                <Icon className="h-3 w-3" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm ${!notification.isRead ? 'font-medium' : 'font-normal'}`}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}