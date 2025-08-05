const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');

async function testHederaConnection() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const network = process.env.HEDERA_NETWORK || 'testnet';

  console.log('Testing Hedera connection...');
  console.log(`Network: ${network}`);
  console.log(`Account ID: ${accountId}`);
  console.log(
    `Private Key: ${privateKey ? '***configured***' : 'NOT CONFIGURED'}`,
  );

  if (!accountId || !privateKey) {
    console.error('❌ HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
    return;
  }

  try {
    // Try to parse the account ID
    const parsedAccountId = AccountId.fromString(accountId);
    console.log(
      `✅ Account ID parsed successfully: ${parsedAccountId.toString()}`,
    );

    // Try to parse the private key
    let parsedPrivateKey;
    try {
      parsedPrivateKey = PrivateKey.fromStringED25519(privateKey);
      console.log('✅ Private key parsed as ED25519');
    } catch (ed25519Error) {
      try {
        parsedPrivateKey = PrivateKey.fromStringECDSA(privateKey);
        console.log('✅ Private key parsed as ECDSA');
      } catch (ecdsaError) {
        try {
          parsedPrivateKey = PrivateKey.fromString(privateKey);
          console.log('✅ Private key parsed as generic format');
        } catch (genericError) {
          console.error('❌ Failed to parse private key in any format');
          console.error('ED25519 error:', ed25519Error.message);
          console.error('ECDSA error:', ecdsaError.message);
          console.error('Generic error:', genericError.message);
          return;
        }
      }
    }

    // Create client
    const client = Client.forName(network).setOperator(
      parsedAccountId,
      parsedPrivateKey,
    );

    console.log(`✅ Client created successfully`);
    console.log(`Public Key: ${parsedPrivateKey.publicKey.toString()}`);

    // Test account balance query
    try {
      const { AccountBalanceQuery } = require('@hashgraph/sdk');
      const query = new AccountBalanceQuery().setAccountId(parsedAccountId);
      const balance = await query.execute(client);
      console.log(`✅ Account balance: ${balance.hbars.toString()} HBAR`);
    } catch (balanceError) {
      console.error(
        '❌ Failed to query account balance:',
        balanceError.message,
      );
    }

    console.log('\n🎉 Hedera configuration is working!');
    console.log('\nTo deploy the Zeppex token, you can:');
    console.log('1. Set DEPLOY_ZEPPEX_TOKEN=true in your environment');
    console.log(
      '2. Or use the API endpoint: POST /api/v1/treasury/create-token',
    );
    console.log(
      '\nAfter deployment, configure the token ID in your .env file:',
    );
    console.log('HEDERA_ZEPPEX_TOKEN_ID=<deployed-token-id>');
  } catch (error) {
    console.error('❌ Failed to initialize Hedera client:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

testHederaConnection().catch(console.error);
