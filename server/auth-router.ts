import type { Express } from "express";

// Environment detection
const isReplit = process.env.REPL_ID !== undefined;
const isCloudRun = process.env.K_SERVICE !== undefined;

console.log(`🔐 Auth Router: Replit=${isReplit}, CloudRun=${isCloudRun}`);

export async function setupAuthentication(app: Express) {
  if (isReplit) {
    // Use Replit Auth in Replit environment
    console.log('🔐 Loading Replit authentication...');
    const { setupAuth, isAuthenticated } = await import('./replitAuth');
    await setupAuth(app);
    return { isAuthenticated };
  } else {
    // Use OAuth in Cloud Run or other environments
    console.log('🔐 Loading OAuth authentication...');
    const { setupOAuth, isAuthenticated } = await import('./oauth-auth');
    await setupOAuth(app);
    return { isAuthenticated };
  }
}

export { isReplit, isCloudRun };