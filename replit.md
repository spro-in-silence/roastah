# Roastah - Multi-Vendor Coffee Marketplace

## Overview

Roastah is a comprehensive, Etsy-style multi-vendor marketplace specifically designed for home and micro coffee roasters. The platform combines a custom-built marketplace with MedusaJS integration to provide enterprise-grade e-commerce capabilities while maintaining a user-friendly experience for both roasters and coffee enthusiasts.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with **shadcn/ui** and **Radix UI** for consistent, accessible design
- **React Router** for client-side routing and navigation
- **TanStack React Query** for efficient server state management and caching
- **React Hook Form** with **Zod** for form handling and validation

### Backend Architecture
- **Node.js** with **Express** for the main application server
- **MedusaJS** integration for enterprise e-commerce features
- **PostgreSQL** via **Neon** for primary data storage
- **Drizzle ORM** for type-safe database operations
- **Stripe Connect Express** for multi-vendor payment processing
- **WebSocket** implementation for real-time features

### Hybrid Data Strategy
The application uses a dual-database approach:
- **Custom PostgreSQL schema** for core marketplace features (users, products, orders)
- **MedusaJS database** for advanced e-commerce capabilities
- **Bridge service** for seamless data synchronization between systems

## Key Components

### Authentication & Authorization
- **Replit Auth** integration with OpenID Connect
- **Multi-factor authentication** (MFA) with TOTP and backup codes
- **Role-based access control** (buyer, roaster, admin)
- **Session management** with PostgreSQL-backed storage

### Product Management
- **Multi-state product lifecycle** (draft, pending review, published, archived)
- **Tag-based filtering** (unlisted, preorder, private, out of stock)
- **Bulk product upload** with CSV processing
- **Real-time inventory tracking**
- **Product recommendations** using similarity algorithms

### Order Processing
- **Multi-vendor order management**
- **Real-time order tracking** with WebSocket updates
- **Commission calculation** for platform fees
- **Stripe Connect** for direct seller payouts

### Search & Discovery
- **Advanced product filtering** by origin, roast level, price range
- **Real-time search** capabilities
- **Favorite roasters** and **wishlist** functionality
- **Leaderboard** for top-performing roasters

### Real-time Features
- **WebSocket-based notifications**
- **Live order tracking**
- **Real-time inventory updates**
- **Instant messaging** between buyers and sellers

## Data Flow

### Product Lifecycle
1. **Creation**: Roasters create products through the seller dashboard
2. **Validation**: Products undergo validation and can be saved as drafts
3. **Publication**: Approved products are published to the marketplace
4. **Synchronization**: Products are automatically synced to MedusaJS for advanced features
5. **Discovery**: Published products appear in search results and recommendations

### Order Processing
1. **Cart Management**: Users add products with customizable options (grind size, quantity)
2. **Checkout**: Stripe integration handles payment processing
3. **Order Distribution**: Orders are split by vendor for individual processing
4. **Tracking**: Real-time updates flow through WebSocket connections
5. **Commission**: Platform fees are calculated and distributed

### Cache Management
- **Dual cache strategy** combining immediate updates and invalidation
- **Optimistic updates** for instant UI feedback
- **Consistent data synchronization** across all views
- **Smart cache invalidation** to prevent stale data issues

## External Dependencies

### Payment Processing
- **Stripe Connect Express** for multi-vendor payments
- **Stripe API** for subscription management and payment intents
- **Automatic commission calculation** and distribution

### Cloud Services
- **Google Cloud Run** for scalable hosting
- **Google Cloud Storage** for static assets and product images
- **Google Secret Manager** for secure credential storage
- **Neon PostgreSQL** for managed database hosting

### Development Tools
- **Drizzle Kit** for database migrations and schema management
- **ESBuild** for efficient backend bundling
- **Docker** for consistent deployment environments

## Deployment Strategy

### Development Environment
- **Concurrent development servers** for frontend and backend
- **Hot module replacement** for rapid development
- **Automated database migrations** during development

