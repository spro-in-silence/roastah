#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

async function testConnections() {
  console.log('🔍 Testing database connections...');
  
  const sourceConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };

  const targetConfig = {
    connectionString: process.env.NEW_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };

  console.log('Source DB:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('Target DB:', process.env.NEW_DATABASE_URL ? 'Set' : 'Not set');

  try {
    // Test source connection
    const sourcePool = new Pool(sourceConfig);
    const sourceResult = await sourcePool.query('SELECT current_database(), count(*) as user_count FROM users');
    console.log('✅ Source database:', sourceResult.rows[0].current_database, 'with', sourceResult.rows[0].user_count, 'users');
    await sourcePool.end();
    
    // Test target connection
    const targetPool = new Pool(targetConfig);
    const targetResult = await targetPool.query('SELECT current_database(), version()');
    console.log('✅ Target database:', targetResult.rows[0].current_database);
    console.log('   PostgreSQL version:', targetResult.rows[0].version.split(' ')[1]);
    await targetPool.end();
    
    console.log('🎉 Both connections successful! Ready for migration.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnections();