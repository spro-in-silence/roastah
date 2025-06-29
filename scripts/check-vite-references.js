#!/usr/bin/env node

/**
 * CI/CD script to check for Vite references in production backend build
 * This script should fail if any Vite-related code is found in the backend bundle
 */

import fs from 'fs';
import path from 'path';

const BACKEND_BUILD_PATH = path.join(process.cwd(), 'dist', 'index.js');

function checkForViteReferences() {
  console.log('🔍 Checking for Vite references in backend build...');
  
  if (!fs.existsSync(BACKEND_BUILD_PATH)) {
    console.error('❌ Backend build file not found:', BACKEND_BUILD_PATH);
    console.error('   Run "pnpm run build:backend" first');
    process.exit(1);
  }

  const buildContent = fs.readFileSync(BACKEND_BUILD_PATH, 'utf8');
  
  // List of problematic patterns that should not be in production backend
  const problematicPatterns = [
    'vite',
    '@vitejs',
    '@replit/vite',
    '@tailwindcss/vite',
    'nanoid',
    'createViteServer',
    'vite.middlewares',
    'vite.transformIndexHtml',
    'vite.ssrFixStacktrace'
  ];

  const foundReferences = [];

  for (const pattern of problematicPatterns) {
    if (buildContent.toLowerCase().includes(pattern.toLowerCase())) {
      foundReferences.push(pattern);
    }
  }

  if (foundReferences.length > 0) {
    console.error('❌ Found Vite references in backend build:');
    foundReferences.forEach(ref => console.error(`   - ${ref}`));
    console.error('');
    console.error('This indicates that dev dependencies are being included in the production backend.');
    console.error('Check your esbuild configuration and ensure all Vite-related code is properly excluded.');
    process.exit(1);
  }

  console.log('✅ No Vite references found in backend build');
  console.log('✅ Production backend is clean and ready for deployment');
}

checkForViteReferences(); 