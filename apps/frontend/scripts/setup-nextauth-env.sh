#!/bin/bash

# Script to set up NextAuth environment variables

# Generate a secure random string for NextAuth secret (64 characters)
RANDOM_SECRET=$(openssl rand -base64 48)

# Determine the base URL
DEFAULT_URL="http://localhost:3000"
read -p "Enter base URL for Next Auth [default: $DEFAULT_URL]: " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-$DEFAULT_URL}

# Determine API URL
DEFAULT_API_URL="http://localhost:4000/api/v1"
read -p "Enter backend API URL [default: $DEFAULT_API_URL]: " API_URL
API_URL=${API_URL:-$DEFAULT_API_URL}

# Create .env.local file
echo "Creating .env.local file..."
cat > .env.local << EOF
# NextAuth Configuration
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$RANDOM_SECRET
NEXT_PUBLIC_API_URL=$API_URL
EOF

echo "Environment variables have been set up in .env.local"
echo "NextAuth is now configured to use:"
echo "  - URL: $NEXTAUTH_URL"
echo "  - API: $API_URL"
echo "  - A secure random secret has been generated"
echo ""
echo "You should restart your Next.js server for these changes to take effect."
