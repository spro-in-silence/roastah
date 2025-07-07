import type { Express } from "express";

// Environment detection
const isCloudRun = process.env.K_SERVICE !== undefined;
const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`🔐 Auth Environment: Development=${isDevelopment}, CloudRun=${isCloudRun}`);

export async function setupAuthentication(app: Express) {
  // Always use OAuth system - it handles both development and production
  console.log('🔐 Setting up OAuth authentication system...');
  const { setupOAuth, isAuthenticated } = await import('./oauth-auth');
  await setupOAuth(app);
  return { isAuthenticated };
}

export { isCloudRun, isDevelopment };