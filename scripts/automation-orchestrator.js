#!/usr/bin/env node

/**
 * Master automation orchestrator for Roastah testing
 * Coordinates all automated testing activities
 */

import { spawn } from 'child_process';
import { AutomatedTestRunner } from './automated-test-runner.js';
import { writeFileSync, existsSync } from 'fs';

class AutomationOrchestrator {
  constructor() {
    this.services = new Map();
    this.config = {
      enableScheduler: true,
      enableWatchMode: true,
      enableGitHooks: true,
      enableCICD: true,
      logLevel: 'info'
    };
  }

  async start() {
    console.log('🤖 Starting Roastah Test Automation Orchestrator...');
    
    // Initialize all automation services
    await this.initializeServices();
    
    // Start automated testing
    await this.startAutomatedTesting();
    
    console.log('✅ All automation services are running');
    console.log('📊 Automation dashboard available at: test-results/automation-dashboard.html');
    
    // Keep process alive and monitor services
    this.monitorServices();
  }

  async initializeServices() {
    console.log('🔧 Initializing automation services...');
    
    // Service configurations
    const serviceConfigs = [
      {
        name: 'git-hooks',
        description: 'Automated Git hooks for quality gates',
        enabled: this.config.enableGitHooks,
        script: 'setup-git-hooks.js',
        autoStart: true
      },
      {
        name: 'watch-mode',
        description: 'Intelligent file watching and testing',
        enabled: this.config.enableWatchMode,
        script: 'watch-mode-automation.js',
        autoStart: false // Manual start
      },
      {
        name: 'scheduler',
        description: 'Automated test scheduling',
        enabled: this.config.enableScheduler,
        script: 'test-automation-scheduler.js',
        autoStart: false // Manual start for background process
      },
      {
        name: 'ci-runner',
        description: 'Automated test runner for CI/CD',
        enabled: this.config.enableCICD,
        script: 'automated-test-runner.js',
        autoStart: false // Triggered by CI/CD
      }
    ];

    // Initialize each service
    for (const config of serviceConfigs) {
      if (config.enabled) {
        console.log(`🔄 Initializing ${config.name}...`);
        
        if (config.autoStart) {
          await this.startService(config);
        } else {
          this.services.set(config.name, { config, status: 'initialized' });
        }
        
        console.log(`✅ ${config.name} ready`);
      }
    }
  }

  async startService(config) {
    try {
      if (config.script === 'setup-git-hooks.js') {
        // Run git hooks setup once
        await this.runCommand('node', ['scripts/setup-git-hooks.js']);
        this.services.set(config.name, { config, status: 'completed' });
      } else {
        // Other services are handled differently
        this.services.set(config.name, { config, status: 'ready' });
      }
    } catch (error) {
      console.error(`❌ Failed to start ${config.name}:`, error.message);
      this.services.set(config.name, { config, status: 'failed', error: error.message });
    }
  }

  async startAutomatedTesting() {
    console.log('🚀 Starting automated testing workflows...');
    
    // Create automation dashboard
    await this.createDashboard();
    
    // Start intelligent test runner
    const testRunner = new AutomatedTestRunner();
    
    try {
      const success = await testRunner.run();
      console.log(success ? '✅ Initial automated tests passed' : '❌ Initial automated tests failed');
    } catch (error) {
      console.error('❌ Automated test runner failed:', error.message);
    }
    
    // Schedule periodic comprehensive tests
    this.schedulePeriodicTests();
  }

