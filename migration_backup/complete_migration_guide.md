# Roastah Database Migration Guide

## Overview
This guide will help you migrate your Roastah database from Replit-managed Neon (`ep-dark-mountain-a5hv1hro`) to your personal Neon account.

## Current Database Stats
- **34 users** (including sample data and real users)
- **22 roasters** (coffee business profiles)
- **47 products** (coffee products with full details)
- **11 orders** (customer orders with order items)
- **Database size**: 58 MB
- **PostgreSQL version**: 16.9

## Migration Steps

### Step 1: Create New Database in Personal Neon Account
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click "Create Project"
3. Name it "Roastah"
4. Choose your preferred region (us-east-2 recommended to match current)
5. Copy the new connection string

### Step 2: Create Schema in New Database
1. Use the new connection string in your Drizzle config temporarily
2. Run: `npm run db:generate && npm run db:migrate`
3. This creates all 21 tables with proper structure

### Step 3: Import Data
Execute the provided SQL files in order:
1. `01_users_data.sql` - User accounts and profiles
2. `02_roasters_data.sql` - Coffee roaster businesses  
3. `03_products_data.sql` - Coffee products catalog
4. `04_orders_data.sql` - Customer orders
5. `05_order_items_data.sql` - Individual order items
6. `06_additional_data.sql` - Cart items, reviews, etc.

### Step 4: Update Replit Environment
1. Update `DATABASE_URL` in Replit Secrets to your new Neon connection string
2. Restart the application
3. Verify all data appears correctly

### Step 5: Test Application
1. Test login functionality
2. Verify roaster dashboards show correct data
3. Check product listings and inventory
4. Test order history and cart functionality

## Rollback Plan
Keep the original `DATABASE_URL` backed up:
```
postgresql://neondb_owner:npg_QGvT8dxgBbu0@ep-dark-mountain-a5hv1hro.us-east-2.aws.neon.tech/neondb?sslmode=require
```

If issues occur, revert the `DATABASE_URL` to restore original functionality.

## Data Files Generated
- User data: Complete user profiles and authentication data
- Roaster data: Business information and metrics
- Product data: Coffee catalog with inventory and pricing
- Order data: Complete transaction history
- Additional data: Carts, reviews, notifications, etc.

## Post-Migration Benefits
✅ Full control over database in your personal Neon dashboard  
✅ Direct access to Neon's SQL editor and analytics  
✅ Unified dashboard with Rate Grid and Roastah projects  
✅ Complete backup and scaling control  
✅ No dependency on Replit's database integration