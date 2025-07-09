#!/usr/bin/env node

/**
 * Quick deployment fix for pnpm lockfile issues
 * This script prepares the project for Cloud Run deployment
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔧 Fixing deployment dependencies...');

try {
  // Remove lockfile to force regeneration
  if (fs.existsSync('pnpm-lock.yaml')) {
    fs.unlinkSync('pnpm-lock.yaml');
    console.log('✅ Removed outdated lockfile');
  }

  // Generate new lockfile
  console.log('📦 Generating new lockfile...');
  execSync('pnpm install --lockfile-only', { stdio: 'inherit' });
  
  console.log('✅ Deployment dependencies fixed');
  console.log('🚀 Ready for deployment');
  
} catch (error) {
  console.error('❌ Error fixing deployment:', error.message);
  process.exit(1);
}