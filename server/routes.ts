import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import * as fs from "fs";
import { storage } from "./storage";
import { setupAuthentication } from "./auth-router";
import { getDb } from "./db";
import { eq, and, gte, desc, asc } from "drizzle-orm";
import { 
  authLimiter, paymentLimiter, uploadLimiter, 
  validateProductCreation, validateRoasterApplication, 
  validateCartOperation, validatePaymentIntent, 
  validateIdParam, handleValidationErrors,
  enhancedAuthCheck, requireRole 
} from "./security";
import { 
  generateMFASetup, verifyMFAToken, verifyBackupCode, 
  requireMFA, requireStepUpAuth, hasMFAEnabled, logSecurityEvent 
} from "./mfa";
import { 
  roasters, products, cartItems, orders, orderItems, reviews, 
  wishlist, notifications, commissions, sellerAnalytics, campaigns,
  bulkUploads, disputes
} from "@shared/schema";
import { MedusaBridge } from "./medusa-bridge";
import { realtimeService } from "./realtime";
import { insertProductSchema, insertRoasterSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

// Stripe will be initialized after secrets are loaded
let stripe: Stripe | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe after secrets are loaded
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  
  // Setup authentication (automatically chooses Replit Auth or OAuth based on environment)
  const { isAuthenticated } = await setupAuthentication(app);

  // Configuration endpoint - serves public configuration from GCP Secret Manager
  app.get('/api/config', async (req: any, res: any) => {
    try {
      // Import the getSecret function to load VITE_STRIPE_PUBLIC_KEY
      const { getSecret } = await import('./secrets');
      
      // Load the VITE_STRIPE_PUBLIC_KEY from GCP Secret Manager
      const stripePublicKey = await getSecret('VITE_STRIPE_PUBLIC_KEY');
      
      if (!stripePublicKey) {
        console.error('VITE_STRIPE_PUBLIC_KEY not found in secrets');
        return res.status(500).json({ error: 'Stripe configuration not available' });
      }
      
      res.json({
        stripe: {
          publicKey: stripePublicKey
        }
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      res.status(500).json({ error: 'Failed to load configuration' });
    }
  });

  // Initialize MedusaJS bridge
  const medusaBridge = new MedusaBridge(app);
  medusaBridge.setupRoutes();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Check if there's an impersonated user first, then fallback to authenticated user
      const userId = req.session.user?.sub || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get roaster info if user is a roaster
      let roaster = null;
      if (user?.role === 'roaster') {
        roaster = await storage.getRoasterByUserId(userId);
      }
      
      // Include MFA status in response
      const response = { 
        ...user, 
        roaster,
        mfaRequired: !!(roaster || user?.role === 'admin'),
        hasMFA: await hasMFAEnabled(userId)
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      logSecurityEvent(req.user?.claims?.sub, 'user_fetch_error', { error: String(error) }, req);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // MFA Security Endpoints
  app.post('/api/auth/mfa/setup', authLimiter, enhancedAuthCheck, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ error: 'Email required for MFA setup' });
      }

      if (user.mfaEnabled) {
        return res.status(400).json({ error: 'MFA already enabled' });
      }

      const mfaSetup = await generateMFASetup(userId, user.email);
      
      // Store the secret temporarily (not enabled until verified)
      await storage.updateUserMFA(userId, { 
        mfaSecret: mfaSetup.secret,
        backupCodes: mfaSetup.backupCodes 
      });

      logSecurityEvent(userId, 'mfa_setup_initiated', {}, req);
      
      res.json({
        qrCodeUrl: mfaSetup.qrCodeUrl,
        backupCodes: mfaSetup.backupCodes,
        secret: mfaSetup.secret // For manual entry
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({ error: 'Failed to setup MFA' });
    }
  });

  app.post('/api/auth/mfa/verify-setup', authLimiter, enhancedAuthCheck, async (req: any, res) => {
    try {
      const { token } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);

      if (!user?.mfaSecret) {
        return res.status(400).json({ error: 'MFA setup not initiated' });
      }

      if (!verifyMFAToken(user.mfaSecret, token)) {
        logSecurityEvent(userId, 'mfa_setup_failed', { token: token.substring(0, 2) + '****' }, req);
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      // Enable MFA
      await storage.updateUserMFA(userId, { mfaEnabled: true });
      
      logSecurityEvent(userId, 'mfa_enabled', {}, req);
      res.json({ success: true, message: 'MFA enabled successfully' });
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({ error: 'Failed to verify MFA' });
    }
  });

  app.post('/api/auth/mfa/verify', authLimiter, enhancedAuthCheck, async (req: any, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);

      if (!user?.mfaEnabled || !user?.mfaSecret) {
        return res.status(400).json({ error: 'MFA not enabled' });
      }

      let verified = false;

      // Try MFA token first
      if (token) {
        verified = verifyMFAToken(user.mfaSecret, token);
      }

      // Try backup code if token fails
      if (!verified && backupCode) {
        verified = await verifyBackupCode(userId, backupCode);
      }

      if (!verified) {
        logSecurityEvent(userId, 'mfa_verification_failed', { 
          hasToken: !!token, 
          hasBackupCode: !!backupCode 
        }, req);
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      // Set MFA verified in session
      req.session.mfaVerified = true;
      req.session.mfaVerifiedAt = Date.now();

      logSecurityEvent(userId, 'mfa_verified', {}, req);
      res.json({ success: true, message: 'MFA verified successfully' });
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({ error: 'Failed to verify MFA' });
    }
  });

  app.post('/api/auth/mfa/disable', authLimiter, enhancedAuthCheck, requireStepUpAuth, async (req: any, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);

      if (!user?.mfaEnabled) {
        return res.status(400).json({ error: 'MFA not enabled' });
      }

      let verified = false;

      // Require MFA verification to disable
      if (token && user.mfaSecret) {
        verified = verifyMFAToken(user.mfaSecret, token);
      }

      if (!verified && backupCode) {
        verified = await verifyBackupCode(userId, backupCode);
      }

      if (!verified) {
        logSecurityEvent(userId, 'mfa_disable_failed', {}, req);
        return res.status(400).json({ error: 'MFA verification required to disable' });
      }

      // Disable MFA
      await storage.updateUserMFA(userId, { 
        mfaEnabled: false,
        mfaSecret: undefined,
        backupCodes: undefined
      });

      // Clear MFA session
      req.session.mfaVerified = false;
      delete req.session.mfaVerifiedAt;

      logSecurityEvent(userId, 'mfa_disabled', {}, req);
      res.json({ success: true, message: 'MFA disabled successfully' });
    } catch (error) {
      console.error('MFA disable error:', error);
      res.status(500).json({ error: 'Failed to disable MFA' });
    }
  });

  app.post('/api/auth/step-up', authLimiter, enhancedAuthCheck, async (req: any, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);

      if (user?.mfaEnabled) {
        let verified = false;

        if (token && user.mfaSecret) {
          verified = verifyMFAToken(user.mfaSecret, token);
        }

        if (!verified && backupCode) {
          verified = await verifyBackupCode(userId, backupCode);
        }

        if (!verified) {
          logSecurityEvent(userId, 'step_up_failed', {}, req);
          return res.status(400).json({ error: 'Invalid verification code' });
        }
      }

      // Set step-up verification
      req.session.stepUpVerifiedAt = Date.now();

      logSecurityEvent(userId, 'step_up_verified', {}, req);
      res.json({ success: true, message: 'Step-up authentication successful' });
    } catch (error) {
      console.error('Step-up auth error:', error);
      res.status(500).json({ error: 'Failed to verify step-up authentication' });
    }
  });

  // Development ADC check endpoint (only for dev environments)
  app.get('/api/dev/check-adc', async (req: any, res) => {
    // Only allow in development environments
    const isDev = process.env.NODE_ENV !== 'production' && 
                  (process.env.REPL_ID || req.get('host')?.includes('localhost'));
    
    if (!isDev) {
      return res.status(404).json({ error: 'Not found' });
    }

    // For localhost, always return true to bypass credentials check
    if (req.get('host')?.includes('localhost')) {
      console.log('ADC check: Localhost detected, skipping Google Cloud credentials check');
      return res.json({ hasCredentials: true });
    }

    try {
      // Use the same SecretManagerServiceClient that's already working
      const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();
      
      // Try to access a test secret to verify credentials
      const testSecretName = `projects/${process.env.GOOGLE_CLOUD_PROJECT || 'roastah-d'}/secrets/DATABASE_URL/versions/latest`;
      await client.accessSecretVersion({ name: testSecretName });
      
      res.json({ hasCredentials: true });
    } catch (error: any) {
      console.log('ADC check failed:', error?.message || String(error));
      res.json({ hasCredentials: false });
    }
  });

  // Development impersonation endpoint (only for dev environments)
  app.post('/api/dev/impersonate', async (req: any, res) => {
    // Only allow in development environments
    const isDev = process.env.NODE_ENV !== 'production' && 
                  (process.env.REPL_ID || req.get('host')?.includes('localhost'));
    
    if (!isDev) {
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      const { userType } = req.body;
      
      if (!['buyer', 'seller'].includes(userType)) {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      // Create or get development user
      const devUserId = userType === 'seller' ? 'dev-seller-001' : 'dev-buyer-001';
      const devUserData = {
        id: devUserId,
        email: userType === 'seller' ? 'dev-seller@roastah.com' : 'dev-buyer@roastah.com',
        firstName: userType === 'seller' ? 'Development' : 'Development',
        lastName: userType === 'seller' ? 'Seller' : 'Buyer',
        role: userType === 'seller' ? 'roaster' : 'user',
        isRoasterApproved: userType === 'seller',
        mfaEnabled: false,
      };

      // Upsert the development user
      await storage.upsertUser(devUserData);

      // Create roaster profile for seller
      if (userType === 'seller') {
        const existingRoaster = await storage.getRoasterByUserId(devUserId);
        if (!existingRoaster) {
          const roaster = await storage.createRoaster({
            userId: devUserId,
            businessName: 'Development Coffee Roasters',
            businessType: 'home_roaster',
            description: 'A development roastery for testing purposes',
          });

          // Create sample products for development
          const sampleProducts = [
            {
              roasterId: roaster.id,
              name: 'Ethiopia Yirgacheffe',
              description: 'Bright and floral with notes of lemon and tea',
              price: '18.99',
              stockQuantity: 100,
              origin: 'Ethiopia',
              roastLevel: 'Light',
              process: 'Washed',
              altitude: '1700-2100m',
              varietal: 'Heirloom',
              tastingNotes: 'Lemon, bergamot, floral, tea-like',
              state: 'published',
              images: ['/images/sample-coffee-1.jpg']
            },
            {
              roasterId: roaster.id,
              name: 'Colombia Huila',
              description: 'Sweet and balanced with chocolate notes',
              price: '16.99',
              stockQuantity: 85,
              origin: 'Colombia',
              roastLevel: 'Medium',
              process: 'Washed',
              altitude: '1200-1800m',
              varietal: 'Caturra, Typica',
              tastingNotes: 'Milk chocolate, caramel, orange',
              state: 'published',
              images: ['/images/sample-coffee-2.jpg']
            },
            {
              roasterId: roaster.id,
              name: 'Guatemala Antigua',
              description: 'Full-bodied with smoky undertones',
              price: '17.99',
              stockQuantity: 60,
              origin: 'Guatemala',
              roastLevel: 'Dark',
              process: 'Washed',
              altitude: '1500-1700m',
              varietal: 'Bourbon, Typica',
              tastingNotes: 'Dark chocolate, smoke, spice',
              state: 'published',
              images: ['/images/sample-coffee-3.jpg']
            }
          ];

          for (const product of sampleProducts) {
            await storage.createProduct(product);
          }
        }
      }

      // Create session manually for development
      if (req.session) {
        req.session.user = {
          id: devUserId,
          email: devUserData.email,
          name: `${devUserData.firstName} ${devUserData.lastName}`,
          sub: devUserId,
        };
        req.session.tokens = {
          accessToken: 'dev-access-token',
          refreshToken: 'dev-refresh-token',
        };
        
        // Set up req.user for enhancedAuthCheck compatibility
        req.user = {
          claims: {
            sub: devUserId,
            email: devUserData.email,
            name: `${devUserData.firstName} ${devUserData.lastName}`,
            role: devUserData.role
          }
        };
      }

      res.json({ 
        success: true, 
        user: {
          ...devUserData,
          name: `${devUserData.firstName} ${devUserData.lastName}`
        },
        message: `Successfully impersonating ${userType}` 
      });
    } catch (error) {
      console.error('Impersonation error:', error);
      res.status(500).json({ error: 'Failed to impersonate user' });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { roastLevel, origin, minPrice, maxPrice } = req.query;
      const filters: any = {};
      
      if (roastLevel) filters.roastLevel = roastLevel as string;
      if (origin) filters.origin = origin as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Roaster routes
  app.post('/api/roaster/apply', authLimiter, enhancedAuthCheck, validateRoasterApplication, handleValidationErrors, async (req: any, res: any) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const validatedData = insertRoasterSchema.parse({
        ...req.body,
        userId,
      });
      
      const roaster = await storage.createRoaster(validatedData);
      res.json(roaster);
    } catch (error) {
      console.error("Error creating roaster:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create roaster application" });
    }
  });

  app.get('/api/roaster/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const products = await storage.getProductsByRoaster(roaster.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching roaster products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/roaster/products', authLimiter, enhancedAuthCheck, requireRole('roaster'), validateProductCreation, handleValidationErrors, async (req: any, res: any) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const validatedData = insertProductSchema.parse({
        ...req.body,
        roasterId: roaster.id,
      });
      
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/roaster/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const product = await storage.getProductById(productId);
      
      if (!product || product.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put('/api/roaster/products/:id', authLimiter, enhancedAuthCheck, requireRole('roaster'), validateProductCreation, handleValidationErrors, async (req: any, res: any) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const existingProduct = await storage.getProductById(productId);
      
      if (!existingProduct || existingProduct.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const validatedData = insertProductSchema.partial().parse({
        ...req.body,
        roasterId: roaster.id,
      });
      
      const product = await storage.updateProduct(productId, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.patch('/api/roaster/products/:id', authLimiter, enhancedAuthCheck, requireRole('roaster'), async (req: any, res: any) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const existingProduct = await storage.getProductById(productId);
      
      if (!existingProduct || existingProduct.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/roaster/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Product state management routes
  app.patch('/api/roaster/products/:id/state', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { state } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }

      // Validate state transition
      const validStates = ['draft', 'pending_review', 'published', 'archived', 'rejected'];
      if (!validStates.includes(state)) {
        return res.status(400).json({ message: "Invalid state" });
      }

      const product = await storage.updateProduct(id, { state });
      res.json(product);
    } catch (error) {
      console.error("Error updating product state:", error);
      res.status(500).json({ message: "Failed to update product state" });
    }
  });

  // Product tag management routes
  app.patch('/api/roaster/products/:id/tags', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }

      // Extract valid tag fields
      const validTags = ['isUnlisted', 'isPreorder', 'isPrivate', 'isOutOfStock', 'isScheduled'];
      const tagUpdates: any = {};
      
      for (const [key, value] of Object.entries(req.body)) {
        if (validTags.includes(key) && typeof value === 'boolean') {
          tagUpdates[key] = value;
        }
      }

      if (Object.keys(tagUpdates).length === 0) {
        return res.status(400).json({ message: "No valid tag updates provided" });
      }

      const product = await storage.updateProduct(id, tagUpdates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product tags:", error);
      res.status(500).json({ message: "Failed to update product tags" });
    }
  });

  // Cart routes
  app.get('/api/cart', enhancedAuthCheck, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const cartItems = await storage.getCartByUserId(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', enhancedAuthCheck, validateCartOperation, handleValidationErrors, async (req: any, res: any) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/roaster/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      const orderItems = await storage.getOrderItemsByRoaster(roaster.id);
      res.json(orderItems);
    } catch (error) {
      console.error("Error fetching roaster orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Enhanced payment processing with commission tracking
  app.post("/api/create-payment-intent", paymentLimiter, enhancedAuthCheck, validatePaymentIntent, handleValidationErrors, async (req: any, res: any) => {
    try {
      const { amount, cartItems, metadata = {} } = req.body;
      
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          cartItems: JSON.stringify(cartItems || []),
          userId: (req.user as any)?.claims?.sub || '',
          ...metadata
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook for automated commission processing (simplified for development)
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      // In production, verify webhook signature here
      const paymentIntent = req.body.data?.object;
      
      if (req.body.type === 'payment_intent.succeeded' && paymentIntent) {
        await processCommissionsAndCreateOrder(paymentIntent);
      }
      
      res.json({received: true});
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Process commissions and create order after payment
  async function processCommissionsAndCreateOrder(paymentIntent: any) {
    try {
      if (!paymentIntent.metadata.cartItems || !paymentIntent.metadata.userId) return;
      
      const cartItems = JSON.parse(paymentIntent.metadata.cartItems);
      const userId = paymentIntent.metadata.userId;
      const totalAmount = paymentIntent.amount / 100;

      // Create order
      const order = await storage.createOrder({
        userId,
        totalAmount: totalAmount.toString(),
        status: 'confirmed',
        stripePaymentIntentId: paymentIntent.id,
        shippingAddress: {}
      });

      // Process each cart item for commissions
      for (const item of cartItems) {
        const product = await storage.getProductById(item.productId);
        if (!product) continue;

        const saleAmount = parseFloat(item.price) * item.quantity;
        const commissionRate = 0.085; // 8.5% platform fee
        const commissionAmount = saleAmount * commissionRate;
        const platformFee = commissionAmount;
        const roasterEarnings = saleAmount - platformFee;

        // Create order item
        const orderItem = await getDb().insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          roasterId: product.roasterId,
          quantity: item.quantity,
          price: item.price,
          status: 'processing'
        }).returning();

        // Create commission record
        await storage.createCommission({
          roasterId: product.roasterId,
          orderId: order.id,
          orderItemId: orderItem[0].id,
          saleAmount: saleAmount.toString(),
          commissionRate: commissionRate.toString(),
          commissionAmount: commissionAmount.toString(),
          platformFee: platformFee.toString(),
          roasterEarnings: roasterEarnings.toString(),
          status: 'pending'
        });

        // Update seller analytics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await storage.updateSellerAnalytics(product.roasterId, today, {
          totalSales: saleAmount.toString(),
          totalOrders: 1,
          avgOrderValue: saleAmount.toString()
        });
      }

      // Clear user's cart
      await storage.clearCart(userId);
      
    } catch (error) {
      console.error('Error processing commissions:', error);
    }
  }

  // Automated payout processing for sellers
  app.post('/api/admin/process-payouts', isAuthenticated, async (req, res) => {
    try {
      // Get all pending commissions grouped by roaster
      const pendingCommissions = await getDb()
        .select()
        .from(commissions)
        .where(eq(commissions.status, 'pending'));

      const payoutsByRoaster = new Map();
      
      for (const commission of pendingCommissions) {
        if (!payoutsByRoaster.has(commission.roasterId)) {
          payoutsByRoaster.set(commission.roasterId, []);
        }
        payoutsByRoaster.get(commission.roasterId).push(commission);
      }

      const payoutResults = [];

      for (const [roasterId, roasterCommissions] of Array.from(payoutsByRoaster)) {
        const roaster = await storage.getRoasterByUserId(roasterId.toString());
        if (!roaster) continue;

        const totalPayout = roasterCommissions.reduce((sum: number, c: any) => 
          sum + parseFloat(c.roasterEarnings), 0);

        if (totalPayout < 10) continue; // $10 minimum payout threshold

        try {
          // For now, simulate payout processing
          // In production, integrate with Stripe Connect for real transfers
          console.log(`Processing payout of $${totalPayout} for roaster ${roasterId}`);

          // Mark commissions as paid
          for (const commission of roasterCommissions) {
            await storage.updateCommissionStatus(commission.id, 'paid', new Date());
          }

          payoutResults.push({
            roasterId,
            roasterName: roaster.businessName,
            amount: totalPayout,
            commissionCount: roasterCommissions.length,
            status: 'success'
          });
        } catch (error: any) {
          payoutResults.push({
            roasterId,
            amount: totalPayout,
            error: error.message,
            status: 'failed'
          });
        }
      }

      res.json({ 
        message: `Processed ${payoutResults.length} payouts`,
        payouts: payoutResults 
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Error processing payouts: ' + error.message });
    }
  });

  // File upload configuration
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Bulk product upload with CSV processing
  app.post('/api/roaster/bulk-upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const roaster = await storage.getRoasterByUserId(req.session.user?.sub || req.user?.id);
      if (!roaster) {
        return res.status(403).json({ message: 'Roaster profile required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Create bulk upload record
      const bulkUpload = await storage.createBulkUpload({
        roasterId: roaster.id,
        fileName: req.file.originalname,
        status: 'processing'
      });

      // Process CSV file asynchronously
      processCsvFile(req.file.path, bulkUpload.id, roaster.id);

      res.json({
        uploadId: bulkUpload.id,
        message: 'File upload started. Processing in background.'
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
  });

  // CSV file processing function
  async function processCsvFile(filePath: string, uploadId: number, roasterId: number) {
    const results: any[] = [];
    const errors: string[] = [];
    let totalRows = 0;
    let processedRows = 0;
    let successfulRows = 0;

    try {
      // Read and parse CSV file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      totalRows = lines.length - 1; // Exclude header

      await storage.updateBulkUploadStatus(uploadId, 'processing', {
        totalRows
      });

      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        if (row.length < 5) {
          errors.push(`Row ${i}: Insufficient columns`);
          processedRows++;
          continue;
        }

        try {
          // Expected CSV format: name,description,price,roastLevel,origin,process,stockQuantity,tastingNotes
          const [name, description, price, roastLevel, origin, process, stockQuantity, tastingNotes] = row;

          if (!name || !description || !price) {
            errors.push(`Row ${i}: Missing required fields (name, description, price)`);
            processedRows++;
            continue;
          }

          const priceNum = parseFloat(price);
          const stockNum = parseInt(stockQuantity) || 0;

          if (isNaN(priceNum) || priceNum <= 0) {
            errors.push(`Row ${i}: Invalid price format`);
            processedRows++;
            continue;
          }

          // Create product
          await storage.createProduct({
            roasterId,
            name,
            description,
            price: priceNum.toString(),
            roastLevel: roastLevel || 'medium',
            origin: origin || '',
            process: process || '',
            stockQuantity: stockNum,
            tastingNotes: tastingNotes || '',
            isActive: true,
            images: []
          });

          successfulRows++;
        } catch (productError: any) {
          errors.push(`Row ${i}: ${productError.message}`);
        }

        processedRows++;

        // Update progress periodically
        if (processedRows % 10 === 0) {
          await storage.updateBulkUploadStatus(uploadId, 'processing', {
            processedRows,
            successfulRows,
            errors: errors.slice(-50) // Keep last 50 errors
          });
        }
      }

      // Mark as completed
      await storage.updateBulkUploadStatus(uploadId, 'completed', {
        processedRows,
        successfulRows,
        errors
      });

    } catch (error: any) {
      await storage.updateBulkUploadStatus(uploadId, 'failed', {
        processedRows,
        successfulRows,
        errors: [...errors, `Processing error: ${error.message}`]
      });
    } finally {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to clean up file:', cleanupError);
      }
    }
  }

  // Get bulk upload status
  app.get('/api/roaster/bulk-uploads', isAuthenticated, async (req: any, res) => {
    try {
      const roaster = await storage.getRoasterByUserId(req.session.user?.sub || req.user?.id);
      if (!roaster) {
        return res.status(403).json({ message: 'Roaster profile required' });
      }

      const uploads = await storage.getBulkUploadsByRoaster(roaster.id);
      res.json(uploads);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch uploads: ' + error.message });
    }
  });

  // Download CSV template
  app.get('/api/csv-template', (req, res) => {
    const csvTemplate = `name,description,price,roastLevel,origin,process,stockQuantity,tastingNotes
Ethiopian Yirgacheffe,Bright and floral single origin,24.99,light,Ethiopia,washed,50,citrus and floral notes
Colombian Supremo,Rich and balanced,22.99,medium,Colombia,washed,75,chocolate and caramel
French Roast Dark,Bold and smoky,19.99,dark,Brazil,natural,100,smoky and bold`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bulk-upload-template.csv');
    res.send(csvTemplate);
  });

  // Review routes
  app.post('/api/products/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.session.user?.sub || req.user?.id;
      const reviewData = { ...req.body, userId, productId };
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const wishlistItems = await storage.getWishlistByUserId(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const { productId } = req.body;
      
      const wishlistItem = await storage.addToWishlist({ userId, productId });
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Advanced Seller Tools - Analytics
  app.get('/api/analytics/:roasterId', isAuthenticated, async (req: any, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const analytics = await storage.getSellerAnalyticsByRoaster(roasterId, start, end);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Commission tracking
  app.get('/api/commissions/:roasterId', isAuthenticated, async (req: any, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const commissions = await storage.getCommissionsByRoaster(roasterId);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  app.post('/api/commissions', isAuthenticated, async (req, res) => {
    try {
      const commission = await storage.createCommission(req.body);
      res.json(commission);
    } catch (error) {
      console.error("Error creating commission:", error);
      res.status(500).json({ message: "Failed to create commission" });
    }
  });

  // Campaign management
  app.get('/api/campaigns/:roasterId', isAuthenticated, async (req: any, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const campaigns = await storage.getCampaignsByRoaster(roasterId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns', isAuthenticated, async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.put('/api/campaigns/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.updateCampaign(id, req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Bulk upload management
  app.get('/api/bulk-uploads/:roasterId', isAuthenticated, async (req: any, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const uploads = await storage.getBulkUploadsByRoaster(roasterId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching bulk uploads:", error);
      res.status(500).json({ message: "Failed to fetch bulk uploads" });
    }
  });

  app.post('/api/bulk-upload', isAuthenticated, async (req: any, res) => {
    try {
      // This would typically handle file upload and CSV parsing
      // For now, return a placeholder response
      const upload = await storage.createBulkUpload({
        roasterId: parseInt(req.body.roasterId),
        fileName: req.body.fileName || 'products.csv',
        status: 'processing',
        totalRows: 0,
        processedRows: 0,
        successfulRows: 0,
      });
      
      res.json(upload);
    } catch (error) {
      console.error("Error creating bulk upload:", error);
      res.status(500).json({ message: "Failed to create bulk upload" });
    }
  });

  // Dispute management
  app.get('/api/disputes/roaster/:roasterId', isAuthenticated, async (req: any, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const disputes = await storage.getDisputesByRoaster(roasterId);
      res.json(disputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get('/api/disputes/customer/:customerId', isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.params.customerId;
      const disputes = await storage.getDisputesByCustomer(customerId);
      res.json(disputes);
    } catch (error) {
      console.error("Error fetching customer disputes:", error);
      res.status(500).json({ message: "Failed to fetch customer disputes" });
    }
  });

  app.post('/api/disputes', isAuthenticated, async (req, res) => {
    try {
      const dispute = await storage.createDispute(req.body);
      res.json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.put('/api/disputes/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, resolution } = req.body;
      await storage.updateDisputeStatus(id, status, resolution);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating dispute:", error);
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { dateRange = 'all', limit = '10' } = req.query;
      const leaderboard = await storage.getLeaderboard(
        dateRange as string, 
        parseInt(limit as string)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  app.post('/api/roasters/:id/update-metrics', isAuthenticated, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.id);
      await storage.updateRoasterMetrics(roasterId);
      const score = await storage.calculateLeaderboardScore(roasterId);
      res.json({ success: true, leaderboardScore: score });
    } catch (error) {
      console.error('Error updating roaster metrics:', error);
      res.status(500).json({ message: 'Failed to update metrics' });
    }
  });

  // Favorites routes - Toggle functionality
  app.post('/api/favorites/roasters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      
      console.log(`Toggle favorite - User: ${userId}, Roaster: ${roasterId}`);
      
      if (!roasterId || isNaN(roasterId)) {
        return res.status(400).json({ message: "Invalid roaster ID" });
      }
      
      // Check if roaster exists
      const roasterExists = await storage.getRoasterById(roasterId);
      if (!roasterExists) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      
      // Check if already favorited - if so, remove it (toggle)
      const isAlreadyFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      
      if (isAlreadyFavorite) {
        // Remove from favorites
        await storage.removeFavoriteRoaster(userId, roasterId);
        console.log(`Favorite removed successfully for roaster ${roasterId}`);
        res.json({ action: 'removed', isFavorite: false });
      } else {
        // Add to favorites
        const favorite = await storage.addFavoriteRoaster(userId, roasterId);
        console.log(`Favorite added successfully:`, favorite);
        res.json({ action: 'added', isFavorite: true, favorite });
      }
    } catch (error) {
      console.error("Error toggling favorite roaster:", error);
      console.error("Error stack:", (error as Error).stack);
      res.status(500).json({ message: "Failed to toggle favorite roaster", error: (error as Error).message });
    }
  });

  // Check if roaster is favorited
  app.get('/api/favorites/roasters/:id/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      
      if (!roasterId || isNaN(roasterId)) {
        return res.status(400).json({ message: "Invalid roaster ID" });
      }
      
      const isFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite roaster:", error);
      res.status(500).json({ message: "Failed to check favorite roaster" });
    }
  });

  app.delete('/api/favorites/roasters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      
      await storage.removeFavoriteRoaster(userId, roasterId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite roaster:", error);
      res.status(500).json({ message: "Failed to remove favorite roaster" });
    }
  });

  app.get('/api/favorites/roasters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const favorites = await storage.getFavoriteRoastersByUser(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorite roasters:", error);
      res.status(500).json({ message: "Failed to fetch favorite roasters" });
    }
  });

  app.get('/api/favorites/roasters/:id/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      
      const isFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Real-time tracking routes
  app.get('/api/orders/:id/tracking', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const tracking = await storage.getOrderTracking(orderId);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      res.status(500).json({ message: "Failed to fetch order tracking" });
    }
  });

  app.post('/api/orders/:id/tracking', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const trackingData = { ...req.body, orderId };
      
      const tracking = await storage.createOrderTracking(trackingData);
      
      // Broadcast real-time update
      await realtimeService.broadcastOrderUpdate(orderId, tracking);
      
      res.json(tracking);
    } catch (error) {
      console.error("Error creating order tracking:", error);
      res.status(500).json({ message: "Failed to create order tracking" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.getOrderById(orderId);
      const oldStatus = order?.status;
      
      await storage.updateOrderStatus(orderId, status);
      
      // Broadcast status change
      if (oldStatus && oldStatus !== status) {
        await realtimeService.broadcastOrderStatusChange(orderId, status, oldStatus);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      
      // Broadcast real-time notification
      await realtimeService.broadcastNotification(notification);
      
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Gift card routes
  app.post('/api/gift-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const giftCardData = {
        ...req.body,
        purchaserId: userId,
        deliveryDate: new Date(req.body.deliveryDate),
      };

      const giftCard = await storage.createGiftCard(giftCardData);
      res.json(giftCard);
    } catch (error) {
      console.error("Error creating gift card:", error);
      res.status(500).json({ message: "Failed to create gift card" });
    }
  });

  app.get('/api/gift-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const giftCards = await storage.getGiftCardsByPurchaser(userId);
      res.json(giftCards);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });

  app.get('/api/gift-cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const giftCardId = parseInt(req.params.id);
      const giftCard = await storage.getGiftCardById(giftCardId);
      
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      
      res.json(giftCard);
    } catch (error) {
      console.error("Error fetching gift card:", error);
      res.status(500).json({ message: "Failed to fetch gift card" });
    }
  });

  app.post('/api/gift-cards/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const { code, amount } = req.body;
      
      const giftCard = await storage.getGiftCardByCode(code);
      
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      
      if (giftCard.status === 'redeemed') {
        return res.status(400).json({ message: "Gift card has already been fully redeemed" });
      }
      
      if (giftCard.status === 'expired') {
        return res.status(400).json({ message: "Gift card has expired" });
      }
      
      if (giftCard.expiresAt && new Date() > new Date(giftCard.expiresAt)) {
        await storage.updateGiftCardStatus(giftCard.id, 'expired');
        return res.status(400).json({ message: "Gift card has expired" });
      }
      
      const remainingBalance = parseFloat(giftCard.remainingBalance || giftCard.amount);
      
      if (amount > remainingBalance) {
        return res.status(400).json({ 
          message: "Insufficient balance", 
          remainingBalance 
        });
      }
      
      const updatedGiftCard = await storage.redeemGiftCard(code, userId, amount);
      res.json(updatedGiftCard);
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      res.status(500).json({ message: "Failed to redeem gift card" });
    }
  });

  // Address validation and saving
  app.post('/api/validate-address', isAuthenticated, async (req: any, res) => {
    try {
      const { addressLine1, addressLine2, city, state, zipCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      
      // Basic validation checks
      if (!addressLine1 || !city || !state || !zipCode) {
        return res.status(400).json({
          isValid: false,
          error: "Address line 1, city, state, and ZIP code are required"
        });
      }
      
      if (zipCode.length < 5) {
        return res.status(400).json({
          isValid: false,
          error: "Invalid ZIP code format"
        });
      }
      
      // Enhanced validation - check for common invalid patterns
      const invalidPatterns = [
        /^123\s/i, // Starts with "123 "
        /test/i,
        /fake/i,
        /invalid/i,
        /example/i
      ];
      
      const isInvalidAddress = invalidPatterns.some(pattern => 
        pattern.test(addressLine1) || 
        pattern.test(city) || 
        (addressLine2 && pattern.test(addressLine2))
      );
      
      if (isInvalidAddress) {
        return res.status(400).json({
          isValid: false,
          error: "Please enter a valid address"
        });
      }
      
      // Save the validated address to user profile
      const addressData = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : "",
        city: city.trim(),
        state: state.toUpperCase(),
        zipCode: zipCode.trim()
      };
      
      await storage.updateUserAddress(userId, addressData);
      
      const validationResult = {
        isValid: true,
        standardizedAddress: addressData,
        deliveryPoint: true,
        suggestions: []
      };
      
      res.json(validationResult);
    } catch (error) {
      console.error("Address validation error:", error);
      res.status(500).json({ message: "Failed to validate address" });
    }
  });

  // Seed default message subjects (development only)
  app.post('/api/seed/message-subjects', async (req, res) => {
    try {
      const defaultSubjects = [
        { name: 'General Announcements', description: 'General updates and announcements' },
        { name: 'New Product Launches', description: 'Notifications about new coffee offerings' },
        { name: 'Sales & Promotions', description: 'Special offers and discount announcements' },
        { name: 'Seasonal Collections', description: 'Seasonal coffee releases and limited editions' },
        { name: 'Pre-orders Available', description: 'Early access to upcoming coffee releases' },
      ];

      // Check if subjects already exist
      const existingSubjects = await storage.getAllMessageSubjects();
      if (existingSubjects.length > 0) {
        return res.json({ message: 'Message subjects already exist', count: existingSubjects.length });
      }

      // Create default subjects
      for (const subject of defaultSubjects) {
        await storage.createMessageSubject(subject);
      }

      res.json({ message: 'Default message subjects created successfully', count: defaultSubjects.length });
    } catch (error) {
      console.error("Error seeding message subjects:", error);
      res.status(500).json({ message: "Failed to seed message subjects" });
    }
  });

  // Message Publishing System Routes

  // Get all message subjects for sellers
  app.get('/api/message-subjects', isAuthenticated, async (req: any, res) => {
    try {
      const subjects = await storage.getAllMessageSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching message subjects:", error);
      res.status(500).json({ message: "Failed to fetch message subjects" });
    }
  });

  // Create a new seller message (seller only)
  app.post('/api/seller/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      
      // Check if user is a roaster
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(403).json({ message: "Only sellers can send messages" });
      }

      const { subjectId, title, content } = req.body;

      if (!subjectId || !title || !content) {
        return res.status(400).json({ message: "Subject, title, and content are required" });
      }

      // Create the message
      const message = await storage.createSellerMessage({
        sellerId: roaster.id,
        subjectId: parseInt(subjectId),
        title,
        content,
      });

      // Get recipients (users who favorited this seller or purchased from them)
      const recipientIds = await storage.getMessageRecipients(roaster.id);
      
      if (recipientIds.length === 0) {
        return res.json({ 
          message, 
          recipientsCount: 0,
          note: "No recipients found. Users who favorite your products or purchase from you will receive future messages."
        });
      }

      // Create recipient records
      const recipients = recipientIds.map(userId => ({
        messageId: message.id,
        userId,
      }));

      await storage.createMessageRecipients(recipients);

      // Send notification emails (simplified - would use actual email service)
      for (const recipientId of recipientIds) {
        try {
          // Mark email as sent (in real implementation, send actual email here)
          await storage.markEmailAsSent(recipientId, message.id);
          console.log(`Email notification sent to user ${recipientId} for message ${message.id}`);
        } catch (emailError) {
          console.error(`Failed to send email to user ${recipientId}:`, emailError);
        }
      }

      res.json({ 
        message, 
        recipientsCount: recipientIds.length,
        success: true 
      });
    } catch (error) {
      console.error("Error creating seller message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Get seller's messages (seller only)
  app.get('/api/seller/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      
      // Check if user is a roaster
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(403).json({ message: "Only sellers can view sent messages" });
      }

      const messages = await storage.getSellerMessages(roaster.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching seller messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get buyer's messages (buyer only)
  app.get('/api/buyer/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      
      // Check if user is a buyer (not a roaster)
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.status(403).json({ message: "Sellers cannot view buyer messages" });
      }

      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching buyer messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get unread message count for notification badge (buyer only)
  app.get('/api/buyer/messages/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      
      // Check if user is a buyer (not a roaster)
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.json({ count: 0 }); // Sellers don't get message notifications
      }

      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Mark message as read (buyer only)
  app.post('/api/buyer/messages/:messageId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const messageId = parseInt(req.params.messageId);
      
      // Check if user is a buyer (not a roaster)
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.status(403).json({ message: "Sellers cannot mark messages as read" });
      }

      if (!messageId || isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      await storage.markMessageAsRead(userId, messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Get specific message details (authenticated users only)
  app.get('/api/messages/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const messageId = parseInt(req.params.messageId);
      
      if (!messageId || isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getSellerMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user has access to this message
      const roaster = await storage.getRoasterByUserId(userId);
      
      if (roaster) {
        // Seller can only view their own messages
        if (message.sellerId !== roaster.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        // Buyer can only view messages sent to them
        const userMessages = await storage.getUserMessages(userId);
        const hasAccess = userMessages.some(um => um.messageId === messageId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        // Mark as read when buyer views the message
        await storage.markMessageAsRead(userId, messageId);
      }

      res.json(message);
    } catch (error) {
      console.error("Error fetching message details:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  realtimeService.initialize(httpServer);
  
  return httpServer;
}
