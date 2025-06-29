# Roastah Coffee Marketplace

## Overview

Roastah is a scalable, full-stack, Etsy-style multi-vendor marketplace tailored for home and micro coffee roasters. The platform enables roasters to sell their specialty coffee products while providing customers with a curated marketplace experience for discovering unique, artisanal coffee offerings.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, accessible design
- **State Management**: TanStack React Query for server state with optimistic updates
- **Routing**: React Router with protected routes and role-based access control
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Features**: WebSocket integration for live notifications and order tracking

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session-based auth
- **Payment Processing**: Stripe integration with Connect Express for multi-vendor payouts
- **E-commerce Engine**: MedusaJS integration for enterprise-grade commerce features
- **File Storage**: Configured for product image uploads
- **Security**: Comprehensive rate limiting, input validation, and MFA support

## Key Components

### User Management
- **Multi-role System**: Buyers, Roasters, and Admin roles with granular permissions
- **Authentication**: Secure OAuth flow with session management
- **Profile Management**: User profiles with address storage and preferences
- **Multi-Factor Authentication**: TOTP-based MFA with backup codes for enhanced security

### Product Catalog
- **Product Management**: Full CRUD operations with image support
- **Advanced Features**: Bulk product uploads, inventory tracking, and state management
- **Product States**: Draft, pending review, published, archived, and rejected states
- **Search & Discovery**: Advanced filtering and product recommendations

### E-commerce Features
- **Shopping Cart**: Persistent cart with real-time updates and grind size options
- **Checkout Process**: Integrated Stripe payment processing with address validation
- **Order Management**: Comprehensive order tracking with real-time status updates
- **Multi-vendor Support**: Roaster-specific product management and earnings tracking

### Marketplace Features
- **Roaster Applications**: Approval workflow for new roasters joining the platform
- **Commission System**: Automated commission calculations and payout tracking
- **Analytics Dashboard**: Sales analytics, customer insights, and performance metrics
- **Review System**: Product reviews with verified purchase badges and helpful voting

## Data Flow

### Authentication Flow
1. Users authenticate via Replit OAuth
2. Session established with PostgreSQL-backed storage
3. User roles and permissions loaded from database
4. Protected routes enforce role-based access control

### Product Management Flow
1. Roasters create/edit products through form validation
2. Products sync to MedusaJS for enhanced e-commerce features
3. Real-time cache updates ensure consistent UI state
4. Inventory levels tracked and low-stock notifications sent

### Order Processing Flow
1. Customers add items to cart with grind preferences
2. Checkout creates Stripe PaymentIntent with destination charges
3. Orders distributed to respective roasters with commission calculations
4. Real-time order tracking updates sent via WebSocket
5. Automated commission payouts to roaster Stripe Connect accounts

## External Dependencies

### Payment Processing
- **Stripe**: Primary payment processor with Connect Express for multi-vendor payouts
- **Stripe Elements**: Secure payment form integration

### Database & Infrastructure
- **Neon/PostgreSQL**: Primary database with connection pooling
- **Drizzle ORM**: Type-safe database operations with migrations

### Third-party Services
- **MedusaJS**: Enterprise e-commerce engine integration
- **WebSocket**: Real-time communication for notifications and tracking
- **File Upload**: Product image storage and management

### UI & Development
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **React Query**: Server state management with caching
- **Vite**: Fast development build tool

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- TypeScript compilation with strict mode
- ESBuild for fast server bundling
- Real-time error overlays for debugging

### Production Build
- Optimized Vite production build
- Server bundled with ESBuild for Node.js
- Static asset optimization and caching
- Database migrations via Drizzle Kit

### Environment Configuration
- Environment-specific configuration files
- Secure secret management for API keys
- Database URL configuration for different environments
- CORS configuration for frontend-backend communication

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```