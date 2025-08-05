const { Client, AccountId, PrivateKey, TokenId } = require('@hashgraph/sdk');
require('dotenv').config();

async function testTokenEnv() {
  try {
    console.log('Testing token ID from environment variable...\n');

    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const tokenId = process.env.HEDERA_ZEPPEX_TOKEN_ID;

    console.log(`Account ID: ${accountId || 'NOT SET'}`);
    console.log(`Network: ${network}`);
    console.log(`Token ID: ${tokenId || 'NOT SET'}`);

    if (!tokenId) {
      console.log('\n⚠️ HEDERA_ZEPPEX_TOKEN_ID not set in environment');
      console.log('Run ./setup-token-env.sh to set it up');
      return;
    }

    // Test parsing the token ID
    try {
      const parsedTokenId = TokenId.fromString(tokenId);
      console.log(`✅ Token ID parsed successfully: ${parsedTokenId.toString()}`);
    } catch (error) {
      console.log(`❌ Failed to parse token ID: ${error.message}`);
    }

    // Test client initialization
    if (accountId && privateKey) {
      try {
        const operatorId = AccountId.fromString(accountId);
        const operatorKey = PrivateKey.fromStringECDSA(privateKey);
        const client = Client.forName(network).setOperator(operatorId, operatorKey);
        console.log('✅ Client initialized successfully');
      } catch (error) {
        console.log(`❌ Client initialization failed: ${error.message}`);
      }
    } else {
      console.log('⚠️ Hedera credentials not configured');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTokenEnv();
