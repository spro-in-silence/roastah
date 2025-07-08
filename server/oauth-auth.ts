import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isCloudRun = process.env.K_SERVICE !== undefined;

console.log(`🔐 OAuth Environment: Development=${isDevelopment}, CloudRun=${isCloudRun}`);

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// User creation/update helper
async function upsertUserFromOAuth(profile: any, provider: string) {
  const userId = `${provider}-${profile.id}`;
  const email = profile.emails?.[0]?.value || `${userId}@${provider}.com`;
  
  const user = await storage.upsertUser({
    id: userId,
    email,
    name: profile.displayName || profile.name?.givenName || profile.username,
    username: profile.username || email.split('@')[0],
    role: 'user',
    mfaEnabled: false,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    onboardingCompleted: false,
    profileComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return user;
}

// Setup OAuth authentication
export async function setupOAuth(app: Express) {
  const sessionMiddleware = getSession();
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // User serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, user);
      } else {
        // User not found, clear session
        done(null, false);
      }
    } catch (error) {
      console.warn('Error deserializing user:', error);
      done(null, false);
    }
  });

  // Always provide a login endpoint
  app.get('/api/login', (req, res) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      res.redirect('/api/auth/google');
    } else {
      res.status(500).json({ error: 'OAuth not configured. Please set up Google OAuth credentials.' });
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('🔐 Setting up Google OAuth');
    
    // Determine the correct callback URL based on environment
    let callbackURL;
    if (isDevelopment) {
      callbackURL = `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;
    } else if (isCloudRun) {
      // For Cloud Run, construct URL from K_SERVICE and other Cloud Run env vars
      const serviceName = process.env.K_SERVICE || 'roastah-d';
      const region = process.env.K_REVISION?.split('-')[1] || 'us-central1';
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'roastah-d';
      callbackURL = `https://${serviceName}-${projectId.split('-')[1]}.${region}.run.app/api/auth/google/callback`;
    } else {
      // Fallback to provided URL or construct from request
      callbackURL = process.env.CLOUD_RUN_URL 
        ? `https://${process.env.CLOUD_RUN_URL}/api/auth/google/callback`
        : 'https://roastah-d-188956418455.us-central1.run.app/api/auth/google/callback';
    }
    
    console.log('🔐 Google OAuth callback URL:', callbackURL);

    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUserFromOAuth(profile, 'google');
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));

    // Google OAuth routes
    app.get('/api/auth/google', 
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/auth/error' }),
      (req, res) => {
        res.redirect('/');
      }
    );
  } else {
    console.warn('⚠️ Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    console.log('🔐 Setting up GitHub OAuth');
    
    // Determine the correct callback URL based on environment
    let callbackURL;
    if (isDevelopment) {
      callbackURL = `http://localhost:${process.env.PORT || 5000}/api/auth/github/callback`;
    } else if (isCloudRun) {
      // For Cloud Run, construct URL from K_SERVICE and other Cloud Run env vars
      const serviceName = process.env.K_SERVICE || 'roastah-d';
      const region = process.env.K_REVISION?.split('-')[1] || 'us-central1';
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'roastah-d';
      callbackURL = `https://${serviceName}-${projectId.split('-')[1]}.${region}.run.app/api/auth/github/callback`;
    } else {
      // Fallback to provided URL or construct from request
      callbackURL = process.env.CLOUD_RUN_URL 
        ? `https://${process.env.CLOUD_RUN_URL}/api/auth/github/callback`
        : 'https://roastah-d-188956418455.us-central1.run.app/api/auth/github/callback';
    }
    
    console.log('🔐 GitHub OAuth callback URL:', callbackURL);

    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL,
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = await upsertUserFromOAuth(profile, 'github');
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));

    // GitHub OAuth routes
    app.get('/api/auth/github', 
      passport.authenticate('github', { scope: ['user:email'] })
    );

    app.get('/api/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/auth/error' }),
      (req, res) => {
        res.redirect('/');
      }
    );
  }

  // Apple OAuth Strategy (using passport-apple)
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    console.log('🔐 Setting up Apple OAuth');
    
    try {
      const { Strategy: AppleStrategy } = require('passport-apple');
      
      // Determine the correct callback URL based on environment
      let callbackURL;
      if (isDevelopment) {
        callbackURL = `http://localhost:${process.env.PORT || 5000}/api/auth/apple/callback`;
      } else if (isCloudRun) {
        // For Cloud Run, construct URL from K_SERVICE and other Cloud Run env vars
        const serviceName = process.env.K_SERVICE || 'roastah-d';
        const region = process.env.K_REVISION?.split('-')[1] || 'us-central1';
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'roastah-d';
        callbackURL = `https://${serviceName}-${projectId.split('-')[1]}.${region}.run.app/api/auth/apple/callback`;
      } else {
        // Fallback to provided URL or construct from request
        callbackURL = process.env.CLOUD_RUN_URL 
          ? `https://${process.env.CLOUD_RUN_URL}/api/auth/apple/callback`
          : 'https://roastah-d-188956418455.us-central1.run.app/api/auth/apple/callback';
      }
      
      console.log('🔐 Apple OAuth callback URL:', callbackURL);

      passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY,
        callbackURL,
      }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const user = await upsertUserFromOAuth(profile, 'apple');
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }));

      // Apple OAuth routes
      app.get('/api/auth/apple', 
        passport.authenticate('apple', { scope: ['name', 'email'] })
      );

      app.get('/api/auth/apple/callback',
        passport.authenticate('apple', { failureRedirect: '/auth/error' }),
        (req, res) => {
          res.redirect('/');
        }
      );
    } catch (error) {
      console.warn('⚠️ Apple OAuth not available, install passport-apple if needed');
    }
  }

  // Get current user endpoint
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (isDevelopment && req.session?.user?.sub) {
        // Development impersonation - get full user data from storage
        const userId = req.session.user.sub;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Get roaster info if user is a roaster
        let roaster = null;
        if (user?.role === 'roaster') {
          roaster = await storage.getRoasterByUserId(userId);
        }
        
        const response = { 
          ...user, 
          roaster,
          mfaRequired: !!(roaster || user?.role === 'admin'),
        };
        
        return res.json(response);
      }
      
      if (req.user?.id) {
        // Production OAuth
        return res.json(req.user);
      }
      
      res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Email/Password authentication endpoints
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.upsertUser({
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        username: email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        mfaEnabled: false,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        onboardingCompleted: false,
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to log in after registration' });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('🔐 Login attempt for email:', email);

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      console.log('🔐 User found:', user ? 'Yes' : 'No');
      
      if (!user || !user.password) {
        console.log('🔐 Login failed: User not found or no password');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔐 Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('🔐 Login failed: Invalid password');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Simple session-based login without passport
      console.log('🔐 Setting up simple session for user:', user.id);
      try {
        if (req.session) {
          // Store user info directly in session
          req.session.user = {
            id: user.id,
            email: user.email,
            sub: user.id,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name,
          };
          
          req.session.save((err) => {
            if (err) {
              console.error('🔐 Session save error:', err);
              return res.status(500).json({ error: 'Failed to save session' });
            }
            console.log('🔐 Login successful for user:', user.id);
            res.json(user);
          });
        } else {
          console.error('🔐 No session available');
          res.status(500).json({ error: 'Session not available' });
        }
      } catch (sessionError) {
        console.error('🔐 Session save error:', sessionError);
        res.status(500).json({ error: 'Failed to save session' });
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Common logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logout successful' });
    });
  });

  // Error handling route
  app.get('/auth/error', (req, res) => {
    res.status(401).json({ error: 'Authentication failed' });
  });

  console.log('🔐 OAuth authentication setup complete');
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development, allow impersonated users
  if (isDevelopment && req.session.user?.sub) {
    return next();
  }
  
  // In production, require OAuth authentication
  if (req.user?.id) {
    return next();
  }
  
  res.status(401).json({ error: "Authentication required" });
};

export { isDevelopment, isCloudRun };