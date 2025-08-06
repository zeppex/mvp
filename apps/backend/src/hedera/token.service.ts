import { Injectable, Logger } from '@nestjs/common';
import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenMintTransaction,
  TokenInfoQuery,
  TokenId,
  AccountId,
  PrivateKey,
  TransactionReceipt,
  Status,
} from '@hashgraph/sdk';
import { HederaService } from './hedera.service';

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  treasuryAccountId: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private hederaService: HederaService) {}

  async createZeppexToken(): Promise<TokenInfo> {
    const client = this.hederaService.getClient();
    const treasuryAccountId = this.hederaService.getTreasuryAccountId();
    const treasuryPrivateKey = this.hederaService.getTreasuryPrivateKey();

    try {
      this.logger.log('Deploying Zeppex token...');

      // Create token following the documentation pattern
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName('Zeppex Token')
        .setTokenSymbol('ZEPPEX')
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(6)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryAccountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(treasuryPrivateKey.publicKey) // Use treasury's public key as supply key
        .freezeWith(client);

      const tokenCreateSign = await tokenCreateTx.sign(treasuryPrivateKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

      if (tokenCreateRx.status !== Status.Success) {
        throw new Error(
          `Token creation failed with status: ${tokenCreateRx.status}`,
        );
      }

      const tokenId = tokenCreateRx.tokenId;
      if (!tokenId) {
        throw new Error('Token ID not found in receipt');
      }

      this.logger.log(
        `Zeppex token deployed successfully with ID: ${tokenId.toString()}`,
      );
      this.logger.log(
        `IMPORTANT: To use this token, add HEDERA_ZEPPEX_TOKEN_ID=${tokenId.toString()} to your .env file`,
      );

      return {
        tokenId: tokenId.toString(),
        name: 'Zeppex Token',
        symbol: 'ZEPPEX',
        decimals: 6,
        totalSupply: '0',
        treasuryAccountId: treasuryAccountId.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to deploy Zeppex token', error);
      throw error;
    }
  }

  async mintTokens(
    accountId: AccountId,
    amount: number,
    memo?: string,
  ): Promise<TransactionReceipt> {
    const client = this.hederaService.getClient();
    const tokenId = this.hederaService.getZeppexTokenId();
    const treasuryAccountId = this.hederaService.getTreasuryAccountId();
    const treasuryPrivateKey = this.hederaService.getTreasuryPrivateKey();

    try {
      // Mint new tokens to the treasury first, then transfer to the target account
      const tokenMintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .setTransactionMemo(memo || 'Zeppex token mint')
        .freezeWith(client)
        .sign(treasuryPrivateKey);

      const tokenMintSubmit = await tokenMintTx.execute(client);
      const tokenMintRx = await tokenMintSubmit.getReceipt(client);

      if (tokenMintRx.status !== Status.Success) {
        throw new Error(`Token mint failed with status: ${tokenMintRx.status}`);
      }

      // Now transfer the newly minted tokens to the target account
      const tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryAccountId, -amount)
        .addTokenTransfer(tokenId, accountId, amount)
        .setTransactionMemo(memo || 'Zeppex token transfer')
        .freezeWith(client)
        .sign(treasuryPrivateKey);

      const tokenTransferSubmit = await tokenTransferTx.execute(client);
      const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

      if (tokenTransferRx.status !== Status.Success) {
        throw new Error(
          `Token transfer failed with status: ${tokenTransferRx.status}`,
        );
      }

      this.logger.log(
        `Minted ${amount} ZEPPEX tokens to account ${accountId.toString()}`,
      );
      return tokenTransferRx;
    } catch (error) {
      this.logger.error(`Failed to mint tokens to account ${accountId}`, error);
      throw error;
    }
  }

  async burnTokens(
    accountId: AccountId,
    amount: number,
    memo?: string,
  ): Promise<TransactionReceipt> {
    const client = this.hederaService.getClient();
    const tokenId = this.hederaService.getZeppexTokenId();
    const treasuryAccountId = this.hederaService.getTreasuryAccountId();
    const treasuryPrivateKey = this.hederaService.getTreasuryPrivateKey();

    try {
      // Transfer tokens back to treasury (burning them) following documentation pattern
      const tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, accountId, -amount)
        .addTokenTransfer(tokenId, treasuryAccountId, amount)
        .setTransactionMemo(memo || 'Zeppex token burn')
        .freezeWith(client)
        .sign(treasuryPrivateKey);

      const tokenTransferSubmit = await tokenTransferTx.execute(client);
      const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

      if (tokenTransferRx.status !== Status.Success) {
        throw new Error(
          `Token burn failed with status: ${tokenTransferRx.status}`,
        );
      }

      this.logger.log(
        `Burned ${amount} ZEPPEX tokens from account ${accountId.toString()}`,
      );
      return tokenTransferRx;
    } catch (error) {
      this.logger.error(
        `Failed to burn tokens from account ${accountId}`,
        error,
      );
      throw error;
    }
  }

  async associateTokenWithAccount(
    accountId: AccountId,
    accountPrivateKey: PrivateKey,
  ): Promise<TransactionReceipt> {
    const client = this.hederaService.getClient();
    const tokenId = this.hederaService.getZeppexTokenId();

    try {
      // Associate token following the documentation pattern
      const associateAliceTx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(accountPrivateKey);

      const associateAliceTxSubmit = await associateAliceTx.execute(client);
      const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

      if (associateAliceRx.status !== Status.Success) {
        throw new Error(
          `Token association failed with status: ${associateAliceRx.status}`,
        );
      }

      this.logger.log(
        `Associated ZEPPEX token with account ${accountId.toString()}`,
      );
      return associateAliceRx;
    } catch (error) {
      this.logger.error(
        `Failed to associate token with account ${accountId}`,
        error,
      );
      throw error;
    }
  }

  async getTokenBalance(accountId: AccountId): Promise<number> {
    try {
      return await this.hederaService.getTokenBalance(
        accountId,
        this.hederaService.getZeppexTokenId(),
      );
    } catch (error) {
      this.logger.error(
        `Failed to get token balance for account ${accountId}`,
        error,
      );
      return 0;
    }
  }

  async getTokenInfo(): Promise<TokenInfo | null> {
    try {
      const client = this.hederaService.getClient();
      const tokenId = this.hederaService.getZeppexTokenId();
      const treasuryAccountId = this.hederaService.getTreasuryAccountId();

      // Query token info from the network
      const tokenInfoQuery = new TokenInfoQuery().setTokenId(tokenId);

      const tokenInfo = await tokenInfoQuery.execute(client);

      // Convert total supply to human-readable format
      const totalSupplyRaw = tokenInfo.totalSupply?.toString() || '0';
      const totalSupplyHuman = (
        parseFloat(totalSupplyRaw) / Math.pow(10, tokenInfo.decimals || 6)
      ).toString();

      return {
        tokenId: tokenId.toString(),
        name: tokenInfo.name || 'Zeppex Token',
        symbol: tokenInfo.symbol || 'ZEPPEX',
        decimals: tokenInfo.decimals || 6,
        totalSupply: totalSupplyHuman,
        treasuryAccountId: treasuryAccountId.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to get token info', error);
      return null;
    }
  }
}
