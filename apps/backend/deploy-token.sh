#!/bin/bash

# Zeppex Token Deployment Script
# This script helps deploy a new token and configure it in the environment

set -e

echo "🚀 Zeppex Token Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env first:"
    echo "   cp .env.example .env"
    exit 1
fi

# Check if Hedera credentials are configured
if ! grep -q "HEDERA_ACCOUNT_ID=" .env || ! grep -q "HEDERA_PRIVATE_KEY=" .env; then
    echo "❌ Hedera credentials not configured in .env file"
    echo "   Please set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY"
    exit 1
fi

echo "✅ Hedera credentials found in .env"

# Check if token is already configured
if grep -q "HEDERA_ZEPPEX_TOKEN_ID=" .env; then
    echo "⚠️  Token ID already configured in .env"
    read -p "Do you want to deploy a new token anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

echo "🔧 Deploying new token..."

# Set deployment flag
export DEPLOY_ZEPPEX_TOKEN=true

# Start the application in background to deploy token
echo "Starting application to deploy token..."
npm run start:dev > token-deployment.log 2>&1 &
APP_PID=$!

# Wait for deployment to complete
echo "Waiting for token deployment..."
sleep 10

# Stop the application
kill $APP_PID 2>/dev/null || true

# Extract token ID from logs
TOKEN_ID=$(grep "Zeppex token deployed successfully with ID:" token-deployment.log | tail -1 | sed 's/.*ID: \(0\.0\.[0-9]*\).*/\1/')

if [ -z "$TOKEN_ID" ]; then
    echo "❌ Failed to extract token ID from deployment logs"
    echo "Check token-deployment.log for details"
    exit 1
fi

echo "✅ Token deployed successfully: $TOKEN_ID"

# Update .env file
echo "📝 Updating .env file..."

# Remove existing token ID if present
sed -i.bak '/HEDERA_ZEPPEX_TOKEN_ID=/d' .env

# Add new token ID and set deployment flag to false
echo "" >> .env
echo "# Token Configuration" >> .env
echo "DEPLOY_ZEPPEX_TOKEN=false" >> .env
echo "HEDERA_ZEPPEX_TOKEN_ID=$TOKEN_ID" >> .env

echo "✅ .env file updated with token ID: $TOKEN_ID"
echo "✅ DEPLOY_ZEPPEX_TOKEN set to false"

# Clean up
rm -f token-deployment.log

echo ""
echo "🎉 Token deployment and configuration complete!"
echo ""
echo "Next steps:"
echo "1. Restart your application: npm run start:dev"
echo "2. The token is now configured and ready to use"
echo ""
echo "Token ID: $TOKEN_ID" 