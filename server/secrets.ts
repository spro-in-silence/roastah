import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(secretName: string): Promise<string> {
  try {
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT || 'roastah-d'}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload?.data?.toString() || '';
  } catch (error) {
    console.warn(`Failed to load secret ${secretName} from Secret Manager:`, error);
    // Fallback to environment variable
    return process.env[secretName] || '';
  }
}

export async function loadSecrets(): Promise<void> {
  console.log('🔐 Starting loadSecrets...');
  console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  
  // Check if we're in a development environment
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV === 'dev' ||
                       !process.env.NODE_ENV ||
                       process.env.K_SERVICE === undefined;
  
  if (isDevelopment) {
    console.log('🔧 Development environment detected - using fallback environment variables');
    // In development, just use environment variables if they exist
    // Don't fail if secrets are missing - let the app run with fallbacks
    const developmentSecrets = {
      'DATABASE_URL': process.env.DATABASE_URL,
      'SESSION_SECRET': process.env.SESSION_SECRET || 'dev-session-secret-fallback',
      'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
      'SHIPPO_API_KEY': process.env.SHIPPO_API_KEY,
      'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
      'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET
    };
    
    Object.entries(developmentSecrets).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ Using ${key} from environment`);
      } else {
        console.log(`⚠️ ${key} not found in environment - using fallback`);
      }
    });
    
    console.log('📊 Development secret loading complete - app will run with available secrets');
    return;
  }
  
  // Production/Cloud Run environment - try to load from Secret Manager
  try {
    console.log('Loading secrets from GCP Secret Manager...');
    
    // Define all required secrets
    const requiredSecrets = [
      'DATABASE_URL',
      'SESSION_SECRET', 
      'STRIPE_SECRET_KEY',
      'SHIPPO_API_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    // Optional secrets that may not be available in all environments
    const optionalSecrets = [
      'CLOUD_RUN_URL',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ];
    
    // Load all secrets in parallel
    const allSecrets = [...requiredSecrets, ...optionalSecrets];
    const secretPromises = allSecrets.map(async (secretName) => {
      try {
        const secretValue = await getSecret(secretName);
        if (secretValue) {
          process.env[secretName] = secretValue;
          console.log(`✅ Loaded ${secretName} from Secret Manager`);
          return { name: secretName, success: true };
        } else {
          const isOptional = optionalSecrets.includes(secretName);
          if (isOptional) {
            console.log(`ℹ️ Optional secret ${secretName} not found in Secret Manager`);
          } else {
            console.warn(`⚠️ Failed to load ${secretName} from Secret Manager`);
          }
          return { name: secretName, success: false, optional: isOptional };
        }
      } catch (error) {
        const isOptional = optionalSecrets.includes(secretName);
        if (isOptional) {
          console.log(`ℹ️ Optional secret ${secretName} not available:`, error.message);
        } else {
          console.warn(`❌ Error loading ${secretName}:`, error);
        }
        return { name: secretName, success: false, error, optional: isOptional };
      }
    });
    
    const results = await Promise.all(secretPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`📊 Secret loading complete: ${successful.length} successful, ${failed.length} failed`);
    
    if (failed.length > 0) {
      console.warn('Failed secrets:', failed.map(f => f.name));
    }
    
  } catch (error) {
    console.error('❌ Failed to load secrets from Secret Manager:', error);
    console.log('⚠️ Continuing without Secret Manager secrets in production mode');
    // Don't throw in production either - let the app start with whatever secrets are available
  }
} 