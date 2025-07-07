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

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('🔐 Setting up Google OAuth');
    
    const callbackURL = isDevelopment 
      ? `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`
      : `https://${process.env.CLOUD_RUN_URL}/api/auth/google/callback`;

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
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    console.log('🔐 Setting up GitHub OAuth');
    
    const callbackURL = isDevelopment 
      ? `http://localhost:${process.env.PORT || 5000}/api/auth/github/callback`
      : `https://${process.env.CLOUD_RUN_URL}/api/auth/github/callback`;

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
      
      const callbackURL = isDevelopment 
        ? `http://localhost:${process.env.PORT || 5000}/api/auth/apple/callback`
        : `https://${process.env.CLOUD_RUN_URL}/api/auth/apple/callback`;

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