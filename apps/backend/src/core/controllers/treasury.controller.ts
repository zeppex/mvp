import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BranchService } from '../services/branch.service';
import { MerchantGuard } from '../../auth/guards/merchant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { TokenService } from '../../hedera/token.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { IsNumber, IsOptional, IsString, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MintTokensDto {
  @ApiProperty({
    example: 1000,
    description: 'Amount of tokens to mint',
    minimum: 1,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiProperty({
    example: 'Test token minting',
    description: 'Optional memo for the transaction',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Memo must be a string' })
  @Length(1, 100, { message: 'Memo must be between 1 and 100 characters' })
  memo?: string;
}

export class BalanceSummaryResponse {
  totalZeppexTokenBalance: string;
  totalHbarBalance: string;
  branchBalances: Array<{
    branchId: string;
    branchName: string;
    zeppexTokenBalance: string;
    hbarBalance: string;
    lastBalanceUpdate: Date;
  }>;
}

@ApiTags('Treasury')
@Controller('treasury')
@UseGuards(JwtAuthGuard, MerchantGuard, RolesGuard)
export class TreasuryController {
  constructor(
    private readonly branchService: BranchService,
    private readonly tokenService: TokenService,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  @Post('create-token')
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create Zeppex token manually',
    description:
      'Creates the Zeppex token on Hedera network. Requires SUPERADMIN role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Token created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Zeppex token created successfully',
        },
        tokenInfo: {
          type: 'object',
          properties: {
            tokenId: { type: 'string', example: '0.0.123456' },
            name: { type: 'string', example: 'Zeppex Token' },
            symbol: { type: 'string', example: 'ZEPPEX' },
            decimals: { type: 'number', example: 6 },
            totalSupply: { type: 'string', example: '0' },
            treasuryAccountId: { type: 'string', example: '0.0.123456' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions (requires SUPERADMIN role)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Token creation failed',
  })
  async createToken() {
    try {
      const tokenInfo = await this.tokenService.createZeppexToken();
      return {
        message: 'Zeppex token created successfully',
        tokenInfo,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create token: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('token-info')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Zeppex token information' })
  @ApiResponse({
    status: 200,
    description: 'Token information retrieved successfully',
  })
  async getTokenInfo() {
    try {
      const tokenInfo = await this.tokenService.getTokenInfo();
      return tokenInfo;
    } catch (error) {
      throw new HttpException(
        `Failed to get token info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('balance-summary')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get merchant balance summary' })
  @ApiResponse({
    status: 200,
    description: 'Balance summary retrieved successfully',
    type: BalanceSummaryResponse,
  })
  async getBalanceSummary(@Request() req): Promise<BalanceSummaryResponse> {
    const merchantId = req.user.merchant?.id;
    if (!merchantId) {
      throw new HttpException(
        'Merchant ID not found in request',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.branchService.getMerchantBalanceSummary(merchantId);
  }

  @Get('branches/:branchId/balance')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get branch balance' })
  @ApiResponse({
    status: 200,
    description: 'Branch balance retrieved successfully',
  })
  async getBranchBalance(@Param('branchId') branchId: string, @Request() req) {
    const merchantId = req.user.merchant?.id;
    if (!merchantId) {
      throw new HttpException(
        'Merchant ID not found in request',
        HttpStatus.BAD_REQUEST,
      );
    }

    const branch = await this.branchService.findOne(branchId, merchantId);
    const updatedBranch =
      await this.branchService.updateBranchBalance(branchId);

    return {
      branchId: updatedBranch.id,
      branchName: updatedBranch.name,
      zeppexTokenBalance: updatedBranch.zeppexTokenBalance,
      hbarBalance: updatedBranch.hbarBalance,
      lastBalanceUpdate: updatedBranch.lastBalanceUpdate,
    };
  }

  @Post('branches/:branchId/mint-tokens')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mint tokens to branch' })
  @ApiResponse({
    status: 200,
    description: 'Tokens minted successfully',
  })
  async mintTokensToBranch(
    @Param('branchId') branchId: string,
    @Body() mintTokensDto: MintTokensDto,
    @Request() req,
  ) {
    let merchantId = req.user.merchant?.id;

    // For superadmin, we need to get the merchant ID from the branch
    if (!merchantId && req.user.role === UserRole.SUPERADMIN) {
      const branch = await this.branchService.findOne(branchId);
      console.log('🔍 Debug - Branch found:', {
        id: branch.id,
        name: branch.name,
        merchant: branch.merchant,
        merchantId: branch.merchant?.id,
      });

      // Try to get merchant ID from the branch's merchantId column directly
      if (!branch.merchant) {
        // Query the database directly to get the merchant ID
        const branchWithMerchant = await this.branchService.findOne(branchId);

        // If the branch service's findOne method still doesn't load the merchant,
        // try a direct database query
        if (!branchWithMerchant.merchant) {
          const branchData = await this.branchRepository
            .createQueryBuilder('branch')
            .select('branch.id, branch.name')
            .addSelect('merchant.id', 'merchantId')
            .leftJoin('branch.merchant', 'merchant')
            .where('branch.id = :branchId', { branchId })
            .getRawOne();

          console.log('🔍 Debug - Raw query result:', branchData);

          if (branchData?.merchantId) {
            merchantId = branchData.merchantId;
            console.log(
              '🔍 Debug - Found merchant ID via raw query:',
              merchantId,
            );
          } else {
            throw new HttpException(
              'Branch merchant information not found',
              HttpStatus.BAD_REQUEST,
            );
          }
        } else {
          merchantId = branchWithMerchant.merchant.id;
        }
      } else {
        merchantId = branch.merchant.id;
      }
    }

    if (!merchantId) {
      throw new HttpException(
        'Merchant ID not found in request',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify the branch belongs to the merchant
    await this.branchService.findOne(branchId, merchantId);

    await this.branchService.mintTokensToBranch(
      branchId,
      mintTokensDto.amount,
      mintTokensDto.memo,
    );

    return {
      message: `Successfully minted ${mintTokensDto.amount} ZEPPEX tokens to branch ${branchId}`,
      amount: mintTokensDto.amount,
      branchId,
    };
  }

  @Post('refresh-balances')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refresh all branch balances' })
  @ApiResponse({
    status: 200,
    description: 'Balances refreshed successfully',
  })
  async refreshAllBalances(@Request() req) {
    const merchantId = req.user.merchant?.id;
    if (!merchantId) {
      throw new HttpException(
        'Merchant ID not found in request',
        HttpStatus.BAD_REQUEST,
      );
    }

    const branches = await this.branchService.findAll(merchantId);
    const updatedBranches = [];

    for (const branch of branches) {
      try {
        const updatedBranch = await this.branchService.updateBranchBalance(
          branch.id,
        );
        updatedBranches.push({
          branchId: updatedBranch.id,
          branchName: updatedBranch.name,
          zeppexTokenBalance: updatedBranch.zeppexTokenBalance,
          hbarBalance: updatedBranch.hbarBalance,
          lastBalanceUpdate: updatedBranch.lastBalanceUpdate,
        });
      } catch (error) {
        console.error(
          `Failed to update balance for branch ${branch.id}:`,
          error,
        );
      }
    }

    return {
      message: `Refreshed balances for ${updatedBranches.length} branches`,
      updatedBranches,
    };
  }
}