### Production Build Process
1. **Database Migration Generation**: `pnpm run db:generate`
2. **Application Build**: Separate frontend and backend builds
3. **Dependency Validation**: Check for development dependencies in production
4. **Docker Image Creation**: Multi-stage build with production optimizations
5. **Cloud Run Deployment**: Automatic scaling and health checks

### Security Measures
- **Content Security Policy** implementation
- **Rate limiting** on all API endpoints
- **Input validation** using Zod schemas
- **SQL injection prevention** through parameterized queries
- **CSRF protection** with secure session handling

### Monitoring & Analytics
- **Real-time performance monitoring**
- **Error tracking** and logging
- **Business analytics** for seller insights
- **User behavior tracking** for optimization

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Added local development support with authentication bypass
- July 06, 2025. Fixed SPA routing for production deployment outside Replit
- July 06, 2025. Enhanced Content Security Policy for development environments
- July 06, 2025. Created comprehensive local setup documentation
- July 06, 2025. Added development login facade for testing buyer/seller functionality
- July 07, 2025. Successfully migrated database from Replit Neon to personal Neon account
- July 07, 2025. Completed comprehensive Replit dependency analysis
- July 07, 2025. Fixed seller impersonation in local development (database schema mismatch)
- July 07, 2025. Enhanced development environment detection and credential bypass
- July 07, 2025. Fixed hamburger menu role detection for buyer/seller impersonation
- July 07, 2025. Optimized React Query cache invalidation for smooth user switching
- July 07, 2025. Implemented environment-aware OAuth authentication for Cloud Run deployment
- July 07, 2025. Completely removed Replit Auth while preserving impersonation system
- July 07, 2025. Fixed Cloud Run OAuth authentication - added missing /api/login route
- July 07, 2025. Created comprehensive authentication system with email/password + OAuth options
- July 07, 2025. Fixed OAuth callback URL configuration for proper Google OAuth integration
- July 07, 2025. Added proper authentication page with dual authentication methods
- July 07, 2025. Fixed seller impersonation system - updated UserContext role detection for dev users
- July 07, 2025. Resolved seller dashboard empty page issue by updating query enabling conditions
- July 07, 2025. Fixed dev-login page credential checking loop that was blocking access to impersonation
- July 07, 2025. Updated navbar navigation logic to properly sync with impersonated user context
- July 08, 2025. Implemented secure Cloud Run development authorization using DEV_AUTHORIZED_EMAILS from Secret Manager
- July 08, 2025. Added Google OAuth token verification for authorized personnel access to impersonation features
- July 08, 2025. Updated impersonation banners to use blue/green color coding (blue for buyer, green for seller)
- July 08, 2025. Modified DEV SANDBOX banner to dynamically change colors based on impersonation mode
- July 08, 2025. Restricted signup functionality on Cloud Run dev instances to login-only for authorized users
- July 08, 2025. Simplified Cloud Run dev flow: standard email+password auth redirects to /dev-login for impersonation access
- July 08, 2025. Created 3 manual user accounts in database due to login endpoint issues in Cloud Run environment
- July 08, 2025. Fixed authentication system ES module imports for bcrypt compatibility
- July 08, 2025. Resolved /dev-login page environment detection to enable impersonation access for authenticated users
- July 08, 2025. Fixed impersonation API endpoint environment detection for Cloud Run development instances
- July 08, 2025. Successfully tested buyer and seller impersonation functionality in development environment
- July 08, 2025. Simplified Cloud Run dev impersonation to use session-based auth instead of Google OAuth
- July 08, 2025. Removed Google OAuth requirement for Cloud Run development environment access
- July 08, 2025. Standardized authentication behavior across Replit, localhost, and GCP dev Cloud Run environments
- July 08, 2025. Unified development flow: email/password login → /dev-login page → buyer/seller impersonation options
- July 08, 2025. Created clean, consistent dev-login interface working across all three development environments
- July 08, 2025. Fixed unified auth page for all 4 environments - development shows login-only, production shows login+signup
- July 08, 2025. Added authentication protection to /dev-login route - now requires login before accessing impersonation
- July 08, 2025. Fixed React state update warning in auth page redirect logic
- July 08, 2025. Updated buyer impersonation to navigate to /home instead of landing page
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```