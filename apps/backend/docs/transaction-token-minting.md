# Transaction Token Minting

## Overview

When a transaction is completed in the Zeppex system, Zeppex tokens are automatically minted to the branch associated with the transaction. This incentivizes merchants and branches to process transactions through the platform.

## How It Works

### Automatic Token Minting

1. **Transaction Creation**: Transactions are initially created with a `PENDING` status
2. **Transaction Completion**: When a transaction status is updated to `COMPLETED`, the system automatically:
   - Calculates the token amount based on the transaction value
   - Mints Zeppex tokens to the branch's Hedera account
   - Updates the branch's token balance
   - Logs the minting operation

### Token Calculation

The current token calculation formula is:

```
Token Amount = Floor(Transaction Amount in Dollars × 1,000,000)
```

The token has 6 decimals, so 1 dollar = 1,000,000 token units.

For example:

- $25.50 transaction → 25,500,000 ZEPPEX token units
- $12.99 transaction → 12,990,000 ZEPPEX token units
- $100.00 transaction → 100,000,000 ZEPPEX token units

This ratio can be adjusted in the `calculateTokenAmount` method in `TransactionService`.

## API Endpoints

### Create Completed Transaction

```http
POST /api/v1/transactions/completed
```

Creates a transaction with `COMPLETED` status and immediately mints tokens.

### Complete Existing Transaction

```http
PATCH /api/v1/transactions/{id}/complete
```

Updates a transaction status to `COMPLETED` and mints tokens.

### Complete Multiple Transactions

```http
POST /api/v1/transactions/complete-multiple
```

Completes multiple transactions at once and mints tokens for each.

## Implementation Details

### Transaction Service Methods

- `createCompleted(dto)`: Creates a transaction with completed status and mints tokens
- `updateStatus(id, status)`: Updates transaction status and mints tokens if completing
- `completeMultipleTransactions(ids)`: Completes multiple transactions and mints tokens
- `calculateTokenAmount(amount)`: Calculates token amount based on transaction value

### Error Handling

- Token minting failures do not prevent transaction completion
- All minting errors are logged for monitoring
- The system continues processing even if Hedera operations fail

## Testing

### E2E Tests

Run the token minting E2E tests:

```bash
pnpm test:e2e:token-minting
```

### Manual Testing

1. Create a transaction with `PENDING` status
2. Update the status to `COMPLETED`
3. Verify tokens are minted to the branch
4. Check branch token balance

## Configuration

### Environment Variables

- `HEDERA_ZEPPEX_TOKEN_ID`: The Zeppex token ID on Hedera
- `HEDERA_ACCOUNT_ID`: Treasury account ID
- `HEDERA_PRIVATE_KEY`: Treasury private key

### Token Ratio

The token calculation ratio can be modified in the `calculateTokenAmount` method in `TransactionService`.

## Monitoring

### Logs

The system logs all token minting operations:

- Successful mints: `Minted X ZEPPEX tokens to branch Y for transaction Z`
- Failed mints: `Failed to mint tokens for transaction X: error message`

### Balance Tracking

- Branch token balances are automatically updated after minting
- Merchant total balances are recalculated when branch balances change

## Security Considerations

- Only authorized users can complete transactions
- Token minting uses the treasury account with proper authentication
- All operations are logged for audit purposes
- Failed minting operations don't compromise transaction integrity