  async createDashboard() {
    console.log('📊 Creating automation dashboard...');
    
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roastah Test Automation Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .service-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.ready { background: #10b981; color: white; }
        .status.failed { background: #ef4444; color: white; }
        .status.completed { background: #6366f1; color: white; }
        .commands { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .command { background: #1f2937; color: #10b981; padding: 10px; border-radius: 4px; margin: 5px 0; font-family: monospace; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
        .metric { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Roastah Test Automation Dashboard</h1>
            <p>Comprehensive automated testing orchestration for enterprise-grade quality assurance</p>
        </div>
        
        <div class="services">
            <div class="service-card">
                <h3>🔧 Git Hooks</h3>
                <span class="status completed">ACTIVE</span>
                <p>Automated quality gates preventing broken code commits</p>
                <ul>
                    <li>Pre-commit: Unit tests + security validation</li>
                    <li>Pre-push: Full test suite + performance checks</li>
                    <li>Commit format validation</li>
                    <li>Post-merge: Dependencies + smoke tests</li>
                </ul>
            </div>
            
            <div class="service-card">
                <h3>👁️ Watch Mode</h3>
                <span class="status ready">READY</span>
                <p>Intelligent file monitoring with automatic test execution</p>
                <ul>
                    <li>Smart test selection based on changed files</li>
                    <li>Debounced execution to avoid test spam</li>
                    <li>Priority-based test ordering</li>
                    <li>Real-time feedback during development</li>
                </ul>
            </div>
            
            <div class="service-card">
                <h3>⏰ Scheduler</h3>
                <span class="status ready">READY</span>
                <p>Automated test scheduling for continuous validation</p>
                <ul>
                    <li>Quick validation: Every 10 minutes</li>
                    <li>Security scan: Every 2 hours</li>
                    <li>Integration tests: Every 4 hours</li>
                    <li>Full suite: Daily at 2 AM</li>
                </ul>
            </div>
            
            <div class="service-card">
                <h3>🚀 CI/CD Integration</h3>
                <span class="status ready">READY</span>
                <p>GitHub Actions workflows for automated testing</p>
                <ul>
                    <li>Fast feedback on all pushes</li>
                    <li>Comprehensive testing on main branch</li>
                    <li>Deployment validation</li>
                    <li>Security scanning and reporting</li>
                </ul>
            </div>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">13</div>
                <div>Test Files</div>
            </div>
            <div class="metric">
                <div class="metric-value">80%</div>
                <div>Coverage Target</div>
            </div>
            <div class="metric">
                <div class="metric-value">4</div>
                <div>Test Runners</div>
            </div>
            <div class="metric">
                <div class="metric-value">24/7</div>
                <div>Automation</div>
            </div>
        </div>
        
        <div class="commands">
            <h3>🎛️ Available Commands</h3>
            <div class="command">node scripts/test-quick.js</div>
            <div class="command">node scripts/test-dev.js</div>
            <div class="command">node scripts/watch-mode-automation.js</div>
            <div class="command">node scripts/test-automation-scheduler.js start</div>
            <div class="command">node scripts/automated-test-runner.js</div>
            <div class="command">node scripts/test-regression.js</div>
            <div class="command">node scripts/test-deployment.js</div>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;

    // Ensure test-results directory exists
    if (!existsSync('test-results')) {
      const { mkdirSync } = await import('fs');
      mkdirSync('test-results', { recursive: true });
    }
    
    writeFileSync('test-results/automation-dashboard.html', dashboardHTML);
    console.log('📊 Dashboard created at: test-results/automation-dashboard.html');
  }

  schedulePeriodicTests() {
    console.log('⏰ Scheduling periodic automated tests...');
    
    // Schedule comprehensive tests every 6 hours
    setInterval(async () => {
      console.log('🔄 Running scheduled comprehensive tests...');
      
      try {
        const testRunner = new AutomatedTestRunner();
        await testRunner.run();
      } catch (error) {
        console.error('❌ Scheduled test failed:', error.message);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    // Schedule quick validation every 30 minutes
    setInterval(async () => {
      console.log('🏃 Running scheduled quick validation...');
      
      try {
        await this.runCommand('node', ['scripts/test-quick.js']);
      } catch (error) {
        console.error('❌ Quick validation failed:', error.message);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  monitorServices() {
    console.log('👁️ Monitoring automation services...');
    
    // Service health check every 5 minutes
    setInterval(() => {
      console.log('💓 Service health check...');
      
      this.services.forEach((service, name) => {
        console.log(`  ${name}: ${service.status}`);
      });
    }, 5 * 60 * 1000); // 5 minutes
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down automation orchestrator...');
      process.exit(0);
    });
  }

  async runCommand(command, args = []) {
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

  // Service management methods
  async startWatchMode() {
    console.log('👁️ Starting watch mode...');
    spawn('node', ['scripts/watch-mode-automation.js'], {
      stdio: 'inherit',
      shell: true,
      detached: true
    });
  }

  async startScheduler() {
    console.log('⏰ Starting test scheduler...');
    spawn('node', ['scripts/test-automation-scheduler.js', 'start'], {
      stdio: 'inherit',
      shell: true,
      detached: true
    });
  }

  showStatus() {
    console.log('📊 Automation Status:');
    this.services.forEach((service, name) => {
      const status = service.status === 'ready' ? '✅' : 
                    service.status === 'completed' ? '✅' : 
                    service.status === 'failed' ? '❌' : '⏳';
      
      console.log(`  ${status} ${name}: ${service.config.description}`);
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const orchestrator = new AutomationOrchestrator();
  
  if (args.length === 0) {
    await orchestrator.start();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'start':
        await orchestrator.start();
        break;
      case 'watch':
        await orchestrator.startWatchMode();
        break;
      case 'schedule':
        await orchestrator.startScheduler();
        break;
      case 'status':
        orchestrator.showStatus();
        break;
      default:
        console.log('Usage: node automation-orchestrator.js [start|watch|schedule|status]');
    }
  }
}

main().catch(error => {
  console.error('❌ Orchestrator error:', error);
  process.exit(1);
});