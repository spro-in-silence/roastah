import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { testStorage } from '../utils/db-utils';

describe('Products API', () => {
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

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
    });

    it('should filter products by origin', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ origin: 'Ethiopia' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((product: any) => {
        expect(product.origin).toBe('Ethiopia');
      });
    });

    it('should filter products by roast level', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ roastLevel: 'medium' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((product: any) => {
        expect(product.roastLevel).toBe('medium');
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ minPrice: 2000, maxPrice: 3000 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(2000);
        expect(product.price).toBeLessThanOrEqual(3000);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return specific product', async () => {
      const productsResponse = await request(app).get('/api/products');
      const productId = productsResponse.body[0].id;

      const response = await request(app).get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/99999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/products', () => {
    it('should create product for authenticated roaster', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/products')
        .send({
          name: 'New Test Coffee',
          description: 'A new test coffee product',
          price: 2799,
          roastLevel: 'light',
          origin: 'Kenya',
          inStock: true,
          imageUrl: 'https://example.com/coffee.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Test Coffee');
      expect(response.body.price).toBe(2799);
    });

    it('should reject product creation for non-roaster', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/products')
        .send({
          name: 'New Test Coffee',
          description: 'A new test coffee product',
          price: 2799,
          roastLevel: 'light',
          origin: 'Kenya',
          inStock: true,
        });

      expect(response.status).toBe(403);
    });

    it('should reject product creation for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'New Test Coffee',
          description: 'A new test coffee product',
          price: 2799,
          roastLevel: 'light',
          origin: 'Kenya',
          inStock: true,
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/products')
        .send({
          name: '',
          description: 'A test coffee product',
          price: 2799,
        });

      expect(response.status).toBe(400);
    });

    it('should validate price is positive', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/products')
        .send({
          name: 'Test Coffee',
          description: 'A test coffee product',
          price: -100,
          roastLevel: 'medium',
          origin: 'Brazil',
          inStock: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product for owner', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Get product owned by this seller
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent
        .put(`/api/products/${product.id}`)
        .send({
          name: 'Updated Coffee Name',
          price: 3000,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Coffee Name');
      expect(response.body.price).toBe(3000);
    });

    it('should reject update for non-owner', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to update a product not owned by this user
      const productsResponse = await request(app).get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent
        .put(`/api/products/${product.id}`)
        .send({
          name: 'Updated Coffee Name',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .put('/api/products/99999')
        .send({
          name: 'Updated Coffee Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product for owner', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Get product owned by this seller
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent.delete(`/api/products/${product.id}`);

      expect(response.status).toBe(204);
      
      // Verify product is deleted
      const getResponse = await request(app).get(`/api/products/${product.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should reject delete for non-owner', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to delete a product not owned by this user
      const productsResponse = await request(app).get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent.delete(`/api/products/${product.id}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      const response = await agent.delete('/api/products/99999');

      expect(response.status).toBe(404);
    });
  });
});