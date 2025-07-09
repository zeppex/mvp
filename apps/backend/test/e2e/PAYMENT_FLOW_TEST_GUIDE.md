# Payment Flow E2E Test Guide

This guide covers the comprehensive end-to-end testing suite for the payment flow implementation with QR codes and TTL functionality.

## Overview

The payment flow E2E tests verify the complete functionality of:
- QR code generation and validation
- Payment order creation with TTL
- Public endpoint security
- Payment processing workflow
- Automatic expiration handling
- Error handling and validation

## Test Structure

### 1. Main Payment Flow Tests (`payment-flow.test.ts`)
Comprehensive tests covering all aspects of the payment flow:
- Authentication and authorization
- Merchant, branch, and POS creation
- QR code functionality
- Payment order creation and management
- Public endpoint testing
- Payment processing workflow
- Error handling and validation

### 2. TTL Expiration Tests (`payment-flow-ttl.test.ts`)
Focused tests for time-to-live functionality:
- TTL configuration validation
- Automatic expiration handling
- Expired order processing prevention
- Concurrent order handling
- Multiple order scenarios

### 3. Manual Integration Test (`test-payment-flow.js`)
Node.js script for manual testing and integration verification.

## Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 12+
- npm or pnpm package manager

### Environment Setup
1. **PostgreSQL Database**
   ```bash
   # Start PostgreSQL service
   sudo systemctl start postgresql
   
   # Create test database
   createdb -h localhost -U postgres zeppex_test
   ```

2. **Environment Variables**
   The test runner will automatically create `.env.test` if it doesn't exist:
   ```env
   NODE_ENV=test
   PORT=4001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=password
   DB_NAME=zeppex_test
   JWT_SECRET=test-secret-key-for-jwt-signing-32-chars-minimum
   PAYMENT_ORDER_TTL=30000
   FRONTEND_URL=http://localhost:3000
   ```

## Running the Tests

### Option 1: Automated Test Runner (Recommended)
```bash
cd apps/backend
./test/e2e/run-payment-flow-tests.sh
```

This script will:
- Check prerequisites
- Set up test environment
- Run all test suites
- Provide detailed output and summary

### Option 2: Individual Test Suites
```bash
# Main payment flow tests
npm run test:e2e -- --testPathPattern="payment-flow.test.ts"

# TTL expiration tests
npm run test:e2e -- --testPathPattern="payment-flow-ttl.test.ts"

# Manual integration test
node test-payment-flow.js
```

### Option 3: Jest Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run with specific timeout
npm run test:e2e -- --testTimeout=120000

# Run with verbose output
npm run test:e2e -- --verbose
```

## Test Scenarios

### Authentication Tests
- ✅ Login with valid credentials
- ✅ JWT token generation
- ✅ Token validation

### Merchant Setup Tests
- ✅ Create test merchant
- ✅ Create test branch
- ✅ Create test POS with QR code
- ✅ Validate entity relationships

### QR Code Functionality Tests
- ✅ QR code generation for POS
- ✅ QR code URL validation
- ✅ QR code image generation
- ✅ QR code regeneration on POS update

### Payment Order Tests
- ✅ Create payment order with TTL
- ✅ Validate expiration time calculation
- ✅ List payment orders for POS
- ✅ Payment order status management

### Public Endpoint Tests
- ✅ Get current payment order (no auth required)
- ✅ Handle missing orders (404)
- ✅ Validate response format
- ✅ Security validation

### Payment Processing Tests
- ✅ Trigger in-progress status
- ✅ Prevent duplicate processing
- ✅ Handle status transitions
- ✅ Validate business rules

### TTL Expiration Tests
- ✅ Automatic expiration after TTL
- ✅ Expired order handling
- ✅ Prevent processing expired orders
- ✅ Multiple order scenarios
- ✅ Concurrent order creation

### Error Handling Tests
- ✅ Invalid UUID handling
- ✅ Missing resource handling
- ✅ Validation error handling
- ✅ Rate limiting (if enabled)

### Data Validation Tests
- ✅ Payment amount format validation
- ✅ Required field validation
- ✅ Input sanitization

## Test Data Management

### Test Data Creation
Tests automatically create:
- Test merchant: "TTL Test Merchant"
- Test branch: "TTL Test Branch" 
- Test POS: "TTL Test POS"
- Test payment orders with various amounts

### Test Data Cleanup
Tests automatically clean up:
- All created payment orders
- All created POS terminals
- All created branches
- All created merchants

### Database State
- Tests use a separate test database (`zeppex_test`)
- Database schema is recreated for each test run
- No data persists between test runs

## Configuration Options

### TTL Configuration
```typescript
// Short TTL for fast testing
const TEST_TTL = 5000; // 5 seconds

