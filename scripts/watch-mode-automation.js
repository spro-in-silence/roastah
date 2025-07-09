#!/usr/bin/env node

/**
 * Intelligent watch mode for automated testing
 * Monitors file changes and runs relevant tests automatically
 */

import { watch } from 'chokidar';
import { spawn } from 'child_process';
import { debounce } from 'lodash';
import path from 'path';

class WatchModeAutomation {
  constructor() {
    this.watchers = new Map();
    this.testQueue = new Set();
    this.isRunning = false;
    this.lastRun = new Date();
    
    // File pattern to test suite mapping
    this.patterns = {
      'server/auth*.ts': ['backend-auth', 'security'],
      'server/oauth-auth.ts': ['backend-auth', 'security'],
      'server/routes.ts': ['backend', 'integration'],
      'server/security.ts': ['security', 'backend'],
      'server/mfa.ts': ['backend-auth', 'security'],
      'shared/schema.ts': ['backend', 'integration'],
      'client/src/pages/auth*.tsx': ['frontend-auth', 'integration'],
      'client/src/pages/seller*.tsx': ['frontend-seller'],
      'client/src/components/**/*.tsx': ['frontend'],
      'tests/backend/auth*.ts': ['backend-auth'],
      'tests/backend/security*.ts': ['security'],
      'tests/backend/products*.ts': ['backend-products'],
      'tests/backend/payments*.ts': ['backend-payments'],
      'tests/frontend/**/*.tsx': ['frontend'],
    };
    
    this.debouncedRun = debounce(this.runTests.bind(this), 1000);
  }

  start() {
    console.log('👁️  Starting intelligent watch mode...');
    
    // Watch source files
    const watcher = watch([
      'server/**/*.ts',
      'client/src/**/*.{ts,tsx}',
      'shared/**/*.ts',
      'tests/**/*.{ts,tsx}'
    ], {
      ignored: [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**',
        'test-results/**'
      ],
      persistent: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      this.handleFileChange(filePath);
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ File added: ${filePath}`);
      this.handleFileChange(filePath);
    });

    watcher.on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${filePath}`);
      this.handleFileChange(filePath);
    });

