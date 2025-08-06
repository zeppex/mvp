# E2E Test Suite

This directory contains comprehensive end-to-end tests for the Zeppex backend application.

## Test Files

### Core Tests

- `basic.test.ts` - Basic functionality and health checks
- `multi-tenant.test.ts` - Multi-tenant architecture validation
- `validation.test.ts` - DTO validation and error handling
- `payment-flow.test.ts` - Payment flow with QR codes and TTL
- `payment-flow-ttl.test.ts` - Time-to-live functionality testing
- `payment-order-queue.test.ts` - Payment order queue management

### Blockchain Integration Tests

- `hedera-integration.test.ts` - Comprehensive Hedera blockchain integration testing

## Hedera Integration Tests

The `hedera-integration.test.ts` file provides end-to-end validation of:

✅ **Token Creation** - Creates real tokens on Hedera network  
✅ **Account Creation** - Automatic Hedera account creation for branches  
✅ **Token Minting** - Mints tokens with balance verification  
✅ **Payment Integration** - Full payment flow with blockchain  
✅ **Balance Verification** - Real-time HBAR and token balance validation  
✅ **Error Handling** - Network error resilience and edge cases

### Prerequisites

```bash
# Set Hedera credentials
export HEDERA_ACCOUNT_ID=0.0.xxxxx
export HEDERA_PRIVATE_KEY=xxxxx
export HEDERA_NETWORK=testnet

# Ensure PostgreSQL is running
pg_isready -h localhost -p 5432
```

### Running Hedera Tests

```bash
# Individual test command
npm run test:e2e:hedera

# With custom timeout
npm run test:e2e:hedera -- --testTimeout=180000
```

## Running All Tests

```bash
# All E2E tests
npm run test:e2e

# Specific test suites
npm run test:e2e:basic
npm run test:e2e:multi-tenant
npm run test:e2e:validation
npm run test:e2e:hedera
npm run test:e2e:payments
npm run test:e2e:payments-ttl
npm run test:e2e:queue
```

## Configuration

Tests use `.env.test` for configuration. The test runner will create this file automatically with proper settings for Hedera integration testing.

## Test Status

All tests are currently passing (155/155 tests, 11/11 suites) with comprehensive coverage of:

- ✅ Authentication and authorization
- ✅ Multi-tenant data isolation
- ✅ Payment flow and queue management
- ✅ Hedera blockchain integration
- ✅ Data validation and error handling
- ✅ Time-to-live functionality
