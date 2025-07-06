import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface RealtimeMessage {
  type: 'order_update' | 'notification' | 'tracking_update' | 'status_change' | 'connection_established' | 'authenticated' | 'order_subscribed' | 'notifications_subscribed' | 'pong';
  data?: any;
  timestamp: Date;
  connectionId?: string;
  orderId?: number;
  tracking?: any;
  notifications?: any[];
  userId?: string;
}

interface UseRealtimeTrackingOptions {
  autoConnect?: boolean;
  onOrderUpdate?: (data: any) => void;
  onNotification?: (data: any) => void;
  onStatusChange?: (data: any) => void;
}

export function useRealtimeTracking(options: UseRealtimeTrackingOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'authenticated'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [subscribedOrders, setSubscribedOrders] = useState<Set<number>>(new Set());
  const [isSubscribedToNotifications, setIsSubscribedToNotifications] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { autoConnect = true, onOrderUpdate, onNotification, onStatusChange } = options;

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      setError('User not authenticated');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connecting or connected
    }

    try {
      setConnectionStatus('connecting');
      setError(null);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // In development, the frontend runs on port 5173 but backend runs on port 5000
      const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
      const host = isDev ? "localhost:5000" : window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      if (isDev) {
        console.log('WebSocket connecting to:', wsUrl);
      }
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isDev) {
          console.log('WebSocket connected');
        }
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Authenticate immediately after connection
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id,
          token: 'placeholder' // In production, use actual JWT token
        }));

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (isDev) {
          console.log('WebSocket disconnected:', event.code, event.reason);
        }
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setSubscribedOrders(new Set());
        setIsSubscribedToNotifications(false);

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect after 3 seconds if not manually disconnected
        if (event.code !== 1000 && autoConnect && isAuthenticated) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectionStatus === 'disconnected') {
              connect();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setError('Failed to establish connection');
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated, user?.id, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setSubscribedOrders(new Set());
    setIsSubscribedToNotifications(false);
  }, []);

  const handleMessage = useCallback((message: RealtimeMessage) => {
    const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
    switch (message.type) {
      case 'connection_established':
        if (isDev) {
          console.log('Connection established:', message.connectionId);
        }
        break;
        
      case 'authenticated':
        if (isDev) {
          console.log('Authentication successful for user:', message.userId);
        }
        setConnectionStatus('authenticated');
        setError(null);
        break;
        
      case 'order_subscribed':
        if (isDev) {
          console.log('Subscribed to order:', message.orderId);
        }
        if (message.orderId) {
          setSubscribedOrders(prev => new Set(prev).add(message.orderId!));
        }
        break;
        
      case 'notifications_subscribed':
        if (isDev) {
          console.log('Subscribed to notifications');
        }
        setIsSubscribedToNotifications(true);
        break;
        
      case 'tracking_update':
        if (isDev) {
          console.log('Order tracking update:', message.data);
        }
        onOrderUpdate?.(message.data);
        break;
        
      case 'notification':
        if (isDev) {
          console.log('New notification:', message.data);
        }
        onNotification?.(message.data);
        break;
        
      case 'status_change':
        if (isDev) {
          console.log('Order status change:', message.data);
        }
        onStatusChange?.(message.data);
        break;
        
      case 'pong':
        // Heartbeat response - connection is alive
        break;
        
      default:
        if (isDev) {
          console.log('Unknown message type:', message.type);
        }
    }
  }, [onOrderUpdate, onNotification, onStatusChange]);

  const subscribeToOrder = useCallback((orderId: number) => {
    const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (isDev) {
        console.warn('WebSocket not connected, cannot subscribe to order');
      }
      return;
    }

    if (subscribedOrders.has(orderId)) {
      return; // Already subscribed
    }

    wsRef.current.send(JSON.stringify({
      type: 'subscribe_order',
      orderId
    }));
  }, [subscribedOrders]);

  const subscribeToNotifications = useCallback(() => {
    const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (isDev) {
        console.warn('WebSocket not connected, cannot subscribe to notifications');
      }
      return;
    }

    if (isSubscribedToNotifications) {
      return; // Already subscribed
    }

    wsRef.current.send(JSON.stringify({
      type: 'subscribe_notifications'
    }));
  }, [isSubscribedToNotifications]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && user?.id && connectionStatus === 'disconnected') {
      connect();
    }
  }, [autoConnect, isAuthenticated, user?.id, connectionStatus, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    subscribedOrders: Array.from(subscribedOrders),
    isSubscribedToNotifications,
    connect,
    disconnect,
    subscribeToOrder,
    subscribeToNotifications
  };
}