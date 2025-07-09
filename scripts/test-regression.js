#!/usr/bin/env node
// Regression tests for specific areas
import { spawn } from 'child_process';

const REGRESSION_SUITES = [
  'backend-auth',
  'backend-payments',
  'backend-orders',
  'backend-security',
  'frontend-auth',
  'integration-user-flow'
];

async function runRegressionTests() {
  console.log('🔄 Running regression tests...');
  
  for (const suite of REGRESSION_SUITES) {
    console.log(`Testing: ${suite}`);
    
    const result = spawn('node', ['scripts/run-tests.js', suite, '--ci'], { stdio: 'inherit' });
    
    await new Promise((resolve) => {
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Regression test failed: ${suite}`);
          process.exit(1);
        }
        resolve();
      });
    });
  }
  
  console.log('✅ Regression tests passed');
}

runRegressionTests();
