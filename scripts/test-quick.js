#!/usr/bin/env node
// Quick tests for development workflow
import { spawn } from 'child_process';

async function runQuickTests() {
  console.log('🏃 Running quick tests...');
  
  const tests = [
    'node scripts/run-tests.js unit --ci',
    'node scripts/run-tests.js security --ci'
  ];
  
  for (const test of tests) {
    console.log(`Running: ${test}`);
    const result = spawn('bash', ['-c', test], { stdio: 'inherit' });
    
    await new Promise((resolve) => {
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Test failed: ${test}`);
          process.exit(1);
        }
        resolve();
      });
    });
  }
  
  console.log('✅ Quick tests passed');
}

runQuickTests();
