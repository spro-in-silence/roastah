#!/bin/bash

# Roastah Database Migration Script
# This script performs a complete database migration from old to new Neon database

set -e  # Exit on any error

echo "🚀 Starting Roastah Database Migration"
echo "========================================"

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set (source database)"
    exit 1
fi

if [ -z "$NEW_DATABASE_URL" ]; then
    echo "❌ NEW_DATABASE_URL not set (target database)"
    exit 1
fi

echo "✅ Environment variables validated"

# Step 1: Create schema in new database
echo ""
echo "📋 Step 1: Creating schema in new database..."
echo "============================================"

# Temporarily update drizzle config to use NEW_DATABASE_URL
cp drizzle.config.ts drizzle.config.ts.backup

# Create temporary config for new database
cat > drizzle.config.ts << 'EOF'
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEW_DATABASE_URL!,
  },
});
EOF

echo "🔧 Pushing schema to new database..."
npm run db:migrate

# Restore original config
mv drizzle.config.ts.backup drizzle.config.ts

echo "✅ Schema created successfully"

# Step 2: Run Node.js migration script
echo ""
echo "📊 Step 2: Migrating data..."
echo "==========================="

node migration_backup/migrate_database.js

echo ""
echo "🎉 Migration completed successfully!"
echo "====================================="

# Step 3: Verification
echo ""
echo "🔍 Step 3: Final verification..."
echo "==============================="

# Connect to new database and show record counts
psql "$NEW_DATABASE_URL" -c "
SELECT 
    'users' as table_name, 
    count(*) as records 
FROM users
UNION ALL
SELECT 'roasters', count(*) FROM roasters
UNION ALL  
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'order_items', count(*) FROM order_items
UNION ALL
SELECT 'cart_items', count(*) FROM cart_items
UNION ALL
SELECT 'reviews', count(*) FROM reviews
UNION ALL
SELECT 'wishlist', count(*) FROM wishlist
UNION ALL
SELECT 'notifications', count(*) FROM notifications
UNION ALL
SELECT 'sessions', count(*) FROM sessions
ORDER BY table_name;
"

echo ""
echo "✅ Migration verification complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Update DATABASE_URL in Replit Secrets to your NEW_DATABASE_URL"
echo "2. Restart the application"
echo "3. Test login and functionality"
echo "4. Keep the old DATABASE_URL backed up for rollback if needed"
echo ""
echo "📊 Migration report saved to: migration_backup/migration_report.json"