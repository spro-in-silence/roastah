# Local Development Setup Guide

## Overview
This guide helps you run the Roastah application outside of Replit on your local machine.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Google Cloud CLI (optional, for production secrets)

## Setup Steps

### 1. Environment Configuration
Copy the example environment file and configure it:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/roastah"

# Session Security (Required)
SESSION_SECRET="your-secure-session-secret-key-here"

# Stripe Configuration (Required for payments)
VITE_STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key_here"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"

# Authentication (Required)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Development Settings
NODE_ENV="development"
PORT="5000"
```

### 2. Database Setup
Create a PostgreSQL database and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 3. Build and Start
Build the application and start the production server:

```bash
npm run build
npm start
```

### 4. Development Mode
For development with hot reloading:

```bash
npm run dev
```

## Common Issues and Solutions

### Issue 1: Content Security Policy Errors
**Error**: `Refused to load the script 'https://replit.com/public/js/replit-dev-banner.js'`

**Solution**: This is expected when running outside of Replit. The CSP is configured to only allow Replit scripts in development mode within Replit.

### Issue 2: WebSocket Connection Failed
**Error**: `WebSocket connection to 'ws://localhost:undefined' failed`

**Solution**: Ensure your `PORT` environment variable is set to `5000` in your `.env.local` file.

### Issue 3: Stripe Configuration Missing
**Error**: `VITE_STRIPE_PUBLIC_KEY is not configured`

**Solution**: Add your Stripe publishable key to the `.env.local` file:
```env
VITE_STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key_here"
```

### Issue 4: Authentication API 500 Error
**Error**: `GET http://localhost:5000/api/auth/user 500 (Internal Server Error)`

**Solution**: The application uses Replit's authentication system. For local development, ensure `NODE_ENV=development` in your `.env.local` file. This enables a development authentication bypass that creates a mock user for testing.

**Important**: The development authentication bypass is NOT secure and should only be used for local development.

## Required Environment Variables

### Essential Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure random string for session encryption
- `NODE_ENV`: Set to "development" for local development
- `PORT`: Set to "5000" for local development

### Payment Processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (starts with `pk_`)
- `STRIPE_SECRET_KEY`: Stripe secret key (starts with `sk_`)

### Authentication
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## File Structure
```
dist/
├── public/           # Built frontend files
└── ...
dist-server/
├── index.mjs         # Built backend server
└── ...
```

## Troubleshooting

### Check Build Output
Ensure both frontend and backend built successfully:
```bash
ls -la dist/public/     # Should contain index.html, assets/
ls -la dist-server/     # Should contain index.mjs
```

### Verify Database Connection
Test your database connection:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### Check Server Logs
Look for specific error messages in the console output when running `npm start`.

## Development vs Production

### Development Mode (`npm run dev`)
- Uses `server/dev-server.ts`
- Hot reloading enabled
- Vite dev server for frontend
- tsx for backend watching

### Production Mode (`npm start`)
- Uses built `dist-server/index.mjs`
- Serves static files from `dist/public/`
- Optimized for performance
- Single process serving both frontend and backend

## Next Steps

1. Set up your environment variables
2. Configure your database
3. Build and test the application
4. Access the application at `http://localhost:5000`

For additional help, check the main README.md file or the replit.md documentation.