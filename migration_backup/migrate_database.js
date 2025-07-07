#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configurations
const sourceConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

const targetConfig = {
  connectionString: process.env.NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

// Table definitions with their column mappings
const tables = [
  {
    name: 'users',
    columns: ['id', 'email', 'first_name', 'last_name', 'profile_image_url', 'role', 'is_roaster_approved', 'stripe_customer_id', 'stripe_connect_account_id', 'address_line_1', 'address_line_2', 'city', 'state', 'zip_code', 'mfa_enabled', 'mfa_secret', 'backup_codes', 'last_backup_code_used', 'created_at', 'updated_at']
  },
  {
    name: 'roasters',
    columns: ['id', 'user_id', 'business_name', 'business_type', 'business_address', 'city', 'state', 'zip_code', 'description', 'roasting_experience', 'philosophy', 'is_active', 'total_reviews', 'average_rating', 'total_sales', 'total_revenue', 'response_time', 'completion_rate', 'leaderboard_score', 'created_at', 'updated_at']
  },
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

// Sequences to update after migration
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

class DatabaseMigrator {
  constructor() {
    this.sourcePool = new Pool(sourceConfig);
    this.targetPool = new Pool(targetConfig);
    this.migrationLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.migrationLog.push(logEntry);
  }

  async testConnections() {
    this.log('Testing database connections...');
    
    try {
      await this.sourcePool.query('SELECT 1');
      this.log('✅ Source database connection successful');
    } catch (error) {
      throw new Error(`❌ Source database connection failed: ${error.message}`);
    }

    try {
      await this.targetPool.query('SELECT 1');
      this.log('✅ Target database connection successful');
    } catch (error) {
      throw new Error(`❌ Target database connection failed: ${error.message}`);
    }
  }

  async clearTargetDatabase() {
    this.log('Clearing target database...');
    
    // Clear tables in dependency order (no trigger disable needed for Neon)
    const clearTables = [
      'sessions', 'order_items', 'cart_items', 'reviews', 'wishlist', 'notifications',
      'favorite_roasters', 'orders', 'products', 'roasters', 'users'
    ];
    
    for (const table of clearTables) {
      try {
        await this.targetPool.query(`TRUNCATE TABLE ${table} CASCADE`);
        this.log(`✅ Cleared ${table}`);
      } catch (error) {
        this.log(`⚠️  Warning: Could not clear ${table}: ${error.message}`);
      }
    }
  }

  async migrateTable(table) {
    this.log(`Migrating ${table.name}...`);
    
    try {
      // Get data from source
      const sourceQuery = `SELECT ${table.columns.join(', ')} FROM ${table.name}`;
      const sourceResult = await this.sourcePool.query(sourceQuery);
      
      if (sourceResult.rows.length === 0) {
        this.log(`✅ ${table.name}: No data to migrate`);
        return;
      }

      // Insert data into target
      const placeholders = table.columns.map((_, index) => `$${index + 1}`).join(', ');
      const insertQuery = `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES (${placeholders})`;
      
      let insertedCount = 0;
      for (const row of sourceResult.rows) {
        const values = table.columns.map(col => row[col]);
        await this.targetPool.query(insertQuery, values);
        insertedCount++;
      }
      
      this.log(`✅ ${table.name}: Migrated ${insertedCount} records`);
      
    } catch (error) {
      this.log(`❌ ${table.name}: Migration failed: ${error.message}`);
      throw error;
    }
  }

  async updateSequences() {
    this.log('Updating sequences...');
    
    for (const sequence of sequences) {
      try {
        const tableName = sequence.replace('_id_seq', '');
        const result = await this.targetPool.query(`SELECT MAX(id) FROM ${tableName}`);
        const maxId = result.rows[0].max;
        
        if (maxId) {
          await this.targetPool.query(`SELECT setval('${sequence}', ${maxId})`);
          this.log(`✅ Updated ${sequence} to ${maxId}`);
        }
      } catch (error) {
        this.log(`⚠️  Warning: Could not update ${sequence}: ${error.message}`);
      }
    }
  }

  async verifyMigration() {
    this.log('Verifying migration...');
    
    const verification = {};
    
    for (const table of tables) {
      try {
        const sourceResult = await this.sourcePool.query(`SELECT COUNT(*) FROM ${table.name}`);
        const targetResult = await this.targetPool.query(`SELECT COUNT(*) FROM ${table.name}`);
        
        const sourceCount = parseInt(sourceResult.rows[0].count);
        const targetCount = parseInt(targetResult.rows[0].count);
        
        verification[table.name] = {
          source: sourceCount,
          target: targetCount,
          match: sourceCount === targetCount
        };
        
        if (sourceCount === targetCount) {
          this.log(`✅ ${table.name}: ${sourceCount} records (match)`);
        } else {
          this.log(`❌ ${table.name}: Source ${sourceCount} != Target ${targetCount}`);
        }
      } catch (error) {
        this.log(`⚠️  ${table.name}: Verification failed: ${error.message}`);
        verification[table.name] = { error: error.message };
      }
    }
    
    return verification;
  }

  async saveMigrationReport(verification) {
    const report = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      verification,
      log: this.migrationLog
    };
    
    const reportPath = path.join(__dirname, 'migration_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📊 Migration report saved to ${reportPath}`);
  }

  async migrate() {
    try {
      this.log('🚀 Starting complete database migration...');
      
      await this.testConnections();
      await this.clearTargetDatabase();
      
      // Migrate tables in dependency order
      for (const table of tables) {
        await this.migrateTable(table);
      }
      
      await this.updateSequences();
      const verification = await this.verifyMigration();
      await this.saveMigrationReport(verification);
      
      this.log('🎉 Migration completed successfully!');
      
      // Show summary
      const totalRecords = Object.values(verification)
        .filter(v => v.target !== undefined)
        .reduce((sum, v) => sum + v.target, 0);
      
      this.log(`📊 Migration Summary: ${totalRecords} total records migrated`);
      
    } catch (error) {
      this.log(`💥 Migration failed: ${error.message}`);
      throw error;
    } finally {
      await this.sourcePool.end();
      await this.targetPool.end();
    }
  }
}

// Execute migration
const migrator = new DatabaseMigrator();
migrator.migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});

export default DatabaseMigrator;