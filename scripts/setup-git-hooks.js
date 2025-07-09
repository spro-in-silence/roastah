#!/usr/bin/env node

/**
 * Setup Git hooks for automated testing
 * Enterprise-grade quality gates for Roastah marketplace
 */

import { writeFileSync, chmodSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const hooks = {
  'pre-commit': `#!/bin/sh
# Pre-commit hook for Roastah marketplace
# Ensures code quality before commits

echo "🧪 Running pre-commit tests..."

# Run unit tests for quick feedback
echo "Running unit tests..."
if ! node scripts/run-tests.js unit --ci; then
    echo "❌ Unit tests failed - commit blocked"
    exit 1
fi

# Run security tests (critical)
echo "Running security tests..."
if ! node scripts/run-tests.js security --ci; then
    echo "❌ Security tests failed - commit blocked"
    exit 1
fi

# Check for minimum test coverage
echo "Checking code coverage..."
if ! node scripts/run-tests.js unit --coverage --ci; then
    echo "❌ Coverage below threshold - commit blocked"
    exit 1
fi

echo "✅ Pre-commit tests passed"
`,

  'pre-push': `#!/bin/sh
# Pre-push hook for Roastah marketplace
# Comprehensive validation before pushing

echo "🚀 Running pre-push validation..."

# Full test suite
echo "Running full test suite..."
if ! node scripts/run-tests.js all --coverage --ci; then
    echo "❌ Full test suite failed - push blocked"
    exit 1
fi

# Performance validation
echo "Running performance tests..."
if ! node scripts/run-tests.js backend --verbose --ci; then
    echo "❌ Performance tests failed - push blocked"
    exit 1
fi

# Final security check
echo "Final security validation..."
if ! node scripts/run-tests.js security --ci; then
    echo "❌ Security validation failed - push blocked"
    exit 1
fi

echo "✅ Pre-push validation passed"
`,

  'commit-msg': `#!/bin/sh
# Commit message validation
# Ensures commit messages follow conventional format

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo "Format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo "Example: feat(auth): add login functionality"
    exit 1
fi

echo "✅ Commit message format valid"
`,

  'post-merge': `#!/bin/sh
# Post-merge hook for Roastah marketplace
# Runs after successful merge

echo "🔄 Post-merge actions..."

# Install any new dependencies
if [ -f "package-lock.json" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Run database migrations if needed
if [ -f "migrations/" ]; then
    echo "Checking for database migrations..."
    npm run db:push
fi

# Run smoke tests to ensure merge didn't break anything
echo "Running smoke tests..."
if ! node scripts/run-tests.js unit --ci; then
    echo "⚠️  Smoke tests failed after merge - please check"
    exit 1
fi

echo "✅ Post-merge actions completed"
`
};

function setupGitHooks() {
  console.log('🔧 Setting up Git hooks for Roastah marketplace...');

  // Ensure .git/hooks directory exists
  const hooksDir = '.git/hooks';
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  // Install each hook
  Object.entries(hooks).forEach(([hookName, hookContent]) => {
    const hookPath = join(hooksDir, hookName);
    
    console.log(`Installing ${hookName} hook...`);
    writeFileSync(hookPath, hookContent);
    chmodSync(hookPath, 0o755);
    
    console.log(`✅ ${hookName} hook installed`);
  });

  console.log('\n🎉 Git hooks setup complete!');
  console.log('\nInstalled hooks:');
  console.log('  - pre-commit: Unit tests + security validation');
  console.log('  - pre-push: Full test suite + performance checks');
  console.log('  - commit-msg: Commit message format validation');
  console.log('  - post-merge: Dependency updates + smoke tests');
  
  console.log('\nTo bypass hooks (emergency only):');
  console.log('  git commit --no-verify');
  console.log('  git push --no-verify');
}

// Create test execution scripts for different phases
function createTestScripts() {
  console.log('\n📝 Creating test execution scripts...');

  const scripts = {
    'test-quick.js': `#!/usr/bin/env node
// Quick tests for development workflow
import { spawn } from 'child_process';

async function runQuickTests() {
  console.log('🏃 Running quick tests...');
  
  const tests = [
    'node scripts/run-tests.js unit --ci',
    'node scripts/run-tests.js security --ci'
  ];
  
  for (const test of tests) {
    console.log(\`Running: \${test}\`);
    const result = spawn('bash', ['-c', test], { stdio: 'inherit' });
    
    await new Promise((resolve) => {
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(\`❌ Test failed: \${test}\`);
          process.exit(1);
        }
        resolve();
      });
    });
  }
  
  console.log('✅ Quick tests passed');
}

runQuickTests();
`,

    'test-comprehensive.js': `#!/usr/bin/env node
// Comprehensive tests for CI/CD pipeline
import { spawn } from 'child_process';

async function runComprehensiveTests() {
  console.log('🔬 Running comprehensive tests...');
  
  const result = spawn('node', ['scripts/test-ci.js'], { stdio: 'inherit' });
  
  await new Promise((resolve) => {
    result.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Comprehensive tests failed');
        process.exit(1);
      }
      resolve();
    });
  });
  
  console.log('✅ Comprehensive tests passed');
}

runComprehensiveTests();
`,

    'test-regression.js': `#!/usr/bin/env node
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
    console.log(\`Testing: \${suite}\`);
    
    const result = spawn('node', ['scripts/run-tests.js', suite, '--ci'], { stdio: 'inherit' });
    
    await new Promise((resolve) => {
      result.on('close', (code) => {
        if (code !== 0) {
          console.error(\`❌ Regression test failed: \${suite}\`);
          process.exit(1);
        }
        resolve();
      });
    });
  }
  
  console.log('✅ Regression tests passed');
}

runRegressionTests();
`
  };

  Object.entries(scripts).forEach(([scriptName, content]) => {
    const scriptPath = join('scripts', scriptName);
    writeFileSync(scriptPath, content);
    chmodSync(scriptPath, 0o755);
    console.log(`✅ Created ${scriptName}`);
  });
}

function main() {
  try {
    setupGitHooks();
    createTestScripts();
    
    console.log('\n🎯 Enterprise testing strategy implemented!');
    console.log('\nNext steps:');
    console.log('1. Test the hooks: git commit -m "test: verify hooks work"');
    console.log('2. Run quick tests: node scripts/test-quick.js');
    console.log('3. Run comprehensive: node scripts/test-comprehensive.js');
    console.log('4. Configure CI/CD with provided YAML examples');
    
  } catch (error) {
    console.error('❌ Error setting up Git hooks:', error);
    process.exit(1);
  }
}

main();