# Testing Quick Start Guide

## Immediate Setup (5 minutes)

### 1. Install Git Hooks
```bash
# Setup automated quality gates
node scripts/setup-git-hooks.js
```

### 2. Test Your Setup
```bash
# Quick smoke test
node scripts/test-quick.js

# Interactive test runner
node scripts/test-dev.js
```

## Daily Development Workflow

### Starting Work
```bash
# Before making changes
node scripts/test-quick.js  # Ensure baseline is clean
```

### During Development
```bash
# Test-driven development
node scripts/run-tests.js backend-auth --watch  # Focus on your area

# Quick validation
node scripts/test-quick.js  # Before each commit
```

### Before Committing
```bash
# Git hooks run automatically, but you can test manually:
node scripts/test-quick.js
```

### Before Pushing
```bash
# Git hooks run automatically, but you can test manually:
node scripts/run-tests.js all --coverage
```

## Key Testing Commands

### For Different Scenarios

#### Working on Authentication
```bash
node scripts/run-tests.js backend-auth --watch
```

#### Working on Product Features  
```bash
node scripts/run-tests.js backend-products --watch
```

#### Working on Frontend Components
```bash
node scripts/run-tests.js frontend --watch
```

#### Working on Payments
```bash
node scripts/run-tests.js backend-payments --watch
```

#### Before Major Changes
```bash
node scripts/test-regression.js  # Test critical areas
```

#### Before Deployment
```bash
node scripts/test-deployment.js  # Full validation
```

## Understanding Test Results

### Test Passes ✅
- Green checkmarks and "passed" messages
- Code coverage above 80%
- No security vulnerabilities

### Test Fails ❌
- Red X marks and "failed" messages
- Detailed error output
- Git hooks will block commits/pushes

### Coverage Reports
- HTML report: `coverage/lcov-report/index.html`
- Summary in terminal after `--coverage` flag

## Emergency Situations

### Bypass Hooks (Use Sparingly)
```bash
# Emergency commit (NOT recommended)
git commit --no-verify -m "emergency fix"

# Emergency push (NOT recommended)  
git push --no-verify
```

### Debug Test Failures
```bash
# Verbose output
node scripts/run-tests.js backend-auth --verbose

# Interactive debugging
node scripts/test-dev.js
```

## Test Types Explained

### Unit Tests
- Fast, isolated tests
- Mock external dependencies
- Run frequently during development

### Integration Tests  
- Test multiple components together
- Use real database connections
- Run before commits

### Security Tests
- Authentication validation
- Input sanitization
- Rate limiting checks

### Performance Tests
- Response time validation
- Load testing scenarios
- Memory usage monitoring

## When to Run What

### Every 5 minutes (During Development)
```bash
node scripts/run-tests.js [your-area] --watch
```

### Every Commit
```bash
node scripts/test-quick.js  # Automatic via git hooks
```

### Every Push
```bash
node scripts/run-tests.js all --coverage  # Automatic via git hooks
```

### Before Major Changes
```bash
node scripts/test-regression.js
```

### Before Deployment
```bash
node scripts/test-deployment.js
```

## Troubleshooting

### Common Issues

#### Tests Won't Run
```bash
# Check Jest installation
npx jest --version

# Reinstall dependencies
npm ci
```

#### Database Connection Issues
```bash
# Reset test database
npm run db:push
```

#### Coverage Too Low
```bash
# Check coverage report
node scripts/run-tests.js unit --coverage
# Open: coverage/lcov-report/index.html
```

#### Git Hooks Not Working
```bash
# Reinstall hooks
node scripts/setup-git-hooks.js
```

## Performance Tips

### Faster Test Execution
- Use `--watch` for development
- Run specific test suites instead of all
- Use `--ci` flag for faster CI execution

### Parallel Testing
- Tests run in parallel by default
- Database tests use isolated transactions
- Each test file runs independently

## Advanced Usage

### Custom Test Suites
```bash
# Create custom test combinations
node scripts/run-tests.js backend-auth backend-payments --watch
```

### CI/CD Integration
- Quality gates run automatically on push
- Comprehensive tests run on main branch
- Coverage reports uploaded to Codecov

### Monitoring
- Test execution time tracking
- Coverage trend analysis
- Performance regression detection

## Next Steps

1. **Start with quick tests**: `node scripts/test-quick.js`
2. **Set up git hooks**: `node scripts/setup-git-hooks.js`
3. **Use watch mode**: `node scripts/run-tests.js [area] --watch`
4. **Check coverage**: `node scripts/run-tests.js all --coverage`
5. **Configure CI/CD**: Use provided GitHub Actions workflows

## Success Indicators

### Green Signals ✅
- All tests pass consistently
- Coverage above 80%
- Fast test execution (under 30 seconds for quick tests)
- No security vulnerabilities

### Red Signals ❌
- Frequent test failures
- Coverage below 80%
- Slow test execution
- Security audit failures

## Getting Help

### Documentation
- `TESTING_STRATEGY.md` - Complete strategy
- `TESTING.md` - Detailed testing guide
- `TEST_SUMMARY.md` - Implementation summary

### Commands
- `node scripts/run-tests.js --help` - All available options
- `node scripts/test-dev.js` - Interactive menu
- `node scripts/test-ci.js` - Full CI simulation

Your testing infrastructure is now ready! Start with `node scripts/test-quick.js` and build from there.