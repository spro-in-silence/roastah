import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

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
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      maxAge: sessionTtl,
    },
  });
}

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
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  // Check if we're running outside of Replit (for local development)
  if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Running in development mode without Replit authentication');
    console.warn('⚠️  Using development authentication bypass');
    console.warn('⚠️  This is NOT secure and should only be used for local development');
    
    // Set up basic session management for development
    app.set("trust proxy", 1);
    app.use(getSession());
    
    // Create a development user bypass
    app.use(async (req, res, next) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        const devUserId = 'dev-user-123';
        
        // Create a mock user for development that matches the expected structure
        req.user = {
          claims: {
            sub: devUserId,
            email: 'dev@localhost',
            name: 'Development User',
            picture: null
          }
        };
        
        // Override isAuthenticated for development
        (req as any).isAuthenticated = () => true;
        
        // Ensure development user exists in database
        try {
          const { storage } = await import('./storage');
          const existingUser = await storage.getUser(devUserId);
          if (!existingUser) {
            await storage.upsertUser({
              id: devUserId,
              email: 'dev@localhost',
              firstName: 'Development',
              lastName: 'User',
              profileImageUrl: null,
              role: 'roaster',
              isRoasterApproved: true // Make dev user a roaster for testing
            });
            console.log('✅ Created development user in database');
          }
        } catch (error) {
          console.warn('⚠️ Could not create development user:', error);
        }
      }
      next();
    });
    
    return;
  }
  
  // Check for required environment variables after secrets have been loaded
  if (!process.env.REPLIT_DOMAINS) {
    throw new Error("Environment variable REPLIT_DOMAINS not provided");
  }
  if (!process.env.REPL_ID) {
    throw new Error("Environment variable REPL_ID not provided");
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Local development authentication bypass (only for localhost)
  app.get("/api/login", (req, res, next) => {
    // If running locally, use mock auth
    if (req.hostname === 'localhost') {
      const mockUser = {
        claims: {
          sub: 'local-dev-user',
          email: 'dev@localhost',
          first_name: 'Local',
          last_name: 'Developer',
          profile_image_url: 'https://via.placeholder.com/150',
          exp: Math.floor(Date.now() / 1000) + 3600
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      
      req.login(mockUser, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        res.redirect('/');
      });
      return;
    }

    // Use real Replit authentication for dev/production
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
