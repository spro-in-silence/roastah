#!/usr/bin/env node

/**
 * Pre-deployment test validation
 * Comprehensive testing before production deployment
 */

import { spawn } from 'child_process';

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function runDeploymentTests() {
  console.log('🚀 Running pre-deployment validation...');
  
  const validationSteps = [
    {
      name: 'Full Test Suite',
      command: 'node',
      args: ['scripts/test-ci.js']
    },
    {
      name: 'Security Audit',
      command: 'npm',
      args: ['audit', '--audit-level=moderate']
    },
    {
      name: 'Performance Tests',
      command: 'node',
      args: ['scripts/run-tests.js', 'backend', '--verbose', '--ci']
    },
    {
      name: 'Integration Tests',
      command: 'node',
      args: ['scripts/run-tests.js', 'integration', '--ci']
    }
  ];
  
  for (const step of validationSteps) {
    try {
      console.log(`\n🧪 Running ${step.name}...`);
      await runCommand(step.command, step.args);
      console.log(`✅ ${step.name} passed`);
    } catch (error) {
      console.error(`❌ ${step.name} failed:`, error.message);
      console.error(`\nDeployment validation failed at: ${step.name}`);
      console.error('Please fix issues before deploying to production.');
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All deployment validation tests passed!');
  console.log('✅ System is ready for production deployment.');
  console.log('\nNext steps:');
  console.log('1. Deploy to staging environment');
  console.log('2. Run smoke tests on staging');
  console.log('3. Deploy to production');
  console.log('4. Monitor production metrics');
}

runDeploymentTests();