#!/usr/bin/env node

/**
 * Comprehensive test runner for Roastah marketplace
 * Provides organized test execution with detailed reporting
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const TEST_SUITES = {
  // Backend API tests
  'backend-auth': 'tests/backend/auth.test.ts',
  'backend-products': 'tests/backend/products.test.ts',
  'backend-cart': 'tests/backend/cart.test.ts',
  'backend-orders': 'tests/backend/orders.test.ts',
  'backend-roasters': 'tests/backend/roasters.test.ts',
  'backend-payments': 'tests/backend/payments.test.ts',
  'backend-realtime': 'tests/backend/realtime.test.ts',
  'backend-security': 'tests/backend/security.test.ts',
  
  // Frontend component tests
  'frontend-auth': 'tests/frontend/components/auth-page.test.tsx',
  'frontend-products': 'tests/frontend/components/product-card.test.tsx',
  'frontend-seller': 'tests/frontend/components/seller-dashboard.test.tsx',
  
  // Integration tests
  'integration-user-flow': 'tests/frontend/integration/user-flow.test.tsx',
  'integration-checkout': 'tests/frontend/integration/checkout-flow.test.tsx',
};

const TEST_GROUPS = {
  backend: ['backend-auth', 'backend-products', 'backend-cart', 'backend-orders', 'backend-roasters', 'backend-payments', 'backend-realtime', 'backend-security'],
  frontend: ['frontend-auth', 'frontend-products', 'frontend-seller'],
  integration: ['integration-user-flow', 'integration-checkout'],
  security: ['backend-security', 'backend-auth'],
  payments: ['backend-payments'],
  realtime: ['backend-realtime'],
  unit: ['backend-auth', 'backend-products', 'backend-cart', 'backend-orders', 'backend-roasters', 'frontend-auth', 'frontend-products', 'frontend-seller'],
  all: Object.keys(TEST_SUITES),
};

function runJest(testFiles = [], options = {}) {
  return new Promise((resolve, reject) => {
    const jestArgs = [
      '--config=jest.config.js',
      '--detectOpenHandles',
      '--forceExit',
      ...testFiles,
    ];

    if (options.watch) {
      jestArgs.push('--watch');
    }

    if (options.coverage) {
      jestArgs.push('--coverage');
    }

    if (options.verbose) {
      jestArgs.push('--verbose');
    }

    if (options.ci) {
      jestArgs.push('--watchAll=false', '--passWithNoTests');
    }

    console.log(`\n🧪 Running Jest with args: ${jestArgs.join(' ')}\n`);

    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      shell: true,
    });

    jest.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Jest exited with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      reject(error);
    });
  });
}

function validateTestFiles(testNames) {
  const missing = [];
  
  for (const testName of testNames) {
    if (!TEST_SUITES[testName]) {
      console.warn(`⚠️  Unknown test suite: ${testName}`);
      continue;
    }
    
    const testPath = path.resolve(TEST_SUITES[testName]);
    if (!existsSync(testPath)) {
      missing.push(testPath);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing test files:');
    missing.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🧪 Roastah Test Runner

Usage: node scripts/run-tests.js [command] [options]

Commands:
  all                  Run all tests
  backend             Run all backend tests
  frontend            Run all frontend tests
  integration         Run integration tests
  security            Run security-focused tests
  payments            Run payment processing tests
  realtime            Run real-time feature tests
  unit                Run unit tests only
  [test-name]         Run specific test suite

Available Test Suites:
${Object.entries(TEST_SUITES).map(([name, path]) => `  ${name.padEnd(20)} ${path}`).join('\n')}

Options:
  --watch             Watch mode
  --coverage          Generate coverage report
  --verbose           Verbose output
  --ci                CI mode (no watch, pass with no tests)

Examples:
  node scripts/run-tests.js all --coverage
  node scripts/run-tests.js backend --watch
  node scripts/run-tests.js backend-auth --verbose
  node scripts/run-tests.js security
  node scripts/run-tests.js payments --ci
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const command = args[0];
  const options = {
    watch: args.includes('--watch'),
    coverage: args.includes('--coverage'),
    verbose: args.includes('--verbose'),
    ci: args.includes('--ci'),
  };

  let testNames = [];

  if (TEST_GROUPS[command]) {
    testNames = TEST_GROUPS[command];
  } else if (TEST_SUITES[command]) {
    testNames = [command];
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('\nUse --help to see available commands');
    process.exit(1);
  }

  console.log(`🚀 Running ${command} tests...`);
  console.log(`📋 Test suites: ${testNames.join(', ')}`);

  validateTestFiles(testNames);

  const testFiles = testNames.map(name => TEST_SUITES[name]);

  try {
    await runJest(testFiles, options);
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});