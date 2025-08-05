import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService, TokenInfo } from './token.service';
import { HederaService } from './hedera.service';

@Injectable()
export class TokenInitService implements OnModuleInit {
  private readonly logger = new Logger(TokenInitService.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly hederaService: HederaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldDeployToken = this.configService.get<boolean>(
      'DEPLOY_ZEPPEX_TOKEN',
      false,
    );

    if (!shouldDeployToken) {
      this.logger.log(
        'Skipping Zeppex token deployment (DEPLOY_ZEPPEX_TOKEN=false)',
      );
      return;
    }

    // Check if Hedera credentials are configured
    const accountId = this.configService.get<string>('HEDERA_ACCOUNT_ID');
    const privateKey = this.configService.get<string>('HEDERA_PRIVATE_KEY');

    if (!accountId || !privateKey) {
      this.logger.warn(
        'Hedera credentials not configured. Skipping token deployment.',
      );
      this.logger.warn(
        'Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY environment variables to enable token deployment.',
      );
      return;
    }

    try {
      this.logger.log('Deploying Zeppex token...');
      const tokenInfo = await this.tokenService.createZeppexToken();
      this.logger.log(
        `Zeppex token deployed successfully: ${tokenInfo.tokenId}`,
      );
      this.logger.log(`Token details: ${JSON.stringify(tokenInfo, null, 2)}`);
      this.logger.log(
        'IMPORTANT: Token deployment and configuration are separate processes.',
      );
      this.logger.log(
        `To configure this token for use, add HEDERA_ZEPPEX_TOKEN_ID=${tokenInfo.tokenId} to your .env file and restart the application.`,
      );
    } catch (error) {
      this.logger.error('Failed to deploy Zeppex token', error);
      this.logger.error(
        'You can manually deploy the token later or set DEPLOY_ZEPPEX_TOKEN=false to skip this step.',
      );
      // Don't throw error to prevent application startup failure
    }
  }

  async getTokenInfo(): Promise<TokenInfo | null> {
    try {
      const tokenId = this.hederaService.getZeppexTokenId();
      return {
        tokenId: tokenId.toString(),
        name: 'Zeppex Token',
        symbol: 'ZEPPEX',
        decimals: 6,
        totalSupply: '0',
        treasuryAccountId: this.hederaService.getTreasuryAccountId().toString(),
      };
    } catch (error) {
      this.logger.error('Failed to get token info', error);
      return null;
    }
  }
}
