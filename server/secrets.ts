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
  // Load from Secret Manager when running in Cloud Run (dev or production)
  // Check multiple indicators that we're running in Cloud Run
  const isCloudRun = process.env.GOOGLE_CLOUD_PROJECT || 
                    process.env.K_SERVICE || 
                    process.env.K_REVISION || 
                    process.env.PORT === '8080' && process.env.NODE_ENV === 'development';
  
  if (isCloudRun) {
    try {
      console.log('Loading secrets from Secret Manager...');
      const [replitDomains, replId, stripeSecretKey] = await Promise.all([
        getSecret('REPLIT_DOMAINS'),
        getSecret('REPL_ID'),
        getSecret('STRIPE_SECRET_KEY')
      ]);

      if (replitDomains) {
        process.env.REPLIT_DOMAINS = replitDomains;
        console.log('Loaded REPLIT_DOMAINS from Secret Manager');
      }
      if (replId) {
        process.env.REPL_ID = replId;
        console.log('Loaded REPL_ID from Secret Manager');
      }
      if (stripeSecretKey) {
        process.env.STRIPE_SECRET_KEY = stripeSecretKey;
        console.log('Loaded STRIPE_SECRET_KEY from Secret Manager');
      }
    } catch (error) {
      console.warn('Failed to load secrets from Secret Manager:', error);
    }
  } else {
    console.log('Running locally, using environment variables');
  }
} 