import { getDb } from './server/db';

async function fixUserIdColumn() {
  try {
    console.log('Fixing users table ID column from integer to varchar...');
    
    const db = getDb();
    
    // Check current data
    const currentData = await db.execute(`
      SELECT * FROM users LIMIT 5;
    `);
    console.log('Current users data:', currentData.rows);
    
    // Create new table with correct schema
    console.log('Creating new users table with varchar ID...');
    await db.execute(`
      CREATE TABLE users_new (
        id varchar PRIMARY KEY NOT NULL,
        email varchar UNIQUE,
        first_name varchar,
        last_name varchar,
        profile_image_url varchar,
        role varchar NOT NULL DEFAULT 'buyer',
        is_roaster_approved boolean DEFAULT false,
        stripe_customer_id varchar,
        stripe_connect_account_id varchar,
        address_line_1 varchar,
        address_line_2 varchar,
        city varchar,
        state varchar,
        zip_code varchar,
        mfa_enabled boolean DEFAULT false,
        mfa_secret varchar,
        backup_codes text[],
        last_backup_code_used timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    
    // Copy data, converting integer IDs to string IDs
    console.log('Copying data with string IDs...');
    await db.execute(`
      INSERT INTO users_new (
        id, email, first_name, last_name, profile_image_url, role, 
        is_roaster_approved, stripe_customer_id, stripe_connect_account_id,
        address_line_1, address_line_2, city, state, zip_code,
        mfa_enabled, mfa_secret, backup_codes, last_backup_code_used,
        created_at, updated_at
      )
      SELECT 
        id::varchar, email, first_name, last_name, profile_image_url, role,
        is_roaster_approved, stripe_customer_id, stripe_connect_account_id,
        address_line_1, address_line_2, city, state, zip_code,
        mfa_enabled, mfa_secret, backup_codes, last_backup_code_used,
        created_at, updated_at
      FROM users;
    `);
    
    // Drop old table and rename new one
    console.log('Replacing old table with new one...');
    await db.execute(`DROP TABLE users CASCADE;`);
    await db.execute(`ALTER TABLE users_new RENAME TO users;`);
    
    // Verify the fix
    const verifyResult = await db.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    console.log('✅ Users table ID column type after fix:', verifyResult.rows);
    
    const verifyData = await db.execute(`
      SELECT * FROM users LIMIT 5;
    `);
    console.log('✅ Users data after fix:', verifyData.rows);
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error);
  } finally {
    process.exit(0);
  }
}

fixUserIdColumn(); 