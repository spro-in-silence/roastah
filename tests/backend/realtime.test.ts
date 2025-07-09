import WebSocket from 'ws';
import { createServer } from 'http';
import { realtimeService } from '@server/realtime';
import { testStorage } from '../utils/db-utils';

describe('Real-time Features', () => {
  let server: any;
  let wsServer: any;

  beforeAll(async () => {
    server = createServer();
    realtimeService.initialize(server);
    wsServer = server.listen(0);
  });

  afterAll(async () => {
    realtimeService.shutdown();
    wsServer.close();
  });

  beforeEach(async () => {
    await testStorage.cleanupTestData();
    await testStorage.seedTestData();
  });

  afterEach(async () => {
    await testStorage.cleanupTestData();
  });

  describe('WebSocket Connection', () => {
    it('should accept valid WebSocket connections', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle authentication', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'valid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'auth_success') {
          expect(message.success).toBe(true);
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should reject invalid authentication', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'invalid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'auth_error') {
          expect(message.error).toBeTruthy();
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Order Updates', () => {
    it('should broadcast order status changes', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Authenticate first
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'valid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth_success') {
          // Subscribe to order updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'order_updates',
            orderId: 1,
          }));
        } else if (message.type === 'order_update') {
          expect(message.data.orderId).toBe(1);
          expect(message.data.status).toBe('processing');
          ws.close();
          done();
        }
      });

      // Simulate order update
      setTimeout(() => {
        realtimeService.broadcastOrderStatusChange(1, 'processing', 'pending');
      }, 100);

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Notifications', () => {
    it('should send notifications to subscribed users', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Authenticate first
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'valid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth_success') {
          // Subscribe to notifications
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'notifications',
          }));
        } else if (message.type === 'notification') {
          expect(message.data.title).toBe('Test Notification');
          expect(message.data.message).toBe('This is a test notification');
          ws.close();
          done();
        }
      });

      // Simulate notification
      setTimeout(() => {
        realtimeService.broadcastNotification({
          userId: 'test-user-001',
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'info',
        });
      }, 100);

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Connection Management', () => {
    it('should handle connection cleanup', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Authenticate
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'valid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth_success') {
          // Close connection
          ws.close();
          
          // Verify connection is removed
          setTimeout(() => {
            expect(realtimeService.getUserConnectionCount('test-user-001')).toBe(0);
            done();
          }, 100);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle heartbeat/ping-pong', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Authenticate
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'valid-token',
          userId: 'test-user-001',
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        } else if (message.type === 'auth_success') {
          // Wait for ping
          setTimeout(() => {
            ws.close();
            done();
          }, 1000);
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Message Validation', () => {
    it('should validate message format', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Send invalid message
        ws.send('invalid json');
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'error') {
          expect(message.error).toContain('Invalid message format');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should validate message types', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsServer.address().port}/ws`);
      
      ws.on('open', () => {
        // Send message with unknown type
        ws.send(JSON.stringify({
          type: 'unknown_type',
          data: {},
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'error') {
          expect(message.error).toContain('Unknown message type');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });
});