# Roastah Database Migration - Step by Step Guide

## Quick Migration Plan

Since your database is already on Neon infrastructure, I recommend the **Drizzle Push method** for the fastest migration:

### Method 1: Direct Schema + Data Migration (Recommended)

#### Step 1: Create New Database
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project: "Roastah"
3. Copy the new connection string (looks like: `postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/database`)

#### Step 2: Update Environment Temporarily
```bash
# Backup current connection
echo $DATABASE_URL > original_db_url.txt

# Set new connection (replace with your new Neon URL)
export NEW_DATABASE_URL="postgresql://your-new-connection-string"
```

#### Step 3: Create Schema in New Database
```bash
# Update drizzle.config.ts to use NEW_DATABASE_URL temporarily
# Then push schema
npm run db:push
```

#### Step 4: Simple Data Transfer
Since both databases are on Neon, you can use PostgreSQL's built-in migration:

```sql
-- Connect to your new database and run:
-- This imports data directly from the old database

INSERT INTO users SELECT * FROM dblink('host=ep-dark-mountain-a5hv1hro.us-east-2.aws.neon.tech port=5432 dbname=neondb user=neondb_owner password=npg_QGvT8dxgBbu0', 'SELECT * FROM users') AS t(id varchar, email varchar, first_name varchar, last_name varchar, profile_image_url varchar, role varchar, is_roaster_approved boolean, stripe_customer_id varchar, stripe_connect_account_id varchar, address_line_1 varchar, address_line_2 varchar, city varchar, state varchar, zip_code varchar, mfa_enabled boolean, mfa_secret varchar, backup_codes text[], last_backup_code_used timestamp, created_at timestamp, updated_at timestamp);

-- Repeat for all tables...
```

### Method 2: CSV Export/Import (Simpler)

#### Export from Current Database
```sql
-- Run these in current database SQL editor:
\copy users TO 'users.csv' WITH CSV HEADER;
\copy roasters TO 'roasters.csv' WITH CSV HEADER;
\copy products TO 'products.csv' WITH CSV HEADER;
\copy orders TO 'orders.csv' WITH CSV HEADER;
\copy order_items TO 'order_items.csv' WITH CSV HEADER;
-- ... continue for all tables
```

#### Import to New Database
```sql
-- Run these in new database:
\copy users FROM 'users.csv' WITH CSV HEADER;
\copy roasters FROM 'roasters.csv' WITH CSV HEADER;
\copy products FROM 'products.csv' WITH CSV HEADER;
-- ... continue for all tables
```

## Migration Verification

After migration, verify these key points:

```sql
-- Check record counts match
SELECT 'users' as table_name, count(*) as records FROM users
UNION ALL
SELECT 'roasters', count(*) FROM roasters
UNION ALL  
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'orders', count(*) FROM orders;

-- Should show: users=34, roasters=22, products=47, orders=11
```

## Update Application

1. **Update DATABASE_URL** in Replit Secrets to your new connection string
2. **Restart the application** 
3. **Test functionality**:
   - Login works
   - Roaster dashboards show data
   - Products display correctly
   - Orders history appears

## Rollback Plan

Keep the original connection string safe:
```
postgresql://neondb_owner:npg_QGvT8dxgBbu0@ep-dark-mountain-a5hv1hro.us-east-2.aws.neon.tech/neondb?sslmode=require
```

If issues occur, simply revert DATABASE_URL back to this value.

## Benefits After Migration
- ✅ Full control in your personal Neon dashboard
- ✅ Unified dashboard with Rate Grid project  
- ✅ Direct access to Neon's SQL editor and analytics
- ✅ Complete backup and scaling control
- ✅ No dependency on Replit's database integration

Would you like me to help with any of these specific steps?