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
  // Only load from Secret Manager in production environments
  if (process.env.NODE_ENV === 'production' || process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      const [replitDomains, replId, stripeSecretKey] = await Promise.all([
        getSecret('REPLIT_DOMAINS'),
        getSecret('REPL_ID'),
        getSecret('STRIPE_SECRET_KEY')
      ]);

      if (replitDomains) {
        process.env.REPLIT_DOMAINS = replitDomains;
      }
      if (replId) {
        process.env.REPL_ID = replId;
      }
      if (stripeSecretKey) {
        process.env.STRIPE_SECRET_KEY = stripeSecretKey;
      }
    } catch (error) {
      console.warn('Failed to load secrets from Secret Manager:', error);
    }
  }
} 