# Roastah Testing Documentation

## Overview

This document provides comprehensive information about the testing infrastructure and methodologies used in the Roastah marketplace application.

## Test Suite Structure

### Backend Tests (`tests/backend/`)
- **Authentication Tests** (`auth.test.ts`) - User login, registration, session management
- **Products Tests** (`products.test.ts`) - Product CRUD operations, filtering, validation
- **Cart Tests** (`cart.test.ts`) - Shopping cart functionality, item management
- **Orders Tests** (`orders.test.ts`) - Order processing, status updates, tracking
- **Roasters Tests** (`roasters.test.ts`) - Roaster applications, profile management
- **Payments Tests** (`payments.test.ts`) - Stripe integration, payment processing
- **Real-time Tests** (`realtime.test.ts`) - WebSocket connections, live updates
- **Security Tests** (`security.test.ts`) - Rate limiting, input validation, authorization

### Frontend Tests (`tests/frontend/`)
- **Component Tests** (`components/`) - Individual React component testing
- **Integration Tests** (`integration/`) - End-to-end user flow testing

### Test Infrastructure (`tests/`)
- **Setup** (`setup.ts`) - Jest configuration and global test setup
- **Mocks** (`mocks/`) - MSW handlers for API mocking
- **Utilities** (`utils/`) - Test helpers and data factories

## Running Tests

### Using the Test Runner

```bash
# Run all tests
node scripts/run-tests.js all

# Run specific test suites
node scripts/run-tests.js backend
node scripts/run-tests.js frontend
node scripts/run-tests.js integration

# Run individual test files
node scripts/run-tests.js backend-auth
node scripts/run-tests.js frontend-products

# Run with options
node scripts/run-tests.js all --coverage
node scripts/run-tests.js backend --watch
node scripts/run-tests.js security --verbose
```

### Direct Jest Commands

```bash
# Run all tests
npx jest

# Run specific test files
npx jest tests/backend/auth.test.ts
npx jest tests/frontend/components/

# Run with coverage
npx jest --coverage

# Watch mode
npx jest --watch
```

## Test Categories

### Unit Tests
- Individual function and component testing
- Isolated business logic validation
- Mock external dependencies

### Integration Tests
- Multi-component interaction testing
- API endpoint testing with database
- Real data flow validation

### Security Tests
- Authentication and authorization
- Input validation and sanitization
- Rate limiting and abuse prevention

### Payment Tests
- Stripe integration testing
- Commission calculation validation
- Refund and dispute handling

### Real-time Tests
- WebSocket connection management
- Live notification delivery
- Order status broadcasting

## Test Data Management

### Test Database
- Isolated test database instance
- Automatic cleanup between tests
- Seed data for consistent testing

### Mock Data Factories
```typescript
// Create test users
const testUser = createTestUser({
  email: 'test@example.com',
  role: 'buyer'
});

// Create test products
const testProduct = createTestProduct({
  name: 'Test Coffee',
  price: 2499
});

// Create test orders
const testOrder = createTestOrder({
  status: 'pending',
  items: [testProduct]
});
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- Generated in `coverage/` directory
- HTML reports available at `coverage/lcov-report/index.html`
- CI/CD integration for automated coverage checks

## Mocking Strategy

### API Mocking (MSW)
- Mock external API calls
- Simulate various response scenarios
- Maintain consistent test data

### Database Mocking
- In-memory database for fast tests
- Isolated test transactions
- Automatic rollback after tests

### External Service Mocking
- Stripe payment processing
- Google Cloud services
- Email delivery services

## Authentication Testing

### Test Scenarios
- Valid login credentials
- Invalid credentials rejection
- Session management
- Password strength validation
- MFA functionality
- OAuth integration

### Security Testing
- SQL injection prevention
- XSS attack prevention
- CSRF protection
- Rate limiting enforcement
- Input sanitization

## Performance Testing

### Load Testing
- Concurrent user simulation
- Database query optimization
- API response time validation

### Stress Testing
- System limits identification
- Error handling under load
- Resource usage monitoring

## Continuous Integration

### Pre-commit Hooks
- Run unit tests before commits
- Code quality checks
- Security vulnerability scanning

### CI/CD Pipeline
- Automated test execution
- Coverage reporting
- Performance benchmarking
- Security scanning

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Test Data
- Use factories for consistent test data
- Clean up test data after each test
- Avoid test interdependencies

### Assertions
- Use specific assertion methods
- Test both success and failure cases
- Validate error messages and codes

### Async Testing
- Properly handle promises and async operations
- Use `waitFor` for DOM updates
- Mock timers for time-dependent tests

## Debugging Tests

### Common Issues
- Database connection problems
- Mock service configuration
- Async operation timing
- Environment variable setup

### Debugging Tools
- Jest debug mode
- VS Code test debugging
- Console logging in tests
- Network request inspection

## Environment Setup

### Development Environment
```bash
# Install dependencies
npm install

# Setup test database
npm run db:push

# Run tests
node scripts/run-tests.js all
```

### CI Environment
```bash
# Install dependencies
npm ci

# Run tests with coverage
node scripts/run-tests.js all --coverage --ci
```

## Test Maintenance

### Regular Tasks
- Update test data factories
- Maintain mock service definitions
- Review and update coverage thresholds
- Clean up obsolete tests

### Monitoring
- Track test execution times
- Monitor test failure rates
- Analyze coverage trends
- Review security test results

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Include comprehensive test scenarios
4. Update test runner configuration
5. Document new test categories

### Test Review Process
- Peer review of test code
- Validation of test scenarios
- Performance impact assessment
- Security consideration review

## Reporting

### Test Results
- Detailed test execution reports
- Coverage analysis
- Performance metrics
- Security scan results

### Metrics Tracking
- Test execution time trends
- Coverage improvement over time
- Test failure analysis
- Security vulnerability tracking

This comprehensive testing infrastructure ensures the reliability, security, and performance of the Roastah marketplace application across all environments and use cases.