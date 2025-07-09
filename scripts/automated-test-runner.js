#!/usr/bin/env node

/**
 * Intelligent automated test runner
 * Analyzes changes and runs appropriate tests automatically
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';

class AutomatedTestRunner {
  constructor() {
    this.changedFiles = [];
    this.testStrategy = 'smart';
    this.results = {
      startTime: new Date(),
      endTime: null,
      testsRun: [],
      success: true,
      coverage: {},
      recommendations: []
    };
  }

  async run() {
    console.log('🤖 Starting automated test analysis...');
    
    try {
      await this.analyzeChanges();
      await this.determineTestStrategy();
      await this.executeTests();
      await this.generateReport();
      await this.makeRecommendations();
      
      console.log('✅ Automated testing completed successfully');
      return this.results.success;
    } catch (error) {
      console.error('❌ Automated testing failed:', error.message);
      this.results.success = false;
      return false;
    }
  }

  async analyzeChanges() {
    console.log('🔍 Analyzing code changes...');
    
    return new Promise((resolve, reject) => {
      exec('git diff --name-only HEAD~1 HEAD', (error, stdout, stderr) => {
        if (error) {
          // If git diff fails, assume all files changed (fresh repo)
          this.changedFiles = ['all'];
          resolve();
          return;
        }
        
        this.changedFiles = stdout.trim().split('\n').filter(Boolean);
        console.log(`📁 Changed files: ${this.changedFiles.length}`);
        resolve();
      });
    });
  }

  async determineTestStrategy() {
    console.log('🎯 Determining test strategy...');
    
    const strategies = {
      critical: this.hasCriticalChanges(),
      security: this.hasSecurityChanges(),
      performance: this.hasPerformanceChanges(),
      frontend: this.hasFrontendChanges(),
      backend: this.hasBackendChanges(),
      database: this.hasDatabaseChanges()
    };

    const activeStrategies = Object.entries(strategies)
      .filter(([_, active]) => active)
      .map(([strategy, _]) => strategy);

    if (activeStrategies.length === 0) {
      this.testStrategy = 'minimal';
    } else if (activeStrategies.includes('critical')) {
      this.testStrategy = 'comprehensive';
    } else if (activeStrategies.includes('security')) {
      this.testStrategy = 'security-focused';
    } else {
      this.testStrategy = 'targeted';
    }

    console.log(`📋 Test strategy: ${this.testStrategy}`);
    console.log(`🎛️  Active strategies: ${activeStrategies.join(', ')}`);
  }

  hasCriticalChanges() {
    const criticalPaths = [
      'server/auth',
      'server/oauth-auth',
      'server/routes',
      'server/security',
      'shared/schema',
      'package.json',
      'server/index'
    ];
    
    return this.changedFiles.some(file => 
      criticalPaths.some(path => file.includes(path))
    );
  }

  hasSecurityChanges() {
    const securityPaths = [
      'server/auth',
      'server/oauth-auth',
      'server/security',
      'server/mfa'
    ];
    
    return this.changedFiles.some(file => 
      securityPaths.some(path => file.includes(path))
    );
  }

  hasPerformanceChanges() {
    const performancePaths = [
      'server/routes',
      'server/db',
      'server/storage',
      'shared/schema'
    ];
    
    return this.changedFiles.some(file => 
      performancePaths.some(path => file.includes(path))
    );
  }

  hasFrontendChanges() {
    return this.changedFiles.some(file => 
      file.startsWith('client/') || file.startsWith('src/')
    );
  }

  hasBackendChanges() {
    return this.changedFiles.some(file => 
      file.startsWith('server/') || file.startsWith('shared/')
    );
  }

  hasDatabaseChanges() {
    return this.changedFiles.some(file => 
      file.includes('schema') || file.includes('migration') || file.includes('db')
    );
  }

  async executeTests() {
    console.log('🧪 Executing tests based on strategy...');
    
    const testSuites = this.getTestSuites();
    
    for (const suite of testSuites) {
      console.log(`\n🔬 Running ${suite.name}...`);
      
      try {
        await this.runTestSuite(suite);
        console.log(`✅ ${suite.name} completed successfully`);
        
        this.results.testsRun.push({
          name: suite.name,
          status: 'passed',
          duration: suite.duration
        });
      } catch (error) {
        console.error(`❌ ${suite.name} failed:`, error.message);
        
        this.results.testsRun.push({
          name: suite.name,
          status: 'failed',
          error: error.message
        });
        
        // Don't fail immediately for non-critical tests
        if (suite.critical) {
          throw error;
        }
      }
    }
  }

  getTestSuites() {
    const baseSuites = [
      { name: 'Quick Validation', command: 'test-quick', critical: true },
      { name: 'Unit Tests', command: 'unit', critical: false }
    ];

    switch (this.testStrategy) {
      case 'comprehensive':
        return [
          ...baseSuites,
          { name: 'Integration Tests', command: 'integration', critical: true },
          { name: 'Security Tests', command: 'security', critical: true },
          { name: 'Performance Tests', command: 'backend --verbose', critical: false },
          { name: 'Regression Tests', command: 'regression', critical: true }
        ];
      
      case 'security-focused':
        return [
          ...baseSuites,
          { name: 'Security Tests', command: 'security', critical: true },
          { name: 'Backend Tests', command: 'backend', critical: true }
        ];
      
      case 'targeted':
        const suites = [...baseSuites];
        
        if (this.hasFrontendChanges()) {
          suites.push({ name: 'Frontend Tests', command: 'frontend', critical: false });
        }
        
        if (this.hasBackendChanges()) {
          suites.push({ name: 'Backend Tests', command: 'backend', critical: false });
        }
        
        return suites;
      
      case 'minimal':
      default:
        return baseSuites;
    }
  }

  async runTestSuite(suite) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const args = suite.command.split(' ');
      const command = args[0];
      const testArgs = args.slice(1);
      
      const process = spawn('node', ['scripts/run-tests.js', command, ...testArgs, '--ci'], {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        suite.duration = duration;
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test suite failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateReport() {
    console.log('📊 Generating test report...');
    
    this.results.endTime = new Date();
    const duration = this.results.endTime - this.results.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      strategy: this.testStrategy,
      changedFiles: this.changedFiles.length,
      duration: duration,
      testsRun: this.results.testsRun.length,
      testsPassed: this.results.testsRun.filter(t => t.status === 'passed').length,
      testsFailed: this.results.testsRun.filter(t => t.status === 'failed').length,
      success: this.results.success,
      details: this.results.testsRun,
      recommendations: this.results.recommendations
    };

    // Write JSON report
    writeFileSync('test-results/automated-test-report.json', JSON.stringify(report, null, 2));
    
    // Write markdown report
    const markdownReport = this.generateMarkdownReport(report);
    writeFileSync('test-results/automated-test-report.md', markdownReport);
    
    console.log('📋 Reports generated:');
    console.log('  - test-results/automated-test-report.json');
    console.log('  - test-results/automated-test-report.md');
  }

  generateMarkdownReport(report) {
    return `# Automated Test Report

## Summary
- **Strategy**: ${report.strategy}
- **Changed Files**: ${report.changedFiles}
- **Duration**: ${report.duration}ms
- **Tests Run**: ${report.testsRun}
- **Passed**: ${report.testsPassed}
- **Failed**: ${report.testsFailed}
- **Success**: ${report.success ? '✅' : '❌'}

## Test Results
${report.details.map(test => `- **${test.name}**: ${test.status === 'passed' ? '✅' : '❌'} (${test.duration || 0}ms)`).join('\n')}

## Recommendations
${report.recommendations.length > 0 ? report.recommendations.map(rec => `- ${rec}`).join('\n') : 'No recommendations'}

## Timestamp
${report.timestamp}
`;
  }

  async makeRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Coverage recommendations
    if (this.results.coverage && this.results.coverage.total < 80) {
      recommendations.push('Consider adding more tests to improve coverage');
    }
    
    // Performance recommendations
    const slowTests = this.results.testsRun.filter(t => t.duration > 30000);
    if (slowTests.length > 0) {
      recommendations.push('Some tests are running slowly - consider optimization');
    }
    
    // Strategy recommendations
    if (this.testStrategy === 'minimal' && this.changedFiles.length > 10) {
      recommendations.push('Large number of changes detected - consider running comprehensive tests');
    }
    
    // Security recommendations
    if (this.hasSecurityChanges() && this.testStrategy !== 'security-focused') {
      recommendations.push('Security-related changes detected - run security tests');
    }
    
    this.results.recommendations = recommendations;
    
    if (recommendations.length > 0) {
      console.log('📝 Recommendations:');
      recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }
}

// CLI interface
async function main() {
  const runner = new AutomatedTestRunner();
  const success = await runner.run();
  
  if (!success) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutomatedTestRunner };