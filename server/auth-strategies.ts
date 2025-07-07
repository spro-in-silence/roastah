import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import bcrypt from "bcrypt";

// Environment detection
const isReplit = process.env.REPL_ID !== undefined;
const isCloudRun = process.env.K_SERVICE !== undefined;

console.log(`🔐 Auth Environment: Replit=${isReplit}, CloudRun=${isCloudRun}`);

// Replit OIDC configuration
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

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

// User session management
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: client.UserinfoResponse & client.UserinfoResponseHelpers
) {
  const user = await storage.upsertUser({
    id: claims.sub!,
    email: claims.preferred_username!,
    name: claims.name,
    username: claims.preferred_username!,
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

// Password hashing utilities for local auth
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Setup authentication strategies based on environment
export async function setupAuth(app: Express) {
  const sessionMiddleware = getSession();
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // User serialization (common to both strategies)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  if (isReplit) {
    console.log('🔐 Setting up Replit OIDC authentication');
    await setupReplitAuth(app);
  } else {
    console.log('🔐 Setting up Local authentication for Cloud Run');
    await setupLocalAuth(app);
  }
}

// Replit OIDC Authentication
async function setupReplitAuth(app: Express) {
  try {
    const config = await getOidcConfig();
    
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      userinfo: client.UserinfoResponse & client.UserinfoResponseHelpers,
      done: (err: any, user?: any) => void
    ) => {
      try {
        const user = await upsertUser(userinfo);
        updateUserSession(user, tokens);
        done(null, user);
      } catch (error) {
        done(error);
      }
    };

    passport.use("oidc", new Strategy({ config }, verify));

    // Replit auth routes
    app.get("/api/auth/login", passport.authenticate("oidc"));
    app.get("/api/auth/callback", passport.authenticate("oidc", { failureRedirect: "/auth/error" }), (req, res) => {
      res.redirect("/");
    });

    app.get("/api/auth/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

  } catch (error) {
    console.error('Failed to setup Replit authentication:', error);
    throw error;
  }
}

// Local Authentication (for Cloud Run)
async function setupLocalAuth(app: Express) {
  // Local strategy for username/password
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isValidPassword = await comparePassword(password, user.password || '');
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Local auth routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user, message: 'Login successful' });
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.upsertUser({
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        username: email,
        role: 'user',
        mfaEnabled: false,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        onboardingCompleted: false,
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed after registration' });
        }
        res.json({ user, message: 'Registration successful' });
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logout successful' });
    });
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (isReplit) {
    // Replit authentication check
    if (req.user?.claims?.sub) {
      return next();
    }
  } else {
    // Local authentication check
    if (req.user?.id) {
      return next();
    }
  }
  
  res.status(401).json({ error: "Authentication required" });
};

export { isReplit, isCloudRun };