// Longer TTL for integration testing
const INTEGRATION_TTL = 30000; // 30 seconds
```

### Test Timeouts
```typescript
// Individual test timeout
jest.setTimeout(60000); // 60 seconds

// Global test timeout
--testTimeout=120000 // 120 seconds
```

### Database Configuration
```typescript
// Test database settings
{
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'zeppex_test',
  synchronize: true,
  dropSchema: true, // Clean database for each run
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -h localhost -U postgres -l | grep zeppex_test

# Create database if missing
createdb -h localhost -U postgres zeppex_test
```

#### 2. Permission Errors
```bash
# Fix PostgreSQL permissions
sudo -u postgres psql
ALTER USER postgres PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE zeppex_test TO postgres;
```

#### 3. Test Timeout Issues
```bash
# Increase timeout for slow systems
npm run test:e2e -- --testTimeout=180000
```

#### 4. Port Conflicts
```bash
# Check if port 4001 is in use
lsof -i :4001

# Kill process if needed
kill -9 <PID>
```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm run test:e2e

# Run specific test with debug
DEBUG=* npm run test:e2e -- --testNamePattern="should create payment order"
```

### Log Analysis
Tests generate detailed logs:
```bash
# View test logs
tail -f logs/test.log

# Search for specific errors
grep -i error logs/test.log
```

## Performance Considerations

### Test Execution Time
- **Main tests**: ~30-60 seconds
- **TTL tests**: ~60-120 seconds (includes wait times)
- **Manual tests**: ~10-20 seconds
- **Total suite**: ~2-3 minutes

### Resource Usage
- **Memory**: ~200-300MB during tests
- **CPU**: Moderate usage during database operations
- **Disk**: Minimal (test database only)

### Optimization Tips
1. Use shorter TTL values for faster testing
2. Run tests in parallel when possible
3. Use SSD storage for better database performance
4. Increase Node.js memory limit if needed: `NODE_OPTIONS="--max-old-space-size=4096"`

## Continuous Integration

### GitHub Actions Example
```yaml
name: Payment Flow E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: zeppex_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd apps/backend && npm install
      - run: cd apps/backend && ./test/e2e/run-payment-flow-tests.sh
```

### Docker Testing
```dockerfile
# Test Dockerfile
FROM node:18-alpine
RUN apk add --no-cache postgresql-client
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["./test/e2e/run-payment-flow-tests.sh"]
```

## Best Practices

### Test Writing
1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Descriptive names**: Use clear test descriptions
4. **Assertions**: Test both positive and negative cases
5. **Timeouts**: Use appropriate timeouts for async operations

### Test Maintenance
1. **Regular updates**: Keep tests in sync with code changes
2. **Documentation**: Update this guide when adding new tests
3. **Performance**: Monitor test execution times
4. **Coverage**: Ensure comprehensive test coverage

### Debugging
1. **Logs**: Use detailed logging for troubleshooting
2. **Isolation**: Run individual tests when debugging
3. **Database**: Check database state during failures
4. **Network**: Verify API endpoints are accessible

## Support

For issues with the payment flow tests:
1. Check the troubleshooting section above
2. Review test logs for detailed error messages
3. Verify environment configuration
4. Ensure all prerequisites are met
5. Check for recent code changes that might affect tests

## Future Enhancements

Planned improvements to the test suite:
1. **Performance tests**: Load testing for payment endpoints
2. **Security tests**: Penetration testing for public endpoints
3. **Integration tests**: Frontend-backend integration testing
4. **Mobile testing**: QR code scanning on mobile devices
5. **Multi-tenant tests**: Testing with multiple merchants 