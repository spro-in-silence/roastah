# Cloud Run Authentication Setup

## Overview

The application now supports multiple authentication strategies based on the deployment environment:

- **Replit Environment**: Uses Replit's OpenID Connect authentication
- **Cloud Run Environment**: Uses OAuth providers (Google, GitHub, Apple)

## Environment Detection

The system automatically detects the environment and configures the appropriate authentication strategy:

```javascript
const isReplit = process.env.REPL_ID !== undefined;
const isCloudRun = process.env.K_SERVICE !== undefined;
```

## Required Environment Variables for Cloud Run

### For Google OAuth:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUD_RUN_URL=your-service-name.run.app
```

### For GitHub OAuth:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### For Apple OAuth (Optional):
```
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

### Required for All Environments:
```
SESSION_SECRET=your_session_secret
DATABASE_URL=your_postgresql_url
```

## OAuth Provider Setup

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `https://your-service.run.app/api/auth/google/callback`

### GitHub OAuth Setup:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-service.run.app/api/auth/github/callback`

### Apple Sign In Setup:
1. Go to Apple Developer Console
2. Create App ID with Sign In with Apple capability
3. Create Service ID for web authentication
4. Generate private key for authentication

## Frontend Integration

The frontend automatically detects the environment and shows appropriate sign-in options:

- **Replit**: Shows "Sign in with Replit" button
- **Cloud Run**: Shows OAuth provider buttons (Google, GitHub, Apple)

## Authentication Flow

### Cloud Run OAuth Flow:
1. User clicks OAuth provider button → `/api/auth/{provider}`
2. User redirected to provider's authorization page
3. Provider redirects back to `/api/auth/{provider}/callback`
4. Server creates/updates user in database
5. User redirected to main application

### User Creation:
- Users are automatically created on first OAuth login
- User ID format: `{provider}-{provider_user_id}` (e.g., `google-123456`)
- Email and name are extracted from OAuth profile

## Database Schema Updates

The following columns were added to support OAuth authentication:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR,
ADD COLUMN IF NOT EXISTS username VARCHAR,
ADD COLUMN IF NOT EXISTS password VARCHAR,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;
```

## Route Structure

### Authentication Routes:
- `/api/auth/google` - Initiate Google OAuth
- `/api/auth/google/callback` - Google OAuth callback
- `/api/auth/github` - Initiate GitHub OAuth  
- `/api/auth/github/callback` - GitHub OAuth callback
- `/api/auth/apple` - Initiate Apple OAuth
- `/api/auth/apple/callback` - Apple OAuth callback
- `/api/auth/logout` - Logout (all environments)
- `/api/auth/user` - Get current user info

### Frontend Routes:
- `/auth` - Authentication page (OAuth providers)
- `/` - Landing page (redirects to `/auth` if not authenticated in Cloud Run)

## Deployment Checklist

1. ✅ Install OAuth passport strategies
2. ✅ Update database schema
3. ✅ Create environment-aware authentication router
4. ✅ Update frontend with OAuth login page
5. ✅ Configure OAuth callback URLs
6. ⏳ Set up OAuth provider credentials in Google Secret Manager
7. ⏳ Test authentication flow in Cloud Run

## Testing Authentication

### In Replit (Development):
- Authentication uses Replit's built-in system
- No additional setup required

### In Cloud Run (Production):
1. Set up OAuth provider credentials
2. Deploy to Cloud Run with environment variables
3. Test OAuth flow at `https://your-service.run.app/auth`
4. Verify user creation and session management

## Security Considerations

- All OAuth callbacks use HTTPS in production
- Session cookies are secure in production environments
- User passwords are never stored for OAuth users
- OAuth tokens are not persisted (session-based authentication)
- Rate limiting applied to authentication endpoints