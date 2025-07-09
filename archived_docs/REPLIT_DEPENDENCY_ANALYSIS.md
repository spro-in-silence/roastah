# Roastah - Replit Dependency Analysis

## Executive Summary

After thoroughly analyzing your Roastah application, I've identified **8 major categories** of Replit dependencies that currently require migration for complete independence. While the database migration is complete, several other infrastructure components remain tied to Replit's ecosystem.

## Critical Dependencies (Require Immediate Action)

### 1. 🔐 Google Cloud Secret Manager Integration
**Current State:** Fully managed by Replit
**Impact:** High - Application won't start without these secrets
**Files Affected:**
- `server/secrets.ts` - Core secret loading logic
- `cloudbuild.yaml` - Production deployment secrets
- `cloudbuild.dev.yaml` - Development deployment secrets

**Secrets Currently Managed:**
- `DATABASE_URL` ✅ **MIGRATED** (now using personal Neon)
- `SESSION_SECRET` - Required for session management
- `STRIPE_SECRET_KEY` - Required for payment processing
- `REPL_ID` - Used for Replit-specific authentication
- `REPLIT_DOMAINS` - Used for domain-based authentication

**Migration Path:**
```bash
# Option 1: Direct environment variables
export SESSION_SECRET="your-secure-session-secret"
export STRIPE_SECRET_KEY="sk_test_your_stripe_key"

# Option 2: Your own secret management solution
# - AWS Parameter Store
# - HashiCorp Vault
# - Azure Key Vault
```

### 2. 🔑 Replit Authentication System
**Current State:** Integrated with Replit's OpenID Connect
**Impact:** High - Core user authentication
**Files Affected:**
- `server/replitAuth.ts` - Main authentication logic
- `client/src/pages/dev-login.tsx` - Development authentication

**Current Implementation:**
- Uses `replitauth:${hostname}` strategy
- Depends on `REPL_ID` and `REPLIT_DOMAINS`
- Has localhost fallback for development

**Migration Path:**
- Replace with Google OAuth directly
- Implement custom OpenID Connect provider
- Or use Auth0, Firebase Auth, etc.

### 3. 🚀 Google Cloud Deployment Pipeline
**Current State:** Fully integrated with Google Cloud Build
**Impact:** Medium - Affects production deployments
**Files Affected:**
- `cloudbuild.yaml` - Production CI/CD
- `cloudbuild.dev.yaml` - Development CI/CD
- `Dockerfile` - Container configuration

**Current Setup:**
- Deploys to Google Cloud Run
- Uses Google Container Registry
- Integrated with Google Secret Manager
- Automated health checks and rollbacks

**Migration Path:**
- Self-managed Docker deployment
- Alternative CI/CD (GitHub Actions, GitLab CI)
- Different cloud providers (AWS, Vercel, Railway)

## Medium Priority Dependencies

### 4. 🌐 Domain and Environment Detection
**Current State:** Relies on `replit.dev` domains
**Impact:** Medium - Affects routing and environment detection
**Files Affected:**
- `client/src/pages/dev-login.tsx` - Environment detection
- `client/index.html` - WebSocket connection fixes
- `vite.config.ts` - Replit-specific plugins

**Current Logic:**
```typescript
const isReplit = window.location.hostname.includes('replit.dev');
```

**Migration Path:**
- Use custom domain or subdomain pattern
- Environment variable-based detection
- Configuration-based environment setup

### 5. 🔧 Replit Development Tools
**Current State:** Uses Replit-specific Vite plugins
**Impact:** Low - Development experience only
**Files Affected:**
- `vite.config.ts` - Replit cartographer and error overlay
- Package dependencies

**Current Plugins:**
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer`

**Migration Path:**
- Remove Replit-specific plugins
- Use standard development tools
- Custom error handling setup

### 6. 🌍 WebSocket Connection Management
**Current State:** Replit-specific connection fixes
**Impact:** Medium - Real-time features
**Files Affected:**
- `client/index.html` - WebSocket patching
- `server/realtime.ts` - WebSocket server

**Current Fixes:**
- Port undefined handling
- Hostname translation for Replit environment
- Protocol switching (ws/wss)

**Migration Path:**
- Remove Replit-specific patches
- Standard WebSocket configuration
- Proper reverse proxy setup

## Low Priority Dependencies

### 7. 📦 Package Dependencies
**Current State:** Some Replit-specific packages
**Impact:** Low - Can be replaced easily
**Dependencies:**
```json
{
  "@replit/vite-plugin-cartographer": "development only",
  "@replit/vite-plugin-runtime-error-modal": "development only"
}
```

### 8. 🏗️ Build and Development Configuration
**Current State:** Some Replit-aware configurations
**Impact:** Low - Development convenience
**Files Affected:**
- `package.json` - Build scripts
- Development environment detection

## Migration Priority Matrix

| Component | Impact | Complexity | Timeline | Status |
|-----------|--------|------------|----------|--------|
| Database | High | Medium | ✅ Complete | ✅ Migrated |
| Secrets Management | High | Low | 1-2 days | 🔄 In Progress |
| Authentication | High | High | 3-5 days | ⏳ Pending |
| Deployment Pipeline | Medium | High | 2-4 days | ⏳ Pending |
| Domain Detection | Medium | Low | 1 day | ⏳ Pending |
| WebSocket Fixes | Medium | Medium | 1-2 days | ⏳ Pending |
| Dev Tools | Low | Low | 1 day | ⏳ Pending |
| Package Cleanup | Low | Low | 1 day | ⏳ Pending |

## Recommended Migration Strategy

### Phase 1: Critical Infrastructure (1-2 weeks)
1. **Secrets Management** - Move to environment variables or your preferred secret manager
2. **Authentication** - Implement direct Google OAuth or alternative
3. **Deployment** - Set up independent CI/CD pipeline

### Phase 2: Environment Independence (1 week)
1. **Domain Detection** - Use configuration-based environment detection
2. **WebSocket Management** - Remove Replit-specific patches
3. **Development Tools** - Replace with standard alternatives

### Phase 3: Cleanup (1-2 days)
1. **Package Dependencies** - Remove Replit-specific packages
2. **Configuration Cleanup** - Remove all Replit references
3. **Documentation Update** - Update deployment and development guides

## Current Status: Partially Independent

✅ **Achieved:**
- Database fully migrated to personal Neon account
- Application running independently
- All user data preserved

⏳ **Remaining Dependencies:**
- Google Cloud Secret Manager for 4 critical secrets
- Replit authentication system
- Google Cloud deployment pipeline
- Various environment-specific configurations

## Next Steps Recommendation

**Immediate (This Week):**
1. Move secrets to environment variables for local development
2. Set up direct Google OAuth to replace Replit auth
3. Test application with independent authentication

**Short Term (Next 2 Weeks):**
1. Set up independent deployment pipeline
2. Configure custom domain
3. Remove Replit-specific code patches

**Long Term (Next Month):**
1. Full production deployment to independent infrastructure
2. Complete documentation update
3. Backup and disaster recovery setup

## Risk Assessment

**Low Risk:**
- Application continues working during migration
- Database already independent
- Most dependencies are infrastructure-level

**Medium Risk:**
- Authentication migration requires careful user session handling
- Deployment pipeline changes need thorough testing

**High Risk:**
- None identified - migration can be done incrementally

---

**Status:** 🟡 Partially Independent (Database ✅, Infrastructure ⏳)
**Next Action:** Secrets management migration to achieve infrastructure independence