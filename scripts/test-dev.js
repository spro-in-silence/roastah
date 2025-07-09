#!/usr/bin/env node

/**
 * Development test runner with watch mode and interactive features
 * Optimized for local development workflow
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import readline from 'readline';

class DevTestRunner {
  constructor() {
    this.currentProcess = null;
    this.watchMode = false;
    this.selectedSuite = 'all';
  }

  async start() {
    console.log('🧪 Roastah Development Test Runner');
    console.log('=====================================');
    
    await this.showMenu();
  }

  async showMenu() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\nAvailable options:');
    console.log('1. Run all tests');
    console.log('2. Run backend tests');
    console.log('3. Run frontend tests');
    console.log('4. Run specific test suite');
    console.log('5. Toggle watch mode (currently: ' + (this.watchMode ? 'ON' : 'OFF') + ')');
    console.log('6. Run with coverage');
    console.log('7. Exit');

    rl.question('\nSelect option (1-7): ', async (answer) => {
      rl.close();
      
      switch (answer.trim()) {
        case '1':
          await this.runTests('all');
          break;
        case '2':
          await this.runTests('backend');
          break;
        case '3':
          await this.runTests('frontend');
          break;
        case '4':
          await this.selectSpecificSuite();
          break;
        case '5':
          this.watchMode = !this.watchMode;
          console.log(`Watch mode ${this.watchMode ? 'enabled' : 'disabled'}`);
          await this.showMenu();
          break;
        case '6':
          await this.runTests('all', { coverage: true });
          break;
        case '7':
          console.log('Goodbye!');
          process.exit(0);
          break;
        default:
          console.log('Invalid option. Please try again.');
          await this.showMenu();
      }
    });
  }

  async selectSpecificSuite() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const suites = [
      'auth', 'products', 'cart', 'orders', 'roasters',
      'payments', 'realtime', 'security', 'frontend-components'
    ];

    console.log('\nAvailable test suites:');
    suites.forEach((suite, index) => {
      console.log(`${index + 1}. ${suite}`);
    });

    rl.question('\nSelect suite number: ', async (answer) => {
      rl.close();
      
      const index = parseInt(answer.trim()) - 1;
      if (index >= 0 && index < suites.length) {
        await this.runTests(suites[index]);
      } else {
        console.log('Invalid selection.');
        await this.showMenu();
      }
    });
  }

  async runTests(suite, options = {}) {
    const testPatterns = this.getTestPatterns(suite);
    const jestArgs = this.buildJestArgs(testPatterns, options);

    console.log(`\n🚀 Running ${suite} tests${this.watchMode ? ' in watch mode' : ''}...`);

    try {
      await this.executeJest(jestArgs);
      
      if (!this.watchMode) {
        console.log('\n✅ Tests completed!');
        await this.showMenu();
      }
    } catch (error) {
      console.error('\n❌ Tests failed:', error.message);
      
      if (!this.watchMode) {
        await this.showMenu();
      }
    }
  }

  getTestPatterns(suite) {
    const patterns = {
      all: [],
      backend: ['tests/backend/'],
      frontend: ['tests/frontend/'],
      auth: ['tests/backend/auth.test.ts'],
      products: ['tests/backend/products.test.ts'],
      cart: ['tests/backend/cart.test.ts'],
      orders: ['tests/backend/orders.test.ts'],
      roasters: ['tests/backend/roasters.test.ts'],
      payments: ['tests/backend/payments.test.ts'],
      realtime: ['tests/backend/realtime.test.ts'],
      security: ['tests/backend/security.test.ts'],
      'frontend-components': ['tests/frontend/components/']
    };

    return patterns[suite] || [];
  }

  buildJestArgs(testPatterns, options) {
    const args = [
      '--config=jest.config.js',
      '--detectOpenHandles',
      '--verbose'
    ];

    if (this.watchMode) {
      args.push('--watch');
    }

    if (options.coverage) {
      args.push('--coverage');
    }

    if (testPatterns.length > 0) {
      args.push(...testPatterns);
    }

    return args;
  }

  executeJest(args) {
    return new Promise((resolve, reject) => {
      console.log(`Running: npx jest ${args.join(' ')}`);

      this.currentProcess = spawn('npx', ['jest', ...args], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'test'
        }
      });

      this.currentProcess.on('close', (code) => {
        this.currentProcess = null;
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Jest exited with code ${code}`));
        }
      });

      this.currentProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  cleanup() {
    if (this.currentProcess) {
      this.currentProcess.kill();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down test runner...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down test runner...');
  process.exit(0);
});

async function main() {
  const runner = new DevTestRunner();
  await runner.start();
}

main().catch(error => {
  console.error('❌ Dev test runner error:', error);
  process.exit(1);
});