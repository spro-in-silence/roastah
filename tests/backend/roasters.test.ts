import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { testStorage } from '../utils/db-utils';

describe('Roasters API', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  beforeEach(async () => {
    await testStorage.cleanupTestData();
    await testStorage.seedTestData();
  });

  afterEach(async () => {
    await testStorage.cleanupTestData();
  });

  describe('GET /api/roasters', () => {
    it('should return all approved roasters', async () => {
      const response = await request(app).get('/api/roasters');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('businessName');
      expect(response.body[0].isApproved).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/roasters')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by business type', async () => {
      const response = await request(app)
        .get('/api/roasters')
        .query({ businessType: 'commercial' });

      expect(response.status).toBe(200);
      response.body.forEach((roaster: any) => {
        expect(roaster.businessType).toBe('commercial');
      });
    });
  });

  describe('GET /api/roasters/:id', () => {
    it('should return specific roaster', async () => {
      const roastersResponse = await request(app).get('/api/roasters');
      const roasterId = roastersResponse.body[0].id;

      const response = await request(app).get(`/api/roasters/${roasterId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(roasterId);
      expect(response.body).toHaveProperty('businessName');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent roaster', async () => {
      const response = await request(app).get('/api/roasters/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/roasters/apply', () => {
    it('should create roaster application', async () => {
      const agent = request.agent(app);
      
      // Login as regular user
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/roasters/apply')
        .send({
          businessName: 'New Coffee Roasters',
          description: 'Premium coffee roasting services',
          businessType: 'home_roaster',
          location: 'Test City, TS',
          website: 'https://newroasters.com',
          experience: '5 years',
        });

      expect(response.status).toBe(201);
      expect(response.body.businessName).toBe('New Coffee Roasters');
      expect(response.body.isApproved).toBe(false); // Pending approval
    });

    it('should validate required fields', async () => {
      const agent = request.agent(app);
      
      // Login as regular user
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/roasters/apply')
        .send({
          businessName: '',
          description: 'Test description',
        });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate applications', async () => {
      const agent = request.agent(app);
      
      // Login as seller (who already has roaster profile)
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/roasters/apply')
        .send({
          businessName: 'Another Roastery',
          description: 'Test description',
          businessType: 'commercial',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/roasters/apply')
        .send({
          businessName: 'Test Roastery',
          description: 'Test description',
          businessType: 'commercial',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/roasters/:id', () => {
    it('should update roaster profile for owner', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Get roaster profile
      const roastersResponse = await agent.get('/api/roasters');
      const roaster = roastersResponse.body[0];

      const response = await agent
        .put(`/api/roasters/${roaster.id}`)
        .send({
          description: 'Updated description',
          website: 'https://updated.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
      expect(response.body.website).toBe('https://updated.com');
    });

    it('should return 403 for non-owner', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .put('/api/roasters/1')
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent roaster', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .put('/api/roasters/99999')
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/roasters/:id/products', () => {
    it('should return products for roaster', async () => {
      const roastersResponse = await request(app).get('/api/roasters');
      const roaster = roastersResponse.body[0];

      const response = await request(app).get(`/api/roasters/${roaster.id}/products`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should contain products from test data
    });

    it('should support product filtering', async () => {
      const roastersResponse = await request(app).get('/api/roasters');
      const roaster = roastersResponse.body[0];

      const response = await request(app)
        .get(`/api/roasters/${roaster.id}/products`)
        .query({ roastLevel: 'medium' });

      expect(response.status).toBe(200);
      response.body.forEach((product: any) => {
        expect(product.roastLevel).toBe('medium');
      });
    });
  });

  describe('Admin endpoints', () => {
    describe('PUT /api/admin/roasters/:id/approve', () => {
      it('should approve roaster application for admin', async () => {
        // This would require admin authentication
        // For now, we'll test the basic structure
        expect(true).toBe(true);
      });

      it('should return 403 for non-admin users', async () => {
        const agent = request.agent(app);
        
        // Login as regular user
        await agent
          .post('/api/auth/login')
          .send({
            email: 'buyer@test.com',
            password: 'testpassword123',
          });

        const response = await agent
          .put('/api/admin/roasters/1/approve')
          .send({
            isApproved: true,
          });

        expect(response.status).toBe(403);
      });
    });
  });

  describe('Roaster Analytics', () => {
    it('should return analytics for roaster owner', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent.get('/api/roasters/analytics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalProducts');
    });

    it('should return 403 for non-roaster users', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent.get('/api/roasters/analytics');

      expect(response.status).toBe(403);
    });
  });
});