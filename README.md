# Roastah - Etsy-style Multi-vendor Coffee Marketplace

## Local Docker Testing

To test the production Docker image locally:

```bash
# Build the image
docker buildx build --platform linux/amd64 -t roastah:local .

# Run the container locally
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_URL=your_database_url \
  -e STRIPE_SECRET_KEY=your_stripe_key \
  -e SESSION_SECRET=your_session_secret \
  roastah:local

# Test the health endpoint
curl http://localhost:8080/health

# Test the application
curl http://localhost:8080/
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm run build:all
```

## Deployment

The application is deployed via Cloud Build to Google Cloud Run. The build process:

1. Generates database migrations
2. Builds frontend and backend
3. Creates production Docker image
4. Deploys to Cloud Run with proper environment variables

## Architecture

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **E-commerce**: Medusa.js integration
- **Deployment**: Google Cloud Run
- **Build**: Cloud Build with multi-stage Docker 