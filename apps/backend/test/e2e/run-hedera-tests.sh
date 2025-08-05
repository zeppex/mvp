#!/bin/bash

# Hedera Integration E2E Test Runner
# This script runs comprehensive tests for Hedera blockchain integration

set -e

echo "🚀 Hedera Integration E2E Test Runner"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Check if Hedera credentials are configured
if [ -z "$HEDERA_ACCOUNT_ID" ] || [ -z "$HEDERA_PRIVATE_KEY" ]; then
    echo "❌ Hedera credentials not found in environment"
    echo "Please set the following environment variables:"
    echo "  HEDERA_ACCOUNT_ID=0.0.xxxxx"
    echo "  HEDERA_PRIVATE_KEY=xxxxx"
    echo "  HEDERA_NETWORK=testnet (optional, defaults to testnet)"
    exit 1
fi

echo "✅ Hedera credentials configured"
echo "   Account ID: $HEDERA_ACCOUNT_ID"
echo "   Network: ${HEDERA_NETWORK:-testnet}"

# Create test database if it doesn't exist
if ! psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw "zeppex_test"; then
    echo "📦 Creating test database..."
    createdb -h localhost -U postgres zeppex_test
fi

# Create .env.test if it doesn't exist
if [ ! -f ".env.test" ]; then
    echo "📝 Creating .env.test..."
    cat > .env.test << EOF
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
HEDERA_ACCOUNT_ID=${HEDERA_ACCOUNT_ID}
HEDERA_PRIVATE_KEY=${HEDERA_PRIVATE_KEY}
HEDERA_NETWORK=${HEDERA_NETWORK:-testnet}
DEPLOY_ZEPPEX_TOKEN=true
EOF
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🔄 Running database migrations..."
NODE_ENV=test npm run migrate

# Seed test data
echo "🌱 Seeding test data..."
NODE_ENV=test npm run seed

echo ""
echo "🧪 Running Hedera Integration E2E Tests..."
echo "=========================================="

# Run the Hedera integration tests
npm run test:e2e:hedera

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All Hedera integration tests passed!"
    echo ""
    echo "🎉 Test Summary:"
    echo "   ✅ Token creation on Hedera network"
    echo "   ✅ Account creation for branches"
    echo "   ✅ Token minting operations"
    echo "   ✅ Balance verification"
    echo "   ✅ Payment flow integration"
    echo "   ✅ Error handling and edge cases"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Check the test output for created token IDs"
    echo "   2. Verify balances on Hedera Explorer"
    echo "   3. Consider running tests on mainnet for production validation"
else
    echo ""
    echo "❌ Some Hedera integration tests failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check Hedera network connectivity"
    echo "   2. Verify account has sufficient HBAR for transactions"
    echo "   3. Check test database setup"
    echo "   4. Review test logs for specific error messages"
    exit 1
fi 