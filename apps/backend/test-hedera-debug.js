const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} = require('@hashgraph/sdk');
require('dotenv').config();

async function testHederaDebug() {
  try {
    console.log('Debugging Hedera implementation...\n');

    // Get credentials from environment
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    if (!accountId || !privateKey) {
      throw new Error(
        'HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in environment',
      );
    }

    console.log(`Using network: ${network}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`Private key length: ${privateKey.length}`);
    console.log(`Private key starts with: ${privateKey.substring(0, 10)}...`);

    // Try different private key parsing methods
    let operatorKey;
    let keyType = 'unknown';

    try {
      // Since the key starts with 0x, try ECDSA first
      operatorKey = PrivateKey.fromStringECDSA(privateKey);
      keyType = 'ECDSA';
      console.log('✅ Successfully parsed as ECDSA key');
    } catch (ecdsaError) {
      console.log('❌ Failed to parse as ECDSA:', ecdsaError.message);

      try {
        // Try ED25519
        operatorKey = PrivateKey.fromStringED25519(privateKey);
        keyType = 'ED25519';
        console.log('✅ Successfully parsed as ED25519 key');
      } catch (ed25519Error) {
        console.log('❌ Failed to parse as ED25519:', ed25519Error.message);

        try {
          // Try generic
          operatorKey = PrivateKey.fromString(privateKey);
          keyType = 'Generic';
          console.log('✅ Successfully parsed as generic key');
        } catch (genericError) {
          console.log('❌ Failed to parse as generic:', genericError.message);
          throw new Error('Could not parse private key in any format');
        }
      }
    }

    const operatorId = AccountId.fromString(accountId);
    console.log(`Key type: ${keyType}`);
    console.log(`Public key: ${operatorKey.publicKey.toString()}`);

    // Initialize client
    const client = Client.forName(network).setOperator(operatorId, operatorKey);
    console.log('✅ Client initialized successfully');

    // Test account balance query
    const balanceQuery =
      await new (require('@hashgraph/sdk').AccountBalanceQuery)()
        .setAccountId(operatorId)
        .execute(client);

    console.log(`✅ Account balance: ${balanceQuery.hbars.toString()}`);

    // Test token creation with detailed error handling
    console.log('\nCreating test token...');

    try {
      // Following the exact pattern from documentation
      // Use the treasury's public key as the supply key
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName('Test Token')
        .setTokenSymbol('TEST')
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(1000)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(operatorKey.publicKey) // Use treasury's public key as supply key
        .freezeWith(client);

      console.log('✅ Transaction frozen successfully');
      console.log(`Transaction ID: ${tokenCreateTx.transactionId.toString()}`);

      const tokenCreateSign = await tokenCreateTx.sign(operatorKey);
      console.log('✅ Transaction signed successfully');

      const tokenCreateSubmit = await tokenCreateSign.execute(client);
      console.log('✅ Transaction submitted successfully');

      const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
      console.log(`✅ Transaction receipt received: ${tokenCreateRx.status}`);

      if (tokenCreateRx.status.toString() === 'SUCCESS') {
        const tokenId = tokenCreateRx.tokenId;
        console.log(`✅ Test token created: ${tokenId.toString()}`);
      } else {
        console.log(
          `❌ Token creation failed with status: ${tokenCreateRx.status}`,
        );
      }
    } catch (error) {
      console.error('❌ Token creation failed:', error.message);
      console.error('Error type:', error.constructor.name);
      if (error.transactionId) {
        console.error('Transaction ID:', error.transactionId.toString());
      }
      if (error.status) {
        console.error('Status:', error.status);
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testHederaDebug();
