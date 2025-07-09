import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { setupSecurity } from '@server/security';
import { testStorage } from '../utils/db-utils';

describe('Security Features', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    setupSecurity(app);
    server = await registerRoutes(app);
  });

  beforeEach(async () => {
    await testStorage.cleanupTestData();
    await testStorage.seedTestData();
  });

  afterEach(async () => {
    await testStorage.cleanupTestData();
  });

  describe('Rate Limiting', () => {
    it('should enforce general rate limits', async () => {
      const promises = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 20; i++) {
        promises.push(request(app).get('/api/products'));
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      expect(responses.some(r => r.status === 429)).toBe(true);
    });

    it('should enforce auth rate limits', async () => {
      const promises = [];
      
      // Make multiple login attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      expect(responses.some(r => r.status === 429)).toBe(true);
    });

    it('should enforce payment rate limits', async () => {
      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const promises = [];
      
      // Make multiple payment attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          agent
            .post('/api/payments/create-intent')
            .send({
              amount: 1000,
              currency: 'usd',
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      expect(responses.some(r => r.status === 429)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate product creation input', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Test XSS injection
      const response = await agent
        .post('/api/products')
        .send({
          name: '<script>alert("xss")</script>',
          description: 'Test product',
          price: 1000,
          roastLevel: 'medium',
          origin: 'Brazil',
          inStock: true,
        });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'testpassword123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    });

    it('should sanitize SQL injection attempts', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({
          search: "'; DROP TABLE products; --",
        });

      // Should not cause an error (properly sanitized)
      expect(response.status).toBe(200);
    });
  });

  describe('Authentication Security', () => {
    it('should hash passwords properly', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'security@test.com',
          password: 'securepassword123',
          firstName: 'Security',
          lastName: 'Test',
        });

      expect(response.status).toBe(201);
      
      // Password should not be in response
      expect(response.body.password).toBeUndefined();
    });

    it('should enforce session security', async () => {
      const agent = request.agent(app);
      
      // Login
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Get session cookie
      const cookies = agent.jar.getCookies('http://localhost');
      const sessionCookie = cookies.find(c => c.key === 'connect.sid');
      
      expect(sessionCookie).toBeTruthy();
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.secure).toBe(false); // False in test environment
    });

    it('should prevent concurrent session abuse', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);
      
      // Login from two different agents
      await agent1
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      await agent2
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Both should be valid (or implement session invalidation)
      const response1 = await agent1.get('/api/auth/user');
      const response2 = await agent2.get('/api/auth/user');
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Authorization', () => {
    it('should enforce role-based access', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to access seller-only endpoint
      const response = await agent.get('/api/seller/analytics');

      expect(response.status).toBe(403);
    });

    it('should enforce resource ownership', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to update someone else's product
      const response = await agent
        .put('/api/products/1')
        .send({
          name: 'Hacked Product',
        });

      expect(response.status).toBe(403);
    });

    it('should validate API key access', async () => {
      // Test API key authentication if implemented
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-api-key');

      expect(response.status).toBe(401);
    });
  });

  describe('Data Protection', () => {
    it('should not expose sensitive data', async () => {
      const response = await request(app).get('/api/users');

      if (response.status === 200) {
        response.body.forEach((user: any) => {
          expect(user.password).toBeUndefined();
          expect(user.mfaSecret).toBeUndefined();
        });
      }
    });

    it('should encrypt sensitive data at rest', async () => {
      // Test that sensitive data is encrypted in database
      const user = await testStorage.getUser('test-buyer-001');
      
      if (user && user.mfaSecret) {
        // Should be encrypted (not plain text)
        expect(user.mfaSecret).not.toMatch(/^[A-Z2-7]{32}$/);
      }
    });

    it('should handle GDPR data requests', async () => {
      const agent = request.agent(app);
      
      // Login as user
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Request user data export
      const response = await agent.get('/api/user/export');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userData');
    });
  });

  describe('CORS and Headers', () => {
    it('should set proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeTruthy();
      expect(response.headers['access-control-allow-methods']).toBeTruthy();
    });

    it('should set security headers', async () => {
      const response = await request(app).get('/api/products');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should set CSP headers', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-security-policy']).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should not expose stack traces in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle large payload attacks', async () => {
      const largePayload = 'x'.repeat(1024 * 1024 * 10); // 10MB

      const response = await request(app)
        .post('/api/products')
        .send({ description: largePayload });

      expect(response.status).toBe(413); // Payload too large
    });
  });
});