# Production Readiness Checklist

## 🚀 Pre-Deployment Validation

### 1. Dependency Management
- [ ] All dev dependencies are in `devDependencies` section
- [ ] No dev dependencies in `dependencies` section
- [ ] `pnpm prune --prod` removes all dev dependencies
- [ ] No workspace hoisting issues with pnpm

### 2. Build Validation
- [ ] `npm run build` completes successfully
- [ ] `npm run check-vite` passes (no Vite references in backend)
- [ ] `npm run validate-prod` passes (no dev deps in production)
- [ ] Backend bundle is free of development tools

### 3. Docker Image Validation
- [ ] Docker build completes without errors
- [ ] Final image size is reasonable (< 500MB)
- [ ] No dev dependencies in final image
- [ ] Health check endpoint responds correctly

### 4. Environment Configuration
- [ ] `NODE_ENV=production` is set
- [ ] `PORT=8080` is configured for Cloud Run
- [ ] Database connection uses production credentials
- [ ] All environment variables are properly set

## 🔧 CI/CD Pipeline

### Cloud Build Steps
1. **Generate Migrations**: `pnpm run db:generate`
2. **Build Application**: `pnpm run build`
3. **Validate Production**: `pnpm run validate-prod`
4. **Build Docker Image**: Multi-stage build with pruning
5. **Deploy to Cloud Run**: With health checks

### Validation Scripts
- `scripts/check-vite-references.js`: Ensures no Vite in backend
- `scripts/validate-production-deps.js`: Checks for dev deps in production

## 🛡️ Security Measures

### Dependency Security
- [ ] All dependencies are up to date
- [ ] No known vulnerabilities in production deps
- [ ] Dev dependencies are excluded from production
- [ ] No unnecessary packages in production image

### Runtime Security
- [ ] Non-root user in Docker container
- [ ] Proper signal handling with dumb-init
- [ ] Health check endpoint for monitoring
- [ ] Proper error handling and logging

## 📊 Monitoring & Health

### Health Checks
- [ ] `/health` endpoint returns 200 OK
- [ ] Database connectivity is verified
- [ ] Application startup is logged
- [ ] Graceful shutdown handling

### Logging
- [ ] Production logs are properly formatted
- [ ] No sensitive information in logs
- [ ] Error tracking is configured
- [ ] Performance metrics are collected

## 🚨 Troubleshooting

### Common Issues
1. **Dev Dependencies in Production**
   - Run: `npm run validate-prod`
   - Check: Dockerfile pruning steps
   - Fix: Update .dockerignore and build scripts

2. **Vite References in Backend**
   - Run: `npm run check-vite`
   - Check: esbuild external flags
   - Fix: Update server code to remove Vite imports

3. **Port Configuration Issues**
   - Check: `PORT=8080` environment variable
   - Verify: Cloud Run port configuration
   - Test: Local Docker container

4. **Database Migration Issues**
   - Run: `pnpm run db:generate`
   - Check: Migration files in Docker image
   - Verify: Database connection in production

## 🔄 Deployment Process

1. **Local Testing**
   ```bash
   # Build and test locally
   npm run build
   npm run validate-prod
   docker build -t roastah:test .
   docker run -p 8080:8080 roastah:test
   ```

2. **Cloud Build Deployment**
   ```bash
   # Commit and push to trigger Cloud Build
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

3. **Post-Deployment Verification**
   - Check Cloud Run logs
   - Verify health check endpoint
   - Test application functionality
   - Monitor resource usage

## 📈 Performance Optimization

### Image Size
- [ ] Multi-stage Docker build
- [ ] Only production dependencies
- [ ] Proper .dockerignore configuration
- [ ] Alpine base image for smaller size

### Runtime Performance
- [ ] Proper Node.js configuration
- [ ] Database connection pooling
- [ ] Static asset optimization
- [ ] Caching strategies implemented

## 🔍 Quality Assurance

### Automated Checks
- [ ] Build validation in CI/CD
- [ ] Dependency validation
- [ ] Security scanning
- [ ] Performance testing

### Manual Verification
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security review
- [ ] Documentation review

---

**Last Updated**: $(date)
**Version**: 1.0.0 