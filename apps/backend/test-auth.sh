#!/bin/bash

echo "🔐 Testing Authentication..."

# Step 1: Login and get token
echo "📝 Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X 'POST' \
  'http://localhost:4000/api/v1/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "superadmin@zeppex.com",
  "password": "SuperAdmin!123"
}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extract the access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo "Access Token: $ACCESS_TOKEN"

# Step 2: Test accessing merchants list
echo ""
echo "📋 Step 2: Testing merchants list access..."
MERCHANTS_RESPONSE=$(curl -s -X 'GET' \
  'http://localhost:4000/api/v1/merchants' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Merchants response:"
echo "$MERCHANTS_RESPONSE" | jq '.'

# Step 3: Test creating a merchant
echo ""
echo "🏪 Step 3: Testing merchant creation..."
CREATE_RESPONSE=$(curl -s -X 'POST' \
  'http://localhost:4000/api/v1/merchants' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Test Merchant",
  "address": "123 Test Street, Test City, TC 12345",
  "contact": "contact@testmerchant.com",
  "contactName": "Test Contact",
  "contactPhone": "+1234567890"
}')

echo "Create merchant response:"
echo "$CREATE_RESPONSE" | jq '.' 