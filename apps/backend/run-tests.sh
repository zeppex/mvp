#!/bin/bash

# Test Runner Script for Zeppex Backend
set -e

echo "🚀 Setting up test environment..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create test database if it doesn't exist
echo "📦 Creating test database..."
createdb zeppex_test 2>/dev/null || echo "Database already exists"

# Set test environment
export NODE_ENV=test

# Run migrations
echo "🔄 Running database migrations..."
pnpm migrate

# Run seed data
echo "🌱 Seeding test data..."
pnpm seed

# Run tests
echo "🧪 Running e2e tests..."
pnpm test:e2e

echo "✅ Tests completed!" 