# Zeppex Token Environment Setup

This document explains how to set up the Zeppex token using the new architecture where token deployment and configuration are separate processes.

## Architecture Overview

The application now follows a clear separation of concerns:

1. **Token Deployment**: Creates new tokens on the Hedera network
2. **Token Configuration**: Uses existing tokens via environment variables

This separation ensures:

- Token deployment is a one-time process
- Token configuration is persistent and environment-specific
- No risk of accidentally creating duplicate tokens
- Clear audit trail of token deployment vs. usage

## Environment Variables

Add these variables to your .env file:

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.6466583
HEDERA_PRIVATE_KEY=0xda0840c4...
HEDERA_NETWORK=testnet

# Token Configuration
# Set to true to automatically deploy a new token on application startup
DEPLOY_ZEPPEX_TOKEN=false

# Token ID - must be configured after token deployment
# This is the only source of truth for token configuration
HEDERA_ZEPPEX_TOKEN_ID=0.0.6503411
```

## Token Deployment Process

### 1. Deploy a New Token

Set `DEPLOY_ZEPPEX_TOKEN=true` in your .env file and start the application:

```bash
DEPLOY_ZEPPEX_TOKEN=true npm run start:dev
```

The application will:

- Deploy a new Zeppex token on the Hedera network
- Log the token ID in the console
- Provide clear instructions for next steps

### 2. Configure the Token

After deployment, copy the token ID from the logs and add it to your .env file:

```env
HEDERA_ZEPPEX_TOKEN_ID=0.0.6503411
DEPLOY_ZEPPEX_TOKEN=false
```

### 3. Restart the Application

Restart the application with the token configured:

```bash
npm run start:dev
```

## Quick Setup

### 1. Automatic Setup (Recommended)

Run the setup script to automatically configure your token ID:

```bash
./setup-token-env.sh
```

### 2. Manual Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Deploy a new token:

   ```bash
   DEPLOY_ZEPPEX_TOKEN=true npm run start:dev
   ```

3. Copy the token ID from logs and update .env:
   ```bash
   HEDERA_ZEPPEX_TOKEN_ID=0.0.6503411
   DEPLOY_ZEPPEX_TOKEN=false
   ```

## Testing

### Test Environment Configuration

```bash
npm run test:token-env
```

### Test Hedera Integration

```bash
npm run test:hedera-simple
```

## Benefits

1. **Clear Separation**: Token deployment and configuration are separate processes
2. **Persistence**: Token ID survives application restarts
3. **Deployment Safety**: No risk of creating duplicate tokens
4. **Environment Management**: Easy to manage different tokens for different environments
5. **Audit Trail**: Clear distinction between token creation and usage

## Migration from Old Architecture

If you have an existing token ID:

1. Set the token ID in your environment:

   ```env
   HEDERA_ZEPPEX_TOKEN_ID=your-existing-token-id
   DEPLOY_ZEPPEX_TOKEN=false
   ```

2. Restart your application

The token ID will now be loaded from environment on startup, and no new tokens will be deployed.

## Troubleshooting

### Token ID Not Configured Error

If you see "Zeppex token ID not configured" error:

1. Check that `HEDERA_ZEPPEX_TOKEN_ID` is set in your .env file
2. Ensure the token ID format is correct (e.g., `0.0.6503411`)
3. Restart the application after making changes

### Token Deployment Failed

If token deployment fails:

1. Check Hedera credentials are correct
2. Ensure you have sufficient HBAR for deployment
3. Check network connectivity to Hedera
4. Review application logs for specific error messages