    console.log('✅ Watch mode started. Press Ctrl+C to stop.');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch mode...');
      watcher.close();
      process.exit(0);
    });
  }

  handleFileChange(filePath) {
    const testSuites = this.getTestSuitesForFile(filePath);
    
    if (testSuites.length === 0) {
      console.log(`⚠️  No tests configured for: ${filePath}`);
      return;
    }

    console.log(`🎯 Queuing tests: ${testSuites.join(', ')}`);
    
    testSuites.forEach(suite => this.testQueue.add(suite));
    
    // Debounced execution to avoid running tests too frequently
    this.debouncedRun();
  }

  getTestSuitesForFile(filePath) {
    const testSuites = new Set();
    
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Check each pattern
    Object.entries(this.patterns).forEach(([pattern, suites]) => {
      if (this.matchesPattern(normalizedPath, pattern)) {
        suites.forEach(suite => testSuites.add(suite));
      }
    });
    
    return Array.from(testSuites);
  }

  matchesPattern(filePath, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  async runTests() {
    if (this.isRunning) {
      console.log('⏳ Tests already running, skipping...');
      return;
    }

    if (this.testQueue.size === 0) {
      console.log('📝 No tests queued');
      return;
    }

    this.isRunning = true;
    const suitesToRun = Array.from(this.testQueue);
    this.testQueue.clear();

    console.log(`\n🚀 Running tests: ${suitesToRun.join(', ')}`);
    console.log(`📅 Last run: ${this.lastRun.toLocaleTimeString()}`);

    try {
      // Run tests in intelligent order
      const orderedSuites = this.orderTestSuites(suitesToRun);
      
      for (const suite of orderedSuites) {
        console.log(`\n🧪 Running ${suite}...`);
        
        const startTime = Date.now();
        await this.runTestSuite(suite);
        const duration = Date.now() - startTime;
        
        console.log(`✅ ${suite} completed in ${duration}ms`);
      }

      this.lastRun = new Date();
      console.log(`\n🎉 All tests completed at ${this.lastRun.toLocaleTimeString()}`);
      
    } catch (error) {
      console.error(`❌ Tests failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  orderTestSuites(suites) {
    // Order tests by priority (fast tests first)
    const priority = {
      'backend-auth': 1,
      'backend-products': 2,
      'backend-cart': 3,
      'backend-orders': 4,
      'backend-payments': 5,
      'security': 6,
      'frontend-auth': 7,
      'frontend-seller': 8,
      'frontend': 9,
      'backend': 10,
      'integration': 11
    };

    return suites.sort((a, b) => {
      const priorityA = priority[a] || 99;
      const priorityB = priority[b] || 99;
      return priorityA - priorityB;
    });
  }

  async runTestSuite(suite) {
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['scripts/run-tests.js', suite, '--ci'], {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test suite ${suite} failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Interactive menu for watch mode options
class WatchModeMenu {
  constructor() {
    this.automation = new WatchModeAutomation();
  }

  start() {
    console.log('🎛️  Watch Mode Options:');
    console.log('1. Smart watch mode (recommended)');
    console.log('2. Full watch mode (all tests)');
    console.log('3. Security-focused watch mode');
    console.log('4. Frontend-only watch mode');
    console.log('5. Backend-only watch mode');
    console.log('6. Custom watch mode');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nSelect option (1-6): ', (answer) => {
      rl.close();
      
      switch (answer.trim()) {
        case '1':
          this.automation.start();
          break;
        case '2':
          this.startFullWatchMode();
          break;
        case '3':
          this.startSecurityWatchMode();
          break;
        case '4':
          this.startFrontendWatchMode();
          break;
        case '5':
          this.startBackendWatchMode();
          break;
        case '6':
          this.startCustomWatchMode();
          break;
        default:
          console.log('Invalid option. Starting smart watch mode...');
          this.automation.start();
      }
    });
  }

  startFullWatchMode() {
    console.log('🔄 Starting full watch mode...');
    // Override patterns to run all tests
    this.automation.patterns = {
      '**/*.{ts,tsx}': ['backend', 'frontend', 'integration', 'security']
    };
    this.automation.start();
  }

  startSecurityWatchMode() {
    console.log('🔒 Starting security-focused watch mode...');
    this.automation.patterns = {
      'server/auth*.ts': ['backend-auth', 'security'],
      'server/oauth-auth.ts': ['backend-auth', 'security'],
      'server/security.ts': ['security'],
      'server/mfa.ts': ['backend-auth', 'security'],
      'tests/backend/auth*.ts': ['backend-auth'],
      'tests/backend/security*.ts': ['security'],
    };
    this.automation.start();
  }

  startFrontendWatchMode() {
    console.log('🎨 Starting frontend-only watch mode...');
    this.automation.patterns = {
      'client/src/**/*.{ts,tsx}': ['frontend'],
      'tests/frontend/**/*.tsx': ['frontend'],
    };
    this.automation.start();
  }

  startBackendWatchMode() {
    console.log('⚙️  Starting backend-only watch mode...');
    this.automation.patterns = {
      'server/**/*.ts': ['backend'],
      'shared/**/*.ts': ['backend'],
      'tests/backend/**/*.ts': ['backend'],
    };
    this.automation.start();
  }

  startCustomWatchMode() {
    console.log('🎯 Custom watch mode not implemented yet. Using smart mode...');
    this.automation.start();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    const menu = new WatchModeMenu();
    menu.start();
  } else {
    // Direct mode
    const automation = new WatchModeAutomation();
    automation.start();
  }
}

main().catch(error => {
  console.error('❌ Watch mode error:', error);
  process.exit(1);
});