#!/usr/bin/env node

/**
 * CI/CD test runner with comprehensive reporting
 * Designed for automated testing environments
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      coverage: {},
      startTime: new Date(),
      endTime: null,
      suites: []
    };
  }

  async runTests() {
    console.log('🚀 Starting comprehensive test suite...');
    
    try {
      // Ensure test directories exist
      this.ensureDirectories();
      
      // Run all tests with coverage
      await this.executeJest();
      
      // Generate reports
      this.generateReports();
      
      console.log('✅ Test suite completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      return false;
    }
  }

  ensureDirectories() {
    const dirs = ['coverage', 'test-results', 'test-results/junit'];
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  executeJest() {
    return new Promise((resolve, reject) => {
      const jestArgs = [
        '--config=jest.config.js',
        '--coverage',
        '--coverageDirectory=coverage',
        '--coverageReporters=text',
        '--coverageReporters=lcov',
        '--coverageReporters=html',
        '--testResultsProcessor=jest-junit',
        '--watchAll=false',
        '--passWithNoTests',
        '--detectOpenHandles',
        '--forceExit',
        '--verbose'
      ];

      console.log('🧪 Executing Jest with comprehensive configuration...');

      const jest = spawn('npx', ['jest', ...jestArgs], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          JEST_JUNIT_OUTPUT_DIR: 'test-results/junit',
          JEST_JUNIT_OUTPUT_NAME: 'results.xml'
        }
      });

      jest.on('close', (code) => {
        this.results.endTime = new Date();
        
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

  generateReports() {
    const duration = this.results.endTime - this.results.startTime;
    
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: process.env.CI || 'false'
      },
      testSuites: [
        'Backend Authentication Tests',
        'Backend Products Tests',
        'Backend Cart Tests',
        'Backend Orders Tests',
        'Backend Roasters Tests',
        'Backend Payments Tests',
        'Backend Real-time Tests',
        'Backend Security Tests',
        'Frontend Component Tests',
        'Frontend Integration Tests'
      ]
    };

    // Write JSON report
    writeFileSync(
      'test-results/test-report.json',
      JSON.stringify(report, null, 2)
    );

    // Write markdown report
    const markdownReport = this.generateMarkdownReport(report);
    writeFileSync('test-results/TEST-REPORT.md', markdownReport);

    console.log('📊 Test reports generated:');
    console.log('  - test-results/test-report.json');
    console.log('  - test-results/TEST-REPORT.md');
    console.log('  - coverage/lcov-report/index.html');
  }

  generateMarkdownReport(report) {
    return `# Test Report

## Summary
- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}
- **Skipped**: ${report.summary.skipped}
- **Duration**: ${report.summary.duration}
- **Timestamp**: ${report.summary.timestamp}

## Environment
- **Node Version**: ${report.environment.nodeVersion}
- **Platform**: ${report.environment.platform}
- **Architecture**: ${report.environment.arch}
- **CI**: ${report.environment.ci}

## Test Suites
${report.testSuites.map(suite => `- ${suite}`).join('\n')}

## Coverage
Coverage reports available in:
- HTML: \`coverage/lcov-report/index.html\`
- LCOV: \`coverage/lcov.info\`

## Files
- Detailed results: \`test-results/junit/results.xml\`
- JSON report: \`test-results/test-report.json\`
`;
  }
}

async function main() {
  const runner = new TestRunner();
  const success = await runner.runTests();
  
  if (!success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});