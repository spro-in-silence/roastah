import type { Express } from "express";

// Environment detection
const isCloudRun = process.env.K_SERVICE !== undefined;
const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`🔐 Auth Environment: Development=${isDevelopment}, CloudRun=${isCloudRun}`);

export async function setupAuthentication(app: Express) {
  // Always use OAuth system - it handles both development and production
  console.log('🔐 Setting up OAuth authentication system...');
  try {
    const { setupOAuth, isAuthenticated } = await import('./oauth-auth');
    console.log('🔐 OAuth module imported successfully');
    await setupOAuth(app);
    console.log('🔐 OAuth authentication setup complete');
    return { isAuthenticated };
  } catch (error) {
    console.error('🔐 CRITICAL: Authentication setup failed:', error);
    console.error('🔐 Error stack:', error.stack);
    throw error;
  }
}

export { isCloudRun, isDevelopment };