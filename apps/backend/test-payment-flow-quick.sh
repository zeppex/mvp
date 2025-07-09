#!/bin/bash

# Quick Payment Flow Test Runner
# For development and quick feedback

set -e

echo "🚀 Quick Payment Flow Test Runner"
echo "=================================="

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
PAYMENT_ORDER_TTL=5000
FRONTEND_URL=http://localhost:3000
EOF
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Run quick tests
echo ""
echo "🧪 Running Quick Tests..."

# Test 1: Basic functionality (no TTL waits)
echo "Test 1: Basic Payment Flow"
npm run test:e2e -- --testPathPattern="payment-flow.test.ts" --testNamePattern="should create a test merchant|should create a test branch|should create a test POS|should get QR code information" --testTimeout=30000

if [ $? -eq 0 ]; then
    echo "✅ Basic tests passed"
else
    echo "❌ Basic tests failed"
    exit 1
fi

# Test 2: Manual integration test
echo ""
echo "Test 2: Manual Integration"
if [ -f "test-payment-flow.js" ]; then
    node test-payment-flow.js
    if [ $? -eq 0 ]; then
        echo "✅ Manual integration test passed"
    else
        echo "❌ Manual integration test failed"
        exit 1
    fi
else
    echo "⚠️  Manual test script not found, skipping..."
fi

echo ""
echo "🎉 Quick tests completed successfully!"
echo ""
echo "For full test suite, run: ./test/e2e/run-payment-flow-tests.sh" 