#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Continue migration for remaining tables
const sourceConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

const targetConfig = {
  connectionString: process.env.NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

// Tables that still need migration
const remainingTables = [
  {
    name: 'products',
    columns: ['id', 'roaster_id', 'name', 'description', 'price', 'stock_quantity', 'origin', 'roast_level', 'process', 'altitude', 'varietal', 'tasting_notes', 'images', 'state', 'is_unlisted', 'is_preorder', 'is_private', 'is_out_of_stock', 'is_scheduled', 'published_at', 'scheduled_publish_at', 'preorder_shipping_date', 'archived_at', 'rejected_at', 'rejection_reason', 'reviewed_by', 'reviewed_at', 'review_notes', 'is_active', 'created_at', 'updated_at']
  },
  {
    name: 'orders',
    columns: ['id', 'user_id', 'stripe_payment_intent_id', 'status', 'total_amount', 'shipping_address', 'billing_address', 'notes', 'created_at', 'updated_at']
  },
  {
    name: 'order_items',
    columns: ['id', 'order_id', 'product_id', 'roaster_id', 'quantity', 'price', 'grind_size', 'status', 'created_at']
  },
  {
    name: 'cart_items',
    columns: ['id', 'user_id', 'product_id', 'quantity', 'grind_size', 'created_at']
  },
  {
    name: 'reviews',
    columns: ['id', 'product_id', 'user_id', 'rating', 'comment', 'helpful_count', 'created_at']
  },
  {
    name: 'wishlist',
    columns: ['id', 'user_id', 'product_id', 'created_at']
  },
  {
    name: 'notifications',
    columns: ['id', 'user_id', 'type', 'title', 'message', 'is_read', 'created_at']
  },
  {
    name: 'favorite_roasters',
    columns: ['id', 'user_id', 'roaster_id', 'created_at']
  },
  {
    name: 'sessions',
    columns: ['sid', 'sess', 'expire']
  }
];

async function continueMigration() {
  const sourcePool = new Pool(sourceConfig);
  const targetPool = new Pool(targetConfig);
  
  try {
    console.log('🔄 Continuing migration for remaining tables...');
    
    for (const table of remainingTables) {
      console.log(`📊 Checking ${table.name}...`);
      
      // Check if table needs migration
      const sourceCount = await sourcePool.query(`SELECT COUNT(*) FROM ${table.name}`);
      const targetCount = await targetPool.query(`SELECT COUNT(*) FROM ${table.name}`);
      
      const sourceRecords = parseInt(sourceCount.rows[0].count);
      const targetRecords = parseInt(targetCount.rows[0].count);
      
      if (sourceRecords === targetRecords) {
        console.log(`✅ ${table.name}: Already complete (${sourceRecords} records)`);
        continue;
      }
      
      if (sourceRecords === 0) {
        console.log(`✅ ${table.name}: No data to migrate`);
        continue;
      }
      
      console.log(`🔄 Migrating ${table.name}: ${sourceRecords} records...`);
      
      // Get missing records
      const sourceResult = await sourcePool.query(`SELECT ${table.columns.join(', ')} FROM ${table.name}`);
      
      if (targetRecords > 0) {
        // Clear and re-insert to avoid conflicts
        await targetPool.query(`TRUNCATE TABLE ${table.name} CASCADE`);
        console.log(`   Cleared existing ${targetRecords} records`);
      }
      
      // Insert all records
      const placeholders = table.columns.map((_, index) => `$${index + 1}`).join(', ');
      const insertQuery = `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES (${placeholders})`;
      
      for (const row of sourceResult.rows) {
        const values = table.columns.map(col => row[col]);
        await targetPool.query(insertQuery, values);
      }
      
      console.log(`✅ ${table.name}: Migrated ${sourceResult.rows.length} records`);
    }
    
    // Update sequences
    console.log('🔧 Updating sequences...');
    const sequences = [
      'roasters_id_seq',
      'products_id_seq', 
      'orders_id_seq',
      'order_items_id_seq',
      'cart_items_id_seq',
      'reviews_id_seq',
      'wishlist_id_seq',
      'notifications_id_seq',
      'favorite_roasters_id_seq'
    ];
    
    for (const sequence of sequences) {
      try {
        const tableName = sequence.replace('_id_seq', '');
        const result = await targetPool.query(`SELECT MAX(id) FROM ${tableName}`);
        const maxId = result.rows[0].max;
        
        if (maxId) {
          await targetPool.query(`SELECT setval('${sequence}', ${maxId})`);
          console.log(`✅ Updated ${sequence} to ${maxId}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not update ${sequence}: ${error.message}`);
      }
    }
    
    // Final verification
    console.log('\n📊 Final verification:');
    const verificationQuery = `
      SELECT 'users' as table_name, count(*) as records FROM users
      UNION ALL SELECT 'roasters', count(*) FROM roasters
      UNION ALL SELECT 'products', count(*) FROM products
      UNION ALL SELECT 'orders', count(*) FROM orders
      UNION ALL SELECT 'order_items', count(*) FROM order_items
      UNION ALL SELECT 'cart_items', count(*) FROM cart_items
      UNION ALL SELECT 'reviews', count(*) FROM reviews
      UNION ALL SELECT 'wishlist', count(*) FROM wishlist
      UNION ALL SELECT 'notifications', count(*) FROM notifications
      UNION ALL SELECT 'sessions', count(*) FROM sessions
      ORDER BY table_name
    `;
    
    const result = await targetPool.query(verificationQuery);
    console.table(result.rows);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Update DATABASE_URL in Replit Secrets to your NEW_DATABASE_URL');
    console.log('2. Restart the application');
    console.log('3. Test login and functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

continueMigration();