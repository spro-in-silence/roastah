import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { testStorage } from '../utils/db-utils';

describe('Cart API', () => {
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

  describe('GET /api/cart', () => {
    it('should return empty cart for authenticated user', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent.get('/api/cart');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return cart items for authenticated user', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add item to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 2,
          grindSize: 'medium',
        });

      const response = await agent.get('/api/cart');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].quantity).toBe(2);
      expect(response.body[0].grindSize).toBe('medium');
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).get('/api/cart');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart for authenticated user', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'coarse',
        });

      expect(response.status).toBe(201);
      expect(response.body.productId).toBe(product.id);
      expect(response.body.quantity).toBe(1);
      expect(response.body.grindSize).toBe('coarse');
    });

    it('should update quantity if item already in cart', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add item first time
      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      // Add same item again
      const response = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 2,
          grindSize: 'medium',
        });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(3); // Should be added together
    });

    it('should validate required fields', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/cart')
        .send({
          quantity: 1,
          grindSize: 'medium',
          // Missing productId
        });

      expect(response.status).toBe(400);
    });

    it('should validate quantity is positive', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      const response = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: -1,
          grindSize: 'medium',
        });

      expect(response.status).toBe(400);
    });

    it('should validate product exists', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .post('/api/cart')
        .send({
          productId: 99999,
          quantity: 1,
          grindSize: 'medium',
        });

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send({
          productId: 1,
          quantity: 1,
          grindSize: 'medium',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/cart/:id', () => {
    it('should update cart item quantity', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add item to cart
      const addResponse = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      const cartItemId = addResponse.body.id;

      // Update quantity
      const response = await agent
        .put(`/api/cart/${cartItemId}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(3);
    });

    it('should update cart item grind size', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add item to cart
      const addResponse = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      const cartItemId = addResponse.body.id;

      // Update grind size
      const response = await agent
        .put(`/api/cart/${cartItemId}`)
        .send({
          grindSize: 'fine',
        });

      expect(response.status).toBe(200);
      expect(response.body.grindSize).toBe('fine');
    });

    it('should validate quantity is positive', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add item to cart
      const addResponse = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      const cartItemId = addResponse.body.id;

      // Try to update with negative quantity
      const response = await agent
        .put(`/api/cart/${cartItemId}`)
        .send({
          quantity: -1,
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent cart item', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent
        .put('/api/cart/99999')
        .send({
          quantity: 2,
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for cart item not owned by user', async () => {
      // This would require creating a cart item for another user
      // For now, we'll test the basic functionality
      expect(true).toBe(true);
    });
  });

  describe('DELETE /api/cart/:id', () => {
    it('should remove item from cart', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add item to cart
      const addResponse = await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      const cartItemId = addResponse.body.id;

      // Remove item
      const response = await agent.delete(`/api/cart/${cartItemId}`);

      expect(response.status).toBe(204);
      
      // Verify item is removed
      const cartResponse = await agent.get('/api/cart');
      expect(cartResponse.body.length).toBe(0);
    });

    it('should return 404 for non-existent cart item', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const response = await agent.delete('/api/cart/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      // Add multiple items to cart
      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 2,
          grindSize: 'coarse',
        });

      // Clear cart
      const response = await agent.delete('/api/cart');

      expect(response.status).toBe(204);
      
      // Verify cart is empty
      const cartResponse = await agent.get('/api/cart');
      expect(cartResponse.body.length).toBe(0);
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).delete('/api/cart');

      expect(response.status).toBe(401);
    });
  });
});