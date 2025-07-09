#!/usr/bin/env node

/**
 * Automated test scheduler for continuous testing
 * Runs different test suites at optimal intervals
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import cron from 'node-cron';

class TestAutomationScheduler {
  constructor() {
    this.schedules = new Map();
    this.results = new Map();
    this.isRunning = false;
    this.configFile = 'test-automation-config.json';
    
    this.defaultSchedules = {
      'quick-validation': {
        cron: '*/10 * * * *', // Every 10 minutes
        description: 'Quick validation tests',
        command: 'test-quick',
        priority: 'high'
      },
      'unit-tests': {
        cron: '*/30 * * * *', // Every 30 minutes
        description: 'Unit test suite',
        command: 'unit',
        priority: 'medium'
      },
      'security-scan': {
        cron: '0 */2 * * *', // Every 2 hours
        description: 'Security testing',
        command: 'security',
        priority: 'high'
      },
      'integration-tests': {
        cron: '0 */4 * * *', // Every 4 hours
        description: 'Integration tests',
        command: 'integration',
        priority: 'medium'
      },
      'performance-tests': {
        cron: '0 */6 * * *', // Every 6 hours
        description: 'Performance monitoring',
        command: 'backend --verbose',
        priority: 'low'
      },
      'comprehensive-suite': {
        cron: '0 2 * * *', // Daily at 2 AM
        description: 'Full test suite',
        command: 'all',
        priority: 'high'
      },
      'regression-tests': {
        cron: '0 8,14,20 * * *', // 8 AM, 2 PM, 8 PM daily
        description: 'Regression testing',
        command: 'regression',
        priority: 'high'
      }
    };
  }

  async start() {
    console.log('⏰ Starting test automation scheduler...');
    
    this.loadConfig();
    this.setupSchedules();
    this.setupReporting();
    
    console.log('📋 Scheduled tests:');
    this.schedules.forEach((schedule, name) => {
      console.log(`  - ${name}: ${schedule.description} (${schedule.cron})`);
    });
    
    console.log('\n✅ Scheduler started. Press Ctrl+C to stop.');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping scheduler...');
      this.stop();
      process.exit(0);
    });
  }

  loadConfig() {
    if (existsSync(this.configFile)) {
      try {
        const config = JSON.parse(readFileSync(this.configFile, 'utf8'));
        this.schedules = new Map(Object.entries(config.schedules || {}));
        console.log('📄 Loaded configuration from file');
      } catch (error) {
        console.warn('⚠️  Could not load config file, using defaults');
        this.schedules = new Map(Object.entries(this.defaultSchedules));
      }
    } else {
      this.schedules = new Map(Object.entries(this.defaultSchedules));
      this.saveConfig();
    }
  }

  saveConfig() {
    const config = {
      schedules: Object.fromEntries(this.schedules),
      lastUpdated: new Date().toISOString()
    };
    
    writeFileSync(this.configFile, JSON.stringify(config, null, 2));
  }

  setupSchedules() {
    this.schedules.forEach((schedule, name) => {
      const task = cron.schedule(schedule.cron, async () => {
        await this.runScheduledTest(name, schedule);
      }, {
        scheduled: true,
        timezone: 'UTC'
      });
      
      schedule.task = task;
    });
  }

  setupReporting() {
    // Generate daily report
    cron.schedule('0 23 * * *', async () => {
      await this.generateDailyReport();
    });
    
    // Generate weekly report
    cron.schedule('0 0 * * 0', async () => {
      await this.generateWeeklyReport();
    });
  }

  async runScheduledTest(name, schedule) {
    if (this.isRunning) {
      console.log(`⏳ Skipping ${name} - another test is running`);
      return;
    }

    console.log(`\n🚀 Running scheduled test: ${name}`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    
    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      await this.executeTest(schedule.command);
      const duration = Date.now() - startTime;
      
      this.recordResult(name, {
        timestamp: new Date().toISOString(),
        status: 'success',
        duration: duration,
        command: schedule.command
      });
      
      console.log(`✅ ${name} completed successfully in ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordResult(name, {
        timestamp: new Date().toISOString(),
        status: 'failed',
        duration: duration,
        command: schedule.command,
        error: error.message
      });
      
      console.error(`❌ ${name} failed:`, error.message);
      
      // Send alert for high priority failures
      if (schedule.priority === 'high') {
        await this.sendAlert(name, error.message);
      }
    } finally {
      this.isRunning = false;
    }
  }

  async executeTest(command) {
    return new Promise((resolve, reject) => {
      const args = command.split(' ');
      const process = spawn('node', ['scripts/run-tests.js', ...args, '--ci'], {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test command failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  recordResult(testName, result) {
    if (!this.results.has(testName)) {
      this.results.set(testName, []);
    }
    
    const results = this.results.get(testName);
    results.push(result);
    
    // Keep only last 100 results per test
    if (results.length > 100) {
      results.splice(0, results.length - 100);
    }
  }

  async sendAlert(testName, errorMessage) {
    console.log(`🚨 HIGH PRIORITY FAILURE: ${testName}`);
    console.log(`Error: ${errorMessage}`);
    
    // In a real implementation, this would send email/Slack/etc.
    const alert = {
      timestamp: new Date().toISOString(),
      testName: testName,
      error: errorMessage,
      severity: 'HIGH'
    };
    
    // Log to file
    const alertFile = 'test-results/alerts.json';
    let alerts = [];
    
    if (existsSync(alertFile)) {
      try {
        alerts = JSON.parse(readFileSync(alertFile, 'utf8'));
      } catch (error) {
        alerts = [];
      }
    }
    
    alerts.push(alert);
    writeFileSync(alertFile, JSON.stringify(alerts, null, 2));
  }

  async generateDailyReport() {
    console.log('📊 Generating daily test report...');
    
    const today = new Date().toISOString().split('T')[0];
    const report = {
      date: today,
      summary: {},
      details: {}
    };
    
    let totalTests = 0;
    let successfulTests = 0;
    let failedTests = 0;
    
    this.results.forEach((results, testName) => {
      const todayResults = results.filter(r => 
        r.timestamp.startsWith(today)
      );
      
      if (todayResults.length > 0) {
        const successful = todayResults.filter(r => r.status === 'success').length;
        const failed = todayResults.filter(r => r.status === 'failed').length;
        
        report.details[testName] = {
          total: todayResults.length,
          successful: successful,
          failed: failed,
          successRate: (successful / todayResults.length * 100).toFixed(1),
          avgDuration: todayResults.reduce((sum, r) => sum + r.duration, 0) / todayResults.length
        };
        
        totalTests += todayResults.length;
        successfulTests += successful;
        failedTests += failed;
      }
    });
    
    report.summary = {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      successRate: totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(1) : 0
    };
    
    const reportFile = `test-results/daily-report-${today}.json`;
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📋 Daily report saved: ${reportFile}`);
    console.log(`📈 Success rate: ${report.summary.successRate}%`);
  }

  async generateWeeklyReport() {
    console.log('📊 Generating weekly test report...');
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const report = {
      weekOf: startDate.toISOString().split('T')[0],
      summary: {},
      trends: {},
      recommendations: []
    };
    
    // Calculate weekly statistics
    let totalTests = 0;
    let successfulTests = 0;
    let failedTests = 0;
    
    this.results.forEach((results, testName) => {
      const weekResults = results.filter(r => {
        const resultDate = new Date(r.timestamp);
        return resultDate >= startDate && resultDate <= endDate;
      });
      
      if (weekResults.length > 0) {
        const successful = weekResults.filter(r => r.status === 'success').length;
        const failed = weekResults.filter(r => r.status === 'failed').length;
        
        totalTests += weekResults.length;
        successfulTests += successful;
        failedTests += failed;
        
        // Calculate trends
        const firstHalf = weekResults.slice(0, Math.floor(weekResults.length / 2));
        const secondHalf = weekResults.slice(Math.floor(weekResults.length / 2));
        
        const firstHalfSuccess = firstHalf.filter(r => r.status === 'success').length / firstHalf.length;
        const secondHalfSuccess = secondHalf.filter(r => r.status === 'success').length / secondHalf.length;
        
        report.trends[testName] = {
          improving: secondHalfSuccess > firstHalfSuccess,
          successRate: (successful / weekResults.length * 100).toFixed(1)
        };
      }
    });
    
    report.summary = {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      successRate: totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(1) : 0
    };
    
    // Generate recommendations
    if (report.summary.successRate < 90) {
      report.recommendations.push('Overall success rate is below 90% - investigate failing tests');
    }
    
    Object.entries(report.trends).forEach(([testName, trend]) => {
      if (parseFloat(trend.successRate) < 80) {
        report.recommendations.push(`${testName} has low success rate (${trend.successRate}%)`);
      }
      if (!trend.improving) {
        report.recommendations.push(`${testName} success rate is declining`);
      }
    });
    
    const reportFile = `test-results/weekly-report-${startDate.toISOString().split('T')[0]}.json`;
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📋 Weekly report saved: ${reportFile}`);
    console.log(`📈 Weekly success rate: ${report.summary.successRate}%`);
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  stop() {
    this.schedules.forEach((schedule, name) => {
      if (schedule.task) {
        schedule.task.stop();
      }
    });
    console.log('⏹️  All scheduled tests stopped');
  }

  // Management methods
  addSchedule(name, cronExpression, command, priority = 'medium') {
    this.schedules.set(name, {
      cron: cronExpression,
      description: `Custom test: ${name}`,
      command: command,
      priority: priority
    });
    
    this.saveConfig();
    console.log(`➕ Added schedule: ${name}`);
  }

  removeSchedule(name) {
    if (this.schedules.has(name)) {
      const schedule = this.schedules.get(name);
      if (schedule.task) {
        schedule.task.stop();
      }
      this.schedules.delete(name);
      this.saveConfig();
      console.log(`➖ Removed schedule: ${name}`);
    }
  }

  listSchedules() {
    console.log('📋 Current schedules:');
    this.schedules.forEach((schedule, name) => {
      console.log(`  - ${name}: ${schedule.description} (${schedule.cron})`);
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new TestAutomationScheduler();
  
  if (args.length === 0) {
    await scheduler.start();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'start':
        await scheduler.start();
        break;
      case 'list':
        scheduler.loadConfig();
        scheduler.listSchedules();
        break;
      case 'add':
        if (args.length >= 4) {
          scheduler.loadConfig();
          scheduler.addSchedule(args[1], args[2], args[3], args[4]);
        } else {
          console.log('Usage: add <name> <cron> <command> [priority]');
        }
        break;
      case 'remove':
        if (args.length >= 2) {
          scheduler.loadConfig();
          scheduler.removeSchedule(args[1]);
        } else {
          console.log('Usage: remove <name>');
        }
        break;
      default:
        console.log('Usage: node test-automation-scheduler.js [start|list|add|remove]');
    }
  }
}

main().catch(error => {
  console.error('❌ Scheduler error:', error);
  process.exit(1);
});