#!/bin/bash

echo "Testing authentication..."

# Step 1: Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@zeppex.com", "password": "SuperAdmin!123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Step 2: Test merchant creation
echo "2. Testing merchant creation..."
MERCHANT_RESPONSE=$(curl -s -X POST http://localhost:4000/api/v1/merchants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Merchant", "address": "123 Test St", "contact": "test@test.com", "contactName": "Test", "contactPhone": "+1234567890"}')

echo "Merchant creation response: $MERCHANT_RESPONSE" 