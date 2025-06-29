#!/usr/bin/env node

/**
 * CI/CD script to validate production dependencies
 * This script checks that no dev dependencies are present in the production build
 */

import fs from 'fs';
import path from 'path';

const DEV_DEPENDENCIES = [
  // Vite ecosystem
  'vite',
  '@vitejs/plugin-react',
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-runtime-error-modal',
  '@tailwindcss/vite',
  
  // Build tools
  'esbuild',
  'typescript',
  'tsx',
  'autoprefixer',
  'postcss',
  'tailwindcss',
  'drizzle-kit',
  
  // Type definitions (should not be in production)
  '@types/',
  
  // Development utilities
  'tsx',
  'tsc'
];

const PRODUCTION_PATHS = [
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'dist-server'),
];

function checkForDevDependencies() {
  console.log('🔍 Validating production dependencies...');
  
  const foundDevDeps = [];
  
  // Only check production build files, not node_modules in development
  for (const buildPath of PRODUCTION_PATHS) {
    if (fs.existsSync(buildPath)) {
      const checkDirectory = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            checkDirectory(fullPath);
          } else if (item.isFile() && item.name.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            for (const dep of DEV_DEPENDENCIES) {
              if (content.includes(dep)) {
                foundDevDeps.push(`${fullPath} (contains ${dep})`);
              }
            }
          }
        }
      };
      
      checkDirectory(buildPath);
    }
  }
  
  if (foundDevDeps.length > 0) {
    console.error('❌ Found dev dependencies in production build:');
    foundDevDeps.forEach(dep => console.error(`   - ${dep}`));
    console.error('');
    console.error('This indicates that dev dependencies are leaking into the production build.');
    console.error('Check your Dockerfile and ensure pnpm prune --prod is working correctly.');
    process.exit(1);
  }
  
  console.log('✅ No dev dependencies found in production build');
  console.log('✅ Production build is clean and ready for deployment');
}

function validatePackageJson() {
  console.log('📦 Validating package.json for production dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devDeps = packageJson.devDependencies || {};
  const prodDeps = packageJson.dependencies || {};
  
  // Check for any dev dependencies that might be incorrectly in production
  const suspiciousDeps = [];
  
  for (const [dep, version] of Object.entries(devDeps)) {
    if (prodDeps[dep]) {
      suspiciousDeps.push(`${dep} (in both dependencies and devDependencies)`);
    }
  }
  
  if (suspiciousDeps.length > 0) {
    console.warn('⚠️  Found dependencies in both devDependencies and dependencies:');
    suspiciousDeps.forEach(dep => console.warn(`   - ${dep}`));
    console.warn('This might cause issues with dependency resolution.');
  } else {
    console.log('✅ Package.json dependency separation is clean');
  }
}

function checkProductionEnvironment() {
  // Only run validation in production or CI environments
  const isProduction = process.env.NODE_ENV === 'production';
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  
  if (!isProduction && !isCI) {
    console.log('ℹ️  Skipping production validation in development environment');
    console.log('   Run with NODE_ENV=production or in CI to validate');
    return false;
  }
  
  return true;
}

function main() {
  try {
    if (!checkProductionEnvironment()) {
      return;
    }
    
    validatePackageJson();
    checkForDevDependencies();
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

main(); 