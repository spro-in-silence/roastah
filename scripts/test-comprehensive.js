#!/usr/bin/env node
// Comprehensive tests for CI/CD pipeline
import { spawn } from 'child_process';

async function runComprehensiveTests() {
  console.log('🔬 Running comprehensive tests...');
  
  const result = spawn('node', ['scripts/test-ci.js'], { stdio: 'inherit' });
  
  await new Promise((resolve) => {
    result.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Comprehensive tests failed');
        process.exit(1);
      }
      resolve();
    });
  });
  
  console.log('✅ Comprehensive tests passed');
}

runComprehensiveTests();
