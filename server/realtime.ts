import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';
import type { User, OrderTracking, Notification } from '@shared/schema';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  connectionId?: string;
  isAlive?: boolean;
}

interface RealtimeMessage {
  type: 'order_update' | 'notification' | 'tracking_update' | 'status_change';
  data: any;
  timestamp: Date;
}

class RealtimeService {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, AuthenticatedWebSocket[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Basic verification - in production, validate JWT token
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupHeartbeat();
    console.log('Real-time WebSocket server initialized on /ws');
  }

  private async handleConnection(ws: AuthenticatedWebSocket, request: any) {
    const connectionId = this.generateConnectionId();
    ws.connectionId = connectionId;
    ws.isAlive = true;

    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      this.removeConnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeConnection(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      connectionId,
      timestamp: new Date()
    }));
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: any) {
    switch (message.type) {
      case 'authenticate':
        await this.authenticateConnection(ws, message.userId, message.token);
        break;
      case 'subscribe_order':
        await this.subscribeToOrder(ws, message.orderId);
        break;
      case 'subscribe_notifications':
        await this.subscribeToNotifications(ws);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  private async authenticateConnection(ws: AuthenticatedWebSocket, userId: string, token: string) {
    try {
      // In a real implementation, validate the JWT token here
      // For now, we'll do basic validation
      if (!userId) {
        ws.send(JSON.stringify({ error: 'Invalid authentication' }));
        return;
      }

      const user = await storage.getUser(userId);
      if (!user) {
        ws.send(JSON.stringify({ error: 'User not found' }));
        return;
      }

      ws.userId = userId;
      
      // Add to user connections
      if (!this.connections.has(userId)) {
        this.connections.set(userId, []);
      }
      this.connections.get(userId)!.push(ws);

      // Store connection in database for persistence
      await storage.createRealtimeConnection({
        userId,
        connectionId: ws.connectionId!,
        deviceInfo: { userAgent: 'web' }
      });

      ws.send(JSON.stringify({
        type: 'authenticated',
        userId,
        timestamp: new Date()
      }));

      console.log(`User ${userId} connected via WebSocket`);
    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({ error: 'Authentication failed' }));
    }
  }

  private async subscribeToOrder(ws: AuthenticatedWebSocket, orderId: number) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }

    // Verify user has access to this order
    const order = await storage.getOrderById(orderId);
    if (!order || order.userId !== ws.userId) {
      ws.send(JSON.stringify({ error: 'Order not found or access denied' }));
      return;
    }

    // Get current tracking information
    const tracking = await storage.getOrderTracking(orderId);
    
    ws.send(JSON.stringify({
      type: 'order_subscribed',
      orderId,
      tracking,
      timestamp: new Date()
    }));
  }

  private async subscribeToNotifications(ws: AuthenticatedWebSocket) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }

    // Get unread notifications
    const notifications = await storage.getNotificationsByUserId(ws.userId);
    const unreadNotifications = notifications.filter(n => !n.isRead);

    ws.send(JSON.stringify({
      type: 'notifications_subscribed',
      notifications: unreadNotifications,
      timestamp: new Date()
    }));
  }

  // Public methods for broadcasting updates
  async broadcastOrderUpdate(orderId: number, tracking: OrderTracking) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const message: RealtimeMessage = {
      type: 'tracking_update',
      data: { orderId, tracking, order },
      timestamp: new Date()
    };

    // Notify customer
    await this.sendToUser(order.userId, message);

    // Notify seller(s)
    const orderItems = await storage.getOrderItemsByOrder(orderId);
    for (const item of orderItems) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        const roaster = await storage.getRoasterById(product.roasterId);
        if (roaster) {
          await this.sendToUser(roaster.userId, message);
        }
      }
    }
  }

  async broadcastNotification(notification: Notification) {
    const message: RealtimeMessage = {
      type: 'notification',
      data: notification,
      timestamp: new Date()
    };

    await this.sendToUser(notification.userId, message);
  }

  async broadcastOrderStatusChange(orderId: number, newStatus: string, oldStatus: string) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const message: RealtimeMessage = {
      type: 'status_change',
      data: { orderId, newStatus, oldStatus, order },
      timestamp: new Date()
    };

    await this.sendToUser(order.userId, message);
  }

  private async sendToUser(userId: string, message: RealtimeMessage) {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.length === 0) return;

    const messageStr = JSON.stringify(message);
    
    // Send to all user connections
    for (const ws of userConnections) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error('Error sending message to user:', error);
          this.removeConnection(ws);
        }
      }
    }
  }

  private removeConnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userConnections = this.connections.get(ws.userId);
      if (userConnections) {
        const index = userConnections.indexOf(ws);
        if (index > -1) {
          userConnections.splice(index, 1);
        }
        if (userConnections.length === 0) {
          this.connections.delete(ws.userId);
        }
      }
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          this.removeConnection(ws);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  getUserConnectionCount(userId: string): number {
    return this.connections.get(userId)?.length || 0;
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const realtimeService = new RealtimeService();