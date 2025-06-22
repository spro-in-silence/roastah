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

type EventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'authenticated' = 'disconnected';
  private userId: string | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private subscribedOrders: Set<number> = new Set();
  private isSubscribedToNotifications = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.userId = userId;
    this.connectionStatus = 'connecting';

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      if (import.meta.env.DEV) {
        console.log('WebSocket connected');
      }
      this.connectionStatus = 'connected';
      
      // Authenticate immediately
      this.ws?.send(JSON.stringify({
        type: 'authenticate',
        userId,
        token: 'placeholder'
      }));

      // Start heartbeat
      this.heartbeatInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      if (import.meta.env.DEV) {
        console.log('WebSocket disconnected:', event.code, event.reason);
      }
      this.connectionStatus = 'disconnected';
      this.subscribedOrders.clear();
      this.isSubscribedToNotifications = false;

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Reconnect if not manually closed
      if (event.code !== 1000 && this.userId) {
        this.reconnectTimeout = setTimeout(() => {
          this.connect(this.userId!);
        }, 3000);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.subscribedOrders.clear();
    this.isSubscribedToNotifications = false;
  }

  private handleMessage(message: RealtimeMessage) {
    switch (message.type) {
      case 'connection_established':
        if (import.meta.env.DEV) {
          console.log('Connection established:', message.connectionId);
        }
        break;
        
      case 'authenticated':
        if (import.meta.env.DEV) {
          console.log('Authentication successful');
        }
        this.connectionStatus = 'authenticated';
        break;
        
      case 'order_subscribed':
        if (message.orderId) {
          this.subscribedOrders.add(message.orderId);
        }
        break;
        
      case 'notifications_subscribed':
        this.isSubscribedToNotifications = true;
        break;
        
      case 'tracking_update':
        this.emit('orderUpdate', message.data);
        break;
        
      case 'notification':
        this.emit('notification', message.data);
        break;
        
      case 'status_change':
        this.emit('statusChange', message.data);
        break;
    }
  }

  subscribeToOrder(orderId: number) {
    if (this.ws?.readyState === WebSocket.OPEN && !this.subscribedOrders.has(orderId)) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_order',
        orderId
      }));
    }
  }

  subscribeToNotifications() {
    if (this.ws?.readyState === WebSocket.OPEN && !this.isSubscribedToNotifications) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_notifications'
      }));
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.eventHandlers.get(event)?.forEach(handler => handler(data));
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  isConnected() {
    return this.connectionStatus === 'authenticated';
  }
}

export const websocketService = new WebSocketService();