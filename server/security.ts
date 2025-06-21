import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult, param, query } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import type { Request, Response, NextFunction, Express } from 'express';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit payment attempts
  message: {
    error: 'Too many payment attempts, please try again later.'
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit file uploads
  message: {
    error: 'Too many upload attempts, please try again later.'
  },
});

// Input validation schemas
export const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&.,()]+$/)
    .withMessage('Product name contains invalid characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Price must be a valid amount between $0.01 and $10,000'),
  
  body('stockQuantity')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Stock quantity must be a valid number between 0 and 10,000'),
  
  body('roastLevel')
    .optional()
    .isIn(['light', 'medium-light', 'medium', 'medium-dark', 'dark'])
    .withMessage('Invalid roast level'),
  
  body('origin')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .matches(/^[a-zA-Z\s\-,]+$/)
    .withMessage('Origin contains invalid characters'),
];

export const validateRoasterApplication = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&.,()]+$/)
    .withMessage('Business name contains invalid characters'),
  
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),
  
  body('contactPhone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('yearsExperience')
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience must be between 0 and 100'),
  
  body('businessDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Business description must not exceed 1000 characters'),
];

export const validateCartOperation = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID required'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

export const validatePaymentIntent = [
  body('amount')
    .isFloat({ min: 0.50, max: 50000 })
    .withMessage('Payment amount must be between $0.50 and $50,000'),
  
  body('items')
    .isArray({ min: 1, max: 50 })
    .withMessage('Must include 1-50 items'),
  
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID required for each item'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Valid quantity required for each item'),
];

export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID required'),
];

export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg
      }))
    });
  }
  next();
};

// Security headers and protection
export function setupSecurity(app: Express) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite in dev
        connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
        frameSrc: ["'self'", "https://js.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for Stripe
  }));

  // General rate limiting
  app.use('/api/', generalLimiter);

  // Sanitize user input
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized input for key: ${key} from IP: ${req.ip}`);
    },
  }));

  // Additional security middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Remove server header
    res.removeHeader('X-Powered-By');
    
    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  });
}

// Session security configuration
export const sessionSecurityConfig = {
  name: 'roastah_session', // Don't use default session name
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
};

// Enhanced authentication check with security logging
export function enhancedAuthCheck(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    // Log failed authentication attempts
    console.warn(`Unauthorized access attempt from IP: ${req.ip} to ${req.path}`);
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check for session tampering
  const user = req.user as any;
  if (!user?.claims?.sub) {
    console.warn(`Invalid session data from IP: ${req.ip}`);
    req.logout((err) => {
      if (err) console.error('Logout error:', err);
    });
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  next();
}

// Role-based access control
export function requireRole(role: 'admin' | 'roaster' | 'user') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user as any;
    const userId = user.claims.sub;

    try {
      // For roaster role, check if user has approved roaster account
      if (role === 'roaster') {
        const { storage } = await import('./storage');
        const roaster = await storage.getRoasterByUserId(userId);
        if (!roaster || !roaster.isApproved) {
          return res.status(403).json({ error: 'Roaster access required' });
        }
      }

      // For admin role (future implementation)
      if (role === 'admin') {
        // TODO: Implement admin role checking
        return res.status(403).json({ error: 'Admin access required' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

// IP whitelisting for admin functions (optional)
export function requireWhitelistedIP(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn(`Blocked access from non-whitelisted IP: ${clientIP}`);
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
}