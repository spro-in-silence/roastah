import request from 'supertest';
import express from 'express';
import { registerRoutes } from '@server/routes';
import { testStorage } from '../utils/db-utils';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 2499,
        currency: 'usd',
        status: 'requires_payment_method',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 2499,
        currency: 'usd',
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: 'acct_test_123',
      }),
    },
    transfers: {
      create: jest.fn().mockResolvedValue({
        id: 'tr_test_123',
        amount: 2374, // After commission
        destination: 'acct_test_123',
      }),
    },
  }));
});

describe('Payment Processing', () => {
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

  describe('Payment Intent Creation', () => {
    it('should create payment intent for cart', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add items to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      // Create payment intent
      const response = await agent
        .post('/api/payments/create-intent')
        .send({
          currency: 'usd',
        });

      expect(response.status).toBe(200);
      expect(response.body.clientSecret).toBeTruthy();
      expect(response.body.amount).toBe(2499);
    });

    it('should validate cart is not empty', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to create payment intent with empty cart
      const response = await agent
        .post('/api/payments/create-intent')
        .send({
          currency: 'usd',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cart is empty');
    });

    it('should calculate correct total with commission', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add items to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 2,
          grindSize: 'medium',
        });

      // Create payment intent
      const response = await agent
        .post('/api/payments/create-intent')
        .send({
          currency: 'usd',
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(4998); // 2 * 2499
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send({
          currency: 'usd',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Payment Confirmation', () => {
    it('should confirm payment and create order', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add items to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      // Confirm payment
      const response = await agent
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.orderId).toBeTruthy();
      expect(response.body.status).toBe('confirmed');
    });

    it('should validate payment intent exists', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to confirm non-existent payment intent
      const response = await agent
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_nonexistent',
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
          },
        });

      expect(response.status).toBe(404);
    });

    it('should validate shipping address', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Try to confirm payment with invalid address
      const response = await agent
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          shippingAddress: {
            street: '',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Stripe Connect', () => {
    it('should create connected account for roaster', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Create Stripe account
      const response = await agent
        .post('/api/payments/create-account')
        .send({
          type: 'express',
          country: 'US',
          email: 'seller@test.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.accountId).toBeTruthy();
    });

    it('should create account link for onboarding', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Create account link
      const response = await agent
        .post('/api/payments/create-account-link')
        .send({
          accountId: 'acct_test_123',
          refreshUrl: 'http://localhost:3000/seller/payments/refresh',
          returnUrl: 'http://localhost:3000/seller/payments/return',
        });

      expect(response.status).toBe(200);
      expect(response.body.url).toBeTruthy();
    });

    it('should transfer funds to connected account', async () => {
      // This would be called during order processing
      const agent = request.agent(app);
      
      // Login as admin or system
      await agent
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword123',
        });

      // Transfer funds
      const response = await agent
        .post('/api/payments/transfer')
        .send({
          amount: 2374, // After commission
          destination: 'acct_test_123',
          orderId: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.transferId).toBeTruthy();
    });
  });

  describe('Commission Calculation', () => {
    it('should calculate commission correctly', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add items to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      // Get commission calculation
      const response = await agent.get('/api/payments/commission-preview');

      expect(response.status).toBe(200);
      expect(response.body.subtotal).toBe(2499);
      expect(response.body.commission).toBe(125); // 5% of 2499
      expect(response.body.sellerAmount).toBe(2374);
    });

    it('should create commission records', async () => {
      const agent = request.agent(app);
      
      // Login as buyer
      await agent
        .post('/api/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'testpassword123',
        });

      // Add items to cart
      const productsResponse = await agent.get('/api/products');
      const product = productsResponse.body[0];

      await agent
        .post('/api/cart')
        .send({
          productId: product.id,
          quantity: 1,
          grindSize: 'medium',
        });

      // Confirm payment (should create commission record)
      const response = await agent
        .post('/api/payments/confirm')
        .send({
          paymentIntentId: 'pi_test_123',
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'US',
          },
        });

      expect(response.status).toBe(200);
      
      // Check commission was created
      const commissionResponse = await agent.get('/api/seller/commissions');
      expect(commissionResponse.body.length).toBe(1);
      expect(commissionResponse.body[0].amount).toBe(125);
    });
  });

  describe('Refund Processing', () => {
    it('should process refunds for authorized users', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Process refund
      const response = await agent
        .post('/api/payments/refund')
        .send({
          paymentIntentId: 'pi_test_123',
          amount: 2499,
          reason: 'customer_request',
        });

      expect(response.status).toBe(200);
      expect(response.body.refundId).toBeTruthy();
    });

    it('should validate refund amount', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Try to refund more than original amount
      const response = await agent
        .post('/api/payments/refund')
        .send({
          paymentIntentId: 'pi_test_123',
          amount: 5000, // More than original
          reason: 'customer_request',
        });

      expect(response.status).toBe(400);
    });

    it('should handle partial refunds', async () => {
      const agent = request.agent(app);
      
      // Login as seller
      await agent
        .post('/api/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'testpassword123',
        });

      // Process partial refund
      const response = await agent
        .post('/api/payments/refund')
        .send({
          paymentIntentId: 'pi_test_123',
          amount: 1000, // Partial amount
          reason: 'customer_request',
        });

      expect(response.status).toBe(200);
      expect(response.body.refundId).toBeTruthy();
    });
  });

  describe('Payment Webhooks', () => {
    it('should handle successful payment webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
            amount: 2499,
          },
        },
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });

    it('should handle failed payment webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'requires_payment_method',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookPayload);

      expect(response.status).toBe(200);
    });

    it('should validate webhook signature', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
          },
        },
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'invalid-signature')
        .send(webhookPayload);

      expect(response.status).toBe(400);
    });
  });
});