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
  
  // Always load secrets from GCP Secret Manager regardless of environment
  // This ensures consistent behavior across local, dev, and production
  try {
    console.log('Loading secrets from GCP Secret Manager...');
    
    // Define all required secrets
    const requiredSecrets = [
      'DATABASE_URL',
      'SESSION_SECRET', 
      'STRIPE_SECRET_KEY',
      'REPL_ID',
      'REPLIT_DOMAINS'
    ];
    
    // Load all secrets in parallel
    const secretPromises = requiredSecrets.map(async (secretName) => {
      try {
        const secretValue = await getSecret(secretName);
        if (secretValue) {
          process.env[secretName] = secretValue;
          console.log(`✅ Loaded ${secretName} from Secret Manager`);
          return { name: secretName, success: true };
        } else {
          console.warn(`⚠️ Failed to load ${secretName} from Secret Manager`);
          return { name: secretName, success: false };
        }
      } catch (error) {
        console.warn(`❌ Error loading ${secretName}:`, error);
        return { name: secretName, success: false, error };
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
    throw error;
  }
} 