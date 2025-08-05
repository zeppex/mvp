#!/bin/bash

echo "Setting up Zeppex Token ID in environment..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Get the token ID from user
echo "Enter your Zeppex Token ID (e.g., 0.0.6503411):"
read TOKEN_ID

if [ -z "$TOKEN_ID" ]; then
    echo "No token ID provided. Exiting."
    exit 1
fi

# Update the .env file
if grep -q "HEDERA_ZEPPEX_TOKEN_ID" .env; then
    # Replace existing value
    sed -i '' "s/HEDERA_ZEPPEX_TOKEN_ID=.*/HEDERA_ZEPPEX_TOKEN_ID=$TOKEN_ID/" .env
    echo "Updated HEDERA_ZEPPEX_TOKEN_ID in .env file"
else
    # Add new line
    echo "HEDERA_ZEPPEX_TOKEN_ID=$TOKEN_ID" >> .env
    echo "Added HEDERA_ZEPPEX_TOKEN_ID to .env file"
fi

echo ""
echo "✅ Token ID setup complete!"
echo "Token ID: $TOKEN_ID"
echo ""
echo "You can now restart your application and the token ID will be loaded from environment."
