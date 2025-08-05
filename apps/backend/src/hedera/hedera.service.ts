import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  AccountBalanceQuery,
  AccountBalance,
} from '@hashgraph/sdk';

@Injectable()
export class HederaService {
  private readonly logger = new Logger(HederaService.name);
  private client: Client;
  private treasuryAccountId: AccountId;
  private treasuryPrivateKey: PrivateKey;
  private zeppexTokenId: TokenId;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient(): void {
    const accountId = this.configService.get<string>('HEDERA_ACCOUNT_ID');
    const privateKey = this.configService.get<string>('HEDERA_PRIVATE_KEY');
    const network = this.configService.get<string>('HEDERA_NETWORK', 'testnet');
    const tokenId = this.configService.get<string>('HEDERA_ZEPPEX_TOKEN_ID');

    if (!accountId || !privateKey) {
      this.logger.error('Hedera credentials not configured');
      return;
    }

    try {
      // Parse account ID
      this.treasuryAccountId = AccountId.fromString(accountId);

      // Parse private key using the recommended method based on format
      this.treasuryPrivateKey = this.parsePrivateKey(privateKey);

      // Initialize client following the documentation pattern
      this.client = Client.forName(network).setOperator(
        this.treasuryAccountId,
        this.treasuryPrivateKey,
      );

      this.logger.log(`Hedera client initialized for network: ${network}`);
      this.logger.log(`Treasury account: ${this.treasuryAccountId.toString()}`);
      this.logger.log(
        `Key type: ${this.treasuryPrivateKey.publicKey.toString()}`,
      );

      // Initialize token ID from environment - this is the only source of truth
      if (tokenId) {
        this.zeppexTokenId = TokenId.fromString(tokenId);
        this.logger.log(`Zeppex token ID loaded from environment: ${tokenId}`);
      } else {
        this.logger.warn(
          'HEDERA_ZEPPEX_TOKEN_ID not configured in environment. Token operations will fail.',
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize Hedera client', error);
      throw error;
    }
  }

  private parsePrivateKey(privateKey: string): PrivateKey {
    // Try to determine the key format and use the appropriate parsing method
    try {
      // If it's a hex string starting with 0x, try ECDSA first
      if (privateKey.startsWith('0x')) {
        try {
          return PrivateKey.fromStringECDSA(privateKey);
        } catch (ecdsaError) {
          // If ECDSA fails, try ED25519
          return PrivateKey.fromStringED25519(privateKey);
        }
      }

      // If it's a base64 string, try ED25519 first
      if (privateKey.length === 44 || privateKey.length === 88) {
        try {
          return PrivateKey.fromStringED25519(privateKey);
        } catch (ed25519Error) {
          // If ED25519 fails, try ECDSA
          return PrivateKey.fromStringECDSA(privateKey);
        }
      }

      // Default to generic parsing
      return PrivateKey.fromString(privateKey);
    } catch (error) {
      this.logger.error('Failed to parse private key', error);
      throw new Error(`Failed to parse private key: ${error.message}`);
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }
    return this.client;
  }

  getTreasuryAccountId(): AccountId {
    return this.treasuryAccountId;
  }

  getTreasuryPrivateKey(): PrivateKey {
    return this.treasuryPrivateKey;
  }

  getZeppexTokenId(): TokenId {
    if (!this.zeppexTokenId) {
      throw new Error(
        'Zeppex token ID not configured. Please set HEDERA_ZEPPEX_TOKEN_ID environment variable. ' +
          'Token deployment and configuration are separate processes. ' +
          'First deploy a token using the token service, then configure the token ID in your .env file.',
      );
    }
    return this.zeppexTokenId;
  }

  async getAccountBalance(accountId: AccountId): Promise<AccountBalance> {
    const query = new AccountBalanceQuery().setAccountId(accountId);
    return await query.execute(this.client);
  }

  async getTokenBalance(
    accountId: AccountId,
    tokenId: TokenId,
  ): Promise<number> {
    try {
      const balance = await this.getAccountBalance(accountId);
      const tokenBalance = balance.tokens.get(tokenId.toString());
      return tokenBalance ? Number(tokenBalance) : 0;
    } catch (error) {
      this.logger.error(
        `Failed to get token balance for account ${accountId}`,
        error,
      );
      return 0;
    }
  }
}
