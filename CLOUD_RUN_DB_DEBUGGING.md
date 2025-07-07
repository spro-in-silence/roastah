# Cloud Run Database Connectivity Issues - Debugging Guide

## 🚨 Critical Issues Identified

### 1. Environment Variable Mismatch (HIGH PRIORITY)
**Problem**: Your Drizzle config and server code use different environment variables:
- `drizzle.config.ts` expects `NEW_DATABASE_URL`
- Server code (`server/db.ts`) expects `DATABASE_URL`
- Cloud Run deployment sets `DATABASE_URL`

**Result**: Database migrations fail, causing authentication and other DB operations to break.

### 2. Missing Database Migrations in Cloud Run
**Problem**: The Docker entrypoint runs migrations using `drizzle-kit migrate`, but:
- Uses `NEW_DATABASE_URL` from `drizzle.config.ts`
- But Cloud Run only provides `DATABASE_URL`
- Migrations fail silently, leaving tables uninitialized

### 3. Session Storage Dependency
**Problem**: Authentication depends on PostgreSQL session storage:
- `connect-pg-simple` requires `sessions` table
- If migrations fail, this table doesn't exist
- All login/register operations fail

## 🔧 Solutions Required

### Solution 1: Fix Environment Variable Inconsistency
**Option A: Update Drizzle Config (Recommended)**
```typescript
// drizzle.config.ts - CHANGE THIS
export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Changed from NEW_DATABASE_URL
  },
});
```

**Option B: Update Cloud Run Deployment**
```yaml
# cloudbuild.yaml - Alternative approach
--set-env-vars="DATABASE_URL=sm://roastah/database-url,NEW_DATABASE_URL=sm://roastah/database-url,SESSION_SECRET=sm://roastah/session-secret"
```

### Solution 2: Fix Docker Entrypoint Migration Process
**Problem**: Current docker-entrypoint.sh doesn't handle migration failures properly.

**Fix**: Add proper error handling and database connection testing:
```bash
# Add to docker-entrypoint.sh
run_migrations() {
    echo "📊 Running database migrations..."
    
    # Test database connection first
    if ! node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT 1').then(() => { console.log('DB connected'); process.exit(0); }).catch(err => { console.error('DB connection failed:', err); process.exit(1); });"; then
        echo "❌ Database connection failed"
        exit 1
    fi
    
    # Run migrations
    if [ -f "drizzle.config.ts" ]; then
        if ! npx drizzle-kit migrate; then
            echo "❌ Database migrations failed"
            exit 1
        fi
        echo "✅ Database migrations completed"
    else
        echo "⚠️  No drizzle config found, skipping migrations"
    fi
}
```

### Solution 3: Neon DB Cloud Run Connectivity
**Potential Issues**:
1. **Connection Pool Limits**: Neon has connection limits
2. **SSL/TLS Requirements**: Neon requires SSL connections
3. **Networking**: Cloud Run networking restrictions

**Debugging Steps**:
```bash
# Test connection from Cloud Run
curl -X POST https://your-cloud-run-service.run.app/api/test-db-connection

# Check if SSL is properly configured
# Neon requires SSL, ensure your DATABASE_URL includes ?sslmode=require
```

### Solution 4: Add Database Health Check Endpoint
**Add to server/routes.ts**:
```typescript
// Add database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 🔍 Debugging Steps

### Step 1: Check Environment Variables
```bash
# SSH into Cloud Run container (if possible) or check logs
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "NEW_DATABASE_URL: ${NEW_DATABASE_URL:0:20}..."
```

### Step 2: Test Database Connection
```bash
# Test from Cloud Run
curl https://your-service.run.app/api/health/db
```

### Step 3: Check Migration Status
```bash
# Check if tables exist
curl -X POST https://your-service.run.app/api/debug/tables
```

### Step 4: Monitor Cloud Run Logs
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit=50 --format=json
```

## 🚀 Immediate Action Plan

### 1. Fix Environment Variable Issue (5 minutes)
Update `drizzle.config.ts` to use `DATABASE_URL` instead of `NEW_DATABASE_URL`.

### 2. Add Database Health Checks (10 minutes)
Add health check endpoints to verify database connectivity.

### 3. Test Migration Process (15 minutes)
Deploy with improved error handling and verify migrations run successfully.

### 4. Verify Neon DB Configuration (10 minutes)
Ensure your Neon DB URL includes proper SSL configuration:
```
postgresql://user:password@host:5432/database?sslmode=require
```

## 🔧 Common Neon DB + Cloud Run Issues

### Issue 1: Connection Pool Exhaustion
**Symptoms**: "sorry, too many clients already" errors
**Solution**: Configure connection pooling properly:
```typescript
// server/db.ts
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Limit connections for Cloud Run
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

### Issue 2: SSL Certificate Issues
**Symptoms**: "SSL connection error" or "certificate verify failed"
**Solution**: Ensure DATABASE_URL includes SSL parameters:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&sslcert=&sslkey=&sslrootcert=
```

### Issue 3: Cold Start Connection Issues
**Symptoms**: First requests after idle time fail
**Solution**: Implement connection retry logic:
```typescript
// Add retry logic to getDb()
export function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10,
      retryDelayMillis: 1000,
      retryTimes: 3
    });
    
    dbInstance = drizzle({ client: pool, schema });
  }
  return dbInstance;
}
```

## 📊 Verification Checklist

- [ ] Fix environment variable mismatch in `drizzle.config.ts`
- [ ] Add database health check endpoint
- [ ] Test database connection from Cloud Run
- [ ] Verify all required tables exist after migration
- [ ] Test login/register operations
- [ ] Check session storage functionality
- [ ] Monitor connection pool usage
- [ ] Verify SSL configuration with Neon DB

## 🆘 Emergency Debugging Commands

```bash
# Check Cloud Run logs
gcloud run logs read --service=roastah --region=us-central1 --limit=100

# Connect to Cloud Run instance
gcloud run exec --service=roastah --region=us-central1 --interactive

# Test database connection directly
psql "${DATABASE_URL}" -c "SELECT version();"

# Check table existence
psql "${DATABASE_URL}" -c "\dt"
```

This comprehensive debugging approach should resolve your Cloud Run + Neon DB connectivity issues!