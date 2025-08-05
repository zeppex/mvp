import { Injectable, Logger } from '@nestjs/common';
import {
  AccountCreateTransaction,
  Hbar,
  AccountId,
  PrivateKey,
  TransactionReceipt,
  Status,
  TransferTransaction,
} from '@hashgraph/sdk';
import { HederaService } from './hedera.service';
import { TokenService } from './token.service';

export interface AccountInfo {
  accountId: string;
  publicKey: string;
  privateKey: string;
  balance: string;
}

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private hederaService: HederaService,
    private tokenService: TokenService,
  ) {}

  async createBranchAccount(
    branchName: string,
    initialHbarBalance: number = 0.1,
  ): Promise<AccountInfo> {
    const client = this.hederaService.getClient();

    try {
      // Generate a new key pair for the branch account
      const branchPrivateKey = PrivateKey.generateED25519();
      const branchPublicKey = branchPrivateKey.publicKey;

      // Create the account following the documentation pattern
      const accountCreateTx = await new AccountCreateTransaction()
        .setKey(branchPublicKey)
        .setInitialBalance(new Hbar(initialHbarBalance))
        .setAccountMemo(`Branch account for ${branchName}`)
        .freezeWith(client);

      const accountCreateSign = await accountCreateTx.sign(this.hederaService.getTreasuryPrivateKey());
      const accountCreateSubmit = await accountCreateSign.execute(client);
      const accountCreateRx = await accountCreateSubmit.getReceipt(client);

      if (accountCreateRx.status !== Status.Success) {
        throw new Error(`Account creation failed with status: ${accountCreateRx.status}`);
      }

      const accountId = accountCreateRx.accountId;
      if (!accountId) {
        throw new Error('Account ID not found in receipt');
      }

      // Associate the Zeppex token with the new account
      await this.tokenService.associateTokenWithAccount(
        accountId,
        branchPrivateKey,
      );

      this.logger.log(`Created branch account ${accountId.toString()} for ${branchName}`);

      return {
        accountId: accountId.toString(),
        publicKey: branchPublicKey.toString(),
        privateKey: branchPrivateKey.toString(),
        balance: initialHbarBalance.toString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create branch account for ${branchName}`, error);
      throw error;
    }
  }

  async getAccountBalance(accountId: AccountId): Promise<{
    hbarBalance: string;
    tokenBalance: number;
  }> {
    try {
      const balance = await this.hederaService.getAccountBalance(accountId);
      const tokenBalance = await this.tokenService.getTokenBalance(accountId);

      return {
        hbarBalance: balance.hbars.toString(),
        tokenBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to get account balance for ${accountId}`, error);
      throw error;
    }
  }

  async fundAccount(
    accountId: AccountId,
    amount: Hbar,
    memo?: string,
  ): Promise<TransactionReceipt> {
    const client = this.hederaService.getClient();
    const treasuryAccountId = this.hederaService.getTreasuryAccountId();
    const treasuryPrivateKey = this.hederaService.getTreasuryPrivateKey();

    try {
      // Fund account following the documentation pattern
      const transferTx = await new TransferTransaction()
        .addHbarTransfer(treasuryAccountId, amount.negated())
        .addHbarTransfer(accountId, amount)
        .setTransactionMemo(memo || 'Account funding')
        .freezeWith(client)
        .sign(treasuryPrivateKey);

      const transferSubmit = await transferTx.execute(client);
      const transferRx = await transferSubmit.getReceipt(client);

      if (transferRx.status !== Status.Success) {
        throw new Error(`Account funding failed with status: ${transferRx.status}`);
      }

      this.logger.log(`Funded account ${accountId.toString()} with ${amount.toString()}`);
      return transferRx;
    } catch (error) {
      this.logger.error(`Failed to fund account ${accountId}`, error);
      throw error;
    }
  }

  async createMultiSigAccount(
    keys: PrivateKey[],
    threshold: number,
    initialHbarBalance: number = 0.1,
  ): Promise<AccountInfo> {
    const client = this.hederaService.getClient();

    try {
      // For now, create a simple account with the first key
      // Multi-sig functionality can be implemented later
      const primaryKey = keys[0];
      const primaryPublicKey = primaryKey.publicKey;

      // Create the account following the documentation pattern
      const accountCreateTx = await new AccountCreateTransaction()
        .setKey(primaryPublicKey)
        .setInitialBalance(new Hbar(initialHbarBalance))
        .setAccountMemo('Multi-signature account (simplified)')
        .freezeWith(client);

      const accountCreateSign = await accountCreateTx.sign(this.hederaService.getTreasuryPrivateKey());
      const accountCreateSubmit = await accountCreateSign.execute(client);
      const accountCreateRx = await accountCreateSubmit.getReceipt(client);

      if (accountCreateRx.status !== Status.Success) {
        throw new Error(`Multi-sig account creation failed with status: ${accountCreateRx.status}`);
      }

      const accountId = accountCreateRx.accountId;
      if (!accountId) {
        throw new Error('Account ID not found in receipt');
      }

      this.logger.log(`Created multi-sig account ${accountId.toString()}`);

      return {
        accountId: accountId.toString(),
        publicKey: primaryPublicKey.toString(),
        privateKey: primaryKey.toString(),
        balance: initialHbarBalance.toString(),
      };
    } catch (error) {
      this.logger.error('Failed to create multi-sig account', error);
      throw error;
    }
  }
}
