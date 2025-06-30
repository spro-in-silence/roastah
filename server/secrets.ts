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
      
      // Check if we need to load secrets that are using sm:// syntax
      const secretsToLoad = [];
      
      if (process.env.REPLIT_DOMAINS?.startsWith('sm://')) {
        secretsToLoad.push(['REPLIT_DOMAINS', process.env.REPLIT_DOMAINS.replace('sm://', '')]);
      }
      if (process.env.REPL_ID?.startsWith('sm://')) {
        secretsToLoad.push(['REPL_ID', process.env.REPL_ID.replace('sm://', '')]);
      }
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sm://')) {
        secretsToLoad.push(['STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY.replace('sm://', '')]);
      }
      
      if (secretsToLoad.length > 0) {
        console.log(`Found ${secretsToLoad.length} secrets using sm:// syntax, loading from Secret Manager...`);
        
        for (const [envVar, secretName] of secretsToLoad) {
          try {
            const secretValue = await getSecret(secretName);
            if (secretValue) {
              process.env[envVar] = secretValue;
              console.log(`Loaded ${envVar} from Secret Manager`);
            } else {
              console.warn(`Failed to load secret ${secretName} for ${envVar}`);
            }
          } catch (error) {
            console.warn(`Error loading secret ${secretName} for ${envVar}:`, error);
          }
        }
      } else {
        console.log('No sm:// secrets found, using direct Secret Manager access...');
        // Fallback to direct Secret Manager access
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
      }
    } catch (error) {
      console.warn('Failed to load secrets from Secret Manager:', error);
    }
  } else {
    console.log('Running locally, using environment variables');
  }
} 