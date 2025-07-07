import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// Minimal development authentication system
// Relies on impersonation system for user switching during development

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
      secure: false, // Allow non-HTTPS in development
      maxAge: sessionTtl,
    },
  });
}

export async function setupDevelopmentAuth(app: Express) {
  console.log('🔐 Setting up development authentication (session-only)');
  
  const sessionMiddleware = getSession();
  app.use(sessionMiddleware);

  // Simple logout route for development
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logout successful' });
    });
  });

  console.log('🔐 Development authentication setup complete - using impersonation for user management');
}

// Development authentication middleware - very permissive
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development, always allow access
  // Actual user management is handled by impersonation system
  next();
};